

let dataSoal = {};
let dataSoalAktif = {}; // ✅ TAMBAHKAN INI



const params = new URLSearchParams(window.location.search);
const teksAktif = params.get("teks") || "1";
let level = 1; // default mulai dari level 1


fetch("../json/maharah.json")
  .then(res => res.json())
  .then(data => {
    console.log("DATA MASUK:", data);

    const teksData = data["teks" + teksAktif];

    document.getElementById("judulLatihan").innerText = "Uji Kemampuan";
    document.getElementById("judulTeks").innerText = teksData.judul || "";

    if (!teksData) {
      document.getElementById("quiz-container").innerHTML = "Data tidak ditemukan";
      return;
    }

    dataSoal = teksData;
    loadLevel(1);
  });


  
 function loadLevel(n) {
  level = n;
  
  document.getElementById("btn-selesai").disabled = false;
  document.getElementById("btn-next").style.display = "none";
  document.getElementById("hasil").innerHTML = "";

  if (!dataSoal || !dataSoal["level" + level]) {
    document.getElementById("quiz-container").innerHTML = "Level tidak ada";
    return;
  }

  if (level === 1) {
    dataSoalAktif = dataSoal.level1;
    renderLevel1();
  } else {
    dataSoalAktif = dataSoal["level" + level];
    renderLevelText();
  }
  renderLevelList();
  updateProgress();
}

function renderLevel1() {
  document.getElementById("judul").innerText = dataSoalAktif.judul;

document.getElementById("level-info").innerText = 
  "Level " + level + " / " + getTotalLevel()
  

  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  dataSoalAktif.sections.forEach((section, sIndex) => {
    container.innerHTML += `
      <div class="section">
        <h3>${section.judul}</h3>
        <p>${section.instruksi}</p>
      </div>
    `;

    section.soal.forEach((item, index) => {
      container.innerHTML += `
        <div class="soal">
          <label>${angkaArab(index + 1)}. ${item.label}</label>
          <input type="text" id="jawaban-${sIndex}-${item.id}">
        </div>
      `;
    });
  });
}

// RENDER LEVEL 2-4
function renderLevelText() {
  document.getElementById("judul").innerText = dataSoalAktif.judul;

document.getElementById("level-info").innerText = 
  "Level " + level + " / " + getTotalLevel()
  

  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  dataSoalAktif.sections.forEach((section, sIndex) => {
    container.innerHTML += `
      <div class="section">
        <h3>${section.judul}</h3>
        <p>${section.instruksi}</p>
      </div>
    `;

    section.soal.forEach((item, index) => {
      container.innerHTML += `
        <div class="soal">
         <label>${angkaArab(index + 1)}. ${item.pertanyaan || item.label || ""}</label>
         <textarea 
  id="jawaban-${sIndex}-${item.id}" 
  placeholder="${item.pertanyaan || 'Tulis jawaban di sini...'}"
></textarea>
        </div>
      `;
    });
  });
}


function angkaArab(angka) {
  const arab = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
  return angka.toString().split("").map(d => arab[d]).join("");
}

function normalisasi(teks) {
  return teks
    .toLowerCase()
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/\s+/g, " ")
    .trim();
}

function cekJawaban(userInput, kunciList) {
  let user = normalisasi(userInput);

  return kunciList.some(kunci => {
    return normalisasi(kunci) === user;
  });
}


function submitLevel1() {
  let skor = 0;
  let hasilHTML = "";
  let nomor = 1;

  dataSoalAktif.sections.forEach((section, sIndex) => {
    section.soal.forEach(item => {

      let inputEl = document.getElementById(`jawaban-${sIndex}-${item.id}`);
      let input = inputEl.value;

      if (!input.trim()) {
        inputEl.style.border = "2px solid red";
        hasilHTML += `<p class="salah">
          ${angkaArab(nomor)}. فارغ
        </p>`;
        nomor++;
        return;
      }

      let benar = cekJawaban(input, item.jawaban);

      if (benar) {
        skor++;
        inputEl.style.border = "2px solid green";
        hasilHTML += `<p class="benar">
          ${angkaArab(nomor)}. صحيح
        </p>`;
      } else {
        inputEl.style.border = "2px solid red";
        hasilHTML += `<p class="salah">
          ${angkaArab(nomor)}. خطأ
        </p>`;
      }

      nomor++;
    });
  });

  let total = dataSoalAktif.sections.reduce(
    (t, s) => t + s.soal.length, 0
  );

  let nilai = Math.round((skor / total) * 100);

  document.getElementById("hasil").innerHTML = `
  <h3>النتيجة: ${nilai}</h3>
  ${hasilHTML}
`;
// scroll ke hasil
document.getElementById("hasil").scrollIntoView({ behavior: "smooth" });

// tombol next
document.getElementById("btn-next").style.display = "inline-block";


}



// SUBMIT AI LEVEL 2-4
async function submitAI() {
  let semuaJawaban = [];

  dataSoalAktif.sections.forEach((section, sIndex) => {
    section.soal.forEach(item => {
      let input = document.getElementById(`jawaban-${sIndex}-${item.id}`).value;

      semuaJawaban.push({
        pertanyaan: item.pertanyaan || "",
        jawaban: input
      });
    });
  });

  document.getElementById("hasil").innerHTML = `
    <p style="text-align:center; margin-top:20px;">
      Memproses jawaban...
    </p>
  `;

  try {
  let response = await fetch("https://script.google.com/macros/s/AKfycbzkGmydpzyghYQy4w5w53A8cHQ-qX1AOa6mebyvloKxJeRWX5y8Qv96nNBabAK-F8ft/exec", {
    method: "POST",
    body: JSON.stringify({
      tipe: "ai",
      jawaban: semuaJawaban
    })
  });

  let text = await response.text();
  let hasil = JSON.parse(text);

  tampilkanHasilAI(hasil);
  document.getElementById("btn-next").style.display = "inline-block";

} catch (err) {
  console.error(err);
  document.getElementById("hasil").innerHTML = "Gagal terhubung ke server";
}
}

function tampilkanHasilAI(data) {
  let html = "";

  data.forEach((item, i) => {

    let feedback = item.feedback;

    // kalau feedback bukan teks
    if (typeof feedback !== "string") {
      feedback = JSON.stringify(feedback);
    }

    html += `
      <div class="soal">
        <p>${angkaArab(i+1)}. ${feedback}</p>
        <p>الدرجة: ${item.skor}</p>
      </div>
    `;
  });

  document.getElementById("hasil").innerHTML = html;
}


document.addEventListener("DOMContentLoaded", () => {

  // ✅ LOAD NAVBAR
  fetch("./navbar.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("navbar").innerHTML = data;
    });

  const btnSelesai = document.getElementById("btn-selesai");
  const btnNext = document.getElementById("btn-next");

  btnNext.style.display = "none";

  btnSelesai.addEventListener("click", () => {
    btnSelesai.disabled = true;

    if (level === 1) {
      submitLevel1();
    } else {
      submitAI();
    }
  });

  btnNext.addEventListener("click", () => {
    const current = parseInt(level);
    const next = current + 1;

    if (next <= getTotalLevel()) {
      loadLevel(next);
    }
  });

  mulaiApersepsi();

});



document.addEventListener("input", function(e) {
  if (e.target.tagName.toLowerCase() === "textarea") {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  }
});

// PROGRESS BAR
function updateProgress() {
  const totalLevel = getTotalLevel();
  const persen = (level / totalLevel) * 100;

  document.getElementById("progress-fill").style.width = persen + "%";

  document.getElementById("progress-text").innerText =
    "Level " + level + " dari " + totalLevel;

  const levels = document.querySelectorAll(".level");

  levels.forEach((el, index) => {
    el.classList.remove("active");

    if (index + 1 === level) {
      el.classList.add("active");
    }
  });
}

// ✅ TARUH DI SINI (bebas asal sebelum dipakai)
function getTotalLevel() {
  return Object.keys(dataSoal)
    .filter(key => key.startsWith("level"))
    .length;
}



function renderLevelList() {
  const container = document.getElementById("level-list");
  container.innerHTML = "";

  const total = getTotalLevel();

  for (let i = 1; i <= total; i++) {
    container.innerHTML += `
      <div class="level ${i === level ? "active" : ""}">
        Level ${i}
      </div>
    `;
  }
}

function mulaiApersepsi() {
  const overlay = document.getElementById("apersepsiOverlay");
  const box = document.getElementById("apersepsiBox");
  const text = document.getElementById("maskotText");
  const opsi = document.getElementById("apersepsiOpsi");

  overlay.style.display = "block";
  box.style.display = "flex";

  text.innerText = "Apakah kamu siap memulai latihan?";
  
  opsi.innerHTML = `
    <button onclick="jawabApersepsi(true)">Siap</button>
    <button onclick="jawabApersepsi(false)">Belum</button>
  `;
}

function jawabApersepsi(jawaban) {
  const overlay = document.getElementById("apersepsiOverlay");
  const box = document.getElementById("apersepsiBox");
  const text = document.getElementById("maskotText");
  const opsi = document.getElementById("apersepsiOpsi");

  if (jawaban) {
    text.innerText = "Bagus. Kita mulai sekarang.";
    opsi.innerHTML = `<button onclick="tutupApersepsi()">Mulai</button>`;
  } else {
    text.innerText = "Silakan siapkan diri dulu. Klik mulai kalau sudah siap.";
    opsi.innerHTML = `<button onclick="tutupApersepsi()">Mulai</button>`;
  }
}

function tutupApersepsi() {
  document.getElementById("apersepsiOverlay").style.display = "none";
  document.getElementById("apersepsiBox").style.display = "none";
}
