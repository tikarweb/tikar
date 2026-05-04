// =======================
// STATE GLOBAL
// =======================
let dataSoal      = {};
let dataSoalAktif = {};
let level         = 1;
let teksAktif     = new URLSearchParams(window.location.search).get("teks") || "1";

let semuaJawaban  = [];
let currentNama   = null;
let sessionUserId = crypto.randomUUID();
let skor          = { l1: null, l2: null, l3: null, l4: null };
let modeTombol    = "submit"; // "submit" | "next" | "finish"

// ✅ Isi teks bacaan — dikirim ke AI agar feedback mengacu teks
let teksKonten = "";

const URL_API = "https://script.google.com/macros/s/AKfycbzE2yS5EXZ2lAvZwtvAI64LHXdQc3FJBQAYztcoJRMzvwDFwGIlBpG3wT33IV6qIXWt/exec";

// =======================
// NAVBAR
// =======================
fetch("../pages/navbar.html")
  .then(res => res.text())
  .then(html => {
    const el = document.getElementById("navbar");
    if (el) el.innerHTML = html;
  });

// =======================
// USER SYSTEM
// =======================
function getUserId() { return sessionUserId; }
function getNama()   { return currentNama || "anonymous"; }

function simpanNama() {
  const val = getEl("namaUser").value;
  if (!val.trim()) { alert("Nama wajib diisi"); return; }

  currentNama = val;
  sessionStorage.setItem("namaSiswa", val);

  disable("namaUser");
  hide("inputNamaBox");
  show("quiz-area");
}

// =======================
// APERSEPSI
// =======================
const apersepsiDialog = [
  {
    text: "Marhaban! Aku Lubi! Sudah baca teksnya?",
    options: [
      { label: "Sudah", response: "Bagus, kita mulai." },
      { label: "Belum", response: "Baca dulu ya biar paham." }
    ]
  },
  {
    text: "Seberapa paham?",
    options: [
      { label: "Sedikit", response: "Tenang, kita pelan." },
      { label: "Banyak",  response: "Siap lanjut." }
    ]
  },
  {
    text: "Kita mulai ya",
    options: [{ label: "Mulai", response: "Semangat!" }]
  }
];

let apersepsiIndex = 0;

function mulaiApersepsi() {
  show("apersepsiOverlay");
  show("apersepsiBox");
  apersepsiIndex = 0;
  tampilkanApersepsi();
}

function tampilkanApersepsi() {
  const step = apersepsiDialog[apersepsiIndex];
  setText("maskotText", step.text);
  setHTML("apersepsiOpsi",
    step.options.map((opt, i) =>
      `<button onclick="pilihApersepsi(${i})">${opt.label}</button>`
    ).join("")
  );
}

function pilihApersepsi(i) {
  const step = apersepsiDialog[apersepsiIndex];
  setText("maskotText", step.options[i].response);
  setHTML("apersepsiOpsi", `<button onclick="lanjutApersepsi()">Lanjut</button>`);
}

function lanjutApersepsi() {
  apersepsiIndex++;
  if (apersepsiIndex < apersepsiDialog.length) tampilkanApersepsi();
  else tutupApersepsi();
}

function tutupApersepsi() {
  hide("apersepsiOverlay");
  hide("apersepsiBox");
}

// =======================
// LOAD DATA
// =======================
async function loadData() {
  const resSoal  = await fetch("../json/maharah.json");
  const soalJSON = await resSoal.json();
  const teksData = soalJSON["teks" + teksAktif];

  if (!teksData) {
    setHTML("quiz-container", "Data soal tidak ditemukan.");
    return;
  }

  setText("judulLatihan", "Uji Kemampuan");
  setText("judulTeks", teksData.judul || "");
  setText("infoTeks", `Latihan Teks ${teksAktif}: ${teksData.judul || ""}`);

  sessionStorage.setItem("teksAktif", teksAktif);
  sessionStorage.setItem("judulTeks", teksData.judul || "");

  dataSoal = teksData;

  await loadTeksKonten();

  loadLevel(1);
}

// =======================
// LOAD TEKS KONTEN
// =======================
async function loadTeksKonten() {
  try {
    const res  = await fetch("../json/teks.json");
    const data = await res.json();

    const idAngka = parseInt(teksAktif);
    const teksObj = data.teks.find(t => t.id === idAngka);

    if (!teksObj) {
      console.warn("⚠️ Teks ID", idAngka, "tidak ditemukan di teks.json");
      teksKonten = "";
      return;
    }

    if (Array.isArray(teksObj.paragraf)) {
      teksKonten = teksObj.paragraf.join("\n\n");
    } else if (typeof teksObj.paragraf === "string") {
      teksKonten = teksObj.paragraf;
    } else {
      teksKonten = "";
    }

    if (teksObj.judul) {
      sessionStorage.setItem("judulTeks", teksObj.judul);
    }

    console.log("✅ teksKonten dimuat, panjang:", teksKonten.length, "karakter");

  } catch (err) {
    console.warn("⚠️ Gagal load teks.json:", err.message);
    teksKonten = "";
  }
}

// =======================
// LEVEL SYSTEM
// =======================
function loadLevel(n) {
  if (dataSoalAktif && dataSoalAktif.sections) {
    simpanJawabanLevel();
  }

  level         = n;
  dataSoalAktif = dataSoal["level" + level];

  if (!dataSoalAktif) {
    setHTML("quiz-container", "Level tidak ditemukan.");
    return;
  }

  enable("btn-aksi");
  setHTML("hasil", "");

  renderSoal();
  loadJawabanTersimpan();
  renderLevelList();
  updateProgress();

  modeTombol = "submit";
  updateTombol();
}

// =======================
// LOAD JAWABAN TERSIMPAN
// =======================
function loadJawabanTersimpan() {
  dataSoalAktif.sections.forEach((section, sIndex) => {
    section.soal.forEach((item, i) => {
      const id    = `L${level}_S${sIndex}_${i}`;
      const saved = semuaJawaban.find(j => j.soalId === id);
      if (!saved) return;

      const el = getEl(`jawaban-${sIndex}-${i}`);
      if (!el) return;

      el.value = saved.jawaban;
      if (el.tagName === "TEXTAREA") {
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
      }
    });
  });
}

// =======================
// RENDER LEVEL LIST & PROGRESS
// =======================
function renderLevelList() {
  const total = getTotalLevel();
  let html = "";
  for (let i = 1; i <= total; i++) {
    const aktif = i === level ? "active" : "";
    html += `<div class="level-item ${aktif}" onclick="loadLevel(${i})">Level ${i}</div>`;
  }
  setHTML("level-list", html);
}

function updateProgress() {
  const total  = getTotalLevel();
  const persen = (level / total) * 100;
  getEl("progress-fill").style.width = persen + "%";
  setText("progress-text", `Level ${level} dari ${total}`);
}

// =======================
// TIPE CONFIG
// Label, warna badge, tinggi textarea
// =======================
const TIPE_CONFIG = {
  isian: {
    badge: "Isian Singkat",
    color: "#3b82f6",
    hint:  "Tulis kata atau frasa pendek (1–3 kata)",
    input: "text"
  },
  transformasi: {
    badge: "Transformasi Kalimat",
    color: "#8b5cf6",
    hint:  "Ubah kalimat sesuai perintah, tulis kalimat baru yang lengkap",
    input: "textarea",
    rows:  3
  },
  kata_kunci: {
    badge: "Buat Kalimat",
    color: "#0891b2",
    hint:  "Gunakan kata-kata kunci di atas untuk membuat 1 kalimat penuh",
    input: "textarea",
    rows:  3
  },
  jawab_kalimat: {
    badge: "Jawab 1 Kalimat",
    color: "#059669",
    hint:  "Jawab dengan 1 jumlah mufidah (kalimat penuh) dari ekspresimu sendiri",
    input: "textarea",
    rows:  3
  },
  sebab_akibat: {
    badge: "Sebab → Akibat",
    color: "#7c3aed",
    hint:  "Tulis akibat / نتيجة dari sebab di atas dalam 2–3 kalimat terhubung",
    input: "textarea",
    rows:  4
  },
  ringkasan: {
    badge: "Ringkasan / Perbandingan",
    color: "#d97706",
    hint:  "Tulis 2–3 kalimat terhubung menggunakan أدوات الربط",
    input: "textarea",
    rows:  5
  },
  narasi: {
    badge: "Paragraf Bebas",
    color: "#dc2626",
    hint:  "Tulis paragraf 3–5 kalimat terhubung dengan kosakata tepat",
    input: "textarea",
    rows:  7
  }
};

// =======================
// RENDER SOAL ← DIPERBARUI
// =======================
function renderSoal() {
  let html = "";
  setText("judul", dataSoalAktif.judul);

  dataSoalAktif.sections.forEach((section, sIndex) => {
    // Tentukan tipe — fallback ke isian (level1) atau textarea (level2+)
    const tipe   = section.tipe || (level === 1 ? "isian" : "ringkasan");
    const config = TIPE_CONFIG[tipe] || TIPE_CONFIG["isian"];

    // Badge tipe soal
    const badge = `<span class="tipe-badge" style="
      background:${config.color}18;
      color:${config.color};
      border:1px solid ${config.color}40;
      font-size:0.72rem;
      font-weight:600;
      padding:2px 10px;
      border-radius:20px;
      margin-bottom:6px;
      display:inline-block;
      font-family:'Karla',sans-serif;
      letter-spacing:0.3px;
    ">${config.badge}</span>`;

    // Hint teks
    const hintEl = `<p class="tipe-hint" style="
      font-size:0.78rem;
      color:#64748b;
      margin:4px 0 10px;
      font-family:'Karla',sans-serif;
      font-style:italic;
    "><i class="bi bi-info-circle me-1"></i>${config.hint}</p>`;

    html += `<div class="section">
      <h3>${section.judul}</h3>
      ${badge}
      <p>${section.instruksi}</p>
      ${hintEl}
    </div>`;

    section.soal.forEach((item, i) => {
      const label = item.label || item.pertanyaan || "";
      let input;

      if (config.input === "text") {
        input = `<input type="text" class="jawaban" id="jawaban-${sIndex}-${i}" 
          style="direction:rtl; text-align:right;" 
          placeholder="اكتب إجابتك هنا...">`;
      } else {
        const rows = config.rows || 3;
        input = `<textarea class="jawaban" id="jawaban-${sIndex}-${i}" rows="${rows}"
          style="direction:rtl; text-align:right; resize:vertical;"
          placeholder="اكتب إجابتك هنا..."></textarea>`;
      }

      html += `<div class="soal">
        <label>${angkaArab(i + 1)}. ${label}</label>
        ${input}
      </div>`;
    });
  });

  setHTML("quiz-container", html);
}

// Auto-resize textarea
document.addEventListener("input", function (e) {
  if (e.target.classList.contains("jawaban")) {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  }
});

// =======================
// SIMPAN JAWABAN (ANTI DUPLIKAT)
// =======================
function simpanJawabanLevel() {
  dataSoalAktif.sections.forEach((section, sIndex) => {
    section.soal.forEach((item, i) => {
      const val           = getEl(`jawaban-${sIndex}-${i}`).value;
      const id            = `L${level}_S${sIndex}_${i}`;
      const existingIndex = semuaJawaban.findIndex(j => j.soalId === id);

      const obj = {
        userId:     getUserId(),
        nama:       getNama(),
        teks:       teksAktif,
        level:      level,
        soalId:     id,
        pertanyaan: item.pertanyaan,
        jawaban:    val,
        timestamp:  new Date().toISOString()
      };

      if (existingIndex !== -1) semuaJawaban[existingIndex] = obj;
      else semuaJawaban.push(obj);
    });
  });
}

// =======================
// VALIDASI + SUBMIT LEVEL
// =======================
function submit() {
  if (!currentNama) { alert("Isi nama dulu"); return; }

  const kosong = [];
  dataSoalAktif.sections.forEach((section, sIndex) => {
    section.soal.forEach((item, i) => {
      const el = getEl(`jawaban-${sIndex}-${i}`);
      if (!el.value.trim()) {
        kosong.push(el);
        el.style.border = "2px solid red";
      } else {
        el.style.border = "";
      }
    });
  });

  if (kosong.length > 0) {
    alert("Masih ada jawaban kosong");
    kosong[0].focus();
    return;
  }

  simpanJawabanLevel();
  modeTombol = (level === getTotalLevel()) ? "finish" : "next";
  updateTombol();
}

// =======================
// SUBMIT AKHIR
// =======================
async function submitAI_AKHIR() {
  setHTML("hasil", "⏳ Sedang mengirim, tunggu ya...");

  try {
    const userId = getUserId();

    if (semuaJawaban.length === 0) {
      throw new Error("Tidak ada jawaban untuk dikirim.");
    }

    const payload = {
      tipe:       "raw",
      userId:     userId,
      nama:       currentNama  || "",
      teks:       teksAktif    || "",
      teksKonten: teksKonten   || "",
      jawaban:    semuaJawaban
    };

    console.log("Mengirim", semuaJawaban.length, "jawaban, teksKonten panjang:", teksKonten.length);

    setHTML("hasil", "⏳ Mengirim ke server...");

    const res = await fetch(URL_API, {
      method:  "POST",
      headers: { "Content-Type": "text/plain" },
      body:    JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

    const json = await res.json();
    console.log("Response backend:", json);

    setHTML("hasil", "✅ Berhasil! Mengalihkan ke halaman hasil...");

    // ✅ Simpan jawaban ke sessionStorage agar tampil di hasil.html
    sessionStorage.setItem("semuaJawaban", JSON.stringify(semuaJawaban));
    sessionStorage.setItem("namaUser", currentNama || "");
    sessionStorage.setItem("teksAktif", teksAktif);

    setTimeout(() => {
      window.location.href = `hasil.html?userId=${userId}&teks=${teksAktif}`;
    }, 1500);

  } catch (err) {
    console.error("❌ ERROR SUBMIT:", err);
    setHTML("hasil", `
      <div style="color:red; padding:1rem; background:#fee; border-radius:8px;">
        <strong>❌ Error:</strong> ${err.message}<br>
        <small>Coba refresh dan submit lagi.</small>
      </div>
    `);
  }
}

// =======================
// FINAL SCORE
// =======================
function kirimHasilAkhir() {
  const list = [];
  if (skor.l1 !== null) list.push(skor.l1);
  if (skor.l2 !== null) list.push(skor.l2);
  if (skor.l3 !== null) list.push(skor.l3);
  if (skor.l4 !== null) list.push(skor.l4);

  const final = list.length > 0
    ? Math.round(list.reduce((a, b) => a + b, 0) / list.length * 100)
    : 0;

  fetch(URL_API, {
    method:  "POST",
    headers: { "Content-Type": "text/plain" },
    body:    JSON.stringify({
      tipe:   "final",
      userId: getUserId(),
      nama:   getNama(),
      level1: skor.l1,
      level2: skor.l2,
      level3: skor.l3,
      level4: skor.l4,
      final:  final
    })
  });
}

// =======================
// UTIL
// =======================
function getEl(id)        { return document.getElementById(id); }
function setHTML(id, val) { getEl(id).innerHTML = val; }
function setText(id, val) { getEl(id).innerText  = val; }
function show(id)         { getEl(id).style.display = "block"; }
function hide(id)         { getEl(id).style.display = "none"; }
function disable(id)      { getEl(id).disabled = true; }
function enable(id)       { getEl(id).disabled = false; }

function angkaArab(n) {
  return n.toString().split("").map(d => "٠١٢٣٤٥٦٧٨٩"[d]).join("");
}

function getTotalLevel() {
  return Object.keys(dataSoal)
    .filter(k => /^level\d+$/.test(k))
    .length;
}

// =======================
// INIT
// =======================
document.addEventListener("DOMContentLoaded", () => {
  getEl("btn-aksi").onclick = handleTombol;
  mulaiApersepsi();
  loadData();
});

function handleTombol() {
  if      (modeTombol === "submit") submit();
  else if (modeTombol === "next")   { disable("btn-aksi"); loadLevel(level + 1); }
  else if (modeTombol === "finish") { disable("btn-aksi"); submitAI_AKHIR(); }
}

function updateTombol() {
  const btn = getEl("btn-aksi");
  if      (modeTombol === "submit") btn.innerText = "Lanjut";
  else if (modeTombol === "next")   btn.innerText = "Lanjut Level Berikutnya";
  else if (modeTombol === "finish") btn.innerText = "Lihat Hasil";
}