/*
 * Asklipios — Live Laboratory Exam Catalog
 * Version 0.10.0
 *
 * Loads the official examination tree from the active Care session.
 * No patient information is stored or transmitted by this module.
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

    const ENDPOINT =
        '/laboratory-exams/exam-tree' +
        '?laboratory_mode=0&patho_lab_ids=';

    let tree = [];
    let exams = [];
    let loadedAt = null;
    let lastError = null;
    let loadingPromise = null;

    function clone(value) {
        if (typeof structuredClone === 'function') {
            return structuredClone(value);
        }

        return JSON.parse(JSON.stringify(value));
    }

    function normalizeSearchText(value) {
        return String(value ?? '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLocaleUpperCase('el')
            .replace(/[ΑΒΕΖΗΙΚΜΝΟΡΤΥΧ]/g, character => ({
                Α: 'A',
                Β: 'B',
                Ε: 'E',
                Ζ: 'Z',
                Η: 'H',
                Ι: 'I',
                Κ: 'K',
                Μ: 'M',
                Ν: 'N',
                Ο: 'O',
                Ρ: 'P',
                Τ: 'T',
                Υ: 'Y',
                Χ: 'X'
            })[character])
            .replace(/\s+/g, ' ')
            .trim();
    }

    function normalizeExam(test, labNode, depNode) {
        return {
            ...clone(test),

            lab: Number(test?.lab ?? labNode?.lab ?? 0),
            dep: Number(test?.dep ?? depNode?.dep ?? 0),
            test: Number(test?.test ?? 0),
            hisCode: Number(test?.hisCode ?? 0),
            testOrderBy: Number(test?.testOrderBy ?? 0),

            testDescr: String(test?.testDescr || '').trim(),
            abbr: String(test?.abbr || '').trim(),
            labDescr: String(labNode?.labDescr || '').trim(),
            depDescr: String(depNode?.depDescr || '').trim(),

            isPatho: test?.isPatho === true,
            category: test?.category ?? 1,
            topology: test?.topology ?? null,
            isUrgent: test?.isUrgent === true
        };
    }

    function flattenTree(nodes) {
        const result = [];

        (Array.isArray(nodes) ? nodes : []).forEach(labNode => {
            (Array.isArray(labNode?.deps) ? labNode.deps : [])
                .forEach(depNode => {
                    (Array.isArray(depNode?.tests) ? depNode.tests : [])
                        .forEach(test => {
                            const normalized = normalizeExam(
                                test,
                                labNode,
                                depNode
                            );

                            if (
                                normalized.lab &&
                                normalized.dep &&
                                normalized.test &&
                                normalized.testDescr
                            ) {
                                result.push(normalized);
                            }
                        });
                });
        });

        return result;
    }

    function examKey(exam) {
        return [
            exam.lab,
            exam.dep,
            exam.test,
            exam.hisCode
        ].join('|');
    }

    function dedupeExamList(list) {
        const map = new Map();

        list.forEach(exam => {
            const key = examKey(exam);
            if (!map.has(key)) map.set(key, exam);
        });

        return [...map.values()];
    }

    function scoreExam(exam, query) {
        if (!query) return 1;

        const abbr = normalizeSearchText(exam.abbr);
        const description = normalizeSearchText(exam.testDescr);
        const lab = normalizeSearchText(exam.labDescr);
        const department = normalizeSearchText(exam.depDescr);

        if (abbr === query) return 100;
        if (description === query) return 95;
        if (abbr.startsWith(query)) return 85;
        if (description.startsWith(query)) return 80;
        if (abbr.includes(query)) return 70;
        if (description.includes(query)) return 65;
        if (`${lab} ${department}`.includes(query)) return 35;

        const words = query.split(' ').filter(Boolean);
        const haystack = `${abbr} ${description} ${lab} ${department}`;

        if (words.length && words.every(word => haystack.includes(word))) {
            return 45;
        }

        return 0;
    }

    async function load({ force = false } = {}) {
        if (!force && exams.length) {
            return getState();
        }

        if (!force && loadingPromise) {
            return loadingPromise;
        }

        loadingPromise = (async () => {
            lastError = null;

            const response = await fetch(
                new URL(ENDPOINT, window.location.origin).href,
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        Accept: 'application/json'
                    },
                    cache: 'no-store'
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Αποτυχία φόρτωσης εξετάσεων (HTTP ${response.status}).`
                );
            }

            const payload = await response.json();

            if (!payload?.success || !Array.isArray(payload.data)) {
                throw new Error(
                    'Ο Ασκληπιός επέστρεψε μη αναμενόμενη μορφή καταλόγου εξετάσεων.'
                );
            }

            const flattened = dedupeExamList(
                flattenTree(payload.data)
            );

            if (!flattened.length) {
                throw new Error(
                    'Ο κατάλογος εξετάσεων φορτώθηκε χωρίς διαθέσιμες εξετάσεις.'
                );
            }

            tree = clone(payload.data);
            exams = flattened;
            loadedAt = new Date().toISOString();

            return getState();
        })();

        try {
            return await loadingPromise;
        } catch (error) {
            lastError = error?.message || String(error);
            throw error;
        } finally {
            loadingPromise = null;
        }
    }

    function search(
        query = '',
        {
            lab = '',
            dep = '',
            limit = 250
        } = {}
    ) {
        const normalizedQuery = normalizeSearchText(query);
        const labValue = lab === '' ? '' : String(lab);
        const depValue = dep === '' ? '' : String(dep);

        return exams
            .filter(exam =>
                (!labValue || String(exam.lab) === labValue) &&
                (!depValue || String(exam.dep) === depValue)
            )
            .map(exam => ({
                exam,
                score: scoreExam(exam, normalizedQuery)
            }))
            .filter(item => !normalizedQuery || item.score > 0)
            .sort((a, b) =>
                b.score - a.score ||
                `${a.exam.abbr} ${a.exam.testDescr}`.localeCompare(
                    `${b.exam.abbr} ${b.exam.testDescr}`,
                    'el'
                )
            )
            .slice(0, Math.max(1, Number(limit) || 250))
            .map(item => clone(item.exam));
    }

    function getLabs() {
        const map = new Map();

        exams.forEach(exam => {
            if (!map.has(String(exam.lab))) {
                map.set(String(exam.lab), {
                    lab: exam.lab,
                    labDescr: exam.labDescr
                });
            }
        });

        return [...map.values()].sort((a, b) =>
            a.labDescr.localeCompare(b.labDescr, 'el')
        );
    }

    function getDepartments(lab = '') {
        const labValue = lab === '' ? '' : String(lab);
        const map = new Map();

        exams
            .filter(exam =>
                !labValue || String(exam.lab) === labValue
            )
            .forEach(exam => {
                const key = `${exam.lab}|${exam.dep}`;

                if (!map.has(key)) {
                    map.set(key, {
                        lab: exam.lab,
                        dep: exam.dep,
                        labDescr: exam.labDescr,
                        depDescr: exam.depDescr
                    });
                }
            });

        return [...map.values()].sort((a, b) =>
            `${a.labDescr} ${a.depDescr}`.localeCompare(
                `${b.labDescr} ${b.depDescr}`,
                'el'
            )
        );
    }

    function getState() {
        return {
            endpoint: ENDPOINT,
            loaded: exams.length > 0,
            loading: Boolean(loadingPromise),
            count: exams.length,
            loadedAt,
            lastError
        };
    }

    A.labCatalog = {
        endpoint: ENDPOINT,
        load,
        search,
        getLabs,
        getDepartments,
        getState,
        getAll() {
            return clone(exams);
        },
        getTree() {
            return clone(tree);
        },
        normalizeSearchText
    };

    A.modules.labCatalog = {
        loaded: true,
        version: '0.10.0'
    };

    console.log(
        'Asklipios live laboratory catalog module loaded'
    );
})();
