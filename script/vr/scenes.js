// scenes.js — Layered depth composition
// Strategi: Foreground (z-2 s/d -4) → Mid (z-7 s/d -10) → Mid-far (z-12 s/d -22) → Far (z-30+)
// User start di z=5, berjalan ke depan (-z) menuju Ka'bah

export const scenes = [
  {
    id: 1,
    title: "Kota Mekkah – Sekitar Ka'bah",
    info: "Gunakan WASD untuk berjalan. Klik hotspot kuning untuk membaca informasi.",

    // Posisi awal kamera untuk scene ini
    cameraStart: { x: 0, y: 0, z: 5 },

    models: [

      // ==============================================
      // FOCAL POINT — Ka'bah (mid-ground, pusat scene)
      // User berjalan dari z=5 menuju z=-8
      // ==============================================
      {
        src: "../vrassets/board1/1kabah.glb",
        position: "0 0 -8",
        scale: "3 3 3",
        rotation: "0 0 0"
      },

      // ==============================================
      // MID-GROUND — Tenda kiri (z=-12 kiri)
      // ==============================================
      {
        src: "../vrassets/board1/1tenda.glb",
        position: "-9 0 -12",
        scale: "2.5 2.5 2.5",
        rotation: "0 30 0"
      },

      // ==============================================
      // MID-GROUND — Tenda kanan (z=-15)
      // Sedikit lebih jauh menciptakan depth
      // ==============================================
      {
        src: "../vrassets/board1/1tenda.glb",
        position: "10 0 -15",
        scale: "2.5 2.5 2.5",
        rotation: "0 -20 0"
      },

      // ==============================================
      // FOREGROUND — Pohon kiri dekat (z=-3)
      // Objek dekat = parallax kuat saat user bergerak
      // ==============================================
      {
        src: "../vrassets/board1/1tree.glb",
        position: "-5 0 -3",
        scale: "2 2 2",
        rotation: "0 0 0"
      },

      // ==============================================
      // FOREGROUND — Pohon kanan dekat (z=-4)
      // ==============================================
      {
        src: "../vrassets/board1/1pohonsatu.glb",
        position: "6 0 -4",
        scale: "2 2 2",
        rotation: "0 90 0"
      },

      // ==============================================
      // FAR — Pohon jauh kiri (z=-22)
      // Objek jauh + fog = kesan ruang yang luas
      // ==============================================
      {
        src: "../vrassets/board1/1tree.glb",
        position: "-16 0 -22",
        scale: "2.2 2.2 2.2",
        rotation: "0 45 0"
      },

      // ==============================================
      // FAR — Pohon jauh kanan (z=-25)
      // ==============================================
      {
        src: "../vrassets/board1/1pohonsatu.glb",
        position: "16 0 -25",
        scale: "2.2 2.2 2.2",
        rotation: "0 -60 0"
      }

    ],

    hotspots: [
      {
        position: "0 5 -8",
        title: "Ka'bah",
        description: "Ka'bah adalah bangunan berbentuk kubus di pusat Masjidil Haram, Mekkah. Ia merupakan kiblat umat Islam seluruh dunia dalam melaksanakan shalat lima waktu."
      },
      {
        position: "-9 4 -12",
        title: "Tenda",
        description: "Tenda-tenda di sekitar Masjidil Haram menggambarkan kehidupan jemaah haji yang datang dari berbagai penjuru dunia untuk melaksanakan ibadah haji."
      }
    ]
  }

  // Tambahkan scene berikutnya di sini dengan format yang sama
  // {
  //   id: 2,
  //   title: "Scene Berikutnya",
  //   cameraStart: { x: 0, y: 0, z: 5 },
  //   models: [...],
  //   hotspots: [...]
  // }
];