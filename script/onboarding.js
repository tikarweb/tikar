console.log("onboarding kebaca");

function startOnboarding() {
  console.log("onboarding jalan");

  const steps = [
    {
      element: "#btn-mulai",
      popover: {
        title: "Mulai dari sini",
        description: "Klik tombol ini untuk menuju bacaan",
        position: "bottom"
      }
    },
    {
  element: "#tentang h2",
  popover: {
    title: "Tentang Website",
    description: "Ini penjelasan cara penggunaan dan tujuan pembelajaran.",
    position: "bottom"
  }
},
    {
      element: "#bacaan h2",
      popover: {
        title: "Menu Bacaan",
        description: "Kumpulan teks pembelajaran",
        position: "bottom"
      }
    },
    {
      element: "#card-bacaan",
      popover: {
        title: "Pilih teks",
        description: "Klik kartu untuk membaca",
        position: "right"
      }
    },
    {
      element: ".btn-baca",
      popover: {
        title: "Masuk ke teks",
        description: "Buka halaman bacaan",
        position: "top"
      }
    },
    {
      element: ".kitabah-section h2",
      popover: {
        title: "Latihan Kitabah",
        description: "Latihan setelah membaca",
        position: "bottom"
      }
    },
    {
      element: ".kitabah-card",
      popover: {
        title: "Pilih latihan",
        description: "Setiap kartu berisi latihan berbeda",
        position: "top"
      }
    },
    {
      element: "#kontak h2",
      popover: {
        title: "Kontak",
        description: "Kirim pesan jika butuh bantuan",
        position: "bottom"
      }
    }
  ];

  const validSteps = steps.filter(step => document.querySelector(step.element));

  const driverObj = window.driver.js.driver({
    showProgress: true,
    showButtons: true,
    allowClose: true,

    nextBtnText: "Lanjut",
    prevBtnText: "Kembali",
    doneBtnText: "Selesai",

    steps: validSteps
  });

  driverObj.onPopoverRender = (popover) => {
    const skipBtn = document.createElement("button");

    skipBtn.innerText = "Lewati";
    skipBtn.type = "button";
    skipBtn.className = "driver-popover-skip-btn";

    skipBtn.onclick = () => {
      driverObj.destroy();
    };

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
    console.log("onboarding selesai atau di-skip");
  };

  driverObj.drive();
}