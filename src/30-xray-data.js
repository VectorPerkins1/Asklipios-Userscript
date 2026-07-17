/*
 * Asklipios — X-ray Data
 *
 * Version 0.6.0
 * Static data for:
 * - Admission X-rays
 * - Postoperative X-ray types
 * - Postoperative X-ray payloads
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

    A.data.XRAY_EXAMS = {
        knee: {
            exams_id: "488_1909_1926_",
            diagnosis_quiry: "<p>Με γνωμάτευση προς χειρουργείο</p>\r\n",
            lab_exams_json: {
                "488": {
                    srchId: 488,
                    srchUserCode: "3025",
                    srchName: "Ακτινογρ.αμφοτέρων κατά γόνυ αρθρ.Face συγκριτική",
                    srchShortName: "Α/Α ΓΟΝΑΤΩΝ F/P",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "<p>Σε όρθια θέση</p>\n"
                },
                "1909": {
                    srchId: 1909,
                    srchUserCode: "9233",
                    srchName: "Ακτινογραφία της κατά γόνυ αρθρώσεως P",
                    srchShortName: "",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "NULL"
                },
                "1926": {
                    srchId: 1926,
                    srchUserCode: "9250",
                    srchName: "Ακτινογραφία Θώρακος F",
                    srchShortName: "",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "<p>Με γνωμάτευση προς χειρουργείο</p>\n"
                }
            }
        },

        pelvis: {
            exams_id: "505_1926_",
            diagnosis_quiry: "<p>Με γνωμάτευση προς χειρουργείο</p>\r\n",
            lab_exams_json: {
                "505": {
                    srchId: 505,
                    srchUserCode: "3042",
                    srchName: "Α/Α ΛΕΚΑΝΗΣ-ΙΣΧΙΩΝ F ΚΑΙ ΙΣΧΙΩΝ ΑΡΘΡΩΣΕΩΝ",
                    srchShortName: "Α/Α ΛΕΚΑΝΗΣ-ΙΣΧΙΩΝ F",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "NULL"
                },
                "1926": {
                    srchId: 1926,
                    srchUserCode: "9250",
                    srchName: "Ακτινογραφία Θώρακος F",
                    srchShortName: "",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "<p>Με γνωμάτευση προς χειρουργείο</p>\n"
                }
            }
        },

        shoulder: {
            exams_id: "1948_1926_",
            diagnosis_quiry: "<p>Με γνωμάτευση προς χειρουργείο</p>\r\n\r\n<p>&nbsp;</p>\r\n",
            lab_exams_json: {
                "1926": {
                    srchId: 1926,
                    srchUserCode: "9250",
                    srchName: "Ακτινογραφία Θώρακος F",
                    srchShortName: "",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "<p>Με γνωμάτευση προς χειρουργείο</p>\n\n<p>&nbsp;</p>\n"
                },
                "1948": {
                    srchId: 1948,
                    srchUserCode: "9272",
                    srchName: "Ακτινογραφία ώμου F σε έσω στροφή",
                    srchShortName: "",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "NULL"
                }
            }
        },

    };

    A.data.POSTOP_XRAY_TYPES = [
        { key: "knee", label: "Γόνατο" },
        { key: "pelvis", label: "Λ-Ι" },
        { key: "pdk", label: "ΠΔΚ" },
        { key: "pxk", label: "ΠΧΚ" },
        { key: "tibia", label: "Κνήμη" },
        { key: "femur", label: "Μηριαίο" },
        { key: "forearmR", label: "Αντιβρ. R" },
        { key: "forearmL", label: "Αντιβρ. L" },
        { key: "shoulder", label: "Ώμος" },
        { key: "elbow", label: "Αγκώνας" },
        { key: "humerus", label: "Βραχιόνιο" },
        { key: "foot", label: "Άκρος πόδας" },
        { key: "hand", label: "Άκρα χείρα" }
    ];

    A.data.POSTOP_XRAY_EXAMS = {

        knee: {
            exams_id: "1908_1909_",
            diagnosis_quiry: "",
            lab_exams_json: {
                "1908": {
                    srchId: 1908,
                    srchUserCode: "9232",
                    srchName: "Ακτινογραφία της κατά γόνυ αρθρώσεως F",
                    srchShortName: "",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "NULL"
                },
                "1909": {
                    srchId: 1909,
                    srchUserCode: "9233",
                    srchName: "Ακτινογραφία της κατά γόνυ αρθρώσεως P",
                    srchShortName: "",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "NULL"
                }
            }
        },

        pelvis: {
            exams_id: "505_",
            diagnosis_quiry: "",
            lab_exams_json: {
                "505": {
                    srchId: 505,
                    srchUserCode: "3042",
                    srchName: "Α/Α ΛΕΚΑΝΗΣ-ΙΣΧΙΩΝ F ΚΑΙ ΙΣΧΙΩΝ ΑΡΘΡΩΣΕΩΝ",
                    srchShortName: "Α/Α ΛΕΚΑΝΗΣ-ΙΣΧΙΩΝ F",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "NULL"
                }
            }
        },

        elbow: {
            exams_id: "1932_1933_",
            diagnosis_quiry: "",
            lab_exams_json: {
                "1932": {
                    srchId: 1932,
                    srchUserCode: "9256",
                    srchName: "Ακτινογραφία αγκώνος F",
                    srchShortName: "",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "NULL"
                },
                "1933": {
                    srchId: 1933,
                    srchUserCode: "9257",
                    srchName: "Ακτινογραφία αγκώνος P",
                    srchShortName: "",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "NULL"
                }
            }
        },

        pdk: {
            exams_id: "1900_1901_",
            diagnosis_quiry: "",
            lab_exams_json: {
                "1900": {
                    srchId: 1900,
                    srchUserCode: "9224",
                    srchName: "Ακτινογραφίες ποδοκνημικής F",
                    srchShortName: "",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "NULL"
                },
                "1901": {
                    srchId: 1901,
                    srchUserCode: "9225",
                    srchName: "Ακτινογραφίες ποδοκνημικής P",
                    srchShortName: "",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "NULL"
                }
            }
        },

        pxk: {
            exams_id: "1927_1928_",
            diagnosis_quiry: "",
            lab_exams_json: {
                "1927": {
                    srchId: 1927,
                    srchUserCode: "9251",
                    srchName: "Ακτινογραφία πηχεοκαρπικής άρθρωσης F",
                    srchShortName: "",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "NULL"
                },
                "1928": {
                    srchId: 1928,
                    srchUserCode: "9252",
                    srchName: "Ακτινογραφία πηχεοκαρπικής άρθρωσης P",
                    srchShortName: "",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "NULL"
                }
            }
        },

        tibia: {
            exams_id: "1950_1951_",
            diagnosis_quiry: "",
            lab_exams_json: {
                "1950": {
                    srchId: 1950,
                    srchUserCode: "9274",
                    srchName: "Ακτινογραφία κνήμης F",
                    srchShortName: "",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "NULL"
                },
                "1951": {
                    srchId: 1951,
                    srchUserCode: "9275",
                    srchName: "Ακτινογραφία κνήμης P",
                    srchShortName: "",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "NULL"
                }
            }
        },

        femur: {
            exams_id: "1906_1907_",
            diagnosis_quiry: "",
            lab_exams_json: {
                "1906": {
                    srchId: 1906,
                    srchUserCode: "9230",
                    srchName: "Ακτινογραφία μηριαίου F",
                    srchShortName: "",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "NULL"
                },
                "1907": {
                    srchId: 1907,
                    srchUserCode: "9231",
                    srchName: "Ακτινογραφία μηριαίου P",
                    srchShortName: "",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "NULL"
                }
            }
        },

        forearmL: {
            exams_id: "1952_",
            diagnosis_quiry: "",
            lab_exams_json: {
                "1952": {
                    srchId: 1952,
                    srchUserCode: "9276",
                    srchName: "Ακτινογραφία οστών αντιβραχίου Αριστερό (F&P)",
                    srchShortName: "",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "NULL"
                }
            }
        },

        forearmR: {
            exams_id: "1966_",
            diagnosis_quiry: "",
            lab_exams_json: {
                "1966": {
                    srchId: 1966,
                    srchUserCode: "9290",
                    srchName: "Ακτινογραφία οστών αντιβραχίου Δεξί (F&P)",
                    srchShortName: "",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "NULL"
                }
            }
        },

        humerus: {
            exams_id: "1904_1905_",
            diagnosis_quiry: "",
            lab_exams_json: {
                "1904": {
                    srchId: 1904,
                    srchUserCode: "9228",
                    srchName: "Ακτινογραφία βραχιονίων F",
                    srchShortName: "",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "NULL"
                },
                "1905": {
                    srchId: 1905,
                    srchUserCode: "9229",
                    srchName: "Ακτινογραφία βραχιονίων P",
                    srchShortName: "",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "NULL"
                }
            }
        },

        hand: {
            exams_id: "468_",
            diagnosis_quiry: "",
            lab_exams_json: {
                "468": {
                    srchId: 468,
                    srchUserCode: "3005",
                    srchName: "Ακτινογραφία άκρων χειρών (F&P)",
                    srchShortName: "Α/Α ΑΚΡΑΣ ΧΕΙΡΟΣ F/P",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "NULL"
                }
            }
        },

        foot: {
            exams_id: "1936_",
            diagnosis_quiry: "",
            lab_exams_json: {
                "1936": {
                    srchId: 1936,
                    srchUserCode: "9260",
                    srchName: "Ακτινογραφία άκρων ποδών (F&P)",
                    srchShortName: "",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "NULL"
                }
            }
        },

        shoulder: {
            exams_id: "1948_",
            diagnosis_quiry: "",
            lab_exams_json: {
                "1948": {
                    srchId: 1948,
                    srchUserCode: "9272",
                    srchName: "Ακτινογραφία ώμου F σε έσω στροφή",
                    srchShortName: "",
                    deptNr: 112,
                    mappedElokipExam: null,
                    chargeDetails: null,
                    comment: "NULL"
                }
            }
        }
    };

    A.modules.xrayData = {
        loaded: true,
        version: '0.6.0'
    };

    console.log('Asklipios X-ray data loaded', {
        admissionTypes:
            Object.keys(A.data.XRAY_EXAMS || {}).length,
        postoperativeTypes:
            (A.data.POSTOP_XRAY_TYPES || []).length,
        postoperativePayloads:
            Object.keys(A.data.POSTOP_XRAY_EXAMS || {}).length
    });
})();
