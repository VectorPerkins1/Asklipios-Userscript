// ==UserScript==
// @name         Asklipios Modular
// @namespace    https://github.com/VectorPerkins1/Asklipios-Userscript
// @version      0.13.3
// @description  Modular tools for the Asklipios hospital system
// @match        *://care.ghl.medical:51021/*
// @match        *://10.136.33.126:51021/*
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/00-namespace.js?v=0.13.3
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/10-lab-data.js?v=0.13.3
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/12-lab-catalog.js?v=0.13.3
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/15-local-data-store.js?v=0.13.3
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/20-medical-card-data.js?v=0.13.3
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/30-xray-data.js?v=0.13.3
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/35-data-registry.js?v=0.13.3
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/22-clinical-catalog.js?v=0.13.3
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/90-legacy-app.js?v=0.13.3
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/55-daily-overview.js?v=0.13.3
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/45-settings-ui.js?v=0.13.3
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/46-clinical-settings-ui.js?v=0.13.3
// @run-at       document-idle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// Copyright ©   Papageorgoulis 2026
// ==/UserScript==

(function () {
    'use strict';

    console.log('Asklipios Modular loader 0.13.3 loaded');
    console.log('Loaded modules:', window.Asklipios?.modules);
})();
