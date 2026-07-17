/*
 * Asklipios — Clinical Presets & Surgery Templates Settings
 * Version 0.9.0
 */

(function () {
    'use strict';

    if (window !== window.top) return;

    const A = window.Asklipios;

    if (!A?.settingsUi || !A?.registry || !A?.localData) {
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
        surgerySearch: ''
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
            };
        });

        box.querySelectorAll('.ask-medact-default').forEach(input => {
            input.onchange = () =>
                enforceSingleDefault('.ask-medact-default', input);
        });
    }

    function populateCatalogSelect(kind) {
        const doc = getDocument();
        const isDiagnosis = kind === 'diagnosis';
        const input = doc?.getElementById(
            isDiagnosis ? 'ask-diagnosis-search' : 'ask-medact-search'
        );
        const select = doc?.getElementById(
            isDiagnosis ? 'ask-diagnosis-catalog' : 'ask-medact-catalog'
        );
        if (!select) return;

        const query = (input?.value || '').trim().toLocaleLowerCase('el');
        const catalog = isDiagnosis ? getDiagnosisCatalog() : getMedicalActCatalog();
        const filtered = catalog.filter(item =>
            `${item.code || ''} ${item.name || ''}`
                .toLocaleLowerCase('el')
                .includes(query)
        ).slice(0, 200);

        select.innerHTML =
            '<option value="">-- Επιλογή --</option>' +
            filtered.map(item => {
                const originalIndex = catalog.findIndex(candidate =>
                    `${candidate.id}|${candidate.code}|${candidate.name}` ===
                    `${item.id}|${item.code}|${item.name}`
                );
                return `<option value="${originalIndex}">${escapeHtml(item.code || '')} — ${escapeHtml(item.name || '')}</option>`;
            }).join('');

        select.dataset.catalogKind = kind;
    }

    function addCatalogItem(kind) {
        const doc = getDocument();
        updatePresetDraftFromDom();

        const isDiagnosis = kind === 'diagnosis';
        const catalog = isDiagnosis ? getDiagnosisCatalog() : getMedicalActCatalog();
        const select = doc?.getElementById(
            isDiagnosis ? 'ask-diagnosis-catalog' : 'ask-medact-catalog'
        );
        const index = Number(select?.value);

        if (!Number.isInteger(index) || !catalog[index]) {
            setStatus('Επίλεξε πρώτα ένα στοιχείο από τον κατάλογο.', 'warning');
            return;
        }

        if (isDiagnosis) {
            state.presetDraft.diagnoses.push(clone(catalog[index]));
            renderDiagnosisRows();
        } else {
            state.presetDraft.medicalActs.push(clone(catalog[index]));
            renderMedicalActRows();
        }
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

        if (state.presetMode === 'edit' && oldKey && oldKey !== newKey) {
            for (const section of [
                'MEDICAL_CARD_PRESETS',
                'DIAGNOSIS_OPTIONS',
                'MEDICAL_ACT_OPTIONS',
                'PRESET_DISCHARGE_TEXTS'
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
            'PRESET_DISCHARGE_TEXTS'
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
            'PRESET_DISCHARGE_TEXTS'
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
            'PRESET_DISCHARGE_TEXTS'
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
                                <input id="ask-diagnosis-search" class="ask-input" placeholder="Αναζήτηση γνωστής διάγνωσης">
                                <select id="ask-diagnosis-catalog" class="ask-input"></select>
                                <div style="display:flex;gap:6px;"><button type="button" id="ask-add-diagnosis-catalog" class="ask-btn ask-btn-primary">+ Από κατάλογο</button><button type="button" id="ask-add-diagnosis-manual" class="ask-btn">+ Χειροκίνητα</button></div>
                            </div>
                            <div id="ask-diagnosis-rows"></div>
                        </div>

                        <div class="ask-clinical-section">
                            <b>Ιατρικές πράξεις</b>
                            <div style="display:grid;grid-template-columns:1fr;gap:5px;margin-top:7px;">
                                <input id="ask-medact-search" class="ask-input" placeholder="Αναζήτηση γνωστής ιατρικής πράξης">
                                <select id="ask-medact-catalog" class="ask-input"></select>
                                <div style="display:flex;gap:6px;"><button type="button" id="ask-add-medact-catalog" class="ask-btn ask-btn-primary">+ Από κατάλογο</button><button type="button" id="ask-add-medact-manual" class="ask-btn">+ Χειροκίνητα</button></div>
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

        doc.getElementById('ask-diagnosis-search').oninput = () => populateCatalogSelect('diagnosis');
        doc.getElementById('ask-medact-search').oninput = () => populateCatalogSelect('medact');
        doc.getElementById('ask-add-diagnosis-catalog').onclick = () => addCatalogItem('diagnosis');
        doc.getElementById('ask-add-diagnosis-manual').onclick = () => addManualItem('diagnosis');
        doc.getElementById('ask-add-medact-catalog').onclick = () => addCatalogItem('medact');
        doc.getElementById('ask-add-medact-manual').onclick = () => addManualItem('medact');

        populateCatalogSelect('diagnosis');
        populateCatalogSelect('medact');
        renderPresetList();
        renderDiagnosisRows();
        renderMedicalActRows();
    }

    function createSurgeryDraft(key = '') {
        return {
            name: key,
            description: A.data.SURGERY_DESCRIPTIONS?.[key] || ''
        };
    }

    function ensureSurgerySelection() {
        if (state.surgeryDraft) return;
        const first = sortedKeys(A.data.SURGERY_DESCRIPTIONS)[0] || '';
        state.surgeryKey = first;
        state.surgeryMode = first ? 'edit' : 'new';
        state.surgeryDraft = createSurgeryDraft(first);
    }

    function saveSurgeryTemplate() {
        const doc = getDocument();
        const name = doc?.getElementById('ask-surgery-template-name')?.value.trim() || '';
        const description = doc?.getElementById('ask-surgery-template-description')?.value.trim() || '';
        if (!name) throw new Error('Το όνομα του πρακτικού είναι υποχρεωτικό.');
        if (!description) throw new Error('Η περιγραφή του πρακτικού είναι κενή.');

        if (
            name !== state.surgeryKey &&
            Object.prototype.hasOwnProperty.call(A.data.SURGERY_DESCRIPTIONS || {}, name)
        ) {
            throw new Error(`Υπάρχει ήδη πρότυπο πρακτικού με όνομα "${name}".`);
        }

        A.localData.createBackup();
        A.registry.setMapItem('SURGERY_DESCRIPTIONS', name, description);
        if (state.surgeryMode === 'edit' && state.surgeryKey && state.surgeryKey !== name) {
            A.registry.deleteMapItem('SURGERY_DESCRIPTIONS', state.surgeryKey);
        }

        state.surgeryKey = name;
        state.surgeryMode = 'edit';
        state.surgeryDraft = createSurgeryDraft(name);
        refreshRuntimeControls();
        renderSurgeryTab();
        setStatus(`Το πρότυπο πρακτικού "${name}" αποθηκεύτηκε.`, 'success');
    }

    function deleteSurgeryTemplate() {
        if (!state.surgeryKey || state.surgeryMode !== 'edit') return;
        const key = state.surgeryKey;
        if (!confirm(`Να διαγραφεί το πρότυπο πρακτικού "${key}";`)) return;
        A.localData.createBackup();
        A.registry.deleteMapItem('SURGERY_DESCRIPTIONS', key);
        const next = sortedKeys(A.data.SURGERY_DESCRIPTIONS)[0] || '';
        state.surgeryKey = next;
        state.surgeryMode = next ? 'edit' : 'new';
        state.surgeryDraft = createSurgeryDraft(next);
        refreshRuntimeControls();
        renderSurgeryTab();
        setStatus(`Το πρότυπο "${key}" αφαιρέθηκε τοπικά.`, 'success');
    }

    function restoreSurgeryTemplate() {
        const factory = A.registry.getFactorySection('SURGERY_DESCRIPTIONS') || {};
        if (!Object.prototype.hasOwnProperty.call(factory, state.surgeryKey)) {
            setStatus('Το συγκεκριμένο πρότυπο δεν έχει εργοστασιακή έκδοση.', 'warning');
            return;
        }
        if (!confirm(`Να επανέλθει το "${state.surgeryKey}" στην εργοστασιακή μορφή;`)) return;
        A.localData.createBackup();
        A.registry.restoreMapItem('SURGERY_DESCRIPTIONS', state.surgeryKey);
        state.surgeryDraft = createSurgeryDraft(state.surgeryKey);
        refreshRuntimeControls();
        renderSurgeryTab();
        setStatus('Το πρότυπο πρακτικού επανήλθε.', 'success');
    }

    function renderSurgeryList() {
        const doc = getDocument();
        const list = doc?.getElementById('ask-surgery-template-list');
        if (!list) return;
        const query = state.surgerySearch.trim().toLocaleLowerCase('el');
        const keys = sortedKeys(A.data.SURGERY_DESCRIPTIONS).filter(key =>
            key.toLocaleLowerCase('el').includes(query)
        );
        list.innerHTML = keys.length
            ? keys.map(key => {
                const mod = getModificationState('SURGERY_DESCRIPTIONS', key);
                const badge = mod.isCustom ? 'Νέο' : mod.isModified ? 'Τροποποιημένο' : '';
                return `<button type="button" class="ask-clinical-item ${state.surgeryMode === 'edit' && key === state.surgeryKey ? 'active' : ''}" data-key="${escapeHtml(key)}">${escapeHtml(key)}${badge ? `<span class="ask-muted"> — ${badge}</span>` : ''}</button>`;
            }).join('')
            : '<div class="ask-muted" style="padding:12px;">Δεν βρέθηκαν πρότυπα.</div>';

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
        const mod = state.surgeryMode === 'edit'
            ? getModificationState('SURGERY_DESCRIPTIONS', state.surgeryKey)
            : { isFactory: false };

        content.innerHTML = `
            <div class="ask-clinical-grid">
                <div class="ask-card">
                    <div class="ask-editor-toolbar">
                        <button type="button" id="ask-new-surgery-template" class="ask-btn ask-btn-primary">+ Νέο</button>
                        <button type="button" id="ask-duplicate-surgery-template" class="ask-btn">Αντιγραφή</button>
                    </div>
                    <input id="ask-surgery-search" class="ask-input" placeholder="Αναζήτηση πρακτικού" value="${escapeHtml(state.surgerySearch)}">
                    <div id="ask-surgery-template-list" class="ask-clinical-list"></div>
                    <button type="button" id="ask-reset-surgery-templates" class="ask-btn ask-btn-danger" style="width:100%;margin-top:10px;">Επαναφορά όλων των πρακτικών</button>
                </div>

                <div class="ask-card ask-template-editor">
                    <div class="ask-editor-toolbar">
                        <button type="button" id="ask-save-surgery-template" class="ask-btn ask-btn-success">Αποθήκευση πρακτικού</button>
                        <button type="button" id="ask-delete-surgery-template" class="ask-btn ask-btn-danger" ${state.surgeryMode === 'new' ? 'disabled' : ''}>Διαγραφή</button>
                        <button type="button" id="ask-restore-surgery-template" class="ask-btn" ${state.surgeryMode === 'edit' && mod.isFactory ? '' : 'disabled'}>Επαναφορά εργοστασιακού</button>
                    </div>
                    <label class="ask-form-label">Όνομα προτύπου πρακτικού</label>
                    <input id="ask-surgery-template-name" class="ask-input" value="${escapeHtml(state.surgeryDraft.name)}">
                    <div style="margin-top:10px;"><label class="ask-form-label">Περιγραφή επέμβασης</label><textarea id="ask-surgery-template-description" class="ask-input" style="min-height:420px;">${escapeHtml(state.surgeryDraft.description)}</textarea></div>
                    <div class="ask-muted" style="margin-top:7px;">Το πρότυπο θα εμφανίζεται στο νέο dropdown «Πρότυπο πρακτικού» μέσα στην Ιατρική Καρτέλα.</div>
                </div>
            </div>
        `;

        doc.getElementById('ask-new-surgery-template').onclick = () => {
            state.surgeryMode = 'new';
            state.surgeryKey = '';
            state.surgeryDraft = createSurgeryDraft('');
            renderSurgeryTab();
            doc.getElementById('ask-surgery-template-name')?.focus();
        };
        doc.getElementById('ask-duplicate-surgery-template').onclick = () => {
            const name = doc.getElementById('ask-surgery-template-name')?.value.trim() || state.surgeryDraft.name;
            const description = doc.getElementById('ask-surgery-template-description')?.value || state.surgeryDraft.description;
            state.surgeryMode = 'new';
            state.surgeryKey = '';
            state.surgeryDraft = { name: `${name} - ΑΝΤΙΓΡΑΦΟ`, description };
            renderSurgeryTab();
        };
        doc.getElementById('ask-surgery-search').oninput = event => {
            state.surgerySearch = event.target.value;
            renderSurgeryList();
        };
        doc.getElementById('ask-save-surgery-template').onclick = () => {
            try { saveSurgeryTemplate(); } catch (error) { setStatus(error.message, 'error'); }
        };
        doc.getElementById('ask-delete-surgery-template').onclick = deleteSurgeryTemplate;
        doc.getElementById('ask-restore-surgery-template').onclick = restoreSurgeryTemplate;
        doc.getElementById('ask-reset-surgery-templates').onclick = () => {
            if (!confirm('Να διαγραφούν όλες οι τοπικές αλλαγές των πρακτικών;')) return;
            A.localData.createBackup();
            A.registry.resetSection('SURGERY_DESCRIPTIONS');
            const first = sortedKeys(A.data.SURGERY_DESCRIPTIONS)[0] || '';
            state.surgeryKey = first;
            state.surgeryMode = first ? 'edit' : 'new';
            state.surgeryDraft = createSurgeryDraft(first);
            refreshRuntimeControls();
            renderSurgeryTab();
            setStatus('Τα πρακτικά επανήλθαν στις εργοστασιακές τιμές.', 'success');
        };

        renderSurgeryList();
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

    function refreshSurgeryTemplateSelect() {
        const doc = getDocument();
        const select = doc?.getElementById('mc-surgery-template');
        if (!select) return;
        const previous = select.value;
        const keys = sortedKeys(A.data.SURGERY_DESCRIPTIONS);
        select.innerHTML = '<option value="">-- Χωρίς πρότυπο --</option>' +
            keys.map(key => `<option value="${escapeHtml(key)}">${escapeHtml(key)}</option>`).join('');
        if (keys.includes(previous)) select.value = previous;
    }

    function refreshRuntimeControls() {
        refreshMedicalPresetSelect();
        refreshSurgeryTemplateSelect();
        A.settingsUi.refresh();
    }

    A.settingsUi.registerTab('presets', renderPresetsTab);
    A.settingsUi.registerTab('surgery', renderSurgeryTab);

    window.addEventListener('asklipios:data-changed', refreshRuntimeControls);

    A.clinicalSettingsUi = {
        refreshRuntimeControls,
        renderPresetsTab,
        renderSurgeryTab
    };

    A.modules.clinicalSettingsUi = {
        loaded: true,
        version: '0.9.0'
    };

    console.log('Asklipios clinical settings UI loaded');
})();
