// =======================
// STATE GLOBAL
// =======================
let dataSoal = {};
let dataSoalAktif = {};
let level = 1;
let teksAktif = new URLSearchParams(window.location.search).get("teks") || "1";

let semuaJawaban = [];
let currentNama = null;
let sessionUserId = crypto.randomUUID();
let skor = { l1: null, l2: null, l3: null, l4: null };
let modeTombol = "submit"; // submit | next | finish

const URL_API = "https://script.google.com/macros/s/AKfycbzE2yS5EXZ2lAvZwtvAI64LHXdQc3FJBQAYztcoJRMzvwDFwGIlBpG3wT33IV6qIXWt/exec";

// =======================
// NAVBAR
// =======================
fetch("../pages/navbar.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("navbar").innerHTML = data;
  });


// =======================
// USER SYSTEM
// =======================
function getUserId(){
  return sessionUserId;
}

function getNama(){
  return currentNama || "anonymous";
}


function simpanNama() {
  let val = getEl("namaUser").value;

  if (!val.trim()) {
    alert("Nama wajib diisi");
    return;
  }

  currentNama = val;
  
  // ✅ TAMBAHKAN INI — supaya hasil.js bisa baca nama
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
      { label: "Banyak", response: "Siap lanjut." }
    ]
  },
  {
    text: "Kita mulai ya",
    options: [{ label: "Mulai", response: "Semangat" }]
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

  setHTML("apersepsiOpsi",
    `<button onclick="lanjutApersepsi()">Lanjut</button>`
  );
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
  const res = await fetch("../json/maharah.json");
  const data = await res.json();

  const teksData = data["teks" + teksAktif];

  if (!teksData) {
    setHTML("quiz-container", "Data tidak ditemukan");
    return;
  }

  setText("judulLatihan", "Uji Kemampuan");
  setText("judulTeks", teksData.judul || "");
  
  // ✅ TAMBAHIN INFO TEKS
  setText("infoTeks", `Latihan Teks ${teksAktif}: ${teksData.judul || ""}`);
  
  // ✅ SIMPAN INFO KE SESSIONSTORAGE (buat dipake di hasil.html nanti)
  sessionStorage.setItem("teksAktif", teksAktif);
  sessionStorage.setItem("judulTeks", teksData.judul || "");

  dataSoal = teksData;
  console.log("ISI dataSoal:", dataSoal);
  console.log("KEYS:", Object.keys(dataSoal));
  console.log("TOTAL LEVEL:", getTotalLevel());
  
  loadLevel(1);
}


// =======================
// LEVEL SYSTEM
// =======================
function loadLevel(n) {
  
  // ✅ AUTO-SAVE SEBELUM PINDAH LEVEL
  if (dataSoalAktif && dataSoalAktif.sections) {
    console.log("Auto-saving jawaban level", level);
    simpanJawabanLevel(); // Simpan jawaban level sekarang dulu
  }
  
  level = n;

  dataSoalAktif = dataSoal["level" + level];

  if (!dataSoalAktif) {
    setHTML("quiz-container", "Level tidak ditemukan");
    return;
  }

  enable("btn-aksi");

  setHTML("hasil", "");

  renderSoal();
  
  // ✅ LOAD JAWABAN YANG SUDAH TERSIMPAN (KALAU ADA)
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
      
      let id = `L${level}_S${sIndex}_${i}`;
      
      // Cari jawaban yang sudah tersimpan
      let saved = semuaJawaban.find(j => j.soalId === id);
      
      if (saved) {
        // Isi kembali input dengan jawaban tersimpan
        let el = getEl(`jawaban-${sIndex}-${i}`);
        if (el) {
          el.value = saved.jawaban;
          
          // Auto-resize textarea kalau perlu
          if (el.tagName === 'TEXTAREA') {
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
          }
        }
      }
      
    });
  });
  
  console.log("Loaded", semuaJawaban.length, "jawaban tersimpan");
}



function renderLevelList(){
  let total = getTotalLevel();
  let html = "";

  for(let i = 1; i <= total; i++){
    let aktif = i === level ? "active" : "";
    html += `<div class="level-item ${aktif}" onclick="loadLevel(${i})">Level ${i}</div>`;
  }

  setHTML("level-list", html);
}

function updateProgress(){
  let total = getTotalLevel();
  let persen = (level / total) * 100;

  getEl("progress-fill").style.width = persen + "%";
  setText("progress-text", `Level ${level} dari ${total}`);
}


// =======================
// RENDER SOAL
// =======================
function renderSoal() {
  let html = "";

  setText("judul", dataSoalAktif.judul);
  

  dataSoalAktif.sections.forEach((section, sIndex) => {

    html += `<div class="section">
      <h3>${section.judul}</h3>
      <p>${section.instruksi}</p>
    </div>`;

    section.soal.forEach((item, i) => {

      let label = item.label || item.pertanyaan || "";

      let input = (level === 1)
        ? `<input type="text" class="jawaban" id="jawaban-${sIndex}-${i}">`
        : `<textarea class="jawaban" id="jawaban-${sIndex}-${i}"></textarea>`;

      html += `<div class="soal">
        <label>${angkaArab(i + 1)}. ${label}</label>
        ${input}
      </div>`;
    });
  });

  setHTML("quiz-container", html);
}

document.addEventListener("input", function(e){
  if(e.target.classList.contains("jawaban")){
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  }
});


// =======================
// SIMPAN JAWABAN GLOBAL (ANTI DUPLIKAT)
// =======================
function simpanJawabanLevel(){

  dataSoalAktif.sections.forEach((section, sIndex) => {
    section.soal.forEach((item, i) => {

      let val = getEl(`jawaban-${sIndex}-${i}`).value;

      let id = `L${level}_S${sIndex}_${i}`;

      let existingIndex = semuaJawaban.findIndex(j => j.soalId === id);

      let obj = {
        userId: getUserId(),
        nama: getNama(),
        teks: teksAktif,
        level: level,
        soalId: id,
        pertanyaan: item.pertanyaan,
        jawaban: val,
        timestamp: new Date().toISOString()
      };

      if(existingIndex !== -1){
        semuaJawaban[existingIndex] = obj;
      } else {
        semuaJawaban.push(obj);
      }

    });
  });
}


// =======================
// VALIDASI + SUBMIT LEVEL
// =======================
function submit() {

  if(!currentNama){
    alert("Isi nama dulu");
    return;
  }

  let kosong = [];

  dataSoalAktif.sections.forEach((section, sIndex) => {
    section.soal.forEach((item, i) => {

      let el = getEl(`jawaban-${sIndex}-${i}`);
      let val = el.value;

      if (!val.trim()) {
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
// SUBMIT AKHIR (AI SEKALI)
// =======================
async function submitAI_AKHIR() {
  setHTML("hasil", "⏳ Sedang mengirim, tunggu ya...");

  try {
    const userId = getUserId();

    if (semuaJawaban.length === 0) {
      throw new Error("Tidak ada jawaban untuk dikirim");
    }

    const payload = {
      tipe: "raw",
      userId: userId,
      nama: currentNama || "",
      teks: teksAktif || "",
      jawaban: semuaJawaban
    };

    setHTML("hasil", "⏳ Mengirim ke server...");

    // ✅ Pakai text/plain — tidak trigger preflight CORS
    // ✅ Hapus mode: "no-cors" — supaya response bisa dibaca
    const res = await fetch(URL_API, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "text/plain" }
    });

    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status}`);
    }

    const json = await res.json();
    console.log("RESPONSE BACKEND:", json);

    setHTML("hasil", "✅ Berhasil! Mengalihkan ke halaman hasil...");

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
  let list = [];
  if (skor.l1 !== null) list.push(skor.l1);
  if (skor.l2 !== null) list.push(skor.l2);
  if (skor.l3 !== null) list.push(skor.l3);
  if (skor.l4 !== null) list.push(skor.l4);

  let final = 0;
  if (list.length > 0) {
    final = Math.round(list.reduce((a, b) => a + b, 0) / list.length * 100);
  }

  fetch(URL_API, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({
      tipe: "final",
      userId: getUserId(),
      nama: getNama(),
      level1: skor.l1,
      level2: skor.l2,
      level3: skor.l3,
      level4: skor.l4,
      final: final
    })
  });
}


// =======================
// UTIL
// =======================
function getEl(id){ return document.getElementById(id); }
function setHTML(id,val){ getEl(id).innerHTML = val; }
function setText(id,val){ getEl(id).innerText = val; }
function show(id){ getEl(id).style.display="block"; }
function hide(id){ getEl(id).style.display="none"; }
function disable(id){ getEl(id).disabled=true; }
function enable(id){ getEl(id).disabled=false; }
function angkaArab(n){
  return n.toString().split("").map(d=>"٠١٢٣٤٥٦٧٨٩"[d]).join("");
}

function getTotalLevel(){
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

function handleTombol(){

  if(modeTombol === "submit"){
    submit();
  }

  else if(modeTombol === "next"){
    disable("btn-aksi");
    loadLevel(level + 1);
  }

  else if(modeTombol === "finish"){
    disable("btn-aksi");
    submitAI_AKHIR();
  }

}

function updateTombol(){

  let btn = getEl("btn-aksi");
  let total = getTotalLevel();

  if(modeTombol === "submit"){
    btn.innerText = "Lanjut";
  }

  else if(modeTombol === "next"){
    btn.innerText = "Lanjut Level Berikutnya";
  }

  else if(modeTombol === "finish"){
    btn.innerText = "Lihat Hasil";
  }

}