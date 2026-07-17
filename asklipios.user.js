// ==UserScript==
// @name         Asklipios Modular
// @namespace    https://github.com/VectorPerkins1/Asklipios-Userscript
// @version      0.6.0
// @description  Modular tools for the Asklipios hospital system
// @match        *://care.ghl.medical:51021/*
// @match        *://10.136.33.126:51021/*
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/00-namespace.js?v=0.6.0
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/10-lab-data.js?v=0.6.0
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/20-medical-card-data.js?v=0.6.0
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/30-xray-data.js?v=0.6.0
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/90-legacy-app.js?v=0.6.0
// @run-at       document-idle
// @grant        none
// Copyright ©   Papageorgoulis 2026
// ==/UserScript==

(function () {
    'use strict';

    console.log('Asklipios Modular loader 0.6.0 loaded');
    console.log('Loaded modules:', window.Asklipios?.modules);
})();
