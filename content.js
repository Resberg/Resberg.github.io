// Konten berdasarkan keterangan pemilik portofolio dan dokumentasi yang diberikan.
const projects = {
  "sumo": {
    "title": "Robot Sumo",
    "category": "Robotika kompetisi",
    "status": "Partisipasi kompetisi",
    "image": "assets/img/sumo-competition.webp",
    "imageAlt": "Kolase robot sumo, persiapan arena, dan tim KSM IoT; bertuliskan FaST Festival 2026.",
    "caption": "Dokumentasi robot sumo dan tim KSM Internet of Things UPN Veteran Jakarta.",
    "intro": "Pengalaman mengembangkan robot sumo bersama KSM IoT dan mengikuti kompetisi sebagai bagian dari proses belajar hardware engineering.",
    "sections": [
      [
        "Peran saya",
        "Sebagai Staff Hardware Engineering, saya berkontribusi pada desain 3D untuk kebutuhan proyek serta perancangan PCB sistem embedded dalam tim."
      ],
      [
        "Spesifikasi & keputusan teknis",
        "Robot sumo kelas 3 kg yang dioperasikan dengan remote control untuk bergerak dan bermanuver di arena. Kendali motor memakai driver BTS7960."
      ],
      [
        "Pengalaman kompetisi",
        "Saya pernah mengikuti kompetisi robot sumo di UPH Funfest, ERIC UNJ, dan FIK Fair."
      ],
      [
        "Proses belajar",
        "Keterlibatan dalam proyek dan kompetisi menjadi ruang untuk mempelajari keterkaitan desain mekanik, elektronika, dan kebutuhan robot di lapangan."
      ]
    ],
    "tags": [
      "Robot sumo",
      "BTS7960",
      "Desain 3D",
      "Hardware engineering"
    ],
    "models": [
      {
        "label": "Sumo final",
        "src": "assets/models/sumo-final.glb",
        "poster": "assets/img/cad-sumo-final-lg.webp",
        "size": "140 KB"
      },
      {
        "label": "Sumo 1 kg",
        "src": "assets/models/sumo-1kg.glb",
        "poster": "assets/img/cad-sumo-1kg-lg.webp",
        "size": "60 KB"
      }
    ]
  },
  "transporter": {
    "title": "Robot Transporter",
    "category": "Robotika kompetisi",
    "status": "Partisipasi FNC Bandung",
    "image": "assets/img/transporter-fnc.webp",
    "imageAlt": "Kolase robot transporter, rangkaian robot, dan tim KSM IoT pada FNC Robotika Nusantara.",
    "caption": "Dokumentasi FNC (Festival Nasional Cerdas) Robotika Nusantara, Bandung.",
    "intro": "Proyek robot transporter bersama KSM IoT yang menjadi bagian dari pengalaman saya mengikuti FNC di Bandung.",
    "sections": [
      [
        "Peran saya",
        "Saya berkontribusi dalam tim hardware melalui perancangan model 3D untuk kebutuhan proyek dan perancangan PCB sistem embedded."
      ],
      [
        "Tujuan & pengujian (pekerjaan tim)",
        "Robot dirancang untuk memindahkan objek. Tim mengintegrasikan mekanisme penggerak, rangkaian listrik, dan sistem kendali gerak, lalu melakukan pengujian fungsional."
      ],
      [
        "Konteks proyek",
        "Pengembangan transporter menjadi kesempatan untuk menghubungkan rancangan mekanik dengan kebutuhan sistem elektronik pada robot."
      ],
      [
        "Pengalaman kompetisi",
        "Berpartisipasi dalam FNC (Festival Nasional Cerdas) Robotika Nusantara di Bandung bersama tim KSM IoT UPN Veteran Jakarta."
      ]
    ],
    "tags": [
      "Transporter",
      "Fusion 360",
      "Desain 3D",
      "Embedded system"
    ],
    "models": [
      {
        "label": "Transporter",
        "src": "assets/models/transporter.glb",
        "poster": "assets/img/cad-transporter-lg.webp",
        "size": "6,6 MB"
      }
    ]
  },
  "agv": {
    "title": "AGV Neuro-Fuzzy",
    "category": "Robotika & sistem kendali",
    "status": "Ongoing · tahap konsep",
    "photo": "Foto [C]",
    "intro": "Pengembangan konsep Automated Guided Vehicle (AGV) dengan pendekatan neuro-fuzzy untuk mengendalikan pergerakan kendaraan.",
    "sections": [
      [
        "Tujuan pengembangan",
        "Tim mengeksplorasi penerapan neuro-fuzzy sebagai pendekatan kendali gerak AGV. Pendekatan ini merupakan arah kebaruan yang ingin dikembangkan, dengan target naskah jurnal terindeks SINTA atau Scopus."
      ],
      [
        "Ruang kontribusi",
        "Sebagai bagian dari tim hardware, fokus saya mencakup desain 3D untuk kebutuhan proyek dan perancangan PCB sistem embedded."
      ],
      [
        "Status saat ini",
        "Proyek masih berjalan pada tahap konsep. Implementasi kendali, pengujian kendaraan, dan hasil pengukuran belum ditampilkan sebagai hasil yang sudah tercapai."
      ]
    ],
    "tags": [
      "AGV",
      "Neuro-fuzzy",
      "Sistem kendali",
      "Ongoing"
    ]
  },
  "motor-driver": {
    "title": "Motor Driver Anti-EMI",
    "category": "Perancangan elektronika",
    "status": "Tahap konsep",
    "photo": "Foto [D]",
    "intro": "Konsep sistem motor driver yang berfokus pada pengurangan pengaruh interferensi elektromagnetik (EMI) dalam sistem embedded.",
    "sections": [
      [
        "Arah perancangan",
        "Mengeksplorasi rancangan motor driver dengan perhatian pada gangguan elektromagnetik dan kebutuhan integrasi dengan sistem embedded."
      ],
      [
        "Fokus pekerjaan",
        "Perancangan PCB merupakan bagian dari bidang kerja saya sebagai Staff Hardware Engineering di KSM IoT."
      ],
      [
        "Status saat ini",
        "Proyek masih berada pada tahap konsep. Skematik rinci, layout PCB, serta hasil pengujian EMI belum ditambahkan. Istilah anti-EMI menyatakan tujuan desain, bukan klaim bebas gangguan."
      ]
    ],
    "tags": [
      "Motor driver",
      "PCB",
      "EMI",
      "Embedded system"
    ]
  },
  "otwlimo": {
    "title": "OtwLimo · GEMASTIK",
    "category": "Kota cerdas",
    "status": "Partisipasi GEMASTIK XIX 2026",
    "image": "assets/img/gemastik-otwlimo.webp",
    "imageAlt": "Dokumentasi GEMASTIK XIX 2026 divisi Kota Cerdas; bagian tengah menampilkan tim OtwLimo dan antarmuka dashboard kendali alat.",
    "caption": "Tim OtwLimo ditampilkan pada bagian tengah dokumentasi GEMASTIK XIX 2026, divisi Kota Cerdas.",
    "intro": "Berpartisipasi dalam GEMASTIK XIX 2026 divisi Kota Cerdas bersama tim OtwLimo sebagai bagian dari tim hardware.",
    "sections": [
      [
        "Gagasan yang ditampilkan",
        "Dokumentasi tim memperlihatkan antarmuka dashboard untuk memantau dan mengendalikan perangkat. Tampilan mencakup status menyala, standby, dan mati, prediksi cuaca, serta data sensor perangkat."
      ],
      [
        "Peran saya",
        "M. Fahrez Bukhori tercantum sebagai Staff of Hardware Engineer dalam tim OtwLimo."
      ],
      [
        "Tim OtwLimo",
        "Jeremia Boy H. S. — Hardware Engineer; M. Fahrez Bukhori — Hardware Engineer; Ramadhani Putra Y. — Software Engineer."
      ],
      [
        "Cakupan dokumentasi",
        "Deskripsi ini merujuk pada tampilan dan keterangan tim dalam gambar yang diberikan. Detail fungsi alat, arsitektur sistem, dan hasil pengujian belum ditambahkan."
      ]
    ],
    "tags": [
      "GEMASTIK 2026",
      "Kota cerdas",
      "OtwLimo",
      "Hardware"
    ]
  },
  "anotara": {
    "title": "Anotara",
    "category": "Eksplorasi produk digital",
    "status": "Dokumentasi awal",
    "photo": "Foto [A]",
    "intro": "Eksplorasi produk untuk membantu proses anotasi gambar bagi kebutuhan dataset AI.",
    "sections": [
      [
        "Tentang proyek",
        "Ruang eksplorasi alur anotasi, antarmuka produk, dan cara mengomunikasikan gagasan kepada pengguna."
      ],
      [
        "Peran & kontribusi",
        "Rincian kontribusi pribadi dan dokumentasi produk akan dilengkapi."
      ]
    ],
    "tags": [
      "Anotasi gambar",
      "Computer vision",
      "Desain produk"
    ]
  }
};
