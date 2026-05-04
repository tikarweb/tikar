const URL_API = "https://script.google.com/macros/s/AKfycbzE2yS5EXZ2lAvZwtvAI64LHXdQc3FJBQAYztcoJRMzvwDFwGIlBpG3wT33IV6qIXWt/exec";

// =======================
// UTIL
// =======================
function getUserIdFromURL() {
  return new URLSearchParams(window.location.search).get("userId");
}

function getTeksFromURL() {
  // Prioritas: URL param → sessionStorage → default "1"
  return new URLSearchParams(window.location.search).get("teks")
    || sessionStorage.getItem("teksAktif")
    || "1";
}

function getJudulTeks() {
  return sessionStorage.getItem("judulTeks") || "";
}

function actflMapping(score) {
  if (score >= 90) return { label: "Advanced High",     cls: "grade-a" };
  if (score >= 75) return { label: "Advanced Mid",      cls: "grade-a" };
  if (score >= 60) return { label: "Intermediate High", cls: "grade-b" };
  if (score >= 45) return { label: "Intermediate Mid",  cls: "grade-c" };
  if (score >= 30) return { label: "Novice High",       cls: "grade-c" };
  return                  { label: "Novice Low",         cls: "grade-d" };
}

function scoreClass(s) {
  if (s >= 80) return "high";
  if (s >= 60) return "med";
  if (s >= 40) return "low";
  return "vlow";
}

const LEVEL_THEME = {
  1: { stripe: "",     icon: "teal", badge: "teal", bar: ""     },
  2: { stripe: "gold", icon: "gold", badge: "gold", bar: "gold" },
  3: { stripe: "rose", icon: "rose", badge: "rose", bar: "rose" },
  4: { stripe: "mint", icon: "mint", badge: "mint", bar: "mint" },
};

const LEVEL_LABEL = {
  1: "Mufradāt",
  2: "Tarkīb",
  3: "Qirā'ah",
  4: "Kitābah",
};

const LEVEL_ICON = {
  1: "alphabet",
  2: "diagram-3",
  3: "book",
  4: "pencil",
};

function getTheme(lvl) {
  return LEVEL_THEME[lvl] || LEVEL_THEME[1];
}

// =======================
// NAVBAR
// =======================
function loadNavbar() {
  fetch("../pages/navbar.html")
    .then(r => r.text())
    .then(html => {
      const el = document.getElementById("navbar");
      if (el) el.innerHTML = html;
    })
    .catch(() => {});
}

// =======================
// GROUPING
// =======================
function kelompokkanPerLevel(data) {
  const grouped = {};
  data.forEach(item => {
    if (item.level === null || item.level === undefined) return;
    const lvl = Number(item.level);
    if (!grouped[lvl]) grouped[lvl] = [];
    grouped[lvl].push(item);
  });
  return grouped;
}

// =======================
// HITUNG SKOR AKHIR
// =======================
function hitungSkorAkhir(grouped) {
  let total = 0, count = 0;
  Object.keys(grouped).forEach(lvl => {
    grouped[lvl].forEach(item => {
      if (typeof item.skor === "number" && item.skor !== null) {
        total += item.skor;
        count++;
      }
    });
  });
  return count === 0 ? 0 : Math.round(total / count);
}

// =======================
// RENDER SKOR AKHIR CARD
// =======================
function renderSkorAkhir(grouped, nama) {
  const el = document.getElementById("skor-akhir");
  if (!el) return;

  const final       = hitungSkorAkhir(grouped);
  const predikat    = actflMapping(final);
  const teks        = getTeksFromURL();
  const judul       = getJudulTeks();
  const totalSoal   = Object.values(grouped).reduce((a, b) => a + b.length, 0);
  const totalLevel  = Object.keys(grouped).length;
  const offset      = 346 - (346 * final / 100);
  const displayNama = nama || sessionStorage.getItem("namaSiswa") || "Siswa";

  el.innerHTML = `
    <svg width="0" height="0" style="position:absolute">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="#2cc4e0"/>
          <stop offset="100%" stop-color="#f0b429"/>
        </linearGradient>
      </defs>
    </svg>

    <div class="skor-ring-wrap">
      <div class="skor-ring">
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle class="ring-track" cx="65" cy="65" r="55"/>
          <circle class="ring-fill" id="ringFill" cx="65" cy="65" r="55"/>
        </svg>
        <div class="ring-label">
          <span class="ring-score" id="ringScore">0</span>
          <span class="ring-max">/ 100</span>
        </div>
      </div>
      <span class="skor-ring-label">Skor Akhir</span>
    </div>

    <div class="skor-info">
      <div class="skor-nama">${displayNama}</div>
      <div class="skor-sub">
        <i class="bi bi-file-text me-1"></i>
        Teks ${teks}${judul ? ": " + judul : ""}
      </div>
      <div class="grade-pill ${predikat.cls}">
        <i class="bi bi-award-fill"></i>
        ${predikat.label}
      </div>
      <div class="skor-stats">
        <div class="stat-chip"><i class="bi bi-list-check"></i> ${totalSoal} soal</div>
        <div class="stat-chip"><i class="bi bi-layers"></i> ${totalLevel} level</div>
        <div class="stat-chip">
          <i class="bi bi-bar-chart-line"></i>
          ${final >= 60 ? "Lulus" : "Perlu latihan"}
        </div>
      </div>
    </div>
  `;

  // Animasi ring + count-up angka
  requestAnimationFrame(() => {
    const ringEl  = document.getElementById("ringFill");
    const scoreEl = document.getElementById("ringScore");
    if (ringEl) ringEl.style.strokeDashoffset = offset;

    if (scoreEl && final > 0) {
      let current = 0;
      const step  = Math.max(1, Math.ceil(final / 60));
      const timer = setInterval(() => {
        current = Math.min(current + step, final);
        scoreEl.textContent = current;
        if (current >= final) clearInterval(timer);
      }, 16);
    }
  });
}

// =======================
// RENDER DETAIL PER LEVEL
// =======================
function renderHasilGrouped(grouped) {
  const container = document.getElementById("cards-grid");
  if (!container) return;

  let html = "";

  Object.keys(grouped)
    .sort((a, b) => Number(a) - Number(b))
    .forEach(lvl => {
      const items  = grouped[lvl];
      const theme  = getTheme(Number(lvl));
      const label  = LEVEL_LABEL[Number(lvl)]  || `Level ${lvl}`;
      const icon   = LEVEL_ICON[Number(lvl)]   || "star";

      const scored = items.filter(it => typeof it.skor === "number" && it.skor !== null);
      const avg    = scored.length
        ? Math.round(scored.reduce((a, b) => a + b.skor, 0) / scored.length)
        : null;

      const avgDisp  = avg !== null ? avg : "-";
      const scoreCls = avg !== null ? scoreClass(avg) : "vlow";
      const barWidth = avg !== null ? avg : 0;

      html += `
        <div class="level-card">
          <div class="card-stripe ${theme.stripe}"></div>
          <div class="card-body">

            <div class="card-header-row">
              <div class="level-title">
                <div class="level-icon ${theme.icon}">
                  <i class="bi bi-${icon}"></i>
                </div>
                <span>Level ${lvl}</span>
                <span class="badge-level ${theme.badge}">${label}</span>
              </div>
              <div class="card-score-badge">
                <span class="score-number ${scoreCls}">${avgDisp}</span>
                <span class="score-label">rata-rata</span>
              </div>
            </div>

            <div class="card-progress">
              <div class="card-progress-fill ${theme.bar}"
                   style="width:0%"
                   data-width="${barWidth}">
              </div>
            </div>

            <div class="feedback-list">
      `;

      items.forEach((item, i) => {
        const s     = item.skor ?? null;
        const sDisp = s !== null ? s : "…";
        const sCls  = s !== null ? scoreClass(s) : "vlow";
        const isOk  = s !== null && s >= 60;

        html += `
          <div class="feedback-item">
            <div class="feedback-num">${i + 1}</div>
            <div class="feedback-content">
              <span class="feedback-note">${item.feedback || "Sedang diproses..."}</span>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px;flex-shrink:0;">
              <span class="score-number ${sCls}" style="font-size:1rem;">${sDisp}</span>
              <div class="feedback-status ${isOk ? "correct" : "wrong"}">
                <i class="bi bi-${isOk ? "check" : "x"}"></i>
              </div>
            </div>
          </div>
        `;
      });

      html += `
            </div>
          </div>
        </div>
      `;
    });

  container.innerHTML = html;

  // Animasi progress bar setelah render
  requestAnimationFrame(() => {
    document.querySelectorAll(".card-progress-fill").forEach(el => {
      el.style.width = (el.dataset.width || 0) + "%";
    });
  });
}

// =======================
// SETUP TOMBOL AKSI
// Tombol ulangi: arahkan ke teks yang sama
// Tombol cetak: window.print()
// =======================
function setupTombolAksi() {
  const teks      = getTeksFromURL();
  const targetURL = `maharah.html?teks=${teks}`;

  const btnUlangi = document.getElementById("btn-ulangi");
  if (btnUlangi) {
    // Support <a> maupun <button>
    if (btnUlangi.tagName === "A") {
      btnUlangi.href = targetURL;
    } else {
      btnUlangi.addEventListener("click", () => {
        window.location.href = targetURL;
      });
    }
  }

  const btnCetak = document.getElementById("btn-cetak");
  if (btnCetak) {
    btnCetak.addEventListener("click", () => window.print());
  }
}

// =======================
// LOAD HASIL
// =======================
async function loadHasil() {
  const userId  = getUserIdFromURL();
  const hasilEl = document.getElementById("hasil");

  if (!userId) {
    if (hasilEl) hasilEl.innerHTML = `
      <div class="empty">
        <i class="bi bi-exclamation-circle"></i>
        <p>User ID tidak ditemukan. Coba mulai latihan dari awal.</p>
      </div>`;
    return;
  }

  if (hasilEl) hasilEl.innerHTML = `
    <div class="empty">
      <i class="bi bi-hourglass-split"></i>
      <p>Memuat hasil penilaian...</p>
    </div>`;

  try {
    // Content-Type: text/plain — mencegah CORS preflight
    const res = await fetch(URL_API, {
      method:  "POST",
      headers: { "Content-Type": "text/plain" },
      body:    JSON.stringify({ tipe: "getHasil", userId })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const jsonData = await res.json();
    console.log("DATA HASIL:", jsonData);

    if (jsonData.status !== "ok") throw new Error(JSON.stringify(jsonData));

    const data = jsonData.data;

    if (!data || data.length === 0) {
      if (hasilEl) hasilEl.innerHTML = `
        <div class="empty">
          <i class="bi bi-hourglass-split"></i>
          <p>Data belum tersedia. AI mungkin masih memproses.</p>
          <button class="btn-hasil outline" style="margin-top:1rem" onclick="loadHasil()">
            <i class="bi bi-arrow-clockwise"></i> Coba lagi
          </button>
        </div>`;
      return;
    }

    // Ambil nama dari data, fallback ke sessionStorage
    const nama = data.find(d => d.nama)?.nama || sessionStorage.getItem("namaSiswa") || "";
    if (nama) sessionStorage.setItem("namaSiswa", nama);

    // Ambil judul teks dari data kalau sessionStorage kosong
    const teksFromData = data.find(d => d.teks)?.teks;
    if (teksFromData && !sessionStorage.getItem("teksAktif")) {
      sessionStorage.setItem("teksAktif", teksFromData);
    }

    const grouped = kelompokkanPerLevel(data);

    renderSkorAkhir(grouped, nama);
    renderHasilGrouped(grouped);

    // Kosongkan loading state setelah render selesai
    if (hasilEl) hasilEl.innerHTML = "";

  } catch (err) {
    console.error("❌ loadHasil error:", err);
    if (hasilEl) hasilEl.innerHTML = `
      <div class="empty">
        <i class="bi bi-wifi-off"></i>
        <p>Gagal memuat: ${err.message}</p>
        <button class="btn-hasil outline" style="margin-top:1rem" onclick="loadHasil()">
          <i class="bi bi-arrow-clockwise"></i> Coba lagi
        </button>
      </div>`;
  }
}

// =======================
// INIT
// =======================
document.addEventListener("DOMContentLoaded", () => {
  loadNavbar();
  setupTombolAksi();
  loadHasil();
});