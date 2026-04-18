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

      // jalankan scroll setelah navbar ada
      initScroll();

      // jalankan onboarding setelah semua siap
      if (typeof startOnboarding === "function") {
        startOnboarding();
      } else {
        console.warn("startOnboarding tidak ditemukan");
      }
    })
    .catch(err => {
      console.error("Gagal load navbar:", err);
    });
}

function initScroll() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".navbar .nav-link");

  if (sections.length === 0) {
    console.warn("Tidak ada section ditemukan");
    return;
  }

  window.addEventListener("scroll", () => {
    let scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 80;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {

        navLinks.forEach(link => {
          link.classList.remove("active");
        });

        const activeLink = document.querySelector(
          '.navbar .nav-link[href="#' + sectionId + '"]'
        );

        if (activeLink) {
          activeLink.classList.add("active");
        }
      }
    });
  });
}

function bukaLatihan(nomor){
  window.location.href = "pages/latihan.html?teks=" + nomor;
}

function bukaMaharah(nomor){
  window.location.href = "pages/maharah.html?teks=" + nomor;
}