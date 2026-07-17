/*
 * Asklipios — Clinical Presets & Surgery Templates Settings
 * Version 0.11.0
 */

(function () {
    'use strict';

    if (window !== window.top) return;

    const A = window.Asklipios;

    if (!A?.settingsUi || !A?.registry || !A?.localData || !A?.clinicalCatalog) {
        throw new Error(
            'Asklipios clinical settings dependencies are missing.'
        );
    }

    A.modules = A.modules || {};

    const STYLE_ID = 'asklipios-clinical-settings-style';

    const state = {
        presetKey: '',
        presetMode: 'edit',
        presetDraft: null,
        presetSearch: '',

        surgeryKey: '',
        surgeryMode: 'edit',
        surgeryDraft: null,
        surgerySearch: '',

        diagnosisResults: [],
        medicalActResults: [],
        diagnosisSearchTimer: null,
        medicalActSearchTimer: null,
        diagnosisAbortController: null,
        medicalActAbortController: null,

        doctorKey: '',
        doctorMode: 'edit',
        doctorDraft: null,
        doctorSearch: ''
    };

    function clone(value) {
        return A.localData.clone(value);
    }

    function getNursingFrame() {
        for (let i = 0; i < window.frames.length; i++) {
            try {
                if (
                    window.frames[i].location.href.includes(
                        'nursing-station.php'
                    )
                ) {
                    return window.frames[i];
                }
            } catch {
                // Ignore cross-origin frames.
            }
        }

        return null;
    }

    function getDocument() {
        return getNursingFrame()?.document || null;
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function sortedKeys(object) {
        return Object.keys(object || {}).sort(
            (a, b) => a.localeCompare(b, 'el')
        );
    }

    function ensureStyle(doc) {
        if (!doc || doc.getElementById(STYLE_ID)) return;

        const style = doc.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            #asklipios-settings-overlay .ask-clinical-grid {
                display:grid;
                grid-template-columns:285px minmax(0,1fr);
                gap:12px;
                min-height:610px;
            }

            #asklipios-settings-overlay .ask-clinical-list {
                height:465px;
                overflow:auto;
                border:1px solid #c9ced1;
                background:#fafafa;
                margin-top:8px;
            }

            #asklipios-settings-overlay .ask-clinical-item {
                width:100%;
                display:block;
                border:0;
                border-bottom:1px solid #e2e5e7;
                background:transparent;
                text-align:left;
                padding:8px;
                cursor:pointer;
            }

            #asklipios-settings-overlay .ask-clinical-item:hover {
                background:#edf4f8;
            }

            #asklipios-settings-overlay .ask-clinical-item.active {
                background:#d6eaf8;
                font-weight:bold;
            }

            #asklipios-settings-overlay .ask-clinical-columns {
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:10px;
                margin-top:10px;
            }

            #asklipios-settings-overlay .ask-clinical-section {
                border:1px solid #c7cdd1;
                border-radius:5px;
                padding:9px;
                background:#fafafa;
            }

            #asklipios-settings-overlay .ask-clinical-row {
                border:1px solid #c3c9cd;
                border-radius:5px;
                padding:7px;
                background:#fff;
                margin-top:7px;
            }

            #asklipios-settings-overlay .ask-clinical-row-main {
                display:grid;
                grid-template-columns:70px minmax(170px,1fr) auto auto;
                gap:6px;
                align-items:center;
            }

            #asklipios-settings-overlay .ask-clinical-row details {
                margin-top:6px;
            }

            #asklipios-settings-overlay .ask-clinical-row summary {
                cursor:pointer;
                color:#5d6d7e;
                font-size:12px;
            }

            #asklipios-settings-overlay .ask-clinical-advanced-grid {
                display:grid;
                grid-template-columns:120px 1fr 1fr;
                gap:6px;
                margin-top:6px;
            }

            #asklipios-settings-overlay .ask-template-editor textarea,
            #asklipios-settings-overlay .ask-preset-editor textarea {
                width:100%;
                resize:vertical;
                min-height:72px;
            }

            #asklipios-settings-overlay .ask-clinical-results {
                max-height:230px;
                overflow:auto;
                border:1px solid #b9c0c4;
                border-radius:4px;
                margin-top:6px;
                background:#fff;
            }

            #asklipios-settings-overlay .ask-clinical-results-table {
                width:100%;
                border-collapse:collapse;
                table-layout:fixed;
                font-size:12px;
            }

            #asklipios-settings-overlay .ask-clinical-results-table th,
            #asklipios-settings-overlay .ask-clinical-results-table td {
                border-bottom:1px solid #d9dddf;
                padding:6px;
                text-align:left;
                vertical-align:middle;
                overflow-wrap:anywhere;
            }

            #asklipios-settings-overlay .ask-clinical-results-table th {
                background:#eef2f4;
            }

            #asklipios-settings-overlay .ask-clinical-result-row {
                cursor:pointer;
            }

            #asklipios-settings-overlay .ask-clinical-result-row:hover {
                background:#edf4f8;
            }

            #asklipios-settings-overlay .ask-clinical-result-row.selected {
                background:#d5f5e3;
            }

            #asklipios-settings-overlay .ask-doctor-template-preview {
                white-space:pre-wrap;
                background:#f5f7f8;
                border:1px solid #c9ced1;
                border-radius:5px;
                padding:10px;
                min-height:70px;
            }

            @media (max-width: 950px) {
                #asklipios-settings-overlay .ask-clinical-grid,
                #asklipios-settings-overlay .ask-clinical-columns {
                    grid-template-columns:1fr;
                }
            }
        `;

        doc.head.appendChild(style);
    }

    function setStatus(message, type = 'info') {
        A.settingsUi.setStatus(message, type);
    }

    function getModificationState(section, key) {
        const localState = A.registry.getState();
        const patch = localState.mapPatches?.[section] || {
            upserts: {},
            deleted: []
        };

        const factory = A.registry.getFactorySection(section) || {};

        return {
            isFactory: Object.prototype.hasOwnProperty.call(factory, key),
            isModified: Object.prototype.hasOwnProperty.call(
                patch.upserts || {},
                key
            ),
            isCustom: !Object.prototype.hasOwnProperty.call(factory, key)
        };
    }

    function dedupeCatalog(items, keyBuilder) {
        const map = new Map();

        items.forEach(item => {
            const key = keyBuilder(item);
            if (!map.has(key)) map.set(key, clone(item));
        });

        return [...map.values()];
    }

    function getDiagnosisCatalog() {
        const sections = [
            A.registry.getFactorySection('DIAGNOSIS_OPTIONS') || {},
            A.data.DIAGNOSIS_OPTIONS || {}
        ];

        return dedupeCatalog(
            sections.flatMap(section => Object.values(section).flat()),
            item => `${item.id}|${item.code}|${item.name}`
        ).sort((a, b) =>
            `${a.code} ${a.name}`.localeCompare(
                `${b.code} ${b.name}`,
                'el'
            )
        );
    }

    function getMedicalActCatalog() {
        const sections = [
            A.registry.getFactorySection('MEDICAL_ACT_OPTIONS') || {},
            A.data.MEDICAL_ACT_OPTIONS || {}
        ];

        return dedupeCatalog(
            sections.flatMap(section => Object.values(section).flat()),
            item => `${item.id}|${item.code}|${item.name}`
        ).sort((a, b) =>
            `${a.code} ${a.name}`.localeCompare(
                `${b.code} ${b.name}`,
                'el'
            )
        );
    }

    function createPresetDraft(key = '') {
        return {
            name: key,
            course: A.data.MEDICAL_CARD_PRESETS?.[key]?.course || '',
            therapy: A.data.MEDICAL_CARD_PRESETS?.[key]?.therapy || '',
            discharge: A.data.PRESET_DISCHARGE_TEXTS?.[key] || '',
            surgeryReport: A.data.SURGERY_DESCRIPTIONS?.[key] || '',
            diagnoses: clone(A.data.DIAGNOSIS_OPTIONS?.[key] || []),
            medicalActs: clone(A.data.MEDICAL_ACT_OPTIONS?.[key] || [])
        };
    }

    function ensurePresetSelection() {
        if (state.presetDraft) return;

        const firstKey = sortedKeys(A.data.MEDICAL_CARD_PRESETS)[0] || '';
        state.presetKey = firstKey;
        state.presetMode = firstKey ? 'edit' : 'new';
        state.presetDraft = firstKey
            ? createPresetDraft(firstKey)
            : createPresetDraft('');
    }

    function updatePresetDraftFromDom() {
        const doc = getDocument();
        if (!doc || !state.presetDraft) return;

        state.presetDraft.name =
            doc.getElementById('ask-preset-name')?.value.trim() || '';
        state.presetDraft.course =
            doc.getElementById('ask-preset-course')?.value || '';
        state.presetDraft.therapy =
            doc.getElementById('ask-preset-therapy')?.value || '';
        state.presetDraft.discharge =
            doc.getElementById('ask-preset-discharge')?.value || '';

        state.presetDraft.diagnoses = [
            ...doc.querySelectorAll('.ask-diagnosis-row')
        ].map(row => ({
            ...(state.presetDraft.diagnoses?.[Number(row.dataset.index)] || {}),
            id: Number(row.querySelector('.ask-diagnosis-id')?.value || 0),
            code: row.querySelector('.ask-diagnosis-code')?.value.trim() || '',
            name: row.querySelector('.ask-diagnosis-name')?.value.trim() || '',
            course: row.querySelector('.ask-diagnosis-course')?.value || '',
            therapy: row.querySelector('.ask-diagnosis-therapy')?.value || '',
            default: row.querySelector('.ask-diagnosis-default')?.checked === true
        }));

        state.presetDraft.medicalActs = [
            ...doc.querySelectorAll('.ask-medact-row')
        ].map(row => ({
            ...(state.presetDraft.medicalActs?.[Number(row.dataset.index)] || {}),
            id: Number(row.querySelector('.ask-medact-id')?.value || 0),
            code: row.querySelector('.ask-medact-code')?.value.trim() || '',
            name: row.querySelector('.ask-medact-name')?.value.trim() || '',
            requireLr: row.querySelector('.ask-medact-lr')?.checked === true,
            default: row.querySelector('.ask-medact-default')?.checked === true
        }));
    }

    function enforceSingleDefault(selector, changed) {
        const doc = getDocument();
        if (!changed.checked) return;

        doc?.querySelectorAll(selector).forEach(input => {
            if (input !== changed) input.checked = false;
        });
    }

    function renderDiagnosisRows() {
        const doc = getDocument();
        const box = doc?.getElementById('ask-diagnosis-rows');
        if (!box) return;

        const list = state.presetDraft?.diagnoses || [];

        box.innerHTML = list.length
            ? list.map((item, index) => `
                <div class="ask-clinical-row ask-diagnosis-row" data-index="${index}">
                    <div class="ask-clinical-row-main">
                        <input class="ask-input ask-diagnosis-code" value="${escapeHtml(item.code || '')}" placeholder="ICD-10">
                        <input class="ask-input ask-diagnosis-name" value="${escapeHtml(item.name || '')}" placeholder="Περιγραφή διάγνωσης">
                        <label style="white-space:nowrap;">
                            <input type="checkbox" class="ask-diagnosis-default" ${item.default ? 'checked' : ''}>
                            Προεπιλογή
                        </label>
                        <button type="button" class="ask-btn ask-btn-danger ask-diagnosis-delete">✕</button>
                    </div>
                    <details ${Number(item.id || 0) === 0 ? 'open' : ''}>
                        <summary>Προχωρημένα στοιχεία</summary>
                        <div class="ask-clinical-advanced-grid">
                            <label>ID<input type="number" class="ask-input ask-diagnosis-id" value="${Number(item.id || 0)}"></label>
                            <label>Ειδική πορεία<input class="ask-input ask-diagnosis-course" value="${escapeHtml(item.course || '')}"></label>
                            <label>Ειδική θεραπεία<input class="ask-input ask-diagnosis-therapy" value="${escapeHtml(item.therapy || '')}"></label>
                        </div>
                    </details>
                </div>
            `).join('')
            : '<div class="ask-muted" style="padding:12px;">Δεν υπάρχουν διαγνώσεις.</div>';

        box.querySelectorAll('.ask-diagnosis-delete').forEach(button => {
            button.onclick = () => {
                updatePresetDraftFromDom();
                const index = Number(button.closest('.ask-diagnosis-row')?.dataset.index);
                state.presetDraft.diagnoses.splice(index, 1);
                renderDiagnosisRows();
                renderClinicalSearchResults('diagnosis');
            };
        });

        box.querySelectorAll('.ask-diagnosis-default').forEach(input => {
            input.onchange = () =>
                enforceSingleDefault('.ask-diagnosis-default', input);
        });
    }

    function renderMedicalActRows() {
        const doc = getDocument();
        const box = doc?.getElementById('ask-medact-rows');
        if (!box) return;

        const list = state.presetDraft?.medicalActs || [];

        box.innerHTML = list.length
            ? list.map((item, index) => `
                <div class="ask-clinical-row ask-medact-row" data-index="${index}">
                    <div class="ask-clinical-row-main">
                        <input class="ask-input ask-medact-code" value="${escapeHtml(item.code || '')}" placeholder="Κωδικός πράξης">
                        <input class="ask-input ask-medact-name" value="${escapeHtml(item.name || '')}" placeholder="Περιγραφή ιατρικής πράξης">
                        <label style="white-space:nowrap;">
                            <input type="checkbox" class="ask-medact-default" ${item.default ? 'checked' : ''}>
                            Προεπιλογή
                        </label>
                        <button type="button" class="ask-btn ask-btn-danger ask-medact-delete">✕</button>
                    </div>
                    <details ${Number(item.id || 0) === 0 ? 'open' : ''}>
                        <summary>Προχωρημένα στοιχεία</summary>
                        <div class="ask-clinical-advanced-grid" style="grid-template-columns:140px 1fr;">
                            <label>ID<input type="number" class="ask-input ask-medact-id" value="${Number(item.id || 0)}"></label>
                            <label style="padding-top:20px;">
                                <input type="checkbox" class="ask-medact-lr" ${item.requireLr ? 'checked' : ''}>
                                Απαιτείται πλευρά
                            </label>
                        </div>
                    </details>
                </div>
            `).join('')
            : '<div class="ask-muted" style="padding:12px;">Δεν υπάρχουν ιατρικές πράξεις.</div>';

        box.querySelectorAll('.ask-medact-delete').forEach(button => {
            button.onclick = () => {
                updatePresetDraftFromDom();
                const index = Number(button.closest('.ask-medact-row')?.dataset.index);
                state.presetDraft.medicalActs.splice(index, 1);
                renderMedicalActRows();
                renderClinicalSearchResults('medicalAct');
            };
        });

        box.querySelectorAll('.ask-medact-default').forEach(input => {
            input.onchange = () =>
                enforceSingleDefault('.ask-medact-default', input);
        });
    }

    function clinicalItemKey(item) {
        return `${Number(item?.id || 0)}|${String(item?.code || '')}`;
    }

    function getClinicalResultState(kind) {
        return kind === 'diagnosis'
            ? state.diagnosisResults
            : state.medicalActResults;
    }

    function getPresetClinicalItems(kind) {
        return kind === 'diagnosis'
            ? (state.presetDraft?.diagnoses || [])
            : (state.presetDraft?.medicalActs || []);
    }

    function isClinicalItemSelected(kind, item) {
        const key = clinicalItemKey(item);
        return getPresetClinicalItems(kind)
            .some(candidate => clinicalItemKey(candidate) === key);
    }

    function setClinicalSearchStatus(kind, message, type = 'info') {
        const doc = getDocument();
        const box = doc?.getElementById(
            kind === 'diagnosis'
                ? 'ask-diagnosis-live-status'
                : 'ask-medact-live-status'
        );
        if (!box) return;

        const colors = {
            info: '#f4f6f7',
            success: '#d5f5e3',
            warning: '#fcf3cf',
            error: '#f8d7da'
        };

        box.style.background = colors[type] || colors.info;
        box.textContent = message;
    }

    function renderClinicalSearchResults(kind) {
        const doc = getDocument();
        const isDiagnosis = kind === 'diagnosis';
        const container = doc?.getElementById(
            isDiagnosis
                ? 'ask-diagnosis-live-results'
                : 'ask-medact-live-results'
        );
        if (!container) return;

        const results = getClinicalResultState(kind);

        if (!results.length) {
            container.innerHTML = `
                <div class="ask-muted" style="padding:12px;">
                    Γράψε τουλάχιστον 2 χαρακτήρες για αναζήτηση στον Ασκληπιό.
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table class="ask-clinical-results-table">
                <colgroup>
                    <col style="width:42px;">
                    <col style="width:115px;">
                    <col>
                </colgroup>
                <thead>
                    <tr>
                        <th style="text-align:center;">✓</th>
                        <th>Κωδικός</th>
                        <th>Περιγραφή</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map((item, index) => {
                        const selected = isClinicalItemSelected(kind, item);
                        return `
                            <tr
                                class="ask-clinical-result-row ${selected ? 'selected' : ''}"
                                data-kind="${kind}"
                                data-index="${index}"
                                title="Διπλό κλικ για επιλογή ή αποεπιλογή"
                            >
                                <td style="text-align:center;">
                                    <input
                                        type="checkbox"
                                        class="ask-clinical-result-check"
                                        data-kind="${kind}"
                                        data-index="${index}"
                                        ${selected ? 'checked' : ''}
                                    >
                                </td>
                                <td>${escapeHtml(item.displayCode || item.code || '')}</td>
                                <td>${escapeHtml(item.name || '')}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;

        container.querySelectorAll('.ask-clinical-result-check').forEach(input => {
            input.onchange = () => {
                toggleClinicalResult(
                    input.dataset.kind,
                    Number(input.dataset.index),
                    input.checked
                );
            };
        });

        container.querySelectorAll('.ask-clinical-result-row').forEach(row => {
            row.ondblclick = event => {
                if (event.target.closest('input, button, a')) return;
                toggleClinicalResult(
                    row.dataset.kind,
                    Number(row.dataset.index)
                );
            };
        });
    }

    function toggleClinicalResult(kind, index, forceSelected = null) {
        updatePresetDraftFromDom();

        const results = getClinicalResultState(kind);
        const item = results[index];
        if (!item) return;

        const list = getPresetClinicalItems(kind);
        const key = clinicalItemKey(item);
        const currentIndex = list.findIndex(
            candidate => clinicalItemKey(candidate) === key
        );
        const selected = currentIndex >= 0;
        const shouldSelect = forceSelected === null
            ? !selected
            : Boolean(forceSelected);

        if (shouldSelect && !selected) {
            const normalized = clone(item);
            normalized.default = list.length === 0;

            if (kind === 'diagnosis') {
                normalized.course = normalized.course || '';
                normalized.therapy = normalized.therapy || '';
                state.presetDraft.diagnoses.push(normalized);
                renderDiagnosisRows();
            } else {
                normalized.requireLr = normalized.requireLr === true;
                state.presetDraft.medicalActs.push(normalized);
                renderMedicalActRows();
            }
        } else if (!shouldSelect && selected) {
            list.splice(currentIndex, 1);

            if (kind === 'diagnosis') {
                renderDiagnosisRows();
            } else {
                renderMedicalActRows();
            }
        }

        renderClinicalSearchResults(kind);
    }

    async function runClinicalSearch(kind) {
        const doc = getDocument();
        const isDiagnosis = kind === 'diagnosis';
        const input = doc?.getElementById(
            isDiagnosis
                ? 'ask-diagnosis-live-search'
                : 'ask-medact-live-search'
        );
        const query = String(input?.value || '').trim();

        if (query.length < 2) {
            if (isDiagnosis) {
                state.diagnosisResults = [];
            } else {
                state.medicalActResults = [];
            }
            renderClinicalSearchResults(kind);
            setClinicalSearchStatus(
                kind,
                'Γράψε τουλάχιστον 2 χαρακτήρες.',
                'info'
            );
            return;
        }

        const controllerKey = isDiagnosis
            ? 'diagnosisAbortController'
            : 'medicalActAbortController';

        state[controllerKey]?.abort();
        const controller = new AbortController();
        state[controllerKey] = controller;

        setClinicalSearchStatus(kind, 'Αναζήτηση στον Ασκληπιό…', 'info');

        try {
            const results = isDiagnosis
                ? await A.clinicalCatalog.searchDiagnoses(
                    query,
                    { signal: controller.signal }
                )
                : await A.clinicalCatalog.searchMedicalActs(
                    query,
                    { signal: controller.signal }
                );

            if (controller.signal.aborted) return;

            if (isDiagnosis) {
                state.diagnosisResults = results;
            } else {
                state.medicalActResults = results;
            }

            renderClinicalSearchResults(kind);
            setClinicalSearchStatus(
                kind,
                results.length
                    ? `${results.length} αποτελέσματα.`
                    : 'Δεν βρέθηκαν αποτελέσματα.',
                results.length ? 'success' : 'warning'
            );
        } catch (error) {
            if (error?.name === 'AbortError') return;

            if (isDiagnosis) {
                state.diagnosisResults = [];
            } else {
                state.medicalActResults = [];
            }

            renderClinicalSearchResults(kind);
            setClinicalSearchStatus(kind, error.message, 'error');
        }
    }

    function scheduleClinicalSearch(kind) {
        const timerKey = kind === 'diagnosis'
            ? 'diagnosisSearchTimer'
            : 'medicalActSearchTimer';

        clearTimeout(state[timerKey]);
        state[timerKey] = setTimeout(
            () => runClinicalSearch(kind),
            350
        );
    }

    function addManualItem(kind) {
        updatePresetDraftFromDom();

        if (kind === 'diagnosis') {
            state.presetDraft.diagnoses.push({
                id: 0,
                code: '',
                name: '',
                default: false,
                course: '',
                therapy: ''
            });
            renderDiagnosisRows();
        } else {
            state.presetDraft.medicalActs.push({
                id: 0,
                code: '',
                name: '',
                requireLr: true,
                default: false
            });
            renderMedicalActRows();
        }
    }

    function validatePresetDraft() {
        updatePresetDraftFromDom();
        const draft = state.presetDraft;

        if (!draft.name) {
            throw new Error('Το όνομα του preset είναι υποχρεωτικό.');
        }

        for (const [index, diagnosis] of draft.diagnoses.entries()) {
            if (!diagnosis.id || !diagnosis.code || !diagnosis.name) {
                throw new Error(`Η διάγνωση #${index + 1} χρειάζεται ID, κωδικό και περιγραφή.`);
            }
        }

        for (const [index, act] of draft.medicalActs.entries()) {
            if (!act.id || !act.code || !act.name) {
                throw new Error(`Η ιατρική πράξη #${index + 1} χρειάζεται ID, κωδικό και περιγραφή.`);
            }
        }

        return clone(draft);
    }

    function writePresetSection(section, key, value, empty = false) {
        if (empty) {
            A.registry.deleteMapItem(section, key);
        } else {
            A.registry.setMapItem(section, key, value);
        }
    }

    function savePreset() {
        const draft = validatePresetDraft();
        const oldKey = state.presetKey;
        const newKey = draft.name;

        if (
            newKey !== oldKey &&
            Object.prototype.hasOwnProperty.call(
                A.data.MEDICAL_CARD_PRESETS || {},
                newKey
            )
        ) {
            throw new Error(`Υπάρχει ήδη preset με όνομα "${newKey}".`);
        }

        A.localData.createBackup();

        writePresetSection('MEDICAL_CARD_PRESETS', newKey, {
            course: draft.course,
            therapy: draft.therapy
        });
        writePresetSection('DIAGNOSIS_OPTIONS', newKey, draft.diagnoses);
        writePresetSection('MEDICAL_ACT_OPTIONS', newKey, draft.medicalActs);
        writePresetSection(
            'PRESET_DISCHARGE_TEXTS',
            newKey,
            draft.discharge,
            !draft.discharge.trim()
        );

        if (state.presetMode === 'new') {
            writePresetSection(
                'SURGERY_DESCRIPTIONS',
                newKey,
                draft.surgeryReport,
                !draft.surgeryReport.trim()
            );
        } else if (oldKey && oldKey !== newKey) {
            const linkedSurgeryReport =
                A.data.SURGERY_DESCRIPTIONS?.[oldKey] || '';

            writePresetSection(
                'SURGERY_DESCRIPTIONS',
                newKey,
                linkedSurgeryReport,
                !linkedSurgeryReport.trim()
            );
        }

        if (state.presetMode === 'edit' && oldKey && oldKey !== newKey) {
            for (const section of [
                'MEDICAL_CARD_PRESETS',
                'DIAGNOSIS_OPTIONS',
                'MEDICAL_ACT_OPTIONS',
                'PRESET_DISCHARGE_TEXTS',
                'SURGERY_DESCRIPTIONS'
            ]) {
                A.registry.deleteMapItem(section, oldKey);
            }
        }

        state.presetKey = newKey;
        state.presetMode = 'edit';
        state.presetDraft = createPresetDraft(newKey);
        refreshRuntimeControls();
        renderPresetsTab();
        setStatus(`Το preset "${newKey}" αποθηκεύτηκε τοπικά.`, 'success');
    }

    function deletePreset() {
        if (!state.presetKey || state.presetMode !== 'edit') return;
        const key = state.presetKey;

        if (!confirm(`Να διαγραφεί το preset "${key}";`)) return;
        A.localData.createBackup();

        for (const section of [
            'MEDICAL_CARD_PRESETS',
            'DIAGNOSIS_OPTIONS',
            'MEDICAL_ACT_OPTIONS',
            'PRESET_DISCHARGE_TEXTS',
            'SURGERY_DESCRIPTIONS'
        ]) {
            A.registry.deleteMapItem(section, key);
        }

        const next = sortedKeys(A.data.MEDICAL_CARD_PRESETS)[0] || '';
        state.presetKey = next;
        state.presetMode = next ? 'edit' : 'new';
        state.presetDraft = next ? createPresetDraft(next) : createPresetDraft('');
        refreshRuntimeControls();
        renderPresetsTab();
        setStatus(`Το preset "${key}" αφαιρέθηκε τοπικά.`, 'success');
    }

    function restorePreset() {
        if (!state.presetKey) return;
        const factory = A.registry.getFactorySection('MEDICAL_CARD_PRESETS') || {};
        if (!Object.prototype.hasOwnProperty.call(factory, state.presetKey)) {
            setStatus('Το συγκεκριμένο preset δεν έχει εργοστασιακή έκδοση.', 'warning');
            return;
        }

        if (!confirm(`Να επανέλθει το "${state.presetKey}" στην εργοστασιακή μορφή;`)) return;
        A.localData.createBackup();

        for (const section of [
            'MEDICAL_CARD_PRESETS',
            'DIAGNOSIS_OPTIONS',
            'MEDICAL_ACT_OPTIONS',
            'PRESET_DISCHARGE_TEXTS',
            'SURGERY_DESCRIPTIONS'
        ]) {
            A.registry.restoreMapItem(section, state.presetKey);
        }

        state.presetDraft = createPresetDraft(state.presetKey);
        refreshRuntimeControls();
        renderPresetsTab();
        setStatus('Το preset επανήλθε στην εργοστασιακή μορφή.', 'success');
    }

    function resetAllPresets() {
        if (!confirm('Να διαγραφούν όλες οι τοπικές αλλαγές των presets;')) return;
        A.localData.createBackup();
        for (const section of [
            'MEDICAL_CARD_PRESETS',
            'DIAGNOSIS_OPTIONS',
            'MEDICAL_ACT_OPTIONS',
            'PRESET_DISCHARGE_TEXTS',
            'SURGERY_DESCRIPTIONS'
        ]) {
            A.registry.resetSection(section);
        }

        const first = sortedKeys(A.data.MEDICAL_CARD_PRESETS)[0] || '';
        state.presetKey = first;
        state.presetMode = first ? 'edit' : 'new';
        state.presetDraft = first ? createPresetDraft(first) : createPresetDraft('');
        refreshRuntimeControls();
        renderPresetsTab();
        setStatus('Τα presets επανήλθαν στις εργοστασιακές τιμές.', 'success');
    }

    function renderPresetList() {
        const doc = getDocument();
        const list = doc?.getElementById('ask-preset-list');
        if (!list) return;

        const query = state.presetSearch.trim().toLocaleLowerCase('el');
        const keys = sortedKeys(A.data.MEDICAL_CARD_PRESETS).filter(key =>
            key.toLocaleLowerCase('el').includes(query)
        );

        list.innerHTML = keys.length
            ? keys.map(key => {
                const mod = getModificationState('MEDICAL_CARD_PRESETS', key);
                const badge = mod.isCustom ? 'Νέο' : mod.isModified ? 'Τροποποιημένο' : '';
                return `<button type="button" class="ask-clinical-item ${state.presetMode === 'edit' && key === state.presetKey ? 'active' : ''}" data-key="${escapeHtml(key)}">${escapeHtml(key)}${badge ? `<span class="ask-muted"> — ${badge}</span>` : ''}</button>`;
            }).join('')
            : '<div class="ask-muted" style="padding:12px;">Δεν βρέθηκαν presets.</div>';

        list.querySelectorAll('.ask-clinical-item').forEach(button => {
            button.onclick = () => {
                state.presetKey = button.dataset.key;
                state.presetMode = 'edit';
                state.presetDraft = createPresetDraft(state.presetKey);
                renderPresetsTab();
            };
        });
    }

    function renderPresetsTab() {
        const doc = getDocument();
        const content = doc?.getElementById('asklipios-settings-content');
        if (!content) return;
        ensureStyle(doc);
        ensurePresetSelection();

        const mod = state.presetMode === 'edit'
            ? getModificationState('MEDICAL_CARD_PRESETS', state.presetKey)
            : { isFactory: false, isModified: false, isCustom: true };

        content.innerHTML = `
            <div class="ask-clinical-grid">
                <div class="ask-card">
                    <div class="ask-editor-toolbar">
                        <button type="button" id="ask-new-preset" class="ask-btn ask-btn-primary">+ Νέο</button>
                        <button type="button" id="ask-duplicate-preset" class="ask-btn">Αντιγραφή</button>
                    </div>
                    <input id="ask-preset-search" class="ask-input" placeholder="Αναζήτηση preset" value="${escapeHtml(state.presetSearch)}">
                    <div id="ask-preset-list" class="ask-clinical-list"></div>
                    <button type="button" id="ask-reset-presets" class="ask-btn ask-btn-danger" style="width:100%;margin-top:10px;">Επαναφορά όλων των presets</button>
                </div>

                <div class="ask-card ask-preset-editor">
                    <div class="ask-editor-toolbar">
                        <button type="button" id="ask-save-preset" class="ask-btn ask-btn-success">Αποθήκευση preset</button>
                        <button type="button" id="ask-delete-preset" class="ask-btn ask-btn-danger" ${state.presetMode === 'new' ? 'disabled' : ''}>Διαγραφή</button>
                        <button type="button" id="ask-restore-preset" class="ask-btn" ${state.presetMode === 'edit' && mod.isFactory ? '' : 'disabled'}>Επαναφορά εργοστασιακού</button>
                    </div>

                    <label class="ask-form-label">Όνομα preset</label>
                    <input id="ask-preset-name" class="ask-input" value="${escapeHtml(state.presetDraft.name)}">

                    <div class="ask-clinical-columns">
                        <div><label class="ask-form-label">Πορεία νόσου</label><textarea id="ask-preset-course" class="ask-input">${escapeHtml(state.presetDraft.course)}</textarea></div>
                        <div><label class="ask-form-label">Θεραπευτική αγωγή</label><textarea id="ask-preset-therapy" class="ask-input">${escapeHtml(state.presetDraft.therapy)}</textarea></div>
                    </div>

                    <div style="margin-top:10px;"><label class="ask-form-label">Οδηγίες εξόδου</label><textarea id="ask-preset-discharge" class="ask-input">${escapeHtml(state.presetDraft.discharge)}</textarea></div>

                    <div class="ask-clinical-columns">
                        <div class="ask-clinical-section">
                            <b>Διαγνώσεις ICD-10</b>
                            <div style="display:grid;grid-template-columns:1fr;gap:5px;margin-top:7px;">
                                <input id="ask-diagnosis-live-search" class="ask-input" placeholder="Κωδικός ή περιγραφή, π.χ. M17">
                                <div id="ask-diagnosis-live-results" class="ask-clinical-results"></div>
                                <div style="display:flex;justify-content:space-between;gap:6px;align-items:center;">
                                    <span id="ask-diagnosis-live-status" class="ask-muted" style="padding:4px 6px;border-radius:4px;">Γράψε τουλάχιστον 2 χαρακτήρες.</span>
                                    <button type="button" id="ask-add-diagnosis-manual" class="ask-btn">+ Χειροκίνητα</button>
                                </div>
                            </div>
                            <div id="ask-diagnosis-rows"></div>
                        </div>

                        <div class="ask-clinical-section">
                            <b>Ιατρικές πράξεις</b>
                            <div style="display:grid;grid-template-columns:1fr;gap:5px;margin-top:7px;">
                                <input id="ask-medact-live-search" class="ask-input" placeholder="Κωδικός ή περιγραφή, π.χ. ήλωση">
                                <div id="ask-medact-live-results" class="ask-clinical-results"></div>
                                <div style="display:flex;justify-content:space-between;gap:6px;align-items:center;">
                                    <span id="ask-medact-live-status" class="ask-muted" style="padding:4px 6px;border-radius:4px;">Γράψε τουλάχιστον 2 χαρακτήρες.</span>
                                    <button type="button" id="ask-add-medact-manual" class="ask-btn">+ Χειροκίνητα</button>
                                </div>
                            </div>
                            <div id="ask-medact-rows"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        doc.getElementById('ask-new-preset').onclick = () => {
            state.presetMode = 'new';
            state.presetKey = '';
            state.presetDraft = createPresetDraft('');
            renderPresetsTab();
            doc.getElementById('ask-preset-name')?.focus();
        };

        doc.getElementById('ask-duplicate-preset').onclick = () => {
            updatePresetDraftFromDom();
            const copy = clone(state.presetDraft);
            copy.name = `${copy.name} - ΑΝΤΙΓΡΑΦΟ`;
            state.presetMode = 'new';
            state.presetKey = '';
            state.presetDraft = copy;
            renderPresetsTab();
        };

        doc.getElementById('ask-preset-search').oninput = event => {
            state.presetSearch = event.target.value;
            renderPresetList();
        };
        doc.getElementById('ask-save-preset').onclick = () => {
            try { savePreset(); } catch (error) { setStatus(error.message, 'error'); }
        };
        doc.getElementById('ask-delete-preset').onclick = deletePreset;
        doc.getElementById('ask-restore-preset').onclick = restorePreset;
        doc.getElementById('ask-reset-presets').onclick = resetAllPresets;

        doc.getElementById('ask-diagnosis-live-search').oninput = () =>
            scheduleClinicalSearch('diagnosis');
        doc.getElementById('ask-medact-live-search').oninput = () =>
            scheduleClinicalSearch('medicalAct');
        doc.getElementById('ask-add-diagnosis-manual').onclick = () =>
            addManualItem('diagnosis');
        doc.getElementById('ask-add-medact-manual').onclick = () =>
            addManualItem('medact');

        renderPresetList();
        renderDiagnosisRows();
        renderMedicalActRows();
        renderClinicalSearchResults('diagnosis');
        renderClinicalSearchResults('medicalAct');
    }

    function createSurgeryDraft(key = '') {
        return {
            name: key,
            description: A.data.SURGERY_DESCRIPTIONS?.[key] || ''
        };
    }

    function ensureSurgerySelection() {
        const presetKeys = sortedKeys(A.data.MEDICAL_CARD_PRESETS);

        if (
            state.surgeryKey &&
            presetKeys.includes(state.surgeryKey) &&
            state.surgeryDraft
        ) {
            return;
        }

        const first = presetKeys[0] || '';
        state.surgeryKey = first;
        state.surgeryMode = 'edit';
        state.surgeryDraft = createSurgeryDraft(first);
    }

    function getSurgeryLocalState(key) {
        const localState = A.registry.getState();
        const patch = localState.mapPatches?.SURGERY_DESCRIPTIONS || {
            upserts: {},
            deleted: []
        };
        const factory = A.registry.getFactorySection('SURGERY_DESCRIPTIONS') || {};

        return {
            hasFactory: Object.prototype.hasOwnProperty.call(factory, key),
            isModified: Object.prototype.hasOwnProperty.call(
                patch.upserts || {},
                key
            ),
            isCleared: (patch.deleted || []).includes(key),
            hasEffectiveText: Boolean(
                String(A.data.SURGERY_DESCRIPTIONS?.[key] || '').trim()
            )
        };
    }

    function saveSurgeryTemplate() {
        const doc = getDocument();
        const key = state.surgeryKey;
        const description =
            doc?.getElementById('ask-surgery-template-description')?.value || '';

        if (!key || !A.data.MEDICAL_CARD_PRESETS?.[key]) {
            throw new Error('Επίλεξε πρώτα ένα preset περιστατικού.');
        }

        A.localData.createBackup();

        if (description.trim()) {
            A.registry.setMapItem(
                'SURGERY_DESCRIPTIONS',
                key,
                description
            );
        } else {
            A.registry.deleteMapItem(
                'SURGERY_DESCRIPTIONS',
                key
            );
        }

        state.surgeryDraft = createSurgeryDraft(key);
        refreshRuntimeControls();
        renderSurgeryTab();

        setStatus(
            `Το πρακτικό για το preset "${key}" αποθηκεύτηκε.`,
            'success'
        );
    }

    function clearSurgeryTemplate() {
        const key = state.surgeryKey;
        if (!key) return;

        if (!confirm(`Να καθαριστεί το κείμενο του πρακτικού για το preset "${key}";`)) {
            return;
        }

        A.localData.createBackup();
        A.registry.deleteMapItem('SURGERY_DESCRIPTIONS', key);
        state.surgeryDraft = createSurgeryDraft(key);
        refreshRuntimeControls();
        renderSurgeryTab();
        setStatus(`Το κείμενο του πρακτικού για το "${key}" καθαρίστηκε.`, 'success');
    }

    function restoreSurgeryTemplate() {
        const key = state.surgeryKey;
        if (!key) return;

        const factory = A.registry.getFactorySection('SURGERY_DESCRIPTIONS') || {};
        const hasFactory = Object.prototype.hasOwnProperty.call(factory, key);

        if (!confirm(
            hasFactory
                ? `Να επανέλθει το πρακτικό του "${key}" στην εργοστασιακή μορφή;`
                : `Το "${key}" δεν έχει εργοστασιακό κείμενο. Να αφαιρεθεί η τοπική αλλαγή;`
        )) {
            return;
        }

        A.localData.createBackup();
        A.registry.restoreMapItem('SURGERY_DESCRIPTIONS', key);
        state.surgeryDraft = createSurgeryDraft(key);
        refreshRuntimeControls();
        renderSurgeryTab();
        setStatus(
            hasFactory
                ? 'Το πρακτικό επανήλθε στην εργοστασιακή μορφή.'
                : 'Η τοπική αλλαγή αφαιρέθηκε.',
            'success'
        );
    }

    function renderSurgeryList() {
        const doc = getDocument();
        const list = doc?.getElementById('ask-surgery-template-list');
        if (!list) return;

        const query = state.surgerySearch.trim().toLocaleLowerCase('el');
        const keys = sortedKeys(A.data.MEDICAL_CARD_PRESETS).filter(key =>
            key.toLocaleLowerCase('el').includes(query)
        );

        list.innerHTML = keys.length
            ? keys.map(key => `
                <button
                    type="button"
                    class="ask-clinical-item ${key === state.surgeryKey ? 'active' : ''}"
                    data-key="${escapeHtml(key)}"
                >
                    ${escapeHtml(key)}
                </button>
            `).join('')
            : '<div class="ask-muted" style="padding:12px;">Δεν βρέθηκαν presets.</div>';

        list.querySelectorAll('.ask-clinical-item').forEach(button => {
            button.onclick = () => {
                state.surgeryKey = button.dataset.key;
                state.surgeryMode = 'edit';
                state.surgeryDraft = createSurgeryDraft(state.surgeryKey);
                renderSurgeryTab();
            };
        });
    }

    function renderSurgeryTab() {
        const doc = getDocument();
        const content = doc?.getElementById('asklipios-settings-content');
        if (!content) return;

        ensureStyle(doc);
        ensureSurgerySelection();

        const local = state.surgeryKey
            ? getSurgeryLocalState(state.surgeryKey)
            : {
                hasFactory: false,
                hasEffectiveText: false
            };

        content.innerHTML = `
            <div class="ask-clinical-grid">
                <div class="ask-card">
                    <input
                        id="ask-surgery-search"
                        class="ask-input"
                        placeholder="Αναζήτηση preset"
                        value="${escapeHtml(state.surgerySearch)}"
                    >

                    <div
                        id="ask-surgery-template-list"
                        class="ask-clinical-list"
                    ></div>

                    <button
                        type="button"
                        id="ask-reset-surgery-templates"
                        class="ask-btn ask-btn-danger"
                        style="width:100%;margin-top:10px;"
                    >
                        Επαναφορά όλων των πρακτικών
                    </button>
                </div>

                <div class="ask-card ask-template-editor">
                    <div class="ask-editor-toolbar">
                        <button
                            type="button"
                            id="ask-save-surgery-template"
                            class="ask-btn ask-btn-success"
                            ${state.surgeryKey ? '' : 'disabled'}
                        >
                            Αποθήκευση πρακτικού
                        </button>

                        <button
                            type="button"
                            id="ask-clear-surgery-template"
                            class="ask-btn ask-btn-danger"
                            ${state.surgeryKey ? '' : 'disabled'}
                        >
                            Καθαρισμός κειμένου
                        </button>

                        <button
                            type="button"
                            id="ask-restore-surgery-template"
                            class="ask-btn"
                            ${state.surgeryKey ? '' : 'disabled'}
                        >
                            ${local.hasFactory ? 'Επαναφορά εργοστασιακού' : 'Αφαίρεση τοπικής αλλαγής'}
                        </button>
                    </div>

                    <label class="ask-form-label">
                        Πρότυπο περιστατικού
                    </label>

                    <input
                        class="ask-input"
                        value="${escapeHtml(state.surgeryDraft?.name || '')}"
                        readonly
                        style="background:#f4f6f7;"
                    >

                    <div style="margin-top:10px;">
                        <label class="ask-form-label">
                            Πρότυπο πρακτικού χειρουργείου
                        </label>

                        <textarea
                            id="ask-surgery-template-description"
                            class="ask-input"
                            style="min-height:470px;"
                            placeholder="Κείμενο πρακτικού χειρουργείου"
                        >${escapeHtml(state.surgeryDraft?.description || '')}</textarea>
                    </div>
                </div>
            </div>
        `;

        doc.getElementById('ask-surgery-search').oninput = event => {
            state.surgerySearch = event.target.value;
            renderSurgeryList();
        };

        doc.getElementById('ask-save-surgery-template').onclick = () => {
            try {
                saveSurgeryTemplate();
            } catch (error) {
                setStatus(error.message, 'error');
            }
        };

        doc.getElementById('ask-clear-surgery-template').onclick =
            clearSurgeryTemplate;

        doc.getElementById('ask-restore-surgery-template').onclick =
            restoreSurgeryTemplate;

        doc.getElementById('ask-reset-surgery-templates').onclick = () => {
            if (!confirm('Να διαγραφούν όλες οι τοπικές αλλαγές των πρακτικών;')) {
                return;
            }

            A.localData.createBackup();
            A.registry.resetSection('SURGERY_DESCRIPTIONS');
            state.surgeryDraft = createSurgeryDraft(state.surgeryKey);
            refreshRuntimeControls();
            renderSurgeryTab();
            setStatus('Τα πρακτικά επανήλθαν στις εργοστασιακές τιμές.', 'success');
        };

        renderSurgeryList();
    }


    function buildFactoryDoctorTemplate(key, entry = {}) {
        if (typeof entry?.template === 'string') {
            return entry.template;
        }

        const time = String(entry?.time || '').trim();
        const doctorLabel = String(entry?.doctorLabel || '').trim();
        const suffix = [
            time ? `και ώρα ${time}` : '',
            doctorLabel ? `(${doctorLabel})` : ''
        ].filter(Boolean).join(' ');

        return [
            'Επανεξέταση στα Τακτικά Εξωτερικά Ιατρεία της Ορθοπαιδικής Κλινικής',
            'στις {{ημερομηνία}}',
            suffix
        ].filter(Boolean).join(' ') + '.';
    }

    function createDoctorDraft(key = '') {
        const entry = A.data.DOCTOR_FOLLOWUP_TEXTS?.[key] || {};

        return {
            name: key,
            template: key
                ? buildFactoryDoctorTemplate(key, entry)
                : 'Επανεξέταση στα Τακτικά Εξωτερικά Ιατρεία της Ορθοπαιδικής Κλινικής στις {{ημερομηνία}} ({{θεράπων}}).'
        };
    }

    function ensureDoctorSelection() {
        if (state.doctorDraft) return;

        const first = sortedKeys(A.data.DOCTOR_FOLLOWUP_TEXTS)[0] || '';
        state.doctorKey = first;
        state.doctorMode = first ? 'edit' : 'new';
        state.doctorDraft = createDoctorDraft(first);
    }

    function updateDoctorDraftFromDom() {
        const doc = getDocument();
        if (!doc || !state.doctorDraft) return;

        state.doctorDraft.name =
            doc.getElementById('ask-doctor-name')?.value.trim() || '';
        state.doctorDraft.template =
            doc.getElementById('ask-doctor-template')?.value || '';
    }

    function renderDoctorPreview() {
        const doc = getDocument();
        const box = doc?.getElementById('ask-doctor-template-preview');
        const textarea = doc?.getElementById('ask-doctor-template');
        const name = doc?.getElementById('ask-doctor-name')?.value.trim() ||
            state.doctorDraft?.name || 'Θεράπων Ιατρός';
        if (!box || !textarea) return;

        const sampleDate = new Date();
        const dateText = [
            String(sampleDate.getDate()).padStart(2, '0'),
            String(sampleDate.getMonth() + 1).padStart(2, '0'),
            sampleDate.getFullYear()
        ].join('/');

        box.textContent = String(textarea.value || '')
            .replaceAll('{{ημερομηνία}}', dateText)
            .replaceAll('{{θεράπων}}', name);
    }

    function insertDoctorPlaceholder(placeholder) {
        const doc = getDocument();
        const textarea = doc?.getElementById('ask-doctor-template');
        if (!textarea) return;

        const start = textarea.selectionStart ?? textarea.value.length;
        const end = textarea.selectionEnd ?? textarea.value.length;
        textarea.setRangeText(placeholder, start, end, 'end');
        textarea.focus();
        renderDoctorPreview();
    }

    function saveDoctorTemplate() {
        updateDoctorDraftFromDom();

        const draft = clone(state.doctorDraft);
        const oldKey = state.doctorKey;
        const newKey = draft.name;

        if (!newKey) {
            throw new Error('Το όνομα του θεράποντα είναι υποχρεωτικό.');
        }

        if (!draft.template.trim()) {
            throw new Error('Το κείμενο οδηγιών εξόδου είναι υποχρεωτικό.');
        }

        if (
            newKey !== oldKey &&
            Object.prototype.hasOwnProperty.call(
                A.data.DOCTOR_FOLLOWUP_TEXTS || {},
                newKey
            )
        ) {
            throw new Error(`Υπάρχει ήδη θεράπων με όνομα "${newKey}".`);
        }

        A.localData.createBackup();

        const previous =
            A.data.DOCTOR_FOLLOWUP_TEXTS?.[oldKey] || {};

        A.registry.setMapItem('DOCTOR_FOLLOWUP_TEXTS', newKey, {
            ...clone(previous),
            template: draft.template
        });

        if (state.doctorMode === 'edit' && oldKey && oldKey !== newKey) {
            A.registry.deleteMapItem('DOCTOR_FOLLOWUP_TEXTS', oldKey);
        }

        state.doctorKey = newKey;
        state.doctorMode = 'edit';
        state.doctorDraft = createDoctorDraft(newKey);
        refreshRuntimeControls();
        renderDoctorsTab();
        setStatus(`Ο θεράπων "${newKey}" αποθηκεύτηκε.`, 'success');
    }

    function deleteDoctorTemplate() {
        if (!state.doctorKey || state.doctorMode !== 'edit') return;
        const key = state.doctorKey;

        if (!confirm(`Να αφαιρεθεί ο θεράπων "${key}" από τις ρυθμίσεις;`)) {
            return;
        }

        A.localData.createBackup();
        A.registry.deleteMapItem('DOCTOR_FOLLOWUP_TEXTS', key);

        const next = sortedKeys(A.data.DOCTOR_FOLLOWUP_TEXTS)[0] || '';
        state.doctorKey = next;
        state.doctorMode = next ? 'edit' : 'new';
        state.doctorDraft = createDoctorDraft(next);
        refreshRuntimeControls();
        renderDoctorsTab();
        setStatus(`Ο θεράπων "${key}" αφαιρέθηκε.`, 'success');
    }

    function restoreDoctorTemplate() {
        if (!state.doctorKey) return;

        const factory =
            A.registry.getFactorySection('DOCTOR_FOLLOWUP_TEXTS') || {};

        if (!Object.prototype.hasOwnProperty.call(factory, state.doctorKey)) {
            setStatus(
                'Ο συγκεκριμένος θεράπων δεν έχει εργοστασιακή έκδοση.',
                'warning'
            );
            return;
        }

        if (!confirm(`Να επανέλθει το κείμενο του "${state.doctorKey}";`)) {
            return;
        }

        A.localData.createBackup();
        A.registry.restoreMapItem(
            'DOCTOR_FOLLOWUP_TEXTS',
            state.doctorKey
        );
        state.doctorDraft = createDoctorDraft(state.doctorKey);
        refreshRuntimeControls();
        renderDoctorsTab();
        setStatus('Το κείμενο επανήλθε στην εργοστασιακή μορφή.', 'success');
    }

    function renderDoctorList() {
        const doc = getDocument();
        const list = doc?.getElementById('ask-doctor-list');
        if (!list) return;

        const query = state.doctorSearch.trim().toLocaleLowerCase('el');
        const keys = sortedKeys(A.data.DOCTOR_FOLLOWUP_TEXTS).filter(key =>
            key.toLocaleLowerCase('el').includes(query)
        );

        list.innerHTML = keys.length
            ? keys.map(key => `
                <button
                    type="button"
                    class="ask-clinical-item ${state.doctorMode === 'edit' && key === state.doctorKey ? 'active' : ''}"
                    data-key="${escapeHtml(key)}"
                >
                    ${escapeHtml(key)}
                </button>
            `).join('')
            : '<div class="ask-muted" style="padding:12px;">Δεν βρέθηκαν θεράποντες.</div>';

        list.querySelectorAll('.ask-clinical-item').forEach(button => {
            button.onclick = () => {
                state.doctorKey = button.dataset.key;
                state.doctorMode = 'edit';
                state.doctorDraft = createDoctorDraft(state.doctorKey);
                renderDoctorsTab();
            };
        });
    }

    function renderDoctorsTab() {
        const doc = getDocument();
        const content = doc?.getElementById('asklipios-settings-content');
        if (!content) return;

        ensureStyle(doc);
        ensureDoctorSelection();

        const modification = state.doctorMode === 'edit'
            ? getModificationState(
                'DOCTOR_FOLLOWUP_TEXTS',
                state.doctorKey
            )
            : { isFactory: false };

        const doctorSuggestions = (
            A.runtime?.getDoctors?.() || []
        ).map(doctor => String(doctor?.name || '').trim())
            .filter(Boolean);

        content.innerHTML = `
            <div class="ask-clinical-grid">
                <div class="ask-card">
                    <div class="ask-editor-toolbar">
                        <button type="button" id="ask-new-doctor" class="ask-btn ask-btn-primary">+ Νέος</button>
                        <button type="button" id="ask-duplicate-doctor" class="ask-btn">Αντιγραφή</button>
                    </div>

                    <input
                        id="ask-doctor-search"
                        class="ask-input"
                        placeholder="Αναζήτηση θεράποντα"
                        value="${escapeHtml(state.doctorSearch)}"
                    >

                    <div id="ask-doctor-list" class="ask-clinical-list"></div>

                    <button
                        type="button"
                        id="ask-reset-doctors"
                        class="ask-btn ask-btn-danger"
                        style="width:100%;margin-top:10px;"
                    >
                        Επαναφορά όλων των θεραπόντων
                    </button>
                </div>

                <div class="ask-card ask-template-editor">
                    <div class="ask-editor-toolbar">
                        <button type="button" id="ask-save-doctor" class="ask-btn ask-btn-success">Αποθήκευση</button>
                        <button type="button" id="ask-delete-doctor" class="ask-btn ask-btn-danger" ${state.doctorMode === 'new' ? 'disabled' : ''}>Διαγραφή</button>
                        <button type="button" id="ask-restore-doctor" class="ask-btn" ${state.doctorMode === 'edit' && modification.isFactory ? '' : 'disabled'}>Επαναφορά εργοστασιακού</button>
                    </div>

                    <label class="ask-form-label">Όνομα όπως εμφανίζεται στον Ασκληπιό</label>
                    <input
                        id="ask-doctor-name"
                        class="ask-input"
                        list="ask-doctor-name-suggestions"
                        value="${escapeHtml(state.doctorDraft?.name || '')}"
                        placeholder="π.χ. ΜΠΑΡΓΙΩΤΑΣ ΚΩΝ/ΝΟΣ"
                    >
                    <datalist id="ask-doctor-name-suggestions">
                        ${doctorSuggestions.map(name => `<option value="${escapeHtml(name)}"></option>`).join('')}
                    </datalist>

                    <div style="margin-top:12px;">
                        <label class="ask-form-label">Κείμενο στις οδηγίες εξόδου</label>
                        <textarea
                            id="ask-doctor-template"
                            class="ask-input"
                            style="min-height:230px;"
                        >${escapeHtml(state.doctorDraft?.template || '')}</textarea>
                    </div>

                    <div class="ask-editor-toolbar" style="margin-top:8px;">
                        <button type="button" id="ask-insert-doctor-date" class="ask-btn">+ Ημερομηνία επανεξέτασης</button>
                        <button type="button" id="ask-insert-doctor-name" class="ask-btn">+ Όνομα θεράποντα</button>
                    </div>

                    <div class="ask-muted" style="margin-top:8px;">
                        Η επιλεγμένη ημερομηνία αντικαθιστά το <b>{{ημερομηνία}}</b> και το όνομα του ιατρού το <b>{{θεράπων}}</b>.
                    </div>

                    <label class="ask-form-label" style="margin-top:12px;">Προεπισκόπηση</label>
                    <div id="ask-doctor-template-preview" class="ask-doctor-template-preview"></div>
                </div>
            </div>
        `;

        doc.getElementById('ask-new-doctor').onclick = () => {
            state.doctorKey = '';
            state.doctorMode = 'new';
            state.doctorDraft = createDoctorDraft('');
            renderDoctorsTab();
            doc.getElementById('ask-doctor-name')?.focus();
        };

        doc.getElementById('ask-duplicate-doctor').onclick = () => {
            updateDoctorDraftFromDom();
            const copy = clone(state.doctorDraft);
            copy.name = `${copy.name} - ΑΝΤΙΓΡΑΦΟ`;
            state.doctorKey = '';
            state.doctorMode = 'new';
            state.doctorDraft = copy;
            renderDoctorsTab();
        };

        doc.getElementById('ask-doctor-search').oninput = event => {
            state.doctorSearch = event.target.value;
            renderDoctorList();
        };

        doc.getElementById('ask-doctor-name').oninput = renderDoctorPreview;
        doc.getElementById('ask-doctor-template').oninput = renderDoctorPreview;
        doc.getElementById('ask-insert-doctor-date').onclick = () =>
            insertDoctorPlaceholder('{{ημερομηνία}}');
        doc.getElementById('ask-insert-doctor-name').onclick = () =>
            insertDoctorPlaceholder('{{θεράπων}}');

        doc.getElementById('ask-save-doctor').onclick = () => {
            try {
                saveDoctorTemplate();
            } catch (error) {
                setStatus(error.message, 'error');
            }
        };

        doc.getElementById('ask-delete-doctor').onclick =
            deleteDoctorTemplate;
        doc.getElementById('ask-restore-doctor').onclick =
            restoreDoctorTemplate;

        doc.getElementById('ask-reset-doctors').onclick = () => {
            if (!confirm('Να διαγραφούν όλες οι τοπικές αλλαγές των θεραπόντων;')) {
                return;
            }

            A.localData.createBackup();
            A.registry.resetSection('DOCTOR_FOLLOWUP_TEXTS');
            const first = sortedKeys(A.data.DOCTOR_FOLLOWUP_TEXTS)[0] || '';
            state.doctorKey = first;
            state.doctorMode = first ? 'edit' : 'new';
            state.doctorDraft = createDoctorDraft(first);
            refreshRuntimeControls();
            renderDoctorsTab();
            setStatus('Οι θεράποντες επανήλθαν στις εργοστασιακές τιμές.', 'success');
        };

        renderDoctorList();
        renderDoctorPreview();
    }

    function refreshMedicalPresetSelect() {
        const doc = getDocument();
        const select = doc?.getElementById('mc-preset');
        if (!select) return;
        const previous = select.value;
        const keys = sortedKeys(A.data.MEDICAL_CARD_PRESETS);
        select.innerHTML = '<option value="">-- Επιλογή --</option>' +
            keys.map(key => `<option value="${escapeHtml(key)}">${escapeHtml(key)}</option>`).join('');
        if (keys.includes(previous)) select.value = previous;
    }

    function refreshRuntimeControls() {
        refreshMedicalPresetSelect();
        A.settingsUi.refresh();
    }

    A.settingsUi.registerTab('presets', renderPresetsTab);
    A.settingsUi.registerTab('surgery', renderSurgeryTab);
    A.settingsUi.registerTab('doctors', renderDoctorsTab);

    window.addEventListener('asklipios:data-changed', refreshRuntimeControls);

    A.clinicalSettingsUi = {
        refreshRuntimeControls,
        renderPresetsTab,
        renderSurgeryTab,
        renderDoctorsTab
    };

    A.modules.clinicalSettingsUi = {
        loaded: true,
        version: '0.11.0'
    };

    console.log('Asklipios clinical settings UI loaded');
})();
