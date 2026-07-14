/*
 * Asklipios — Laboratory data
 * Πακέτα και πρόσθετες εργαστηριακές εξετάσεις.
 */

(function () {
    'use strict';

    const A = window.Asklipios;

    if (!A) {
        throw new Error(
            'Asklipios namespace is missing. Load 00-namespace.js first.'
        );
    }

    A.data = A.data || {};
    A.modules = A.modules || {};

    A.data.PACKAGES = {
       "ΓΕΝΙΚΗ ΑΙΜΑΤΟΣ": [
            {test:1,testDescr:"ΓΕΝΙΚΗ ΑΙΜΑΤΟΣ",abbr:"Γ.ΑΙΜΑΤΟΣ",hisCode:124,testOrderBy:0,isPatho:false,lab:5,dep:1,labDescr:"ΑΙΜΑΤΟΛΟΓΙΚΟ",depDescr:"ΑΙΜΑΤΟΛΟΓΙΚΟ Ι",topology:null,isUrgent:false}
        ],

        "FULL ΠΑΚΕΤΟ ΧΩΡΙΣ ΠΗΞΗ": [
            {test:1,testDescr:"ΣΑΚΧΑΡΟ ΑΙΜΑΤΟΣ",abbr:"ΣΑΚΧΑΡΟ",hisCode:1917,testOrderBy:0,isPatho:false,lab:1,dep:1,labDescr:"ΒΙΟΧΗΜΙΚΟ",depDescr:"ΒΙΟΧΗΜΙΚΕΣ ΟΡΟΥ",topology:null,isUrgent:false},
            {test:2,testDescr:"ΟΥΡΙΑ ΑΙΜΑΤΟΣ",abbr:"ΟΥΡΙΑ",hisCode:271,testOrderBy:0,isPatho:false,lab:1,dep:1,labDescr:"ΒΙΟΧΗΜΙΚΟ",depDescr:"ΒΙΟΧΗΜΙΚΕΣ ΟΡΟΥ",topology:null,isUrgent:false},
            {test:3,testDescr:"ΚΡΕΑΤΙΝΙΝΗ ΑΙΜΑΤΟΣ",abbr:"ΚΡΕΑΤΙΝΙΝΗ",hisCode:202,testOrderBy:0,isPatho:false,lab:1,dep:1,labDescr:"ΒΙΟΧΗΜΙΚΟ",depDescr:"ΒΙΟΧΗΜΙΚΕΣ ΟΡΟΥ",topology:null,isUrgent:false},
            {test:13,testDescr:"SGOT  ΑΣΠΑΡΤΙΚΗ-ΑΜΙΝΟΤΡΑΝΣΦΕΡΑΣΗ (ΑSΤ/SGOT)",abbr:"SGOT",hisCode:362,testOrderBy:0,isPatho:false,lab:1,dep:1,labDescr:"ΒΙΟΧΗΜΙΚΟ",depDescr:"ΒΙΟΧΗΜΙΚΕΣ ΟΡΟΥ",topology:null,isUrgent:false},
            {test:14,testDescr:"SGPT  ΑΛΑΝΙΝΗ-ΑΜΙΝΟΤΡΑNΣΦΕΡΑΣΗ (ALT/SGPT)",abbr:"SGPT",hisCode:363,testOrderBy:0,isPatho:false,lab:1,dep:1,labDescr:"ΒΙΟΧΗΜΙΚΟ",depDescr:"ΒΙΟΧΗΜΙΚΕΣ ΟΡΟΥ",topology:null,isUrgent:false},
            {test:20,testDescr:"ΝΑΤΡΙΟ ΑΙΜΑΤΟΣ",abbr:"ΝΑΤΡΙΟ",hisCode:268,testOrderBy:0,isPatho:false,lab:1,dep:1,labDescr:"ΒΙΟΧΗΜΙΚΟ",depDescr:"ΒΙΟΧΗΜΙΚΕΣ ΟΡΟΥ",topology:null,isUrgent:false},
            {test:21,testDescr:"ΚΑΛΙΟ ΑΙΜΑΤΟΣ",abbr:"ΚΑΛΙΟ",hisCode:203,testOrderBy:0,isPatho:false,lab:1,dep:1,labDescr:"ΒΙΟΧΗΜΙΚΟ",depDescr:"ΒΙΟΧΗΜΙΚΕΣ ΟΡΟΥ",topology:null,isUrgent:false},
            {test:28,testDescr:"ΛΕΥΚΩΜΑΤΙΝΗ ΟΡΟΥ ΑΙΜΑΤΟΣ",abbr:"ΛΕΥΚΩΜΑΤΙΝ",hisCode:248,testOrderBy:0,isPatho:false,lab:1,dep:1,labDescr:"ΒΙΟΧΗΜΙΚΟ",depDescr:"ΒΙΟΧΗΜΙΚΕΣ ΟΡΟΥ",topology:null,isUrgent:false},
            {test:1,testDescr:"ΓΕΝΙΚΗ ΑΙΜΑΤΟΣ",abbr:"Γ.ΑΙΜΑΤΟΣ",hisCode:124,testOrderBy:0,isPatho:false,lab:5,dep:1,labDescr:"ΑΙΜΑΤΟΛΟΓΙΚΟ",depDescr:"ΑΙΜΑΤΟΛΟΓΙΚΟ Ι",topology:null,isUrgent:false}
        ],

        "FULL ΠΑΚΕΤΟ": [
            {test:1,testDescr:"ΣΑΚΧΑΡΟ ΑΙΜΑΤΟΣ",abbr:"ΣΑΚΧΑΡΟ",hisCode:1917,testOrderBy:0,isPatho:false,lab:1,dep:1,labDescr:"ΒΙΟΧΗΜΙΚΟ",depDescr:"ΒΙΟΧΗΜΙΚΕΣ ΟΡΟΥ",topology:null,isUrgent:false},
            {test:2,testDescr:"ΟΥΡΙΑ ΑΙΜΑΤΟΣ",abbr:"ΟΥΡΙΑ",hisCode:271,testOrderBy:0,isPatho:false,lab:1,dep:1,labDescr:"ΒΙΟΧΗΜΙΚΟ",depDescr:"ΒΙΟΧΗΜΙΚΕΣ ΟΡΟΥ",topology:null,isUrgent:false},
            {test:3,testDescr:"ΚΡΕΑΤΙΝΙΝΗ ΑΙΜΑΤΟΣ",abbr:"ΚΡΕΑΤΙΝΙΝΗ",hisCode:202,testOrderBy:0,isPatho:false,lab:1,dep:1,labDescr:"ΒΙΟΧΗΜΙΚΟ",depDescr:"ΒΙΟΧΗΜΙΚΕΣ ΟΡΟΥ",topology:null,isUrgent:false},
            {test:13,testDescr:"SGOT  ΑΣΠΑΡΤΙΚΗ-ΑΜΙΝΟΤΡΑΝΣΦΕΡΑΣΗ (ΑSΤ/SGOT)",abbr:"SGOT",hisCode:362,testOrderBy:0,isPatho:false,lab:1,dep:1,labDescr:"ΒΙΟΧΗΜΙΚΟ",depDescr:"ΒΙΟΧΗΜΙΚΕΣ ΟΡΟΥ",topology:null,isUrgent:false},
            {test:14,testDescr:"SGPT  ΑΛΑΝΙΝΗ-ΑΜΙΝΟΤΡΑNΣΦΕΡΑΣΗ (ALT/SGPT)",abbr:"SGPT",hisCode:363,testOrderBy:0,isPatho:false,lab:1,dep:1,labDescr:"ΒΙΟΧΗΜΙΚΟ",depDescr:"ΒΙΟΧΗΜΙΚΕΣ ΟΡΟΥ",topology:null,isUrgent:false},
            {test:20,testDescr:"ΝΑΤΡΙΟ ΑΙΜΑΤΟΣ",abbr:"ΝΑΤΡΙΟ",hisCode:268,testOrderBy:0,isPatho:false,lab:1,dep:1,labDescr:"ΒΙΟΧΗΜΙΚΟ",depDescr:"ΒΙΟΧΗΜΙΚΕΣ ΟΡΟΥ",topology:null,isUrgent:false},
            {test:21,testDescr:"ΚΑΛΙΟ ΑΙΜΑΤΟΣ",abbr:"ΚΑΛΙΟ",hisCode:203,testOrderBy:0,isPatho:false,lab:1,dep:1,labDescr:"ΒΙΟΧΗΜΙΚΟ",depDescr:"ΒΙΟΧΗΜΙΚΕΣ ΟΡΟΥ",topology:null,isUrgent:false},
            {test:27,testDescr:"ΟΛΙΚΑ ΛΕΥΚΩΜΑΤΑ",abbr:"ΟΛΙΚΑ ΛΕΥΚ",hisCode:236,testOrderBy:0,isPatho:false,lab:1,dep:1,labDescr:"ΒΙΟΧΗΜΙΚΟ",depDescr:"ΒΙΟΧΗΜΙΚΕΣ ΟΡΟΥ",topology:null,isUrgent:false},
            {test:28,testDescr:"ΛΕΥΚΩΜΑΤΙΝΗ ΟΡΟΥ ΑΙΜΑΤΟΣ",abbr:"ΛΕΥΚΩΜΑΤΙΝ",hisCode:248,testOrderBy:0,isPatho:false,lab:1,dep:1,labDescr:"ΒΙΟΧΗΜΙΚΟ",depDescr:"ΒΙΟΧΗΜΙΚΕΣ ΟΡΟΥ",topology:null,isUrgent:false},
            {test:29,testDescr:"ΣΦΑΙΡΙΝΕΣ",abbr:"ΣΦΑΙΡΙΝΕΣ",hisCode:92,testOrderBy:0,isPatho:false,lab:1,dep:1,labDescr:"ΒΙΟΧΗΜΙΚΟ",depDescr:"ΒΙΟΧΗΜΙΚΕΣ ΟΡΟΥ",topology:null,isUrgent:false},
            {test:1,testDescr:"ΓΕΝΙΚΗ ΑΙΜΑΤΟΣ",abbr:"Γ.ΑΙΜΑΤΟΣ",hisCode:124,testOrderBy:0,isPatho:false,lab:5,dep:1,labDescr:"ΑΙΜΑΤΟΛΟΓΙΚΟ",depDescr:"ΑΙΜΑΤΟΛΟΓΙΚΟ Ι",topology:null,isUrgent:false},
            {test:2,testDescr:"APTT",abbr:"APTT",hisCode:991,testOrderBy:0,isPatho:false,lab:5,dep:3,labDescr:"ΑΙΜΑΤΟΛΟΓΙΚΟ",depDescr:"ΑΙΜΟΣΤΑΣΗ",topology:null,isUrgent:false},
            {test:24,testDescr:"ΧΡΟΝΟΣ ΜΑΡΤΥΡΟΣ",abbr:"Χ.ΜΑΡΤ",hisCode:1653,testOrderBy:0,isPatho:false,lab:5,dep:3,labDescr:"ΑΙΜΑΤΟΛΟΓΙΚΟ",depDescr:"ΑΙΜΟΣΤΑΣΗ",topology:null,isUrgent:false},
            {test:25,testDescr:"ΧΡΟΝΟΣ ΑΣΘΕΝΟΥΣ",abbr:"ΧΡΟΝΟΣ ΑΣΘ",hisCode:1654,testOrderBy:0,isPatho:false,lab:5,dep:3,labDescr:"ΑΙΜΑΤΟΛΟΓΙΚΟ",depDescr:"ΑΙΜΟΣΤΑΣΗ",topology:null,isUrgent:false},
            {test:26,testDescr:"ΧΡΟΝΟΣ ΠΡΟΘΡΟΜΒΙΝΗΣ KATA QUICK",abbr:"PT",hisCode:425,testOrderBy:0,isPatho:false,lab:5,dep:3,labDescr:"ΑΙΜΑΤΟΛΟΓΙΚΟ",depDescr:"ΑΙΜΟΣΤΑΣΗ",topology:null,isUrgent:false},
            {test:27,testDescr:"PT.I.N.R",abbr:"PT.I.N.R",hisCode:997,testOrderBy:0,isPatho:false,lab:5,dep:3,labDescr:"ΑΙΜΑΤΟΛΟΓΙΚΟ",depDescr:"ΑΙΜΟΣΤΑΣΗ",topology:null,isUrgent:false}
        ]
    };

    A.data.EXTRA_EXAMS = {
       crp: [
            {test:10,testDescr:"CRP1",abbr:"CRP1",hisCode:346,testOrderBy:0,isPatho:false,lab:2,dep:2,labDescr:"ΜΙΚΡΟΒΙΟΛΟΓΙΚΟ",depDescr:"ΑΝΟΣΟΛΟΓΙΚΟ-ΟΡΜΟΝΟΛΟΓΙΚΟ",topology:null,isUrgent:false}
        ],

        tke: [
            {test:2,testDescr:"ΤΚΕ   ΤΑΧΥΤΗΤΑ ΚΑΘΙΖΗΣΗΣ ΕΡΥΘΡΩΝ",abbr:"ΤΚΕ",hisCode:377,testOrderBy:0,isPatho:false,lab:5,dep:1,labDescr:"ΑΙΜΑΤΟΛΟΓΙΚΟ",depDescr:"ΑΙΜΑΤΟΛΟΓΙΚΟ Ι",topology:null,isUrgent:false}
        ],

        thyroid: [
            {test:3,testDescr:"TSH ΘΥΡΕΟΤΡΟΠΟΣ ΟΡΜΟΝΗ",abbr:"TSH",hisCode:382,testOrderBy:0,isPatho:false,lab:1,dep:4,labDescr:"ΒΙΟΧΗΜΙΚΟ",depDescr:"LIAISON",topology:null,isUrgent:false},
            {test:4,testDescr:"FT3   ΕΛΕΥΘΕΡΗ ΤΡΙΙΩΔΟΘΥΡΟΝΙΝΗ",abbr:"FT3",hisCode:402,testOrderBy:0,isPatho:false,lab:1,dep:4,labDescr:"ΒΙΟΧΗΜΙΚΟ",depDescr:"LIAISON",topology:null,isUrgent:false},
            {test:5,testDescr:"FT4   ΕΛΕΥΘΕΡΗ ΘΥΡΟΞΙΝΗ",abbr:"FT4",hisCode:403,testOrderBy:0,isPatho:false,lab:1,dep:4,labDescr:"ΒΙΟΧΗΜΙΚΟ",depDescr:"LIAISON",topology:null,isUrgent:false}
        ]
    };

    A.modules.labData = {
        loaded: true,
        version: '0.2.1'
    };

    console.log(
        'Asklipios lab data loaded:',
        Object.keys(A.data.PACKAGES).length,
        'packages,',
        Object.keys(A.data.EXTRA_EXAMS).length,
        'extra exam groups'
    );
})();
