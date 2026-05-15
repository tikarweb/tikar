// vr.js — Fixed: fade transition, error handling, closeInfo listener
import { scenes } from "./scenes.js";
import { createHotspots, clearHotspots } from "./hotspot.js";
import { showLoader, hideLoader } from "./loader.js";

const container = document.querySelector("#scene-container");
const titleEl   = document.querySelector("#sceneTitle");
const infoBox   = document.querySelector("#infoBox");
const rig       = document.querySelector("#rig");

let currentScene = 0;

/* =========================
   CLOSE INFO PANEL
   Bug fix: sebelumnya tidak ada listener ini
========================= */
document.querySelector("#closeInfo").addEventListener("click", () => {
  document.querySelector("#infoPanel").classList.add("hidden");
});

/* =========================
   LOAD SCENE
========================= */
function loadScene(index) {
  // Pakai fade transition yang sebelumnya tidak pernah dipakai
  fadeTransition(() => {
    showLoader();
    clearHotspots();       // bersihkan hotspot scene sebelumnya
    container.innerHTML = "";

    const sceneData = scenes[index];
    titleEl.innerText = sceneData.title;
    infoBox.innerText = sceneData.info;

    // Tutup info panel dari scene sebelumnya
    document.querySelector("#infoPanel").classList.add("hidden");

    // Reset posisi kamera ke posisi awal scene
    if (sceneData.cameraStart) {
      const { x, y, z } = sceneData.cameraStart;
      rig.setAttribute("position", `${x} ${y} ${z}`);
    }

    const totalModels = sceneData.models.length;

    // Handle scene tanpa model (hanya hotspot)
    if (totalModels === 0) {
      hideLoader();
      createHotspots(sceneData.hotspots);
      return;
    }

    let loadedCount = 0;

    function onModelDone() {
      loadedCount++;
      if (loadedCount === totalModels) {
        hideLoader();
        createHotspots(sceneData.hotspots);
      }
    }

    sceneData.models.forEach(model => {
      const entity = document.createElement("a-entity");
      entity.setAttribute("gltf-model", model.src);
      entity.setAttribute("position",   model.position);
      entity.setAttribute("rotation",   model.rotation);
      entity.setAttribute("scale",      model.scale);
      entity.setAttribute("shadow",     "cast: true; receive: true");

      // Model berhasil
      entity.addEventListener("model-loaded", onModelDone);

      // Bug fix: model gagal → tetap hideLoader agar tidak stuck
      entity.addEventListener("model-error", () => {
        console.warn("Model gagal dimuat:", model.src);
        onModelDone();
      });

      container.appendChild(entity);
    });
  });
}

/* =========================
   FADE TRANSITION
   Bug fix: sebelumnya didefinisikan tapi tidak dipakai
========================= */
function fadeTransition(callback) {
  const fade = document.querySelector("#transitionFade");
  fade.classList.add("show");

  setTimeout(() => {
    callback();
    // Tunggu sebentar agar DOM ter-render, lalu fade out
    setTimeout(() => fade.classList.remove("show"), 100);
  }, 350);
}

/* =========================
   NEXT / PREV NAVIGATION
========================= */
document.querySelector("#nextScene").addEventListener("click", () => {
  currentScene = (currentScene + 1) % scenes.length;
  loadScene(currentScene);
});

document.querySelector("#prevScene").addEventListener("click", () => {
  currentScene = (currentScene - 1 + scenes.length) % scenes.length;
  loadScene(currentScene);
});

/* =========================
   INIT — tunggu A-Frame ready
========================= */
document.querySelector("a-scene").addEventListener("loaded", () => {
  // Auto-hide movement hint setelah 5 detik
  setTimeout(() => {
    const hint = document.querySelector("#movementHint");
    if (hint) hint.style.opacity = "0";
  }, 5000);

  loadScene(currentScene);
});