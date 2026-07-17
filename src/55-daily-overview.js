/*
 * Asklipios — Daily Ward Overview
 * Version 0.13.0
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

    const VERSION = '0.13.0';
    const OVERLAY_ID = 'asklipios-daily-overview';
    const STYLE_ID = 'asklipios-daily-overview-style';
    const STORAGE_KEY = 'asklipios.daily-overview.patient-data.v2';
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
            const raw = typeof GM_getValue === 'function'
                ? GM_getValue(STORAGE_KEY, null)
                : window.localStorage.getItem(STORAGE_KEY);
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
            schemaVersion: 2,
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
        Object.entries(raw.patients || {}).forEach(([key, value]) => {
            const patient = normalizePatientData(value);
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

    function currentPatients() {
        return (A.runtime.getAllPatients?.() || [])
            .map(patient => ({
                ...patient,
                encounterNr: String(patient.encounterNr || ''),
                room: String(patient.room || ''),
                bed: String(patient.bed || ''),
                name: String(patient.name || patient.patientName || '')
            }))
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
            #${OVERLAY_ID} .do-cell{padding:8px;border-right:1px solid #e2e8ef;min-width:0;font-size:12px;line-height:1.28}
            #${OVERLAY_ID} .do-patient-name{font-weight:700;color:#154f92;margin-top:3px;word-break:break-word}
            #${OVERLAY_ID} .do-bed{font-size:17px;font-weight:700;color:#0a58ad}
            #${OVERLAY_ID} .do-age{font-weight:700}
            #${OVERLAY_ID} .do-muted{color:#6e7d8c;font-size:10px}
            #${OVERLAY_ID} .do-postop{display:inline-block;margin-top:5px;padding:3px 6px;border-radius:12px;background:#e6f4ea;color:#26743b;font-size:10px;font-weight:700}
            #${OVERLAY_ID} .do-lab-grid{display:flex;flex-wrap:wrap;gap:4px}
            #${OVERLAY_ID} .do-lab-chip{border:1px solid #d5dee7;border-radius:4px;background:#f8fafc;padding:3px 5px;white-space:nowrap;font-size:10px}
            #${OVERLAY_ID} .do-empty{color:#9aa6b2;font-size:11px}
            #${OVERLAY_ID} select,#${OVERLAY_ID} input,#${OVERLAY_ID} textarea{font:inherit;border:1px solid #b9c6d3;border-radius:4px;background:#fff;padding:5px 6px;max-width:100%}
            #${OVERLAY_ID} .do-compact-select{width:100%;margin-bottom:5px}
            #${OVERLAY_ID} .do-inline{display:flex;align-items:center;gap:5px;flex-wrap:wrap}
            #${OVERLAY_ID} .do-inline select,#${OVERLAY_ID} .do-inline input{min-width:0}
            #${OVERLAY_ID} .do-chip-list{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:5px}
            #${OVERLAY_ID} .do-comorb-chip{background:#edf4fd;border:1px solid #c8daf1;color:#245b9b;border-radius:13px;padding:3px 6px;font-size:10px}
            #${OVERLAY_ID} details.do-comorb-menu{position:relative}
            #${OVERLAY_ID} details.do-comorb-menu>summary{list-style:none;cursor:pointer;border:1px dashed #8caed2;border-radius:4px;padding:4px 6px;color:#245b9b;font-size:10px;width:max-content}
            #${OVERLAY_ID} details.do-comorb-menu>summary::-webkit-details-marker{display:none}
            #${OVERLAY_ID} .do-comorb-options{position:absolute;left:0;top:28px;z-index:25;width:260px;max-height:270px;overflow:auto;background:#fff;border:1px solid #aebdcc;border-radius:6px;box-shadow:0 5px 18px rgba(0,0,0,.18);padding:7px;display:grid;gap:4px}
            #${OVERLAY_ID} .do-comorb-options label{display:flex;align-items:flex-start;gap:6px;font-size:11px;padding:3px;border-radius:3px}
            #${OVERLAY_ID} .do-comorb-options label:hover{background:#eef5fb}
            #${OVERLAY_ID} .do-comorb-options input{width:auto;margin-top:1px}
            #${OVERLAY_ID} .do-mini-list{display:grid;gap:4px}
            #${OVERLAY_ID} .do-transfusion-item{display:grid;grid-template-columns:84px 53px auto;gap:4px;align-items:center}
            #${OVERLAY_ID} .do-new-transfusion{display:grid;grid-template-columns:86px 58px auto;gap:4px;margin-top:5px}
            #${OVERLAY_ID} .do-icon-button{border:1px solid #aebdca;background:#fff;border-radius:4px;padding:4px 6px;color:#34495e}
            #${OVERLAY_ID} .do-pending-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px}
            #${OVERLAY_ID} .do-pending-item{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:4px;align-items:start}
            #${OVERLAY_ID} .do-pending-item input[type=checkbox]{width:auto;margin-top:5px}
            #${OVERLAY_ID} .do-pending-text{width:100%;padding:4px 5px}
            #${OVERLAY_ID} .do-pending-item.done .do-pending-text{text-decoration:line-through;color:#75808b;background:#f1f3f5}
            #${OVERLAY_ID} .do-add-pending-box{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px;margin-top:5px}
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
            : '<span class="do-empty">Δεν βρέθηκαν τιμές</span>';
    }

    function comorbidityHtml(data) {
        const selected = normalizeComorbidities(data.comorbidities);
        const chips = selected.length
            ? selected.map(item => `<span class="do-comorb-chip">${escapeHtml(item)}</span>`).join('')
            : '<span class="do-empty">Καμία επιλεγμένη</span>';
        const options = COMORBIDITY_OPTIONS.map(option => `
            <label><input type="checkbox" class="do-comorb-check" value="${escapeHtml(option)}" ${selected.includes(option) ? 'checked' : ''}> <span>${escapeHtml(option)}</span></label>
        `).join('');
        return `
            <div class="do-chip-list">${chips}</div>
            <details class="do-comorb-menu">
                <summary>+ Επιλογή</summary>
                <div class="do-comorb-options">${options}</div>
            </details>
        `;
    }

    function transfusionHtml(data) {
        const rows = (data.transfusions || []).map((item, index) => `
            <div class="do-transfusion-item" data-index="${index}">
                <input type="date" class="do-transfusion-date" value="${escapeHtml(item.date || '')}">
                <select class="do-transfusion-type">
                    ${TRANSFUSION_TYPES.map(type => `<option value="${type}" ${item.type === type ? 'selected' : ''}>${type}</option>`).join('')}
                </select>
                <button type="button" class="do-icon-button do-remove-transfusion" title="Αφαίρεση">✕</button>
            </div>
        `).join('');
        return `
            <div class="do-mini-list do-transfusion-list">${rows || '<span class="do-empty">Καμία</span>'}</div>
            <div class="do-new-transfusion">
                <input type="date" class="do-new-transfusion-date" value="${todayIso()}">
                <select class="do-new-transfusion-type">${TRANSFUSION_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}</select>
                <button type="button" class="do-icon-button do-add-transfusion">+</button>
            </div>
        `;
    }

    function pendingHtml(data) {
        const rows = (data.pending || []).map((item, index) => `
            <div class="do-pending-item ${item.done ? 'done' : ''}" data-index="${index}">
                <input type="checkbox" class="do-pending-done" ${item.done ? 'checked' : ''}>
                <input type="text" class="do-pending-text" value="${escapeHtml(item.text || '')}">
                <button type="button" class="do-icon-button do-remove-pending" title="Αφαίρεση">✕</button>
            </div>
        `).join('');
        return `
            <div class="do-pending-head"><span class="do-muted">${(data.pending || []).filter(item => !item.done).length} ανοικτές</span><button type="button" class="do-icon-button do-show-add-pending" title="Νέα εκκρεμότητα">＋</button></div>
            <div class="do-mini-list do-pending-list">${rows || '<span class="do-empty">Καμία</span>'}</div>
            <div class="do-add-pending-box" hidden>
                <input class="do-new-pending" placeholder="Γράψε εκκρεμότητα">
                <button type="button" class="do-icon-button do-add-pending">Προσθήκη</button>
            </div>
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
                    ${postop ? `<div class="do-postop">${escapeHtml(postop)}</div>` : ''}
                    ${data.surgeryDate ? `<div class="do-muted" style="margin-top:4px;">Χ/Ο ${escapeHtml(formatGreekDate(data.surgeryDate))}</div>` : ''}
                </div>
                <div class="do-cell">
                    <div>${escapeHtml(data.incident || '—')}</div>
                    <div class="do-muted" style="margin-top:5px;">${escapeHtml(admissionMeta || 'Δεν βρέθηκε εισαγωγή')}</div>
                </div>
                <div class="do-cell">${escapeHtml(data.doctor || '—')}</div>
                <div class="do-cell">${labsHtml(data.labs)}</div>
                <div class="do-cell">
                    <select class="do-compact-select" data-field="anticoagulationKey">
                        <option value="">-- Καμία / επιλογή --</option>
                        ${anticoagulationOptions(data.anticoagulationKey)}
                    </select>
                    <div class="do-inline">
                        <select data-field="anticoagulationTiming" title="Χρόνος λήψης">
                            <option value="">-- Πρωί/Βράδυ --</option>
                            <option value="Πρωί" ${data.anticoagulationTiming === 'Πρωί' ? 'selected' : ''}>Πρωί</option>
                            <option value="Βράδυ" ${data.anticoagulationTiming === 'Βράδυ' ? 'selected' : ''}>Βράδυ</option>
                        </select>
                        <input type="date" data-field="anticoagulationStoppedDate" value="${escapeHtml(data.anticoagulationStoppedDate)}" title="Ημερομηνία διακοπής">
                    </div>
                </div>
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

        row.querySelectorAll('[data-field]').forEach(input => {
            const update = () => {
                data[input.dataset.field] = input.value;
                saveState();
            };
            input.addEventListener('input', update);
            input.addEventListener('change', update);
        });

        row.querySelectorAll('.do-comorb-check').forEach(input => {
            input.onchange = () => {
                const selected = [...row.querySelectorAll('.do-comorb-check:checked')]
                    .map(item => item.value);
                data.comorbidities = selected;
                saveState();
                render();
            };
        });

        row.querySelectorAll('.do-transfusion-item').forEach(itemRow => {
            const index = Number(itemRow.dataset.index);
            itemRow.querySelector('.do-transfusion-date').onchange = event => {
                data.transfusions[index].date = event.target.value;
                saveState();
            };
            itemRow.querySelector('.do-transfusion-type').onchange = event => {
                data.transfusions[index].type = event.target.value;
                saveState();
            };
            itemRow.querySelector('.do-remove-transfusion').onclick = () => {
                data.transfusions.splice(index, 1);
                saveState();
                render();
            };
        });

        row.querySelector('.do-add-transfusion').onclick = () => {
            const date = row.querySelector('.do-new-transfusion-date').value;
            const type = row.querySelector('.do-new-transfusion-type').value;
            data.transfusions.push({ date, type });
            saveState();
            render();
        };

        row.querySelectorAll('.do-pending-item').forEach(itemRow => {
            const index = Number(itemRow.dataset.index);
            const done = itemRow.querySelector('.do-pending-done');
            const text = itemRow.querySelector('.do-pending-text');
            done.onchange = () => {
                data.pending[index].done = done.checked;
                itemRow.classList.toggle('done', done.checked);
                saveState();
                updateStats();
            };
            text.oninput = () => {
                data.pending[index].text = text.value;
                saveState();
            };
            itemRow.querySelector('.do-remove-pending').onclick = () => {
                data.pending.splice(index, 1);
                saveState();
                render();
            };
        });

        const addBox = row.querySelector('.do-add-pending-box');
        const newPendingInput = row.querySelector('.do-new-pending');
        row.querySelector('.do-show-add-pending').onclick = () => {
            addBox.hidden = !addBox.hidden;
            if (!addBox.hidden) newPendingInput.focus();
        };
        const addPending = () => {
            const text = newPendingInput.value.trim();
            if (!text) return;
            data.pending.push({ text, done: false });
            saveState();
            render();
        };
        row.querySelector('.do-add-pending').onclick = addPending;
        newPendingInput.onkeydown = event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                addPending();
            }
        };
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
        const patients = syncPatients();

        for (let index = 0; index < patients.length; index++) {
            const patient = patients[index];
            if (status) status.textContent = `Φόρτωση ${index + 1}/${patients.length}: ${patient.room}/${patient.bed}`;
            try {
                const snapshot = await fetchPatientSnapshot(patient);
                const target = state.patients[patient.encounterNr];
                if (target) {
                    ['age', 'admissionDate', 'incident', 'doctor', 'surgeryDate'].forEach(field => {
                        if (snapshot[field]) target[field] = snapshot[field];
                    });
                    if (snapshot.labs !== null) {
                        target.labs = snapshot.labs;
                    }
                    target.fetchedAt = nowIso();
                }
            } catch (error) {
                console.warn(`Daily overview patient ${patient.encounterNr}:`, error);
            }
            await new Promise(resolve => setTimeout(resolve, REFRESH_DELAY_MS));
        }

        saveState();
        render();
        if (status) status.textContent = 'Η ενημέρωση ολοκληρώθηκε.';
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
                <div><b>${patient.age ? `${escapeHtml(patient.age)} ετών` : '—'}</b>${postop ? `<br><span class="postop">${escapeHtml(postop)}</span>` : ''}</div>
                <div>${escapeHtml(patient.incident || '—')}<br><small>${escapeHtml(admission || '')}</small></div>
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
                <div class="head"><div>Ασθενής</div><div>Ηλικία / ΜΤΧ</div><div>Περιστατικό / Εισαγωγή</div><div>Θεράπων</div><div>Hgb · PLTs · Ur · Cr · Na · K · SGOT · SGPT</div><div>Αντιπηκτική</div><div>Συννοσηρότητες</div><div>Μεταγγίσεις</div><div>Εκκρεμότητες</div></div>
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
                <div><div class="do-title">Ασκληπιός Helper — Ημερήσια Επισκόπηση</div><div class="do-subtitle">Όλοι οι ασθενείς ταυτόχρονα · αυτόματος καθαρισμός χειροκίνητων δεδομένων μετά από 48 ώρες απουσίας</div></div>
                <div class="do-header-actions">
                    <span class="do-status"></span>
                    <button type="button" class="do-primary" id="do-refresh">Ενημέρωση από Ασκληπιό</button>
                    <button type="button" class="do-secondary" id="do-print">Εκτύπωση Α4</button>
                    <button type="button" class="do-secondary" id="do-close">Κλείσιμο</button>
                </div>
            </div>
            <div class="do-shell">
                <main class="do-main">
                    <div class="do-board">
                        <div class="do-board-head">
                            <div>Θάλαμος / Κλίνη<br>Ασθενής</div>
                            <div>Ηλικία<br>ΜΤΧ</div>
                            <div>Περιστατικό<br><span class="do-muted">διάγνωση / εισαγωγή</span></div>
                            <div>Θεράπων</div>
                            <div>Εργαστηριακά<br><span class="do-muted">μόνο Hgb, PLTs, Ur, Cr, Na, K, SGOT, SGPT</span></div>
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
