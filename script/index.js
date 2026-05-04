document.addEventListener("DOMContentLoaded", () => {
  loadNavbar();
});

function loadNavbar() {
  fetch("/pages/navbar.html")
    .then(res => res.text())
    .then(data => {
      const navbarEl = document.getElementById("navbar");

      if (!navbarEl) {
        console.error("Navbar container tidak ditemukan");
        return;
      }

      navbarEl.innerHTML = data;

      // ✅ Panggil initNavbar SETELAH navbar ada di DOM
      initNavbar();

      // Jalankan onboarding setelah semua siap
      if (typeof startOnboarding === "function") {
        startOnboarding();
      }
    })
    .catch(err => {
      console.error("Gagal load navbar:", err);
    });
}

function initScroll() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".navbar .nav-link");

  if (sections.length === 0) return;

  window.addEventListener("scroll", () => {
    let scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionTop    = section.offsetTop - 80;
      const sectionHeight = section.offsetHeight;
      const sectionId     = section.getAttribute("id");

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => link.classList.remove("active"));

        const activeLink = document.querySelector(
          '.navbar .nav-link[href="#' + sectionId + '"]'
        );
        if (activeLink) activeLink.classList.add("active");
      }
    });
  });
}

function initNavbar() {
  const nav       = document.getElementById('ta-navbar');
  const hamburger = document.getElementById('ta-hamburger');
  const drawer    = document.getElementById('ta-mobile-drawer');

  if (!nav || !hamburger || !drawer) {
    console.warn("Elemen navbar belum siap, retry...");
    setTimeout(initNavbar, 100);
    return;
  }

  // ── HAMBURGER TOGGLE ──
  // ✅ Cukup set window.toggleMobileNav saja
  // JANGAN tambah addEventListener lagi — hamburger sudah punya onclick="toggleMobileNav()"
  // Kalau ditambah listener, fungsi terpanggil 2x = toggle buka lalu tutup seketika
  window.toggleMobileNav = function () {
    const isOpen = drawer.classList.contains('open');
    drawer.classList.toggle('open', !isOpen);
    hamburger.classList.toggle('open', !isOpen);
  };

  // Tutup drawer kalau klik di luar area navbar
  document.addEventListener('click', function (e) {
    if (
      drawer.classList.contains('open') &&
      !drawer.contains(e.target) &&
      !hamburger.contains(e.target) &&
      !nav.contains(e.target)
    ) {
      drawer.classList.remove('open');
      hamburger.classList.remove('open');
    }
  });

  // Tutup drawer saat klik salah satu link di dalamnya
  drawer.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      drawer.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });

  // ── SCROLL EFFECT ──
  function handleScroll() {
    // ✅ Pakai class, bukan inline style — biar bisa di-override CSS
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // jalankan sekali saat load untuk set state awal

  // ── ACTIVE LINK ──
  const path = window.location.pathname + window.location.hash;
  document.querySelectorAll('.ta-nav-links a, .ta-mobile-links a').forEach(function (a) {
    const href = a.getAttribute('href');
    if (href && (
      href === path ||
      (href === '/index.html' && window.location.pathname === '/')
    )) {
      a.classList.add('active');
    }
  });
}

function bukaLatihan(nomor) {
  window.location.href = "pages/latihan.html?teks=" + nomor;
}

function bukaMaharah(nomor) {
  window.location.href = "pages/maharah.html?teks=" + nomor;
}