# 📱 Panduan Testing Bot WhatsApp - Picky Eater

Dokumen ini berisi contoh percakapan lengkap untuk testing semua fitur chatbot WhatsApp edukasi picky eater. Ikuti step-by-step sesuai skenario yang diinginkan.

---

## 🚀 Cara Memulai Testing

1. Jalankan bot dengan perintah:
   ```bash
   docker-compose up
   ```
2. Scan QR Code di `http://localhost:3000/qr`
3. Kirim pesan ke nomor bot dari WhatsApp

---

## 📋 Daftar Skenario Testing

- [Skenario 1: Flow Lengkap - Apa itu Picky Eater](#skenario-1-flow-lengkap---apa-itu-picky-eater)
- [Skenario 2: Anak Susah Makan](#skenario-2-anak-susah-makan)
- [Skenario 3: Khawatir & Bingung (Dukungan Emosional)](#skenario-3-khawatir--bingung-dukungan-emosional)
- [Skenario 4: Tips Awal yang Mudah](#skenario-4-tips-awal-yang-mudah)
- [Skenario 5: Butuh Bantuan Langsung](#skenario-5-butuh-bantuan-langsung)
- [Skenario 6: Keluar dari Percakapan](#skenario-6-keluar-dari-percakapan)

---

## Skenario 1: Flow Lengkap - Apa itu Picky Eater

### Step 1: Memulai Percakapan
| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| 1 | **User** | `hai` atau `halo` atau pesan apapun |
| 2 | **Bot** | *"Halo, Bunda 🌸 Terima kasih sudah bergabung..."* |
| 3 | **Bot** | *[POLL]* "Chatbot ini berisi edukasi singkat..." dengan opsi: `Ya, saya setuju` / `Keluar` |

### Step 2: Setuju dan Masuk Menu Utama
| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| 4 | **User** | Pilih: `Ya, saya setuju` |
| 5 | **Bot** | *[POLL]* "Bunda ingin mulai dari mana?" dengan opsi: <br>• Apa itu picky eater? <br>• Anak saya susah makan <br>• Saya khawatir & bingung <br>• Tips awal yang mudah <br>• Butuh bantuan langsung |

### Step 3: Pilih "Apa itu Picky Eater?"
| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| 6 | **User** | Pilih: `Apa itu picky eater?` |
| 7 | **Bot** | *"Picky eater adalah kondisi ketika anak sering menolak makan..."* |
| 8 | **Bot** | *[POLL]* "Bunda mau tahu lebih lanjut tentang apa?" dengan opsi: <br>• Penyebab picky eater <br>• Karakteristik Perilaku Picky Eater <br>• Dampak Picky Eater <br>• Strategi menghadapi anak picky eater <br>• Hubungan dengan stunting |

### Step 4a: Pilih "Penyebab Picky Eater"
| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| 9 | **User** | Pilih: `Penyebab picky eater` |
| 10 | **Bot** | *"Faktor yang Mempengaruhi Anak Picky Eater: 1️⃣ Sensitivitas sensorik... 2️⃣ Pola asuh orang tua... 3️⃣ Pengalaman awal MP-ASI... 4️⃣ Faktor biologis & genetik..."* |
| 11 | **Bot** | *[POLL]* "Bunda mau belajar aspek lainnya?" dengan opsi: `Ya, tampilkan menu lagi` / `Kembali ke menu utama` |

### Step 4b: Pilih "Karakteristik Perilaku Picky Eater"
| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| 9 | **User** | Pilih: `Karakteristik Perilaku Picky Eater` |
| 10 | **Bot** | *"Karakteristik Perilaku Picky Eater pada Anak: 1️⃣ Pilih-pilih makanan... 2️⃣ Menolak makanan baru... 3️⃣ Preferensi makanan yang kuat... 4️⃣ Penolakan berdasarkan sensori..."* |
| 11 | **Bot** | *[POLL]* "Bunda mau belajar aspek lainnya?" |

### Step 4c: Pilih "Dampak Picky Eater"
| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| 9 | **User** | Pilih: `Dampak Picky Eater` |
| 10 | **Bot** | *"Dampak Picky Eater: Anak yang pilih-pilih makanan bisa kekurangan gizi..."* |
| 11 | **Bot** | *[POLL]* "Bunda mau belajar aspek lainnya?" |

### Step 4d: Pilih "Strategi menghadapi anak picky eater"
| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| 9 | **User** | Pilih: `Strategi menghadapi anak picky eater` |
| 10 | **Bot** | *"Cara Mengatasi Anak Picky Eater: 🍽️ 1. Jadi contoh yang baik... 🥕 2. Kenalkan makanan baru tanpa paksaan..."* |
| 11 | **Bot** | *[POLL]* "Bunda mau belajar aspek lainnya?" |

### Step 4e: Pilih "Hubungan dengan stunting"
| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| 9 | **User** | Pilih: `Hubungan dengan stunting` |
| 10 | **Bot** | *"Hubungan Picky Eater dengan Stunting: Anak yang picky eater cenderung hanya mau makan jenis makanan tertentu saja..."* |
| 11 | **Bot** | *[POLL]* "Bunda mau belajar aspek lainnya?" |

### Step 5: Kembali atau Lanjut Belajar
| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| 12 | **User** | Pilih: `Ya, tampilkan menu lagi` |
| 13 | **Bot** | *[POLL]* "Bunda mau tahu lebih lanjut tentang apa?" (kembali ke submenu picky eater) |

**ATAU**

| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| 12 | **User** | Pilih: `Kembali ke menu utama` |
| 13 | **Bot** | *[POLL]* "Bunda ingin mulai dari mana?" (kembali ke menu utama) |

---

## Skenario 2: Anak Susah Makan

### Step 1-2: Sama seperti Skenario 1 (sampai menu utama)

### Step 3: Pilih "Anak saya susah makan"
| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| 6 | **User** | Pilih: `Anak saya susah makan` |
| 7 | **Bot** | *[POLL]* "Banyak Bunda-Bunda yang mengalami hal yang sama... Yang paling sering terjadi apa?" dengan opsi: <br>• Anak menolak makan <br>• Makan sangat sedikit <br>• Hanya mau makanan tertentu <br>• Lama & main saat makan |

### Step 4a: Pilih "Anak menolak makan"
| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| 8 | **User** | Pilih: `Anak menolak makan` |
| 9 | **Bot** | *"Terima kasih sudah cerita, Bun 🤍 Ini termasuk tanda picky eater ringan–sedang..."* |
| 10 | **Bot** | *"Tips Hari Ini untuk Bunda: 1. Fokus satu makanan bergizi dulu... 2. Sajikan porsi kecil..."* |
| 11 | **Bot** | *[POLL]* "Bunda mau informasi atau tips lebih lanjut?" dengan opsi: `Ya, saya mau belajar lagi` / `Kembali ke menu utama` / `Keluar` |

### Step 4b: Pilih "Makan sangat sedikit"
| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| 8 | **User** | Pilih: `Makan sangat sedikit` |
| 9 | **Bot** | *"Terima kasih sudah cerita, Bun 🤍..."* (response serupa) |
| 10 | **Bot** | *"Tips Hari Ini untuk Bunda..."* |
| 11 | **Bot** | *[POLL]* "Bunda mau informasi atau tips lebih lanjut?" |

### Step 4c: Pilih "Hanya mau makanan tertentu"
| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| 8 | **User** | Pilih: `Hanya mau makanan tertentu` |
| 9-11 | **Bot** | (response serupa dengan tips) |

### Step 4d: Pilih "Lama & main saat makan"
| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| 8 | **User** | Pilih: `Lama & main saat makan` |
| 9-11 | **Bot** | (response serupa dengan tips) |

### Step 5: Lanjut atau Keluar
| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| 12 | **User** | Pilih: `Ya, saya mau belajar lagi` |
| 13 | **Bot** | *[POLL]* Kembali ke menu utama |

---

## Skenario 3: Khawatir & Bingung (Dukungan Emosional)

### Step 1-2: Sama seperti Skenario 1 (sampai menu utama)

### Step 3: Pilih "Saya khawatir & bingung"
| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| 6 | **User** | Pilih: `Saya khawatir & bingung` |
| 7 | **Bot** | *[POLL]* "Perasaan Bunda sangat wajar 🌷 Yang paling Bunda rasakan saat ini apa?" dengan opsi: <br>• Takut anak kurang gizi <br>• Capek & stres <br>• Merasa gagal <br>• Bingung harus mulai dari mana |

### Step 4: Pilih Salah Satu Perasaan
| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| 8 | **User** | Pilih: `Takut anak kurang gizi` (atau opsi lainnya) |
| 9 | **Bot** | *"Bunda hebat, sudah melakukan yang terbaik... 🟢 Penguatan untuk Bunda: Ibu, merasa khawatir, capek, atau bingung bukan tanda ibu gagal..."* |
| 10 | **Bot** | *[POLL]* "Bunda mau informasi atau tips lebih lanjut?" |

### Step 5: Pilih Kelanjutan
| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| 11 | **User** | Pilih sesuai keinginan |

---

## Skenario 4: Tips Awal yang Mudah

### Step 1-2: Sama seperti Skenario 1 (sampai menu utama)

### Step 3: Pilih "Tips awal yang mudah"
| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| 6 | **User** | Pilih: `Tips awal yang mudah` |
| 7 | **Bot** | *[POLL]* "Ini 3 langkah ringan yang bisa Bunda coba hari ini: 1️⃣ Jangan memaksa anak makan 2️⃣ Jadwal makan teratur 3️⃣ Contohkan makan bersama" dengan opsi: <br>• Jelaskan tips ini lebih lanjut <br>• Saya siap mulai <br>• Kembali ke menu utama |

### Step 4a: Pilih "Jelaskan tips ini lebih lanjut"
| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| 8 | **User** | Pilih: `Jelaskan tips ini lebih lanjut` |
| 9 | **Bot** | *"Cara Mengatasi Anak Picky Eater: 🍽️ 1. Jadi contoh yang baik..."* (penjelasan lengkap strategi) |
| 10 | **Bot** | *[POLL]* "Bunda mau belajar aspek lainnya?" |

### Step 4b: Pilih "Saya siap mulai"
| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| 8 | **User** | Pilih: `Saya siap mulai` |
| 9 | **Bot** | *"Keren, Bun! 🌟 Mulai dengan satu tips saja hari ini. Langkah kecil akan membawa perubahan besar..."* |
| 10 | **Bot** | *[POLL]* "Bunda mau informasi atau tips lebih lanjut?" |

---

## Skenario 5: Butuh Bantuan Langsung

### Step 1-2: Sama seperti Skenario 1 (sampai menu utama)

### Step 3: Pilih "Butuh bantuan langsung"
| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| 6 | **User** | Pilih: `Butuh bantuan langsung` |
| 7 | **Bot** | *"Jika Bunda merasa butuh pendampingan lebih lanjut, kami bisa bantu. Silakan hubungi nomor WhatsApp ini: 📱 087849194804"* |
| 8 | **Bot** | *[POLL]* "Bunda mau informasi atau tips lebih lanjut?" |

---

## Skenario 6: Keluar dari Percakapan

### Cara 1: Keluar di Awal (Tidak Setuju)
| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| 1 | **User** | `hai` |
| 2 | **Bot** | *"Halo, Bunda 🌸..."* |
| 3 | **Bot** | *[POLL]* "Chatbot ini berisi edukasi singkat..." |
| 4 | **User** | Pilih: `Keluar` |
| 5 | **Bot** | *"Terima kasih sudah menggunakan chatbot kami, Bun. Jaga kesehatan dan ingat, Bunda sudah melakukan pekerjaan yang luar biasa 🌸 Bunda bisa kembali kapan saja kalau butuh dukungan!"* |

### Cara 2: Keluar dari Menu Tips
| Langkah | Pengirim | Pesan |
|---------|----------|-------|
| ... | (setelah selesai membaca tips) | ... |
| n | **Bot** | *[POLL]* "Bunda mau informasi atau tips lebih lanjut?" |
| n+1 | **User** | Pilih: `Keluar` |
| n+2 | **Bot** | *"Terima kasih sudah menggunakan chatbot kami..."* |

---

## 🔄 Flow Diagram Ringkas

```
START
  │
  ▼
┌─────────────────────┐
│   Salam Pembuka     │
│   + Agreement       │
└─────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────┐
│                   MENU UTAMA                        │
├─────────────────────────────────────────────────────┤
│ 1. Apa itu picky eater?                             │
│ 2. Anak saya susah makan                            │
│ 3. Saya khawatir & bingung                          │
│ 4. Tips awal yang mudah                             │
│ 5. Butuh bantuan langsung                           │
└─────────────────────────────────────────────────────┘
  │
  ├──► [1] Picky Eater Info ──► Submenu (5 topik)
  │
  ├──► [2] Susah Makan ──► Pilih Masalah ──► Tips Harian
  │
  ├──► [3] Dukungan Emosional ──► Penguatan
  │
  ├──► [4] Tips Mudah ──► Penjelasan/Motivasi
  │
  └──► [5] Kontak Langsung ──► Nomor WA
```

---

## ⚠️ Catatan Penting untuk Testing

1. **Poll vs Text**: Bot menggunakan fitur Poll WhatsApp untuk menu pilihan. Pastikan versi WhatsApp mendukung poll.

2. **Auto-proceed**: Setelah pesan text, bot akan otomatis melanjutkan ke node berikutnya dalam 1.5 detik.

3. **Reset Session**: Jika ingin mengulang dari awal, tunggu beberapa saat atau restart bot.

4. **Fallback Message**: Jika mengirim pesan yang tidak sesuai opsi, bot akan merespon:
   > "Maaf, saya tidak mengerti. Silakan pilih dari opsi yang tersedia."

5. **Case Insensitive**: Input user tidak case-sensitive (huruf besar/kecil tidak berpengaruh).

---

## 📊 Checklist Testing

Gunakan checklist ini untuk memastikan semua fitur telah ditest:

- [ ] Flow awal (salam + agreement)
- [ ] Menu utama tampil dengan 5 opsi
- [ ] Apa itu picky eater - semua 5 submenu
- [ ] Anak susah makan - semua 4 jenis masalah
- [ ] Dukungan emosional - semua 4 perasaan
- [ ] Tips awal mudah - jelaskan & siap mulai
- [ ] Bantuan langsung - nomor kontak tampil
- [ ] Keluar di agreement
- [ ] Keluar dari menu tips
- [ ] Kembali ke menu utama dari submenu
- [ ] Fallback message untuk input tidak valid
- [ ] Auto-proceed setelah text message

---

## 💬 Contoh Chat Lengkap (Screenshot Ready)

### Percakapan Ideal dari Awal sampai Akhir:

```
[08:00] User: hai

[08:00] Bot: Halo, Bunda 🌸
Terima kasih sudah bergabung. Di sini Bunda bisa berbagi 
dan belajar pelan-pelan tentang anak Bunda yang susah makan.

Tenang, Bunda tidak sendirian 🤍

[08:00] Bot: [POLL] Chatbot ini berisi edukasi singkat, tips 
harian, dan dukungan untuk Bunda.
• Ya, saya setuju
• Keluar

[08:01] User: [Pilih] Ya, saya setuju

[08:01] Bot: [POLL] Bunda ingin mulai dari mana?
• Apa itu picky eater?
• Anak saya susah makan
• Saya khawatir & bingung
• Tips awal yang mudah
• Butuh bantuan langsung

[08:02] User: [Pilih] Apa itu picky eater?

[08:02] Bot: Picky eater adalah kondisi ketika anak sering 
menolak makan, memilih makanan tertentu, atau makan sangat sedikit.

[08:02] Bot: [POLL] Bunda mau tahu lebih lanjut tentang apa?
• Penyebab picky eater
• Karakteristik Perilaku Picky Eater
• Dampak Picky Eater
• Strategi menghadapi anak picky eater
• Hubungan dengan stunting

[08:03] User: [Pilih] Strategi menghadapi anak picky eater

[08:03] Bot: Cara Mengatasi Anak Picky Eater (Edukasi & Tips Harian)
...
(penjelasan lengkap 6 tips)
...

[08:03] Bot: [POLL] Bunda mau belajar aspek lainnya?
• Ya, tampilkan menu lagi
• Kembali ke menu utama

[08:04] User: [Pilih] Kembali ke menu utama

[08:04] Bot: [POLL] Bunda ingin mulai dari mana?
(kembali ke menu utama)
```

---

**Selamat Testing! 🎉**

*Dokumen ini dibuat otomatis berdasarkan flow-engine.ts*
