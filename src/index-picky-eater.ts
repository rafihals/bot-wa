export {};
const { BaileysClass } = require('./baileys.js');
require('./server.js');

const botBaileys = new BaileysClass({});

// Per-user state management (not global!)
const userSteps: Map<string, string> = new Map();
const userContext: Map<string, { [key: string]: any }> = new Map();

function getUserStep(userId: string): string {
    return userSteps.get(userId) || 'welcome';
}

function setUserStep(userId: string, step: string): void {
    userSteps.set(userId, step);
    console.log(`   [State] ${userId} -> ${step}`);
}

function getUserContext(userId: string): { [key: string]: any } {
    if (!userContext.has(userId)) userContext.set(userId, {});
    return userContext.get(userId)!;
}

function setUserContext(userId: string, key: string, value: any): void {
    getUserContext(userId)[key] = value;
}

// ─── Self-Efficacy Booster messages ────────────────────────────────────────
const BOOSTER_MESSAGES = [
    'Bunda sudah melakukan yang terbaik hari ini 💛',
    'Perubahan kecil tetap berarti. Bunda luar biasa! 🌸',
    'Bunda mampu merawat anak dengan baik 💪',
    'Setiap usaha kecil Bunda sangat berarti untuk anak 🤍',
    'Bunda tidak harus sempurna, cukup konsisten 🌱',
    'Bunda mampu melalui ini pelan-pelan. Tetap semangat! 💛',
];

function getRandomBooster(): string {
    return BOOSTER_MESSAGES[Math.floor(Math.random() * BOOSTER_MESSAGES.length)];
}

// ─── Helpers ────────────────────────────────────────────────────────────────
async function sendMainMenu(from: string): Promise<void> {
    await botBaileys.sendPoll(from, 'Bunda ingin mulai dari mana hari ini? 😊', {
        options: [
            '📚 Apa itu stunting?',
            '👶 Kondisi anak saya',
            '💬 Perasaan saya hari ini',
            '🌱 Latihan & tips hari ini',
            '📞 Bantuan langsung',
        ],
        multiselect: false,
    });
}

async function sendStuntingSubmenu(from: string): Promise<void> {
    await botBaileys.sendPoll(from, 'Bunda mau tahu lebih lanjut tentang apa?', {
        options: [
            'Pengertian stunting',
            'Penyebab stunting',
            'Tanda-tanda stunting',
            'Dampak stunting',
            'Cara pencegahan',
            'Kembali ke menu utama',
        ],
        multiselect: false,
    });
}

async function sendKondisiMenu(from: string): Promise<void> {
    await botBaileys.sendPoll(from, 'Apa yang sedang Bunda perhatikan pada anak?', {
        options: [
            'Berat badan sulit naik',
            'Anak terlihat lebih pendek',
            'Nafsu makan kurang',
            'Sering sakit',
            'Kembali ke menu utama',
        ],
        multiselect: false,
    });
}

async function sendPeeltaanMenu(from: string): Promise<void> {
    await botBaileys.sendPoll(from, 'Apa yang paling Bunda rasakan saat ini?', {
        options: [
            'Khawatir anak stunting',
            'Capek dan stres',
            'Merasa kurang maksimal',
            'Bingung harus mulai dari mana',
            'Kembali ke menu utama',
        ],
        multiselect: false,
    });
}

async function sendLatihanMenu(from: string): Promise<void> {
    await botBaileys.sendPoll(from, '🌟 Latihan hari ini — Pilih 1 hal sederhana:', {
        options: [
            'Memberikan 1 makanan bergizi hari ini',
            'Mengajak anak makan bersama',
            'Memperhatikan kebiasaan makan anak',
            'Cek latihan saya',
            'Kembali ke menu utama',
        ],
        multiselect: false,
    });
}

botBaileys.on('auth_failure', async (error) => console.log("ERROR BOT: ", error));
botBaileys.on('qr', (qr) => console.log("NEW QR CODE: ", qr));
botBaileys.on('ready', async () => {
    console.log('✅ READY BOT - Connected to WhatsApp');
    console.log('🔄 Listening for incoming messages...');
    console.log(`📝 Message listeners registered: ${botBaileys.listenerCount('message')}`);
});

console.log('📝 Registering message event listener...');
botBaileys.on('message', async (message) => {
    console.log('\n🔔 MESSAGE EVENT TRIGGERED!');
    try {
        const userId = message.from;
        const command = (message.body || '').toLowerCase().trim();
        const userStep = getUserStep(userId);

        console.log(`\n${'='.repeat(50)}`);
        console.log(`📨 MESSAGE RECEIVED`);
        console.log(`   From: ${userId}`);
        console.log(`   Body: "${command}"`);
        console.log(`   Current Step: ${userStep}`);
        console.log(`${'='.repeat(50)}`);

        switch (userStep) {
        case 'welcome':
            await botBaileys.sendText(message.from, 'Halo, Bunda 🌸\nTerima kasih sudah bergabung. Di sini Bunda bisa berbagi dan belajar pelan-pelan tentang anak Bunda yang susah makan.\n\nTenang, Bunda tidak sendirian 🤍\n\nChatbot ini berisi edukasi singkat, tips harian, dan dukungan untuk Bunda. Apakah Bunda tertarik untuk menggunakan bot ini?');
            setUserStep(userId, 'initial_response');
            break;

        case 'initial_response':
            if (command.includes('ya') || command.includes('iya') || command.includes('tertarik') || command.includes('setuju')) {
                await botBaileys.sendText(message.from, 'Baik Bunda, sekarang pilih menu yang ingin Bunda pelajari ya 😊');
                await botBaileys.sendPoll(message.from, '🍽️ Menu Utama Edukasi Picky Eater', {
                    options: ['📚 Apa itu Picky Eater?', '🍎 Tips Harian', '🥗 Ide Menu & Resep', '💬 Konsultasi Ahli', '🔄 Mulai Lagi'],
                    multiselect: false
                });
                setUserStep(userId, 'main_menu');
            } else {
                await botBaileys.sendText(message.from, 'Terima kasih Bunda sudah mampir 🌸\nKapan-kapan kita ngobrol lagi ya. Semangat untuk Bunda dan si kecil! 💪');
                setUserStep(userId, 'end');
            }
            break;

        case 'main_menu':
            // Use flexible matching for menu options
            if (command.includes('picky eater') || command.includes('apa itu')) {
                await botBaileys.sendText(message.from, '📚 Apa itu Picky Eater?\n\nPicky eater adalah istilah untuk anak yang pilih-pilih makanan, Bunda. Biasanya mereka:\n\n✓ Hanya mau makan makanan tertentu saja\n✓ Menolak mencoba makanan baru\n✓ Sensitif terhadap tekstur, warna, atau bau makanan\n✓ Makan dalam porsi sangat sedikit\n\nTenang Bunda, ini fase normal pada anak usia 2-5 tahun kok 🤗');
                await botBaileys.sendPoll(message.from, 'Kenapa anak jadi picky eater?\n\nBeberapa penyebabnya:\n1️⃣ Fase perkembangan normal\n2️⃣ Ingin menunjukkan kemandirian\n3️⃣ Terlalu banyak camilan\n4️⃣ Suasana makan yang tegang\n5️⃣ Trauma terhadap makanan tertentu', {
                    options: ['Lanjut: Kapan harus khawatir?', 'Kembali ke menu utama'],
                    multiselect: false
                });
                setUserStep(userId, 'picky_info');
            } else if (command.includes('tips') || command.includes('harian')) {
                await botBaileys.sendPoll(message.from, '🍎 Tips Harian untuk Anak Susah Makan\n\nPilih tips yang ingin Bunda pelajari:', {
                    options: ['Cara membuat waktu makan menyenangkan', 'Trik mengenalkan makanan baru', 'Porsi dan jadwal makan yang tepat', 'Kembali ke menu utama'],
                    multiselect: false
                });
                setUserStep(userId, 'tips_menu');
            } else if (command.includes('menu') || command.includes('resep') || command.includes('ide')) {
                await botBaileys.sendPoll(message.from, '🥗 Ide Menu & Resep Sehat\n\nPilih kategori:', {
                    options: ['Menu untuk anak 1-3 tahun', 'Menu untuk anak 4-6 tahun', 'Resep camilan sehat', 'Kembali ke menu utama'],
                    multiselect: false
                });
                setUserStep(userId, 'recipe_menu');
            } else if (command.includes('konsultasi') || command.includes('ahli')) {
                await botBaileys.sendText(message.from, '💬 Konsultasi Ahli Gizi\n\nBunda ingin berkonsultasi langsung dengan ahli gizi?\n\nKami akan menghubungkan Bunda dengan tim ahli gizi kami melalui WhatsApp.\n\n📞 Hubungi: wa.me/087849194804\n\nBunda akan mendapat:\n✓ Konsultasi personal\n✓ Panduan menu khusus untuk anak\n✓ Follow-up perkembangan anak\n\nSilakan klik link di atas atau chat langsung ke nomor tersebut ya, Bunda 🤗');
                await botBaileys.sendPoll(message.from, '🍽️ Menu Utama Edukasi Picky Eater', {
                    options: ['📚 Apa itu Picky Eater?', '🍎 Tips Harian', '🥗 Ide Menu & Resep', '💬 Konsultasi Ahli', '🔄 Mulai Lagi'],
                    multiselect: false
                });
                setUserStep(userId, 'main_menu');
            } else if (command.includes('mulai lagi') || command.includes('reset') || command.includes('ulang')) {
                await botBaileys.sendText(message.from, 'Baik Bunda, kita mulai dari awal ya 🌸');
                setUserStep(userId, 'welcome');
            } else {
                // Unknown option - show menu again
                await botBaileys.sendText(message.from, 'Maaf Bunda, pilihan tidak dikenali. Silakan pilih dari menu berikut:');
                await botBaileys.sendPoll(message.from, '🍽️ Menu Utama Edukasi Picky Eater', {
                    options: ['📚 Apa itu Picky Eater?', '🍎 Tips Harian', '🥗 Ide Menu & Resep', '💬 Konsultasi Ahli', '🔄 Mulai Lagi'],
                    multiselect: false
                });
            }
            break;

        case 'picky_info':
            if (command.includes('lanjut') || command.includes('kapan') || command.includes('khawatir')) {
                await botBaileys.sendText(message.from, '⚠️ Kapan Harus Khawatir?\n\nSegera konsultasi ke dokter jika:\n\n🔴 Berat badan turun drastis\n🔴 Tidak mau makan sama sekali selama berhari-hari\n🔴 Muntah setiap kali makan\n🔴 Sangat rewel dan lemas\n🔴 Perkembangan terhambat\n\nTapi kalau anak masih aktif bermain dan tumbuh normal, Bunda nggak perlu terlalu khawatir ya 😊');
                await botBaileys.sendPoll(message.from, 'Mau lanjut ke mana, Bunda?', {
                    options: ['Tips mengatasi picky eater', 'Kembali ke menu utama'],
                    multiselect: false
                });
                setUserStep(userId, 'after_picky_info');
            } else if (command.includes('kembali') || command.includes('menu utama')) {
                await botBaileys.sendPoll(message.from, '🍽️ Menu Utama Edukasi Picky Eater', {
                    options: ['📚 Apa itu Picky Eater?', '🍎 Tips Harian', '🥗 Ide Menu & Resep', '💬 Konsultasi Ahli', '🔄 Mulai Lagi'],
                    multiselect: false
                });
                setUserStep(userId, 'main_menu');
            } else {
                await botBaileys.sendText(message.from, 'Silakan pilih opsi:');
                await botBaileys.sendPoll(message.from, 'Kenapa anak jadi picky eater?', {
                    options: ['Lanjut: Kapan harus khawatir?', 'Kembali ke menu utama'],
                    multiselect: false
                });
            }
            break;

        case 'after_picky_info':
            if (command.includes('tips') || command.includes('mengatasi')) {
                await botBaileys.sendPoll(message.from, '🍎 Tips Harian untuk Anak Susah Makan\n\nPilih tips yang ingin Bunda pelajari:', {
                    options: ['Cara membuat waktu makan menyenangkan', 'Trik mengenalkan makanan baru', 'Porsi dan jadwal makan yang tepat', 'Kembali ke menu utama'],
                    multiselect: false
                });
                setUserStep(userId, 'tips_menu');
            } else {
                await botBaileys.sendPoll(message.from, '🍽️ Menu Utama Edukasi Picky Eater', {
                    options: ['📚 Apa itu Picky Eater?', '🍎 Tips Harian', '🥗 Ide Menu & Resep', '💬 Konsultasi Ahli', '🔄 Mulai Lagi'],
                    multiselect: false
                });
                setUserStep(userId, 'main_menu');
            }
            break;

        case 'tips_menu':
            if (command.includes('waktu makan') || command.includes('menyenangkan')) {
                await botBaileys.sendText(message.from, '🎉 Cara Membuat Waktu Makan Menyenangkan\n\n1. Makan bersama keluarga 👨‍👩‍👧\n   Anak lebih semangat makan kalau ada teman\n\n2. Buat suasana rileks 😊\n   Jangan paksa atau marahi anak\n\n3. Libatkan anak 👧\n   Ajak belanja atau masak bersama\n\n4. Hias makanan lucu 🍱\n   Bentuk karakter atau wajah dari makanan\n\n5. Pakai piring favorit 🍽️\n   Piring dengan gambar kartun kesukaan anak\n\nIngat Bunda, proses lebih penting dari hasil! 💕');
                await botBaileys.sendPoll(message.from, 'Pilih tips lain:', {
                    options: ['Trik mengenalkan makanan baru', 'Porsi dan jadwal makan yang tepat', 'Kembali ke menu utama'],
                    multiselect: false
                });
            } else if (command.includes('trik') || command.includes('makanan baru') || command.includes('mengenalkan')) {
                await botBaileys.sendText(message.from, '🆕 Trik Mengenalkan Makanan Baru\n\n1. Sabar dan bertahap ⏰\n   Butuh 10-15x exposure untuk terima makanan baru\n\n2. Mulai dari sedikit 🥄\n   1-2 suap dulu, naikkan pelan-pelan\n\n3. Campur dengan favorit 🍝\n   Mix makanan baru dengan yang sudah disukai\n\n4. Jangan dipaksa ❌\n   Tawarkan, tapi hormati penolakan anak\n\n5. Jadilah contoh 👩\n   Makan makanan yang sama dengan antusias\n\n6. Puji usaha, bukan hasil 🌟\n   "Wah hebat mau coba!" lebih baik dari "Habis in ya!"\n\nSemangat ya Bunda! 💪');
                await botBaileys.sendPoll(message.from, 'Pilih tips lain:', {
                    options: ['Cara membuat waktu makan menyenangkan', 'Porsi dan jadwal makan yang tepat', 'Kembali ke menu utama'],
                    multiselect: false
                });
            } else if (command.includes('porsi') || command.includes('jadwal')) {
                await botBaileys.sendText(message.from, '⏰ Porsi dan Jadwal Makan yang Tepat\n\nJadwal:\n• Sarapan: 07.00-08.00\n• Snack pagi: 10.00\n• Makan siang: 12.00-13.00\n• Snack sore: 15.00\n• Makan malam: 18.00-19.00\n\nPorsi anak 1-3 tahun:\n• Nasi: 3-4 sdm\n• Lauk: 2-3 potong kecil\n• Sayur: 2-3 sdm\n\nPorsi anak 4-6 tahun:\n• Nasi: 5-6 sdm\n• Lauk: 3-4 potong\n• Sayur: 3-4 sdm\n\n💡 Tips:\n✓ Jarak antar makan 2-3 jam\n✓ Batasi waktu makan 20-30 menit\n✓ Hindari camilan 1 jam sebelum makan\n\nPorsi kecil tapi sering lebih baik daripada porsi besar sekali makan ya Bunda! 😊');
                await botBaileys.sendPoll(message.from, 'Pilih tips lain:', {
                    options: ['Cara membuat waktu makan menyenangkan', 'Trik mengenalkan makanan baru', 'Kembali ke menu utama'],
                    multiselect: false
                });
            } else if (command.includes('kembali') || command.includes('menu utama')) {
                await botBaileys.sendPoll(message.from, '🍽️ Menu Utama Edukasi Picky Eater', {
                    options: ['📚 Apa itu Picky Eater?', '🍎 Tips Harian', '🥗 Ide Menu & Resep', '💬 Konsultasi Ahli', '🔄 Mulai Lagi'],
                    multiselect: false
                });
                setUserStep(userId, 'main_menu');
            } else {
                await botBaileys.sendPoll(message.from, '🍎 Tips Harian untuk Anak Susah Makan\n\nPilih tips yang ingin Bunda pelajari:', {
                    options: ['Cara membuat waktu makan menyenangkan', 'Trik mengenalkan makanan baru', 'Porsi dan jadwal makan yang tepat', 'Kembali ke menu utama'],
                    multiselect: false
                });
            }
            break;

        case 'recipe_menu':
            if (command.includes('1-3') || command.includes('1 sampai 3')) {
                await botBaileys.sendText(message.from, '🍱 Menu untuk Anak 1-3 Tahun\n\nMenu Pagi:\n• Bubur ayam sayur\n• Nasi tim ikan\n• Oatmeal pisang\n\nMenu Siang:\n• Nasi + ayam suwir + wortel rebus\n• Kentang pure + telur dadar\n• Pasta bolognese mini\n\nMenu Malam:\n• Nasi + ikan kukus + bayam\n• Sup ayam wortel\n• Nasi tim tahu tempe\n\n💡 Tips Penyajian:\n✓ Potong kecil-kecil (finger food)\n✓ Tekstur lembut, mudah dikunyah\n✓ Variasi warna menarik\n✓ Hindari bumbu pedas/terlalu asin\n\nMau lihat resep detail? Ketik nama menu yang Bunda inginkan! 😊');
                await botBaileys.sendPoll(message.from, 'Pilih menu lain:', {
                    options: ['Menu untuk anak 4-6 tahun', 'Resep camilan sehat', 'Kembali ke menu utama'],
                    multiselect: false
                });
            } else if (command.includes('4-6') || command.includes('4 sampai 6')) {
                await botBaileys.sendText(message.from, '🍽️ Menu untuk Anak 4-6 Tahun\n\nMenu Pagi:\n• Nasi goreng telur sayur\n• Roti telur + susu\n• Pancake pisang\n\nMenu Siang:\n• Nasi + ayam goreng tepung + sayur asem\n• Mie goreng sayuran\n• Nasi uduk + ayam + tempe\n\nMenu Malam:\n• Nasi + sop daging wortel\n• Nasi + pepes ikan + tumis kangkung\n• Pizza mini homemade\n\n💡 Tips:\n✓ Porsi lebih besar dari usia 1-3 tahun\n✓ Tekstur bisa lebih padat\n✓ Ajak anak pilih menu\n✓ Variasi cara masak (goreng, kukus, panggang)\n\nButuh resep spesifik? Ketik nama menunya ya Bunda! 🥰');
                await botBaileys.sendPoll(message.from, 'Pilih menu lain:', {
                    options: ['Menu untuk anak 1-3 tahun', 'Resep camilan sehat', 'Kembali ke menu utama'],
                    multiselect: false
                });
            } else if (command.includes('camilan') || command.includes('snack')) {
                await botBaileys.sendText(message.from, '🍪 Resep Camilan Sehat\n\n1. Nugget Sayur Homemade\n• 100g ayam cincang\n• 50g wortel parut\n• 50g brokoli cincang\n• 1 butir telur\n• Tepung roti\n→ Campur, bentuk, kukus, celup telur, gulingkan tepung, goreng\n\n2. Pancake Pisang Oat\n• 2 buah pisang matang\n• 100g oat\n• 1 butir telur\n• 100ml susu\n→ Blender semua, tuang di teflon, masak\n\n3. Puding Buah\n• 1 bungkus agar-agar plain\n• 200ml susu\n• Potongan buah (mangga, stroberi)\n→ Masak agar, masukkan buah, dinginkan\n\n4. Bola-bola Kurma\n• 100g kurma (buang biji)\n• 50g kacang mete\n• 2 sdm madu\n→ Blender, bentuk bulat, guling coklat bubuk\n\nCamilan sehat, Bunda tenang, anak happy! 😋');
                await botBaileys.sendPoll(message.from, 'Pilih menu lain:', {
                    options: ['Menu untuk anak 1-3 tahun', 'Menu untuk anak 4-6 tahun', 'Kembali ke menu utama'],
                    multiselect: false
                });
            } else if (command.includes('kembali') || command.includes('menu utama')) {
                await botBaileys.sendPoll(message.from, '🍽️ Menu Utama Edukasi Picky Eater', {
                    options: ['📚 Apa itu Picky Eater?', '🍎 Tips Harian', '🥗 Ide Menu & Resep', '💬 Konsultasi Ahli', '🔄 Mulai Lagi'],
                    multiselect: false
                });
                setUserStep(userId, 'main_menu');
            } else {
                await botBaileys.sendPoll(message.from, '🥗 Ide Menu & Resep Sehat\n\nPilih kategori:', {
                    options: ['Menu untuk anak 1-3 tahun', 'Menu untuk anak 4-6 tahun', 'Resep camilan sehat', 'Kembali ke menu utama'],
                    multiselect: false
                });
            }
            break;

        case 'end':
            // Any message triggers welcome
            await botBaileys.sendText(message.from, 'Halo, Bunda 🌸\nTerima kasih sudah bergabung kembali. Apakah Bunda ingin melanjutkan belajar tentang anak Bunda yang susah makan?');
            setUserStep(userId, 'initial_response');
            break;

        default:
            await botBaileys.sendText(message.from, 'Maaf Bunda, saya kurang paham. Silakan pilih dari menu yang tersedia ya 🙏');
            break;
    }
    } catch (error) {
        console.error('Error processing message:', error);
        // Optionally notify user of error
        try {
            await botBaileys.sendText(message.from, 'Maaf Bunda, terjadi kesalahan. Silakan coba lagi dalam beberapa saat 🙏');
        } catch (sendError) {
            console.error('Failed to send error message:', sendError);
        }
    }
});

console.log('🚀 Bot starting - EXACT COPY of working example structure');
