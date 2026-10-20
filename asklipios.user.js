// ==UserScript==
// @name         Asklipios Modular
// @namespace    https://github.com/VectorPerkins1/Asklipios-Userscript
// @version      0.15.8
// @description  Modular tools for the Asklipios hospital system
// @match        *://care.ghl.medical:51021/*
// @match        *://10.136.33.126:51021/*
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/00-namespace.js?v=0.15.8
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/10-lab-data.js?v=0.15.8
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/12-lab-catalog.js?v=0.15.8
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/15-local-data-store.js?v=0.15.8
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/20-medical-card-data.js?v=0.15.8
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/30-xray-data.js?v=0.15.8
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/35-data-registry.js?v=0.15.8
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/22-clinical-catalog.js?v=0.15.8
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/90-legacy-app.js?v=0.15.8
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/55-daily-overview.js?v=0.15.8
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/45-settings-ui.js?v=0.15.8
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/46-clinical-settings-ui.js?v=0.15.8
// @run-at       document-idle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// Copyright ©   Papageorgoulis 2026
// ==/UserScript==

(function () {
    'use strict';

    console.log('Asklipios Modular loader 0.15.8 loaded');
    console.log('Loaded modules:', window.Asklipios?.modules);
})();


/* Embedded 0.15.8 admission/laboratory patch.
 * Kept in the loader deliberately so Tampermonkey does not depend on a new
 * remote @require file being present before the loader is updated.
 */
/*
 * Asklipios — Laboratory / Admission package fixes
 * Version 0.15.8
 *
 * 1) Vial control follows the currently selected laboratory package.
 *    If the package can be represented exactly by the existing vial columns,
 *    those columns are preselected. Otherwise the package is exposed as its
 *    own dynamic column, so user-created packages are never silently lost.
 * 2) Admission package creates one print hub containing blood referrals
 *    (all laboratory_report.php forms created for the batch), crossmatch,
 *    medical instructions and x-ray referrals.
 * 3) Medical-instructions printing is discovered at runtime instead of relying
 *    only on the old hard-coded doctors_orders_odipy.php endpoint.
 */

(function () {
    'use strict';

    if (window !== window.top) return;

    const A = window.Asklipios;
    if (!A?.data?.PACKAGES || !A?.data?.EXTRA_EXAMS || !A?.data?.XRAY_EXAMS) {
        console.warn('Asklipios 0.15.8 lab/admission fixes: required data are missing.');
        return;
    }

    const PACKAGES = A.data.PACKAGES;
    const EXTRA_EXAMS = A.data.EXTRA_EXAMS;
    const XRAY_EXAMS = A.data.XRAY_EXAMS;

    function getNursingFrame() {
        for (let i = 0; i < window.frames.length; i++) {
            try {
                if (window.frames[i].location.href.includes('nursing-station.php')) {
                    return window.frames[i];
                }
            } catch (_) {}
        }
        return null;
    }

    function nursingDocument() {
        return getNursingFrame()?.document || null;
    }

    function cleanText(value) {
        if (value == null) return '';
        if (typeof value === 'string') return value.replace(/\s+/g, ' ').trim();
        return String(value.innerText || value.textContent || '').replace(/\s+/g, ' ').trim();
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function selectedDoctor() {
        return nursingDocument()?.getElementById('lab-doctor')?.value || '';
    }

    function selectedPackageName() {
        return nursingDocument()?.getElementById('lab-package')?.value || '';
    }

    function selectedDateTime() {
        const doc = nursingDocument();
        if (!doc) return new Date().toISOString().slice(0, 19).replace('T', ' ');

        const date = doc.getElementById('lab-date')?.value;
        const hour = doc.getElementById('lab-hour')?.textContent || '00';
        const minute = doc.getElementById('lab-minute')?.textContent || '00';
        const second = doc.getElementById('lab-second')?.textContent || '00';

        if (!date) return new Date().toISOString().slice(0, 19).replace('T', ' ');
        return `${date} ${hour}:${minute}:${second}`;
    }

    function selectedDateForXray() {
        const date = selectedDateTime().split(' ')[0];
        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
    }

    function dateParts() {
        const date = selectedDateTime().split(' ')[0];
        const [year, month, day] = date.split('-');
        return {
            pday: day,
            pmonth: month,
            pyear: year,
            s_date: `${year}-${month}-${day}`,
            s_date2: `${day}/${month}/${year}`
        };
    }

    function selectedPatientsFull() {
        const doc = nursingDocument();
        if (!doc) return [];

        return [...doc.querySelectorAll('.lab-check:checked')].map(cb => {
            const label = cleanText(cb.closest('label')) || cb.value;
            const match = label.match(/(?:^|\s)(\d{2,3})\s*\/\s*(\d{1,2})(?:\s|\-|$)/);

            return {
                encounterNr: String(cb.value),
                label,
                room: match?.[1] || '',
                bed: match?.[2] || ''
            };
        });
    }

    function examKey(exam) {
        return [
            exam?.lab ?? '',
            exam?.dep ?? '',
            exam?.test ?? '',
            exam?.hisCode ?? ''
        ].join('|');
    }

    // Matching packages to existing vial columns should tolerate a changed HIS
    // code when Care still returns the same laboratory / department / test id.
    function examMatchKey(exam) {
        const lab = exam?.lab ?? '';
        const dep = exam?.dep ?? '';
        const test = exam?.test ?? '';
        if (lab !== '' || dep !== '' || test !== '') {
            return `${lab}|${dep}|${test}`;
        }
        return `his:${exam?.hisCode ?? ''}`;
    }

    function uniqueLabExams(exams) {
        const seen = new Set();
        return (Array.isArray(exams) ? exams : []).filter(exam => {
            const key = examKey(exam);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    function getExamGroups() {
        const full = PACKAGES['FULL ΠΑΚΕΤΟ'] || [];
        const fullNoCoag = PACKAGES['FULL ΠΑΚΕΤΟ ΧΩΡΙΣ ΠΗΞΗ'] || full;
        const generalPackage = PACKAGES['ΓΕΝΙΚΗ ΑΙΜΑΤΟΣ'] || full;

        const isGeneral = exam => Number(exam?.lab) === 5 && Number(exam?.dep) === 1;
        const isCoag = exam => Number(exam?.lab) === 5 && Number(exam?.dep) === 3;
        const isBiochem = exam => Number(exam?.lab) === 1;

        return {
            general: uniqueLabExams(
                generalPackage.filter(isGeneral).length
                    ? generalPackage.filter(isGeneral)
                    : full.filter(isGeneral)
            ),
            biochem: uniqueLabExams(fullNoCoag.filter(isBiochem)),
            coag: uniqueLabExams(full.filter(isCoag)),
            crp: uniqueLabExams(EXTRA_EXAMS.crp || []),
            tke: uniqueLabExams(EXTRA_EXAMS.tke || []),
            thyroid: uniqueLabExams(EXTRA_EXAMS.thyroid || [])
        };
    }

    const STANDARD_VIAL_COLUMNS = [
        { key: 'general', label: 'Γεν.', className: 'vial-general' },
        { key: 'biochem', label: 'Βιοχ.', className: 'vial-biochem' },
        { key: 'coag', label: 'Πήξη', className: 'vial-coag' },
        { key: 'crp', label: 'CRP', className: 'vial-crp' },
        { key: 'tke', label: 'ΤΚΕ', className: 'vial-tke' },
        { key: 'thyroid', label: 'Θυρ.', className: 'vial-thyroid' }
    ];

    function sameSet(a, b) {
        if (a.size !== b.size) return false;
        for (const value of a) {
            if (!b.has(value)) return false;
        }
        return true;
    }

    function exactStandardCover(packageExams, groups) {
        const target = new Set(uniqueLabExams(packageExams).map(examMatchKey));
        if (!target.size) return [];

        const candidates = STANDARD_VIAL_COLUMNS
            .map(col => ({
                ...col,
                exams: uniqueLabExams(groups[col.key] || []),
                set: new Set(uniqueLabExams(groups[col.key] || []).map(examMatchKey))
            }))
            .filter(col => col.set.size > 0);

        let best = null;
        const maxMask = 1 << candidates.length;

        for (let mask = 1; mask < maxMask; mask++) {
            const union = new Set();
            const chosen = [];
            let invalid = false;

            for (let i = 0; i < candidates.length; i++) {
                if (!(mask & (1 << i))) continue;
                const candidate = candidates[i];
                chosen.push(candidate.key);

                for (const key of candidate.set) {
                    if (!target.has(key)) {
                        invalid = true;
                        break;
                    }
                    union.add(key);
                }
                if (invalid) break;
            }

            if (invalid || !sameSet(union, target)) continue;

            if (!best || chosen.length < best.length) {
                best = chosen;
            }
        }

        return best || null;
    }

    function vialsLog(message) {
        const box = nursingDocument()?.getElementById('vials-log');
        if (!box) return;
        box.insertAdjacentHTML('beforeend', `<div>${escapeHtml(message)}</div>`);
        box.scrollTop = box.scrollHeight;
    }

    function admissionLog(message) {
        const box = nursingDocument()?.getElementById('admission-log');
        if (!box) return;
        box.insertAdjacentHTML('beforeend', `<div>${escapeHtml(message)}</div>`);
        box.scrollTop = box.scrollHeight;
    }

    function openVialsPanelDynamic() {
        const doc = nursingDocument();
        if (!doc) return;

        const patients = selectedPatientsFull();
        const packageName = selectedPackageName();
        const packageExams = uniqueLabExams(PACKAGES[packageName] || []);
        const groups = getExamGroups();
        const cover = exactStandardCover(packageExams, groups);
        const needsDynamicPackageColumn = packageExams.length > 0 && !cover;

        if (!patients.length) {
            alert('Δεν έχεις επιλέξει ασθενείς.');
            return;
        }

        doc.querySelectorAll('#lab-vials-panel').forEach(p => p.remove());

        const panel = doc.createElement('div');
        panel.id = 'lab-vials-panel';
        Object.assign(panel.style, {
            position: 'fixed', top: '0px', left: '20px', zIndex: '999999999',
            background: 'white', border: '2px solid #333', padding: '10px',
            width: needsDynamicPackageColumn ? '900px' : '800px',
            fontFamily: 'Arial', fontSize: '13px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        });

        const standardHeaders = STANDARD_VIAL_COLUMNS.map(col =>
            `<th style="width:60px;text-align:center;">${escapeHtml(col.label)}</th>`
        ).join('');

        const dynamicHeader = needsDynamicPackageColumn
            ? `<th style="width:140px;text-align:center;" title="${escapeHtml(packageName)}">${escapeHtml(packageName)}</th>`
            : '';

        const infoText = packageExams.length === 0
            ? 'Το επιλεγμένο πακέτο δεν περιέχει εξετάσεις.'
            : cover
                ? `Το πακέτο αναγνωρίστηκε από τα υπάρχοντα πεδία: ${cover.map(k => STANDARD_VIAL_COLUMNS.find(c => c.key === k)?.label || k).join(' + ')}`
                : 'Το πακέτο δεν αναπαρίσταται ακριβώς από τα υπάρχοντα πεδία και προστέθηκε ως ξεχωριστή επιλογή.';

        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                <b>Έλεγχος φιαλιδίων</b>
                <button id="vials-close">Κλείσιμο</button>
            </div>
            <div style="margin-top:6px;font-size:12px;">
                Πακέτο βάσης: <b>${escapeHtml(packageName || '—')}</b><br>
                <span style="color:#555;">${escapeHtml(infoText)}</span>
            </div>
            <div style="overflow:auto;margin-top:8px;">
                <table style="width:100%;table-layout:fixed;border-collapse:collapse;">
                    <thead><tr>
                        <th style="text-align:left;">Ασθενής</th>
                        ${standardHeaders}
                        ${dynamicHeader}
                        <th style="width:80px;text-align:center;">Διαστ.</th>
                    </tr></thead>
                    <tbody>
                        ${patients.map(p => `
                            <tr data-encounter="${escapeHtml(p.encounterNr)}" data-room="${escapeHtml(p.room)}" data-bed="${escapeHtml(p.bed)}">
                                <td style="padding:4px;border-bottom:1px solid #ddd;">${escapeHtml(p.label)}</td>
                                ${STANDARD_VIAL_COLUMNS.map(col => `
                                    <td style="text-align:center;border-bottom:1px solid #ddd;">
                                        <input type="checkbox" class="${col.className}" ${cover?.includes(col.key) ? 'checked' : ''}>
                                    </td>
                                `).join('')}
                                ${needsDynamicPackageColumn ? `
                                    <td style="text-align:center;border-bottom:1px solid #ddd;">
                                        <input type="checkbox" class="vial-dynamic-package" data-package="${escapeHtml(packageName)}" checked>
                                    </td>
                                ` : ''}
                                <td style="text-align:center;border-bottom:1px solid #ddd;">
                                    <input type="checkbox" class="vial-crossmatch">
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <button id="vials-send" style="width:100%;margin-top:10px;background:#f4cccc;">
                Αποστολή τικαρισμένων εντολών
            </button>
            <div id="vials-log" style="margin-top:8px;max-height:130px;overflow:auto;border-top:1px solid #aaa;padding-top:5px;"></div>
        `;

        doc.body.appendChild(panel);
        doc.getElementById('vials-close').onclick = () => panel.remove();
        doc.getElementById('vials-send').onclick = sendVialsOrdersDynamic;
    }

    async function sendLabOrderCustom(encounterNr, selectedExams) {
        const payload = {
            encounterNr: Number(encounterNr),
            laboratoryMode: 0,
            compCode: '1',
            compId: '1',
            pathoLabIds: [],
            sendExamsByCategory: false,
            doctorSign: selectedDoctor(),
            userId: '50',
            sendDate: selectedDateTime(),
            orderComments: '',
            selectedExams: uniqueLabExams(selectedExams)
        };

        const res = await fetch(window.location.origin + '/laboratory-exams/order', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status} στην αποστολή εργαστηριακών`);
        }

        return await res.json();
    }

    function buildPatientLabUrl(encounterNr, room, bed) {
        const d = dateParts();
        const params = new URLSearchParams({
            lang: 'gr',
            rm: room || '',
            bd: bed || '',
            pn: encounterNr,
            pyear: d.pyear,
            pmonth: d.pmonth,
            pday: d.pday,
            tb: '99ccff',
            tt: '330066',
            bb: 'ffffff',
            d: '1',
            station: 'ΟΡΘΟΠΑΙΔΙΚΗ',
            dept_nr: '81',
            ward_nr: '57'
        });

        return window.location.origin + '/modules/nursing/nursing-station-patient-laboratory.php?' + params.toString();
    }

    async function fetchLabDocument(encounterNr, room, bed, predicate = null, tries = 12) {
        const baseUrl = buildPatientLabUrl(encounterNr, room, bed);
        let latest = null;

        for (let i = 0; i < tries; i++) {
            const url = new URL(baseUrl);
            // Force a fresh server response on every poll. The referral forms are
            // generated asynchronously after /laboratory-exams/order returns.
            url.searchParams.set('_asklipios_ts', String(Date.now()));

            const res = await fetch(url.href, {
                credentials: 'include',
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status} κατά την ανάκτηση της σελίδας εργαστηριακών`);
            }

            const html = await res.text();
            latest = new DOMParser().parseFromString(html, 'text/html');

            if (!predicate || predicate(latest)) return latest;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return latest;
    }

    async function fetchLabArtifactsForBatch(patient, batchNr, options = {}) {
        const requireABO = !!options.requireABO;
        const tries = Number(options.tries || 15);
        let lastDoc = null;
        let referrals = [];
        let abo = null;

        lastDoc = await fetchLabDocument(
            patient.encounterNr,
            patient.room,
            patient.bed,
            doc => {
                referrals = extractLabReferralSpecs(doc, batchNr);
                abo = extractABOSpec(doc, batchNr);

                // This mirrors the ABO logic: first send the order, then repeatedly
                // fetch the patient's laboratory page until the forms generated for
                // the new batch become visible. A batch may yield 1, 2, 3+ referral
                // forms (different lisorid values), so we keep every distinct form.
                return referrals.length > 0 && (!requireABO || !!abo);
            },
            tries
        );

        // Re-extract from the final document so the returned data always correspond
        // to the last server response, including the timeout case.
        referrals = extractLabReferralSpecs(lastDoc, batchNr);
        abo = extractABOSpec(lastDoc, batchNr);

        return {
            document: lastDoc,
            referrals,
            abo
        };
    }

    function formMatchesBatch(form, batchNr) {
        return [...form.querySelectorAll('input[name="batch_nr"]')]
            .some(input => String(input.value) === String(batchNr));
    }

    function serializeForm(form) {
        const action = new URL(
            form.getAttribute('action') || window.location.href,
            window.location.origin + '/modules/nursing/'
        ).href;

        const fields = [];
        form.querySelectorAll('input,select,textarea').forEach(input => {
            if (!input.name || input.disabled) return;
            if ((input.type === 'checkbox' || input.type === 'radio') && !input.checked) return;
            if (input.type === 'submit' || input.type === 'image' || input.type === 'button') return;
            fields.push([input.name, input.value]);
        });

        return {
            kind: 'form',
            method: (form.getAttribute('method') || 'GET').toUpperCase(),
            action,
            fields
        };
    }

    function extractLabReferralSpecs(doc, batchNr) {
        if (!doc) return [];

        const specs = [];
        const seen = new Set();

        [...doc.querySelectorAll('form')].forEach(form => {
            const action = (form.getAttribute('action') || '').toLowerCase();
            if (!action.includes('laboratory_report.php') && !action.includes('laboratory_report2.php')) return;
            if (!formMatchesBatch(form, batchNr)) return;

            const spec = serializeForm(form);
            const lisorid = form.querySelector('input[name="lisorid"]')?.value || '';
            const row = form.closest('tr');
            const labText = row?.cells?.[2] ? cleanText(row.cells[2]) : '';
            const unique = `${spec.action}|${batchNr}|${lisorid}`;
            if (seen.has(unique)) return;
            seen.add(unique);

            specs.push({
                ...spec,
                titleSuffix: labText || (lisorid ? `LIS ${lisorid}` : '')
            });
        });

        return specs;
    }

    function extractABOSpec(doc, batchNr) {
        if (!doc) return null;

        const form = [...doc.querySelectorAll('form')].find(candidate => {
            const action = (candidate.getAttribute('action') || '').toLowerCase();
            return action.includes('report_define_blood.php') &&
                formMatchesBatch(candidate, batchNr) &&
                candidate.querySelector('input[name="mode"][value="print_result"]');
        });

        return form ? serializeForm(form) : null;
    }

    function createPrintHub() {
        const w = window.open('about:blank', '_blank');
        if (!w) return null;

        w.document.open();
        w.document.write(`
            <!doctype html>
            <html><head><meta charset="utf-8"><title>Εκτυπώσεις Πακέτου Εισαγωγής</title>
            <style>
                body{font-family:Arial,sans-serif;padding:20px;font-size:15px;background:#fafafa;color:#222}
                h2{margin:0 0 6px}.subtitle{color:#666;margin-bottom:16px}
                .patient{margin:18px 0 8px;font-weight:bold;border-bottom:1px solid #bbb;padding-bottom:4px}
                a,.print-btn{display:block;width:100%;box-sizing:border-box;text-align:left;margin:7px 0;padding:10px 12px;border:1px solid #bbb;border-radius:4px;text-decoration:none;color:#003366;background:#fff;cursor:pointer;font:inherit}
                a:hover,.print-btn:hover{background:#eaf2fb}
                .pending{color:#777;font-style:italic;margin:7px 0}
                .warn{color:#9a4d00;background:#fff4df;border:1px solid #e6c17a;padding:8px;border-radius:4px;margin:7px 0}
            </style></head><body>
                <h2>Εκτυπώσεις Πακέτου Εισαγωγής</h2>
                <div class="subtitle">Εδώ συγκεντρώνονται όλα τα έντυπα που δημιουργήθηκαν.</div>
                <div id="prints-list"></div>
            </body></html>
        `);
        w.document.close();
        return w;
    }

    function ensurePatientSection(printHub, encounterNr, label) {
        if (!printHub || printHub.closed) return null;
        const doc = printHub.document;
        const id = `patient-${String(encounterNr).replace(/[^a-z0-9_-]/gi, '-')}`;
        let section = doc.getElementById(id);
        if (section) return section;

        section = doc.createElement('div');
        section.id = id;
        section.innerHTML = `<div class="patient">${escapeHtml(label)}</div>`;
        doc.getElementById('prints-list')?.appendChild(section);
        return section;
    }

    function submitPrintForm(spec, targetDoc = null) {
        const doc = targetDoc || nursingDocument() || document;
        const form = doc.createElement('form');
        form.method = spec.method || 'POST';
        form.action = spec.action;
        form.target = '_blank';
        form.style.display = 'none';

        (spec.fields || []).forEach(([name, value]) => {
            const input = doc.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = value;
            form.appendChild(input);
        });

        doc.body.appendChild(form);
        form.submit();
        form.remove();
    }

    function buildPostBridgeUrl(printHub, spec) {
        if (!printHub || printHub.closed || !spec?.action) return '';

        const fields = (spec.fields || []).map(([name, value]) =>
            `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}">`
        ).join('');

        const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Άνοιγμα εκτύπωσης…</title></head>
<body style="font-family:Arial,sans-serif;padding:18px">
<form id="asklipios-print-bridge" method="${escapeHtml(spec.method || 'POST')}" action="${escapeHtml(spec.action)}">
${fields}
</form>
<div>Άνοιγμα εγγράφου…</div>
<script>
window.addEventListener('DOMContentLoaded', function () {
    document.getElementById('asklipios-print-bridge').submit();
});
<\/script>
<noscript><button type="submit" form="asklipios-print-bridge">Άνοιγμα εγγράφου</button></noscript>
</body></html>`;

        const blob = new printHub.Blob([html], { type: 'text/html;charset=utf-8' });
        const url = printHub.URL.createObjectURL(blob);
        printHub.__asklipiosBridgeUrls = printHub.__asklipiosBridgeUrls || [];
        printHub.__asklipiosBridgeUrls.push(url);
        return url;
    }

    function addPrintSpec(printHub, encounterNr, patientLabel, title, spec) {
        const section = ensurePatientSection(printHub, encounterNr, patientLabel);
        if (!section || !spec) return;

        const a = printHub.document.createElement('a');
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = title;

        if (spec.kind === 'url') {
            a.href = spec.url;
            section.appendChild(a);
            return;
        }

        // Form-backed Care documents (lab referrals, ABO, some medical instructions)
        // require POST. A button works only with normal left-click and cannot be
        // middle-clicked into a background tab. The href below points to a tiny
        // Blob bridge page which auto-submits the original POST form. Therefore
        // middle-click / Ctrl+click / "Open link in new tab" work exactly like a
        // normal link, while an ordinary left-click preserves the direct form submit.
        const bridgeUrl = buildPostBridgeUrl(printHub, spec);
        a.href = bridgeUrl || '#';
        a.className = 'print-btn';
        a.addEventListener('click', event => {
            const modified = event.ctrlKey || event.metaKey || event.shiftKey || event.altKey;
            if (event.button === 0 && !modified) {
                event.preventDefault();
                submitPrintForm(spec, printHub.document);
            }
        });
        section.appendChild(a);
    }

    function addHubWarning(printHub, encounterNr, patientLabel, text) {
        const section = ensurePatientSection(printHub, encounterNr, patientLabel);
        if (!section) return;
        const div = printHub.document.createElement('div');
        div.className = 'warn';
        div.textContent = text;
        section.appendChild(div);
    }

    async function sendVialsOrdersDynamic() {
        const doc = nursingDocument();
        if (!doc) return;

        if (!selectedDoctor()) {
            alert('Επιλέξτε Ιατρό.');
            return;
        }

        const groups = getExamGroups();
        const rows = [...doc.querySelectorAll('#lab-vials-panel tr[data-encounter]')];

        if (!rows.length) {
            alert('Δεν υπάρχουν ασθενείς στον έλεγχο.');
            return;
        }

        if (!confirm('Να σταλούν οι τικαρισμένες εντολές από τον έλεγχο φιαλιδίων;')) return;

        const crossmatchCount = rows.filter(row => row.querySelector('.vial-crossmatch')?.checked).length;
        const crossmatchHub = crossmatchCount > 1 ? createPrintHub() : null;
        let singleCrossmatchWindow = null;

        if (crossmatchCount === 1) {
            singleCrossmatchWindow = window.open('about:blank', `asklipios-abo-${Date.now()}`);
            if (singleCrossmatchWindow) {
                singleCrossmatchWindow.document.title = 'ΑΒΟ / Διασταύρωση';
                singleCrossmatchWindow.document.body.innerHTML = '<p style="font-family:Arial;padding:16px">Προετοιμασία εντύπου διασταύρωσης…</p>';
            }
        }

        for (const row of rows) {
            const encounterNr = row.dataset.encounter;
            const label = cleanText(row.querySelector('td')) || encounterNr;
            let exams = [];

            STANDARD_VIAL_COLUMNS.forEach(col => {
                if (row.querySelector(`.${col.className}`)?.checked) {
                    exams = exams.concat(groups[col.key] || []);
                }
            });

            const dynamic = row.querySelector('.vial-dynamic-package:checked');
            if (dynamic) {
                exams = exams.concat(PACKAGES[dynamic.dataset.package] || []);
            }

            exams = uniqueLabExams(exams);

            if (!exams.length) {
                if (row.querySelector('.vial-crossmatch')?.checked && singleCrossmatchWindow && !singleCrossmatchWindow.closed) {
                    singleCrossmatchWindow.close();
                }
                vialsLog(`⚠️ ${label} → καμία εργαστηριακή εντολή`);
                continue;
            }

            vialsLog(`⏳ ${label}`);

            try {
                const result = await sendLabOrderCustom(encounterNr, exams);
                if (!result.success) throw new Error('Αποτυχία αποστολής εργαστηριακών');
                vialsLog(`✅ ${label} → batch ${result.batch_nr}`);

                if (row.querySelector('.vial-crossmatch')?.checked) {
                    const labDoc = await fetchLabDocument(
                        encounterNr,
                        row.dataset.room,
                        row.dataset.bed,
                        d => !!extractABOSpec(d, result.batch_nr)
                    );
                    const abo = extractABOSpec(labDoc, result.batch_nr);

                    if (!abo) {
                        if (singleCrossmatchWindow && !singleCrossmatchWindow.closed) singleCrossmatchWindow.close();
                        vialsLog(`⚠️ ${label} → δεν βρέθηκε έντυπο Διασταύρωσης`);
                    } else if (crossmatchHub) {
                        addPrintSpec(crossmatchHub, encounterNr, label, `ΑΒΟ / Διασταύρωση - ${label}`, abo);
                        vialsLog(`🖨️ ${label} → προστέθηκε Διασταύρωση στις Εκτυπώσεις`);
                    } else if (singleCrossmatchWindow && !singleCrossmatchWindow.closed) {
                        const targetName = singleCrossmatchWindow.name || `asklipios-abo-${Date.now()}`;
                        singleCrossmatchWindow.name = targetName;
                        const nursingDoc = nursingDocument() || document;
                        const form = nursingDoc.createElement('form');
                        form.method = abo.method || 'POST';
                        form.action = abo.action;
                        form.target = targetName;
                        (abo.fields || []).forEach(([name, value]) => {
                            const input = nursingDoc.createElement('input');
                            input.type = 'hidden'; input.name = name; input.value = value; form.appendChild(input);
                        });
                        nursingDoc.body.appendChild(form); form.submit(); form.remove();
                    } else {
                        submitPrintForm(abo);
                    }
                }
            } catch (error) {
                if (singleCrossmatchWindow && !singleCrossmatchWindow.closed) singleCrossmatchWindow.close();
                vialsLog(`❌ ${label} → ${error.message}`);
            }

            await new Promise(resolve => setTimeout(resolve, 600));
        }

        vialsLog('🏁 Ολοκληρώθηκε.');
    }

    function openAdmissionPanelFixed() {
        const doc = nursingDocument();
        if (!doc) return;

        const patients = selectedPatientsFull();
        if (!patients.length) {
            alert('Δεν έχεις επιλέξει ασθενείς.');
            return;
        }

        doc.querySelectorAll('#lab-admission-panel').forEach(p => p.remove());

        const panel = doc.createElement('div');
        panel.id = 'lab-admission-panel';
        Object.assign(panel.style, {
            position: 'fixed', top: '0px', left: '20px', zIndex: '999999999',
            background: 'white', border: '2px solid #333', padding: '10px',
            width: '820px', fontFamily: 'Arial', fontSize: '13px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        });

        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <b>Πακέτο εισαγωγής</b>
                <button id="admission-close">Κλείσιμο</button>
            </div>
            <table style="width:100%;table-layout:auto;border-collapse:collapse;margin-top:8px;">
                <thead><tr>
                    <th style="text-align:left;white-space:nowrap;">Ασθενής</th>
                    <th style="width:65px;text-align:center;">Πεντάδα</th>
                    <th style="width:85px;text-align:center;">Θυρ.</th>
                    <th style="width:60px;text-align:center;">Γόν.</th>
                    <th style="width:80px;text-align:center;">Λ-Ι</th>
                    <th style="width:60px;text-align:center;">Ώμος</th>
                </tr></thead>
                <tbody>
                    ${patients.map(p => `
                        <tr data-encounter="${escapeHtml(p.encounterNr)}" data-room="${escapeHtml(p.room)}" data-bed="${escapeHtml(p.bed)}">
                            <td style="padding:4px;border-bottom:1px solid #ddd;white-space:nowrap;">${escapeHtml(p.label)}</td>
                            <td style="text-align:center;border-bottom:1px solid #ddd;"><input type="checkbox" class="adm-pentada" checked></td>
                            <td style="text-align:center;border-bottom:1px solid #ddd;"><input type="checkbox" class="adm-thyroid"></td>
                            <td style="text-align:center;border-bottom:1px solid #ddd;"><input type="checkbox" class="adm-xray-knee"></td>
                            <td style="text-align:center;border-bottom:1px solid #ddd;"><input type="checkbox" class="adm-xray-pelvis"></td>
                            <td style="text-align:center;border-bottom:1px solid #ddd;"><input type="checkbox" class="adm-xray-shoulder"></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <button id="admission-send" style="width:100%;margin-top:10px;background:#f4cccc;">Αποστολή πακέτου εισαγωγής</button>
            <div style="margin-top:6px;font-size:11px;color:#666;">Η καρτέλα Εκτυπώσεων θα συγκεντρώσει Διασταύρωση, Ιατρικές Οδηγίες, ακτινογραφίες και όλα τα παραπεμπτικά αίματος του batch.</div>
            <div id="admission-log" style="margin-top:8px;max-height:150px;overflow:auto;border-top:1px solid #aaa;padding-top:5px;"></div>
        `;

        doc.body.appendChild(panel);
        doc.getElementById('admission-close').onclick = () => panel.remove();
        doc.getElementById('admission-send').onclick = sendAdmissionOrdersFixed;
    }

    function extractXrayBatchFromHtml(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const span = doc.querySelector('.batch_nr');
        if (span && cleanText(span)) return cleanText(span);

        const href = [...doc.querySelectorAll('a')]
            .map(a => a.getAttribute('href') || '')
            .find(value => value.includes('batch_nr='));
        return href?.match(/batch_nr=([0-9]+)/)?.[1] || null;
    }

    async function sendXrayOrder(encounterNr, type) {
        const x = XRAY_EXAMS[type];
        if (!x) throw new Error(`Δεν υπάρχει payload ακτινογραφίας: ${type}`);

        const body = new URLSearchParams();
        body.set('report_dept_nr', '112');
        body.set('notes_id', '');
        body.set('notes_hidden', '');
        body.set('exams_id', x.exams_id);
        body.set('drg_medact_ids', '');
        body.set('cancel_reason', '');
        body.set('diagnosis_quiry', x.diagnosis_quiry);
        body.set('send_date', selectedDateForXray());
        body.set('send_doctor', selectedDoctor());
        body.set('sid', ''); body.set('lang', 'gr'); body.set('station', 'ΟΡΘΟΠΑΙΔΙΚΗ');
        body.set('dept', ''); body.set('dept_nr', '81'); body.set('pn', String(encounterNr));
        body.set('batch_nr', 'Νέο Αίτημα'); body.set('edit', ''); body.set('target', 'generic');
        body.set('subtarget', ''); body.set('tracker', ''); body.set('noresize', '');
        body.set('user_origin', ''); body.set('pyear', ''); body.set('pmonth', ''); body.set('pday', '');
        body.set('status', 'pending'); body.set('mode', 'save'); body.set('formtitle', '');
        body.set('detail_id', ''); body.set('ward_nr', '57');
        body.set('lab_exams_json', JSON.stringify(x.lab_exams_json));
        body.set('cs_doc_id', '3895');

        const res = await fetch(window.location.origin + '/modules/nursing/nursing-station-patientdaten-doconsil-generic-2.php', {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            body: body.toString()
        });
        const html = await res.text();
        const batchNr = extractXrayBatchFromHtml(html);
        return { success: !!batchNr, batch_nr: batchNr };
    }

    function buildXrayPrintUrl(encounterNr, batchNr) {
        return window.location.origin +
            '/modules/pdfmaker/nursing/diagnostics_report_pr_sender.php?pn=' + encodeURIComponent(encounterNr) +
            '&batch_nr=' + encodeURIComponent(batchNr);
    }

    function normalizeSearchText(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    function extractUrlFromJavascript(code) {
        if (!code) return null;
        const matches = String(code).match(/['"]([^'"]+)['"]/g) || [];
        for (const raw of matches) {
            const value = raw.slice(1, -1);
            if (/pdfmaker|doctor|order|odig|instruction/i.test(value)) {
                try { return new URL(value, window.location.origin + '/modules/nursing/').href; }
                catch (_) {}
            }
        }
        return null;
    }

    function medicalInstructionCandidateFromDocument(doc) {
        if (!doc) return null;
        const candidates = [];

        [...doc.querySelectorAll('a,form,button,input')].forEach(el => {
            const href = el.getAttribute?.('href') || '';
            const action = el.getAttribute?.('action') || '';
            const onclick = el.getAttribute?.('onclick') || '';
            const descriptor = normalizeSearchText([
                cleanText(el), el.getAttribute?.('title'), el.getAttribute?.('value'),
                href, action, onclick, cleanText(el.parentElement)
            ].filter(Boolean).join(' '));

            const medicalWords = /ιατρ|οδηγ|doctor|order|odig|odipy|entol|instruction/.test(descriptor);
            if (!medicalWords) return;

            const endpointText = normalizeSearchText([href, action, onclick].join(' '));
            const printish = /pdfmaker|doctor.*order|order.*doctor|odig|odipy|medical.*instruction/.test(endpointText);
            if (!printish) return;

            let spec = null;
            if (el.tagName === 'FORM' && action) {
                spec = serializeForm(el);
            } else {
                let url = null;
                if (href && !href.toLowerCase().startsWith('javascript:')) {
                    try { url = new URL(href, window.location.origin).href; } catch (_) {}
                }
                if (!url) url = extractUrlFromJavascript(href) || extractUrlFromJavascript(onclick);
                if (url) spec = { kind: 'url', url };
            }

            if (!spec) return;

            let score = 0;
            if (/pdfmaker/.test(endpointText)) score += 6;
            if (/doctor.*order|order.*doctor|odipy/.test(endpointText)) score += 5;
            if (/ιατρ.*οδηγ|οδηγ.*ιατρ/.test(descriptor)) score += 4;
            if (/instruction/.test(descriptor)) score += 2;
            if (/εξοδο|discharge/.test(descriptor)) score -= 8;

            candidates.push({ score, spec });
        });

        candidates.sort((a, b) => b.score - a.score);
        return candidates[0]?.spec || null;
    }

    async function fetchInformationalDocument(encounterNr) {
        const params = new URLSearchParams({
            lang: 'gr', pn: String(encounterNr), ward_nr: '57', station: 'ΟΡΘΟΠΑΙΔΙΚΗ'
        });
        try {
            const res = await fetch(window.location.origin + '/modules/nursing/nursing-station-patient-informational.php?' + params.toString(), {
                credentials: 'include'
            });
            return new DOMParser().parseFromString(await res.text(), 'text/html');
        } catch (_) {
            return null;
        }
    }

    async function probeMedicalInstructionsFallback(encounterNr) {
        const encoded = encodeURIComponent(encounterNr);
        const paths = [
            `/modules/pdfmaker/nursing/doctors_orders_odipy.php?encounter_nr=${encoded}`,
            `/modules/pdfmaker/nursing/doctors_orders_odipy2.php?encounter_nr=${encoded}`,
            `/modules/pdfmaker/nursing/doctors_orders_odipy_new.php?encounter_nr=${encoded}`,
            `/modules/pdfmaker/nursing/doctors_orders.php?encounter_nr=${encoded}`,
            `/modules/pdfmaker/nursing/doctor_orders.php?encounter_nr=${encoded}`,
            `/modules/pdfmaker/nursing/medical_orders.php?encounter_nr=${encoded}`,
            `/modules/pdfmaker/nursing/medical_instructions.php?encounter_nr=${encoded}`
        ];

        for (const path of paths) {
            const url = window.location.origin + path;
            try {
                const res = await fetch(url, { credentials: 'include' });
                if (!res.ok) continue;
                const contentType = (res.headers.get('content-type') || '').toLowerCase();
                if (contentType.includes('application/pdf')) return { kind: 'url', url };

                const text = await res.text();
                const sample = normalizeSearchText(text.slice(0, 5000));
                if (text.length > 200 && !/404|not found|δεν βρεθ|fatal error|warning:/.test(sample)) {
                    return { kind: 'url', url };
                }
            } catch (_) {}
        }

        return null;
    }

    async function resolveMedicalInstructionsSpec(encounterNr, labDoc = null) {
        const live = medicalInstructionCandidateFromDocument(nursingDocument());
        if (live) return live;

        const fromLab = medicalInstructionCandidateFromDocument(labDoc);
        if (fromLab) return fromLab;

        const infoDoc = await fetchInformationalDocument(encounterNr);
        const fromInfo = medicalInstructionCandidateFromDocument(infoDoc);
        if (fromInfo) return fromInfo;

        return await probeMedicalInstructionsFallback(encounterNr);
    }

    async function sendAdmissionOrdersFixed() {
        const doc = nursingDocument();
        if (!doc) return;

        if (!selectedDoctor()) {
            alert('Επιλέξτε Ιατρό.');
            return;
        }

        const rows = [...doc.querySelectorAll('#lab-admission-panel tr[data-encounter]')];
        if (!rows.length) {
            alert('Δεν υπάρχουν ασθενείς στο πακέτο εισαγωγής.');
            return;
        }

        if (!confirm('Να σταλεί το Πακέτο εισαγωγής στους τικαρισμένους ασθενείς;')) return;

        // Must open synchronously from the click handler to avoid popup blockers.
        const printHub = createPrintHub();
        if (!printHub) {
            alert('Ο browser μπλόκαρε την καρτέλα Εκτυπώσεων. Επίτρεψε pop-ups για το Care και ξαναδοκίμασε.');
            return;
        }

        for (const row of rows) {
            const encounterNr = row.dataset.encounter;
            const label = cleanText(row.querySelector('td')) || encounterNr;
            const patient = {
                encounterNr,
                label,
                room: row.dataset.room || '',
                bed: row.dataset.bed || ''
            };

            ensurePatientSection(printHub, encounterNr, label);

            const pentada = row.querySelector('.adm-pentada')?.checked;
            const thyroid = row.querySelector('.adm-thyroid')?.checked;
            const xraySelections = [
                ['knee', 'Γόνατο', row.querySelector('.adm-xray-knee')?.checked],
                ['pelvis', 'Λ-Ι', row.querySelector('.adm-xray-pelvis')?.checked],
                ['shoulder', 'Ώμος', row.querySelector('.adm-xray-shoulder')?.checked]
            ].filter(([, , checked]) => checked);

            let exams = [];
            if (pentada) exams = exams.concat(PACKAGES['FULL ΠΑΚΕΤΟ'] || []);
            if (thyroid) exams = exams.concat(EXTRA_EXAMS.thyroid || []);
            exams = uniqueLabExams(exams);

            let labDoc = null;
            let batchNr = null;

            if (exams.length) {
                admissionLog(`⏳ ${label} → αποστολή αιματολογικών`);
                try {
                    const result = await sendLabOrderCustom(encounterNr, exams);
                    if (!result.success) throw new Error('Αποτυχία αποστολής αιματολογικών');
                    batchNr = result.batch_nr;
                    admissionLog(`✅ ${label} → εργαστηριακό batch ${batchNr}`);

                    // The Care server creates the printable forms only AFTER the
                    // laboratory order has been accepted. Fetch/poll the patient's
                    // laboratory page exactly like the existing ABO workflow and
                    // collect every laboratory_report form belonging to this batch.
                    const artifacts = await fetchLabArtifactsForBatch(patient, batchNr, {
                        requireABO: pentada,
                        tries: 15
                    });
                    labDoc = artifacts.document;

                    const referrals = artifacts.referrals;
                    console.debug('[Asklipios 0.15.8] lab referrals', {
                        encounterNr,
                        batchNr,
                        count: referrals.length,
                        forms: referrals.map(spec => ({
                            action: spec.action,
                            method: spec.method,
                            lisorid: (spec.fields || []).find(([name]) => name === 'lisorid')?.[1] || ''
                        }))
                    });
                    if (referrals.length) {
                        referrals.forEach((spec, index) => {
                            const suffix = spec.titleSuffix ? ` — ${spec.titleSuffix}` : '';
                            addPrintSpec(
                                printHub,
                                encounterNr,
                                label,
                                `Παραπεμπτικό εξετάσεων αίματος ${index + 1}/${referrals.length}${suffix}`,
                                spec
                            );
                        });
                        admissionLog(`🖨️ ${label} → προστέθηκαν ${referrals.length} παραπεμπτικά αίματος`);
                    } else {
                        addHubWarning(printHub, encounterNr, label, 'Δεν εντοπίστηκαν ακόμη τα παραπεμπτικά αίματος για το νέο batch.');
                        admissionLog(`⚠️ ${label} → δεν βρέθηκαν παραπεμπτικά αίματος για batch ${batchNr}`);
                    }

                    if (pentada) {
                        const abo = artifacts.abo;
                        if (abo) {
                            addPrintSpec(printHub, encounterNr, label, 'ΑΒΟ / Διασταύρωση', abo);
                            admissionLog(`🖨️ ${label} → προστέθηκε Διασταύρωση`);
                        } else {
                            addHubWarning(printHub, encounterNr, label, 'Δεν εντοπίστηκε το έντυπο ΑΒΟ / Διασταύρωσης.');
                            admissionLog(`⚠️ ${label} → δεν βρέθηκε Διασταύρωση`);
                        }
                    }
                } catch (error) {
                    admissionLog(`❌ ${label} → αιματολογικά: ${error.message}`);
                    addHubWarning(printHub, encounterNr, label, `Αιματολογικά: ${error.message}`);
                }
            }

            // Medical instructions are independent of whether blood tests were selected.
            try {
                const medSpec = await resolveMedicalInstructionsSpec(encounterNr, labDoc);
                if (medSpec) {
                    addPrintSpec(printHub, encounterNr, label, 'Ιατρικές Οδηγίες', medSpec);
                    admissionLog(`🖨️ ${label} → προστέθηκαν Ιατρικές Οδηγίες`);
                } else {
                    addHubWarning(printHub, encounterNr, label, 'Δεν εντοπίστηκε η νέα εκτύπωση «Ιατρικές Οδηγίες».');
                    admissionLog(`⚠️ ${label} → δεν εντοπίστηκε endpoint Ιατρικών Οδηγιών`);
                }
            } catch (error) {
                addHubWarning(printHub, encounterNr, label, `Ιατρικές Οδηγίες: ${error.message}`);
                admissionLog(`⚠️ ${label} → Ιατρικές Οδηγίες: ${error.message}`);
            }

            for (const [type, xrayLabel] of xraySelections) {
                admissionLog(`🩻 ${label} → αποστολή ακτινογραφίας ${xrayLabel}`);
                try {
                    const xray = await sendXrayOrder(encounterNr, type);
                    if (!xray.success) throw new Error('δεν βρέθηκε batch');
                    addPrintSpec(
                        printHub,
                        encounterNr,
                        label,
                        `Ακτινογραφία ${xrayLabel}`,
                        { kind: 'url', url: buildXrayPrintUrl(encounterNr, xray.batch_nr) }
                    );
                    admissionLog(`✅ ${label} → ακτινογραφία ${xrayLabel} batch ${xray.batch_nr}`);
                } catch (error) {
                    addHubWarning(printHub, encounterNr, label, `Ακτινογραφία ${xrayLabel}: ${error.message}`);
                    admissionLog(`❌ ${label} → ακτινογραφία ${xrayLabel}: ${error.message}`);
                }
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        admissionLog('🏁 Ολοκληρώθηκε πακέτο εισαγωγής.');
    }

    function hookButtons() {
        const doc = nursingDocument();
        if (!doc) return;

        const vials = doc.getElementById('lab-vials-check');
        if (vials && vials.dataset.asklipios0158 !== '1') {
            vials.dataset.asklipios0158 = '1';
            vials.onclick = openVialsPanelDynamic;
        }

        const admission = doc.getElementById('lab-admission-package');
        if (admission && admission.dataset.asklipios0158 !== '1') {
            admission.dataset.asklipios0158 = '1';
            admission.onclick = openAdmissionPanelFixed;
        }
    }

    const timer = setInterval(hookButtons, 700);
    hookButtons();

    A.modules = A.modules || {};
    A.modules.labAdmissionFixes = {
        loaded: true,
        version: '0.15.8',
        stop() { clearInterval(timer); }
    };

    console.log('Asklipios 0.15.8 laboratory/admission fixes loaded');
})();

