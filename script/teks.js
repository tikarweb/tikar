/* =====================
   AMBIL ID DARI URL
===================== */
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const groupAktif = "teks" + id;


/* =====================
   FUNCTION BERSIHKAN KATA
===================== */
function bersihkanKata(teks) {
  if (typeof teks !== "string") return "";

  return teks
    .normalize("NFKD")
    .replace(/[.,،؛:!?()"'""]/g, "")
    .replace(/ـ/g, "")
    .replace(/\u200B/g, "")
    .replace(/\s+/g, " ")
    .trim();
}


/* =====================
   VAR GLOBAL
===================== */
let dataKosa = [];
let kamus = {};
let activeWord = null;


/* =====================
   FETCH KOSAKATA
===================== */
fetch("../json/judul1.json")
  .then(res => res.json())
  .then(data => {

    dataKosa = data.filter(item => item.group === groupAktif);

    dataKosa.forEach(item => {
      const key = bersihkanKata(item.kataarab);

      if (!kamus[key]) {
        kamus[key] = [];
      }

      kamus[key].push(item);
    });

  })
  .catch(err => console.log("ERROR KOSAKATA:", err));


/* =====================
   FETCH TEKS
===================== */
fetch("../json/teks.json")
  .then(res => res.json())
  .then(data => {

    const container = document.getElementById("containerTeks");

    const teksDipilih = data.teks.find(item => item.id == id);

    if (!teksDipilih) {
      container.innerHTML = "<p style='text-align:center; color: #9c7e5e; padding: 40px;'>Teks tidak ditemukan.</p>";
      return;
    }

    let html = `
      <h2 class="judul-arab arabicText">${teksDipilih.judul}</h2>
    `;

    teksDipilih.paragraf.forEach(p => {

      const words = p.split(" ");

      const wrapped = words.map(w => {
        return `<span class="word" data-kata="${w}">${w}</span>`;
      }).join(" ");

      html += `<p class="arabicText">${wrapped}</p>`;
    });

    container.innerHTML = html;

    /* =====================
       ONBOARDING TRIGGER
    ===================== */
    setTimeout(() => {
      if (!localStorage.getItem("onboarding_teks_done")) {
        startOnboardingTeks();
        localStorage.setItem("onboarding_teks_done", "true");
      }
    }, 900);

  })
  .catch(err => {
    document.getElementById("containerTeks").innerHTML =
      "<p style='text-align:center; color: #c05e2e; padding: 40px;'>Gagal memuat teks.</p>";
    console.log("ERROR TEKS:", err);
  });


/* =====================
   TAMPILKAN POPUP
===================== */
function tampilkanPopup(kata, kataBersih) {
  const popup      = document.getElementById("popup");
  const elKata     = document.getElementById("kataArab");
  const elArti     = document.getElementById("arti");
  const elPenjelas = document.getElementById("penjelasan");

  let semuaHasil = kamus[kataBersih] || [];

  elKata.innerText = kata;

  if (semuaHasil.length === 0) {
    elArti.innerText     = "Tidak ditemukan";
    elPenjelas.innerText = "—";
  } else {
    const hasil = semuaHasil.sort((a, b) =>
      b.kataarab.length - a.kataarab.length
    )[0];

    elKata.innerText     = hasil.kataarab;
    elArti.innerText     = hasil.arti     || "—";
    elPenjelas.innerText = hasil.penjelasan || "—";
  }

  popup.classList.add("active");
}


/* =====================
   EVENT KLIK KATA
===================== */
document.addEventListener("click", function(e) {

  if (e.target.classList.contains("word")) {

    /* highlight kata aktif */
    if (activeWord) activeWord.classList.remove("active-word");
    activeWord = e.target;
    activeWord.classList.add("active-word");

    const kata      = e.target.dataset.kata;
    const kataBersih = bersihkanKata(kata);

    tampilkanPopup(kata, kataBersih);

    e.stopPropagation();
    return;
  }

  /* tutup popup jika klik di luar */
  const popup = document.getElementById("popup");
  if (!popup.contains(e.target)) {
    popup.classList.remove("active");
    if (activeWord) {
      activeWord.classList.remove("active-word");
      activeWord = null;
    }
  }

});


/* =====================
   ONBOARDING FUNCTION
===================== */
function startOnboardingTeks() {
  if (!window.driver) {
    console.log("driver.js tidak ter-load");
    return;
  }

  const steps = [
    {
      element: ".text-area",
      popover: {
        title: "📖 Ini teks bacaan",
        description: "Baca teks Arab di sini. Setiap kata bisa diklik!",
        side: "bottom"
      }
    },
    {
      element: ".text-area .word",
      popover: {
        title: "👆 Klik kata Arab",
        description: "Klik salah satu kata untuk melihat arti dan penjelasannya.",
        side: "bottom"
      }
    },
    {
      element: "#popup",
      popover: {
        title: "✨ Arti muncul di sini",
        description: "Arti dan penjelasan kata akan tampil di panel ini.",
        side: "left"
      }
    }
  ];

  const validSteps = steps.filter(step => document.querySelector(step.element));

  if (validSteps.length === 0) return;

  const driverObj = window.driver.driver({
    showProgress: true,
    showButtons: true,
    allowClose: true,
    nextBtnText: "Lanjut →",
    prevBtnText: "← Kembali",
    doneBtnText: "Oke, Mengerti!",
    steps: validSteps
  });

  /* Tombol Lewati */
  driverObj.onPopoverRender = (popover) => {
    const skipBtn = document.createElement("button");
    skipBtn.innerText = "Lewati";
    skipBtn.className = "driver-popover-skip-btn";
    skipBtn.onclick = () => driverObj.destroy();

    const footer = popover.footer;
    if (!footer) return;

    const nav = footer.querySelector(".driver-popover-navigation-btns");
    if (nav) {
      nav.prepend(skipBtn);
    } else {
      footer.appendChild(skipBtn);
    }
  };

  driverObj.onDestroyed = () => {
    console.log("onboarding selesai");
  };

  driverObj.drive();
}