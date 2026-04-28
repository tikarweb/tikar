/* =====================
   LOAD NAVBAR
===================== */
fetch("../pages/navbar.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("navbar").innerHTML = data;
  });


/* =====================
   SCROLL REVEAL — CARDS
===================== */
function initScrollReveal() {
  const cards = document.querySelectorAll(".baca-card");

  if (!cards.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  cards.forEach(card => observer.observe(card));
}

/* Jalankan setelah DOM ready */
document.addEventListener("DOMContentLoaded", initScrollReveal);


/* =====================
   ANIMASI COUNTER — STAT NUM
===================== */
function animateCounter(el, target, duration = 1200) {
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); /* ease-out cubic */
    el.textContent = Math.round(eased * target);

    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

/* Trigger counter saat hero visible */
document.addEventListener("DOMContentLoaded", () => {
  const statEl = document.getElementById("statCount");
  if (!statEl) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        animateCounter(statEl, parseInt(statEl.textContent) || 8);
        observer.disconnect();
      }
    },
    { threshold: 0.5 }
  );

  observer.observe(statEl);
});