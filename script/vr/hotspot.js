// hotspot.js — Fixed: showInfoPanel, clearHotspots, billboard, label

/* =========================
   CLEAR HOTSPOTS
   Dipanggil sebelum loadScene baru
========================= */
export function clearHotspots() {
  document.querySelectorAll(".hotspot-wrapper").forEach(el => el.remove());
}

/* =========================
   CREATE HOTSPOTS
========================= */
export function createHotspots(hotspots) {
  const container = document.querySelector("#scene-container");

  hotspots.forEach(hotspot => {

    /* === WRAPPER — posisi di dunia === */
    const wrapper = document.createElement("a-entity");
    wrapper.setAttribute("position", hotspot.position);
    wrapper.setAttribute("class", "hotspot-wrapper");
    // Billboard: selalu menghadap kamera, penting agar ring & label terlihat
    wrapper.setAttribute("look-at", "[camera]");

    /* === MAIN SPHERE — yang diklik === */
    const point = document.createElement("a-sphere");
    point.setAttribute("class", "hotspot-point");
    point.setAttribute("radius", "0.18");
    point.setAttribute("color", "#FFD700");
    point.setAttribute("shader", "flat");
    point.setAttribute("animation", `
      property: scale;
      dir: alternate;
      dur: 900;
      loop: true;
      to: 1.35 1.35 1.35
    `);

    /* === GLOW RING — berputar di sekitar sphere === */
    const ring = document.createElement("a-ring");
    ring.setAttribute("radius-inner", "0.30");
    ring.setAttribute("radius-outer", "0.40");
    ring.setAttribute("color", "#FFD700");
    ring.setAttribute("shader", "flat");
    ring.setAttribute("animation", `
      property: rotation;
      to: 0 0 360;
      loop: true;
      dur: 3000;
      easing: linear
    `);

    /* === LABEL BACKGROUND (plane) === */
    const labelBg = document.createElement("a-plane");
    labelBg.setAttribute("color", "#000000");
    labelBg.setAttribute("opacity", "0.55");
    labelBg.setAttribute("width", "2.4");
    labelBg.setAttribute("height", "0.45");
    labelBg.setAttribute("position", "0 0.62 -0.01");
    labelBg.setAttribute("shader", "flat");

    /* === LABEL TEXT === */
    const label = document.createElement("a-text");
    label.setAttribute("value", hotspot.title);
    label.setAttribute("align", "center");
    label.setAttribute("color", "#ffffff");
    label.setAttribute("position", "0 0.62 0");
    label.setAttribute("scale", "1.6 1.6 1.6");
    label.setAttribute("shader", "flat");

    /* === CLICK EVENTS === */
    // Sphere
    point.addEventListener("click", () => {
      showInfoPanel(hotspot.title, hotspot.description);
    });
    // Label background juga clickable
    labelBg.addEventListener("click", () => {
      showInfoPanel(hotspot.title, hotspot.description);
    });

    /* === ASSEMBLE === */
    wrapper.appendChild(ring);
    wrapper.appendChild(point);
    wrapper.appendChild(labelBg);
    wrapper.appendChild(label);
    container.appendChild(wrapper);
  });
}

/* =========================
   SHOW INFO PANEL
   Bug fix: sebelumnya panel tidak pernah ditampilkan
========================= */
function showInfoPanel(title, text) {
  const panel = document.querySelector("#infoPanel");
  document.querySelector("#infoTitle").innerText = title;
  document.querySelector("#infoDescription").innerText = text;
  // Tampilkan panel
  panel.classList.remove("hidden");
}