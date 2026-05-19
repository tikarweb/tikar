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
    .replace(/[.,،؛:!?()"'""\u200B]/g, "")
    .replace(/ـ/g, "")
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
   ATUR POSISI POPUP
   - Mobile  : pindah ke body (agar tidak terjebak di .col-lg-5 yg display:none)
   - Desktop : kembalikan ke dalam .sidebar-fixed
   Dipanggil saat DOMContentLoaded DAN saat resize
===================== */
const popupOriginalParent = null; // diisi saat DOM ready

function aturPosisiPopup() {
  const popup    = document.getElementById('popup');
  const backdrop = document.getElementById('popupBackdrop');
  const sidebar  = document.getElementById('sidebarFixed');
  if (!popup || !sidebar) return;

  if (isMobile()) {
    /* Pindah ke body jika belum */
    if (popup.parentElement !== document.body) {
      document.body.appendChild(popup);
    }
    if (backdrop && backdrop.parentElement !== document.body) {
      document.body.appendChild(backdrop);
    }
  } else {
    /* Kembalikan ke sidebar jika belum */
    if (popup.parentElement !== sidebar) {
      /* Sisipkan sebagai child pertama sidebar (di atas howto-card) */
      sidebar.insertBefore(popup, sidebar.firstChild);
    }
    /* backdrop tidak dipakai di desktop, pastikan tidak aktif */
    if (backdrop) backdrop.classList.remove('active');
  }
}

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

    /* simpan semua frasa */
    window.semuaFrasa = Object.keys(kamus).sort(
      (a, b) => b.split(" ").length - a.split(" ").length
    );

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

      container.innerHTML =
        "<p style='text-align:center;color:#9c7e5e;padding:40px;'>Teks tidak ditemukan.</p>";

      return;
    }

    let html = `<h2 class="judul-arab arabicText">${teksDipilih.judul}</h2>`;

    teksDipilih.paragraf.forEach(p => {

      /* split lebih aman */
      const tokens = p.trim().split(/\s+/);

      let wrappedWords = [];
      let i = 0;

      /* cari panjang frasa terpanjang otomatis */
      const maxLen = Math.max(
        ...window.semuaFrasa.map(f => f.split(" ").length)
      );

      while (i < tokens.length) {

        let found = false;

        /* cek dari frasa terpanjang */
        for (let len = maxLen; len >= 1; len--) {

          const phrase      = tokens.slice(i, i + len).join(" ");
          const cleanPhrase = bersihkanKata(phrase);

          if (kamus[cleanPhrase]) {

            wrappedWords.push(
              `<span class="word"
                data-kata="${cleanPhrase}">
                ${phrase}
              </span>`
            );

            i += len;
            found = true;
            break;
          }
        }

        /* kalau tidak ditemukan */
        if (!found) {

          wrappedWords.push(
            `<span class="word"
              data-kata="${bersihkanKata(tokens[i])}">
              ${tokens[i]}
            </span>`
          );

          i++;
        }
      }

      const wrapped = wrappedWords.join(" ");

      html += `<p class="arabicText">${wrapped}</p>`;

    });

    container.innerHTML = html;

    setTimeout(() => {

      if (!localStorage.getItem("onboarding_teks_done")) {

        startOnboardingTeks();

        localStorage.setItem(
          "onboarding_teks_done",
          "true"
        );
      }

    }, 900);

  })
  .catch(err => {

    document.getElementById("containerTeks").innerHTML =
      "<p style='text-align:center;color:#c05e2e;padding:40px;'>Gagal memuat teks.</p>";

    console.log("ERROR TEKS:", err);

  });





/* =====================
   SIDEBAR FIXED (DESKTOP ONLY)
===================== */
function pasangSidebarFixed() {
  if (isMobile()) return;

  const placeholder = document.querySelector('.col-lg-5');
  const sidebar     = document.getElementById('sidebarFixed');
  if (!placeholder || !sidebar) return;

  const rect = placeholder.getBoundingClientRect();

  sidebar.style.position  = 'fixed';
  sidebar.style.top       = '100px';
  sidebar.style.left      = Math.round(rect.left) + 'px';
  sidebar.style.width     = Math.round(rect.width) + 'px';
  sidebar.style.zIndex    = '200';
  sidebar.style.maxHeight = '';
  sidebar.style.overflowY = 'visible';
}

/* Jalankan saat DOM ready, load, dan resize */
document.addEventListener('DOMContentLoaded', () => {
  aturPosisiPopup();
  pasangSidebarFixed();
});

window.addEventListener('load', pasangSidebarFixed);

window.addEventListener('resize', () => {
  aturPosisiPopup();
  pasangSidebarFixed();
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

  /* Reset animasi konten kalau popup sudah aktif sebelumnya */
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
    e.stopPropagation(); tutupPopup(); return;
  }

  /* Klik backdrop */
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
    { element: ".text-area",       popover: { title: "📖 Teks Bacaan",   description: "Semua kata di sini bisa diklik untuk melihat artinya.", side: "bottom" } },
    { element: ".text-area .word", popover: { title: "👆 Klik Kata",     description: "Coba klik salah satu kata Arab!", side: "bottom" } },
    { element: "#popup",           popover: { title: "✨ Panel Kosakata", description: "Arti dan penjelasan kata tampil di sini.", side: "left" } }
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