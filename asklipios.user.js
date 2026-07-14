// ==UserScript==
// @name         Asklipios Modular
// @namespace    https://github.com/VectorPerkins1/Asklipios-Userscript
// @version      0.2.1
// @description  Modular tools for the Asklipios hospital system
//
// @match        *://care.ghl.medical:51021/*
// @match        *://10.136.33.126:51021/*
//
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/00-namespace.js?v=0.2.1
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/10-lab-data.js?v=0.2.1
// @require      https://raw.githubusercontent.com/VectorPerkins1/Asklipios-Userscript/main/src/90-legacy-app.js?v=0.2.0
//
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    console.log('Asklipios Modular loader 0.2.1 loaded');
    console.log('Shared namespace:', window.Asklipios);
})();
