/*
 * Asklipios — Local Data Store
 *
 * Version 0.7.0
 *
 * Stores only user-created configuration and overrides.
 * Patient data must never be written here.
 */

(function () {
    'use strict';

    const A = window.Asklipios;

    if (!A) {
        throw new Error(
            'Asklipios namespace is missing. Load 00-namespace.js first.'
        );
    }

    A.modules = A.modules || {};

    const STORAGE_KEY = 'asklipios.local-data.v1';
    const BACKUP_KEY = 'asklipios.local-data.backup.v1';
    const SCHEMA_VERSION = 1;

    const MAP_SECTIONS = [
        'PACKAGES',
        'EXTRA_EXAMS',
        'DIAGNOSIS_OPTIONS',
        'MEDICAL_CARD_PRESETS',
        'MEDICAL_ACT_OPTIONS',
        'DOCTOR_FOLLOWUP_TEXTS',
        'ANTICOAGULATION_TEXTS',
        'DOCTOR_DISCHARGE_TEXTS',
        'PRESET_DISCHARGE_TEXTS',
        'SURGERY_DESCRIPTIONS'
    ];

    const ARRAY_SECTIONS = [
        'MEDICAL_CARD_COMPANIES'
    ];

    function isPlainObject(value) {
        return (
            value !== null &&
            typeof value === 'object' &&
            !Array.isArray(value)
        );
    }

    function clone(value) {
        if (typeof structuredClone === 'function') {
            return structuredClone(value);
        }

        return JSON.parse(JSON.stringify(value));
    }

    function createEmptyPatch() {
        return {
            upserts: {},
            deleted: []
        };
    }

    function createEmptyState() {
        const mapPatches = {};

        MAP_SECTIONS.forEach(section => {
            mapPatches[section] = createEmptyPatch();
        });

        const arrayReplacements = {};

        ARRAY_SECTIONS.forEach(section => {
            arrayReplacements[section] = null;
        });

        return {
            schemaVersion: SCHEMA_VERSION,
            updatedAt: null,
            mapPatches,
            arrayReplacements
        };
    }

    function uniqueStrings(values) {
        if (!Array.isArray(values)) return [];

        return [
            ...new Set(
                values
                    .map(value => String(value))
                    .filter(Boolean)
            )
        ];
    }

    function normalizePatch(value) {
        const patch = createEmptyPatch();

        if (!isPlainObject(value)) {
            return patch;
        }

        if (isPlainObject(value.upserts)) {
            patch.upserts = clone(value.upserts);
        }

        patch.deleted = uniqueStrings(value.deleted);

        return patch;
    }

    function normalizeState(value) {
        const result = createEmptyState();

        if (!isPlainObject(value)) {
            return result;
        }

        if (
            value.schemaVersion !== undefined &&
            Number(value.schemaVersion) !== SCHEMA_VERSION
        ) {
            throw new Error(
                `Unsupported Asklipios settings schema: ${value.schemaVersion}`
            );
        }

        if (isPlainObject(value.mapPatches)) {
            MAP_SECTIONS.forEach(section => {
                result.mapPatches[section] =
                    normalizePatch(value.mapPatches[section]);
            });
        }

        if (isPlainObject(value.arrayReplacements)) {
            ARRAY_SECTIONS.forEach(section => {
                const replacement =
                    value.arrayReplacements[section];

                result.arrayReplacements[section] =
                    Array.isArray(replacement)
                        ? clone(replacement)
                        : null;
            });
        }

        result.updatedAt =
            typeof value.updatedAt === 'string'
                ? value.updatedAt
                : null;

        return result;
    }

    function parseStoredValue(value) {
        if (typeof value !== 'string') {
            return value;
        }

        const trimmed = value.trim();

        if (!trimmed) return null;

        try {
            return JSON.parse(trimmed);
        } catch {
            return null;
        }
    }

    function readStorage(key) {
        if (typeof GM_getValue === 'function') {
            return GM_getValue(key, null);
        }

        try {
            return window.localStorage.getItem(key);
        } catch {
            return null;
        }
    }

    function writeStorage(key, value) {
        if (typeof GM_setValue === 'function') {
            GM_setValue(key, value);
            return;
        }

        window.localStorage.setItem(
            key,
            JSON.stringify(value)
        );
    }

    function deleteStorage(key) {
        if (typeof GM_deleteValue === 'function') {
            GM_deleteValue(key);
            return;
        }

        try {
            window.localStorage.removeItem(key);
        } catch {
            // Ignore localStorage cleanup failures.
        }
    }

    let cachedState = null;

    function load({ force = false } = {}) {
        if (!force && cachedState) {
            return clone(cachedState);
        }

        const raw = parseStoredValue(
            readStorage(STORAGE_KEY)
        );

        try {
            cachedState = normalizeState(raw);
        } catch (error) {
            console.error(
                'Asklipios local settings could not be loaded:',
                error
            );

            cachedState = createEmptyState();
        }

        return clone(cachedState);
    }

    function save(state) {
        const normalized = normalizeState(state);

        normalized.updatedAt =
            new Date().toISOString();

        writeStorage(STORAGE_KEY, normalized);
        cachedState = normalized;

        return clone(cachedState);
    }

    function createBackup() {
        const backup = {
            schemaVersion: SCHEMA_VERSION,
            createdAt: new Date().toISOString(),
            state: load()
        };

        writeStorage(BACKUP_KEY, backup);

        return clone(backup);
    }

    function loadBackup() {
        const raw = parseStoredValue(
            readStorage(BACKUP_KEY)
        );

        if (!isPlainObject(raw) || !raw.state) {
            return null;
        }

        return clone(raw);
    }

    function restoreBackup() {
        const backup = loadBackup();

        if (!backup) {
            throw new Error(
                'Δεν υπάρχει διαθέσιμο τοπικό backup ρυθμίσεων.'
            );
        }

        return save(backup.state);
    }

    function reset() {
        createBackup();
        deleteStorage(STORAGE_KEY);
        cachedState = createEmptyState();

        return clone(cachedState);
    }

    function exportJson() {
        return JSON.stringify(
            {
                application: 'Asklipios',
                exportVersion: 1,
                exportedAt: new Date().toISOString(),
                localData: load()
            },
            null,
            2
        );
    }

    function importJson(input) {
        let parsed = input;

        if (typeof input === 'string') {
            try {
                parsed = JSON.parse(input);
            } catch {
                throw new Error(
                    'Το αρχείο ρυθμίσεων δεν περιέχει έγκυρο JSON.'
                );
            }
        }

        if (!isPlainObject(parsed)) {
            throw new Error(
                'Μη έγκυρη μορφή αρχείου ρυθμίσεων.'
            );
        }

        const importedState =
            parsed.localData ?? parsed;

        createBackup();

        return save(importedState);
    }

    A.localData = {
        schemaVersion: SCHEMA_VERSION,
        storageKey: STORAGE_KEY,
        backupKey: BACKUP_KEY,
        mapSections: [...MAP_SECTIONS],
        arraySections: [...ARRAY_SECTIONS],

        clone,
        createEmptyState,
        normalizeState,
        load,
        save,
        reset,
        createBackup,
        loadBackup,
        restoreBackup,
        exportJson,
        importJson
    };

    A.modules.localDataStore = {
        loaded: true,
        version: '0.7.0',
        storage:
            typeof GM_getValue === 'function'
                ? 'Tampermonkey'
                : 'localStorage fallback'
    };

    console.log(
        'Asklipios local data store loaded',
        {
            schemaVersion: SCHEMA_VERSION,
            storage:
                A.modules.localDataStore.storage
        }
    );
})();
