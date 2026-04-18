console.log("URL:", window.location.search);

// =======================
// VARIABEL GLOBAL
// =======================
let teksAktif = 1;
const params = new URLSearchParams(window.location.search);
const teksDariURL = params.get("teks");
if(teksDariURL) teksAktif = parseInt(teksDariURL);

// TAMBAHKAN DI SINI
if([3,5,6].includes(teksAktif)){
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".header-latihan").classList.add("fix-header");
  });
}

let skor = { l1:0, l2:0, l3:0, l4:0 };
let dataSoal;

// =======================
// NAVBAR
// =======================
fetch("../pages/navbar.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("navbar").innerHTML = data;
  });

// =======================
// APERSEPSI (FIX FINAL)
// =======================
document.addEventListener("DOMContentLoaded", ()=> initApersepsi());

const apersepsiDialog = [
  {
    text: "Marhaban! Aku si Maskot Arabo Berapa banyak bahasa Arab yang kamu tahu dari teks sebelumnya?",
    options: [
      { label:"Aku tahu sedikit", response:"Hmm… sedikit aja? Tenang, latihan kita bakal seru tapi santai kok!" },
      { label:"Aku tahu banyak", response:"Wow! Hebat! Kita bisa langsung latihan yang menantang!" },
      { label:"Aku belum baca teksnya", response:"Ah, iya ya… sebaiknya baca dulu teksnya biar latihan lebih seru" }
    ]
  },
  {
    text: "Oke, pertanyaan lucu. Kalau bisa belajar sambil makan kue, pilih yang mana?",
    options: [
      { label:"Belajar dulu", response:"Pintar! Prioritas belajar dulu" },
      { label:"Kue dulu", response:"Wkwk jujur banget tapi lanjut belajar ya!" }
    ]
  },
  {
    text: "Terakhir nih… kamu siap latihan serius atau santai tapi konsisten?",
    options: [
      { label:"Serius", response:"Mantap! Kita gas" },
      { label:"Santai", response:"Santai tapi konsisten itu kuat" }
    ]
  }
];

let apersepsiStep = 0;
let typingDone = false;
let typeTimer;

//NAMA USER
document.addEventListener("DOMContentLoaded", () => {
  let nama = localStorage.removeItem("namaUser");
  if(nama){
    const box = document.getElementById("inputNamaBox");
    if(box) box.style.display = "none";
  }
});


// INIT
function initApersepsi(){
  const sudah = localStorage.getItem("apersepsi_teks"+teksAktif);
  if(sudah) return;

  apersepsiStep = 0;

  document.querySelector(".main-layout").classList.add("blur");
  document.getElementById("apersepsiOverlay").style.display="block";
  document.getElementById("apersepsiBox").style.display="flex";

  showStep();
}

// SHOW STEP
function showStep(){
  const textEl = document.getElementById("maskotText");
  const opsi = document.getElementById("apersepsiOpsi");
  const maskot = document.getElementById("maskotImg");

  opsi.innerHTML="";
  typingDone=false;
  maskot.classList.add("typing");

  const current = apersepsiDialog[apersepsiStep];

  typeText(current.text, textEl, 40, ()=>{
    typingDone=true;
    maskot.classList.remove("typing");

    current.options.forEach(opt=>{
      const btn=document.createElement("button");
      btn.innerText=opt.label;
      btn.onclick=()=>pilih(opt);
      opsi.appendChild(btn);
    });
  });
}

// PILIH OPSI
function pilih(opt){
  if(!typingDone) return;

  const textEl = document.getElementById("maskotText");
  const maskot = document.getElementById("maskotImg");

  typingDone=false;
  maskot.classList.add("typing");

  typeText(opt.response, textEl, 40, ()=>{
    maskot.classList.remove("typing");

    showLoading(textEl);

    setTimeout(()=>{
      hideLoading();

      apersepsiStep++;

      if(apersepsiStep < apersepsiDialog.length){
        showStep();
      } else {
        localStorage.setItem("apersepsi_teks"+teksAktif,"done");

        showLoading(textEl);

        setTimeout(()=>{
          document.getElementById("apersepsiBox").style.display="none";
          document.getElementById("apersepsiOverlay").style.display="none";
          document.querySelector(".main-layout").classList.remove("blur");
        },10000);
      }

    },2000);
  });
}

// TYPE TEXT
function typeText(text, el, speed, cb){
  clearInterval(typeTimer);
  el.innerHTML="";
  let i=0;

  typeTimer=setInterval(()=>{
    el.innerHTML += text[i];
    i++;
    if(i>=text.length){
      clearInterval(typeTimer);
      if(cb) cb();
    }
  }, speed);
}

// LOADING
function showLoading(el){
  const span=document.createElement("span");
  span.id="loadingDots";
  span.innerText=" ...";
  el.appendChild(span);
}

function hideLoading(){
  const l=document.getElementById("loadingDots");
  if(l) l.remove();
}

// =======================
// RESULT BOX
// =======================
function selesaiSemua(){
  // sembunyikan header
  document.querySelector(".header-latihan").style.display = "none";

  let total = (skor.l1 + skor.l2 + skor.l3 + skor.l4) / 4;
  let persen = Math.round(total * 100);

  // =======================
  // KIRIM KE GOOGLE SHEET
  // =======================
 let latihan = "teks" + teksAktif;
let nama = localStorage.getItem("namaUser") || "Tanpa Nama";

console.log("CEK DATA:", {
  nama: nama,
  latihan: latihan,
  l1: skor.l1,
  l2: skor.l2,
  l3: skor.l3,
  l4: skor.l4,
  final: persen
});

kirimKeSheet({
  nama: nama,
  latihan: latihan,
  level1: Math.round(skor.l1 * 100),
  level2: Math.round(skor.l2 * 100),
  level3: Math.round(skor.l3 * 100),
  level4: Math.round(skor.l4 * 100),
  final: persen
});



  // =======================
  // TAMPILAN RESULT
  // =======================
  document.getElementById("soalLevel4").style.display = "none";

  const resultBox = document.querySelector(".result-box");
  resultBox.style.display = "flex";
  resultBox.classList.add("pop");

  const scores = [
    {id: "scoreL1", value: Math.round(skor.l1*100)},
    {id: "scoreL2", value: Math.round(skor.l2*100)},
    {id: "scoreL3", value: Math.round(skor.l3*100)},
    {id: "scoreL4", value: Math.round(skor.l4*100)}
  ];

  let i=0;
  function tampilScore(){
    if(i>=scores.length){
      document.getElementById("finalScore").innerText = persen + "%";
      triggerConfetti();
      return;
    }

    const el = document.getElementById(scores[i].id);
    let val = 0;

    const interval = setInterval(()=>{
      if(val>=scores[i].value){
        clearInterval(interval);
        i++;
        setTimeout(tampilScore, 300);
      } else {
        val++;
        el.innerText = val + "%";
      }
    }, 20);
  }

  tampilScore();

  const maskot = resultBox.querySelector(".character img");
  maskot.style.animation = "lompat 1.2s ease-in-out infinite";
}



function confetti(){
  const audio = new Audio('../audio/success.mp3');
  audio.play().catch(()=>{});

  for(let i=0;i<40;i++){
    let c=document.createElement("div");
    c.className="confetti";
    c.style.left=Math.random()*100+"vw";
    c.style.background=`hsl(${Math.random()*360},70%,60%)`;
    document.body.appendChild(c);
    setTimeout(()=>c.remove(),3000);
  }
}


// ini muncul sekali aja #############################
// document.addEventListener("DOMContentLoaded", () => {
//   const box = document.getElementById("apersepsiBox");
//   const sudahJawab = localStorage.getItem("apersepsi_teks"+teksAktif);

//   if(sudahJawab) {
//     if(box) box.style.display = "none";
//     document.body.style.overflow = "auto";
//   } else {
//     if(box) box.style.display = "block";
//     document.body.style.overflow = "hidden";
//   }
// });
// function jawabApersepsi(level){
//   localStorage.setItem("apersepsi_teks"+teksAktif, level);

//   const box = document.getElementById("apersepsiBox");
//   if(box) box.style.display = "none";

//   document.body.style.overflow = "auto";

//   const mainLayout = document.querySelector(".main-layout");
//   if(mainLayout){
//     mainLayout.scrollIntoView({ behavior: "smooth" });
//   }
// }

// =======================
// SIMPAN NAMA USER
// =======================
function simpanNama(){
  let nama = document.getElementById("namaUser").value;

  if(!nama){
    alert("Isi nama dulu");
    return;
  }

  localStorage.setItem("namaUser", nama);

  document.getElementById("inputNamaBox").style.display = "none";
}

// RESET USER
function resetNama(){
  localStorage.removeItem("namaUser");
  location.reload();
}


// =======================
// STORAGE JAWABAN
// =======================
function simpanJawaban(key, value){
  localStorage.setItem(key, value);
}
function ambilJawaban(key){
  return localStorage.getItem(key) || "";
}

// =======================
// LOAD DATA LATIHAN
// =======================
fetch("../json/latihan.json")
  .then(res => res.json())
  .then(data => {
    dataSoal = data;

    let teksData = dataSoal["teks"+teksAktif];

    document.getElementById("judulLatihan").innerText = "Latihan Kitabah";
    document.getElementById("judulTeks").innerText = teksData.judul || "Teks "+teksAktif;

    // TAMBAHAN DI SINI
    const maskot = document.getElementById("maskot");
if(maskot){
  maskot.src = `/img/maskot${teksAktif}.png`;
}

const maskotApersepsi = document.getElementById("maskotImg");
if(maskotApersepsi){
  maskotApersepsi.src = `/img/maskot${teksAktif}.png`;
}

    renderLevel(1);
  });


// =======================
function updateProgress(n){
  let persen = (n/4)*100;
  document.getElementById("progressBar").style.width = persen + "%";
}

// =======================
// NORMALIZE ARAB
// =======================
function normalizeArab(text){
  return text
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// =======================
// POPUP
// =======================
function showPopup(pesan){
  let popup = document.createElement("div");
  popup.className = "popup";

  popup.innerHTML = `
    <div class="popup-box">
      <p>${pesan}</p>
      <button onclick="this.closest('.popup').remove()">OK</button>
    </div>
  `;

  document.body.appendChild(popup);
}

// =======================
// ROUTER LEVEL
// =======================
function renderLevel(n){
  updateProgress(n);

  let teksData = dataSoal["teks"+teksAktif];
  if(!teksData) return;

  let levelData = teksData["level"+n];
  if(!levelData) return;

  document.querySelectorAll('.level').forEach(l => l.classList.remove('active'));
  document.getElementById('contentLevel'+n).classList.add('active');

  if(levelData.type === "pg") renderLevel1(levelData);
  if(levelData.type === "rumpang") renderLevel2(levelData);
  if(levelData.type === "susun") renderLevel3(levelData);
  if(levelData.type === "essay") renderLevel4(levelData);
}

// =======================
// LEVEL 1
// =======================
function renderLevel1(levelData){
  let container = document.getElementById("soalLevel1");
  container.innerHTML = "";

  container.innerHTML += `
    <p class="instruksi-ar arab">${levelData.instruksi_ar}</p>
    <p class="instruksi-id">${levelData.instruksi_id}</p>
  `;

  levelData.soal.forEach((s, i) => {
    let saved = ambilJawaban(`t${teksAktif}_l1_${i}`);

    let html = `<div class="soal-card">
      <div class="soal-header">
        <span>Soal ${i+1}</span>
        <span>Level 1</span>
      </div>

      <p class="arab"><b>${i+1}. ${s.pertanyaan}</b></p>`;

    s.opsi.forEach((o, idx) => {
      html += `
        <label class="opsi-item">
          <input type="radio" name="q${i}" value="${idx}"
          ${saved == idx ? "checked" : ""}
          onchange="simpanJawaban('t${teksAktif}_l1_${i}', ${idx}); tandaiPilihan(this);">
          <span>${o}</span>
        </label>
      `;
    });

    html += `</div>`;
    container.innerHTML += html;
  });

  container.innerHTML += `
    <button onclick="checkLevel1()">Cek</button>
    <button id="toLevel2" disabled onclick="nextLevel(2)">Lanjut</button>
  `;
}

function checkLevel1(){
  let soalList = dataSoal["teks"+teksAktif].level1.soal;
  let benar = 0;

  soalList.forEach((s, i) => {
    let pilih = ambilJawaban(`t${teksAktif}_l1_${i}`);
    if(parseInt(pilih) === s.jawaban) benar++;
  });

  skor.l1 = benar / soalList.length;
  showPopup(`Benar ${benar}/${soalList.length}`);

  if(skor.l1 >= 0.8){
    document.getElementById("toLevel2").disabled = false;
    unlockMenu(2);
  }
}

// =======================
// LEVEL 2
// =======================
function renderLevel2(levelData){
  let container = document.getElementById("soalLevel2");
  container.innerHTML = "";

  container.innerHTML += `
    <p class="instruksi-ar arab">${levelData.instruksi_ar}</p>
    <p class="instruksi-id">${levelData.instruksi_id}</p>
  `;
// ✅ TAMBAHAN INI (bank kata)
  if(levelData.bankKata){
    container.innerHTML += `
      <div class="bank-kata">
        ${levelData.bankKata.map(k => `<span>${k}</span>`).join("")}
      </div>
    `;
  }
  levelData.soal.forEach((s, i) => {
    container.innerHTML += `
      <p class="arab">${i+1}. ${s.kalimat}</p>
      <input type="text" class="arab-input"
        value="${ambilJawaban(`t${teksAktif}_l2_${i}`)}"
        oninput="simpanJawaban('t${teksAktif}_l2_${i}', this.value)">
    `;
  });

  container.innerHTML += `
    <button onclick="checkLevel2()">Cek</button>
    <button id="toLevel3" disabled onclick="nextLevel(3)">Lanjut</button>
  `;
}

function checkLevel2(){
  let soalList = dataSoal["teks"+teksAktif].level2.soal;
  let benar = 0;

  soalList.forEach((s,i)=>{
    let input = ambilJawaban(`t${teksAktif}_l2_${i}`);
    if(normalizeArab(input) === normalizeArab(s.jawaban)) benar++;
  });

  skor.l2 = benar / soalList.length;
  showPopup(`Benar ${benar}/${soalList.length}`);

  if(skor.l2 >= 0.8){
    document.getElementById("toLevel3").disabled = false;
    unlockMenu(3);
  }
}

// =======================
// LEVEL 3
// =======================
function renderLevel3(levelData){
  let container = document.getElementById("soalLevel3");
  container.innerHTML = "";

  container.innerHTML += `
    <p class="instruksi-ar arab">${levelData.instruksi_ar}</p>
    <p class="instruksi-id">${levelData.instruksi_id}</p>
  `;

  levelData.soal.forEach((s, i) => {
    container.innerHTML += `
      <div class="susun-box">
        <div class="kata-bank">
          ${s.kata.map(k => `<span onclick="pilihKata(this, ${i})">${k}</span>`).join("")}
        </div>

        <input type="text" id="susun_${i}" class="arab-input"
          value="${ambilJawaban(`t${teksAktif}_l3_${i}`)}"
          oninput="simpanJawaban('t${teksAktif}_l3_${i}', this.value)">
      </div>
    `;
  });

  container.innerHTML += `
    <button onclick="checkLevel3()">Cek</button>
    <button id="toLevel4" disabled onclick="nextLevel(4)">Lanjut</button>
  `;
}


function checkLevel3(){
  let soalList = dataSoal["teks"+teksAktif].level3.soal;
  let benar = 0;

  soalList.forEach((s,i)=>{
    let input =
      ambilJawaban(`t${teksAktif}_l3_${i}`) ||
      document.getElementById("susun_"+i).value;

    if(normalizeArab(input) === normalizeArab(s.jawaban)) benar++;
  });

  skor.l3 = benar / soalList.length;
  showPopup(`Benar ${benar}/${soalList.length}`);

  if(skor.l3 >= 0.8){
    document.getElementById("toLevel4").disabled = false;
    unlockMenu(4);
  }
}

// =======================
// LEVEL 4
// =======================
function renderLevel4(levelData){
  let container = document.getElementById("soalLevel4");
  container.innerHTML = "";

  let saved = ambilJawaban(`essay_teks${teksAktif}`);

  container.innerHTML = `
    <p class="instruksi-ar arab">${levelData.instruksi_ar}</p>
    <p class="instruksi-id">${levelData.instruksi_id}</p>

    <textarea id="essay" class="arab-input">${saved}</textarea>
    <p>Kata Arab: <span id="wordCount">0</span></p>

    <button onclick="checkLevel4()">Cek</button>
    <button id="finishBtn" disabled onclick="selesaiSemua()">Selesai</button>
  `;

  initEssay();
}

function initEssay(){
  let essay = document.getElementById("essay");
  let finishBtn = document.getElementById("finishBtn");

  function update(){
    let words = essay.value.match(/[\u0600-\u06FF]+/g) || [];
    document.getElementById("wordCount").innerText = words.length;

    localStorage.setItem(`essay_teks${teksAktif}`, essay.value);

    finishBtn.disabled = words.length < 20;
  }

  update();
  essay.addEventListener("input", update);
}

function checkLevel4() {
  let levelData = dataSoal["teks" + teksAktif].level4;
  let essayEl = document.getElementById("essay"); // contenteditable div
  let jawabanUser = essayEl.value.trim();

  // ===== Normalisasi teks user =====
  let userTextClean = jawabanUser
    .replace(/[\u064B-\u0652ـ]/g, "")      // hapus harakat & tanda panjang
    .replace(/[^\u0600-\u06FF\s]/g, " ")   // hapus non-Arab, ganti spasi
    .replace(/\s+/g, " ")                  // spasi tunggal
    .trim();

  // ambil semua kata Arab berurutan
  let words = userTextClean.match(/[\u0600-\u06FF]+/g) || [];

  if (words.length < 20) {
    showPopup("Minimal 20 kata Arab");
    return;
  }

  // ===== Fungsi ambil root kata =====
  function kataRoot(kata) {
    let k = kata.replace(/[\u064B-\u0652ـ]/g, "").trim();
    if (k.startsWith("ال")) k = k.slice(2);       // hapus alif lam
    k = k.replace(/[ونيناتة]$/g, "");            // hapus suffix umum
    return k;
  }

  // ===== Cek kecocokan kata (root match fleksibel) =====
  function cocokRoot(kata) {
    let root = kataRoot(kata);
    return words.some(w => kataRoot(w) === root);
  }

  function hitungKata(list) {
    return list.reduce((acc, k) => acc + (cocokRoot(k) ? 1 : 0), 0);
  }

  // ===== Hitung kata utama & bantu =====
  let utamaCount = hitungKata(levelData.kataUtama);
  let bantuCount = hitungKata(levelData.kataBantu);
  let totalCocok = utamaCount + bantuCount;

  // ===== Skor otomatis =====
  let hasil = "";
  if (utamaCount < 1) {
    hasil = "Kurang (kata inti belum ada)";
    skor.l4 = 0.3;
  } else if (totalCocok >= 5) {
    hasil = "Baik";
    skor.l4 = 1;
  } else if (totalCocok >= 3) {
    hasil = "Cukup";
    skor.l4 = 0.7;
  } else {
    hasil = "Kurang";
    skor.l4 = 0.4;
  }

 console.log("DEBUG:", { utamaCount, bantuCount, totalCocok, words });

showPopup(`Utama: ${utamaCount}, Total: ${totalCocok} → ${hasil}`);

const finishBtn = document.getElementById("finishBtn");

// aktifkan tombol setelah cek (apapun hasilnya)
finishBtn.disabled = false;

// ubah label sesuai kualitas jawaban
if(skor.l4 < 0.6){
  finishBtn.innerText = "Lanjut";
} else {
  finishBtn.innerText = "Selesai";
}

  // ===== Highlight kata cocok di layar =====
  let originalWords = jawabanUser.split(/(\s+)/); // simpan spasi asli
  let highlightedHTML = originalWords.map(w => {
    let wNorm = w.replace(/[\u064B-\u0652ـ]/g, "").replace(/[^\u0600-\u06FF]/g, "");
    for (let k of levelData.kataUtama) {
      if (kataRoot(wNorm) === kataRoot(k)) return `<span style="background:#FFD700">${w}</span>`;
    }
    for (let k of levelData.kataBantu) {
      if (kataRoot(wNorm) === kataRoot(k)) return `<span style="background:#90EE90">${w}</span>`;
    }
    return w;
  }).join("");

  
}



// konfeti
function triggerConfetti(){
  for(let i=0;i<50;i++){
    const c = document.createElement("div");
    c.className="confetti";
    c.style.left = Math.random()*100 + "vw";
    c.style.background = `hsl(${Math.random()*360}, 70%, 60%)`;
    c.style.animationDelay = (Math.random()*2)+"s";
    c.style.width = c.style.height = (5+Math.random()*5)+"px";
    document.body.appendChild(c);
    setTimeout(()=>c.remove(),4000);
  }
}

// =======================
// NAVIGASI
// =======================
let isAnimating = false;

function nextLevel(level) {
  if (isAnimating) return;

  const current = document.querySelector('.level.active');
  const next = document.getElementById('contentLevel' + level);

  if (!current || !next || current === next) return;

  isAnimating = true;

  current.classList.add('slide-out');

  setTimeout(() => {
    current.classList.remove('active', 'slide-out');

    next.classList.add('active', 'slide-in');

    renderLevel(level);

    document.querySelector('.soal-scroll')?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    setTimeout(() => {
      next.classList.remove('slide-in');
      isAnimating = false;
    }, 350);

  }, 250);
}

function unlockMenu(n){
  let el = document.getElementById("menuLevel"+n);
  if(!el) return;

  el.classList.remove("locked");
  el.classList.add("unlocked");
  el.onclick = () => renderLevel(n);
}

function tandaiPilihan(el){
  let parent = el.closest(".soal-card");
  parent.querySelectorAll(".opsi-item").forEach(l => l.classList.remove("selected"));
  el.closest(".opsi-item").classList.add("selected");
}

function bukaLatihan(nomor){
  window.location.href = "pages/latihan.html?teks=" + nomor;
}

function kirimKeSheet(data) {
  console.log("KIRIM FINAL:", data);

  fetch("https://script.google.com/macros/s/AKfycbzcRSdWOk6Eek2mwYwlx4FDJDwSIrwmn6sJ0UH_6yyYYTfZ-nUebcBR2s0Uelchcc5r/exec", {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(data)
  })
  .then(() => console.log("Terkirim (no-cors)"))
  .catch(err => console.error("Error:", err));
}



