// =====================
// AMBIL ID DARI URL
// =====================
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const groupAktif = "teks" + id;


// =====================
// FUNCTION BERSIHKAN KATA
// =====================
function bersihkanKata(teks) {
  if (typeof teks !== "string") return "";

  return teks
    .normalize("NFKD") // 🔥 INI KUNCI UTAMA
    .replace(/[.,،؛:!?()"'“”]/g, "")
    .replace(/ـ/g, "")
    .replace(/\u200B/g, "")
    .replace(/\s+/g, " ")
    .trim();
}


// =====================
// VAR GLOBAL
// =====================
let dataKosa = [];
let kamus = {}; // 🔥 tambahan untuk percepatan


// =====================
// FETCH KOSAKATA + FILTER GROUP + BUAT KAMUS
// =====================
fetch("../json/judul1.json")
  .then(res => res.json())
  .then(data => {

    dataKosa = data.filter(item => item.group === groupAktif);

    console.log("Group aktif:", groupAktif);
    console.log("Jumlah kosa:", dataKosa.length);

    // 🔥 bikin kamus (biar ga filter tiap klik)
    dataKosa.forEach(item => {
      const key = bersihkanKata(item.kataarab);

      if (!kamus[key]) {
        kamus[key] = [];
      }

      kamus[key].push(item);
    });

  })
  .catch(err => console.log("ERROR KOSAKATA:", err));


// =====================
// FETCH TEKS
// =====================
fetch("../json/teks.json")
  .then(res => res.json())
  .then(data => {

    const container = document.getElementById("containerTeks");

    const teksDipilih = data.teks.find(item => item.id == id);

    if (!teksDipilih) {
      container.innerHTML = "<p>Teks tidak ditemukan</p>";
      return;
    }

    let html = `
      <section class="bacaan-item mb-5">
        <h2 class="judul-arab arabicText">${teksDipilih.judul}</h2>
    `;

    teksDipilih.paragraf.forEach(p => {

      const words = p.split(" ");

      const wrapped = words.map(w => {
        return `<span class="word" data-kata="${w}">${w}</span>`;
      }).join(" ");

      html += `<p class="arabicText">${wrapped}</p>`;
    });

    html += `</section>`;

    container.innerHTML = html;

  });


// =====================
// EVENT KLIK KATA
// =====================
document.addEventListener("click", function(e) {

  if (e.target.classList.contains("word")) {

    let kata = e.target.dataset.kata;
    let kataBersih = bersihkanKata(kata);

    // DEBUG
    console.log("kata klik:", kataBersih);

    // 🔥 ambil dari kamus (cepat)
    let semuaHasil = kamus[kataBersih] || [];

    console.log("data cocok:", semuaHasil);

    // fallback kalau tidak ada
    if (semuaHasil.length === 0) {
      document.getElementById("kataArab").innerText = kata;
      document.getElementById("arti").innerText = "Tidak ditemukan";
      document.getElementById("penjelasan").innerText = "-";
      document.getElementById("popup").classList.add("active");
      return;
    }

    // ambil yang paling panjang (biar frasa menang)
    let hasil = semuaHasil.sort((a, b) =>
      b.kataarab.length - a.kataarab.length
    )[0];

    document.getElementById("kataArab").innerText = hasil.kataarab;
    document.getElementById("arti").innerText = hasil.arti || "-";
    document.getElementById("penjelasan").innerText = hasil.penjelasan || "-";

    document.getElementById("popup").classList.add("active");
  }

});


// =====================
// TUTUP POPUP
// =====================
document.addEventListener("click", function(e) {

  const popup = document.getElementById("popup");

  if (
    !e.target.classList.contains("word") &&
    !popup.contains(e.target)
  ) {
    popup.classList.remove("active");
  }

});