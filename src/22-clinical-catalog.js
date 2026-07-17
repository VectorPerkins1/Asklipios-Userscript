/*
 * Asklipios — Live Clinical Catalog
 * Version 0.12.0
 *
 * Searches the official Care ICD-10 and medical-act endpoints using the
 * active authenticated session. No patient information is persisted.
 */

(function () {
    'use strict';

    if (window !== window.top) return;

    const A = window.Asklipios;

    if (!A) {
        throw new Error(
            'Asklipios namespace is missing. Load 00-namespace.js first.'
        );
    }

    A.modules = A.modules || {};

    const ENDPOINTS = {
        diagnosis: '/drg/icd10-grm/get-many-by-search-params',
        medicalAct: '/drg/etip/get-many-by-search-params'
    };

    const contextCache = new Map();

    function clone(value) {
        if (typeof structuredClone === 'function') {
            return structuredClone(value);
        }

        return JSON.parse(JSON.stringify(value));
    }

    function getNursingFrame() {
        for (let index = 0; index < window.frames.length; index++) {
            try {
                if (
                    window.frames[index].location.href.includes(
                        'nursing-station.php'
                    )
                ) {
                    return window.frames[index];
                }
            } catch {
                // Ignore cross-origin frames.
            }
        }

        return null;
    }

    function getNursingDocument() {
        return getNursingFrame()?.document || null;
    }

    function getWardNumber() {
        const doc = getNursingDocument();

        const hidden = doc?.querySelector(
            'input[name="ward_nr"], #ward_nr'
        )?.value;

        if (hidden) return String(hidden);

        const sources = [
            getNursingFrame()?.location?.href,
            window.location.href
        ].filter(Boolean);

        for (const source of sources) {
            try {
                const value = new URL(source).searchParams.get('ward_nr');
                if (value) return value;
            } catch {
                // Ignore malformed URLs.
            }
        }

        return '57';
    }

    function getStationName() {
        const doc = getNursingDocument();

        return String(
            doc?.querySelector('input[name="station"]')?.value ||
            'Ορθοπαιδική'
        );
    }

    function findIpdiIdInDocument(doc) {
        if (!doc) return '';

        const hidden = doc.querySelector(
            'input[name="ipdiId"], #ipdiId'
        )?.value;

        if (hidden) return String(hidden);

        const nodes = doc.querySelectorAll(
            '[href*="ipdiId="], [onclick*="ipdiId="]'
        );

        for (const node of nodes) {
            const source =
                node.getAttribute('href') ||
                node.getAttribute('onclick') ||
                '';

            const match = source.match(/ipdiId=(\d+)/i);
            if (match) return match[1];
        }

        return '';
    }

    function getSelectedEncounterNumber() {
        const runtimePatients =
            A.runtime?.getSelectedPatientsFull?.() || [];

        if (Array.isArray(runtimePatients) && runtimePatients[0]?.encounterNr) {
            return String(runtimePatients[0].encounterNr);
        }

        const doc = getNursingDocument();
        const checked = doc?.querySelector('.lab-check:checked');

        return checked?.value ? String(checked.value) : '';
    }

    async function resolvePatientContext(encounterNr) {
        const encounter = String(encounterNr || '').trim();

        if (!encounter) {
            throw new Error(
                'Επίλεξε τουλάχιστον έναν ασθενή στο helper για την αναζήτηση ICD-10.'
            );
        }

        if (contextCache.has(encounter)) {
            return clone(contextCache.get(encounter));
        }

        const url = new URL(
            '/modules/nursing/nursing-station-patient-informational.php',
            window.location.origin
        );

        url.searchParams.set('lang', 'gr');
        url.searchParams.set('pn', encounter);
        url.searchParams.set('ward_nr', getWardNumber());
        url.searchParams.set('station', getStationName());

        const response = await fetch(url.href, {
            method: 'GET',
            credentials: 'same-origin',
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(
                `Δεν φορτώθηκαν τα στοιχεία ασθενή (HTTP ${response.status}).`
            );
        }

        const html = await response.text();

        const pnurMatch =
            html.match(/pnur_id=(\d+)/i) ||
            html.match(/name=["']pnurId["'][^>]*value=["'](\d+)/i);

        const ipdiMatch =
            html.match(/ipdiId=(\d+)/i) ||
            html.match(/name=["']ipdiId["'][^>]*value=["'](\d+)/i);

        if (!ipdiMatch) {
            throw new Error(
                'Δεν βρέθηκε το ipdiId που απαιτείται για την αναζήτηση ICD-10.'
            );
        }

        const context = {
            encounterNr: encounter,
            pnurId: pnurMatch?.[1] || '',
            ipdiId: ipdiMatch[1],
            wardNr: getWardNumber()
        };

        contextCache.set(encounter, context);
        return clone(context);
    }

    function splitQuery(query) {
        const value = String(query || '').trim();
        const looksLikeCode = /^[A-Za-zΑ-Ωα-ω]?\d[\d.\-]*$/u.test(value);

        return looksLikeCode
            ? { code: value, name: '' }
            : { code: '', name: value };
    }

    function normalizeDiagnosis(item) {
        return {
            ...clone(item),
            id: Number(item?.id || 0),
            code: String(item?.code || item?.displayCode || '').trim(),
            displayCode: String(
                item?.displayCode || item?.code || ''
            ).trim(),
            name: String(item?.name || '').trim(),
            default: item?.default === true,
            course: String(item?.course || ''),
            therapy: String(item?.therapy || '')
        };
    }

    function normalizeMedicalAct(item) {
        return {
            ...clone(item),
            id: Number(item?.id || 0),
            code: String(item?.code || item?.displayCode || '').trim(),
            displayCode: String(
                item?.displayCode || item?.code || ''
            ).trim(),
            name: String(item?.name || '').trim(),
            requireLr: item?.requireLr === true,
            default: item?.default === true,
            dependency: item?.dependency ?? null
        };
    }

    async function postJson(endpoint, payload, signal) {
        const response = await fetch(
            new URL(endpoint, window.location.origin).href,
            {
                method: 'POST',
                credentials: 'same-origin',
                cache: 'no-store',
                signal,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            throw new Error(
                `Η αναζήτηση απέτυχε (HTTP ${response.status}).`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error(
                'Ο Ασκληπιός επέστρεψε μη αναμενόμενη μορφή αποτελεσμάτων.'
            );
        }

        return data;
    }

    async function searchDiagnoses(query, { signal } = {}) {
        const value = String(query || '').trim();
        if (value.length < 2) return [];

        const encounterNr = getSelectedEncounterNumber();
        let ipdiId = findIpdiIdInDocument(getNursingDocument());

        if (!ipdiId) {
            const context = await resolvePatientContext(encounterNr);
            ipdiId = context.ipdiId;
        }

        const terms = splitQuery(value);
        const data = await postJson(
            ENDPOINTS.diagnosis,
            {
                code: terms.code,
                name: terms.name,
                gender: 9,
                preselected: 0,
                wardNr: getWardNumber(),
                ipdiId: Number(ipdiId)
            },
            signal
        );

        return data
            .map(normalizeDiagnosis)
            .filter(item => item.id && item.code && item.name);
    }

    async function searchMedicalActs(query, { signal } = {}) {
        const value = String(query || '').trim();
        if (value.length < 2) return [];

        const terms = splitQuery(value);
        const data = await postJson(
            ENDPOINTS.medicalAct,
            {
                code: terms.code,
                name: terms.name,
                gender: 9,
                preselected: 0,
                wardNr: getWardNumber()
            },
            signal
        );

        return data
            .map(normalizeMedicalAct)
            .filter(item => item.id && item.code && item.name);
    }

    A.clinicalCatalog = {
        endpoints: clone(ENDPOINTS),
        getWardNumber,
        getSelectedEncounterNumber,
        resolvePatientContext,
        searchDiagnoses,
        searchMedicalActs,
        clearContextCache() {
            contextCache.clear();
        }
    };

    A.modules.clinicalCatalog = {
        loaded: true,
        version: '0.11.0'
    };

    console.log('Asklipios live clinical catalog module loaded');
})();
