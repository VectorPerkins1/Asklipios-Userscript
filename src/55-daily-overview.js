/*
 * Asklipios — Daily Overview
 * Version 0.12.0
 *
 * Compact all-patient ward overview. Daily notes are stored only in the
 * current browser tab via sessionStorage and are excluded from settings backup.
 */

(function () {
    'use strict';

    if (window !== window.top) return;

    const A = window.Asklipios;
    if (!A?.runtime) {
        throw new Error('Asklipios runtime is missing. Load 90-legacy-app.js first.');
    }

    A.modules = A.modules || {};

    const OVERLAY_ID = 'asklipios-daily-overview';
    const STYLE_ID = 'asklipios-daily-overview-style';
    const STORAGE_PREFIX = 'asklipios.daily-overview.v1';

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

    function getFrame() {
        return A.runtime.getNursingFrame?.() || null;
    }

    function getDocument() {
        return getFrame()?.document || null;
    }

    function todayIso() {
        const now = new Date();
        return [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0')
        ].join('-');
    }

    function formatGreekDate(value) {
        if (!value) return '';
        const parts = String(value).split('-');
        if (parts.length !== 3) return value;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function weekday(value) {
        if (!value) return '';
        const date = new Date(`${value}T12:00:00`);
        if (Number.isNaN(date.getTime())) return '';
        return date.toLocaleDateString('el-GR', { weekday: 'long' });
    }

    function hospitalizationDay(value) {
        if (!value) return '';
        const admission = new Date(`${value}T12:00:00`);
        const today = new Date(`${todayIso()}T12:00:00`);
        if (Number.isNaN(admission.getTime())) return '';
        const days = Math.max(1, Math.floor((today - admission) / 86400000) + 1);
        return `${days}η ημέρα`;
    }

    function getWardNumber() {
        return A.runtime.getWardNumber?.() || '57';
    }

    function storageKey() {
        return `${STORAGE_PREFIX}.${getWardNumber()}.${todayIso()}`;
    }

    function emptyPatientData(patient) {
        return {
            encounterNr: String(patient.encounterNr || ''),
            room: String(patient.room || ''),
            bed: String(patient.bed || ''),
            name: String(patient.name || patient.patientName || ''),
            age: String(patient.age || ''),
            admissionDate: '',
            incident: '',
            doctor: '',
            labs: '',
            priorAnticoagulation: false,
            anticoagulationKey: '',
            anticoagulationTiming: '',
            anticoagulationStoppedDate: '',
            comorbidities: '',
            transfusions: [],
            pending: []
        };
    }

    function createState() {
        return {
            date: todayIso(),
            notes: '',
            patients: {}
        };
    }

    function loadState() {
        try {
            const raw = sessionStorage.getItem(storageKey());
            if (!raw) return createState();
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') return createState();
            parsed.patients = parsed.patients || {};
            parsed.notes = String(parsed.notes || '');
            return parsed;
        } catch {
            return createState();
        }
    }

    let state = loadState();

    function saveState() {
        try {
            sessionStorage.setItem(storageKey(), JSON.stringify(state));
        } catch (error) {
            console.warn('Daily overview session save failed:', error);
        }
    }

    function currentPatients() {
        return (A.runtime.getAllPatients?.() || [])
            .map(patient => ({
                ...patient,
                encounterNr: String(patient.encounterNr || ''),
                name: String(patient.name || patient.patientName || '')
            }))
            .filter(patient => patient.encounterNr);
    }

    function syncPatients() {
        const patients = currentPatients();
        const next = {};

        patients.forEach(patient => {
            const existing = state.patients[patient.encounterNr] || {};
            next[patient.encounterNr] = {
                ...emptyPatientData(patient),
                ...existing,
                encounterNr: patient.encounterNr,
                room: patient.room || existing.room || '',
                bed: patient.bed || existing.bed || '',
                name: patient.name || existing.name || ''
            };
        });

        state.patients = next;
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
            #${OVERLAY_ID} { position:fixed;inset:0;z-index:2147483645;background:#f4f6f8;color:#17202a;font-family:Arial,sans-serif;overflow:hidden; }
            #${OVERLAY_ID} * { box-sizing:border-box; }
            #${OVERLAY_ID} .do-header { height:58px;background:#112033;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 16px;border-bottom:1px solid #2f455c; }
            #${OVERLAY_ID} .do-header-actions { display:flex;gap:7px; }
            #${OVERLAY_ID} button { cursor:pointer; }
            #${OVERLAY_ID} .do-shell { height:calc(100vh - 58px);display:grid;grid-template-columns:minmax(0,1fr) 245px; }
            #${OVERLAY_ID} .do-main { overflow:auto;padding:12px; }
            #${OVERLAY_ID} .do-grid { display:grid;grid-template-columns:repeat(2,minmax(480px,1fr));gap:10px;align-items:start; }
            #${OVERLAY_ID} .do-card { background:#fff;border:1px solid #c8d0d8;border-radius:7px;box-shadow:0 1px 3px rgba(0,0,0,.08);overflow:hidden; }
            #${OVERLAY_ID} .do-card-header { background:#eaf2f8;padding:8px 10px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #c7d5e0; }
            #${OVERLAY_ID} .do-card-title { font-size:15px;font-weight:bold; }
            #${OVERLAY_ID} .do-card-body { padding:9px;display:grid;gap:8px; }
            #${OVERLAY_ID} .do-meta { display:grid;grid-template-columns:135px minmax(0,1fr) minmax(0,1fr);gap:7px; }
            #${OVERLAY_ID} .do-field label { display:block;font-size:11px;color:#566573;font-weight:bold;margin-bottom:3px; }
            #${OVERLAY_ID} input, #${OVERLAY_ID} select, #${OVERLAY_ID} textarea { width:100%;border:1px solid #b8c2cc;border-radius:4px;padding:5px 6px;background:#fff;font:inherit; }
            #${OVERLAY_ID} textarea { resize:vertical;min-height:36px; }
            #${OVERLAY_ID} .do-line { display:grid;grid-template-columns:130px minmax(0,1fr);gap:8px;align-items:start; }
            #${OVERLAY_ID} .do-line-title { font-weight:bold;font-size:12px;padding-top:5px; }
            #${OVERLAY_ID} .do-anticoag { display:grid;grid-template-columns:auto minmax(145px,1fr) 95px 130px;gap:6px;align-items:center; }
            #${OVERLAY_ID} .do-list { display:grid;gap:5px; }
            #${OVERLAY_ID} .do-item { display:grid;grid-template-columns:auto 120px minmax(0,1fr) auto;gap:6px;align-items:center; }
            #${OVERLAY_ID} .do-pending-item { display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:6px;align-items:center; }
            #${OVERLAY_ID} .do-pending-item.done input[type="text"] { text-decoration:line-through;color:#6c7a89;background:#f3f6f6; }
            #${OVERLAY_ID} .do-add-row { display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px; }
            #${OVERLAY_ID} .do-add-transfusion { display:grid;grid-template-columns:120px minmax(0,1fr) auto;gap:6px; }
            #${OVERLAY_ID} .do-icon-button { border:1px solid #aeb6bf;background:#fff;border-radius:4px;padding:4px 7px; }
            #${OVERLAY_ID} .do-primary { background:#2874a6;color:#fff;border:1px solid #1f618d;border-radius:5px;padding:7px 11px; }
            #${OVERLAY_ID} .do-sidebar { border-left:1px solid #c8d0d8;background:#e9eef3;padding:12px;overflow:auto;display:grid;align-content:start;gap:10px; }
            #${OVERLAY_ID} .do-stat { background:#fff;border:1px solid #c8d0d8;border-radius:7px;padding:12px;text-align:center; }
            #${OVERLAY_ID} .do-stat strong { display:block;font-size:27px;margin-top:5px;color:#1f618d; }
            #${OVERLAY_ID} .do-notes { background:#fff;border:1px solid #c8d0d8;border-radius:7px;padding:10px; }
            #${OVERLAY_ID} .do-notes textarea { min-height:180px; }
            #${OVERLAY_ID} .do-muted { color:#6c7a89;font-size:11px; }
            #${OVERLAY_ID} .do-status { font-size:12px;color:#d6eaf8;min-width:180px;text-align:right; }
            @media (max-width:1200px) { #${OVERLAY_ID} .do-grid { grid-template-columns:1fr; } #${OVERLAY_ID} .do-shell { grid-template-columns:minmax(0,1fr) 220px; } }
        `;
        doc.head.appendChild(style);
    }

    function patientCard(patient) {
        const data = state.patients[patient.encounterNr];
        const anticoagOptions = anticoagulationEntries().map(entry => `
            <option value="${escapeHtml(entry.key)}" ${entry.key === data.anticoagulationKey ? 'selected' : ''}>${escapeHtml(entry.title)}</option>
        `).join('');

        return `
            <section class="do-card" data-pn="${escapeHtml(patient.encounterNr)}">
                <div class="do-card-header">
                    <div class="do-card-title">${escapeHtml(data.room)}/${escapeHtml(data.bed)} — ${escapeHtml(data.name || patient.encounterNr)}</div>
                    <div style="display:flex;align-items:center;gap:6px;width:105px;">
                        <input data-field="age" value="${escapeHtml(data.age)}" placeholder="Ηλικία" inputmode="numeric">
                        <span class="do-muted">ετών</span>
                    </div>
                </div>
                <div class="do-card-body">
                    <div class="do-meta">
                        <div class="do-field">
                            <label>Ημερομηνία εισαγωγής</label>
                            <input type="date" data-field="admissionDate" value="${escapeHtml(data.admissionDate)}">
                            <div class="do-muted do-admission-meta">${escapeHtml([weekday(data.admissionDate), hospitalizationDay(data.admissionDate)].filter(Boolean).join(' · '))}</div>
                        </div>
                        <div class="do-field"><label>Περιστατικό</label><input data-field="incident" value="${escapeHtml(data.incident)}"></div>
                        <div class="do-field"><label>Θεράπων</label><input data-field="doctor" value="${escapeHtml(data.doctor)}"></div>
                    </div>

                    <div class="do-line">
                        <div class="do-line-title">Εργαστηριακά</div>
                        <textarea data-field="labs" placeholder="Σημαντικές εξετάσεις ή σημερινός έλεγχος">${escapeHtml(data.labs)}</textarea>
                    </div>

                    <div class="do-line">
                        <div class="do-line-title">Αντιπηκτική αγωγή</div>
                        <div class="do-anticoag">
                            <label style="white-space:nowrap;"><input type="checkbox" data-field="priorAnticoagulation" ${data.priorAnticoagulation ? 'checked' : ''} style="width:auto;"> Προ εισαγωγής</label>
                            <select data-field="anticoagulationKey"><option value="">-- Επιλογή --</option>${anticoagOptions}</select>
                            <select data-field="anticoagulationTiming">
                                <option value="">-- Λήψη --</option>
                                <option value="Πρωί" ${data.anticoagulationTiming === 'Πρωί' ? 'selected' : ''}>Πρωί</option>
                                <option value="Βράδυ" ${data.anticoagulationTiming === 'Βράδυ' ? 'selected' : ''}>Βράδυ</option>
                            </select>
                            <input type="date" data-field="anticoagulationStoppedDate" value="${escapeHtml(data.anticoagulationStoppedDate)}" title="Ημερομηνία διακοπής">
                        </div>
                    </div>

                    <div class="do-line">
                        <div class="do-line-title">Συννοσηρότητες</div>
                        <input data-field="comorbidities" value="${escapeHtml(data.comorbidities)}" placeholder="π.χ. ΣΔ, ΑΥ, ΚΜ">
                    </div>

                    <div class="do-line">
                        <div class="do-line-title">Μεταγγίσεις</div>
                        <div>
                            <div class="do-list do-transfusion-list">
                                ${(data.transfusions || []).map((item, index) => `
                                    <div class="do-item" data-index="${index}">
                                        <span>🩸</span>
                                        <input type="date" class="do-transfusion-date" value="${escapeHtml(item.date || '')}">
                                        <input class="do-transfusion-type" value="${escapeHtml(item.type || '')}" placeholder="π.χ. 1 μονάδα ΣΕ">
                                        <button type="button" class="do-icon-button do-remove-transfusion" title="Αφαίρεση">✕</button>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="do-add-transfusion" style="margin-top:5px;">
                                <input type="date" class="do-new-transfusion-date" value="${todayIso()}">
                                <input class="do-new-transfusion-type" placeholder="Τι μεταγγίστηκε">
                                <button type="button" class="do-icon-button do-add-transfusion-button">+ Προσθήκη</button>
                            </div>
                        </div>
                    </div>

                    <div class="do-line">
                        <div class="do-line-title">Εκκρεμότητες</div>
                        <div>
                            <div class="do-list do-pending-list">
                                ${(data.pending || []).map((item, index) => `
                                    <div class="do-pending-item ${item.done ? 'done' : ''}" data-index="${index}">
                                        <input type="checkbox" class="do-pending-done" ${item.done ? 'checked' : ''} style="width:auto;">
                                        <input type="text" class="do-pending-text" value="${escapeHtml(item.text || '')}">
                                        <button type="button" class="do-icon-button do-remove-pending" title="Αφαίρεση">✕</button>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="do-add-row" style="margin-top:5px;">
                                <input class="do-new-pending" placeholder="Νέα εκκρεμότητα">
                                <button type="button" class="do-icon-button do-add-pending">+ Προσθήκη</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    function getPatientDataFromCard(card) {
        return state.patients[card.dataset.pn];
    }

    function updateStats() {
        const doc = getDocument();
        const overlay = doc?.getElementById(OVERLAY_ID);
        if (!overlay) return;

        const patients = Object.values(state.patients);
        const pendingCount = patients.reduce((sum, patient) =>
            sum + (patient.pending || []).filter(item => !item.done).length,
        0);

        overlay.querySelector('[data-stat="patients"]').textContent = String(patients.length);
        overlay.querySelector('[data-stat="pending"]').textContent = String(pendingCount);
    }

    function bindCard(card) {
        const data = getPatientDataFromCard(card);
        if (!data) return;

        card.querySelectorAll('[data-field]').forEach(input => {
            const update = () => {
                const field = input.dataset.field;
                data[field] = input.type === 'checkbox'
                    ? input.checked
                    : input.value;
                saveState();

                if (field === 'admissionDate') {
                    card.querySelector('.do-admission-meta').textContent =
                        [weekday(input.value), hospitalizationDay(input.value)]
                            .filter(Boolean).join(' · ');
                }
            };
            input.addEventListener('input', update);
            input.addEventListener('change', update);
        });

        card.querySelectorAll('.do-pending-item').forEach(row => {
            const index = Number(row.dataset.index);
            const checkbox = row.querySelector('.do-pending-done');
            const text = row.querySelector('.do-pending-text');
            checkbox.onchange = () => {
                data.pending[index].done = checkbox.checked;
                row.classList.toggle('done', checkbox.checked);
                saveState();
                updateStats();
            };
            text.oninput = () => {
                data.pending[index].text = text.value;
                saveState();
            };
            row.querySelector('.do-remove-pending').onclick = () => {
                data.pending.splice(index, 1);
                saveState();
                render();
            };
        });

        const addPending = () => {
            const input = card.querySelector('.do-new-pending');
            const text = input.value.trim();
            if (!text) return;
            data.pending.push({ text, done: false });
            saveState();
            render();
        };
        card.querySelector('.do-add-pending').onclick = addPending;
        card.querySelector('.do-new-pending').onkeydown = event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                addPending();
            }
        };

        card.querySelectorAll('.do-item[data-index]').forEach(row => {
            const index = Number(row.dataset.index);
            row.querySelector('.do-transfusion-date').onchange = event => {
                data.transfusions[index].date = event.target.value;
                saveState();
            };
            row.querySelector('.do-transfusion-type').oninput = event => {
                data.transfusions[index].type = event.target.value;
                saveState();
            };
            row.querySelector('.do-remove-transfusion').onclick = () => {
                data.transfusions.splice(index, 1);
                saveState();
                render();
            };
        });

        card.querySelector('.do-add-transfusion-button').onclick = () => {
            const date = card.querySelector('.do-new-transfusion-date').value;
            const typeInput = card.querySelector('.do-new-transfusion-type');
            const type = typeInput.value.trim();
            if (!type) return;
            data.transfusions.push({ date, type });
            saveState();
            render();
        };
    }

    function render() {
        const doc = getDocument();
        const overlay = doc?.getElementById(OVERLAY_ID);
        if (!overlay) return;

        const patients = syncPatients();
        const grid = overlay.querySelector('.do-grid');
        grid.innerHTML = patients.length
            ? patients.map(patient => patientCard(patient)).join('')
            : '<div style="padding:30px;text-align:center;">Δεν βρέθηκαν ασθενείς στον θάλαμο.</div>';

        grid.querySelectorAll('.do-card').forEach(bindCard);
        overlay.querySelector('.do-notes textarea').value = state.notes || '';
        updateStats();
    }

    function findValueByLabels(doc, labels) {
        const normalizedLabels = labels.map(label => label.toLocaleLowerCase('el'));
        const candidates = [...doc.querySelectorAll('tr, .form-group, .row, div')];

        for (const candidate of candidates) {
            const text = (candidate.textContent || '').replace(/\s+/g, ' ').trim();
            const lower = text.toLocaleLowerCase('el');
            if (!normalizedLabels.some(label => lower.includes(label))) continue;

            const input = candidate.querySelector('input, textarea, select');
            if (input?.value) return String(input.value).trim();

            const cells = [...candidate.querySelectorAll(':scope > td, :scope > div, :scope > span')]
                .map(node => (node.textContent || '').replace(/\s+/g, ' ').trim())
                .filter(Boolean);
            if (cells.length > 1) return cells[cells.length - 1];
        }

        return '';
    }

    function normalizeDate(value) {
        const text = String(value || '').trim();
        let match = text.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/);
        if (match) return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
        match = text.match(/(\d{4})-(\d{2})-(\d{2})/);
        return match ? match[0] : '';
    }

    async function fetchPatientDetails(patient) {
        const url = new URL(
            '/modules/nursing/nursing-station-patient-informational.php',
            window.location.origin
        );
        url.searchParams.set('lang', 'gr');
        url.searchParams.set('pn', patient.encounterNr);
        url.searchParams.set('ward_nr', getWardNumber());
        url.searchParams.set('station', 'Ορθοπαιδική');

        const response = await fetch(url.href, {
            credentials: 'same-origin',
            cache: 'no-store'
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const html = await response.text();
        const parsed = new DOMParser().parseFromString(html, 'text/html');
        const bodyText = (parsed.body?.textContent || '').replace(/\s+/g, ' ');
        const ageMatch = bodyText.match(/\b(\d{1,3})\s*(?:ετών|έτη)\b/i);

        return {
            age: ageMatch?.[1] || '',
            admissionDate: normalizeDate(findValueByLabels(parsed, [
                'ημερομηνία εισαγωγής', 'ημ/νία εισαγωγής', 'εισαγωγή'
            ])),
            incident: findValueByLabels(parsed, [
                'περιστατικό', 'διάγνωση εισαγωγής', 'αιτία εισαγωγής'
            ]),
            doctor: findValueByLabels(parsed, [
                'θεράπων ιατρός', 'θεράπων', 'υπεύθυνος ιατρός'
            ])
        };
    }

    async function refreshFromCare() {
        const doc = getDocument();
        const overlay = doc?.getElementById(OVERLAY_ID);
        const status = overlay?.querySelector('.do-status');
        const patients = currentPatients();

        for (let index = 0; index < patients.length; index++) {
            const patient = patients[index];
            if (status) status.textContent = `Φόρτωση ${index + 1}/${patients.length}: ${patient.room}/${patient.bed}`;
            try {
                const details = await fetchPatientDetails(patient);
                const target = state.patients[patient.encounterNr];
                if (target) {
                    ['age', 'admissionDate', 'incident', 'doctor'].forEach(field => {
                        if (details[field]) target[field] = details[field];
                    });
                }
            } catch (error) {
                console.warn(`Daily overview patient ${patient.encounterNr}:`, error);
            }
            await new Promise(resolve => setTimeout(resolve, 120));
        }

        saveState();
        render();
        if (status) status.textContent = 'Η ενημέρωση ολοκληρώθηκε.';
    }

    function printablePatientCard(patient, index) {
        const pending = (patient.pending || []).filter(item => item.text);
        const transfusions = (patient.transfusions || []).filter(item => item.type);
        const anticoag = anticoagulationEntries().find(entry =>
            entry.key === patient.anticoagulationKey
        );
        const pieces = [];

        if (patient.admissionDate) pieces.push(`<div><b>Εισαγωγή:</b> ${escapeHtml(formatGreekDate(patient.admissionDate))} (${escapeHtml(hospitalizationDay(patient.admissionDate))})</div>`);
        if (patient.incident) pieces.push(`<div><b>Περιστατικό:</b> ${escapeHtml(patient.incident)}</div>`);
        if (patient.doctor) pieces.push(`<div><b>Θεράπων:</b> ${escapeHtml(patient.doctor)}</div>`);
        if (patient.labs) pieces.push(`<div><b>Εργαστηριακά:</b> ${escapeHtml(patient.labs)}</div>`);
        if (patient.priorAnticoagulation || anticoag) {
            pieces.push(`<div><b>Αντιπηκτική:</b> ${escapeHtml([
                anticoag?.title || '', patient.anticoagulationTiming || '',
                patient.anticoagulationStoppedDate ? `διακοπή ${formatGreekDate(patient.anticoagulationStoppedDate)}` : ''
            ].filter(Boolean).join(' · '))}</div>`);
        }
        if (patient.comorbidities) pieces.push(`<div><b>Συννοσηρότητες:</b> ${escapeHtml(patient.comorbidities)}</div>`);
        if (transfusions.length) pieces.push(`<div><b>Μεταγγίσεις:</b> ${transfusions.map(item => `${formatGreekDate(item.date)} ${item.type}`).map(escapeHtml).join(' · ')}</div>`);
        if (pending.length) pieces.push(`<div><b>Εκκρεμότητες:</b><ul>${pending.map(item => `<li class="${item.done ? 'done' : ''}">${item.done ? '☑' : '☐'} ${escapeHtml(item.text)}</li>`).join('')}</ul></div>`);

        return `
            <section class="print-card ${index > 0 && index % 8 === 0 ? 'page-break' : ''}">
                <h3>${escapeHtml(patient.room)}/${escapeHtml(patient.bed)} — ${escapeHtml(patient.name)} ${patient.age ? `<small>${escapeHtml(patient.age)} ετών</small>` : ''}</h3>
                ${pieces.join('') || '<div class="muted">Χωρίς πρόσθετες καταχωρήσεις.</div>'}
            </section>
        `;
    }

    function printOverview() {
        const patients = Object.values(state.patients);
        const popup = window.open('', '_blank');
        if (!popup) {
            alert('Ο browser απέκλεισε το παράθυρο εκτύπωσης.');
            return;
        }

        popup.document.open();
        popup.document.write(`<!doctype html><html lang="el"><head><meta charset="utf-8"><title>Ημερήσια Επισκόπηση ${formatGreekDate(todayIso())}</title>
            <style>
                @page { size:A4 landscape; margin:6mm; }
                * { box-sizing:border-box; }
                body { margin:0;font-family:Arial,sans-serif;color:#111;font-size:7pt; }
                header { display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #333;padding-bottom:3mm;margin-bottom:3mm; }
                h1 { font-size:13pt;margin:0 0 1mm; }
                .summary { max-width:55%;white-space:pre-wrap;font-size:7.5pt; }
                .grid { display:grid;grid-template-columns:repeat(4,1fr);gap:2.5mm;align-items:start; }
                .print-card { border:0.35mm solid #777;border-radius:1.5mm;padding:2.2mm;min-height:82mm;break-inside:avoid;overflow:hidden; }
                .print-card.page-break { break-before:page; }
                h3 { font-size:9pt;margin:0 0 1.5mm;border-bottom:0.25mm solid #aaa;padding-bottom:1mm; }
                h3 small { float:right;font-weight:normal;font-size:7pt; }
                .print-card div { margin:0 0 1mm;line-height:1.18; }
                ul { margin:1mm 0 0;padding-left:4mm; }
                li { margin-bottom:.6mm; }
                li.done { text-decoration:line-through;color:#666; }
                .muted { color:#777; }
            </style></head><body>
            <header><div><h1>Ασκληπιός — Ημερήσια Επισκόπηση</h1><div>${formatGreekDate(todayIso())} · Θάλαμος ${escapeHtml(getWardNumber())} · ${patients.length} ασθενείς</div></div><div class="summary"><b>Σημειώσεις ημέρας</b><br>${escapeHtml(state.notes || '—')}</div></header>
            <main class="grid">${patients.map(printablePatientCard).join('')}</main>
            <script>window.addEventListener('load',()=>setTimeout(()=>window.print(),150));<\/script>
            </body></html>`);
        popup.document.close();
    }

    function open() {
        const doc = getDocument();
        if (!doc?.body) return;

        state = loadState();
        syncPatients();
        ensureStyle(doc);
        doc.getElementById(OVERLAY_ID)?.remove();

        const overlay = doc.createElement('div');
        overlay.id = OVERLAY_ID;
        overlay.innerHTML = `
            <div class="do-header">
                <div><b style="font-size:18px;">Ασκληπιός Helper — Ημερήσια Επισκόπηση</b><div class="do-muted" style="color:#aed6f1;">Όλοι οι ασθενείς του θαλάμου σε μία οθόνη</div></div>
                <div style="display:flex;align-items:center;gap:10px;">
                    <span class="do-status"></span>
                    <div class="do-header-actions">
                        <button type="button" class="do-primary" id="do-refresh">Ενημέρωση από Ασκληπιό</button>
                        <button type="button" class="do-primary" id="do-print">Εκτύπωση 1–2 Α4</button>
                        <button type="button" class="do-primary" id="do-close">Κλείσιμο</button>
                    </div>
                </div>
            </div>
            <div class="do-shell">
                <main class="do-main"><div class="do-grid"></div></main>
                <aside class="do-sidebar">
                    <div class="do-stat"><span>Σήμερα</span><strong style="font-size:17px;">${formatGreekDate(todayIso())}</strong><div>${escapeHtml(weekday(todayIso()))}</div></div>
                    <div class="do-stat"><span>Συνολικοί ασθενείς</span><strong data-stat="patients">0</strong></div>
                    <div class="do-stat"><span>Εκκρεμότητες</span><strong data-stat="pending">0</strong></div>
                    <div class="do-notes"><b>Σημειώσεις ημέρας</b><textarea placeholder="Στρογγυλή, χειρουργεία, φυσικοθεραπείες..."></textarea><div class="do-muted" style="margin-top:6px;">Οι σημειώσεις διατηρούνται μόνο στην τρέχουσα καρτέλα του browser.</div></div>
                </aside>
            </div>
        `;
        doc.body.appendChild(overlay);

        overlay.querySelector('#do-close').onclick = () => overlay.remove();
        overlay.querySelector('#do-refresh').onclick = refreshFromCare;
        overlay.querySelector('#do-print').onclick = printOverview;
        overlay.querySelector('.do-notes textarea').oninput = event => {
            state.notes = event.target.value;
            saveState();
        };

        render();
    }

    A.dailyOverview = {
        open,
        refreshFromCare,
        print: printOverview,
        getState: () => clone(state)
    };

    A.modules.dailyOverview = {
        loaded: true,
        version: '0.12.0'
    };

    console.log('Asklipios daily overview module loaded');
})();
