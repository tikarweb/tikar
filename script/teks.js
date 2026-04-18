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
    .replace(/[.,،؛:!?()"'“”]/g, "")
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

    /* =====================
       ONBOARDING TRIGGER
    ===================== */
    setTimeout(() => {
      console.log("trigger onboarding");

      if (!localStorage.getItem("onboarding_teks_done")) {
        startOnboardingTeks();
        localStorage.setItem("onboarding_teks_done", "true");
      }

    }, 800);

  });


/* =====================
   ONBOARDING FUNCTION
===================== */
function startOnboardingTeks() {
  console.log("onboarding jalan");

  if (!window.driver) {
    console.log("❌ driver tidak ter-load");
    return;
  }

  const steps = [
    {
      element: ".text-area",
      popover: {
        title: "Ini teks bacaan",
        description: "Baca teks Arab di bagian ini.",
        side: "bottom"
      }
    },
    {
      element: ".text-area span",
      popover: {
        title: "Klik kata Arab",
        description: "Klik salah satu kata untuk melihat arti.",
        side: "bottom"
      }
    },
    {
      element: "#popup",
      popover: {
        title: "Arti muncul di sini",
        description: "Hasil klik akan tampil di sini.",
        side: "left"
      }
    }
  ];

  /* =====================
     VALIDASI STEP
  ===================== */
  const validSteps = steps.filter(step => document.querySelector(step.element));

  console.log("validSteps:", validSteps);

  if (validSteps.length === 0) {
    console.log("❌ step tidak ditemukan");
    return;
  }

  /* =====================
     INIT DRIVER
  ===================== */
  const driverObj = window.driver.driver({
    showProgress: true,
    showButtons: true,
    allowClose: true,

    nextBtnText: "Lanjut",
    prevBtnText: "Kembali",
    doneBtnText: "Selesai",

    steps: validSteps
  });

  /* =====================
     CUSTOM BUTTON LEWATI
  ===================== */
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
    console.log("onboarding selesai / skip");
  };

  driverObj.drive();
}


/* =====================
   TRIGGER ONBOARDING
===================== */
setTimeout(() => {
  console.log("trigger onboarding");

  // 🔥 MODE TESTING (SELALU MUNCUL)
  startOnboardingTeks();

  /*
  // 🔥 MODE NORMAL (AKTIFKAN NANTI)
  if (!localStorage.getItem("onboarding_teks_done")) {
    startOnboardingTeks();
    localStorage.setItem("onboarding_teks_done", "true");
  }
  */

}, 1200);







/* =====================
   EVENT KLIK KATA
===================== */
document.addEventListener("click", function(e) {

  if (e.target.classList.contains("word")) {

    let kata = e.target.dataset.kata;
    let kataBersih = bersihkanKata(kata);

    let semuaHasil = kamus[kataBersih] || [];

    if (semuaHasil.length === 0) {
      document.getElementById("kataArab").innerText = kata;
      document.getElementById("arti").innerText = "Tidak ditemukan";
      document.getElementById("penjelasan").innerText = "-";
      document.getElementById("popup").classList.add("active");
      return;
    }

    let hasil = semuaHasil.sort((a, b) =>
      b.kataarab.length - a.kataarab.length
    )[0];

    document.getElementById("kataArab").innerText = hasil.kataarab;
    document.getElementById("arti").innerText = hasil.arti || "-";
    document.getElementById("penjelasan").innerText = hasil.penjelasan || "-";

    document.getElementById("popup").classList.add("active");
  }

});


/* =====================
   TUTUP POPUP
===================== */
document.addEventListener("click", function(e) {

  const popup = document.getElementById("popup");

  if (
    !e.target.classList.contains("word") &&
    !popup.contains(e.target)
  ) {
    popup.classList.remove("active");
  }

});
