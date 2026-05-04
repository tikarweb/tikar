/* =====================
   AMBIL ID DARI URL
===================== */
const params     = new URLSearchParams(window.location.search);
const id         = params.get("id");
const groupAktif = "teks" + id;

/* =====================
   HELPERS
===================== */
function isMobile() { return window.innerWidth <= 768; }

/* Global functions dipanggil dari navbar.html via onclick */
window.toggleMobileNav = function () {
  const hamburger = document.getElementById('ta-hamburger');
  const drawer    = document.getElementById('ta-mobile-drawer');
  if (!hamburger || !drawer) return;
  const isOpen = drawer.classList.contains('open');
  hamburger.classList.toggle('open', !isOpen);
  drawer.classList.toggle('open', !isOpen);
};

window.startOnboarding = function () {
  if (typeof startOnboardingTeks === 'function') startOnboardingTeks();
};

/* =====================
   BERSIHKAN KATA
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
let dataKosa   = [];
let kamus      = {};
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
      if (!kamus[key]) kamus[key] = [];
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
    const container   = document.getElementById("containerTeks");
    const teksDipilih = data.teks.find(item => item.id == id);

    if (!teksDipilih) {
      container.innerHTML = "<p style='text-align:center;color:#9c7e5e;padding:40px;'>Teks tidak ditemukan.</p>";
      return;
    }

    let html = `<h2 class="judul-arab arabicText">${teksDipilih.judul}</h2>`;
    teksDipilih.paragraf.forEach(p => {
      const wrapped = p.split(" ").map(w =>
        `<span class="word" data-kata="${w}">${w}</span>`
      ).join(" ");
      html += `<p class="arabicText">${wrapped}</p>`;
    });
    container.innerHTML = html;

    setTimeout(() => {
      if (!localStorage.getItem("onboarding_teks_done")) {
        startOnboardingTeks();
        localStorage.setItem("onboarding_teks_done", "true");
      }
    }, 900);
  })
  .catch(err => {
    document.getElementById("containerTeks").innerHTML =
      "<p style='text-align:center;color:#c05e2e;padding:40px;'>Gagal memuat teks.</p>";
    console.log("ERROR TEKS:", err);
  });

/* =====================
   TUTUP POPUP
===================== */
function tutupPopup() {
  const popup    = document.getElementById("popup");
  const backdrop = document.getElementById("popupBackdrop");
  if (popup)    popup.classList.remove("active");
  if (backdrop) backdrop.classList.remove("active");
  if (activeWord) {
    activeWord.classList.remove("active-word");
    activeWord = null;
  }
}

/* =====================
   TAMPILKAN POPUP
===================== */
function tampilkanPopup(kata, kataBersih) {
  const popup      = document.getElementById("popup");
  const backdrop   = document.getElementById("popupBackdrop");
  const elKata     = document.getElementById("kataArab");
  const elArti     = document.getElementById("arti");
  const elPenjelas = document.getElementById("penjelasan");

  const semuaHasil = kamus[kataBersih] || [];

  if (semuaHasil.length === 0) {
    elKata.innerText     = kata;
    elArti.innerText     = "Tidak ditemukan";
    elPenjelas.innerText = "—";
  } else {
    const hasil = semuaHasil.sort((a, b) => b.kataarab.length - a.kataarab.length)[0];
    elKata.innerText     = hasil.kataarab;
    elArti.innerText     = hasil.arti       || "—";
    elPenjelas.innerText = hasil.penjelasan || "—";
  }

  /* Reset animasi konten kalau popup sudah aktif (ganti kata) */
  const content = document.getElementById("popupContent");
  if (content && popup.classList.contains("active")) {
    content.style.animation = "none";
    void content.offsetHeight;
    content.style.animation = "";
  }

  popup.classList.add("active");

  if (backdrop && isMobile()) backdrop.classList.add("active");
}

/* =====================
   EVENT KLIK
===================== */
document.addEventListener("click", function (e) {

  /* Klik kata */
  if (e.target.classList.contains("word")) {
    e.stopPropagation();
    if (activeWord === e.target) { tutupPopup(); return; }
    if (activeWord) activeWord.classList.remove("active-word");
    activeWord = e.target;
    activeWord.classList.add("active-word");
    tampilkanPopup(e.target.dataset.kata, bersihkanKata(e.target.dataset.kata));
    return;
  }

  /* Tombol close */
  if (e.target.id === "popupClose" || e.target.closest?.("#popupClose")) {
    e.stopPropagation();
    tutupPopup();
    return;
  }

  /* Klik backdrop (mobile) */
  if (e.target.id === "popupBackdrop") { tutupPopup(); return; }

  /* Klik di luar popup — desktop */
  const popup = document.getElementById("popup");
  if (!isMobile() && popup && !popup.contains(e.target)) tutupPopup();
});

/* =====================
   SWIPE DOWN (mobile)
===================== */
(function () {
  let startY = 0;
  document.addEventListener("touchstart", e => {
    const p = document.getElementById("popup");
    if (p?.contains(e.target)) startY = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener("touchend", e => {
    const p = document.getElementById("popup");
    if (!p?.classList.contains("active")) return;
    if (e.changedTouches[0].clientY - startY > 60) tutupPopup();
  }, { passive: true });
})();

/* =====================
   ONBOARDING
===================== */
function startOnboardingTeks() {
  if (!window.driver) return;
  const steps = [
    { element: ".text-area",      popover: { title: "📖 Ini teks bacaan",  description: "Baca teks Arab di sini. Setiap kata bisa diklik!", side: "bottom" } },
    { element: ".text-area .word", popover: { title: "👆 Klik kata Arab",   description: "Klik salah satu kata untuk melihat arti dan penjelasannya.", side: "bottom" } },
    { element: "#popup",           popover: { title: "✨ Arti muncul di sini", description: "Arti dan penjelasan kata akan tampil di panel ini.", side: "left" } }
  ];
  const validSteps = steps.filter(s => document.querySelector(s.element));
  if (!validSteps.length) return;

  const driverObj = window.driver.driver({
    showProgress: true, showButtons: true, allowClose: true,
    nextBtnText: "Lanjut →", prevBtnText: "← Kembali", doneBtnText: "Oke, Mengerti!",
    steps: validSteps
  });
  driverObj.onPopoverRender = (popover) => {
    const btn = document.createElement("button");
    btn.innerText = "Lewati"; btn.className = "driver-popover-skip-btn";
    btn.onclick = () => driverObj.destroy();
    const nav = popover.footer?.querySelector(".driver-popover-navigation-btns");
    if (nav) nav.prepend(btn); else popover.footer?.appendChild(btn);
  };
  driverObj.drive();
}