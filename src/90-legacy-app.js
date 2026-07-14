(function () {
    'use strict';

       let DOCTORS = [];

    const PACKAGES = {
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

    const EXTRA_EXAMS = {
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

    function getNursingFrame() {
        for (let i = 0; i < window.frames.length; i++) {
            try {
                if (window.frames[i].location.href.includes("nursing-station.php")) {
                    return window.frames[i];
                }
            } catch (e) {}
        }
        return null;
    }

    function nowDateTime() {
        return new Date().toISOString().slice(0, 19).replace("T", " ");
    }

    function cleanText(el) {
        return (el?.innerText || "").replace(/\s+/g, " ").trim();
    }

    function initDateTime() {
    const doc = getNursingFrame()?.document;
    if (!doc) return;

    const dateInput = doc.getElementById("lab-date");
    const hourEl = doc.getElementById("lab-hour");
    const minuteEl = doc.getElementById("lab-minute");
    const secondEl = doc.getElementById("lab-second");

    if (!dateInput || !hourEl || !minuteEl || !secondEl) return;

    const now = new Date();
    const pad = n => String(n).padStart(2, "0");

    dateInput.value =
        now.getFullYear() + "-" +
        pad(now.getMonth() + 1) + "-" +
        pad(now.getDate());

    hourEl.textContent = pad(now.getHours());
    minuteEl.textContent = pad(now.getMinutes());
    secondEl.textContent = pad(now.getSeconds());

    doc.querySelectorAll(".time-btn").forEach(btn => {
        btn.onclick = () => {
            const target = btn.dataset.target;
            const dir = btn.dataset.dir;

            const el =
                target === "hour" ? hourEl :
                target === "minute" ? minuteEl :
                secondEl;

            const max = target === "hour" ? 23 : 59;

            let value = Number(el.textContent);

            if (dir === "up") {
                value = value >= max ? 0 : value + 1;
            } else {
                value = value <= 0 ? max : value - 1;
            }

            el.textContent = pad(value);
        };
    });
}

    function selectedDateTime() {
    const doc = getNursingFrame().document;

    const date =
        doc.getElementById("lab-date")?.value;

    const hour =
        doc.getElementById("lab-hour")?.textContent || "00";

    const minute =
        doc.getElementById("lab-minute")?.textContent || "00";

    const second =
        doc.getElementById("lab-second")?.textContent || "00";

    if (!date) return nowDateTime();

    return `${date} ${hour}:${minute}:${second}`;
}

    async function loadDoctors() {
        const doc = getNursingFrame()?.document;
        const select = doc?.getElementById("lab-doctor");
        if (!select) return;

        try {
            const res = await fetch(window.location.origin + "/care/doctors", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dept_id: "10" })
            });

            const data = await res.json();

            console.log("DOCTORS RAW DATA:", data);
            console.log("FIRST DOCTOR:", data[0]);
            console.table(data.slice(0, 10));

            DOCTORS = data
                .map(d => {
                    const id =
                        d.id ??
                        d.nr ??
                        d.doctorId ??
                        d.doct_id ??
                        d.doctId ??
                        d.doct_nr ??
                        d.personell_nr ??
                        d.personellNr ??
                        d.pid ??
                        "";

                    const name =
                        d.doct_name?.trim() ||
                        d.name?.trim() ||
                        d.sign?.trim() ||
                        d.fullName?.trim() ||
                        "";

                    return {
                        id: String(id),
                        name: name
                    };
                })
                .filter(d => d.id && d.name)
                .filter((d, index, arr) =>
                    arr.findIndex(x => x.name === d.name) === index
                )
                .sort((a, b) => a.name.localeCompare(b.name, "el"));

            console.table(DOCTORS);

            select.innerHTML =
                '<option value="">-- Επιλέξτε Ιατρό --</option>' +
                DOCTORS.map(d =>
                    `<option value="${d.name}" data-doctor-id="${d.id}">${d.name}</option>`
                ).join("");

        } catch (e) {
            console.error("Doctors load error:", e);
            select.innerHTML = '<option value="">-- Επιλέξτε Ιατρό --</option>';
        }
    }

    function selectedDoctor() {
        const doc = getNursingFrame().document;
        return doc.getElementById("lab-doctor")?.value || "";
    }

    function extractPatientNameFromRow(row) {
        if (!row) return "";

        const links = [...row.querySelectorAll("a")]
            .map(a => cleanText(a))
            .filter(Boolean)
            .filter(t => !/^\d+$/.test(t))
            .filter(t => !t.includes("javascript"))
            .filter(t => !t.includes("getinfo"));

        if (links.length >= 2) return `${links[0]} ${links[1]}`;
        if (links.length === 1) return links[0];

        return "";
    }

    function getNearbyPatientName(row, encounterNr) {
        const candidates = [
            row,
            row.nextElementSibling,
            row.nextElementSibling?.nextElementSibling,
            row.previousElementSibling
        ].filter(Boolean);

        for (const r of candidates) {
            const name = extractPatientNameFromRow(r);
            if (name && name !== encounterNr) return name;
        }

        return encounterNr;
    }

    function getPatients(doc) {
        const patients = [];

        doc.querySelectorAll('td[id^="tdMiniColorBars"]').forEach(mini => {
            const encounterNr = mini.id.replace("tdMiniColorBars", "").trim();
            if (!encounterNr) return;

            const row = mini.closest("tr");
            if (!row) return;

            const cells = [...row.querySelectorAll("td")];

            let bed = "?";

            for (const cell of cells) {
                const t = cleanText(cell);
                if (/^\d{1,2}$/.test(t)) {
                    bed = t;
                    break;
                }
            }

            let room = "?";

            // Πρώτα ψάχνουμε στην ίδια γραμμή
            for (const cell of cells) {
                const t = cleanText(cell);
                const match = t.match(/^(\d{3})\s*\[/);

                if (match) {
                    room = match[1];
                    break;
                }
            }

            // Αν δεν βρεθεί, ψάχνουμε προς τα πάνω
            if (room === "?") {
                let prev = row.previousElementSibling;

                while (prev) {
                    const prevCells = [...prev.querySelectorAll("td")];

                    for (const c of prevCells) {
                        const t = cleanText(c);
                        const match = t.match(/^(\d{3})\s*\[/);

                        if (match) {
                            room = match[1];
                            prev = null;
                            break;
                        }
                    }

                    if (prev) prev = prev.previousElementSibling;
                }
            }

            const patientName = getNearbyPatientName(row, encounterNr);

            patients.push({
                encounterNr,
                room,
                bed,
                patientName
            });
        });

        return patients;
    }

    function updateSelectedCount() {
        const doc = getNursingFrame()?.document;
        if (!doc) return;

        const total = doc.querySelectorAll(".lab-check").length;
        const selected = doc.querySelectorAll(".lab-check:checked").length;

        const selectedCount = doc.getElementById("lab-selected-count");

        if (selectedCount) {
            selectedCount.textContent = `Επιλεγμένοι ασθενείς: ${selected}/${total}`;
        }
    }

    function createPanel() {
        const nf = getNursingFrame();

        if (!nf || !nf.document || !nf.document.body) {
            setTimeout(createPanel, 1000);
            return;
        }

        const doc = nf.document;

        doc.querySelectorAll("#lab-helper-panel").forEach(p => p.remove());

        const panel = doc.createElement("div");
        panel.id = "lab-helper-panel";
        panel.style.position = "fixed";
        panel.style.top = "0px";
        panel.style.right = "20px";
        panel.style.zIndex = "999999999";
        panel.style.background = "white";
        panel.style.border = "2px solid black";
        panel.style.padding = "10px";
        panel.style.width = "420px";
        panel.style.fontFamily = "Arial";
        panel.style.fontSize = "13px";
        panel.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";

        panel.innerHTML = `
            <div id="lab-helper-header" style="display:flex;justify-content:space-between;align-items:center;gap:8px;cursor:pointer;">
                <b>Lab Orders Helper</b>
                <span id="lab-selected-count" style="font-weight:bold;font-size:12px;">
                    Επιλεγμένοι ασθενείς: 0/0
                </span>
                <span id="lab-toggle" style="font-weight:bold;font-size:16px;">▼</span>
            </div>

<div id="lab-helper-body" style="display:none;">

            <div style="margin-top:8px;">
                Πακέτο:
                <select id="lab-package" style="width:100%;margin-top:4px;">
                    <option value="ΓΕΝΙΚΗ ΑΙΜΑΤΟΣ">ΓΕΝΙΚΗ ΑΙΜΑΤΟΣ</option>
                    <option value="FULL ΠΑΚΕΤΟ ΧΩΡΙΣ ΠΗΞΗ">FULL ΠΑΚΕΤΟ ΧΩΡΙΣ ΠΗΞΗ</option>
                    <option value="FULL ΠΑΚΕΤΟ">FULL ΠΑΚΕΤΟ</option>
                </select>
            </div>

            <div style="margin-top:8px;">
                Ημ/νία λήψης δείγματος:
                <input id="lab-date" type="date" style="width:100%;margin-top:4px;">

                <div style="margin-top:6px;text-align:center;">
                    <div style="display:flex;justify-content:center;gap:14px;align-items:center;">
                        <button type="button" class="time-btn" data-target="hour" data-dir="up">▲</button>
                        <button type="button" class="time-btn" data-target="minute" data-dir="up">▲</button>
                        <button type="button" class="time-btn" data-target="second" data-dir="up">▲</button>
                    </div>

                    <div style="display:flex;justify-content:center;gap:8px;align-items:center;font-size:18px;margin:2px 0;">
                        <span id="lab-hour">00</span>
                        <b>:</b>
                        <span id="lab-minute">00</span>
                        <b>:</b>
                        <span id="lab-second">00</span>
                    </div>

                    <div style="display:flex;justify-content:center;gap:14px;align-items:center;">
                        <button type="button" class="time-btn" data-target="hour" data-dir="down">▼</button>
                        <button type="button" class="time-btn" data-target="minute" data-dir="down">▼</button>
                        <button type="button" class="time-btn" data-target="second" data-dir="down">▼</button>
                    </div>
                </div>
            </div>

            <div style="margin-top:8px;">
                Ιατρός:
                <select id="lab-doctor" style="width:100%;margin-top:4px;">
                    <option value="">-- Επιλέξτε Ιατρό --</option>
                </select>
            </div>

            <button id="lab-refresh" style="width:100%;margin-top:6px;">
                Ανανέωση λίστας
            </button>

            <div id="lab-list" style="margin-top:8px;max-height:250px;overflow:auto;border:1px solid #aaa;padding:5px;"></div>

            <button id="lab-vials-check" style="width:100%;margin-top:8px;background:#cfe2f3;">
                Έλεγχος φιαλιδίων
            </button>

            <button id="lab-admission-package" style="width:100%;margin-top:8px;background:#d9ead3;">
                Πακέτο εισαγωγής
            </button>

            <button id="lab-postop-xrays" style="width:100%;margin-top:8px;background:#eadcf8;">
                Ακτινογραφίες
            </button>

            <button id="lab-medical-card" style="width:100%;margin-top:8px;background:#fce5cd;">
                Ιατρική Καρτέλα
            </button>


            <div id="lab-log" style="margin-top:8px;max-height:160px;overflow:auto;border-top:1px solid #aaa;padding-top:5px;"></div>

            </div>
        `;


        doc.body.appendChild(panel);

        const header = doc.getElementById("lab-helper-header");
        const body = doc.getElementById("lab-helper-body");
        const toggle = doc.getElementById("lab-toggle");

        header.onclick = () => {
            const isClosed = body.style.display === "none";
            body.style.display = isClosed ? "block" : "none";
            toggle.textContent = isClosed ? "▲" : "▼";
        };

        doc.getElementById("lab-refresh").onclick = async () => {
            initDateTime();
            renderList();
            await loadDoctors();
        };
        doc.getElementById("lab-vials-check").onclick = openVialsPanel;
        doc.getElementById("lab-admission-package").onclick = openAdmissionPanel;
        doc.getElementById("lab-postop-xrays").onclick = openPostopXrayPanel;
        doc.getElementById("lab-medical-card").onclick = openMedicalCardPanel;

        initDateTime();
        loadDoctors();
        renderList();
        autoRefreshUntilReady();
    }

    function autoRefreshUntilReady(maxTries = 12) {
        let tries = 0;

        const timer = setInterval(async () => {
            tries++;

            const doc = getNursingFrame()?.document;
            if (!doc) return;

            const patients = getPatients(doc);
            const doctorSelect = doc.getElementById("lab-doctor");

            if (patients.length > 0) {
                renderList();
            }

            if (doctorSelect && doctorSelect.options.length <= 1) {
                await loadDoctors();
            }

            const hasPatients = patients.length > 0;
            const hasDoctors = doctorSelect && doctorSelect.options.length > 1;

            if ((hasPatients && hasDoctors) || tries >= maxTries) {
                clearInterval(timer);
            }
        }, 1500);
    }

    function renderList() {
        const nf = getNursingFrame();
        if (!nf || !nf.document) return;

        const doc = nf.document;
        const patients = getPatients(doc);

        const list = doc.getElementById("lab-list");
        if (!list) return;

        if (!patients.length) {
            list.innerHTML = "<i>Δεν βρέθηκαν ασθενείς.</i>";
            updateSelectedCount();
            return;
        }

        list.innerHTML = patients.map(p => `
            <label style="display:block;margin:4px 0;">
            <input type="checkbox" class="lab-check" value="${p.encounterNr}">
            ${p.room}/${p.bed} - ${p.patientName}
            </label>
        `).join("");

        doc.querySelectorAll(".lab-check").forEach(cb => {
            cb.addEventListener("change", updateSelectedCount);
        });

        updateSelectedCount();
    }

    function selectedIds() {
        const doc = getNursingFrame().document;
        return [...doc.querySelectorAll(".lab-check:checked")].map(x => x.value);
    }

    function selectedPackageName() {
        const doc = getNursingFrame().document;
        return doc.getElementById("lab-package").value;
    }

    function log(msg) {
        const doc = getNursingFrame().document;
        const box = doc.getElementById("lab-log");
        if (!box) return;

        box.innerHTML += `<div>${msg}</div>`;
        box.scrollTop = box.scrollHeight;
    }

    function selectedPatientsFull() {
    const doc = getNursingFrame().document;
    const allPatients = getPatients(doc);

    return [...doc.querySelectorAll(".lab-check:checked")].map(cb => {
        const p = allPatients.find(x => x.encounterNr === cb.value);

        return {
            encounterNr: cb.value,
            label: cb.closest("label")?.innerText.trim() || cb.value,
            room: p?.room || "",
            bed: p?.bed || ""
        };
    });
}

function defaultVialsForPackage(packageName) {
    if (packageName === "ΓΕΝΙΚΗ ΑΙΜΑΤΟΣ") {
        return { general: true, biochem: false, coag: false };
    }

    if (packageName === "FULL ΠΑΚΕΤΟ ΧΩΡΙΣ ΠΗΞΗ") {
        return { general: true, biochem: true, coag: false };
    }

    if (packageName === "FULL ΠΑΚΕΤΟ") {
        return { general: true, biochem: true, coag: true };
    }

    return { general: false, biochem: false, coag: false };
}

function openVialsPanel() {
    const nf = getNursingFrame();
    const doc = nf.document;

    const patients = selectedPatientsFull();
    const packageName = selectedPackageName();
    const defaults = defaultVialsForPackage(packageName);

    if (!patients.length) {
        alert("Δεν έχεις επιλέξει ασθενείς.");
        return;
    }

    doc.querySelectorAll("#lab-vials-panel").forEach(p => p.remove());

    const panel = doc.createElement("div");
    panel.id = "lab-vials-panel";
    panel.style.position = "fixed";
    panel.style.top = "0px";
    panel.style.left = "20px";
    panel.style.zIndex = "999999999";
    panel.style.background = "white";
    panel.style.border = "2px solid #333";
    panel.style.padding = "10px";
    panel.style.width = "760px";
    panel.style.fontFamily = "Arial";
    panel.style.fontSize = "13px";
    panel.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";

    panel.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
            <b>Έλεγχος φιαλιδίων</b>
            <button id="vials-close">Κλείσιμο</button>
        </div>

        <div style="margin-top:6px;font-size:12px;">
            Πακέτο βάσης: <b>${packageName}</b>
        </div>

        <table style="width:100%;table-layout:fixed;border-collapse:collapse;">
            <thead>
                <tr>
                    <th style="text-align:left;">Ασθενής</th>
                    <th style="width:60px;">Γεν.</th>
                    <th style="width:60px;">Βιοχ.</th>
                    <th style="width:60px;">Πήξη</th>
                    <th style="width:60px;">CRP</th>
                    <th style="width:60px;">ΤΚΕ</th>
                    <th style="width:60px;">Θυρ.</th>
                    <th style="width:80px;">Διαστ.</th>
                </tr>
            </thead>
            <tbody>
                ${patients.map(p => `
                    <tr data-encounter="${p.encounterNr}" data-room="${p.room}" data-bed="${p.bed}">
                        <td style="padding:4px;border-bottom:1px solid #ddd;">${p.label}</td>

                        <td style="text-align:center;border-bottom:1px solid #ddd;">
                            <input type="checkbox" class="vial-general" ${defaults.general ? "checked" : ""}>
                        </td>

                        <td style="text-align:center;border-bottom:1px solid #ddd;">
                            <input type="checkbox" class="vial-biochem" ${defaults.biochem ? "checked" : ""}>
                        </td>

                        <td style="text-align:center;border-bottom:1px solid #ddd;">
                            <input type="checkbox" class="vial-coag" ${defaults.coag ? "checked" : ""}>
                        </td>

                        <td style="text-align:center;border-bottom:1px solid #ddd;">
                            <input type="checkbox" class="vial-crp">
                        </td>

                        <td style="text-align:center;border-bottom:1px solid #ddd;">
                            <input type="checkbox" class="vial-tke">
                        </td>

                        <td style="text-align:center;border-bottom:1px solid #ddd;">
                            <input type="checkbox" class="vial-thyroid">
                        </td>

                        <td style="text-align:center;border-bottom:1px solid #ddd;">
                            <input type="checkbox" class="vial-crossmatch">
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        </table>

        <button id="vials-send" style="width:100%;margin-top:10px;background:#f4cccc;">
            Αποστολή τικαρισμένων εντολών
        </button>


        <div id="vials-log" style="margin-top:8px;max-height:120px;overflow:auto;border-top:1px solid #aaa;padding-top:5px;"></div>
    `;

    doc.body.appendChild(panel);

    doc.getElementById("vials-close").onclick = () => panel.remove();
    doc.getElementById("vials-send").onclick = sendVialsOrders;
}

function getExamGroups() {
    const general = PACKAGES["ΓΕΝΙΚΗ ΑΙΜΑΤΟΣ"];

    const fullNoCoag = PACKAGES["FULL ΠΑΚΕΤΟ ΧΩΡΙΣ ΠΗΞΗ"];
    const full = PACKAGES["FULL ΠΑΚΕΤΟ"];

    const isGeneral = e => e.lab === 5 && e.dep === 1;
    const isCoag = e => e.lab === 5 && e.dep === 3;
    const isBiochem = e => e.lab === 1;

    return {
        general: full.filter(isGeneral),
        biochem: fullNoCoag.filter(isBiochem),
        coag: full.filter(isCoag)
    };
}

function vialsLog(msg) {
    const doc = getNursingFrame().document;
    const box = doc.getElementById("vials-log");
    if (!box) return;

    box.innerHTML += `<div>${msg}</div>`;
    box.scrollTop = box.scrollHeight;
}

const XRAY_EXAMS = {
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

const POSTOP_XRAY_TYPES = [
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

const POSTOP_XRAY_EXAMS = {

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

function openAdmissionPanel() {
    const nf = getNursingFrame();
    const doc = nf.document;

    const patients = selectedPatientsFull();

    if (!patients.length) {
        alert("Δεν έχεις επιλέξει ασθενείς.");
        return;
    }

    doc.querySelectorAll("#lab-admission-panel").forEach(p => p.remove());

    const panel = doc.createElement("div");
    panel.id = "lab-admission-panel";
    panel.style.position = "fixed";
    panel.style.top = "0px";
    panel.style.left = "20px";
    panel.style.zIndex = "999999999";
    panel.style.background = "white";
    panel.style.border = "2px solid #333";
    panel.style.padding = "10px";
    panel.style.width = "820px";
    panel.style.fontFamily = "Arial";
    panel.style.fontSize = "13px";
    panel.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";

    panel.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
            <b>Πακέτο εισαγωγής</b>
            <button id="admission-close">Κλείσιμο</button>
        </div>

        <table style="width:100%;table-layout:auto;border-collapse:collapse;margin-top:8px;">
            <thead>
                <tr>
                <thead>
                    <th style="text-align:left;white-space:nowrap;">Ασθενής</th>
                    <th style="width:65px;text-align:center;">Πεντάδα</th>
                    <th style="width:85px;text-align:center;">Θυρ.</th>
                    <th style="width:60px;text-align:center;">Γόν.</th>
                    <th style="width:80px;text-align:center;">Λ-Ι</th>
                    <th style="width:60px;text-align:center;">Ώμος</th>
                </tr>
            </thead>
            <tbody>
                ${patients.map(p => `
                    <tr data-encounter="${p.encounterNr}" data-room="${p.room}" data-bed="${p.bed}">
                        <td style="
                            padding:4px;
                            border-bottom:1px solid #ddd;
                            white-space:nowrap;
                        ">
                            ${p.label}
                        </td>

                        <td style="text-align:center;border-bottom:1px solid #ddd;">
                            <input type="checkbox" class="adm-pentada" checked>
                        </td>

                        <td style="text-align:center;border-bottom:1px solid #ddd;">
                            <input type="checkbox" class="adm-thyroid">
                        </td>

                        <td style="text-align:center;border-bottom:1px solid #ddd;">
                            <input type="checkbox" class="adm-xray-knee">
                        </td>

                        <td style="text-align:center;border-bottom:1px solid #ddd;">
                            <input type="checkbox" class="adm-xray-pelvis">
                        </td>

                        <td style="text-align:center;border-bottom:1px solid #ddd;">
                            <input type="checkbox" class="adm-xray-shoulder">
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        </table>

        <button id="admission-send" style="width:100%;margin-top:10px;background:#f4cccc;">
            Αποστολή πακέτου εισαγωγής
        </button>

        <div id="admission-log" style="margin-top:8px;max-height:140px;overflow:auto;border-top:1px solid #aaa;padding-top:5px;"></div>
    `;

    doc.body.appendChild(panel);

    doc.getElementById("admission-close").onclick = () => panel.remove();
    doc.getElementById("admission-send").onclick = sendAdmissionOrders;
}

function selectedDateForXray() {
    const dt = selectedDateTime(); // yyyy-mm-dd HH:mm:ss
    const date = dt.split(" ")[0];
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
}

function openXrayPrint(encounterNr, batchNr) {
    window.open(
        window.location.origin +
        "/modules/pdfmaker/nursing/diagnostics_report_pr_sender.php?pn=" +
        encodeURIComponent(encounterNr) +
        "&batch_nr=" +
        encodeURIComponent(batchNr),
        "_blank"
    );
}

function extractXrayBatchFromHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const batchSpan = doc.querySelector(".batch_nr");

    if (batchSpan) {
        const batch = batchSpan.textContent.trim();
        if (batch) return batch;
    }

    const printLink = [...doc.querySelectorAll("a")]
        .map(a => a.getAttribute("href") || "")
        .find(h => h.includes("diagnostics_report_pr_sender.php") && h.includes("batch_nr="));

    if (printLink) {
        const match = printLink.match(/batch_nr=([0-9]+)/);
        if (match) return match[1];
    }

    return null;
}

async function sendXrayOrder(encounterNr, xrayType) {
    const x = XRAY_EXAMS[xrayType];

    const body = new URLSearchParams();

    body.set("report_dept_nr", "112");
    body.set("notes_id", "");
    body.set("notes_hidden", "");
    body.set("exams_id", x.exams_id);
    body.set("drg_medact_ids", "");
    body.set("cancel_reason", "");
    body.set("diagnosis_quiry", x.diagnosis_quiry);
    body.set("send_date", selectedDateForXray());
    body.set("send_doctor", selectedDoctor());

    body.set("sid", "");
    body.set("lang", "gr");
    body.set("station", "ΟΡΘΟΠΑΙΔΙΚΗ");
    body.set("dept", "");
    body.set("dept_nr", "81");
    body.set("pn", String(encounterNr));
    body.set("batch_nr", "Νέο Αίτημα");
    body.set("edit", "");
    body.set("target", "generic");
    body.set("subtarget", "");
    body.set("tracker", "");
    body.set("noresize", "");
    body.set("user_origin", "");
    body.set("pyear", "");
    body.set("pmonth", "");
    body.set("pday", "");
    body.set("status", "pending");
    body.set("mode", "save");
    body.set("formtitle", "");
    body.set("detail_id", "");
    body.set("ward_nr", "57");
    body.set("lab_exams_json", JSON.stringify(x.lab_exams_json));
    body.set("cs_doc_id", "3895");

    const res = await fetch(
        window.location.origin + "/modules/nursing/nursing-station-patientdaten-doconsil-generic-2.php",
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: body.toString()
        }
    );

    const html = await res.text();
    const batchNr = extractXrayBatchFromHtml(html);

    return {
        success: !!batchNr,
        batch_nr: batchNr,
        html
    };
}

function buildABOPrintUrlFromForm(parsedForm) {
    const action = new URL(
        parsedForm.getAttribute("action"),
        window.location.origin + "/modules/nursing/"
    ).href;

    const params = new URLSearchParams();

    parsedForm.querySelectorAll("input[type='hidden']").forEach(input => {
        params.set(input.name, input.value);
    });

    return action + "?" + params.toString();
}

function buildXrayPrintUrl(encounterNr, batchNr) {
    return window.location.origin +
        "/modules/pdfmaker/nursing/diagnostics_report_pr_sender.php?pn=" +
        encodeURIComponent(encounterNr) +
        "&batch_nr=" +
        encodeURIComponent(batchNr);
}

function buildMedicalInstructionsUrl(encounterNr) {
    return window.location.origin +
        "/modules/pdfmaker/nursing/doctors_orders_odipy.php?encounter_nr=" +
        encodeURIComponent(encounterNr);
}

function admissionLog(msg) {
    const doc = getNursingFrame().document;
    const box = doc.getElementById("admission-log");
    if (!box) return;

    box.innerHTML += `<div>${msg}</div>`;
    box.scrollTop = box.scrollHeight;
}

function createPrintsTab() {
    const w = window.open("about:blank", "_blank");

    if (!w) {
        return null;
    }

    w.document.open();
    w.document.write(`
        <!doctype html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Εκτυπώσεις</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    font-size: 15px;
                }
                h2 {
                    margin-top: 0;
                }
                a {
                    display: block;
                    margin: 10px 0;
                    padding: 10px;
                    border: 1px solid #ccc;
                    text-decoration: none;
                    color: #003366;
                    background: #f7f7f7;
                }
                a:hover {
                    background: #e6f0ff;
                }
            </style>
        </head>
        <body>
            <h2>Εκτυπώσεις</h2>
            <div id="prints-list"></div>
        </body>
        </html>
    `);
    w.document.close();

    return w;
}

function addPrintLink(printTab, title, url) {
    if (!printTab || printTab.closed) {
        admissionLog(`⚠️ Δεν υπάρχει καρτέλα Εκτυπώσεων για: ${title}`);
        return;
    }

    let list = printTab.document.getElementById("prints-list");

    if (!list) {
        printTab.document.body.innerHTML += '<div id="prints-list"></div>';
        list = printTab.document.getElementById("prints-list");
    }

    const a = printTab.document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.textContent = title;
    a.style.display = "block";
    a.style.margin = "10px 0";
    a.style.padding = "10px";
    a.style.border = "1px solid #ccc";
    a.style.background = "#f7f7f7";
    a.style.color = "#003366";
    a.style.textDecoration = "none";

    list.appendChild(a);

    admissionLog(`🖨️ Προστέθηκε στις Εκτυπώσεις: ${title}`);
}

function openPostopXrayPanel() {
    const nf = getNursingFrame();
    const doc = nf.document;
    const patients = selectedPatientsFull();

    if (!patients.length) {
        alert("Δεν έχεις επιλέξει ασθενείς.");
        return;
    }

    doc.querySelectorAll("#postop-xray-panel").forEach(p => p.remove());

    const panel = doc.createElement("div");
    panel.id = "postop-xray-panel";
    panel.style.position = "fixed";
    panel.style.top = "0px";
    panel.style.left = "20px";
    panel.style.zIndex = "999999999";
    panel.style.background = "white";
    panel.style.border = "2px solid #333";
    panel.style.padding = "10px";
    panel.style.width = "1100px";
    panel.style.fontFamily = "Arial";
    panel.style.fontSize = "13px";
    panel.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";

    panel.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
            <b>Ακτινογραφίες</b>
            <button id="postop-xray-close">Κλείσιμο</button>
        </div>

        <table style="width:100%;table-layout:auto;border-collapse:collapse;margin-top:8px;">
            <thead>
                <tr>
                    <th style="text-align:left;white-space:nowrap;">Ασθενής</th>
                    ${POSTOP_XRAY_TYPES.map(x => `
                        <th style="width:70px;text-align:center;">${x.label}</th>
                    `).join("")}
                </tr>
            </thead>
            <tbody>
                ${patients.map(p => `
                    <tr data-encounter="${p.encounterNr}" data-room="${p.room}" data-bed="${p.bed}">
                        <td style="padding:4px;border-bottom:1px solid #ddd;white-space:nowrap;">
                            ${p.label}
                        </td>

                        ${POSTOP_XRAY_TYPES.map(x => `
                            <td style="text-align:center;border-bottom:1px solid #ddd;">
                                <input type="checkbox" class="postop-xray-check" data-xray="${x.key}">
                            </td>
                        `).join("")}
                    </tr>
                `).join("")}
            </tbody>
        </table>

        <button id="postop-xray-send" style="width:100%;margin-top:10px;background:#f4cccc;">
            Αποστολή ακτινογραφιών
        </button>

        <div id="postop-xray-log" style="margin-top:8px;max-height:140px;overflow:auto;border-top:1px solid #aaa;padding-top:5px;"></div>
    `;

    doc.body.appendChild(panel);

    doc.getElementById("postop-xray-close").onclick = () => panel.remove();
    doc.getElementById("postop-xray-send").onclick = sendPostopXrays;
}

function postopXrayLog(msg) {
    const doc = getNursingFrame().document;
    const box = doc.getElementById("postop-xray-log");
    if (!box) return;

    box.innerHTML += `<div>${msg}</div>`;
    box.scrollTop = box.scrollHeight;
}

async function sendPostopXrayOrder(encounterNr, xrayType) {
    const x = POSTOP_XRAY_EXAMS[xrayType];

    const body = new URLSearchParams();

    body.set("report_dept_nr", "112");
    body.set("notes_id", "");
    body.set("notes_hidden", "");
    body.set("exams_id", x.exams_id);
    body.set("drg_medact_ids", "");
    body.set("cancel_reason", "");
    body.set("diagnosis_quiry", x.diagnosis_quiry);
    body.set("send_date", selectedDateForXray());
    body.set("send_doctor", selectedDoctor());

    body.set("sid", "");
    body.set("lang", "gr");
    body.set("station", "ΟΡΘΟΠΑΙΔΙΚΗ");
    body.set("dept", "");
    body.set("dept_nr", "81");
    body.set("pn", String(encounterNr));
    body.set("batch_nr", "Νέο Αίτημα");
    body.set("edit", "");
    body.set("target", "generic");
    body.set("subtarget", "");
    body.set("tracker", "");
    body.set("noresize", "");
    body.set("user_origin", "");
    body.set("pyear", "");
    body.set("pmonth", "");
    body.set("pday", "");
    body.set("status", "pending");
    body.set("mode", "save");
    body.set("formtitle", "");
    body.set("detail_id", "");
    body.set("ward_nr", "57");
    body.set("lab_exams_json", JSON.stringify(x.lab_exams_json));
    body.set("cs_doc_id", "3895");

    const res = await fetch(
        window.location.origin + "/modules/nursing/nursing-station-patientdaten-doconsil-generic-2.php",
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: body.toString()
        }
    );

    const html = await res.text();
    const batchNr = extractXrayBatchFromHtml(html);

    return {
        success: !!batchNr,
        batch_nr: batchNr,
        html
    };
}

async function sendPostopXrays() {
    const doc = getNursingFrame().document;

    if (!selectedDoctor()) {
        alert("Επιλέξτε Ιατρό.");
        return;
    }

    const rows = [...doc.querySelectorAll("#postop-xray-panel tr[data-encounter]")];

    const selectedItems = [];

    rows.forEach(row => {
        const encounterNr = row.dataset.encounter;
        const label = row.querySelector("td")?.innerText.trim() || encounterNr;

        row.querySelectorAll(".postop-xray-check:checked").forEach(cb => {
            const xrayType = cb.dataset.xray;
            const xrayLabel =
                POSTOP_XRAY_TYPES.find(x => x.key === xrayType)?.label || xrayType;

            selectedItems.push({
                encounterNr,
                label,
                xrayType,
                xrayLabel
            });
        });
    });

    if (!selectedItems.length) {
        alert("Δεν έχεις επιλέξει ακτινογραφίες.");
        return;
    }

    if (!confirm(`Να σταλούν ${selectedItems.length} ακτινογραφικές εντολές;`)) {
        return;
    }

    const printTab = selectedItems.length > 1 ? createPrintsTab() : null;

    for (const item of selectedItems) {
        if (!POSTOP_XRAY_EXAMS[item.xrayType]) {
            postopXrayLog(`⚠️ ${item.label} → ${item.xrayLabel}: δεν έχει μπει ακόμα payload`);
            continue;
        }

        postopXrayLog(`🩻 ${item.label} → αποστολή ${item.xrayLabel}`);

        try {
            const xr = await sendPostopXrayOrder(item.encounterNr, item.xrayType);

            if (xr.success) {
                postopXrayLog(`✅ ${item.label} → ${item.xrayLabel} batch ${xr.batch_nr}`);

                const url = buildXrayPrintUrl(item.encounterNr, xr.batch_nr);

                if (selectedItems.length === 1) {
                    window.open(url, "_blank");
                } else {
                    addPrintLink(
                        printTab,
                        `Ακτινογραφία ${item.xrayLabel} - ${item.label}`,
                        url
                    );
                }
            } else {
                postopXrayLog(`❌ ${item.label} → δεν βρέθηκε batch για ${item.xrayLabel}`);
            }
        } catch (e) {
            postopXrayLog(`❌ ${item.label} → ${item.xrayLabel}: ${e.message}`);
        }

        await new Promise(r => setTimeout(r, 700));
    }

    postopXrayLog("🏁 Ολοκληρώθηκε.");
}

async function sendAdmissionOrders() {
    const doc = getNursingFrame().document;

    if (!selectedDoctor()) {
        alert("Επιλέξτε Ιατρό.");
        return;
    }

    const rows = [...doc.querySelectorAll("#lab-admission-panel tr[data-encounter]")];

    if (!rows.length) {
        alert("Δεν υπάρχουν ασθενείς στο πακέτο εισαγωγής.");
        return;
    }

    if (!confirm("Να σταλεί το Πακέτο εισαγωγής στους τικαρισμένους ασθενείς;")) {
        return;
    }

    const printTab = createPrintsTab();

    for (const row of rows) {
        const encounterNr = row.dataset.encounter;
        const label = row.querySelector("td")?.innerText.trim() || encounterNr;

        const pentada = row.querySelector(".adm-pentada")?.checked;
        const thyroid = row.querySelector(".adm-thyroid")?.checked;

        const xrayKnee = row.querySelector(".adm-xray-knee")?.checked;
        const xrayPelvis = row.querySelector(".adm-xray-pelvis")?.checked;
        const xrayShoulder = row.querySelector(".adm-xray-shoulder")?.checked;

        let exams = [];

        if (pentada) {
            exams = exams.concat(PACKAGES["FULL ΠΑΚΕΤΟ"]);
        }

        if (thyroid) {
            exams = exams.concat(EXTRA_EXAMS.thyroid);
        }

        if (!exams.length && !xrayKnee && !xrayPelvis && !xrayShoulder) {
            admissionLog(`⚠️ ${label} → τίποτα επιλεγμένο`);
            continue;
        }

        if (exams.length) {
            admissionLog(`⏳ ${label} → αποστολή αιματολογικών`);

            try {
                const r = await sendLabOrderCustom(encounterNr, exams);

                if (r.success) {
                    admissionLog(`✅ ${label} → batch ${r.batch_nr}`);

                    addPrintLink(
                    printTab,
                    `Ιατρικές Οδηγίες - ${label}`,
                    buildMedicalInstructionsUrl(encounterNr)
                );

                    if (pentada) {
                        await openABOFormForBatch(
                            {
                                encounterNr,
                                label,
                                room: row.dataset.room,
                                bed: row.dataset.bed
                            },
                            r.batch_nr,
                            printTab
                        );;
                    }
                } else {
                    admissionLog(`❌ ${label} → αποτυχία αποστολής αιματολογικών`);
                }
            } catch (e) {
                admissionLog(`❌ ${label} → ${e.message}`);
            }

            await new Promise(r => setTimeout(r, 700));
        }

        if (xrayKnee) {
            admissionLog(`🩻 ${label} → αποστολή ακτινογραφίας Γόνατο`);

            try {
                const xr = await sendXrayOrder(encounterNr, "knee");

                if (xr.success) {
                    admissionLog(`✅ ${label} → ακτινογραφία Γόνατο batch ${xr.batch_nr}`);

                    addPrintLink(
                        printTab,
                        `Ακτινογραφία Γόνατο - ${label}`,
                        buildXrayPrintUrl(encounterNr, xr.batch_nr)
                    );

                } else {
                    admissionLog(`❌ ${label} → δεν βρέθηκε batch ακτινογραφίας Γόνατο`);
                }
            } catch (e) {
                admissionLog(`❌ ${label} → ακτινογραφία Γόνατο: ${e.message}`);
            }

            await new Promise(r => setTimeout(r, 700));
        }

        if (xrayPelvis) {
            admissionLog(`🩻 ${label} → αποστολή ακτινογραφίας Λ-Ι`);

            try {
                const xr = await sendXrayOrder(encounterNr, "pelvis");

                if (xr.success) {
                    admissionLog(`✅ ${label} → ακτινογραφία Λ-Ι batch ${xr.batch_nr}`);

                    addPrintLink(
                        printTab,
                        `Ακτινογραφία Λ-Ι - ${label}`,
                        buildXrayPrintUrl(encounterNr, xr.batch_nr)
                    );

                } else {
                    admissionLog(`❌ ${label} → δεν βρέθηκε batch Λ-Ι`);
                }
            } catch (e) {
                admissionLog(`❌ ${label} → Λ-Ι: ${e.message}`);
            }

            await new Promise(r => setTimeout(r, 700));
        }

        if (xrayShoulder) {
            admissionLog(`🩻 ${label} → αποστολή ακτινογραφίας Ώμου`);

            try {
                const xr = await sendXrayOrder(encounterNr, "shoulder");

                if (xr.success) {
                    admissionLog(`✅ ${label} → ακτινογραφία Ώμου batch ${xr.batch_nr}`);

                    addPrintLink(
                        printTab,
                        `Ακτινογραφία Ώμου - ${label}`,
                        buildXrayPrintUrl(encounterNr, xr.batch_nr)
                    );

                } else {
                    admissionLog(`❌ ${label} → δεν βρέθηκε batch Ώμου`);
                }
            } catch (e) {
                admissionLog(`❌ ${label} → Ώμος: ${e.message}`);
            }

            await new Promise(r => setTimeout(r, 700));
        }

    }

    admissionLog("🏁 Ολοκληρώθηκε πακέτο εισαγωγής.");
}

async function sendLabOrderCustom(encounterNr, selectedExams) {
    const payload = {
        encounterNr: Number(encounterNr),
        laboratoryMode: 0,
        compCode: "1",
        compId: "1",
        pathoLabIds: [],
        sendExamsByCategory: false,
        doctorSign: selectedDoctor(),
        userId: "50",
        sendDate: selectedDateTime(),
        orderComments: "",
        selectedExams
    };

    const res = await fetch(window.location.origin + "/laboratory-exams/order", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    return await res.json();
}

function formatDatePartsForABO() {
    const value = selectedDateTime(); // yyyy-mm-dd HH:mm:ss
    const date = value.split(" ")[0];

    const [year, month, day] = date.split("-");

    return {
        pday: day,
        pmonth: month,
        pyear: year,
        s_date: `${year}-${month}-${day}`,
        s_date2: `${day}/${month}/${year}`
    };
}

function buildPatientLabUrl(encounterNr, room, bed) {
    const d = formatDatePartsForABO();

    const params = new URLSearchParams({
        lang: "gr",
        rm: room || "",
        bd: bed || "",
        pn: encounterNr,
        pyear: d.pyear,
        pmonth: d.pmonth,
        pday: d.pday,
        tb: "99ccff",
        tt: "330066",
        bb: "ffffff",
        d: "1",
        station: "ΟΡΘΟΠΑΙΔΙΚΗ",
        dept_nr: "81",
        ward_nr: "57"
    });

    return window.location.origin + "/modules/nursing/nursing-station-patient-laboratory.php?" + params.toString();
}

async function fetchABOFormFromLabPage(encounterNr, batchNr, room, bed, tries = 6) {
    const url = buildPatientLabUrl(encounterNr, room, bed);

    for (let i = 0; i < tries; i++) {
        const res = await fetch(url, {
            method: "GET",
            credentials: "include"
        });

        const html = await res.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const forms = [...doc.querySelectorAll("form")];

        const aboForm = forms.find(form => {
            const action = form.getAttribute("action") || "";

            return (
                action.includes("report_define_blood.php") &&
                form.querySelector(`input[name="batch_nr"][value="${batchNr}"]`) &&
                form.querySelector('input[name="lisorid"]') &&
                form.querySelector('input[name="mode"][value="print_result"]')
            );
        });

        if (aboForm) {
            return aboForm;
        }

        await new Promise(r => setTimeout(r, 1000));
    }

    return null;
}

function submitABOFormFromParsedForm(parsedForm) {
    const doc = getNursingFrame().document;

    const form = doc.createElement("form");
    form.method = "post";

    if (parsedForm.aboWindow && !parsedForm.aboWindow.closed) {
        form.target = parsedForm.aboWindow.name;
    } else {
        form.target = "_blank";
    }

    form.action = new URL(
        parsedForm.getAttribute("action"),
        window.location.origin + "/modules/nursing/"
    ).href;

    parsedForm.querySelectorAll("input[type='hidden']").forEach(input => {
        const hidden = doc.createElement("input");
        hidden.type = "hidden";
        hidden.name = input.name;
        hidden.value = input.value;
        form.appendChild(hidden);
    });

    doc.body.appendChild(form);

    form.submit();
    form.remove();
}

async function openABOFormForBatch(patient, batchNr, printTab = null, logFn = vialsLog) {
    logFn(`🩸 ${patient.label} → αναζήτηση εντύπου Διασταύρωσης...`);

    const form = await fetchABOFormFromLabPage(
        patient.encounterNr,
        batchNr,
        patient.room,
        patient.bed
    );

    if (!form) {
        logFn(`⚠️ ${patient.label} → δεν βρέθηκε ΑΒΟ για batch ${batchNr}`);
        return;
    }

    if (printTab) {
        const url = buildABOPrintUrlFromForm(form);
        addPrintLink(printTab, `ΑΒΟ / Διασταύρωση - ${patient.label}`, url);
        logFn(`🖨️ ${patient.label} → προστέθηκε ΑΒΟ στις Εκτυπώσεις`);
    } else {
        submitABOFormFromParsedForm(form);
        logFn(`🖨️ ${patient.label} → άνοιξε έντυπο Διασταύρωσης`);
    }
}

async function sendVialsOrders() {
    const doc = getNursingFrame().document;

    if (!selectedDoctor()) {
        alert("Επιλέξτε Ιατρό.");
        return;
    }

    const groups = getExamGroups();
    const rows = [...doc.querySelectorAll("#lab-vials-panel tr[data-encounter]")];

    if (!rows.length) {
        alert("Δεν υπάρχουν ασθενείς στον έλεγχο.");
        return;
    }

    if (!confirm("Να σταλούν οι τικαρισμένες εντολές από τον έλεγχο φιαλιδίων;")) {
        return;
    }

    const crossmatchCount = rows.filter(row =>
        row.querySelector(".vial-crossmatch")?.checked
    ).length;

    const vialsPrintTab = crossmatchCount > 1 ? createPrintsTab() : null;

    for (const row of rows) {
        const encounterNr = row.dataset.encounter;
        const label = row.querySelector("td")?.innerText.trim() || encounterNr;

        let exams = [];

        if (row.querySelector(".vial-general")?.checked) {
            exams = exams.concat(groups.general);
        }

        if (row.querySelector(".vial-biochem")?.checked) {
            exams = exams.concat(groups.biochem);
        }

        if (row.querySelector(".vial-crp")?.checked) {
            exams = exams.concat(EXTRA_EXAMS.crp);
        }

        if (row.querySelector(".vial-tke")?.checked) {
            exams = exams.concat(EXTRA_EXAMS.tke);
        }

        if (row.querySelector(".vial-thyroid")?.checked) {
            exams = exams.concat(EXTRA_EXAMS.thyroid);
        }

        if (row.querySelector(".vial-coag")?.checked) {
            exams = exams.concat(groups.coag);
        }

        if (!exams.length) {
            vialsLog(`⚠️ ${label} → καμία εργαστηριακή εντολή`);
            continue;
        }

        vialsLog(`⏳ ${label}`);

        try {
            const r = await sendLabOrderCustom(encounterNr, exams);

        if (r.success) {
            vialsLog(`✅ ${label} → batch ${r.batch_nr}`);

            if (row.querySelector(".vial-crossmatch")?.checked) {
                await openABOFormForBatch(
                    {
                        encounterNr,
                        label,
                        room: row.dataset.room,
                        bed: row.dataset.bed
                    },
                    r.batch_nr,
                    vialsPrintTab,
                    vialsLog
                );
            }
        } else {
            vialsLog(`❌ ${label}`);
    }
        } catch (e) {
            vialsLog(`❌ ${label} → ${e.message}`);
        }

        await new Promise(r => setTimeout(r, 700));
    }

    vialsLog("🏁 Ολοκληρώθηκε.");
}

    async function sendLabOrder(encounterNr) {
        const packageName = selectedPackageName();

        const payload = {
            encounterNr: Number(encounterNr),
            laboratoryMode: 0,
            compCode: "1",
            compId: "1",
            pathoLabIds: [],
            sendExamsByCategory: false,
            doctorSign: selectedDoctor(),
            userId: "50",
            sendDate: selectedDateTime(),
            orderComments: "",
            selectedExams: PACKAGES[packageName]
        };

        const res = await fetch(window.location.origin + "/laboratory-exams/order", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        return await res.json();
    }

    async function sendOne() {
        const ids = selectedIds();

        if (!selectedDoctor()) {
            alert("Επιλέξτε Ιατρό.");
            return;
        }

        if (!ids.length) {
            alert("Δεν έχεις επιλέξει ασθενή.");
            return;
        }

        const id = ids[0];
        const packageName = selectedPackageName();

        if (!confirm(`Να σταλεί "${packageName}" στον ασθενή ${id};`)) {
            return;
        }

        log(`⏳ ${id} — ${packageName}`);

        try {
            const r = await sendLabOrder(id);
            log(r.success ? `✅ ${id} → batch ${r.batch_nr}` : `❌ ${id}`);
        } catch (e) {
            log(`❌ ${id} → ${e.message}`);
        }
    }

    async function sendAll() {
        const ids = selectedIds();

        if (!selectedDoctor()) {
            alert("Επιλέξτε Ιατρό.");
            return;
        }

        if (!ids.length) {
            alert("Δεν έχεις επιλέξει ασθενείς.");
            return;
        }

        const packageName = selectedPackageName();

        if (!confirm(`ΠΡΟΣΟΧΗ: Θα σταλεί "${packageName}" σε ${ids.length} ασθενείς. Συνέχεια;`)) {
            return;
        }

        for (const id of ids) {
            log(`⏳ ${id} — ${packageName}`);

            try {
                const r = await sendLabOrder(id);
                log(r.success ? `✅ ${id} → batch ${r.batch_nr}` : `❌ ${id}`);
            } catch (e) {
                log(`❌ ${id} → ${e.message}`);
            }

            await new Promise(r => setTimeout(r, 700));
        }

        log("🏁 Ολοκληρώθηκε.");
    }

    const DIAGNOSIS_OPTIONS = {
        "PRP": [
            { id: 5004, code: "M17.0", name: "Πρωτοπαθής εκφυλιστική αρθρίτιδα του γόνατος, αμφοτερόπλευρη" },
            { id: 5005, code: "M17.1", name: "Άλλη πρωτοπαθής εκφυλιστική αρθρίτιδα του γόνατος" },
            { id: 5006, code: "M17.2", name: "Μετατραυματική εκφυλιστική αρθρίτιδα του γόνατος, αμφοτερόπλευρη" },
            { id: 5007, code: "M17.3", name: "Άλλη μετατραυματική εκφυλιστική αρθρίτιδα του γόνατος" },
            { id: 5008, code: "M17.4", name: "Άλλη δευτεροπαθής εκφυλιστική αρθρίτιδα του γόνατος, αμφοτερόπλευρη" },
            { id: 5009, code: "M17.5", name: "Άλλη δευτεροπαθής εκφυλιστική αρθρίτιδα του γόνατος" },
            { id: 5010, code: "M17.9", name: "Εκφυλιστική αρθρίτιδα του γόνατος, μη καθορισμένη", default: true }
        ],
        "Τενοντοελυτρίτιδα De Quervain": [
            {
                id: 4834,
                code: "M65.4",
                name: "Στενωτική τενοντοελυτρίτιδα [de Quervain]",
                default: true
            }
        ],

        "Ρήξη ΠΧΣ": [

            {
                id: 9864,
                code: "S83.53",
                name: "Διάστρεμμα και διάταση της άρθρωσης του γόνατος: Ρήξη του προσθίου χιαστου συνδέσμου",
                default: true
            },
            {
                id: 5683,
                code: "M23.61",
                name: "Άλλη αυτόματη ρήξη του(των) συνδέσμου(ων) του γόνατος: Προσθίου χιαστού συνδέσμου"
            },
            {
                id: 5808,
                code: "M23.81",
                name: "Άλλη εσωτερική αποδιοργάνωση του γόνατος: Προσθίου χιαστού συνδέσμου"
            },
            {
                id: 5676,
                code: "M23.51",
                name: "Χρόνια αστάθεια του γόνατος: Προσθίου χιαστού συνδέσμου"
            }
        ],
        "Ολική αρθροπλαστική γόνατος": [
            { id: 5004, code: "M17.0", name: "Πρωτοπαθής εκφυλιστική αρθρίτιδα του γόνατος, αμφοτερόπλευρη" },
            { id: 5005, code: "M17.1", name: "Άλλη πρωτοπαθής εκφυλιστική αρθρίτιδα του γόνατος" },
            { id: 5006, code: "M17.2", name: "Μετατραυματική εκφυλιστική αρθρίτιδα του γόνατος, αμφοτερόπλευρη" },
            { id: 5007, code: "M17.3", name: "Άλλη μετατραυματική εκφυλιστική αρθρίτιδα του γόνατος" },
            { id: 5008, code: "M17.4", name: "Άλλη δευτεροπαθής εκφυλιστική αρθρίτιδα του γόνατος, αμφοτερόπλευρη" },
            { id: 5009, code: "M17.5", name: "Άλλη δευτεροπαθής εκφυλιστική αρθρίτιδα του γόνατος" },
            { id: 5010, code: "M17.9", name: "Εκφυλιστική αρθρίτιδα του γόνατος, μη καθορισμένη", default: true }
        ],

        "Ολική αρθροπλαστική ισχίου": [
            { id: 4995, code: "M16.0", name: "Πρωτοπαθής εκφυλιστική αρθρίτιδα του ισχίου, αμφοτερόπλευρη" },
            { id: 4996, code: "M16.1", name: "Άλλη πρωτοπαθής εκφυλιστική αρθρίτιδα του ισχίου" },
            { id: 4997, code: "M16.2", name: "Εκφυλιστική αρθρίτιδα του ισχίου λόγω δυσπλαστικών ισχίων, αμφοτερόπλευρη" },
            { id: 4998, code: "M16.3", name: "Άλλη δυσπλαστική εκφυλιστική αρθρίτιδα του ισχίου" },
            { id: 4999, code: "M16.4", name: "Μετατραυματική εκφυλιστική αρθρίτιδα του ισχίου, αμφοτερόπλευρη" },
            { id: 5000, code: "M16.5", name: "Άλλη μετατραυματική εκφυλιστική αρθρίτιδα του ισχίου" },
            { id: 5001, code: "M16.6", name: "Άλλη δευτεροπαθής εκφυλιστική αρθρίτιδα του ισχίου, αμφοτερόπλευρη" },
            { id: 5002, code: "M16.7", name: "Άλλη δευτεροπαθής εκφυλιστική αρθρίτιδα του ισχίου" },
            { id: 5003, code: "M16.9", name: "Εκφυλιστική αρθρίτιδα του ισχίου, μη καθορισμένη", default: true }
        ],

        "Διατροχαντήριο κάταγμα": [
            {
                id: 9522,
                code: "S72.00",
                name: "Κάταγμα του αυχένα του μηριαίου οστού: Μη καθορισμένο τμήμα"
            },
            {
                id: 9523,
                code: "S72.01",
                name: "Κάταγμα του αυχένα του μηριαίου οστού: Ενδοθυλακικό"
            },
            {
                id: 9524,
                code: "S72.02",
                name: "Κάταγμα του αυχένα του μηριαίου οστού: (Εγγύς) επίφυσης, επιφυσιόλυση"
            },
            {
                id: 9525,
                code: "S72.03",
                name: "Κάταγμα του αυχένα του μηριαίου οστού: Υποκεφαλικό"
            },
            {
                id: 9526,
                code: "S72.04",
                name: "Κάταγμα του αυχένα του μηριαίου οστού: Μεσοαυχενικό"
            },
            {
                id: 9527,
                code: "S72.05",
                name: "Κάταγμα του αυχένα του μηριαίου οστού: Βασεοαυχενικό"
            },
            {
                id: 9529,
                code: "S72.10",
                name: "Κάταγμα μηριαίου οστού: Τροχαντήρα, μη καθορισμένο"
            },
            {
                id: 9530,
                code: "S72.11",
                name: "Κάταγμα μηριαίου οστού: Μεσοτροχαντήριο",
                default: true
            },
            {
                id: 9531,
                code: "S72.2",
                name: "Υποτροχαντήριο κάταγμα"
            },
            {
                id: 9532,
                code: "S72.3",
                name: "Κάταγμα της διάφυσης του μηριαίου οστού"
            },
            {
                id: 9540,
                code: "S72.9",
                name: "Κάταγμα του μηριαίου οστού, τμήμα μη καθορισμένο"
            }
        ],

        "Κάταγμα αυχένα μηριαίου": [
            {
                id: 9522,
                code: "S72.00",
                name: "Κάταγμα του αυχένα του μηριαίου οστού: Μη καθορισμένο τμήμα"
            },
            {
                id: 9523,
                code: "S72.01",
                name: "Κάταγμα του αυχένα του μηριαίου οστού: Ενδοθυλακικό"
            },
            {
                id: 9524,
                code: "S72.02",
                name: "Κάταγμα του αυχένα του μηριαίου οστού: (Εγγύς) επίφυσης, επιφυσιόλυση"
            },
            {
                id: 9525,
                code: "S72.03",
                name: "Κάταγμα του αυχένα του μηριαίου οστού: Υποκεφαλικό",
                default: true
            },
            {
                id: 9526,
                code: "S72.04",
                name: "Κάταγμα του αυχένα του μηριαίου οστού: Μεσοαυχενικό"
            },
            {
                id: 9527,
                code: "S72.05",
                name: "Κάταγμα του αυχένα του μηριαίου οστού: Βασεοαυχενικό"
            },
            {
                id: 9529,
                code: "S72.10",
                name: "Κάταγμα μηριαίου οστού: Τροχαντήρα, μη καθορισμένο"
            },
            {
                id: 9530,
                code: "S72.11",
                name: "Κάταγμα μηριαίου οστού: Μεσοτροχαντήριο"
            },
            {
                id: 9531,
                code: "S72.2",
                name: "Υποτροχαντήριο κάταγμα"
            },
            {
                id: 9532,
                code: "S72.3",
                name: "Κάταγμα της διάφυσης του μηριαίου οστού"
            },
            {
                id: 9540,
                code: "S72.9",
                name: "Κάταγμα του μηριαίου οστού, τμήμα μη καθορισμένο"
            }
        ],
        "Κάταγμα διάφυσης μηριαίου οστού": [
            {
                id: 9522,
                code: "S72.00",
                name: "Κάταγμα του αυχένα του μηριαίου οστού: Μη καθορισμένο τμήμα"
            },
            {
                id: 9523,
                code: "S72.01",
                name: "Κάταγμα του αυχένα του μηριαίου οστού: Ενδοθυλακικό"
            },
            {
                id: 9524,
                code: "S72.02",
                name: "Κάταγμα του αυχένα του μηριαίου οστού: (Εγγύς) επίφυσης, επιφυσιόλυση"
            },
            {
                id: 9525,
                code: "S72.03",
                name: "Κάταγμα του αυχένα του μηριαίου οστού: Υποκεφαλικό"
            },
            {
                id: 9526,
                code: "S72.04",
                name: "Κάταγμα του αυχένα του μηριαίου οστού: Μεσοαυχενικό"
            },
            {
                id: 9527,
                code: "S72.05",
                name: "Κάταγμα του αυχένα του μηριαίου οστού: Βασεοαυχενικό"
            },
            {
                id: 9529,
                code: "S72.10",
                name: "Κάταγμα μηριαίου οστού: Τροχαντήρα, μη καθορισμένο"
            },
            {
                id: 9530,
                code: "S72.11",
                name: "Κάταγμα μηριαίου οστού: Μεσοτροχαντήριο"
            },
            {
                id: 9531,
                code: "S72.2",
                name: "Υποτροχαντήριο κάταγμα"
            },
            {
                id: 9532,
                code: "S72.3",
                name: "Κάταγμα της διάφυσης του μηριαίου οστού",
                default: true
            },
            {
                id: 9540,
                code: "S72.9",
                name: "Κάταγμα του μηριαίου οστού, τμήμα μη καθορισμένο"
            }
        ],
        "Υποτροχαντήριο κάταγμα": [
            {
                id: 9522,
                code: "S72.00",
                name: "Κάταγμα του αυχένα του μηριαίου οστού: Μη καθορισμένο τμήμα"
            },
            {
                id: 9523,
                code: "S72.01",
                name: "Κάταγμα του αυχένα του μηριαίου οστού: Ενδοθυλακικό"
            },
            {
                id: 9524,
                code: "S72.02",
                name: "Κάταγμα του αυχένα του μηριαίου οστού: (Εγγύς) επίφυσης, επιφυσιόλυση"
            },
            {
                id: 9525,
                code: "S72.03",
                name: "Κάταγμα του αυχένα του μηριαίου οστού: Υποκεφαλικό"
            },
            {
                id: 9526,
                code: "S72.04",
                name: "Κάταγμα του αυχένα του μηριαίου οστού: Μεσοαυχενικό"
            },
            {
                id: 9527,
                code: "S72.05",
                name: "Κάταγμα του αυχένα του μηριαίου οστού: Βασεοαυχενικό"
            },
            {
                id: 9529,
                code: "S72.10",
                name: "Κάταγμα μηριαίου οστού: Τροχαντήρα, μη καθορισμένο"
            },
            {
                id: 9530,
                code: "S72.11",
                name: "Κάταγμα μηριαίου οστού: Μεσοτροχαντήριο"

            },
            {
                id: 9531,
                code: "S72.2",
                name: "Υποτροχαντήριο κάταγμα",
                default: true
            },
            {
                id: 9532,
                code: "S72.3",
                name: "Κάταγμα της διάφυσης του μηριαίου οστού"
            },
            {
                id: 9540,
                code: "S72.9",
                name: "Κάταγμα του μηριαίου οστού, τμήμα μη καθορισμένο"
            }
        ],

        "Εκτινασσόμενος δάκτυλος": [
            {
                id: 4833,
                code: "M65.3",
                name: "Εκτινασσόμενος δάκτυλος",
                default: true
            }
        ],

        "Σύνδρομο καρπιαίου σωλήνα": [
            {
                id: 2933,
                code: "G56.0",
                name: "Σύνδρομο καρπιαίου σωλήνα",
                default: true
            }
        ],
        "Κάταγμα κνήμης": [
            { id: 9712, code: "S82.11", name: "Κάταγμα του εγγύς άκρου του οστού της κνήμης: Με κάταγμα της περόνης" },
            { id: 9713, code: "S82.18", name: "Κάταγμα του εγγύς άκρου του οστού της κνήμης: Άλλο" },
            { id: 9714, code: "S82.21", name: "Κάταγμα της διάφυσης του οστού της κνήμης: Με κάταγμα της περόνης" },
            { id: 9715, code: "S82.28", name: "Κάταγμα της διάφυσης του οστού της κνήμης: Άλλο"},
            { id: 9716, code: "S82.31", name: "Κάταγμα του άπω άκρου του οστού της κνήμης: Με κάταγμα της περόνης" },
            { id: 9717, code: "S82.38", name: "Κάταγμα του άπω άκρου του οστού της κνήμης: Άλλο" },
            { id: 9842, code: "S82.7", name: "Πολλαπλά κατάγματα της κνήμης" },
            { id: 9846, code: "S82.9", name: "Κάταγμα της κνήμης, τμήμα μη καθορισμένο", default: true  }
        ],

        "Κατάγματα σφυρών": [
            {
                id: 9843,
                code: "S82.81",
                name: "Κατάγματα άλλων τμημάτων της κνήμης: Αμφισφύριο",
                course: "Ανοικτή ανάταξη και εσωτερική οστεοσύνθεση αμφισφυρίου κατάγματος.",
                therapy: "Ανοικτή ανάταξη και εσωτερική οστεοσύνθεση αμφισφυρίου κατάγματος."
            },
            {
                id: 9844,
                code: "S82.82",
                name: "Κατάγματα άλλων τμημάτων της κνήμης: Τρισφύριο",
                course: "Ανοικτή ανάταξη και εσωτερική οστεοσύνθεση τρισφυρίου κατάγματος.",
                therapy: "Ανοικτή ανάταξη και εσωτερική οστεοσύνθεση τρισφυρίου κατάγματος."
            },
            {
                id: 9840,
                code: "S82.5",
                name: "Κάταγμα του έσω σφυρού",
                course: "Ανοικτή ανάταξη και εσωτερική οστεοσύνθεση κατάγματος έσω σφυρού.",
                therapy: "Ανοικτή ανάταξη και εσωτερική οστεοσύνθεση κατάγματος έσω σφυρού."
            },
            {
                id: 9841,
                code: "S82.6",
                name: "Κάταγμα του έξω σφυρού",
                default: true,
                course: "Ανοικτή ανάταξη και εσωτερική οστεοσύνθεση κατάγματος έξω σφυρού.",
                therapy: "Ανοικτή ανάταξη και εσωτερική οστεοσύνθεση κατάγματος έξω σφυρού."
            }
        ],
        "Κάταγμα οσφυϊκού σπονδύλου": [
            {
                id: 9493,
                code: "S32.00",
                name: "Κάταγμα οσφυϊκού σπονδύλου: Ύψος βλάβης μη καθορισμένο",
                default: true
            },
            {
                id: 9494,
                code: "S32.01",
                name: "Κάταγμα οσφυϊκού σπονδύλου: Ο1"
            },
            {
                id: 9495,
                code: "S32.02",
                name: "Κάταγμα οσφυϊκού σπονδύλου: Ο2"
            },
            {
                id: 9496,
                code: "S32.03",
                name: "Κάταγμα οσφυϊκού σπονδύλου: Ο3"
            },
            {
                id: 9497,
                code: "S32.04",
                name: "Κάταγμα οσφυϊκού σπονδύλου: Ο4"
            },
            {
                id: 9498,
                code: "S32.05",
                name: "Κάταγμα οσφυϊκού σπονδύλου: Ο5"
            }
        ],
        "Κάταγμα θωρακικού σπονδύλου": [
            {
                id: 9037,
                code: "S22.00",
                name: "Κάταγμα θωρακικού σπονδύλου: Ύψος βλάβης μη καθορισμένο",
                default: true
            },
            {
                id: 9038,
                code: "S22.01",
                name: "Κάταγμα θωρακικού σπονδύλου: Θ1 και Θ2"
            },
            {
                id: 9039,
                code: "S22.02",
                name: "Κάταγμα θωρακικού σπονδύλου: Θ3 και Θ4"
            },
            {
                id: 9040,
                code: "S22.03",
                name: "Κάταγμα θωρακικού σπονδύλου: Θ5 και Θ6"
            },
            {
                id: 9041,
                code: "S22.04",
                name: "Κάταγμα θωρακικού σπονδύλου: Θ7 και Θ8"
            },
            {
                id: 9042,
                code: "S22.05",
                name: "Κάταγμα θωρακικού σπονδύλου: Θ9 και Θ10"
            },
            {
                id: 9043,
                code: "S22.06",
                name: "Κάταγμα θωρακικού σπονδύλου: Θ11 και Θ12"
            }
        ],
        "Κάταγμα άπω άκρου κερκίδας": [
            {
                id: 10397,
                code: "S52.50",
                name: "Κάταγμα του άπω άκρου της κερκίδας: Μη καθορισμένο τμήμα",
                default: true
            },
            {
                id: 10398,
                code: "S52.51",
                name: "Κάταγμα του άπω άκρου της κερκίδας: Εκτατικού τύπου"
            },
            {
                id: 10399,
                code: "S52.52",
                name: "Κάταγμα του άπω άκρου της κερκίδας: Καμπτικού τύπου"
            },
            {
                id: 10400,
                code: "S52.59",
                name: "Κάταγμα του άπω άκρου της κερκίδας: Άλλα και πολλαπλά τμήματα"
            }
        ],
        "Ρήξη στροφικού πετάλου ώμου": [
            { id: 3689, code: "M75.1", name: "Σύνδρομο του τενόντιου πετάλου του ώμου", default: true },
            { id: 3692, code: "M75.4", name: "Σύνδρομο πρόσκρουσης του ώμου" },
            { id: 3695, code: "M75.9", name: "Βλάβη του ώμου, μη καθορισμένη" }
        ]

    };

    function normalizeDiagnosisObject(d) {
        return {
            id: d.id,
            kind: { name: "Ναι", value: "P" },
            isPlus: { name: "Όχι", value: false },
            isStar: { name: "Όχι", value: false },
            disabled: false,
            rareIllness: "N",
            code: d.code,
            displayCode: d.code,
            name: d.name,
            gender: { name: "Ανεξάρτητο", code: 9 },
            hasAgeLimits: { name: "Όχι", value: false },
            fromAge: null,
            toAge: null,
            inclusions: null,
            exclusions: null,
            notes: null,
            userCreate: "DBA",
            dateCreate: "14/09/2022",
            userUpdate: null,
            dateUpdate: null,
            active: true,
            version: "2017",
            isPreselected: true,
            isPrimary: true,
            course: d.course || "",
            therapy: d.therapy || ""
        };
    }

    const MEDICAL_CARD_PRESETS = {
    "Ρήξη μηνίσκου": {
        course: "",
        therapy: ""
    },

    "Κάταγμα επιγονατίδας": {
        course: "Aντιμετώπιση κατάγματος επιγονατίδας με Tension Band",
        therapy: "Aντιμετώπιση κατάγματος επιγονατίδας με Tension Band"
    },

    "Κάταγμα βραχιονίου": {
        course: "Μετεγχειρητική πορεία ομαλή.",
        therapy: "Χειρουργική αντιμετώπιση κατάγματος βραχιονίου."
    },

    "PRP": {
        course: "Ενδαρθρική έγχυση PRP γόνατος",
        therapy: "Ενδαρθρική έγχυση PRP γόνατος"
    },
    "Τενοντοελυτρίτιδα De Quervain": {
        course: "Διανοιξη ελύτρου για αποσυμπίεση 1ου διαμερίσματος De Quervain",
        therapy: "Διανοιξη ελύτρου για αποσυμπίεση 1ου διαμερίσματος De Quervain"
    },

    "Ρήξη ΠΧΣ": {
        course: "Αρθροσκοπική αποκατάσταση ρήξης προσθίου χιαστού συνδέσμου με αυτογενές μόσχευμα οπισθίων μηριαίων (Hamstrings) ή επιγονατιδικού τένοντα (Patellar tendon)",
        therapy: "Αρθροσκοπική αποκατάσταση ρήξης προσθίου χιαστού συνδέσμου με αυτογενές μόσχευμα οπισθίων μηριαίων (Hamstrings) ή επιγονατιδικού τένοντα (Patellar tendon)"
    },
    "Διατροχαντήριο κάταγμα": {
        course: "Ενδομυελική ήλωση διατροχαντηρίου κατάγματος",
        therapy: "Ενδομυελική ήλωση διατροχαντηρίου κατάγματος"
    },
    "Υποτροχαντήριο κάταγμα": {
        course: "Ενδομυελική ήλωση υποτροχαντηρίου κατάγματος",
        therapy: "Ενδομυελική ήλωση υποτροχαντηρίου κατάγματος"
    },
    "Ολική αρθροπλαστική γόνατος": {
        course: "Ολική αρθροπλαστική γόνατος",
        therapy: "Ολική αρθροπλαστική γόνατος"
    },
    "Εκτινασσόμενος δάκτυλος": {
        course: "Διάνοιξη Α1 pulley",
        therapy: "Διάνοιξη Α1 pulley"
    },
    "Κάταγμα αυχένα μηριαίου": {
        course: "",
        therapy: "Χειρουργική αντιμετώπιση κατάγματος αυχένα μηριαίου."
    },
    "Ολική αρθροπλαστική ισχίου": {
        course: "Ολική αρθροπλαστική ισχίου",
        therapy: "Ολική αρθροπλαστική ισχίου"
    },
    "Σύνδρομο καρπιαίου σωλήνα": {
        course: "Διάνοιξη εγκαρσίου συνδέσμου καρπού (Carpal Tunnel Release)",
        therapy: "Διάνοιξη εγκαρσίου συνδέσμου καρπού (Carpal Tunnel Release)"
    },
    "Κάταγμα διάφυσης μηριαίου οστού": {
        course: "Ενδομυελική ήλωση κατάγματος διάφυσης μηριαίου οστού",
        therapy: "Ενδομυελική ήλωση κατάγματος διάφυσης μηριαίου οστού"
    },

    "Κάταγμα κνήμης": {
        course: "",
        therapy: ""
    },

    "Κατάγματα σφυρών": {
        course: "Ανοικτή ανάταξη και εσωτερική οστεοσύνθεση κατάγματος σφυρών.",
        therapy: "Ανοικτή ανάταξη και εσωτερική οστεοσύνθεση κατάγματος σφυρών."
    },

    "Κάταγμα οσφυϊκού σπονδύλου": {
        course: "Νευρολογικά ακέραιος ασθενής.",
        therapy: "Συντηρητική αντιμετώπιση με κηδεμόνα και αναλγητική αγωγή."
    },

    "Κάταγμα θωρακικού σπονδύλου": {
        course: "Νευρολογικά ακέραιος ασθενής.",
        therapy: "Συντηρητική αντιμετώπιση με κηδεμόνα και αναλγητική αγωγή."
    },

    "Κάταγμα άπω άκρου κερκίδας": {
        course: "Μετεγχειρητική πορεία ομαλή.",
        therapy: "Ανοικτή ανάταξη και εσωτερική οστεοσύνθεση κατάγματος άπω άκρου κερκίδας."
    },
    "Ρήξη στροφικού πετάλου ώμου": {
        course: "",
        therapy: ""
    }
};

    const MEDICAL_CARD_COMPANIES = [
        "Medinor",
        "Depuy Synthes",
        "DMPS",
        "Pharmagenesis",
        "Smith & Nephew",
        "Cooper",
        "Zimmer Biomet",
        "Άλλη"
    ];

    const MEDICAL_ACT_OPTIONS = {
        "PRP": [
            {
                id: 20129,
                code: "502.00.05",
                name: "Θεραπευτική εγχύση: Άρθρωση ή αρθρικός θύλακας",
                requireLr: true,
                default: true
            }
        ],
        "Τενοντοελυτρίτιδα De Quervain": [
            {
                id: 19038,
                code: "384.00.00.08",
                name: "Επεμβάσεις των τενόντων της άκρας χείρας: Τομή: Έλυτρο τενόντων του αντίχειρα",
                requireLr: true,
                default: true
            }
        ],
        "Ρήξη ΠΧΣ": [
            {
                id: 14707,
                code: "381.03.04",
                name: "Αρθροσκοπική επανασταθεροποίηση και πλαστική αποκατάσταση της άρθρωσης του γόνατος: Συνδεσμοπλαστική προσθίου χιαστού συνδέσμου με άλλο αυτογενή τένοντα",
                requireLr: true,
                default: true
            },
            {
                id: 14706,
                code: "381.03.03",
                name: "Αρθροσκοπική επανασταθεροποίηση και πλαστική αποκατάσταση της άρθρωσης του γόνατος: Συνδεσμοπλαστική προσθίου χιαστού συνδέσμου με αυτογενή επιγονατιδικό τένοντα",
                requireLr: true
            },
            {
                id: 14775,
                code: "381.03.16",
                name: "Αρθροσκοπική επανασταθεροποίηση και πλαστική αποκατάσταση της άρθρωσης του γόνατος: Συνδεσμοπλαστική προσθίου χιαστού συνδέσμου με αλλογενές τενόντιο μόσχευμα",
                requireLr: true
            }
        ],
        "Ρήξη στροφικού πετάλου ώμου": [
            {
                id: 14843,
                code: "381.04.04",
                name: "Αρθροσκοπική επανασταθεροποίηση και πλαστική αποκατάσταση της άρθρωσης του ώμου: Άλλη αποκατάσταση του στροφικού πετάλου",
                requireLr: true,
                default: true
            },
            {
                id: 16852,
                code: "380.05.07",
                name: "Ανοικτή χειρουργική σταθεροποίηση και πλαστική αποκατάσταση των θυλακοσυνδεσμικών στοιχείων της άρθρωσης του ώμου: Αποκατάσταση του πετάλου στροφέων με συρραφή",
                requireLr: true
            }
        ],
        "Κάταγμα άπω άκρου κερκίδας": [
            {
                id: 11873,
                code: "379.04.02.06",
                name: "Ανοικτή ανάταξη συντριπτικού κατάγματος στην αρθρική επιφάνεια μακρού οστού: Με πλάκα: Άπω άκρο κερκίδας",
                requireLr: true,
                default: true
            },
            {
                id: 13004,
                code: "379.04.00.06",
                name: "Ανοικτή ανάταξη συντριπτικού κατάγματος στην αρθρική επιφάνεια μακρού οστού: Με βίδα: Άπω άκρο κερκίδας",
                requireLr: true
            },
            {
                id: 12043,
                code: "379.04.06.06",
                name: "Ανοικτή ανάταξη συντριπτικού κατάγματος στην αρθρική επιφάνεια μακρού οστού: Με εξωτερική και εσωτερική οστεοσύνθεση: Άπω άκρο κερκίδας",
                requireLr: true
            },
            {
                id: 12269,
                code: "379.03.06.06",
                name: "Ανοικτή ανάταξη απλού κατάγματος στην αρθρική επιφάνεια μακρού οστού: Με εξωτερική οστεοσύνθεση: Άπω άκρο κερκίδας",
                requireLr: true
            },
            {
                id: 12988,
                code: "379.03.98.06",
                name: "Ανοικτή ανάταξη απλού κατάγματος στην αρθρική επιφάνεια μακρού οστού: Άλλη: Άπω άκρο κερκίδας",
                requireLr: true
            },
            {
                id: 12346,
                code: "379.03.07.06",
                name: "Ανοικτή ανάταξη απλού κατάγματος στην αρθρική επιφάνεια μακρού οστού: Με εξωτερική και εσωτερική οστεοσύνθεση: Άπω άκρο κερκίδας",
                requireLr: true
            },
            {
                id: 12498,
                code: "379.03.09.06",
                name: "Ανοικτή ανάταξη απλού κατάγματος στην αρθρική επιφάνεια μακρού οστού: Με συνδυασμό υλικών και ανακατασκευή της αρθρικής επιφάνειας: Άπω άκρο κερκίδας",
                requireLr: true
            },
            {
                id: 11966,
                code: "379.04.05.06",
                name: "Ανοικτή ανάταξη συντριπτικού κατάγματος στην αρθρική επιφάνεια μακρού οστού: Με εξωτερική οστεοσύνθεση: Άπω άκρο κερκίδας",
                requireLr: true
            },
            {
                id: 12597,
                code: "379.04.19.06",
                name: "Ανοικτή ανάταξη συντριπτικού κατάγματος στην αρθρική επιφάνεια μακρού οστού: Με πλάκα σταθερής γωνίας: Άπω άκρο κερκίδας",
                requireLr: true
            },
            {
                id: 12181,
                code: "379.03.03.06",
                name: "Ανοικτή ανάταξη απλού κατάγματος στην αρθρική επιφάνεια μακρού οστού: Με πλάκα: Άπω άκρο κερκίδας",
                requireLr: true
            },
            {
                id: 12422,
                code: "379.03.08.06",
                name: "Ανοικτή ανάταξη απλού κατάγματος στην αρθρική επιφάνεια μακρού οστού: Με συνδυασμό υλικών: Άπω άκρο κερκίδας",
                requireLr: true
            },
            {
                id: 12833,
                code: "379.03.19.06",
                name: "Ανοικτή ανάταξη απλού κατάγματος στην αρθρική επιφάνεια μακρού οστού: Με πλάκα σταθερής γωνίας: Άπω άκρο κερκίδας",
                requireLr: true
            },
            {
                id: 12014,
                code: "379.03.00.06",
                name: "Ανοικτή ανάταξη απλού κατάγματος στην αρθρική επιφάνεια μακρού οστού: Ανοικτή ανάταξη επιφυσιόλυσης χωρίς οστεοσύνθεση: Άπω άκρο κερκίδας",
                requireLr: true
            },
            {
                id: 12198,
                code: "379.04.08.06",
                name: "Ανοικτή ανάταξη συντριπτικού κατάγματος στην αρθρική επιφάνεια μακρού οστού: Με συνδυασμό υλικών και ανακατασκευή της αρθρικής επιφάνειας: Άπω άκρο κερκίδας",
                requireLr: true
            },
            {
                id: 12121,
                code: "379.04.07.06",
                name: "Ανοικτή ανάταξη συντριπτικού κατάγματος στην αρθρική επιφάνεια μακρού οστού: Με συνδυασμό υλικών: Άπω άκρο κερκίδας",
                requireLr: true
            },
            {
                id: 12090,
                code: "379.03.01.06",
                name: "Ανοικτή ανάταξη απλού κατάγματος στην αρθρική επιφάνεια μακρού οστού: Με βίδα: Άπω άκρο κερκίδας",
                requireLr: true
            },
            {
                id: 12687,
                code: "379.04.98.06",
                name: "Ανοικτή ανάταξη συντριπτικού κατάγματος στην αρθρική επιφάνεια μακρού οστού: Άλλη: Άπω άκρο κερκίδας",
                requireLr: true
            },
            {
                id: 12521,
                code: "379.04.17.06",
                name: "Ανοικτή ανάταξη συντριπτικού κατάγματος στην αρθρική επιφάνεια μακρού οστού: Χωρίς οστεοσύνθεση: Άπω άκρο κερκίδας",
                requireLr: true
            },
            {
                id: 12755,
                code: "379.03.17.06",
                name: "Ανοικτή ανάταξη απλού κατάγματος στην αρθρική επιφάνεια μακρού οστού: Χωρίς οστεοσύνθεση: Άπω άκρο κερκίδας",
                requireLr: true
            }
        ],
        "Σύνδρομο καρπιαίου σωλήνα": [
            {
                id: 18476,
                code: "384.01.01.01",
                name: "Επεμβάσεις στους συνδέσμους της άκρας χείρας: Διατομή: Εγκάρσιος σύνδεσμος",
                requireLr: true,
                default: true
            }
        ],

        "Εκτινασσόμενος δάκτυλος": [
            {
                id: 19038,
                code: "384.00.00.08",
                name: "Επεμβάσεις των τενόντων της άκρας χείρας: Τομή: Έλυτρο τενόντων του αντίχειρα",
                requireLr: true
            },
            {
                id: 19037,
                code: "384.00.00.07",
                name: "Επεμβάσεις των τενόντων της άκρας χείρας: Τομή: Έλυτρο τενόντων των δακτύλων",
                requireLr: true,
                default: true
            }
        ],
        "Διατροχαντήριο κάταγμα": [
            {
                id: 12287,
                code: "379.04.11.15",
                name: "Ανοικτή ανάταξη συντριπτικού κατάγματος στην αρθρική επιφάνεια μακρού οστού: Με ενδομυελικό ήλο: Εγγύς άκρο μηριαίου",
                requireLr: true,
                default: true
            }
        ],

        "Κάταγμα αυχένα μηριαίου": [
            {
                id: 15168,
                code: "382.00.04.01",
                name: "Εμφύτευση ενδοπρόθεσης στην άρθρωση του ισχίου: Διπολική πρόθεση: Με τσιμέντο",
                requireLr: true,
                default: true
            },
            {
                id: 15099,
                code: "382.00.00.00",
                name: "Εμφύτευση ενδοπρόθεσης στην άρθρωση του ισχίου: Ολική ενδοπρόθεση: Χωρίς τσιμέντο",
                requireLr: true
            },
            {
                id: 15100,
                code: "382.00.00.01",
                name: "Εμφύτευση ενδοπρόθεσης στην άρθρωση του ισχίου: Ολική ενδοπρόθεση: Με τσιμέντο",
                requireLr: true
            }

        ],

        "Ολική αρθροπλαστική ισχίου": [
            {
                id: 15099,
                code: "382.00.00.00",
                name: "Εμφύτευση ενδοπρόθεσης στην άρθρωση του ισχίου: Ολική ενδοπρόθεση: Χωρίς τσιμέντο",
                requireLr: true,
                default: true
            },
            {
                id: 15100,
                code: "382.00.00.01",
                name: "Εμφύτευση ενδοπρόθεσης στην άρθρωση του ισχίου: Ολική ενδοπρόθεση: Με τσιμέντο",
                requireLr: true
            },
            {
                id: 15101,
                code: "382.00.00.02",
                name: "Εμφύτευση ενδοπρόθεσης στην άρθρωση του ισχίου: Ολική ενδοπρόθεση: Υβρίδιο (τσιμέντο στο ένα τμήμα)",
                requireLr: true
            }
        ],
        "Ολική αρθροπλαστική γόνατος": [
            {
                id: 15547,
                code: "382.02.01.00",
                name: "Εμφύτευση ενδοπρόθεσης στην άρθρωση του γόνατος: Πρόθεση ολικής αρθροπλαστικής επιφανείας, ασύνδετη, χωρίς αντικατάσταση επιγονατίδας: Χωρίς τσιμέντο",
                requireLr: true
            },
            {
                id: 15548,
                code: "382.02.01.01",
                name: "Εμφύτευση ενδοπρόθεσης στην άρθρωση του γόνατος: Πρόθεση ολικής αρθροπλαστικής επιφανείας, ασύνδετη, χωρίς αντικατάσταση επιγονατίδας: Με τσιμέντο",
                requireLr: true,
                default: true
            },
            {
                id: 15549,
                code: "382.02.01.02",
                name: "Εμφύτευση ενδοπρόθεσης στην άρθρωση του γόνατος: Πρόθεση ολικής αρθροπλαστικής επιφανείας, ασύνδετη, χωρίς αντικατάσταση επιγονατίδας: Υβρίδιο (τσιμέντο στο ένα τμήμα)",
                requireLr: true
            },
            {
                id: 15553,
                code: "382.02.03.00",
                name: "Εμφύτευση ενδοπρόθεσης στην άρθρωση του γόνατος: Πρόθεση ολικής αρθροπλαστικής επιφανείας, μερικώς συνδεδεμένη, χωρίς αντικατάσταση επιγονατίδας: Χωρίς τσιμέντο",
                requireLr: true
            },
            {
                id: 15554,
                code: "382.02.03.01",
                name: "Εμφύτευση ενδοπρόθεσης στην άρθρωση του γόνατος: Πρόθεση ολικής αρθροπλαστικής επιφανείας, μερικώς συνδεδεμένη, χωρίς αντικατάσταση επιγονατίδας: Με τσιμέντο",
                requireLr: true
            },
            {
                id: 15555,
                code: "382.02.03.02",
                name: "Εμφύτευση ενδοπρόθεσης στην άρθρωση του γόνατος: Πρόθεση ολικής αρθροπλαστικής επιφανείας, μερικώς συνδεδεμένη, χωρίς αντικατάσταση επιγονατίδας: Υβρίδιο (τσιμέντο στο ένα τμήμα)",
                requireLr: true
            },
            {
                id: 15559,
                code: "382.02.06.00",
                name: "Εμφύτευση ενδοπρόθεσης στην άρθρωση του γόνατος: Πρόθεση ολικής αρθροπλαστικής επιφανείας, συνδεδεμένη, χωρίς αντικατάσταση επιγονατίδας: Χωρίς τσιμέντο",
                requireLr: true
            },
            {
                id: 15560,
                code: "382.02.06.01",
                name: "Εμφύτευση ενδοπρόθεσης στην άρθρωση του γόνατος: Πρόθεση ολικής αρθροπλαστικής επιφανείας, συνδεδεμένη, χωρίς αντικατάσταση επιγονατίδας: Με τσιμέντο",
                requireLr: true
            },
            {
                id: 15561,
                code: "382.02.06.02",
                name: "Εμφύτευση ενδοπρόθεσης στην άρθρωση του γόνατος: Πρόθεση ολικής αρθροπλαστικής επιφανείας, συνδεδεμένη, χωρίς αντικατάσταση επιγονατίδας: Υβρίδιο (τσιμέντο στο ένα τμήμα)",
                requireLr: true
            }
        ]
    };

    function getMedicalCardSelectedDate() {
        const doc = getNursingFrame().document;

        const el =
            doc.querySelector("#lab-order-date") ||
            doc.querySelector("#order-date") ||
            doc.querySelector('input[type="date"]') ||
            doc.querySelector('input[name="send_date"]');

        if (el && el.value) {
            if (/^\d{4}-\d{2}-\d{2}$/.test(el.value)) {
                const [y, m, d] = el.value.split("-");
                return `${d}/${m}/${y}`;
            }

            return el.value;
        }

        const now = new Date();
        return String(now.getDate()).padStart(2, "0") + "/" +
            String(now.getMonth() + 1).padStart(2, "0") + "/" +
            now.getFullYear();
    }


    function getMedicalActLocation() {
        const doc = getNursingFrame().document;

        const left = doc.getElementById("mc-left").checked;
        const right = doc.getElementById("mc-right").checked;

        if (left && right) return "B";
        if (left) return "L";
        if (right) return "R";

        return null;
    }

    const DOCTOR_FOLLOWUP_TEXTS = {
        "ΜΠΑΡΓΙΩΤΑΣ ΚΩΝ/ΝΟΣ": {
            time: "09:00-11:00",
            doctorLabel: "κ. Μπαργιώτας"
        },
        "ΣΑΙΝΗΣ ΙΩΑΝΝΗΣ": {
            time: "10:00-11:00",
            doctorLabel: "κ. Σαϊνης"
        },
        "ΧΡΙΣΤΟΔΟΥΛΟΥ ΣΩΤΗΡΙΟΣ": {
            time: "10:00-11:00",
            doctorLabel: "κ. Χριστοδούλου"
        },
        "ΜΠΑΚΑΓΙΑΝΝΗΣ ΓΕΩΡΓΙΟΣ": {
            time: "08:30-12:00",
            doctorLabel: "κ. Μπακαγιάννης"
        },
        "ΚΟΛΟΒΟΣ ΣΤΥΛΙΑΝΟΣ": {
            time: "09:00-10:00",
            doctorLabel: "κ. Κολοβός"
        },
        "ΑΝΑΣΤΑΣΟΠΟΥΛΟΣ ΗΛΙΑΣ": {
            time: "09:00-10:00",
            doctorLabel: "κ. Αναστασόπουλος"
        }
    };
    const ANTICOAGULATION_TEXTS = {
        "Xarelto10": `Αντιπηκτική αγωγή TB XARELTO 10 mg 1X1 για 10 ημέρες.`,
        "Xarelto20": `Αντιπηκτική αγωγή TB XARELTO 20 mg 1X1.`,
        "Eliquis5": `Αντιπηκτική αγωγή ΤΒ ELIQUIS 5mg ως ελάμβανε.`,
        "Eliquis2.5": `Αντιπηκτική αγωγή ΤΒ ELIQUIS 2.5mg ως ελάμβανε.`,
        "Pradaxa": `Συνέχιση της αγωγής με Pradaxa ως ελάμβανε.`,
        "Sintrom": `Συνέχιση της αγωγής με Sintrom με τακτικό έλεγχο INR.`,
        "Ivor3500": `Αντιπηκτική αγωγή IVORINJ.SOL 3500IUAnti-Xa/0,2Msyr 1x1 για 1 μήνα.`,
        "Ivor2500": `Αντιπηκτική αγωγή IVORINJ.SOL 2500IUAnti-Xa/0,2Msyr 1x1 για 1 μήνα.`,
        "Clexane40": `Αντιπηκτική αγωγή CLEXANE INJ.SOL 4000ANTI-XA IU/0,4ML 1x1 για 1 μήνα.`,
        "Clexane60": `Αντιπηκτική αγωγή CLEXANE INJ.SOL 6000ANTI-XA IU/0,4ML 1x1 για 1 μήνα.`,
        "Arixtra2.5": `Αντιπηκτική αγωγή ARIXTRA INJ.SOL 2,5MG/0,5ML PF,SYR 1x1 για 1 μήνα.`
    };

    const DEFAULT_DISCHARGE_TEXT = `Επανεξέταση στα εξωτερικά ιατρέια Ορθοπαιδικής Κλινικής`;


    const DOCTOR_DISCHARGE_TEXTS = {
        "ΜΠΑΡΓΙΩΤΑΣ ΚΩΝ/ΝΟΣ": `Επανεξέταση στα Τακτικά Εξωτερικά Ιατρεία της Ορθοπαιδικής Κλινικής την Πέμπτη 9:00-11:00 (κ. Μπαργιώτας)`,
        "ΣΑΙΝΗΣ ΙΩΑΝΝΗΣ": `Επανεξέταση στα Τακτικά Εξωτερικά Ιατρεία της Ορθοπαιδικής Κλινικής τη Δευτέρα το πρωί 10:00-11:00 (κύριος Σαϊνης)`,
        "ΧΡΙΣΤΟΔΟΥΛΟΥ ΣΩΤΗΡΙΟΣ": `Επανεξέταση στα Τακτικά Εξωτερικά Ιατρεία της Ορθοπαιδικής Κλινικής τη Δευτέρα το πρωί 10:00-11:00 (κύριος Χριστοδούλου)`,
        "ΜΠΑΚΑΓΙΑΝΝΗΣ ΓΕΩΡΓΙΟΣ": `Επανεξέταση στα Τακτικά Εξωτερικά Ιατρεία της Ορθοπαιδικής Κλινικής την Τρίτη το πρωί 8:30-12:00 (κύριος Μπακαγιάννης)`,
        "ΚΟΛΟΒΟΣ ΣΤΥΛΙΑΝΟΣ": `Επανεξέταση στα Τακτικά Εξωτερικά Ιατρεία της Ορθοπαιδικής Κλινικής την Παρασκευή το πρωί 9:00-10:00 (κύριος Κολοβός)`,
        "ΑΝΑΣΤΑΣΟΠΟΥΛΟΣ ΗΛΙΑΣ": `Επανεξέταση στα Τακτικά Εξωτερικά Ιατρεία της Ορθοπαιδικής Κλινικής την Παρασκευή το πρωί 9:00-10:00 (κύριος Αναστασόπουλος)`
    };

    const PRESET_DISCHARGE_TEXTS = {
        "Ολική αρθροπλαστική γόνατος": `Βάδιση με πλήρη φόρτιση του χειρουργημένου σκέλους με βακτηρία τύπου ''π''.`,
        "Ολική αρθροπλαστική ισχίου": `Οδηγίες για ΟΑΙ.`,
        "Κάταγμα άπω άκρου κερκίδας": `Οδηγίες για κάταγμα άπω άκρου κερκίδας.`
    };

    const SURGERY_DESCRIPTIONS = {
        "Διατροχαντήριο κάταγμα": `Με τον ασθενή υπό αναισθησία και στο τραπέζι των ηλώσεων, πραγματοποιήθηκε ανάταξη του κατάγματος υπό ακτινοσκοπικό έλεγχο. Έξω πλάγια προσπέλαση και διάνοιξη της πλατείας περιτονίας. Εντοπισμός του σημείου εισόδου στον μείζονα τροχαντήρα. Τοποθέτηση οδηγού εντός του αυλού του μηριαίου και γλυφανισμός. Τοποθέτηση ενδομυελικού ήλου, διαυχενικού κοχλία και περιφερικής βίδας ασφάλισης. Ακτινοσκοπικός έλεγχος της ανάταξης και της θέσης των υλικών. Έλεγχος αιμόστασης, πλύσεις και συρραφή κατά στρώματα.`,

        "Ολική αρθροπλαστική γόνατος": `Με τον ασθενή υπό αναισθησία, πραγματοποιήθηκε αντισηψία και αποστείρωση του χειρουργικού πεδίου. Πρόσθια μέση τομή γόνατος και προσπέλαση της άρθρωσης. Εκτελέστηκαν οι προβλεπόμενες οστεοτομίες και τοποθετήθηκαν τα δοκιμαστικά υλικά. Μετά τον έλεγχο της σταθερότητας, της ευθυγράμμισης και του εύρους κίνησης, τοποθετήθηκαν τα οριστικά εμφυτεύματα. Έλεγχος αιμόστασης, πλύσεις και συρραφή κατά στρώματα.`,

        "Ολική αρθροπλαστική ισχίου": `Με τον ασθενή υπό αναισθησία, πραγματοποιήθηκε αντισηψία και αποστείρωση του χειρουργικού πεδίου. Προσπέλαση της άρθρωσης του ισχίου και παρασκευή κατά στρώματα. Εκτομή της μηριαίας κεφαλής, προετοιμασία της κοτύλης και του μηριαίου αυλού. Τοποθέτηση των δοκιμαστικών και στη συνέχεια των οριστικών εμφυτευμάτων. Έλεγχος σταθερότητας, μήκους και εύρους κίνησης. Αιμόσταση, πλύσεις και συρραφή κατά στρώματα.`,

        "Κάταγμα άπω άκρου κερκίδας": `Με τον ασθενή υπό αναισθησία, πραγματοποιήθηκε αντισηψία και αποστείρωση του χειρουργικού πεδίου. Προσπέλαση του άπω άκρου της κερκίδας. Ανάταξη του κατάγματος υπό ακτινοσκοπικό έλεγχο και προσωρινή σταθεροποίηση. Τοποθέτηση πλάκας και κοχλιών. Ακτινοσκοπικός έλεγχος της ανάταξης, του μήκους των κοχλιών και της θέσης των υλικών. Αιμόσταση, πλύσεις και συρραφή κατά στρώματα.`
    };

    let SURGERY_SAVE_CONTEXT = {
        diagnosisId: "",
        medicalActLinkId: ""
    };

    function normalizeDoctorName(name) {
        return (name || "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function formatGreekDate(dateValue) {
        if (!dateValue) return "";

        const [y, m, d] = dateValue.split("-");
        return `${d}/${m}/${y}`;
    }

    function updateDischargeInstructions() {
        const doc = getNursingFrame().document;

        const doctorName = getSelectedMedicalCardDoctorName();
        const preset = doc.getElementById("mc-preset")?.value || "";
        const anticoagulation = doc.getElementById("mc-anticoagulation")?.value || "";
        const followupDate = doc.getElementById("mc-followup-date")?.value || "";

        const box = doc.getElementById("mc-discharge-instructions");
        if (!box) return;

        const presetText = PRESET_DISCHARGE_TEXTS[preset] || "";
        const anticoagulationText = ANTICOAGULATION_TEXTS[anticoagulation] || "";

        let followupText = "";

        if (doctorName) {
            const doctorFollowup =
                DOCTOR_FOLLOWUP_TEXTS[doctorName] || null;

            const dateText = formatGreekDate(followupDate);

            if (doctorFollowup && dateText) {
                followupText =
                    `Επανεξέταση στα Τακτικά Εξωτερικά Ιατρεία της Ορθοπαιδικής Κλινικής στις ${dateText} και ώρα ${doctorFollowup.time} (${doctorFollowup.doctorLabel}).`;
            } else if (doctorFollowup) {
                followupText =
                    `Επανεξέταση στα Τακτικά Εξωτερικά Ιατρεία της Ορθοπαιδικής Κλινικής και ώρα ${doctorFollowup.time} (${doctorFollowup.doctorLabel}).`;
            } else if (dateText) {
                followupText =
                    `Επανεξέταση στα Τακτικά Εξωτερικά Ιατρεία της Ορθοπαιδικής Κλινικής στις ${dateText}.`;
            } else {
                followupText =
                    DEFAULT_DISCHARGE_TEXT || "";
            }
        } else if (followupDate) {
            followupText =
                `Επανεξέταση στα Τακτικά Εξωτερικά Ιατρεία της Ορθοπαιδικής Κλινικής στις ${formatGreekDate(followupDate)}.`;
        }

        box.value = [
            presetText,
            anticoagulationText,
            followupText
        ]
            .filter(Boolean)
            .join("\n\n");
    }

    function openMedicalCardPanel() {
        const nf = getNursingFrame();
        const doc = nf.document;
        const patients = selectedPatientsFull();

        if (!patients.length) {
            alert("Δεν έχεις επιλέξει ασθενείς.");
            return;
        }

        doc.querySelectorAll("#medical-card-panel").forEach(p => p.remove());

        const panel = doc.createElement("div");
        panel.id = "medical-card-panel";
        panel.style.position = "fixed";
        panel.style.top = "0px";
        panel.style.left = "20px";
        panel.style.zIndex = "999999999";
        panel.style.background = "white";
        panel.style.border = "2px solid #333";
        panel.style.padding = "10px";
        panel.style.width = "850px";
        panel.style.fontFamily = "Arial";
        panel.style.fontSize = "13px";
        panel.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
        panel.style.overflow = "visible";

        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <b>Ιατρική Καρτέλα</b>
                <button id="medical-card-close">Κλείσιμο</button>
            </div>

            <div style="
                display:flex;
                justify-content:flex-end;
                align-items:center;
                gap:7px;
                margin-top:7px;
                margin-bottom:8px;
            ">
                <span style="font-weight:bold;">
                    Πρακτικό Χειρουργείου
                </span>

                <button
                    type="button"
                    id="mc-toggle-surgery-panel"
                    title="Άνοιγμα πρακτικού χειρουργείου"
                    style="
                        width:32px;
                        height:28px;
                        cursor:pointer;
                        font-size:17px;
                    "
                >
                    ➡
                </button>
            </div>

            <div style="margin-top:8px;">
                <b>Ασθενής:</b>
                <div style="max-height:80px;overflow:auto;border:1px solid #ccc;padding:5px;margin-top:4px;">
                    ${patients.map(p => `
                        <div data-encounter="${p.encounterNr}" data-room="${p.room}" data-bed="${p.bed}">
                            ${p.label}
                        </div>
                    `).join("")}
                </div>
            </div>

            <div style="display:flex;gap:10px;margin-top:10px;">
                <div style="flex:1;">
                    <label><b>Θεράπων Ιατρός</b></label>
                    <select id="mc-doctor" style="width:100%;margin-top:4px;">
                        <option value="">-- Επιλογή Ιατρού --</option>
                    </select>

                    <div style="margin-top:10px;">
                        <label><b>Εταιρεία</b></label>
                        <select id="mc-company" style="width:100%;margin-top:4px;">
                            <option value="">-- Επιλογή --</option>
                            ${MEDICAL_CARD_COMPANIES.map(c => `
                                <option value="${c}">${c}</option>
                            `).join("")}
                        </select>
                    </div>
                </div>

                <div style="width:160px;">
                    <label><b>Πλευρά</b></label><br>
                    <label><input type="checkbox" id="mc-left"> Αριστερά</label><br>
                    <label><input type="checkbox" id="mc-right"> Δεξιά</label>
                </div>

                <div style="flex:1;">
                    <label><b>Αντιπηκτική αγωγή</b></label>
                    <select id="mc-anticoagulation" style="width:100%;margin-top:4px;">
                        <option value="">-- Επιλογή --</option>
                        <option value="Xarelto10">Xarelto 10mg</option>
                        <option value="Xarelto20">Xarelto 20mg</option>
                        <option value="Eliquis5">Eliquis 5mg</option>
                        <option value="Eliquis2.5">Eliquis 2.5mg</option>
                        <option value="Pradaxa">Pradaxa</option>
                        <option value="Sintrom">Sintrom</option>
                        <option value="Ivor3500">Ivor 3500</option>
                        <option value="Ivor2500">Ivor 2500</option>
                        <option value="Clexane40">Clexane 4000</option>
                        <option value="Clexane60">Clexane 6000</option>
                        <option value="Arixtra2.5">Arixtra 2500</option>
                        </select>

                    <div style="margin-top:10px;">
                        <label><b>Επανεξέταση</b></label>
                        <input type="date" id="mc-followup-date" style="width:100%;margin-top:4px;">
                    </div>
                </div>
            </div>

            <div style="margin-top:10px;">
                <label><b>Πρότυπο Περιστατικού</b></label>
                <select id="mc-preset" style="width:100%;margin-top:4px;">
                    <option value="">-- Επιλογή --</option>
                    ${Object.keys(MEDICAL_CARD_PRESETS).sort((a,b) => a.localeCompare(b, "el")).map(k => `
                        <option value="${k}">${k}</option>
                    `).join("")}
                </select>
            </div>

            <div style="margin-top:10px;">
                <label><b>Διάγνωση ICD10</b></label>
                <select id="mc-diagnosis-select" style="width:100%;margin-top:4px;">
                    <option value="">-- Επιλογή διάγνωσης --</option>
                </select>
            </div>

            <div style="margin-top:10px;">
                <label><b>Ιατρική Πράξη</b></label>
                <select id="mc-medact-select" style="width:100%;margin-top:4px;">
                    <option value="">-- Επιλογή ιατρικής πράξης --</option>
                </select>
            </div>

            <div style="margin-top:10px;">
                <label><b>Πορεία Νόσου</b></label>
                <textarea id="mc-course" style="width:100%;height:30px;margin-top:4px;"></textarea>
            </div>

            <div style="margin-top:10px;">
                <label><b>Θεραπευτική Αγωγή - Επεμβάσεις</b></label>
                <textarea id="mc-treatment" style="width:100%;height:30px;margin-top:4px;"></textarea>
            </div>

            <div style="margin-top:10px;">
                <label><b>Οδηγίες κατά την έξοδο</b></label>
                <textarea id="mc-discharge-instructions" style="width:100%;height:90px;margin-top:4px;"></textarea>
            </div>

            <button id="medical-card-submit" style="width:100%;margin-top:10px;background:#f4cccc;">
                Υποβολή Ιατρικής Καρτέλας
            </button>

            <div id="medical-card-log" style="margin-top:8px;max-height:100px;overflow:auto;border-top:1px solid #aaa;padding-top:5px;"></div>

            <div id="mc-surgery-panel" style="
                position:absolute;
                top:0;
                left:100%;
                width:570px;
                height:100%;
                min-height:590px;
                background:#ffffff;
                border:1px solid #555;
                border-left:4px solid #4c79a8;
                box-shadow:4px 0 12px rgba(0,0,0,0.25);
                padding:12px;
                box-sizing:border-box;
                overflow-y:auto;
                z-index:1000000;

                opacity:0;
                visibility:hidden;
                transform:translateX(-35px);
                transition:
                    transform 0.25s ease,
                    opacity 0.25s ease,
                    visibility 0.25s;
            ">

                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    border-bottom:1px solid #ccc;
                    padding-bottom:7px;
                    margin-bottom:12px;
                ">
                    <strong style="font-size:16px;">
                        Πρακτικό Χειρουργείου
                    </strong>

                    <button
                        type="button"
                        id="mc-close-surgery-panel"
                        title="Κλείσιμο πρακτικού"
                        style="cursor:pointer;"
                    >
                        ✕
                    </button>
                </div>

                <div style="display:flex;gap:10px;">
                    <div style="flex:1;">
                        <label for="mc-surgery-date">
                            <b>Ημερομηνία</b>
                        </label>

                        <input
                            type="text"
                            id="mc-surgery-date"
                            readonly
                            style="
                                width:100%;
                                box-sizing:border-box;
                                margin-top:4px;
                            "
                        >
                    </div>

                    <div style="width:125px;">
                        <label for="mc-surgery-duration">
                            <b>Διάρκεια</b>
                        </label>

                        <input
                            type="time"
                            id="mc-surgery-duration"
                            value="01:00"
                            style="
                                width:100%;
                                box-sizing:border-box;
                                margin-top:4px;
                            "
                        >
                    </div>
                </div>

                <div style="display:flex;gap:10px;margin-top:12px;">
                    <div style="flex:1;">
                        <label for="mc-surgery-anesthesia">
                            <b>Είδος αναισθησίας</b>
                        </label>

                        <select
                            id="mc-surgery-anesthesia"
                            style="
                                width:100%;
                                box-sizing:border-box;
                                margin-top:4px;
                            "
                        >
                            <option value="">-- Επιλογή --</option>
                            <option value="1">Γενική</option>
                            <option value="2">Ραχιαία</option>
                            <option value="3">Τοπική</option>
                            <option value="4">Περιοχική</option>
                        </select>
                    </div>

                    <div style="flex:1;">
                        <label for="mc-surgery-histological">
                            <b>Ιστολογική εξέταση</b>
                        </label>

                        <select
                            id="mc-surgery-histological"
                            style="
                                width:100%;
                                box-sizing:border-box;
                                margin-top:4px;
                            "
                        >
                            <option value="-1">Όχι</option>
                            <option value="1">Ναι</option>
                        </select>
                    </div>
                </div>

                <div style="margin-top:12px;">
                    <label for="mc-surgery-diagnosis-label">
                        <b>Νόσημα</b>
                    </label>

                    <input
                        type="text"
                        id="mc-surgery-diagnosis-label"
                        readonly
                        style="
                            width:100%;
                            box-sizing:border-box;
                            margin-top:4px;
                            background:#f4f4f4;
                        "
                    >
                </div>

                <div style="margin-top:12px;">
                    <label for="mc-surgery-act-label">
                        <b>Επέμβαση</b>
                    </label>

                    <textarea
                        id="mc-surgery-act-label"
                        rows="2"
                        readonly
                        style="
                            width:100%;
                            box-sizing:border-box;
                            margin-top:4px;
                            resize:vertical;
                            background:#f4f4f4;
                        "
                    ></textarea>
                </div>

                <div style="margin-top:12px;">
                    <label for="mc-surgery-description">
                        <b>Περιγραφή επέμβασης</b>
                    </label>

                    <textarea
                        id="mc-surgery-description"
                        rows="11"
                        style="
                            width:100%;
                            box-sizing:border-box;
                            margin-top:4px;
                            resize:vertical;
                        "
                    ></textarea>
                </div>

                <div style="
                    margin-top:14px;
                    border-top:1px solid #ccc;
                    padding-top:10px;
                ">
                    <div style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        margin-bottom:8px;
                    ">
                        <b>Συμμετέχοντες Ιατροί</b>

                        <button
                            type="button"
                            id="mc-add-surgery-doctor"
                            style="cursor:pointer;"
                        >
                            + Προσθήκη γιατρού
                        </button>
                    </div>

                    <div id="mc-surgery-doctors"></div>
                </div>

            </div>

        `;

        doc.body.appendChild(panel);


        const surgeryToggleButton =
            doc.getElementById("mc-toggle-surgery-panel");

        const surgeryCloseButton =
            doc.getElementById("mc-close-surgery-panel");

        const addSurgeryDoctorButton =
            doc.getElementById("mc-add-surgery-doctor");

        if (surgeryToggleButton) {
            surgeryToggleButton.onclick = () => {
                if (isSurgeryPanelOpen()) {
                    closeSurgeryPanel();
                } else {
                    openSurgeryPanel();
                }
            };
        }    
        if (surgeryCloseButton) {
            surgeryCloseButton.onclick = () => {
                closeSurgeryPanel();
            };
        }
        if (addSurgeryDoctorButton) {
            addSurgeryDoctorButton.onclick = () => {
                addSurgeryDoctorRow({
                    doctorId: "-1",
                    signer: false,
                    role: "2",
                    removable: true
                });
            };
        }

        const diagnosisSelect =
            doc.getElementById("mc-diagnosis-select");

        const medicalActSelect =
            doc.getElementById("mc-medact-select");

        if (diagnosisSelect) {
            diagnosisSelect.addEventListener("change", () => {
                updateSurgeryPanelFromMedicalCard();
            });
        }

        if (medicalActSelect) {
            medicalActSelect.addEventListener("change", () => {
                updateSurgeryPanelFromMedicalCard();
            });
        }

        doc.getElementById("medical-card-close").onclick = () => panel.remove();

        const left = doc.getElementById("mc-left");
        const right = doc.getElementById("mc-right");


        fillMedicalCardDoctors();
        doc.getElementById("mc-doctor").onchange = () => {
            updateDischargeInstructions();

            if (isSurgeryPanelOpen()) {
                renderSurgeryDoctors();
            }
        };
        doc.getElementById("mc-diagnosis-select").onchange = () => {
            applyDiagnosisTextIfExists();
        };
        doc.getElementById("mc-anticoagulation").onchange = () => {
            updateDischargeInstructions();
        };

        doc.getElementById("mc-followup-date").onchange = () => {
            updateDischargeInstructions();
        };

        console.table(
            [...doc.getElementById("mc-doctor").options].map(o => ({
                text: o.textContent,
                value: o.value,
                doctorId: o.dataset.doctorId
            }))
        );
        const presetSelect = doc.getElementById("mc-preset");
        const diagSelect = doc.getElementById("mc-diagnosis-select");

        function fillDiagnosisDropdownForPreset(presetName) {
            const diagSelect = doc.getElementById("mc-diagnosis-select");

            diagSelect.innerHTML =
                '<option value="">-- Επιλογή διάγνωσης --</option>';

            const list = DIAGNOSIS_OPTIONS[presetName] || [];

            list.forEach(d => {
                const fullDiagnosis = normalizeDiagnosisObject(d);

                const opt = doc.createElement("option");
                opt.value = d.id;
                opt.textContent = `${d.code} - ${d.name}`;
                opt.dataset.diagnosis = JSON.stringify(fullDiagnosis);

                if (d.default) opt.selected = true;

                diagSelect.appendChild(opt);
            });
        }

        doc.getElementById("mc-preset").onchange = () => {
            const key = doc.getElementById("mc-preset").value;
            const preset = MEDICAL_CARD_PRESETS[key];

            fillDiagnosisDropdownForPreset(key);
            fillMedicalActDropdownForPreset(key);

            if (!preset) return;

            doc.getElementById("mc-course").value = preset.course || "";
            doc.getElementById("mc-treatment").value = preset.therapy || "";

            applyDiagnosisTextIfExists();
            updateDischargeInstructions();

            if (isSurgeryPanelOpen()) {
                const descriptionBox =
                    doc.getElementById("mc-surgery-description");

                if (descriptionBox) {
                    descriptionBox.value =
                        SURGERY_DESCRIPTIONS[
                            doc.getElementById("mc-preset")?.value || ""
                        ] || "";
                }

                updateSurgeryPanelFromMedicalCard();
            }
        };

       doc.getElementById("medical-card-submit").onclick = async () => {

            const course = doc.getElementById("mc-course").value.trim();
            const therapy = doc.getElementById("mc-treatment").value.trim();
            const dischargeInstructions =
               doc.getElementById("mc-discharge-instructions").value.trim();
            const anticoagulation = doc.getElementById("mc-anticoagulation")?.value || "";
            const followupDate = doc.getElementById("mc-followup-date")?.value || "";

            const company = doc.getElementById("mc-company").value.trim();
            const left = doc.getElementById("mc-left").checked;
            const right = doc.getElementById("mc-right").checked;

            const patients = selectedPatientsFull();

            const dateText = getMedicalCardSelectedDate();

            const selectedDiagnosis = getSelectedDiagnosisObject();
            const selectedDoctorId = getSelectedMedicalCardDoctorId();
            const selectedMedicalAct = getSelectedMedicalActObject();

            if (selectedMedicalAct && !selectedDoctorId) {
                alert("Για καταχώρηση ιατρικής πράξης πρέπει να επιλέξεις Θεράποντα Ιατρό.");
                return;
            }

            if (selectedDiagnosis && !selectedDoctorId) {
                alert("Για καταχώρηση διάγνωσης πρέπει να επιλέξεις Θεράποντα Ιατρό.");
                return;
            }

            if (selectedMedicalAct && selectedMedicalAct.requireLr?.value && !getMedicalActLocation()) {
                alert("Η ιατρική πράξη απαιτεί πλευρά: Αριστερά ή Δεξιά.");
                return;
            }

            let suffix = "";

            if (left) {
                suffix += " - Αριστερά";
            }

            if (right) {
                suffix += " - Δεξιά";
            }

            if (company) {
                suffix += " - " + company;
            }

            const finalCourse =
                course
                    ? `${dateText} - ${course}${suffix}`
                    : "";

            const finalTherapy =
                therapy
                    ? `${dateText} - ${therapy}${suffix}`
                    : "";

            const finalDischargeInstructions = dischargeInstructions.trim();

            if (!patients.length) {
                alert("Δεν έχεις επιλέξει ασθενείς.");
                return;
            }

            if (!course && !therapy && !selectedDiagnosis && !selectedMedicalAct && !dischargeInstructions) {
                alert("Δεν έχεις συμπληρώσει Πορεία Νόσου, Θεραπευτική Αγωγή, Διάγνωση, Ιατρική Πράξη ή Οδηγίες κατά την έξοδο.");
                return;
            }

            if (!confirm(
                `Θα γίνει καταχώρηση στην Ιατρική Καρτέλα για ${patients.length} ασθενείς.\n\n` +
                `Ημερομηνία: ${dateText}\n\n` +
                `Να συνεχίσω;`
            )) {
                return;
            }

            medicalCardLog(
                `📝 Ξεκινά καταχώρηση στην Ιατρική Καρτέλα για ${patients.length} ασθενείς...`
            );

            for (const p of patients) {
                try {
                    medicalCardLog(`⏳ ${p.label}`);

                    SURGERY_SAVE_CONTEXT = {
                        diagnosisId: "",
                        medicalActLinkId: ""
                    };

                    const patientIds = await getDiagnosisIds(p.encounterNr);
                    let diagnosisIdForSurgery = "";
                    let medicalActLinkIdForSurgery = "";

                    if (selectedDiagnosis) {
                        const diagnosisSaveResult =
                            await saveDiagnosis(
                                p.encounterNr,
                                selectedDiagnosis,
                                selectedDoctorId
                            );

                        diagnosisIdForSurgery =
                            diagnosisSaveResult.diagnosisId;

                        console.log(
                            "DIAGNOSIS SAVE RESULT:",
                            diagnosisSaveResult
                        );

                        medicalCardLog(
                            `✅ Διάγνωση: ${selectedDiagnosis.code}`
                        );
                    }

                    if (selectedMedicalAct) {
                        const medicalActSaveResult =
                            await saveMedicalAct(
                                p.encounterNr,
                                patientIds.pnurId,
                                patientIds.ipdiId,
                                selectedMedicalAct,
                                selectedDoctorId
                            );

                        medicalActLinkIdForSurgery =
                            medicalActSaveResult.medicalActLinkId;

                        console.log(
                            "MEDICAL ACT SAVE RESULT:",
                            medicalActSaveResult
                        );

                        medicalCardLog(
                            `✅ Ιατρική πράξη: ${selectedMedicalAct.code}`
                        );
                    }

                    if (finalCourse) {
                        await saveCourse(
                            p.encounterNr,
                            finalCourse,
                            dateText
                        );
                    }

                    if (finalTherapy) {
                        await saveTherapy(
                            p.encounterNr,
                            finalTherapy,
                            dateText
                        );

                    }

                    if (finalDischargeInstructions) {
                        await saveDischargeInstructions(
                            p.encounterNr,
                            finalDischargeInstructions,
                            dateText
                        );

                        medicalCardLog(`✅ Οδηγίες εξόδου`);
                    }

                    const surgeryPanel =
                        doc.getElementById("mc-surgery-panel");

                    const shouldSaveSurgery =
                        surgeryPanel &&
                        isSurgeryPanelOpen();


                    if (shouldSaveSurgery) {
                        const surgeryResult =
                            await saveSurgeryReport({
                                encounterNr: p.encounterNr,
                                pnurId: patientIds.pnurId,

                                diagnosisId:
                                    diagnosisIdForSurgery,

                                medicalActLinkId:
                                    medicalActLinkIdForSurgery
                            });

                        console.log(
                            "SURGERY SAVE RESULT:",
                            surgeryResult
                        );

                        medicalCardLog(
                            `✅ ${p.room}/${p.bed} - ${p.name}: Πρακτικό χειρουργείου καταχωρήθηκε`
                        );
                    }    

                    medicalCardLog(`✅ ${p.label}`);

                } catch (e) {
                    medicalCardLog(`❌ ${p.label}: ${e.message}`);
                    console.error(e);
                }

                await new Promise(r => setTimeout(r, 500));
            }

            medicalCardLog("🏁 Ολοκληρώθηκε η καταχώρηση στην Ιατρική Καρτέλα.");
        };
    }

    function openSurgeryPanel() {
        const doc = getNursingFrame().document;
        const surgeryPanel = doc.getElementById("mc-surgery-panel");
        const toggleButton = doc.getElementById("mc-toggle-surgery-panel");

        if (!surgeryPanel) return;

        surgeryPanel.style.visibility = "visible";
        surgeryPanel.style.opacity = "1";
        surgeryPanel.style.transform = "translateX(0)";

        if (toggleButton) {
            toggleButton.textContent = "⬅";
            toggleButton.title = "Κλείσιμο πρακτικού χειρουργείου";
        }

        updateSurgeryPanelFromMedicalCard();
    }

    function closeSurgeryPanel() {
        const doc = getNursingFrame().document;
        const surgeryPanel = doc.getElementById("mc-surgery-panel");
        const toggleButton = doc.getElementById("mc-toggle-surgery-panel");

        if (!surgeryPanel) return;

        surgeryPanel.style.opacity = "0";
        surgeryPanel.style.transform = "translateX(-35px)";
        surgeryPanel.style.visibility = "hidden";

        if (toggleButton) {
            toggleButton.textContent = "➡";
            toggleButton.title = "Άνοιγμα πρακτικού χειρουργείου";
        }
    }

    function isSurgeryPanelOpen() {
        const doc = getNursingFrame().document;
        const surgeryPanel = doc.getElementById("mc-surgery-panel");

        return surgeryPanel?.style.visibility === "visible";
    }

    function updateSurgeryPanelFromMedicalCard() {
        const doc = getNursingFrame().document;

        const presetName =
            doc.getElementById("mc-preset")?.value || "";

        const diagnosisSelect =
            doc.getElementById("mc-diagnosis-select");

        const medicalActSelect =
            doc.getElementById("mc-medact-select");

        const surgeryDate =
            doc.getElementById("mc-surgery-date");

        const diagnosisLabel =
            doc.getElementById("mc-surgery-diagnosis-label");

        const medicalActLabel =
            doc.getElementById("mc-surgery-act-label");

        const descriptionBox =
            doc.getElementById("mc-surgery-description");

        /*
        * Η selectedDateTime() επιστρέφει:
        * YYYY-MM-DD HH:mm:ss
        *
        * Το πρακτικό θέλει:
        * DD/MM/YYYY
        */
        const selectedDateTimeValue = selectedDateTime();
        const isoDate = selectedDateTimeValue.split(" ")[0];

        let greekDate = "";

        if (isoDate) {
            const [year, month, day] = isoDate.split("-");

            if (year && month && day) {
                greekDate = `${day}/${month}/${year}`;
            }
        }

        if (surgeryDate) {
            surgeryDate.value = greekDate;
        }

        /*
        * Νόσημα = επιλεγμένη ICD-10 διάγνωση
        */
        if (diagnosisLabel) {
            const diagnosisOption =
                diagnosisSelect?.selectedOptions?.[0];

            diagnosisLabel.value =
                diagnosisOption?.textContent?.trim() || "";
        }

        /*
        * Επέμβαση = επιλεγμένη ιατρική πράξη
        */
        if (medicalActLabel) {
            const medicalActOption =
                medicalActSelect?.selectedOptions?.[0];

            medicalActLabel.value =
                medicalActOption?.textContent?.trim() || "";
        }

        /*
        * Συμπλήρωση κειμένου μόνο όταν το πεδίο είναι κενό.
        */
        if (descriptionBox && !descriptionBox.value.trim()) {
            descriptionBox.value =
                SURGERY_DESCRIPTIONS[presetName] || "";
        }

        /*
        * Δεν κάνουμε render τους γιατρούς κάθε φορά,
        * γιατί θα σβήνονται οι πρόσθετοι γιατροί.
        */
        const doctorsContainer =
            doc.getElementById("mc-surgery-doctors");

        if (
            doctorsContainer &&
            doctorsContainer.children.length === 0
        ) {
            renderSurgeryDoctors();
        }
    }

    function renderSurgeryDoctors() {
        const doc = getNursingFrame().document;
        const doctorsContainer =
            doc.getElementById("mc-surgery-doctors");

        if (!doctorsContainer) return;

        const attendingDoctorId =
            getSelectedMedicalCardDoctorId();

        doctorsContainer.innerHTML = "";

        addSurgeryDoctorRow({
            doctorId: attendingDoctorId,
            signer: true,
            role: "1",
            removable: false
        });
    }

    function addSurgeryDoctorRow({
        doctorId = "-1",
        signer = false,
        role = "1",
        removable = true
    } = {}) {
        const doc = getNursingFrame().document;

        const doctorsContainer =
            doc.getElementById("mc-surgery-doctors");

        if (!doctorsContainer) return;

        const row = doc.createElement("div");

        row.className = "mc-surgery-doctor-row";

        row.style.display = "grid";
        row.style.gridTemplateColumns = "1fr 115px 75px 34px";
        row.style.gap = "6px";
        row.style.alignItems = "center";
        row.style.marginBottom = "7px";

        const doctorOptions = DOCTORS.map(doctor => {
            const selected =
                String(doctor.id) === String(doctorId)
                    ? "selected"
                    : "";

            return `
                <option
                    value="${doctor.id}"
                    data-doctor-name="${doctor.name}"
                    ${selected}
                >
                    ${doctor.name}
                </option>
            `;
        }).join("");

        row.innerHTML = `
            <select
                class="mc-surgery-doctor-select"
                style="width:100%;"
            >
                <option value="-1">
                    Παρακαλώ επιλέξτε Συμμετέχοντα
                </option>

                ${doctorOptions}
            </select>

            <select
                class="mc-surgery-doctor-role"
                style="width:100%;"
            >
                <option value="1" ${role === "1" ? "selected" : ""}>
                    Χειρουργός
                </option>

                <option value="2" ${role === "2" ? "selected" : ""}>
                    Βοηθός
                </option>
            </select>

            <label style="white-space:nowrap;">
                <input
                    type="radio"
                    name="mc-surgery-signer"
                    class="mc-surgery-doctor-signer"
                    ${signer ? "checked" : ""}
                >
                Υπογραφή
            </label>

            ${
                removable
                    ? `
                        <button
                            type="button"
                            class="mc-remove-surgery-doctor"
                            title="Αφαίρεση γιατρού"
                        >
                            ✕
                        </button>
                    `
                    : `<span></span>`
            }
        `;

        const removeButton =
            row.querySelector(".mc-remove-surgery-doctor");

        if (removeButton) {
            removeButton.onclick = () => {
                row.remove();
            };
        }

        doctorsContainer.appendChild(row);
    }

    function fillMedicalCardDoctors() {
        const doc = getNursingFrame().document;
        const sel = doc.getElementById("mc-doctor");
        if (!sel) return;

        sel.innerHTML = '<option value="">-- Επιλογή Ιατρού --</option>';

        DOCTORS.forEach(d => {
            const opt = doc.createElement("option");

            opt.value = d.name;                 // αυτό βλέπεις/επιλέγεις σαν όνομα
            opt.textContent = d.name;
            opt.dataset.doctorId = d.id;        // αυτό στέλνουμε στο API
            opt.dataset.doctorName = d.name;

            sel.appendChild(opt);
        });
    }

    function medicalCardLog(msg) {
        const doc = getNursingFrame().document;
        const box = doc.getElementById("medical-card-log");
        if (!box) return;

        box.innerHTML += `<div>${msg}</div>`;
        box.scrollTop = box.scrollHeight;
    }

    async function saveCourse(encounterNr, text, dateText) {
    const body = new URLSearchParams();

    const [day, month, year] = dateText.split("/");

    body.append("mode", "save_course");
    body.append("pn", encounterNr);
    body.append("notes", text);
    body.append("ddate", dateText);
    body.append("s_date", `${year}-${month}-${day}`);
    body.append("s_date2", dateText);

    const res = await fetch(
        "/modules/nursing/nursing-station-patient-informational.php",
        {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body
        }
    );

    return res.text();
}

async function saveTherapy(encounterNr, text, dateText) {
    const body = new URLSearchParams();

    const [day, month, year] = dateText.split("/");

    body.append("mode", "save_therapy");
    body.append("pn", encounterNr);
    body.append("notes", text);
    body.append("ddate", dateText);
    body.append("s_date", `${year}-${month}-${day}`);
    body.append("s_date2", dateText);

    const res = await fetch(
        "/modules/nursing/nursing-station-patient-informational.php",
        {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body
        }
    );

    return res.text();
}

async function getDiagnosisIds(encounterNr) {
    const url =
        window.location.origin +
        "/modules/nursing/nursing-station-patient-informational.php" +
        "?lang=gr" +
        "&pn=" + encodeURIComponent(encounterNr) +
        "&ward_nr=57" +
        "&station=" + encodeURIComponent("Ορθοπαιδική");

    const res = await fetch(url, {
        credentials: "same-origin"
    });

    const html = await res.text();

    const m = html.match(/pnur_id=(\d+).*?ipdiId=(\d+)/s);

    console.log("DIAG IDS URL", url);
    console.log("DIAG IDS MATCH", m);

    if (!m) {
        throw new Error("Δεν βρέθηκαν pnurId/ipdiId");
    }

    return {
        pnurId: m[1],
        ipdiId: m[2]
    };
}

function getLoggedInUserId() {
    const doc = getNursingFrame().document;
    const script = doc.getElementById("user_info");

    if (!script) return "50";

    try {
        const decoded = JSON.parse(atob(script.textContent.trim()));
        return decoded.loggedInUserId || "50";
    } catch (e) {
        return "50";
    }
}

function getSelectedMedicalCardDoctorName() {
    const doc = getNursingFrame().document;
    const sel = doc.getElementById("mc-doctor");

    if (!sel || !sel.selectedOptions.length) return "";

    return sel.selectedOptions[0].dataset.doctorName || sel.value || "";
}

function getSelectedMedicalCardDoctorId() {
    const doc = getNursingFrame().document;
    const sel = doc.getElementById("mc-doctor");

    if (!sel || !sel.selectedOptions.length) return "";

    return sel.selectedOptions[0].dataset.doctorId || "";
}

function getSelectedDiagnosisObject() {
    const doc = getNursingFrame().document;
    const sel = doc.getElementById("mc-diagnosis-select");

    if (!sel || !sel.value) return null;

    const opt = sel.selectedOptions[0];

    if (!opt.dataset.diagnosis) return null;

    return JSON.parse(opt.dataset.diagnosis);
}

function applyDiagnosisTextIfExists() {
    const doc = getNursingFrame().document;

    const diagnosis = getSelectedDiagnosisObject();
    if (!diagnosis) return;

    if (diagnosis.course) {
        doc.getElementById("mc-course").value = diagnosis.course;
    }

    if (diagnosis.therapy) {
        doc.getElementById("mc-treatment").value = diagnosis.therapy;
    }
}
async function saveDiagnosis(
    encounterNr,
    diagnosis,
    doctorId
) {
    const ids = await getDiagnosisIds(encounterNr);

    if (!ids) {
        throw new Error("Δεν βρέθηκαν pnurId/ipdiId");
    }

    const loggedInUserId = getLoggedInUserId();

    const insertPayload = {
        pnurId: ids.pnurId,
        ipdiId: ids.ipdiId,
        selectedCsDrgIcds: [diagnosis],
        selectedDoctorId: String(doctorId),
        loggedInUserId: String(loggedInUserId)
    };

    console.log(
        "DIAGNOSIS INSERT PAYLOAD:",
        insertPayload
    );

    const response = await fetch(
        "/drg/icd10-grm/insert-many",
        {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(insertPayload)
        }
    );

    const responseText = await response.text();

    console.log(
        "DIAGNOSIS INSERT STATUS:",
        response.status
    );

    console.log(
        "DIAGNOSIS INSERT RESPONSE:",
        responseText
    );

    if (!response.ok) {
        throw new Error(
            `Αποτυχία καταχώρησης διάγνωσης: ${response.status}`
        );
    }

    /*
     * Για το opDocNosima χρησιμοποιείται το ICD object id,
     * όχι απαραίτητα το id της νέας εγγραφής.
     */
    SURGERY_SAVE_CONTEXT.diagnosisId =
        String(diagnosis.id);

    let responseData = null;

    try {
        responseData = responseText
            ? JSON.parse(responseText)
            : null;
    } catch (error) {
        responseData = responseText;
    }

    return {
        ids,
        diagnosisId: String(diagnosis.id),
        response: responseData
    };
}

function normalizeMedicalActObject(a) {
    return {
        id: a.id,
        code: a.code,
        displayCode: a.code + "<->",
        name: a.name,
        gender: { name: "Ανεξάρτητο", code: 9 },
        hasAgeLimits: { name: "Όχι", value: false },
        fromAge: null,
        toAge: null,
        inclusions: null,
        exclusions: null,
        notes: null,
        requireLr: { name: a.requireLr ? "Απαιτείται" : "Όχι", value: !!a.requireLr },
        fromRange: null,
        toRange: null,
        cautionInMerge: null,
        groupCode: null,
        groupId: null,
        requireC3: false,
        dependency: a.dependency || null,
        userCreate: "DBA",
        dateCreate: "14/09/2022",
        userUpdate: null,
        dateUpdate: null,
        active: true,
        version: "2017",
        isPreselected: false
    };
}

function fillMedicalActDropdownForPreset(presetName) {
    const doc = getNursingFrame().document;
    const sel = doc.getElementById("mc-medact-select");
    if (!sel) return;

    sel.innerHTML = '<option value="">-- Επιλογή ιατρικής πράξης --</option>';

    const list = MEDICAL_ACT_OPTIONS[presetName] || [];

    list.forEach(a => {
        const fullAct = normalizeMedicalActObject(a);

        const opt = doc.createElement("option");
        opt.value = a.id;
        opt.textContent = `${a.code} - ${a.name}`;
        opt.dataset.medact = JSON.stringify(fullAct);

        if (a.default) opt.selected = true;

        sel.appendChild(opt);
    });
}

function getSelectedMedicalActObject() {
    const doc = getNursingFrame().document;
    const sel = doc.getElementById("mc-medact-select");

    if (!sel || !sel.value) return null;

    const opt = sel.selectedOptions[0];
    if (!opt.dataset.medact) return null;

    return JSON.parse(opt.dataset.medact);
}

async function saveDischargeInstructions(encounterNr, text, dateText) {
    const body = new URLSearchParams();

    const [day, month, year] = dateText.split("/");

    body.append("mode", "save_instructions");
    body.append("pn", encounterNr);
    body.append("notes", text);
    body.append("ddate", dateText);
    body.append("s_date", `${year}-${month}-${day}`);
    body.append("s_date2", dateText);

    const res = await fetch(
        "/modules/nursing/nursing-station-patient-informational.php",
        {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body
        }
    );

    return res.text();
}

function normalizeMedicalActForInsert(medicalAct, location) {
    if (!medicalAct) {
        throw new Error("Δεν έχει επιλεγεί ιατρική πράξη.");
    }

    return {
        id: Number(medicalAct.id),
        code: String(medicalAct.code || ""),
        displayCode:
            String(
                medicalAct.displayCode ||
                `${medicalAct.code || ""}<->`
            ),

        name: String(medicalAct.name || ""),

        gender: {
            name: "Ανεξάρτητο",
            code: 9
        },

        hasAgeLimits: {
            name: "Όχι",
            value: false
        },

        fromAge: null,
        toAge: null,
        inclusions: medicalAct.inclusions ?? null,
        exclusions: medicalAct.exclusions ?? null,
        notes: medicalAct.notes ?? null,

        requireLr: {
            name: "Απαιτείται",
            value: true
        },

        fromRange: null,
        toRange: null,
        cautionInMerge: null,
        groupCode: null,
        groupId: null,
        requireC3: false,

        dependency:
            medicalAct.dependency ??
            "57922,57984,57994,57995,57997,57999,58000,58001,58009,58016,58017,58018,58019,58020,58021,58022,58023,58024,58028,58030,58032,58034,58036,58038,58040,58043,58045,58046,58047,58048,58087",

        userCreate: medicalAct.userCreate || "DBA",
        dateCreate: medicalAct.dateCreate || "14/09/2022",
        userUpdate: null,
        dateUpdate: null,
        active: true,
        version: "2017",
        isPreselected: false,

        location: location
    };
}

async function saveMedicalAct(
    encounterNr,
    pnurId,
    ipdiId,
    medicalAct,
    doctorId
) {
    const doc = getNursingFrame().document;

    const left =
        doc.getElementById("mc-left")?.checked === true;

    const right =
        doc.getElementById("mc-right")?.checked === true;

    let location = null;

    if (left && right) {
        location = "B";
    } else if (left) {
        location = "L";
    } else if (right) {
        location = "R";
    }

    const normalizedMedicalAct =
        normalizeMedicalActForInsert(
            medicalAct,
            location
        );

    const insertPayload = {
        pnurId: String(pnurId),
        ipdiId: String(ipdiId),

        selectedCsDrgEtips: [
            normalizedMedicalAct
        ],

        selectedDoctorId: String(doctorId),
        formattedActionDate: selectedDateTime(),
        loggedInUserId: String(getLoggedInUserId())
    };

    console.log(
        "MEDICAL ACT INSERT PAYLOAD:",
        insertPayload
    );

    const response = await fetch(
        "/drg/etip/insert-many",
        {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(insertPayload)
        }
    );

    const responseText = await response.text();

    console.log(
        "MEDICAL ACT INSERT STATUS:",
        response.status
    );

    console.log(
        "MEDICAL ACT INSERT RESPONSE:",
        responseText
    );

    if (!response.ok) {
        throw new Error(
            `Αποτυχία ιατρικής πράξης: HTTP ${response.status}`
        );
    }

    let responseData;

    try {
        responseData = JSON.parse(responseText);
    } catch {
        throw new Error(
            "Η ιατρική πράξη δεν επέστρεψε JSON. " +
            "Δες το MEDICAL ACT INSERT RESPONSE στο Console."
        );
    }

    if (responseData.status !== true) {
        throw new Error(
            "Η καταχώρηση της ιατρικής πράξης απέτυχε."
        );
    }

    /*
     * Το endpoint επιστρέφει συνήθως:
     * {"status":true,"ipdgIds":[35182]}
     *
     * Αυτό το ID χρειάζεται το πρακτικό χειρουργείου.
     */
    const medicalActLinkId =
    responseData.ipdgIds?.[0] ?? "";

    if (!medicalActLinkId) {
        throw new Error(
            "Η πράξη καταχωρήθηκε αλλά δεν επέστρεψε ipdgId."
        );
    }

    SURGERY_SAVE_CONTEXT.medicalActLinkId =
        String(medicalActLinkId);

    console.log(
        "SURGERY MEDICAL ACT LINK ID:",
        SURGERY_SAVE_CONTEXT.medicalActLinkId
    );

    return {
        medicalActLinkId:
            String(medicalActLinkId),

        response: responseData
    };
}

async function saveSurgeryReport({
    encounterNr,
    pnurId,
    diagnosisId,
    medicalActLinkId
}) {
    const doc = getNursingFrame().document;

    const opDocDate =
        doc.getElementById("mc-surgery-date")?.value || "";

    const opDocDuration =
        doc.getElementById("mc-surgery-duration")?.value || "01:00";

    const opDocAnaestesia =
        doc.getElementById("mc-surgery-anesthesia")?.value || "";

    const opDocHistological =
        doc.getElementById("mc-surgery-histological")?.value || "-1";

    const opEpemvasiDescr =
        doc.getElementById("mc-surgery-description")?.value.trim() || "";

    if (!opDocDate) {
        throw new Error("Δεν έχει επιλεγεί ημερομηνία πρακτικού.");
    }

    if (!opDocAnaestesia) {
        throw new Error("Δεν έχει επιλεγεί είδος αναισθησίας.");
    }

    if (!opEpemvasiDescr) {
        throw new Error("Η περιγραφή επέμβασης είναι κενή.");
    }

    if (!diagnosisId) {
        throw new Error("Δεν υπάρχει ID διάγνωσης για το πρακτικό.");
    }

    if (!medicalActLinkId) {
        throw new Error("Δεν υπάρχει ID ιατρικής πράξης για το πρακτικό.");
    }

    const doctorRows = [
        ...doc.querySelectorAll(".mc-surgery-doctor-row")
    ];

    const doctorsList = doctorRows.map(row => {
        const doctorSelect =
            row.querySelector(".mc-surgery-doctor-select");

        const roleSelect =
            row.querySelector(".mc-surgery-doctor-role");

        const signerInput =
            row.querySelector(".mc-surgery-doctor-signer");

        const selectedOption =
            doctorSelect?.selectedOptions?.[0];

        const doctorId =
            doctorSelect?.value || "-1";

        const doctorName =
            selectedOption?.dataset.doctorName ||
            selectedOption?.textContent?.trim() ||
            "Παρακαλώ επιλέξτε Συμμετέχοντα";

        return {
            opDoctorSigner: signerInput?.checked ? 1 : 0,
            opCsDoctorId: String(doctorId),
            opDoctorFullname:
                doctorId === "-1"
                    ? "Παρακαλώ επιλέξτε Συμμετέχοντα"
                    : `${doctorName} (ΟΡΘΟΠΑΙΔΙΚΗ ΚΑΙ ΤΡΑΥΜΑΤΟΛΟΓΙΑ)`,
            opDoctorAMKA: "",
            opDocId: "new",
            opDoctorRole:
                doctorId === "-1"
                    ? -1
                    : Number(roleSelect?.value || 1)
        };
    });

    const payload = {
        opDocDate: opDocDate,
        opDocDuration: opDocDuration,
        opDocNosima: String(diagnosisId),

        epemvaseisList: [
            {
                opSyndesiEpemvasisId:
                    String(medicalActLinkId),

                opEpemvasiDescr:
                    opEpemvasiDescr,

                opEpemvasiType: "1",
                opDocId: "new",
                doctorsList: doctorsList
            }
        ],

        opDocAnaestesia:
            String(opDocAnaestesia),

        opDocHistological:
            Number(opDocHistological),

        materialsList: [],
        opDocId: "new",

        opDocEncounterNr:
            String(encounterNr),

        opDocPnurId:
            String(pnurId),

        opDocDrg: 1,
        opDocType: 1,
        initData: ""
    };

    console.log("SURGERY REPORT PAYLOAD:", payload);

    const response = await fetch(
        "/surgery/save-all-op-data",
        {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Accept":
                    "application/json, text/javascript, */*; q=0.01",
                "Content-Type":
                    "application/json; charset=UTF-8"
            },
            body: JSON.stringify(payload)
        }
    );

    const responseText = await response.text();

    console.log(
        "SURGERY REPORT STATUS:",
        response.status
    );

    console.log(
        "SURGERY REPORT RESPONSE:",
        responseText
    );

    if (!response.ok) {
        throw new Error(
            `Αποτυχία πρακτικού: HTTP ${response.status}`
        );
    }

    let responseData;

    try {
        responseData = JSON.parse(responseText);
    } catch {
        throw new Error(
            "Το πρακτικό δεν επέστρεψε έγκυρο JSON."
        );
    }

    if (responseData.bStatus !== true) {
        throw new Error(
            responseData.sErrorMsg ||
            "Απέτυχε η αποθήκευση πρακτικού."
        );
    }

    return responseData;
}

function extractMedicalActLinkId(data) {
    if (!data) return "";

    /*
     * Πιθανές άμεσες μορφές response
     */
    const directValue =
        data.opSyndesiEpemvasisId ??
        data.medicalActLinkId ??
        data.ipdgId ??
        data.insertedId ??
        data.id ??
        "";

    if (directValue) {
        return String(directValue);
    }

    /*
     * Πιθανά arrays
     */
    const possibleArrays = [
        data.ipdgIds,
        data.ids,
        data.insertedIds,
        data.medicalActIds,
        data.data
    ];

    for (const value of possibleArrays) {
        if (
            Array.isArray(value) &&
            value.length > 0
        ) {
            const first = value[0];

            if (
                typeof first === "string" ||
                typeof first === "number"
            ) {
                return String(first);
            }

            if (first && typeof first === "object") {
                const nestedId =
                    first.opSyndesiEpemvasisId ??
                    first.ipdgId ??
                    first.id ??
                    first.insertedId ??
                    "";

                if (nestedId) {
                    return String(nestedId);
                }
            }
        }
    }

    /*
     * Πιθανό nested payload
     */
    if (
        data.sPayload &&
        typeof data.sPayload === "object"
    ) {
        return extractMedicalActLinkId(data.sPayload);
    }

    if (
        data.payload &&
        typeof data.payload === "object"
    ) {
        return extractMedicalActLinkId(data.payload);
    }

    return "";
}

async function validateMedicalAct(
    patient,
    etip
) {
    const payload = {
        ...patient,
        selectedCsDrgEtips: {
            0: etip
        }
    };

    const res = await fetch(
        "/drg/validation/validateSelectedEtips",
        {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        }
    );

    return res.json();
}

    setTimeout(createPanel, 4000);
})();
