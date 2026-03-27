// =======================
// GLOBAL
// =======================
let dataSoal;
let teksAktif = 1;

const params = new URLSearchParams(window.location.search);
const teksDariURL = params.get("teks");

if(teksDariURL){
  teksAktif = parseInt(teksDariURL);
}

let skor = { l1:0, l2:0, l3:0, l4:0 };

// =======================
// STORAGE
// =======================
function simpanJawaban(key, value){
  localStorage.setItem(key, value);
}

function ambilJawaban(key){
  return localStorage.getItem(key) || "";
}

// =======================
// LOAD DATA
// =======================
fetch("../jsonibacaan/soal.json")
.then(res => res.json())
.then(data => {
  dataSoal = data;

  let teksData = dataSoal["teks"+teksAktif];

  document.getElementById("judulLatihan").innerText = "Latihan Kitabah";
  document.getElementById("judulTeks").innerText = teksData.judul || "Teks "+teksAktif;

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
// ROUTER
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
      <p class="arab">${i+1}. ${s.kata.join(" ")}</p>
      <input type="text" class="arab-input"
        value="${ambilJawaban(`t${teksAktif}_l3_${i}`)}"
        oninput="simpanJawaban('t${teksAktif}_l3_${i}', this.value)">
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
    let input = ambilJawaban(`t${teksAktif}_l3_${i}`);
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
// LEVEL 4 (FIX TOTAL)
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

function checkLevel4(){
  let words = document.getElementById("essay").value.match(/[\u0600-\u06FF]+/g) || [];

  if(words.length < 20){
    showPopup("Minimal 20 kata Arab");
    return;
  }

  skor.l4 = 1;
  showPopup("Valid");
}

function selesaiSemua(){
  let total = (skor.l1 + skor.l2 + skor.l3 + skor.l4) / 4;
  document.getElementById("soalLevel4").innerHTML = `
    <h3>Selesai</h3>
    <h1>${Math.round(total*100)}%</h1>
  `;
}

// =======================
function nextLevel(level){
  const next = document.getElementById("contentLevel" + level);

  // render dulu (WAJIB)
  renderLevel(level);

  // kasih animasi masuk
  next.classList.add("slide-in");

  // hapus class setelah animasi selesai
  setTimeout(() => {
    next.classList.remove("slide-in");
  }, 300);
}

// =======================
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
window.location.href = "html/latihan1.html?teks=" + nomor;
}
// soal end


// ini PESAN EMAIL
function kirimPesan(e){
  e.preventDefault();

  let nama = document.getElementById("name").value;
  let email = document.getElementById("email").value;
  let pesan = document.getElementById("pesan").value;

  if(nama === "" || email === "" || pesan === ""){
    alert("Isi semua field dulu");
    return;
  }

  alert("Pesan berhasil dikirim");

  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("pesan").value = "";
}



// INI KAMUS BIARIN

document.addEventListener("DOMContentLoaded", function(){
let kamus = {}
let fileData = ""

if(window.location.pathname.includes("teks1")){ fileData = "data1.json" }
if(window.location.pathname.includes("teks2")){ fileData = "data2.json" }
if(window.location.pathname.includes("teks3")){ fileData = "data3.json" }
if(window.location.pathname.includes("teks4")){ fileData = "data4.json" }

if(window.location.pathname.includes("teks5.html")){
fileData = "../jsonibacaan/data5.json"
}

if(window.location.pathname.includes("teks6.html")){
fileData = "../jsonibacaan/data6.json"
}

if(window.location.pathname.includes("teks7.html")){
fileData = "../jsonibacaan/data7.json"
}

if(window.location.pathname.includes("teks8.html")){
fileData = "../jsonibacaan/data8.json"
}
if(window.location.pathname.includes("teks9.html")){
fileData = "../jsonibacaan/data9.json"
}
if(window.location.pathname.includes("teks10.html")){
fileData = "../jsonibacaan/data10.json"
}
if(window.location.pathname.includes("teks11.html")){
fileData = "../jsonibacaan/data11.json"
}
if(window.location.pathname.includes("teks12.html")){
fileData = "../jsonibacaan/data12.json"
}

let popup = document.getElementById("popup")
let kataArab = document.getElementById("kataArab")
let arti = document.getElementById("arti")
let penjelasan = document.getElementById("penjelasan")

if(fileData !== ""){

fetch(fileData)
.then(res => res.json())
.then(data =>{

data.forEach(item => {

kamus[item.kataarab] = {
arti: item.arti,
penjelasan: item.penjelasan
}

})

initText()

})

}

function initText(){

let texts = document.querySelectorAll(".arabicText")

texts.forEach(function(text){

let words = text.innerText.trim().split(" ")

text.innerHTML = ""

words.forEach(function(word){

let cleanWord = word.replace(/[،.():]/g,"")

let span = document.createElement("span")

span.classList.add("word")

span.innerText = word + " "

span.onclick = function(e){

e.stopPropagation()

let next = span.nextElementSibling ? span.nextElementSibling.innerText.trim() : ""
let next2 = span.nextElementSibling && span.nextElementSibling.nextElementSibling
? span.nextElementSibling.nextElementSibling.innerText.trim() : ""

let kata1 = cleanWord
let kata2 = (cleanWord + " " + next).trim()
let kata3 = (cleanWord + " " + next + " " + next2).trim()

if(kamus[kata3]){

kataArab.innerText = kata3
arti.innerText = kamus[kata3].arti
penjelasan.innerText = kamus[kata3].penjelasan

}

else if(kamus[kata2]){

kataArab.innerText = kata2
arti.innerText = kamus[kata2].arti
penjelasan.innerText = kamus[kata2].penjelasan

}

else if(kamus[kata1]){

kataArab.innerText = kata1
arti.innerText = kamus[kata1].arti
penjelasan.innerText = kamus[kata1].penjelasan

}

else{

kataArab.innerText = kata1
arti.innerText = "arti belum tersedia"
penjelasan.innerText = ""

}

if(popup){
  popup.style.display = "block"
}

}
text.appendChild(span)

})

})

}

document.addEventListener("click", function(){
  if(popup){
    popup.style.display = "none"
  }
})

})