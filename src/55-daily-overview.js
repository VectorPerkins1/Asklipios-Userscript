/*
 * Asklipios — Daily Ward Overview
 * Version 0.13.1
 *
 * All-patient ward board with live Care data, persistent per-patient notes,
 * automatic 48-hour cleanup after a patient disappears from the ward plan,
 * and compact portrait-A4 printing.
 */

(function () {
    'use strict';

    if (window !== window.top) return;

    const A = window.Asklipios;
    if (!A?.runtime) {
        throw new Error('Asklipios runtime is missing. Load 90-legacy-app.js first.');
    }

    A.modules = A.modules || {};

    const VERSION = '0.13.1';
    const OVERLAY_ID = 'asklipios-daily-overview';
    const STYLE_ID = 'asklipios-daily-overview-style';
    const STORAGE_KEY = 'asklipios.daily-overview.patient-data.v3';
    const PREVIOUS_STORAGE_KEY = 'asklipios.daily-overview.patient-data.v2';
    const LEGACY_STORAGE_PREFIX = 'asklipios.daily-overview.v1';
    const MISSING_PATIENT_TTL_MS = 48 * 60 * 60 * 1000;
    const REFRESH_DELAY_MS = 110;

    const LAB_TARGETS = [
        { key: 'Hgb', aliases: ['HGB', 'HB', 'ΑΙΜΟΣΦΑΙΡΙΝΗ'] },
        { key: 'PLTs', aliases: ['PLT', 'PLTS', 'PLATELETS', 'ΑΙΜΟΠΕΤΑΛΙΑ'] },
        { key: 'Ur', aliases: ['UREA', 'ΟΥΡΙΑ'] },
        { key: 'Cr', aliases: ['CREATININE', 'CREAT', 'ΚΡΕΑΤΙΝΙΝΗ'] },
        { key: 'Na', aliases: ['NA', 'SODIUM', 'ΝΑΤΡΙΟ'] },
        { key: 'K', aliases: ['K', 'POTASSIUM', 'ΚΑΛΙΟ'] },
        { key: 'SGOT', aliases: ['SGOT', 'AST'] },
        { key: 'SGPT', aliases: ['SGPT', 'ALT'] }
    ];

    const COMORBIDITY_OPTIONS = [
        'Αρτηριακή Υπέρταση',
        'Σακχαρώδης Διαβήτης',
        'Κολπική Μαρμαρυγή',
        'Στεφανιαία Νόσος',
        'Καρδιακή Ανεπάρκεια',
        'Χρόνια Νεφρική Νόσος',
        'ΧΑΠ',
        'Βρογχικό Άσθμα',
        'ΑΕΕ',
        'Άνοια',
        'Νόσος Parkinson',
        'Υποθυρεοειδισμός',
        'Νεοπλασία',
        'Οστεοπόρωση'
    ];

    const TRANSFUSION_TYPES = ['ΜΣΕ', 'FFP', 'PLTs'];

    const PENDING_OPTIONS = [
        'Εργαστηριακός έλεγχος',
        'Επανέλεγχος Hb',
        'Έλεγχος INR',
        'Ακτινογραφικός έλεγχος',
        'Αναισθησιολογική εκτίμηση',
        'Καρδιολογική εκτίμηση',
        'Φυσικοθεραπεία',
        'Κινητοποίηση',
        'Αφαίρεση παροχέτευσης',
        'Αφαίρεση ραμμάτων',
        'Συγκατάθεση ασθενούς',
        'Ενημέρωση συγγενών',
        'Ρύθμιση αντιπηκτικής αγωγής',
        'Προεγχειρητικός έλεγχος'
    ];

    function clone(value) {
        if (typeof structuredClone === 'function') return structuredClone(value);
        return JSON.parse(JSON.stringify(value));
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function normalizeText(value) {
        return String(value ?? '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLocaleUpperCase('el-GR');
    }

    function getFrame() {
        return A.runtime.getNursingFrame?.() || null;
    }

    function getDocument() {
        return getFrame()?.document || null;
    }

    function getWardNumber() {
        return String(A.runtime.getWardNumber?.() || '57');
    }

    function nowIso() {
        return new Date().toISOString();
    }

    function todayIso() {
        const now = new Date();
        return [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0')
        ].join('-');
    }

    function dateAtNoon(value) {
        if (!value) return null;
        const normalized = normalizeDate(value);
        if (!normalized) return null;
        const date = new Date(`${normalized}T12:00:00`);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    function formatGreekDate(value) {
        const normalized = normalizeDate(value);
        if (!normalized) return String(value || '');
        const [year, month, day] = normalized.split('-');
        return `${day}/${month}/${year}`;
    }

    function weekday(value) {
        const date = dateAtNoon(value);
        if (!date) return '';
        return date.toLocaleDateString('el-GR', { weekday: 'long' });
    }

    function hospitalizationDay(value) {
        const admission = dateAtNoon(value);
        const today = dateAtNoon(todayIso());
        if (!admission || !today) return '';
        const days = Math.max(1, Math.floor((today - admission) / 86400000) + 1);
        return `${days}η ημέρα νοσηλείας`;
    }

    function postoperativeLabel(value) {
        const surgery = dateAtNoon(value);
        const today = dateAtNoon(todayIso());
        if (!surgery || !today) return '';
        const days = Math.floor((today - surgery) / 86400000);
        if (days < 0) return '';
        if (days === 0) return 'Ημέρα χειρουργείου';
        return `${days}η ΜΤΧ`;
    }

    function normalizeDate(value) {
        const text = String(value || '').trim();
        let match = text.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/);
        if (match) {
            return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
        }
        match = text.match(/(\d{4})-(\d{2})-(\d{2})/);
        return match ? match[0] : '';
    }

    function readStorage() {
        try {
            let raw;
            if (typeof GM_getValue === 'function') {
                raw = GM_getValue(STORAGE_KEY, null);
                if (!raw) raw = GM_getValue(PREVIOUS_STORAGE_KEY, null);
            } else {
                raw = window.localStorage.getItem(STORAGE_KEY)
                    || window.localStorage.getItem(PREVIOUS_STORAGE_KEY);
            }
            if (!raw) return null;
            return typeof raw === 'string' ? JSON.parse(raw) : raw;
        } catch (error) {
            console.warn('Daily overview storage read failed:', error);
            return null;
        }
    }

    function writeStorage(value) {
        try {
            if (typeof GM_setValue === 'function') {
                GM_setValue(STORAGE_KEY, value);
            } else {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
            }
        } catch (error) {
            console.warn('Daily overview storage save failed:', error);
        }
    }

    function createState() {
        return {
            schemaVersion: 3,
            updatedAt: null,
            patients: {},
            dailyNotes: {}
        };
    }

    function normalizePending(items) {
        return Array.isArray(items)
            ? items
                .map(item => ({
                    text: String(item?.text || '').trim(),
                    done: item?.done === true
                }))
                .filter(item => item.text)
            : [];
    }

    function normalizeTransfusions(items) {
        return Array.isArray(items)
            ? items
                .map(item => ({
                    date: normalizeDate(item?.date),
                    type: TRANSFUSION_TYPES.includes(item?.type) ? item.type : ''
                }))
                .filter(item => item.date || item.type)
            : [];
    }

    function normalizeComorbidities(value) {
        const source = Array.isArray(value)
            ? value
            : String(value || '').split(/[,;]+/);
        return [...new Set(source.map(item => String(item).trim()).filter(Boolean))];
    }

    function normalizeLabs(value) {
        if (!value) return {};
        if (typeof value === 'object' && !Array.isArray(value)) {
            const result = {};
            LAB_TARGETS.forEach(target => {
                if (value[target.key] !== undefined && value[target.key] !== null) {
                    result[target.key] = String(value[target.key]).trim();
                }
            });
            return result;
        }
        return {};
    }

    function normalizePatientData(value = {}) {
        return {
            encounterNr: String(value.encounterNr || ''),
            room: String(value.room || ''),
            bed: String(value.bed || ''),
            name: String(value.name || ''),
            age: String(value.age || ''),
            admissionDate: normalizeDate(value.admissionDate),
            incident: String(value.incident || ''),
            doctor: String(value.doctor || ''),
            labs: normalizeLabs(value.labs),
            surgeryDate: normalizeDate(value.surgeryDate),
            anticoagulationKey: String(value.anticoagulationKey || ''),
            anticoagulationTiming: ['Πρωί', 'Βράδυ'].includes(value.anticoagulationTiming)
                ? value.anticoagulationTiming
                : '',
            anticoagulationStoppedDate: normalizeDate(value.anticoagulationStoppedDate),
            comorbidities: normalizeComorbidities(value.comorbidities),
            transfusions: normalizeTransfusions(value.transfusions),
            pending: normalizePending(value.pending),
            lastSeenAt: String(value.lastSeenAt || ''),
            fetchedAt: String(value.fetchedAt || '')
        };
    }

    function normalizeState(raw) {
        const result = createState();
        if (!raw || typeof raw !== 'object') return result;
        const dropLegacyLabs = Number(raw.schemaVersion || 0) < 3;
        Object.entries(raw.patients || {}).forEach(([key, value]) => {
            const patient = normalizePatientData({
                ...value,
                labs: dropLegacyLabs ? {} : value?.labs
            });
            patient.encounterNr = patient.encounterNr || String(key);
            result.patients[String(key)] = patient;
        });
        if (raw.dailyNotes && typeof raw.dailyNotes === 'object') {
            result.dailyNotes = Object.fromEntries(
                Object.entries(raw.dailyNotes).map(([key, value]) => [key, String(value || '')])
            );
        }
        result.updatedAt = String(raw.updatedAt || '');
        return result;
    }

    function legacyStorageKey() {
        return `${LEGACY_STORAGE_PREFIX}.${getWardNumber()}.${todayIso()}`;
    }

    function migrateLegacySessionState(target) {
        try {
            const raw = sessionStorage.getItem(legacyStorageKey());
            if (!raw) return target;
            const legacy = JSON.parse(raw);
            Object.entries(legacy?.patients || {}).forEach(([key, old]) => {
                if (target.patients[key]) return;
                target.patients[key] = normalizePatientData({
                    ...old,
                    comorbidities: old.comorbidities,
                    labs: {},
                    lastSeenAt: nowIso()
                });
            });
            if (legacy?.notes && !target.dailyNotes[todayIso()]) {
                target.dailyNotes[todayIso()] = String(legacy.notes);
            }
        } catch {
            // Ignore malformed legacy state.
        }
        return target;
    }

    let state = migrateLegacySessionState(normalizeState(readStorage()));

    function saveState() {
        state.updatedAt = nowIso();
        writeStorage(state);
    }

    function parsePlanLabel(value) {
        let label = String(value || '').replace(/\s+/g, ' ').trim();
        let doctor = '';
        const doctorMatch = label.match(/\(([^()]+)\)\s*$/);
        if (doctorMatch) {
            doctor = String(doctorMatch[1] || '').trim();
            label = label.slice(0, doctorMatch.index).trim();
        }
        return { label, doctor };
    }

    function planRowForEncounter(encounterNr) {
        const doc = getDocument();
        return doc?.getElementById(`tdMiniColorBars${encounterNr}`)?.closest('tr') || null;
    }

    function planMetadata(encounterNr) {
        const row = planRowForEncounter(encounterNr);
        if (!row) return {};

        const cells = [...row.querySelectorAll('td')];
        const ageCell = cells.find(cell => /\b\d{1,3}\s*ετών\b/i.test(cell.textContent || ''));
        const ageMatch = String(ageCell?.textContent || '').match(/\b(\d{1,3})\s*ετών\b/i);
        const admissionDate = normalizeDate(ageCell?.previousElementSibling?.textContent || '');

        const titled = [...row.querySelectorAll('[title]')]
            .map(element => ({
                element,
                title: normalizeText(element.getAttribute('title') || ''),
                text: String(element.textContent || '').replace(/\s+/g, ' ').trim()
            }))
            .filter(item => item.text);

        const diagnosisCandidates = titled.filter(item =>
            item.title.includes('ΔΙΑΓΝΩΣ') && !item.title.includes('ΑΝΑΖΗΤ')
        );
        const admissionCandidates = titled.filter(item =>
            item.title.includes('ΑΙΤΙΑ ΕΙΣΑΓΩΓΗΣ')
            || item.title.includes('ΔΙΑΓΝΩΣΗ ΕΙΣΑΓΩΓΗΣ')
        );

        const diagnosis = diagnosisCandidates.at(-1) || null;
        const admission = admissionCandidates.at(-1) || null;
        const incidentSource = diagnosis || admission;
        const parsedIncident = parsePlanLabel(incidentSource?.text || '');
        const parsedAdmission = parsePlanLabel(admission?.text || '');

        return {
            age: ageMatch?.[1] || '',
            admissionDate,
            incident: parsedIncident.label,
            doctor: parsedIncident.doctor || parsedAdmission.doctor
        };
    }

    function currentPatients() {
        return (A.runtime.getAllPatients?.() || [])
            .map(patient => {
                const encounterNr = String(patient.encounterNr || '');
                const meta = planMetadata(encounterNr);
                return {
                    ...patient,
                    ...meta,
                    encounterNr,
                    room: String(patient.room || ''),
                    bed: String(patient.bed || ''),
                    name: String(patient.name || patient.patientName || '')
                };
            })
            .filter(patient => patient.encounterNr);
    }

    function cleanupMissingPatients(currentIds) {
        const now = Date.now();
        Object.entries(state.patients).forEach(([key, patient]) => {
            if (currentIds.has(key)) return;
            const lastSeen = new Date(patient.lastSeenAt || 0).getTime();
            if (!lastSeen || now - lastSeen > MISSING_PATIENT_TTL_MS) {
                delete state.patients[key];
            }
        });
    }

    function cleanupOldDailyNotes() {
        const threshold = Date.now() - 21 * 24 * 60 * 60 * 1000;
        Object.keys(state.dailyNotes).forEach(key => {
            const date = dateAtNoon(key);
            if (date && date.getTime() < threshold) delete state.dailyNotes[key];
        });
    }

    function syncPatients() {
        const patients = currentPatients();
        const currentIds = new Set(patients.map(patient => patient.encounterNr));
        const seenAt = nowIso();

        patients.forEach(patient => {
            const existing = state.patients[patient.encounterNr] || {};
            state.patients[patient.encounterNr] = normalizePatientData({
                ...existing,
                encounterNr: patient.encounterNr,
                room: patient.room || existing.room || '',
                bed: patient.bed || existing.bed || '',
                name: patient.name || existing.name || '',
                age: patient.age || existing.age || '',
                admissionDate: patient.admissionDate || existing.admissionDate || '',
                incident: patient.incident || existing.incident || '',
                doctor: patient.doctor || existing.doctor || '',
                lastSeenAt: seenAt
            });
        });

        cleanupMissingPatients(currentIds);
        cleanupOldDailyNotes();
        saveState();
        return patients;
    }

    function anticoagulationEntries() {
        return A.runtime.getAnticoagulationEntries?.() || [];
    }

    function ensureStyle(doc) {
        if (!doc || doc.getElementById(STYLE_ID)) return;
        const style = doc.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            #${OVERLAY_ID}{position:fixed;inset:0;z-index:2147483645;background:#f4f7fb;color:#172033;font-family:Arial,sans-serif;overflow:hidden}
            #${OVERLAY_ID} *{box-sizing:border-box}
            #${OVERLAY_ID} .do-header{height:62px;background:#fff;border-bottom:1px solid #d8e0e8;display:flex;align-items:center;justify-content:space-between;padding:0 16px;gap:12px}
            #${OVERLAY_ID} .do-title{font-size:20px;font-weight:700;color:#10233f}
            #${OVERLAY_ID} .do-subtitle{font-size:11px;color:#66788a;margin-top:2px}
            #${OVERLAY_ID} .do-header-actions{display:flex;align-items:center;gap:7px}
            #${OVERLAY_ID} button{cursor:pointer}
            #${OVERLAY_ID} .do-primary{background:#1769c2;color:#fff;border:1px solid #0e5aa9;border-radius:5px;padding:7px 11px;font-weight:600}
            #${OVERLAY_ID} .do-secondary{background:#fff;color:#245b9b;border:1px solid #9bb8d6;border-radius:5px;padding:7px 11px;font-weight:600}
            #${OVERLAY_ID} .do-status{font-size:12px;color:#5b6b7b;min-width:190px;text-align:right}
            #${OVERLAY_ID} .do-shell{height:calc(100vh - 62px);display:grid;grid-template-columns:minmax(0,1fr) 205px}
            #${OVERLAY_ID} .do-main{overflow:auto;padding:12px}
            #${OVERLAY_ID} .do-board{min-width:1470px;background:#fff;border:1px solid #d4dde7;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(24,42,68,.07)}
            #${OVERLAY_ID} .do-board-head,#${OVERLAY_ID} .do-patient-row{display:grid;grid-template-columns:142px 72px 190px 136px 235px 190px 190px 175px minmax(260px,1fr)}
            #${OVERLAY_ID} .do-board-head{position:sticky;top:0;z-index:10;background:#eef4fb;color:#22548d;border-bottom:1px solid #cbd8e5;font-size:11px;font-weight:700}
            #${OVERLAY_ID} .do-board-head>div{padding:9px 8px;border-right:1px solid #d9e2eb}
            #${OVERLAY_ID} .do-patient-row{border-bottom:1px solid #dce3ea;align-items:stretch;background:#fff}
            #${OVERLAY_ID} .do-patient-row:nth-child(odd){background:#fbfcfe}
            #${OVERLAY_ID} .do-patient-row:last-child{border-bottom:0}
            #${OVERLAY_ID} .do-cell{padding:8px;border-right:1px solid #e2e8ef;min-width:0;font-size:12px;line-height:1.28;position:relative}
            #${OVERLAY_ID} .do-patient-name{font-weight:700;color:#154f92;margin-top:3px;word-break:break-word}
            #${OVERLAY_ID} .do-bed{font-size:17px;font-weight:700;color:#0a58ad}
            #${OVERLAY_ID} .do-age{font-weight:700}
            #${OVERLAY_ID} .do-muted{color:#6e7d8c;font-size:10px}
            #${OVERLAY_ID} .do-postop{display:inline-block;margin-top:5px;padding:3px 6px;border-radius:12px;background:#e6f4ea;color:#26743b;font-size:10px;font-weight:700}
            #${OVERLAY_ID} .do-lab-grid{display:flex;flex-wrap:wrap;gap:4px}
            #${OVERLAY_ID} .do-lab-chip{border:1px solid #d5dee7;border-radius:4px;background:#f8fafc;padding:3px 5px;white-space:nowrap;font-size:10px}
            #${OVERLAY_ID} .do-empty{color:#9aa6b2;font-size:11px}
            #${OVERLAY_ID} select,#${OVERLAY_ID} input,#${OVERLAY_ID} textarea{font:inherit;border:1px solid #b9c6d3;border-radius:4px;background:#fff;padding:5px 6px;max-width:100%}
            #${OVERLAY_ID} .do-inline{display:flex;align-items:center;gap:5px;flex-wrap:wrap}
            #${OVERLAY_ID} .do-entry-list{display:flex;flex-wrap:wrap;gap:4px;align-items:flex-start}
            #${OVERLAY_ID} .do-entry-chip{display:inline-flex;align-items:center;gap:4px;background:#edf4fd;border:1px solid #c8daf1;color:#245b9b;border-radius:13px;padding:3px 6px;font-size:10px;max-width:100%}
            #${OVERLAY_ID} .do-entry-chip span{overflow-wrap:anywhere}
            #${OVERLAY_ID} .do-chip-remove{border:0;background:transparent;color:#6f7f90;padding:0 1px;font-size:12px;line-height:1}
            #${OVERLAY_ID} details.do-add-menu{margin-top:5px}
            #${OVERLAY_ID} details.do-add-menu>summary{list-style:none;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border:1px solid #8caed2;border-radius:5px;color:#1769c2;background:#fff;font-size:16px;font-weight:700}
            #${OVERLAY_ID} details.do-add-menu>summary::-webkit-details-marker{display:none}
            #${OVERLAY_ID} .do-add-panel{margin-top:5px;padding:7px;border:1px solid #bdcbd9;border-radius:6px;background:#f8fbff;display:grid;gap:6px}
            #${OVERLAY_ID} .do-add-panel select,#${OVERLAY_ID} .do-add-panel input{width:100%}
            #${OVERLAY_ID} .do-add-panel .do-primary{padding:5px 8px;font-size:11px;justify-self:end}
            #${OVERLAY_ID} .do-mini-list{display:grid;gap:4px}
            #${OVERLAY_ID} .do-icon-button{border:1px solid #aebdca;background:#fff;border-radius:4px;padding:4px 6px;color:#34495e}
            #${OVERLAY_ID} .do-pending-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px}
            #${OVERLAY_ID} .do-pending-item{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:4px;align-items:start}
            #${OVERLAY_ID} .do-pending-item input[type=checkbox]{width:auto;margin-top:5px}
            #${OVERLAY_ID} .do-pending-label{padding:4px 2px;overflow-wrap:anywhere}
            #${OVERLAY_ID} .do-pending-item.done .do-pending-label{text-decoration:line-through;color:#75808b}
            #${OVERLAY_ID} .do-sidebar{border-left:1px solid #d2dbe5;background:#f0f4f8;padding:12px;overflow:auto;display:grid;align-content:start;gap:10px}
            #${OVERLAY_ID} .do-stat{background:#fff;border:1px solid #d4dde7;border-radius:8px;padding:12px;text-align:center}
            #${OVERLAY_ID} .do-stat strong{display:block;font-size:25px;color:#1769c2;margin-top:5px}
            #${OVERLAY_ID} .do-notes{background:#fff;border:1px solid #d4dde7;border-radius:8px;padding:9px}
            #${OVERLAY_ID} .do-notes textarea{width:100%;min-height:190px;resize:vertical;margin-top:7px}
            @media(max-width:1250px){#${OVERLAY_ID} .do-shell{grid-template-columns:minmax(0,1fr) 185px}}
        `;
        doc.head.appendChild(style);
    }

    function anticoagulationOptions(selected) {
        return anticoagulationEntries().map(entry => `
            <option value="${escapeHtml(entry.key)}" ${entry.key === selected ? 'selected' : ''}>${escapeHtml(entry.title)}</option>
        `).join('');
    }

    function labsHtml(labs) {
        const values = LAB_TARGETS
            .filter(target => labs?.[target.key])
            .map(target => `<span class="do-lab-chip"><b>${target.key}</b> ${escapeHtml(labs[target.key])}</span>`);
        return values.length
            ? `<div class="do-lab-grid">${values.join('')}</div>`
            : '<span class="do-empty">—</span>';
    }

    function anticoagulationHtml(data) {
        const selected = anticoagulationEntries().find(entry => entry.key === data.anticoagulationKey);
        const summary = selected
            ? `<div class="do-entry-list"><span class="do-entry-chip"><span>${escapeHtml([
                selected.title,
                data.anticoagulationTiming,
                data.anticoagulationStoppedDate ? `διακοπή ${formatGreekDate(data.anticoagulationStoppedDate)}` : ''
            ].filter(Boolean).join(' · '))}</span><button type="button" class="do-chip-remove do-clear-anticoag" title="Αφαίρεση">×</button></span></div>`
            : '<span class="do-empty">Καμία</span>';
        return `
            ${summary}
            <details class="do-add-menu do-anticoag-menu">
                <summary title="Προσθήκη αντιπηκτικής">＋</summary>
                <div class="do-add-panel">
                    <select class="do-new-anticoag">
                        <option value="">-- Επιλογή αγωγής --</option>
                        ${anticoagulationOptions(data.anticoagulationKey)}
                    </select>
                    <select class="do-new-anticoag-timing">
                        <option value="">-- Πρωί / Βράδυ --</option>
                        <option value="Πρωί" ${data.anticoagulationTiming === 'Πρωί' ? 'selected' : ''}>Πρωί</option>
                        <option value="Βράδυ" ${data.anticoagulationTiming === 'Βράδυ' ? 'selected' : ''}>Βράδυ</option>
                    </select>
                    <label class="do-muted">Ημερομηνία διακοπής<input type="date" class="do-new-anticoag-stop" value="${escapeHtml(data.anticoagulationStoppedDate || '')}"></label>
                    <button type="button" class="do-primary do-add-anticoag">Προσθήκη</button>
                </div>
            </details>
        `;
    }

    function comorbidityHtml(data) {
        const selected = normalizeComorbidities(data.comorbidities);
        const chips = selected.length
            ? selected.map((item, index) => `<span class="do-entry-chip"><span>${escapeHtml(item)}</span><button type="button" class="do-chip-remove do-remove-comorbidity" data-index="${index}" title="Αφαίρεση">×</button></span>`).join('')
            : '<span class="do-empty">Καμία</span>';
        const available = COMORBIDITY_OPTIONS.filter(option => !selected.includes(option));
        return `
            <div class="do-entry-list">${chips}</div>
            <details class="do-add-menu do-comorb-menu">
                <summary title="Προσθήκη συννοσηρότητας">＋</summary>
                <div class="do-add-panel">
                    <select class="do-new-comorbidity">
                        <option value="">-- Επιλογή συννοσηρότητας --</option>
                        ${available.map(option => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join('')}
                    </select>
                    <button type="button" class="do-primary do-add-comorbidity">Προσθήκη</button>
                </div>
            </details>
        `;
    }

    function transfusionHtml(data) {
        const chips = (data.transfusions || []).length
            ? data.transfusions.map((item, index) => `<span class="do-entry-chip"><span>${escapeHtml(`${formatGreekDate(item.date)} · ${item.type}`)}</span><button type="button" class="do-chip-remove do-remove-transfusion" data-index="${index}" title="Αφαίρεση">×</button></span>`).join('')
            : '<span class="do-empty">Καμία</span>';
        return `
            <div class="do-entry-list">${chips}</div>
            <details class="do-add-menu do-transfusion-menu">
                <summary title="Προσθήκη μετάγγισης">＋</summary>
                <div class="do-add-panel">
                    <input type="date" class="do-new-transfusion-date" value="${todayIso()}">
                    <select class="do-new-transfusion-type">${TRANSFUSION_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}</select>
                    <button type="button" class="do-primary do-add-transfusion">Προσθήκη</button>
                </div>
            </details>
        `;
    }

    function pendingHtml(data) {
        const rows = (data.pending || []).map((item, index) => `
            <div class="do-pending-item ${item.done ? 'done' : ''}" data-index="${index}">
                <input type="checkbox" class="do-pending-done" ${item.done ? 'checked' : ''}>
                <div class="do-pending-label">${escapeHtml(item.text || '')}</div>
                <button type="button" class="do-icon-button do-remove-pending" title="Αφαίρεση">✕</button>
            </div>
        `).join('');
        return `
            <div class="do-pending-head"><span class="do-muted">${(data.pending || []).filter(item => !item.done).length} ανοικτές</span></div>
            <div class="do-mini-list do-pending-list">${rows || '<span class="do-empty">Καμία</span>'}</div>
            <details class="do-add-menu do-pending-menu">
                <summary title="Προσθήκη εκκρεμότητας">＋</summary>
                <div class="do-add-panel">
                    <select class="do-new-pending-select">
                        <option value="">-- Επιλογή εκκρεμότητας --</option>
                        ${PENDING_OPTIONS.map(option => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join('')}
                    </select>
                    <input class="do-new-pending-text" placeholder="Ή γράψε ελεύθερο κείμενο">
                    <button type="button" class="do-primary do-add-pending">Προσθήκη</button>
                </div>
            </details>
        `;
    }

    function patientRow(patient) {
        const data = state.patients[patient.encounterNr];
        const admissionMeta = [
            data.admissionDate ? formatGreekDate(data.admissionDate) : '',
            hospitalizationDay(data.admissionDate)
        ].filter(Boolean).join(' · ');
        const postop = postoperativeLabel(data.surgeryDate);
        return `
            <section class="do-patient-row" data-pn="${escapeHtml(patient.encounterNr)}">
                <div class="do-cell">
                    <div class="do-bed">${escapeHtml(data.room)}/${escapeHtml(data.bed)}</div>
                    <div class="do-patient-name">${escapeHtml(data.name || patient.encounterNr)}</div>
                    <div class="do-muted">${escapeHtml(patient.encounterNr)}</div>
                </div>
                <div class="do-cell">
                    <div class="do-age">${data.age ? `${escapeHtml(data.age)} ετών` : '—'}</div>
                </div>
                <div class="do-cell">
                    <div>${escapeHtml(data.incident || '—')}</div>
                    ${postop ? `<div class="do-postop">${escapeHtml(postop)}</div>` : ''}
                    ${data.surgeryDate ? `<div class="do-muted" style="margin-top:4px;">Χ/Ο ${escapeHtml(formatGreekDate(data.surgeryDate))}</div>` : ''}
                    <div class="do-muted" style="margin-top:5px;">${escapeHtml(admissionMeta || 'Δεν βρέθηκε εισαγωγή')}</div>
                </div>
                <div class="do-cell">${escapeHtml(data.doctor || '—')}</div>
                <div class="do-cell">${labsHtml(data.labs)}</div>
                <div class="do-cell">${anticoagulationHtml(data)}</div>
                <div class="do-cell">${comorbidityHtml(data)}</div>
                <div class="do-cell">${transfusionHtml(data)}</div>
                <div class="do-cell">${pendingHtml(data)}</div>
            </section>
        `;
    }

    function getPatientDataFromRow(row) {
        return state.patients[row.dataset.pn];
    }

    function updateStats() {
        const doc = getDocument();
        const overlay = doc?.getElementById(OVERLAY_ID);
        if (!overlay) return;
        const currentIds = new Set(currentPatients().map(patient => patient.encounterNr));
        const currentData = Object.entries(state.patients)
            .filter(([key]) => currentIds.has(key))
            .map(([, value]) => value);
        const pendingCount = currentData.reduce((sum, patient) =>
            sum + (patient.pending || []).filter(item => !item.done).length,
        0);
        overlay.querySelector('[data-stat="patients"]').textContent = String(currentData.length);
        overlay.querySelector('[data-stat="pending"]').textContent = String(pendingCount);
    }

    function bindRow(row) {
        const data = getPatientDataFromRow(row);
        if (!data) return;

        row.querySelector('.do-add-anticoag')?.addEventListener('click', () => {
            const key = row.querySelector('.do-new-anticoag')?.value || '';
            if (!key) return;
            data.anticoagulationKey = key;
            data.anticoagulationTiming = row.querySelector('.do-new-anticoag-timing')?.value || '';
            data.anticoagulationStoppedDate = row.querySelector('.do-new-anticoag-stop')?.value || '';
            saveState();
            render();
        });
        row.querySelector('.do-clear-anticoag')?.addEventListener('click', () => {
            data.anticoagulationKey = '';
            data.anticoagulationTiming = '';
            data.anticoagulationStoppedDate = '';
            saveState();
            render();
        });

        row.querySelector('.do-add-comorbidity')?.addEventListener('click', () => {
            const value = row.querySelector('.do-new-comorbidity')?.value || '';
            if (!value || data.comorbidities.includes(value)) return;
            data.comorbidities.push(value);
            saveState();
            render();
        });
        row.querySelectorAll('.do-remove-comorbidity').forEach(button => {
            button.onclick = () => {
                data.comorbidities.splice(Number(button.dataset.index), 1);
                saveState();
                render();
            };
        });

        row.querySelector('.do-add-transfusion')?.addEventListener('click', () => {
            const date = row.querySelector('.do-new-transfusion-date')?.value || '';
            const type = row.querySelector('.do-new-transfusion-type')?.value || '';
            if (!date || !type) return;
            data.transfusions.push({ date, type });
            saveState();
            render();
        });
        row.querySelectorAll('.do-remove-transfusion').forEach(button => {
            button.onclick = () => {
                data.transfusions.splice(Number(button.dataset.index), 1);
                saveState();
                render();
            };
        });

        row.querySelectorAll('.do-pending-item').forEach(itemRow => {
            const index = Number(itemRow.dataset.index);
            const done = itemRow.querySelector('.do-pending-done');
            done.onchange = () => {
                data.pending[index].done = done.checked;
                itemRow.classList.toggle('done', done.checked);
                saveState();
                updateStats();
            };
            itemRow.querySelector('.do-remove-pending').onclick = () => {
                data.pending.splice(index, 1);
                saveState();
                render();
            };
        });

        const addPending = () => {
            const freeText = row.querySelector('.do-new-pending-text')?.value.trim() || '';
            const selected = row.querySelector('.do-new-pending-select')?.value || '';
            const value = freeText || selected;
            if (!value) return;
            data.pending.push({ text: value, done: false });
            saveState();
            render();
        };
        row.querySelector('.do-add-pending')?.addEventListener('click', addPending);
        row.querySelector('.do-new-pending-text')?.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                addPending();
            }
        });
    }

    function render() {
        const doc = getDocument();
        const overlay = doc?.getElementById(OVERLAY_ID);
        if (!overlay) return;
        const patients = syncPatients();
        const body = overlay.querySelector('.do-board-body');
        body.innerHTML = patients.length
            ? patients.map(patientRow).join('')
            : '<div style="padding:35px;text-align:center;">Δεν βρέθηκαν ασθενείς στον θάλαμο.</div>';
        body.querySelectorAll('.do-patient-row').forEach(bindRow);
        overlay.querySelector('.do-notes textarea').value = state.dailyNotes[todayIso()] || '';
        updateStats();
    }

    function findValueByLabels(doc, labels) {
        const normalizedLabels = labels.map(normalizeText);
        const candidates = [...doc.querySelectorAll('tr, .form-group, .row, fieldset, div')];
        for (const candidate of candidates) {
            const fullText = normalizeText(candidate.textContent || '');
            if (!normalizedLabels.some(label => fullText.includes(label))) continue;
            const input = candidate.querySelector('input, textarea, select');
            if (input?.value) return String(input.value).trim();
            const children = [...candidate.querySelectorAll(':scope > td, :scope > div, :scope > span')]
                .map(node => String(node.textContent || '').replace(/\s+/g, ' ').trim())
                .filter(Boolean);
            if (children.length > 1) return children[children.length - 1];
        }
        return '';
    }

    function extractDateNearLabels(doc, labels) {
        const direct = findValueByLabels(doc, labels);
        if (normalizeDate(direct)) return normalizeDate(direct);
        const normalizedLabels = labels.map(normalizeText);
        const elements = [...doc.querySelectorAll('tr, div, p, li, td')];
        for (const element of elements) {
            const text = String(element.textContent || '').replace(/\s+/g, ' ').trim();
            const normalized = normalizeText(text);
            if (!normalizedLabels.some(label => normalized.includes(label))) continue;
            const date = normalizeDate(text);
            if (date) return date;
        }
        return '';
    }

    function patientInfoUrl(patient) {
        const url = new URL('/modules/nursing/nursing-station-patient-informational.php', window.location.origin);
        url.searchParams.set('lang', 'gr');
        url.searchParams.set('pn', patient.encounterNr);
        url.searchParams.set('ward_nr', getWardNumber());
        url.searchParams.set('station', 'Ορθοπαιδική');
        return url.href;
    }

    function patientLabUrl(patient) {
        const [year, month, day] = todayIso().split('-');
        const params = new URLSearchParams({
            lang: 'gr',
            rm: patient.room || '',
            bd: patient.bed || '',
            pn: patient.encounterNr,
            pyear: year,
            pmonth: month,
            pday: day,
            tb: '99ccff',
            tt: '330066',
            bb: 'ffffff',
            d: '1',
            station: 'ΟΡΘΟΠΑΙΔΙΚΗ',
            dept_nr: '81',
            ward_nr: getWardNumber()
        });
        return `${window.location.origin}/modules/nursing/nursing-station-patient-laboratory.php?${params}`;
    }

    async function fetchHtml(url) {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store'
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        return new DOMParser().parseFromString(html, 'text/html');
    }

    function extractPatientDetails(doc) {
        const bodyText = String(doc.body?.textContent || '').replace(/\s+/g, ' ');
        const ageMatch = bodyText.match(/\b(\d{1,3})\s*(?:ετών|έτη)\b/i);
        let incident = findValueByLabels(doc, [
            'κύρια διάγνωση',
            'διάγνωση εισαγωγής',
            'διάγνωση',
            'περιστατικό',
            'αιτία εισαγωγής'
        ]);
        if (!incident) {
            const icdText = bodyText.match(/\b[A-Z][0-9]{2}(?:\.[0-9A-Z]{1,4})?\b[^\n|]{3,180}/i);
            incident = icdText?.[0]?.trim() || '';
        }
        return {
            age: ageMatch?.[1] || '',
            admissionDate: normalizeDate(findValueByLabels(doc, [
                'ημερομηνία εισαγωγής',
                'ημ/νία εισαγωγής',
                'εισαγωγή'
            ])),
            incident,
            doctor: findValueByLabels(doc, [
                'θεράπων ιατρός',
                'θεράπων',
                'υπεύθυνος ιατρός'
            ]),
            surgeryDate: extractDateNearLabels(doc, [
                'ημερομηνία χειρουργείου',
                'ημερομηνία επέμβασης',
                'ημερομηνία πρακτικού',
                'πρακτικό χειρουργείου'
            ])
        };
    }

    function looksLikeNumericResult(text) {
        const value = String(text || '').trim();
        if (!value || /\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}/.test(value)) return false;
        return /^[<>]?\s*-?\d+(?:[.,]\d+)?(?:\s*[A-Za-zΑ-Ωα-ω%/^0-9µμ.-]+)?$/.test(value);
    }

    function targetForText(text) {
        const normalized = normalizeText(text)
            .replace(/[()\[\]:]/g, ' ')
            .replace(/\s+/g, ' ');
        for (const target of LAB_TARGETS) {
            for (const alias of target.aliases) {
                const normalizedAlias = normalizeText(alias);
                if (normalizedAlias.length <= 2) {
                    const tokens = normalized.split(/[^A-ZΑ-Ω0-9]+/).filter(Boolean);
                    if (tokens.includes(normalizedAlias)) return target;
                } else if (normalized.includes(normalizedAlias)) {
                    return target;
                }
            }
        }
        return null;
    }

    function extractValueFromRow(cells, aliasIndex) {
        const ordered = [
            ...cells.slice(aliasIndex + 1),
            ...cells.slice(0, aliasIndex)
        ];
        for (const cell of ordered) {
            const text = String(cell.textContent || '').replace(/\s+/g, ' ').trim();
            const directPieces = text.split(/\s{2,}|\||;/).map(item => item.trim()).filter(Boolean);
            for (const piece of directPieces) {
                if (looksLikeNumericResult(piece)) return piece.replace(',', '.');
            }
            const match = text.match(/[<>]?\s*-?\d+(?:[.,]\d+)?/);
            if (match && !/\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}/.test(text)) {
                return match[0].replace(/\s+/g, '').replace(',', '.');
            }
        }
        return '';
    }

    function extractTargetLabs(doc) {
        const results = {};
        const rows = [...doc.querySelectorAll('tr')];
        for (const row of rows) {
            const cells = [...row.querySelectorAll('th, td')];
            if (!cells.length) continue;
            let target = null;
            let aliasIndex = -1;
            for (let index = 0; index < cells.length; index++) {
                target = targetForText(cells[index].textContent || '');
                if (target) {
                    aliasIndex = index;
                    break;
                }
            }
            if (!target || results[target.key]) continue;
            const value = extractValueFromRow(cells, aliasIndex);
            if (value) results[target.key] = value;
        }

        if (Object.keys(results).length < LAB_TARGETS.length) {
            const text = String(doc.body?.innerText || '').replace(/\u00a0/g, ' ');
            LAB_TARGETS.forEach(target => {
                if (results[target.key]) return;
                for (const alias of target.aliases) {
                    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(`(?:^|\\s)${escaped}[^\\n\\r]{0,80}?([<>]?\\s*-?\\d+(?:[.,]\\d+)?)`, 'im');
                    const match = text.match(regex);
                    if (match) {
                        results[target.key] = match[1].replace(/\s+/g, '').replace(',', '.');
                        break;
                    }
                }
            });
        }
        return results;
    }

    async function discoverSurgeryDate(infoDoc) {
        const fromInfo = extractPatientDetails(infoDoc).surgeryDate;
        if (fromInfo) return fromInfo;
        const links = [...infoDoc.querySelectorAll('a[href]')]
            .map(link => ({
                href: link.getAttribute('href') || '',
                text: normalizeText(link.textContent || '')
            }))
            .filter(item => /SURGER|OPERATION|PRAKT|PRACT|XEIPOYP|ΧΕΙΡΟΥΡΓ|ΠΡΑΚΤΙΚ/.test(normalizeText(`${item.href} ${item.text}`)))
            .slice(0, 3);
        for (const item of links) {
            try {
                const href = new URL(item.href, window.location.origin).href;
                const doc = await fetchHtml(href);
                const date = extractDateNearLabels(doc, [
                    'ημερομηνία χειρουργείου',
                    'ημερομηνία επέμβασης',
                    'ημερομηνία πρακτικού',
                    'πρακτικό χειρουργείου'
                ]);
                if (date) return date;
            } catch {
                // Try the next discovered practical/surgery link.
            }
        }
        return '';
    }

    async function fetchPatientSnapshot(patient) {
        const infoDoc = await fetchHtml(patientInfoUrl(patient));
        const details = extractPatientDetails(infoDoc);
        if (!details.surgeryDate) {
            details.surgeryDate = await discoverSurgeryDate(infoDoc);
        }
        let labs = null;
        try {
            const labDoc = await fetchHtml(patientLabUrl(patient));
            labs = extractTargetLabs(labDoc);
        } catch (error) {
            console.warn(`Daily overview labs ${patient.encounterNr}:`, error);
        }
        return { ...details, labs };
    }

    async function refreshFromCare() {
        const doc = getDocument();
        const overlay = doc?.getElementById(OVERLAY_ID);
        const status = overlay?.querySelector('.do-status');
        if (status) status.textContent = 'Ανάγνωση του τρέχοντος πλάνου...';
        syncPatients();
        render();
        if (status) status.textContent = 'Η ενημέρωση από το πλάνο ολοκληρώθηκε.';
    }

    function currentPatientData() {
        const ids = new Set(currentPatients().map(patient => patient.encounterNr));
        return Object.entries(state.patients)
            .filter(([key]) => ids.has(key))
            .map(([, value]) => value);
    }

    function printableLabs(labs) {
        return LAB_TARGETS
            .filter(target => labs?.[target.key])
            .map(target => `<span><b>${target.key}</b> ${escapeHtml(labs[target.key])}</span>`)
            .join(' ');
    }

    function printablePatientRow(patient) {
        const anticoag = anticoagulationEntries().find(entry => entry.key === patient.anticoagulationKey);
        const transfusions = (patient.transfusions || [])
            .map(item => `${formatGreekDate(item.date)} ${item.type}`)
            .join('<br>');
        const pending = (patient.pending || [])
            .map(item => `<div class="${item.done ? 'done' : ''}">${item.done ? '☑' : '☐'} ${escapeHtml(item.text)}</div>`)
            .join('');
        const postop = postoperativeLabel(patient.surgeryDate);
        const admission = [formatGreekDate(patient.admissionDate), hospitalizationDay(patient.admissionDate)]
            .filter(Boolean).join(' · ');
        return `
            <section class="patient-row">
                <div class="patient"><b>${escapeHtml(patient.room)}/${escapeHtml(patient.bed)}</b><br>${escapeHtml(patient.name)}<br><small>${escapeHtml(patient.encounterNr)}</small></div>
                <div><b>${patient.age ? `${escapeHtml(patient.age)} ετών` : '—'}</b></div>
                <div>${escapeHtml(patient.incident || '—')}${postop ? `<br><span class="postop">${escapeHtml(postop)}</span>` : ''}<br><small>${escapeHtml(admission || '')}</small></div>
                <div>${escapeHtml(patient.doctor || '—')}</div>
                <div class="labs">${printableLabs(patient.labs) || '—'}</div>
                <div>${escapeHtml([anticoag?.title, patient.anticoagulationTiming, patient.anticoagulationStoppedDate ? `διακοπή ${formatGreekDate(patient.anticoagulationStoppedDate)}` : ''].filter(Boolean).join(' · ') || '—')}</div>
                <div>${escapeHtml((patient.comorbidities || []).join(', ') || '—')}</div>
                <div>${transfusions || '—'}</div>
                <div>${pending || '—'}</div>
            </section>
        `;
    }

    function printOverview() {
        const patients = currentPatientData();
        const popup = window.open('', '_blank');
        if (!popup) {
            alert('Ο browser απέκλεισε το παράθυρο εκτύπωσης.');
            return;
        }
        popup.document.open();
        popup.document.write(`<!doctype html><html lang="el"><head><meta charset="utf-8"><title>Ημερήσια Επισκόπηση ${formatGreekDate(todayIso())}</title>
            <style>
                @page{size:A4 portrait;margin:5mm}
                *{box-sizing:border-box}
                body{margin:0;font-family:Arial,sans-serif;color:#111;font-size:6.15pt}
                header{display:flex;justify-content:space-between;gap:5mm;border-bottom:.3mm solid #333;padding-bottom:2mm;margin-bottom:2mm}
                h1{font-size:12pt;margin:0 0 1mm}
                .notes{width:42%;white-space:pre-wrap;font-size:6.3pt}
                .board{border:.25mm solid #777}
                .head,.patient-row{display:grid;grid-template-columns:18mm 12mm 32mm 20mm 30mm 22mm 20mm 17mm minmax(27mm,1fr)}
                .head{font-weight:bold;background:#eaf1f8;color:#163f70}
                .head>div,.patient-row>div{border-right:.2mm solid #aaa;padding:1.2mm;overflow-wrap:anywhere}
                .head>div:last-child,.patient-row>div:last-child{border-right:0}
                .patient-row{border-top:.2mm solid #aaa;break-inside:avoid;line-height:1.18;min-height:16mm}
                .patient-row:nth-child(odd){background:#fafafa}
                .patient b{font-size:7pt;color:#0d4f99}
                small{font-size:5.3pt;color:#555}
                .labs span{display:inline-block;margin:0 .8mm .7mm 0;border:.15mm solid #bbb;border-radius:.7mm;padding:.4mm .7mm;white-space:nowrap}
                .postop{font-weight:bold;color:#23743c}
                .done{text-decoration:line-through;color:#666}
            </style></head><body>
            <header><div><h1>Ασκληπιός — Ημερήσια Επισκόπηση</h1><div>${formatGreekDate(todayIso())} · Θάλαμος ${escapeHtml(getWardNumber())} · ${patients.length} ασθενείς</div></div><div class="notes"><b>Σημειώσεις ημέρας</b><br>${escapeHtml(state.dailyNotes[todayIso()] || '—')}</div></header>
            <main class="board">
                <div class="head"><div>Ασθενής</div><div>Ηλικία</div><div>Περιστατικό / Εισαγωγή</div><div>Θεράπων</div><div>Εργαστηριακά</div><div>Αντιπηκτική</div><div>Συννοσηρότητες</div><div>Μεταγγίσεις</div><div>Εκκρεμότητες</div></div>
                ${patients.map(printablePatientRow).join('')}
            </main>
            <script>window.addEventListener('load',()=>setTimeout(()=>window.print(),180));<\/script>
            </body></html>`);
        popup.document.close();
    }

    function recordSurgeryDate(encounterNr, value) {
        const key = String(encounterNr || '');
        const date = normalizeDate(value);
        if (!key || !date) return;
        const existing = state.patients[key] || normalizePatientData({ encounterNr: key });
        existing.surgeryDate = date;
        existing.lastSeenAt = existing.lastSeenAt || nowIso();
        state.patients[key] = existing;
        saveState();
        const doc = getDocument();
        if (doc?.getElementById(OVERLAY_ID)) render();
    }

    function open() {
        const doc = getDocument();
        if (!doc?.body) return;
        state = migrateLegacySessionState(normalizeState(readStorage()));
        syncPatients();
        ensureStyle(doc);
        doc.getElementById(OVERLAY_ID)?.remove();

        const overlay = doc.createElement('div');
        overlay.id = OVERLAY_ID;
        overlay.innerHTML = `
            <div class="do-header">
                <div><div class="do-title">Ασκληπιός Helper — Ημερήσια Επισκόπηση</div><div class="do-subtitle">Όλοι οι ασθενείς ταυτόχρονα · στοιχεία ηλικίας, διάγνωσης και θεράποντα απευθείας από το πλάνο</div></div>
                <div class="do-header-actions">
                    <span class="do-status"></span>
                    <button type="button" class="do-primary" id="do-refresh">Ενημέρωση από πλάνο</button>
                    <button type="button" class="do-secondary" id="do-print">Εκτύπωση Α4</button>
                    <button type="button" class="do-secondary" id="do-close">Κλείσιμο</button>
                </div>
            </div>
            <div class="do-shell">
                <main class="do-main">
                    <div class="do-board">
                        <div class="do-board-head">
                            <div>Θάλαμος / Κλίνη<br>Ασθενής</div>
                            <div>Ηλικία</div>
                            <div>Περιστατικό<br><span class="do-muted">διάγνωση / εισαγωγή</span></div>
                            <div>Θεράπων</div>
                            <div>Εργαστηριακά</div>
                            <div>Αντιπηκτική αγωγή</div>
                            <div>Συννοσηρότητες</div>
                            <div>Μεταγγίσεις</div>
                            <div>Εκκρεμότητες</div>
                        </div>
                        <div class="do-board-body"></div>
                    </div>
                </main>
                <aside class="do-sidebar">
                    <div class="do-stat"><span>Σήμερα</span><strong style="font-size:17px">${formatGreekDate(todayIso())}</strong><div>${escapeHtml(weekday(todayIso()))}</div></div>
                    <div class="do-stat"><span>Συνολικοί ασθενείς</span><strong data-stat="patients">0</strong></div>
                    <div class="do-stat"><span>Εκκρεμότητες</span><strong data-stat="pending">0</strong></div>
                    <div class="do-notes"><b>Σημειώσεις ημέρας</b><textarea placeholder="Στρογγυλή, χειρουργεία, φυσικοθεραπείες..."></textarea><div class="do-muted" style="margin-top:5px">Αποθηκεύονται τοπικά ανά ημερομηνία.</div></div>
                </aside>
            </div>
        `;
        doc.body.appendChild(overlay);

        overlay.querySelector('#do-close').onclick = () => overlay.remove();
        overlay.querySelector('#do-refresh').onclick = refreshFromCare;
        overlay.querySelector('#do-print').onclick = printOverview;
        overlay.querySelector('.do-notes textarea').oninput = event => {
            state.dailyNotes[todayIso()] = event.target.value;
            saveState();
        };

        render();
    }

    A.dailyOverview = {
        open,
        refreshFromCare,
        print: printOverview,
        recordSurgeryDate,
        getState: () => clone(state),
        cleanup: () => {
            syncPatients();
            return clone(state);
        }
    };

    window.addEventListener('asklipios:surgery-saved', event => {
        recordSurgeryDate(
            event?.detail?.encounterNr,
            event?.detail?.surgeryDate
        );
    });

    A.modules.dailyOverview = {
        loaded: true,
        version: VERSION
    };

    console.log(`Asklipios daily overview module ${VERSION} loaded`);
})();
