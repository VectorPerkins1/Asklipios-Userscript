/*
 * Asklipios — Data Registry
 *
 * Version 0.7.0
 *
 * Combines factory data from GitHub modules with local user overrides.
 * Existing application code continues to read from A.data.
 */

(function () {
    'use strict';

    const A = window.Asklipios;

    if (!A?.data) {
        throw new Error(
            'Asklipios factory data is missing. Load data modules first.'
        );
    }

    if (!A.localData) {
        throw new Error(
            'Asklipios local data store is missing. Load 15-local-data-store.js first.'
        );
    }

    A.modules = A.modules || {};

    const MAP_SECTIONS = [
        ...A.localData.mapSections
    ];

    const ARRAY_SECTIONS = [
        ...A.localData.arraySections
    ];

    function clone(value) {
        return A.localData.clone(value);
    }

    function isPlainObject(value) {
        return (
            value !== null &&
            typeof value === 'object' &&
            !Array.isArray(value)
        );
    }

    const factoryData = {};

    [...MAP_SECTIONS, ...ARRAY_SECTIONS].forEach(section => {
        factoryData[section] =
            clone(A.data[section]);
    });

    function applyMapPatch(baseValue, patch) {
        const result =
            isPlainObject(baseValue)
                ? clone(baseValue)
                : {};

        const upserts =
            isPlainObject(patch?.upserts)
                ? patch.upserts
                : {};

        Object.entries(upserts).forEach(([key, value]) => {
            result[key] = clone(value);
        });

        const deleted =
            Array.isArray(patch?.deleted)
                ? patch.deleted
                : [];

        deleted.forEach(key => {
            delete result[key];
        });

        return result;
    }

    function replaceObjectContents(target, source) {
        Object.keys(target).forEach(key => {
            delete target[key];
        });

        Object.entries(source).forEach(([key, value]) => {
            target[key] = clone(value);
        });
    }

    function replaceArrayContents(target, source) {
        target.splice(
            0,
            target.length,
            ...clone(source)
        );
    }

    function ensureObjectSection(section) {
        if (!isPlainObject(A.data[section])) {
            A.data[section] = {};
        }

        return A.data[section];
    }

    function ensureArraySection(section) {
        if (!Array.isArray(A.data[section])) {
            A.data[section] = [];
        }

        return A.data[section];
    }

    let currentState = A.localData.load();

    function rebuild({
        persist = false,
        reason = 'rebuild'
    } = {}) {
        currentState =
            A.localData.normalizeState(currentState);

        if (persist) {
            currentState =
                A.localData.save(currentState);
        }

        MAP_SECTIONS.forEach(section => {
            const effectiveValue = applyMapPatch(
                factoryData[section],
                currentState.mapPatches[section]
            );

            replaceObjectContents(
                ensureObjectSection(section),
                effectiveValue
            );
        });

        ARRAY_SECTIONS.forEach(section => {
            const localReplacement =
                currentState.arrayReplacements[section];

            const effectiveValue =
                Array.isArray(localReplacement)
                    ? localReplacement
                    : factoryData[section];

            replaceArrayContents(
                ensureArraySection(section),
                effectiveValue
            );
        });

        try {
            window.dispatchEvent(
                new CustomEvent(
                    'asklipios:data-changed',
                    {
                        detail: {
                            reason,
                            updatedAt:
                                currentState.updatedAt
                        }
                    }
                )
            );
        } catch {
            // Event dispatch is optional.
        }

        return getSummary();
    }

    function getSummary() {
        return {
            mapSections:
                Object.fromEntries(
                    MAP_SECTIONS.map(section => [
                        section,
                        Object.keys(
                            A.data[section] || {}
                        ).length
                    ])
                ),

            arraySections:
                Object.fromEntries(
                    ARRAY_SECTIONS.map(section => [
                        section,
                        Array.isArray(A.data[section])
                            ? A.data[section].length
                            : 0
                    ])
                ),

            updatedAt:
                currentState.updatedAt
        };
    }

    function assertMapSection(section) {
        if (!MAP_SECTIONS.includes(section)) {
            throw new Error(
                `Unsupported map section: ${section}`
            );
        }
    }

    function assertArraySection(section) {
        if (!ARRAY_SECTIONS.includes(section)) {
            throw new Error(
                `Unsupported array section: ${section}`
            );
        }
    }

    function getState() {
        return clone(currentState);
    }

    function getSection(section) {
        if (
            !MAP_SECTIONS.includes(section) &&
            !ARRAY_SECTIONS.includes(section)
        ) {
            throw new Error(
                `Unknown Asklipios data section: ${section}`
            );
        }

        return clone(A.data[section]);
    }

    function getFactorySection(section) {
        if (
            !MAP_SECTIONS.includes(section) &&
            !ARRAY_SECTIONS.includes(section)
        ) {
            throw new Error(
                `Unknown Asklipios factory section: ${section}`
            );
        }

        return clone(factoryData[section]);
    }

    function setMapItem(section, key, value) {
        assertMapSection(section);

        const itemKey = String(key).trim();

        if (!itemKey) {
            throw new Error(
                'Το όνομα του στοιχείου δεν μπορεί να είναι κενό.'
            );
        }

        const patch =
            currentState.mapPatches[section];

        patch.upserts[itemKey] = clone(value);
        patch.deleted =
            patch.deleted.filter(
                deletedKey => deletedKey !== itemKey
            );

        return rebuild({
            persist: true,
            reason: `${section}:set:${itemKey}`
        });
    }

    function deleteMapItem(section, key) {
        assertMapSection(section);

        const itemKey = String(key).trim();

        const existsInFactory =
            Object.prototype.hasOwnProperty.call(
                factoryData[section] || {},
                itemKey
            );

        const patch =
            currentState.mapPatches[section];

        delete patch.upserts[itemKey];

        if (existsInFactory) {
            if (!patch.deleted.includes(itemKey)) {
                patch.deleted.push(itemKey);
            }
        } else {
            patch.deleted =
                patch.deleted.filter(
                    deletedKey => deletedKey !== itemKey
                );
        }

        return rebuild({
            persist: true,
            reason: `${section}:delete:${itemKey}`
        });
    }

    function restoreMapItem(section, key) {
        assertMapSection(section);

        const itemKey = String(key).trim();
        const patch =
            currentState.mapPatches[section];

        delete patch.upserts[itemKey];

        patch.deleted =
            patch.deleted.filter(
                deletedKey => deletedKey !== itemKey
            );

        return rebuild({
            persist: true,
            reason: `${section}:restore:${itemKey}`
        });
    }

    function renameMapItem(
        section,
        oldKey,
        newKey
    ) {
        assertMapSection(section);

        const sourceKey = String(oldKey).trim();
        const targetKey = String(newKey).trim();

        if (!sourceKey || !targetKey) {
            throw new Error(
                'Το παλιό και το νέο όνομα είναι υποχρεωτικά.'
            );
        }

        if (sourceKey === targetKey) {
            return getSummary();
        }

        const currentSection =
            A.data[section] || {};

        if (
            !Object.prototype.hasOwnProperty.call(
                currentSection,
                sourceKey
            )
        ) {
            throw new Error(
                `Δεν βρέθηκε το στοιχείο "${sourceKey}".`
            );
        }

        if (
            Object.prototype.hasOwnProperty.call(
                currentSection,
                targetKey
            )
        ) {
            throw new Error(
                `Υπάρχει ήδη στοιχείο με όνομα "${targetKey}".`
            );
        }

        const value =
            clone(currentSection[sourceKey]);

        setMapItem(section, targetKey, value);
        return deleteMapItem(section, sourceKey);
    }

    function replaceArraySection(section, values) {
        assertArraySection(section);

        if (!Array.isArray(values)) {
            throw new Error(
                `${section} must be an array.`
            );
        }

        currentState.arrayReplacements[section] =
            clone(values);

        return rebuild({
            persist: true,
            reason: `${section}:replace`
        });
    }

    function restoreArraySection(section) {
        assertArraySection(section);

        currentState.arrayReplacements[section] =
            null;

        return rebuild({
            persist: true,
            reason: `${section}:restore`
        });
    }

    function resetSection(section) {
        if (MAP_SECTIONS.includes(section)) {
            currentState.mapPatches[section] = {
                upserts: {},
                deleted: []
            };
        } else if (ARRAY_SECTIONS.includes(section)) {
            currentState.arrayReplacements[section] =
                null;
        } else {
            throw new Error(
                `Unknown Asklipios data section: ${section}`
            );
        }

        return rebuild({
            persist: true,
            reason: `${section}:reset`
        });
    }

    function resetAll() {
        currentState =
            A.localData.reset();

        return rebuild({
            persist: false,
            reason: 'reset-all'
        });
    }

    function exportJson() {
        return A.localData.exportJson();
    }

    function importJson(input) {
        currentState =
            A.localData.importJson(input);

        return rebuild({
            persist: false,
            reason: 'import'
        });
    }

    function restoreBackup() {
        currentState =
            A.localData.restoreBackup();

        return rebuild({
            persist: false,
            reason: 'restore-backup'
        });
    }

    A.registry = {
        mapSections: [...MAP_SECTIONS],
        arraySections: [...ARRAY_SECTIONS],

        rebuild,
        getSummary,
        getState,
        getSection,
        getFactorySection,

        setMapItem,
        deleteMapItem,
        restoreMapItem,
        renameMapItem,

        replaceArraySection,
        restoreArraySection,

        resetSection,
        resetAll,
        exportJson,
        importJson,
        restoreBackup
    };

    rebuild({
        persist: false,
        reason: 'initial-load'
    });

    A.modules.dataRegistry = {
        loaded: true,
        version: '0.7.0'
    };

    console.log(
        'Asklipios data registry loaded',
        getSummary()
    );
})();
