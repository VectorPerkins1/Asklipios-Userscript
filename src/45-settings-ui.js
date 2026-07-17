/*
 * Asklipios — Settings UI
 *
 * Version 0.9.0
 *
 * Visible local editors for:
 * - Laboratory packages
 * - Medical material companies
 * - Export / import / reset
 *
 * Preset and surgery-template editors are planned for the next version.
 */

(function () {
    'use strict';

    if (window !== window.top) return;

    const A = window.Asklipios;

    if (!A?.registry || !A?.localData || !A?.data) {
        throw new Error(
            'Asklipios settings dependencies are missing.'
        );
    }

    A.modules = A.modules || {};

    const PANEL_ID = 'asklipios-settings-overlay';
    const GEAR_ID = 'asklipios-settings-button';
    const STYLE_ID = 'asklipios-settings-style';

    const state = {
        activeTab: 'labs',
        packageKey: '',
        packageMode: 'edit',
        packageDraft: null,
        packageSearch: ''
    };

    const externalTabRenderers = {};

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

    function cssEscape(value) {
        if (window.CSS?.escape) {
            return window.CSS.escape(String(value));
        }

        return String(value).replace(
            /[^a-zA-Z0-9_-]/g,
            character => `\\${character}`
        );
    }

    function sortedKeys(object) {
        return Object.keys(object || {}).sort(
            (a, b) => a.localeCompare(b, 'el')
        );
    }

    function uniqueExamKey(exam) {
        return [
            exam?.hisCode ?? '',
            exam?.lab ?? '',
            exam?.dep ?? '',
            exam?.test ?? '',
            exam?.testDescr ?? ''
        ].join('|');
    }

    function normalizeExam(exam = {}) {
        return {
            ...clone(exam),

            test:
                Number.isFinite(Number(exam.test))
                    ? Number(exam.test)
                    : 0,

            testDescr:
                String(exam.testDescr || '').trim(),

            abbr:
                String(exam.abbr || '').trim(),

            hisCode:
                Number.isFinite(Number(exam.hisCode))
                    ? Number(exam.hisCode)
                    : 0,

            testOrderBy:
                Number.isFinite(Number(exam.testOrderBy))
                    ? Number(exam.testOrderBy)
                    : 0,

            isPatho:
                exam.isPatho === true,

            lab:
                Number.isFinite(Number(exam.lab))
                    ? Number(exam.lab)
                    : 0,

            dep:
                Number.isFinite(Number(exam.dep))
                    ? Number(exam.dep)
                    : 0,

            labDescr:
                String(exam.labDescr || '').trim(),

            depDescr:
                String(exam.depDescr || '').trim(),

            topology:
                exam.topology ?? null,

            isUrgent:
                exam.isUrgent === true
        };
    }

    function getExamCatalog() {
        const catalog = new Map();

        const addExam = exam => {
            const normalized = normalizeExam(exam);
            const key = uniqueExamKey(normalized);

            if (!catalog.has(key)) {
                catalog.set(key, normalized);
            }
        };

        Object.values(A.data.PACKAGES || {})
            .flat()
            .forEach(addExam);

        Object.values(A.data.EXTRA_EXAMS || {})
            .flat()
            .forEach(addExam);

        return [...catalog.values()].sort((a, b) => {
            const aLabel =
                a.abbr || a.testDescr || String(a.hisCode);

            const bLabel =
                b.abbr || b.testDescr || String(b.hisCode);

            return aLabel.localeCompare(bLabel, 'el');
        });
    }

    function ensureStyle(doc) {
        if (doc.getElementById(STYLE_ID)) return;

        const style = doc.createElement('style');
        style.id = STYLE_ID;

        style.textContent = `
            #${PANEL_ID} {
                position: fixed;
                inset: 0;
                z-index: 2147483646;
                background: rgba(0, 0, 0, 0.48);
                padding: 18px;
                box-sizing: border-box;
                font-family: Arial, sans-serif;
                color: #202124;
            }

            #${PANEL_ID} * {
                box-sizing: border-box;
            }

            #${PANEL_ID} .ask-settings-window {
                width: min(1180px, calc(100vw - 36px));
                height: min(820px, calc(100vh - 36px));
                margin: 0 auto;
                background: #fff;
                border: 2px solid #263238;
                border-radius: 8px;
                box-shadow: 0 12px 45px rgba(0,0,0,.38);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            #${PANEL_ID} .ask-settings-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 11px 14px;
                background: #eaf2f8;
                border-bottom: 1px solid #aab7c4;
            }

            #${PANEL_ID} .ask-settings-title {
                font-size: 17px;
                font-weight: bold;
            }

            #${PANEL_ID} .ask-settings-tabs {
                display: flex;
                gap: 5px;
                padding: 8px 10px 0;
                background: #f4f6f7;
                border-bottom: 1px solid #c7cdd1;
            }

            #${PANEL_ID} .ask-tab {
                border: 1px solid #aab2b7;
                border-bottom: none;
                background: #e5e8e8;
                padding: 8px 13px;
                border-radius: 6px 6px 0 0;
                cursor: pointer;
                font-weight: bold;
            }

            #${PANEL_ID} .ask-tab.active {
                background: #fff;
                position: relative;
                top: 1px;
            }

            #${PANEL_ID} .ask-settings-content {
                flex: 1;
                min-height: 0;
                overflow: auto;
                padding: 12px;
            }

            #${PANEL_ID} button,
            #${PANEL_ID} select,
            #${PANEL_ID} input,
            #${PANEL_ID} textarea {
                font: inherit;
            }

            #${PANEL_ID} button {
                cursor: pointer;
            }

            #${PANEL_ID} .ask-btn {
                border: 1px solid #7f8c8d;
                border-radius: 4px;
                background: #f7f9f9;
                padding: 6px 10px;
            }

            #${PANEL_ID} .ask-btn-primary {
                background: #d6eaf8;
                border-color: #5d8aa8;
                font-weight: bold;
            }

            #${PANEL_ID} .ask-btn-danger {
                background: #f8d7da;
                border-color: #b85c65;
            }

            #${PANEL_ID} .ask-btn-success {
                background: #d5f5e3;
                border-color: #58a67a;
                font-weight: bold;
            }

            #${PANEL_ID} .ask-labs-grid {
                display: grid;
                grid-template-columns: 285px minmax(0, 1fr);
                gap: 12px;
                height: 100%;
                min-height: 610px;
            }

            #${PANEL_ID} .ask-card {
                border: 1px solid #b8c0c5;
                border-radius: 6px;
                background: #fff;
                padding: 10px;
            }

            #${PANEL_ID} .ask-package-list {
                height: 420px;
                overflow: auto;
                border: 1px solid #c9ced1;
                margin-top: 8px;
                background: #fafafa;
            }

            #${PANEL_ID} .ask-package-item {
                display: block;
                width: 100%;
                text-align: left;
                border: 0;
                border-bottom: 1px solid #e2e5e7;
                background: transparent;
                padding: 8px;
            }

            #${PANEL_ID} .ask-package-item:hover {
                background: #edf4f8;
            }

            #${PANEL_ID} .ask-package-item.active {
                background: #d6eaf8;
                font-weight: bold;
            }

            #${PANEL_ID} .ask-editor-toolbar {
                display: flex;
                flex-wrap: wrap;
                gap: 7px;
                align-items: center;
                margin-bottom: 9px;
            }

            #${PANEL_ID} .ask-form-label {
                display: block;
                font-weight: bold;
                margin-bottom: 4px;
            }

            #${PANEL_ID} .ask-input {
                width: 100%;
                padding: 6px;
                border: 1px solid #aab2b7;
                border-radius: 4px;
            }

            #${PANEL_ID} .ask-exams-container {
                max-height: 465px;
                overflow: auto;
                border: 1px solid #c7cdd1;
                padding: 7px;
                background: #fafafa;
            }

            #${PANEL_ID} .ask-exam-row {
                background: #fff;
                border: 1px solid #c3c9cd;
                border-radius: 5px;
                padding: 8px;
                margin-bottom: 7px;
            }

            #${PANEL_ID} .ask-exam-top {
                display: grid;
                grid-template-columns: 38px 160px minmax(220px, 1fr) auto;
                gap: 6px;
                align-items: center;
            }

            #${PANEL_ID} .ask-exam-tech {
                display: grid;
                grid-template-columns: repeat(6, minmax(90px, 1fr));
                gap: 6px;
                margin-top: 7px;
            }

            #${PANEL_ID} .ask-exam-tech label {
                font-size: 11px;
                color: #4f5b62;
            }

            #${PANEL_ID} .ask-exam-tech input {
                width: 100%;
                margin-top: 2px;
                padding: 4px;
            }

            #${PANEL_ID} .ask-muted {
                color: #66757f;
                font-size: 12px;
            }

            #${PANEL_ID} .ask-status {
                margin-top: 8px;
                min-height: 22px;
                padding: 6px 8px;
                border-radius: 4px;
                background: #f4f6f7;
                border: 1px solid #d5d8dc;
            }

            #${PANEL_ID} .ask-company-row {
                display: grid;
                grid-template-columns: 40px minmax(250px, 1fr) auto;
                gap: 7px;
                align-items: center;
                margin-bottom: 7px;
            }

            #${PANEL_ID} .ask-company-list {
                max-width: 720px;
                margin: 0 auto;
            }

            #${PANEL_ID} .ask-backup-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(280px, 1fr));
                gap: 12px;
            }

            #${PANEL_ID} .ask-code-summary {
                white-space: pre-wrap;
                font-family: Consolas, monospace;
                font-size: 12px;
                background: #f6f8f9;
                border: 1px solid #ccd2d5;
                padding: 10px;
                border-radius: 5px;
            }

            #${PANEL_ID} .ask-placeholder {
                max-width: 760px;
                margin: 55px auto;
                text-align: center;
                padding: 28px;
                border: 1px dashed #8f9da5;
                border-radius: 8px;
                background: #f8fafb;
            }

            @media (max-width: 900px) {
                #${PANEL_ID} .ask-labs-grid {
                    grid-template-columns: 1fr;
                    min-height: auto;
                }

                #${PANEL_ID} .ask-exam-top {
                    grid-template-columns: 35px 1fr;
                }

                #${PANEL_ID} .ask-exam-tech {
                    grid-template-columns: repeat(2, minmax(110px, 1fr));
                }

                #${PANEL_ID} .ask-backup-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;

        doc.head.appendChild(style);
    }

    function setStatus(message, type = 'info') {
        const doc = getDocument();
        const box = doc?.getElementById(
            'asklipios-settings-status'
        );

        if (!box) return;

        const backgrounds = {
            info: '#f4f6f7',
            success: '#d5f5e3',
            error: '#f8d7da',
            warning: '#fcf3cf'
        };

        box.style.background =
            backgrounds[type] || backgrounds.info;

        box.textContent = message;
    }

    function refreshLabPackageSelect() {
        const doc = getDocument();
        const select = doc?.getElementById('lab-package');

        if (!select) return;

        const previous = select.value;
        const keys = sortedKeys(A.data.PACKAGES);

        select.innerHTML = keys.map(name => `
            <option value="${escapeHtml(name)}">
                ${escapeHtml(name)}
            </option>
        `).join('');

        if (keys.includes(previous)) {
            select.value = previous;
        } else if (keys.length) {
            select.value = keys[0];
        }
    }

    function refreshCompanySelect() {
        const doc = getDocument();
        const select = doc?.getElementById('mc-company');

        if (!select) return;

        const previous = select.value;

        select.innerHTML =
            '<option value="">-- Επιλογή --</option>' +
            (A.data.MEDICAL_CARD_COMPANIES || [])
                .map(company => `
                    <option value="${escapeHtml(company)}">
                        ${escapeHtml(company)}
                    </option>
                `)
                .join('');

        if (
            previous &&
            A.data.MEDICAL_CARD_COMPANIES.includes(previous)
        ) {
            select.value = previous;
        }
    }

    function refreshHelperControls() {
        refreshLabPackageSelect();
        refreshCompanySelect();
    }

    function getPackageModificationState(key) {
        const localState = A.registry.getState();
        const patch =
            localState.mapPatches?.PACKAGES || {
                upserts: {},
                deleted: []
            };

        const isFactory =
            Object.prototype.hasOwnProperty.call(
                A.registry.getFactorySection('PACKAGES'),
                key
            );

        const isModified =
            Object.prototype.hasOwnProperty.call(
                patch.upserts || {},
                key
            );

        return {
            isFactory,
            isModified,
            isCustom: !isFactory
        };
    }

    function createExamRowHtml(exam, index) {
        const normalized = normalizeExam(exam);

        return `
            <div class="ask-exam-row" data-index="${index}">
                <div class="ask-exam-top">
                    <strong>#${index + 1}</strong>

                    <input
                        class="ask-input ask-exam-abbr"
                        value="${escapeHtml(normalized.abbr)}"
                        placeholder="Συντομογραφία"
                    >

                    <input
                        class="ask-input ask-exam-description"
                        value="${escapeHtml(normalized.testDescr)}"
                        placeholder="Περιγραφή εξέτασης"
                    >

                    <div style="display:flex;gap:4px;">
                        <button
                            type="button"
                            class="ask-btn ask-exam-up"
                            title="Μετακίνηση πάνω"
                        >▲</button>

                        <button
                            type="button"
                            class="ask-btn ask-exam-down"
                            title="Μετακίνηση κάτω"
                        >▼</button>

                        <button
                            type="button"
                            class="ask-btn ask-btn-danger ask-exam-delete"
                            title="Αφαίρεση εξέτασης"
                        >✕</button>
                    </div>
                </div>

                <details class="ask-exam-advanced" style="margin-top:7px;">
                    <summary style="cursor:pointer;color:#5d6d7e;font-size:12px;">
                        Τεχνικά στοιχεία εξέτασης
                    </summary>

                    <div class="ask-exam-tech">
                        <label>
                            test
                            <input
                                type="number"
                                class="ask-exam-test"
                                value="${normalized.test}"
                            >
                        </label>

                        <label>
                            hisCode
                            <input
                                type="number"
                                class="ask-exam-his-code"
                                value="${normalized.hisCode}"
                            >
                        </label>

                        <label>
                            lab
                            <input
                                type="number"
                                class="ask-exam-lab"
                                value="${normalized.lab}"
                            >
                        </label>

                        <label>
                            dep
                            <input
                                type="number"
                                class="ask-exam-dep"
                                value="${normalized.dep}"
                            >
                        </label>

                        <label>
                            Εργαστήριο
                            <input
                                class="ask-exam-lab-description"
                                value="${escapeHtml(normalized.labDescr)}"
                            >
                        </label>

                        <label>
                            Τμήμα
                            <input
                                class="ask-exam-dep-description"
                                value="${escapeHtml(normalized.depDescr)}"
                            >
                        </label>
                    </div>
                </details>
            </div>
        `;
    }

    function updateDraftFromExamRows() {
        const doc = getDocument();
        const container = doc?.getElementById(
            'asklipios-exams-container'
        );

        if (!container || !state.packageDraft) return;

        const oldExams = state.packageDraft.exams || [];

        state.packageDraft.exams = [
            ...container.querySelectorAll('.ask-exam-row')
        ].map((row, index) => {
            const existing = oldExams[index] || {};

            return normalizeExam({
                ...existing,
                abbr:
                    row.querySelector('.ask-exam-abbr')
                        ?.value || '',

                testDescr:
                    row.querySelector('.ask-exam-description')
                        ?.value || '',

                test:
                    row.querySelector('.ask-exam-test')
                        ?.value || 0,

                hisCode:
                    row.querySelector('.ask-exam-his-code')
                        ?.value || 0,

                lab:
                    row.querySelector('.ask-exam-lab')
                        ?.value || 0,

                dep:
                    row.querySelector('.ask-exam-dep')
                        ?.value || 0,

                labDescr:
                    row.querySelector(
                        '.ask-exam-lab-description'
                    )?.value || '',

                depDescr:
                    row.querySelector(
                        '.ask-exam-dep-description'
                    )?.value || ''
            });
        });
    }

    function renderExamRows() {
        const doc = getDocument();
        const container = doc?.getElementById(
            'asklipios-exams-container'
        );

        if (!container || !state.packageDraft) return;

        const exams = state.packageDraft.exams || [];

        if (!exams.length) {
            container.innerHTML = `
                <div class="ask-muted" style="padding:18px;text-align:center;">
                    Το πακέτο δεν περιέχει εξετάσεις.
                </div>
            `;
            return;
        }

        container.innerHTML = exams
            .map(createExamRowHtml)
            .join('');

        container
            .querySelectorAll('.ask-exam-delete')
            .forEach(button => {
                button.onclick = () => {
                    updateDraftFromExamRows();

                    const row = button.closest(
                        '.ask-exam-row'
                    );

                    const index = Number(
                        row?.dataset.index
                    );

                    state.packageDraft.exams.splice(
                        index,
                        1
                    );

                    renderExamRows();
                };
            });

        container
            .querySelectorAll('.ask-exam-up')
            .forEach(button => {
                button.onclick = () => {
                    updateDraftFromExamRows();

                    const index = Number(
                        button.closest(
                            '.ask-exam-row'
                        )?.dataset.index
                    );

                    if (index <= 0) return;

                    const exams =
                        state.packageDraft.exams;

                    [exams[index - 1], exams[index]] = [
                        exams[index],
                        exams[index - 1]
                    ];

                    renderExamRows();
                };
            });

        container
            .querySelectorAll('.ask-exam-down')
            .forEach(button => {
                button.onclick = () => {
                    updateDraftFromExamRows();

                    const index = Number(
                        button.closest(
                            '.ask-exam-row'
                        )?.dataset.index
                    );

                    const exams =
                        state.packageDraft.exams;

                    if (
                        index < 0 ||
                        index >= exams.length - 1
                    ) {
                        return;
                    }

                    [exams[index], exams[index + 1]] = [
                        exams[index + 1],
                        exams[index]
                    ];

                    renderExamRows();
                };
            });
    }

    function collectPackageEditor() {
        const doc = getDocument();

        updateDraftFromExamRows();

        const name =
            doc?.getElementById(
                'asklipios-package-name'
            )?.value.trim() || '';

        if (!name) {
            throw new Error(
                'Το όνομα του πακέτου είναι υποχρεωτικό.'
            );
        }

        const exams =
            state.packageDraft?.exams || [];

        if (!exams.length) {
            throw new Error(
                'Το πακέτο πρέπει να περιέχει τουλάχιστον μία εξέταση.'
            );
        }

        exams.forEach((exam, index) => {
            if (!exam.testDescr) {
                throw new Error(
                    `Λείπει η περιγραφή της εξέτασης #${index + 1}.`
                );
            }

            for (
                const numericField of [
                    'test',
                    'hisCode',
                    'lab',
                    'dep'
                ]
            ) {
                if (
                    !Number.isFinite(
                        Number(exam[numericField])
                    )
                ) {
                    throw new Error(
                        `Μη έγκυρο ${numericField} στην εξέταση #${index + 1}.`
                    );
                }
            }
        });

        return {
            name,
            exams: exams.map(normalizeExam)
        };
    }

    function selectPackage(key) {
        const packages = A.data.PACKAGES || {};

        if (!packages[key]) return;

        state.packageMode = 'edit';
        state.packageKey = key;
        state.packageDraft = {
            name: key,
            exams: clone(packages[key])
        };

        renderLabsTab();
    }

    function createNewPackage(baseExams = []) {
        state.packageMode = 'new';
        state.packageKey = '';
        state.packageDraft = {
            name: '',
            exams: clone(baseExams)
        };

        renderLabsTab();

        const doc = getDocument();
        doc?.getElementById(
            'asklipios-package-name'
        )?.focus();
    }

    function savePackage() {
        const packageData = collectPackageEditor();
        const oldKey = state.packageKey;
        const newKey = packageData.name;

        if (
            newKey !== oldKey &&
            Object.prototype.hasOwnProperty.call(
                A.data.PACKAGES,
                newKey
            )
        ) {
            throw new Error(
                `Υπάρχει ήδη πακέτο με όνομα "${newKey}".`
            );
        }

        A.localData.createBackup();

        if (
            state.packageMode === 'edit' &&
            oldKey &&
            newKey !== oldKey
        ) {
            A.registry.setMapItem(
                'PACKAGES',
                newKey,
                packageData.exams
            );

            A.registry.deleteMapItem(
                'PACKAGES',
                oldKey
            );
        } else {
            A.registry.setMapItem(
                'PACKAGES',
                newKey,
                packageData.exams
            );
        }

        state.packageMode = 'edit';
        state.packageKey = newKey;
        state.packageDraft = {
            name: newKey,
            exams: clone(
                A.data.PACKAGES[newKey]
            )
        };

        refreshHelperControls();
        renderLabsTab();

        setStatus(
            `Το πακέτο "${newKey}" αποθηκεύτηκε τοπικά.`,
            'success'
        );
    }

    function deleteCurrentPackage() {
        if (
            state.packageMode !== 'edit' ||
            !state.packageKey
        ) {
            return;
        }

        const key = state.packageKey;

        if (
            !confirm(
                `Να διαγραφεί το πακέτο "${key}";\n\n` +
                'Αν είναι εργοστασιακό, θα κρυφτεί μόνο τοπικά.'
            )
        ) {
            return;
        }

        A.localData.createBackup();
        A.registry.deleteMapItem('PACKAGES', key);

        const remaining = sortedKeys(
            A.data.PACKAGES
        );

        state.packageKey = remaining[0] || '';
        state.packageMode =
            state.packageKey ? 'edit' : 'new';

        state.packageDraft =
            state.packageKey
                ? {
                    name: state.packageKey,
                    exams: clone(
                        A.data.PACKAGES[
                            state.packageKey
                        ]
                    )
                }
                : {
                    name: '',
                    exams: []
                };

        refreshHelperControls();
        renderLabsTab();

        setStatus(
            `Το πακέτο "${key}" αφαιρέθηκε τοπικά.`,
            'success'
        );
    }

    function restoreCurrentPackage() {
        if (!state.packageKey) return;

        const factory =
            A.registry.getFactorySection(
                'PACKAGES'
            );

        if (
            !Object.prototype.hasOwnProperty.call(
                factory,
                state.packageKey
            )
        ) {
            setStatus(
                'Το συγκεκριμένο πακέτο είναι τοπικό και δεν έχει εργοστασιακή έκδοση.',
                'warning'
            );
            return;
        }

        if (
            !confirm(
                `Να επανέλθει το "${state.packageKey}" ` +
                'στην εργοστασιακή του μορφή;'
            )
        ) {
            return;
        }

        A.localData.createBackup();

        A.registry.restoreMapItem(
            'PACKAGES',
            state.packageKey
        );

        state.packageDraft = {
            name: state.packageKey,
            exams: clone(
                A.data.PACKAGES[
                    state.packageKey
                ]
            )
        };

        refreshHelperControls();
        renderLabsTab();

        setStatus(
            'Το πακέτο επανήλθε στην εργοστασιακή μορφή.',
            'success'
        );
    }

    function restoreHiddenFactoryPackage(key) {
        if (!key) return;

        A.localData.createBackup();

        A.registry.restoreMapItem(
            'PACKAGES',
            key
        );

        state.packageKey = key;
        state.packageMode = 'edit';
        state.packageDraft = {
            name: key,
            exams: clone(
                A.data.PACKAGES[key]
            )
        };

        refreshHelperControls();
        renderLabsTab();

        setStatus(
            `Το εργοστασιακό πακέτο "${key}" επανήλθε.`,
            'success'
        );
    }

    function renderPackageList() {
        const doc = getDocument();
        const list = doc?.getElementById(
            'asklipios-package-list'
        );

        if (!list) return;

        const query =
            state.packageSearch
                .trim()
                .toLocaleLowerCase('el');

        const keys = sortedKeys(
            A.data.PACKAGES
        ).filter(key =>
            key
                .toLocaleLowerCase('el')
                .includes(query)
        );

        if (!keys.length) {
            list.innerHTML = `
                <div class="ask-muted" style="padding:14px;">
                    Δεν βρέθηκαν πακέτα.
                </div>
            `;
            return;
        }

        list.innerHTML = keys.map(key => {
            const modification =
                getPackageModificationState(key);

            const badge =
                modification.isCustom
                    ? 'Νέο'
                    : modification.isModified
                        ? 'Τροποποιημένο'
                        : '';

            return `
                <button
                    type="button"
                    class="ask-package-item ${
                        key === state.packageKey &&
                        state.packageMode === 'edit'
                            ? 'active'
                            : ''
                    }"
                    data-package-key="${escapeHtml(key)}"
                >
                    ${escapeHtml(key)}
                    ${
                        badge
                            ? `<span class="ask-muted"> — ${badge}</span>`
                            : ''
                    }
                </button>
            `;
        }).join('');

        list.querySelectorAll(
            '.ask-package-item'
        ).forEach(button => {
            button.onclick = () => {
                selectPackage(
                    button.dataset.packageKey
                );
            };
        });
    }

    function renderPackageEditor() {
        const doc = getDocument();
        const editor = doc?.getElementById(
            'asklipios-package-editor'
        );

        if (!editor) return;

        if (!state.packageDraft) {
            const firstKey = sortedKeys(
                A.data.PACKAGES
            )[0];

            if (firstKey) {
                state.packageKey = firstKey;
                state.packageMode = 'edit';
                state.packageDraft = {
                    name: firstKey,
                    exams: clone(
                        A.data.PACKAGES[firstKey]
                    )
                };
            } else {
                state.packageMode = 'new';
                state.packageDraft = {
                    name: '',
                    exams: []
                };
            }
        }

        const catalog = getExamCatalog();

        const modification =
            state.packageMode === 'edit'
                ? getPackageModificationState(
                    state.packageKey
                )
                : {
                    isFactory: false,
                    isModified: false,
                    isCustom: true
                };

        editor.innerHTML = `
            <div class="ask-editor-toolbar">
                <button
                    type="button"
                    id="asklipios-save-package"
                    class="ask-btn ask-btn-success"
                >
                    Αποθήκευση πακέτου
                </button>

                <button
                    type="button"
                    id="asklipios-delete-package"
                    class="ask-btn ask-btn-danger"
                    ${
                        state.packageMode === 'new'
                            ? 'disabled'
                            : ''
                    }
                >
                    Διαγραφή
                </button>

                <button
                    type="button"
                    id="asklipios-restore-package"
                    class="ask-btn"
                    ${
                        state.packageMode === 'edit' &&
                        modification.isFactory
                            ? ''
                            : 'disabled'
                    }
                >
                    Επαναφορά εργοστασιακού
                </button>

                <span class="ask-muted">
                    ${
                        state.packageMode === 'new'
                            ? 'Νέο τοπικό πακέτο'
                            : modification.isCustom
                                ? 'Τοπικό πακέτο'
                                : modification.isModified
                                    ? 'Τροποποιημένο εργοστασιακό πακέτο'
                                    : 'Εργοστασιακό πακέτο'
                    }
                </span>
            </div>

            <label class="ask-form-label">
                Όνομα πακέτου
            </label>

            <input
                id="asklipios-package-name"
                class="ask-input"
                value="${escapeHtml(
                    state.packageDraft.name
                )}"
                placeholder="Όνομα εργαστηριακού πακέτου"
            >

            <div style="margin-top:10px;">
                <label class="ask-form-label">
                    Προσθήκη γνωστής εξέτασης
                </label>

                <div style="display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:6px;">
                    <select
                        id="asklipios-exam-catalog"
                        class="ask-input"
                    >
                        <option value="">
                            -- Επιλογή εξέτασης --
                        </option>

                        ${catalog.map((exam, index) => `
                            <option value="${index}">
                                ${escapeHtml(
                                    exam.abbr ||
                                    exam.testDescr
                                )}
                                — ${escapeHtml(
                                    exam.testDescr
                                )}
                                [hisCode ${exam.hisCode}]
                            </option>
                        `).join('')}
                    </select>

                    <button
                        type="button"
                        id="asklipios-add-catalog-exam"
                        class="ask-btn ask-btn-primary"
                    >
                        + Προσθήκη
                    </button>

                    <button
                        type="button"
                        id="asklipios-add-empty-exam"
                        class="ask-btn"
                        title="Για εξέταση που δεν υπάρχει στον γνωστό κατάλογο"
                    >
                        + Κενή
                    </button>
                </div>

                <div class="ask-muted" style="margin-top:5px;">
                    Τα τεχνικά πεδία test, hisCode, lab και dep είναι απαραίτητα για την αποστολή.
                    Άλλαξέ τα μόνο όταν γνωρίζεις τις σωστές τιμές του Care.
                </div>
            </div>

            <div
                id="asklipios-exams-container"
                class="ask-exams-container"
                style="margin-top:9px;"
            ></div>
        `;

        doc.getElementById(
            'asklipios-save-package'
        ).onclick = () => {
            try {
                savePackage();
            } catch (error) {
                setStatus(
                    error.message,
                    'error'
                );
            }
        };

        doc.getElementById(
            'asklipios-delete-package'
        ).onclick = deleteCurrentPackage;

        doc.getElementById(
            'asklipios-restore-package'
        ).onclick = restoreCurrentPackage;

        doc.getElementById(
            'asklipios-add-catalog-exam'
        ).onclick = () => {
            const select = doc.getElementById(
                'asklipios-exam-catalog'
            );

            const index = Number(select.value);

            if (
                !Number.isInteger(index) ||
                !catalog[index]
            ) {
                setStatus(
                    'Επίλεξε πρώτα μία εξέταση.',
                    'warning'
                );
                return;
            }

            updateDraftFromExamRows();

            state.packageDraft.exams.push(
                clone(catalog[index])
            );

            renderExamRows();
        };

        doc.getElementById(
            'asklipios-add-empty-exam'
        ).onclick = () => {
            updateDraftFromExamRows();

            state.packageDraft.exams.push(
                normalizeExam({
                    test: 0,
                    testDescr: '',
                    abbr: '',
                    hisCode: 0,
                    lab: 0,
                    dep: 0,
                    labDescr: '',
                    depDescr: ''
                })
            );

            renderExamRows();
        };

        renderExamRows();
    }

    function renderLabsTab() {
        const doc = getDocument();
        const content = doc?.getElementById(
            'asklipios-settings-content'
        );

        if (!content) return;

        const factory =
            A.registry.getFactorySection(
                'PACKAGES'
            );

        const effective =
            A.data.PACKAGES || {};

        const hiddenFactoryKeys =
            sortedKeys(factory).filter(key =>
                !Object.prototype.hasOwnProperty.call(
                    effective,
                    key
                )
            );

        content.innerHTML = `
            <div class="ask-labs-grid">
                <div class="ask-card">
                    <div class="ask-editor-toolbar">
                        <button
                            type="button"
                            id="asklipios-new-package"
                            class="ask-btn ask-btn-primary"
                        >
                            + Νέο
                        </button>

                        <button
                            type="button"
                            id="asklipios-duplicate-package"
                            class="ask-btn"
                        >
                            Αντιγραφή
                        </button>
                    </div>

                    <input
                        id="asklipios-package-search"
                        class="ask-input"
                        placeholder="Αναζήτηση πακέτου"
                        value="${escapeHtml(
                            state.packageSearch
                        )}"
                    >

                    <div
                        id="asklipios-package-list"
                        class="ask-package-list"
                    ></div>

                    <div style="margin-top:10px;">
                        <button
                            type="button"
                            id="asklipios-reset-packages"
                            class="ask-btn ask-btn-danger"
                            style="width:100%;"
                        >
                            Επαναφορά όλων των πακέτων
                        </button>
                    </div>

                    ${
                        hiddenFactoryKeys.length
                            ? `
                                <div style="margin-top:12px;border-top:1px solid #ddd;padding-top:9px;">
                                    <label class="ask-form-label">
                                        Κρυμμένα εργοστασιακά
                                    </label>

                                    <select
                                        id="asklipios-hidden-packages"
                                        class="ask-input"
                                    >
                                        ${hiddenFactoryKeys.map(key => `
                                            <option value="${escapeHtml(key)}">
                                                ${escapeHtml(key)}
                                            </option>
                                        `).join('')}
                                    </select>

                                    <button
                                        type="button"
                                        id="asklipios-restore-hidden-package"
                                        class="ask-btn"
                                        style="width:100%;margin-top:6px;"
                                    >
                                        Επαναφορά επιλεγμένου
                                    </button>
                                </div>
                            `
                            : ''
                    }
                </div>

                <div
                    id="asklipios-package-editor"
                    class="ask-card"
                ></div>
            </div>
        `;

        doc.getElementById(
            'asklipios-new-package'
        ).onclick = () => {
            createNewPackage([]);
        };

        doc.getElementById(
            'asklipios-duplicate-package'
        ).onclick = () => {
            if (
                state.packageMode !== 'edit' ||
                !state.packageKey
            ) {
                setStatus(
                    'Επίλεξε πρώτα ένα πακέτο για αντιγραφή.',
                    'warning'
                );
                return;
            }

            createNewPackage(
                A.data.PACKAGES[
                    state.packageKey
                ] || []
            );

            const nameInput = doc.getElementById(
                'asklipios-package-name'
            );

            if (nameInput) {
                nameInput.value =
                    `${state.packageKey} - ΑΝΤΙΓΡΑΦΟ`;
            }
        };

        doc.getElementById(
            'asklipios-package-search'
        ).oninput = event => {
            state.packageSearch =
                event.target.value;

            renderPackageList();
        };

        doc.getElementById(
            'asklipios-reset-packages'
        ).onclick = () => {
            if (
                !confirm(
                    'Να διαγραφούν όλες οι τοπικές αλλαγές των εργαστηριακών πακέτων;'
                )
            ) {
                return;
            }

            A.localData.createBackup();
            A.registry.resetSection('PACKAGES');

            const firstKey =
                sortedKeys(A.data.PACKAGES)[0] || '';

            state.packageKey = firstKey;
            state.packageMode =
                firstKey ? 'edit' : 'new';

            state.packageDraft =
                firstKey
                    ? {
                        name: firstKey,
                        exams: clone(
                            A.data.PACKAGES[firstKey]
                        )
                    }
                    : {
                        name: '',
                        exams: []
                    };

            refreshHelperControls();
            renderLabsTab();

            setStatus(
                'Όλα τα εργαστηριακά πακέτα επανήλθαν στις εργοστασιακές τιμές.',
                'success'
            );
        };

        const restoreHiddenButton =
            doc.getElementById(
                'asklipios-restore-hidden-package'
            );

        if (restoreHiddenButton) {
            restoreHiddenButton.onclick = () => {
                const key =
                    doc.getElementById(
                        'asklipios-hidden-packages'
                    )?.value || '';

                restoreHiddenFactoryPackage(key);
            };
        }

        renderPackageList();
        renderPackageEditor();
    }

    function getCompanyRowsFromUi() {
        const doc = getDocument();

        return [
            ...doc.querySelectorAll(
                '.ask-company-name'
            )
        ]
            .map(input => input.value.trim())
            .filter(Boolean);
    }

    function renderCompaniesTab() {
        const doc = getDocument();
        const content = doc?.getElementById(
            'asklipios-settings-content'
        );

        if (!content) return;

        const companies =
            clone(
                A.data.MEDICAL_CARD_COMPANIES || []
            );

        content.innerHTML = `
            <div class="ask-company-list">
                <div class="ask-card">
                    <h3 style="margin-top:0;">
                        Εταιρείες υλικών
                    </h3>

                    <p class="ask-muted">
                        Η σειρά εδώ είναι η σειρά που εμφανίζεται στην Ιατρική Καρτέλα.
                    </p>

                    <div id="asklipios-company-rows">
                        ${companies.map((company, index) => `
                            <div
                                class="ask-company-row"
                                data-index="${index}"
                            >
                                <strong>#${index + 1}</strong>

                                <input
                                    class="ask-input ask-company-name"
                                    value="${escapeHtml(company)}"
                                >

                                <div style="display:flex;gap:4px;">
                                    <button
                                        type="button"
                                        class="ask-btn ask-company-up"
                                    >▲</button>

                                    <button
                                        type="button"
                                        class="ask-btn ask-company-down"
                                    >▼</button>

                                    <button
                                        type="button"
                                        class="ask-btn ask-btn-danger ask-company-delete"
                                    >✕</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="ask-editor-toolbar" style="margin-top:10px;">
                        <button
                            type="button"
                            id="asklipios-add-company"
                            class="ask-btn ask-btn-primary"
                        >
                            + Νέα εταιρεία
                        </button>

                        <button
                            type="button"
                            id="asklipios-save-companies"
                            class="ask-btn ask-btn-success"
                        >
                            Αποθήκευση εταιρειών
                        </button>

                        <button
                            type="button"
                            id="asklipios-reset-companies"
                            class="ask-btn ask-btn-danger"
                        >
                            Επαναφορά εργοστασιακών
                        </button>
                    </div>
                </div>
            </div>
        `;

        function rerenderWith(values) {
            A.data.MEDICAL_CARD_COMPANIES.splice(
                0,
                A.data.MEDICAL_CARD_COMPANIES.length,
                ...values
            );

            renderCompaniesTab();
        }

        content.querySelectorAll(
            '.ask-company-delete'
        ).forEach(button => {
            button.onclick = () => {
                const values =
                    getCompanyRowsFromUi();

                const index = Number(
                    button.closest(
                        '.ask-company-row'
                    )?.dataset.index
                );

                values.splice(index, 1);
                rerenderWith(values);
            };
        });

        content.querySelectorAll(
            '.ask-company-up'
        ).forEach(button => {
            button.onclick = () => {
                const values =
                    getCompanyRowsFromUi();

                const index = Number(
                    button.closest(
                        '.ask-company-row'
                    )?.dataset.index
                );

                if (index <= 0) return;

                [values[index - 1], values[index]] = [
                    values[index],
                    values[index - 1]
                ];

                rerenderWith(values);
            };
        });

        content.querySelectorAll(
            '.ask-company-down'
        ).forEach(button => {
            button.onclick = () => {
                const values =
                    getCompanyRowsFromUi();

                const index = Number(
                    button.closest(
                        '.ask-company-row'
                    )?.dataset.index
                );

                if (
                    index < 0 ||
                    index >= values.length - 1
                ) {
                    return;
                }

                [values[index], values[index + 1]] = [
                    values[index + 1],
                    values[index]
                ];

                rerenderWith(values);
            };
        });

        doc.getElementById(
            'asklipios-add-company'
        ).onclick = () => {
            const values = getCompanyRowsFromUi();
            values.push('');
            rerenderWith(values);

            const inputs =
                content.querySelectorAll(
                    '.ask-company-name'
                );

            inputs[inputs.length - 1]?.focus();
        };

        doc.getElementById(
            'asklipios-save-companies'
        ).onclick = () => {
            try {
                const values =
                    getCompanyRowsFromUi();

                const unique = [
                    ...new Set(values)
                ];

                if (!unique.length) {
                    throw new Error(
                        'Πρέπει να υπάρχει τουλάχιστον μία εταιρεία.'
                    );
                }

                if (unique.length !== values.length) {
                    throw new Error(
                        'Υπάρχουν διπλότυπα ονόματα εταιρειών.'
                    );
                }

                A.localData.createBackup();

                A.registry.replaceArraySection(
                    'MEDICAL_CARD_COMPANIES',
                    unique
                );

                refreshHelperControls();
                renderCompaniesTab();

                setStatus(
                    'Οι εταιρείες αποθηκεύτηκαν τοπικά.',
                    'success'
                );
            } catch (error) {
                setStatus(
                    error.message,
                    'error'
                );
            }
        };

        doc.getElementById(
            'asklipios-reset-companies'
        ).onclick = () => {
            if (
                !confirm(
                    'Να επανέλθει η λίστα εταιρειών στην εργοστασιακή μορφή;'
                )
            ) {
                return;
            }

            A.localData.createBackup();

            A.registry.restoreArraySection(
                'MEDICAL_CARD_COMPANIES'
            );

            refreshHelperControls();
            renderCompaniesTab();

            setStatus(
                'Οι εταιρείες επανήλθαν στις εργοστασιακές τιμές.',
                'success'
            );
        };
    }

    function summarizeLocalState(localState) {
        const packagePatch =
            localState.mapPatches?.PACKAGES || {
                upserts: {},
                deleted: []
            };

        const companyReplacement =
            localState.arrayReplacements
                ?.MEDICAL_CARD_COMPANIES;

        return {
            modifiedOrNewPackages:
                Object.keys(
                    packagePatch.upserts || {}
                ).length,

            hiddenPackages:
                (packagePatch.deleted || []).length,

            customCompanyList:
                Array.isArray(companyReplacement),

            companyCount:
                Array.isArray(companyReplacement)
                    ? companyReplacement.length
                    : (
                        A.registry.getFactorySection(
                            'MEDICAL_CARD_COMPANIES'
                        ) || []
                    ).length,

            updatedAt:
                localState.updatedAt || '—'
        };
    }

    function downloadSettingsJson() {
        const doc = getDocument();
        if (!doc) return;

        const json = A.registry.exportJson();

        const blob = new Blob(
            [json],
            {
                type: 'application/json;charset=utf-8'
            }
        );

        const url =
            URL.createObjectURL(blob);

        const date =
            new Date()
                .toISOString()
                .slice(0, 10);

        const anchor =
            doc.createElement('a');

        anchor.href = url;
        anchor.download =
            `asklipios-settings-${date}.json`;

        doc.body.appendChild(anchor);
        anchor.click();
        anchor.remove();

        setTimeout(
            () => URL.revokeObjectURL(url),
            1000
        );

        setStatus(
            'Η εξαγωγή ρυθμίσεων δημιουργήθηκε.',
            'success'
        );
    }

    function importSettingsFile(file) {
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            try {
                const text =
                    String(reader.result || '');

                const parsed = JSON.parse(text);

                const normalized =
                    A.localData.normalizeState(
                        parsed.localData ?? parsed
                    );

                const summary =
                    summarizeLocalState(normalized);

                const preview =
                    `Πακέτα νέα/τροποποιημένα: ${summary.modifiedOrNewPackages}\n` +
                    `Κρυμμένα πακέτα: ${summary.hiddenPackages}\n` +
                    `Τοπική λίστα εταιρειών: ${summary.customCompanyList ? 'Ναι' : 'Όχι'}\n\n` +
                    'Να αντικατασταθούν οι τρέχουσες τοπικές ρυθμίσεις;';

                if (!confirm(preview)) {
                    return;
                }

                A.registry.importJson(text);

                const firstKey =
                    sortedKeys(A.data.PACKAGES)[0] || '';

                state.packageKey = firstKey;
                state.packageMode =
                    firstKey ? 'edit' : 'new';

                state.packageDraft =
                    firstKey
                        ? {
                            name: firstKey,
                            exams: clone(
                                A.data.PACKAGES[firstKey]
                            )
                        }
                        : {
                            name: '',
                            exams: []
                        };

                refreshHelperControls();
                renderActiveTab();

                setStatus(
                    'Οι ρυθμίσεις εισήχθησαν επιτυχώς.',
                    'success'
                );
            } catch (error) {
                setStatus(
                    `Αποτυχία εισαγωγής: ${error.message}`,
                    'error'
                );
            }
        };

        reader.onerror = () => {
            setStatus(
                'Δεν ήταν δυνατή η ανάγνωση του αρχείου.',
                'error'
            );
        };

        reader.readAsText(file, 'utf-8');
    }

    function renderBackupTab() {
        const doc = getDocument();
        const content = doc?.getElementById(
            'asklipios-settings-content'
        );

        if (!content) return;

        const summary =
            summarizeLocalState(
                A.registry.getState()
            );

        content.innerHTML = `
            <div class="ask-backup-grid">
                <div class="ask-card">
                    <h3 style="margin-top:0;">
                        Export / Import
                    </h3>

                    <p>
                        Η εξαγωγή περιέχει μόνο τις τοπικές αλλαγές σου.
                        Δεν περιέχει δεδομένα ασθενών.
                    </p>

                    <div class="ask-editor-toolbar">
                        <button
                            type="button"
                            id="asklipios-export-settings"
                            class="ask-btn ask-btn-primary"
                        >
                            Εξαγωγή JSON
                        </button>

                        <button
                            type="button"
                            id="asklipios-import-settings"
                            class="ask-btn ask-btn-primary"
                        >
                            Εισαγωγή JSON
                        </button>

                        <input
                            type="file"
                            id="asklipios-import-file"
                            accept=".json,application/json"
                            style="display:none;"
                        >
                    </div>

                    <div class="ask-code-summary">
Νέα/τροποποιημένα πακέτα: ${summary.modifiedOrNewPackages}
Κρυμμένα εργοστασιακά πακέτα: ${summary.hiddenPackages}
Τοπική λίστα εταιρειών: ${summary.customCompanyList ? 'Ναι' : 'Όχι'}
Αριθμός εταιρειών: ${summary.companyCount}
Τελευταία αλλαγή: ${summary.updatedAt}
                    </div>
                </div>

                <div class="ask-card">
                    <h3 style="margin-top:0;">
                        Επαναφορά
                    </h3>

                    <p>
                        Πριν από κάθε αποθήκευση που γίνεται από αυτό το panel,
                        διατηρείται ένα τελευταίο τοπικό backup.
                    </p>

                    <div style="display:flex;flex-direction:column;gap:8px;">
                        <button
                            type="button"
                            id="asklipios-restore-backup"
                            class="ask-btn"
                        >
                            Επαναφορά τελευταίου backup
                        </button>

                        <button
                            type="button"
                            id="asklipios-reset-all-settings"
                            class="ask-btn ask-btn-danger"
                        >
                            Διαγραφή όλων των τοπικών αλλαγών
                        </button>
                    </div>
                </div>
            </div>
        `;

        doc.getElementById(
            'asklipios-export-settings'
        ).onclick = downloadSettingsJson;

        doc.getElementById(
            'asklipios-import-settings'
        ).onclick = () => {
            doc.getElementById(
                'asklipios-import-file'
            ).click();
        };

        doc.getElementById(
            'asklipios-import-file'
        ).onchange = event => {
            importSettingsFile(
                event.target.files?.[0]
            );

            event.target.value = '';
        };

        doc.getElementById(
            'asklipios-restore-backup'
        ).onclick = () => {
            if (
                !confirm(
                    'Να επανέλθει το τελευταίο τοπικό backup;'
                )
            ) {
                return;
            }

            try {
                A.registry.restoreBackup();
                refreshHelperControls();
                renderActiveTab();

                setStatus(
                    'Το τελευταίο backup επανήλθε.',
                    'success'
                );
            } catch (error) {
                setStatus(
                    error.message,
                    'error'
                );
            }
        };

        doc.getElementById(
            'asklipios-reset-all-settings'
        ).onclick = () => {
            if (
                !confirm(
                    'ΠΡΟΣΟΧΗ: Να διαγραφούν όλες οι τοπικές αλλαγές και να επανέλθουν τα δεδομένα του GitHub;'
                )
            ) {
                return;
            }

            A.registry.resetAll();

            const firstKey =
                sortedKeys(A.data.PACKAGES)[0] || '';

            state.packageKey = firstKey;
            state.packageMode =
                firstKey ? 'edit' : 'new';

            state.packageDraft =
                firstKey
                    ? {
                        name: firstKey,
                        exams: clone(
                            A.data.PACKAGES[firstKey]
                        )
                    }
                    : {
                        name: '',
                        exams: []
                    };

            refreshHelperControls();
            renderActiveTab();

            setStatus(
                'Όλες οι τοπικές αλλαγές διαγράφηκαν.',
                'success'
            );
        };
    }

    function renderPlaceholderTab(kind) {
        const doc = getDocument();
        const content = doc?.getElementById(
            'asklipios-settings-content'
        );

        if (!content) return;

        const isSurgery =
            kind === 'surgery';

        content.innerHTML = `
            <div class="ask-placeholder">
                <div style="font-size:42px;">
                    ${isSurgery ? '📝' : '🩺'}
                </div>

                <h2>
                    ${
                        isSurgery
                            ? 'Πρότυπα πρακτικών χειρουργείου'
                            : 'Presets, διαγνώσεις και ιατρικές πράξεις'
                    }
                </h2>

                <p>
                    Η υποδομή τοπικής αποθήκευσης είναι ήδη έτοιμη.
                    Ο πλήρης editor αυτής της ενότητας θα προστεθεί στην επόμενη έκδοση.
                </p>
            </div>
        `;
    }

    function renderActiveTab() {
        const doc = getDocument();

        doc?.querySelectorAll(
            `#${PANEL_ID} .ask-tab`
        ).forEach(button => {
            button.classList.toggle(
                'active',
                button.dataset.tab === state.activeTab
            );
        });

        const externalRenderer =
            externalTabRenderers[state.activeTab];

        if (typeof externalRenderer === 'function') {
            externalRenderer({
                document: doc,
                content: doc?.getElementById(
                    'asklipios-settings-content'
                ),
                setStatus,
                refreshHelperControls,
                escapeHtml,
                clone,
                sortedKeys
            });
            return;
        }

        if (state.activeTab === 'labs') {
            renderLabsTab();
        } else if (state.activeTab === 'companies') {
            renderCompaniesTab();
        } else if (state.activeTab === 'backup') {
            renderBackupTab();
        } else if (state.activeTab === 'presets') {
            renderPlaceholderTab('presets');
        } else if (state.activeTab === 'surgery') {
            renderPlaceholderTab('surgery');
        }
    }

    function closeSettingsPanel() {
        getDocument()
            ?.getElementById(PANEL_ID)
            ?.remove();
    }

    function openSettingsPanel() {
        const doc = getDocument();

        if (!doc?.body) return;

        ensureStyle(doc);

        doc.getElementById(PANEL_ID)?.remove();

        const overlay = doc.createElement('div');
        overlay.id = PANEL_ID;

        overlay.innerHTML = `
            <div class="ask-settings-window">
                <div class="ask-settings-header">
                    <div>
                        <div class="ask-settings-title">
                            ⚙ Ρυθμίσεις Asklipios
                        </div>

                        <div class="ask-muted">
                            Οι αλλαγές αποθηκεύονται μόνο στον συγκεκριμένο browser.
                        </div>
                    </div>

                    <button
                        type="button"
                        id="asklipios-settings-close"
                        class="ask-btn"
                        style="font-size:18px;"
                    >
                        ✕
                    </button>
                </div>

                <div class="ask-settings-tabs">
                    <button
                        type="button"
                        class="ask-tab"
                        data-tab="labs"
                    >
                        Εργαστηριακά
                    </button>

                    <button
                        type="button"
                        class="ask-tab"
                        data-tab="companies"
                    >
                        Εταιρείες
                    </button>

                    <button
                        type="button"
                        class="ask-tab"
                        data-tab="presets"
                    >
                        Presets
                    </button>

                    <button
                        type="button"
                        class="ask-tab"
                        data-tab="surgery"
                    >
                        Πρακτικά
                    </button>

                    <button
                        type="button"
                        class="ask-tab"
                        data-tab="backup"
                    >
                        Backup
                    </button>
                </div>

                <div
                    id="asklipios-settings-content"
                    class="ask-settings-content"
                ></div>

                <div
                    id="asklipios-settings-status"
                    class="ask-status"
                    style="margin:0 12px 10px;"
                >
                    Έτοιμο.
                </div>
            </div>
        `;

        doc.body.appendChild(overlay);

        doc.getElementById(
            'asklipios-settings-close'
        ).onclick = closeSettingsPanel;

        overlay.onclick = event => {
            if (event.target === overlay) {
                closeSettingsPanel();
            }
        };

        overlay.querySelectorAll(
            '.ask-tab'
        ).forEach(button => {
            button.onclick = () => {
                state.activeTab =
                    button.dataset.tab;

                renderActiveTab();
                setStatus('Έτοιμο.');
            };
        });

        if (
            !state.packageKey &&
            !state.packageDraft
        ) {
            const firstKey =
                sortedKeys(A.data.PACKAGES)[0] || '';

            state.packageKey = firstKey;
            state.packageMode =
                firstKey ? 'edit' : 'new';

            state.packageDraft =
                firstKey
                    ? {
                        name: firstKey,
                        exams: clone(
                            A.data.PACKAGES[firstKey]
                        )
                    }
                    : {
                        name: '',
                        exams: []
                    };
        }

        renderActiveTab();
    }

    function attachGear() {
        const doc = getDocument();
        const header = doc?.getElementById(
            'lab-helper-header'
        );

        if (!header) return false;

        if (doc.getElementById(GEAR_ID)) {
            return true;
        }

        const toggle =
            doc.getElementById('lab-toggle');

        const gear = doc.createElement('button');
        gear.id = GEAR_ID;
        gear.type = 'button';
        gear.textContent = '⚙';
        gear.title = 'Ρυθμίσεις Asklipios';

        gear.style.border = '1px solid #777';
        gear.style.background = '#f4f4f4';
        gear.style.borderRadius = '4px';
        gear.style.width = '29px';
        gear.style.height = '27px';
        gear.style.fontSize = '16px';
        gear.style.cursor = 'pointer';
        gear.style.flex = '0 0 auto';

        gear.onclick = event => {
            event.preventDefault();
            event.stopPropagation();
            openSettingsPanel();
        };

        if (toggle) {
            header.insertBefore(gear, toggle);
        } else {
            header.appendChild(gear);
        }

        return true;
    }

    function startGearWatcher() {
        let attempts = 0;

        const timer = setInterval(() => {
            attempts++;

            if (attachGear() || attempts >= 40) {
                clearInterval(timer);
            }
        }, 500);
    }

    window.addEventListener(
        'asklipios:data-changed',
        refreshHelperControls
    );

    A.settingsUi = {
        open: openSettingsPanel,
        close: closeSettingsPanel,
        refresh: refreshHelperControls,
        rerender: renderActiveTab,
        setStatus,

        registerTab(tabId, renderer) {
            if (!tabId || typeof renderer !== 'function') {
                throw new Error(
                    'Invalid Asklipios settings tab renderer.'
                );
            }

            externalTabRenderers[tabId] = renderer;

            if (state.activeTab === tabId) {
                renderActiveTab();
            }
        }
    };

    A.modules.settingsUi = {
        loaded: true,
        version: '0.9.0'
    };

    startGearWatcher();

    console.log(
        'Asklipios settings UI loaded'
    );
})();
