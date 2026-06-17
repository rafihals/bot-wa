export {};
const { BaileysClass } = require('./baileys.js');
require('./server.js');

const botBaileys = new BaileysClass({});

// ─── Per-user state management ────────────────────────────────────────────────
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

// ─── Self-Efficacy Booster messages ───────────────────────────────────────────
const BOOSTER_MESSAGES = [
    'Setiap usaha kecil Bunda sangat berarti untuk anak ✨',
    'Bunda mampu merawat anak dengan baik. Terus melangkah pelan-pelan ya Bunda! 💪',
    'Bunda sudah melakukan yang terbaik hari ini 💛',
    'Perubahan kecil tetap berarti. Bunda luar biasa! 🌸',
    'Bunda tidak harus sempurna, cukup konsisten 🌱',
    'Bunda mampu melalui ini pelan-pelan. Tetap semangat! 💛',
    'Kepercayaan diri Bunda adalah kekuatan terbesar untuk tumbuh kembang anak 🤍',
];

function getRandomBooster(): string {
    return BOOSTER_MESSAGES[Math.floor(Math.random() * BOOSTER_MESSAGES.length)];
}

// ─── Helpers: Kirim Menu ───────────────────────────────────────────────────────
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
    await botBaileys.sendPoll(from, '📚 Bunda mau tahu lebih lanjut tentang apa?', {
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
    await botBaileys.sendPoll(from, '👶 Apa yang sedang Bunda perhatikan pada anak?', {
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

async function sendPerasaanMenu(from: string): Promise<void> {
    await botBaileys.sendPoll(from, '💬 Bunda, apa yang sedang Bunda rasakan hari ini?', {
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
    await botBaileys.sendPoll(from, '🌱 Latihan hari ini — Pilih 1 hal sederhana yang bisa Bunda coba:', {
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

async function sendSelfEfficacyCheck(from: string): Promise<void> {
    await botBaileys.sendPoll(from,
        '🔍 Self-Efficacy Check\n\nSetelah berinteraksi dengan bot ini, bagaimana perasaan Bunda tentang kemampuan merawat anak?',
        {
            options: [
                'Lebih percaya diri',
                'Sama saja',
                'Masih bingung',
            ],
            multiselect: false,
        }
    );
}

async function sendNavigasiSetelahKonten(from: string): Promise<void> {
    await botBaileys.sendPoll(from, 'Bunda mau lanjut ke mana?', {
        options: [
            'Baca topik lain',
            'Kembali ke menu utama',
        ],
        multiselect: false,
    });
}

// ─── Keyword Detection (navigasi global) ─────────────────────────────────────
async function handleGlobalKeyword(
    userId: string,
    command: string
): Promise<boolean> {
    // Booster / semangat
    if (command === 'semangat' || command === 'booster' || command.includes('semangat') && command.length < 20) {
        await botBaileys.sendText(userId, getRandomBooster());
        return true;
    }
    // Self-efficacy check
    if (command.includes('self-efficacy') || command.includes('self efficacy') || command === 'efficacy') {
        await sendSelfEfficacyCheck(userId);
        return true;
    }
    // Reset ke menu utama
    if (
        command === 'menu' ||
        command === 'menu utama' ||
        command.includes('mulai lagi') ||
        command === 'reset' ||
        command === 'ulang'
    ) {
        await botBaileys.sendText(userId, 'Baik Bunda, kita kembali ke menu utama ya 🌸');
        await sendMainMenu(userId);
        setUserStep(userId, 'main_menu');
        return true;
    }
    // Shortcut langsung ke sub-menu
    if (command.includes('stunting') || command === 'apa itu') {
        await botBaileys.sendText(userId, 'Semakin Bunda memahami kondisi anak, semakin Bunda mampu mengambil keputusan yang tepat. 💪');
        await sendStuntingSubmenu(userId);
        setUserStep(userId, 'stunting_menu');
        return true;
    }
    if (command.includes('kondisi') || command === 'anak saya') {
        await botBaileys.sendText(userId, 'Yuk Bunda, kita lihat kondisi anak dengan pelan-pelan ya. Bunda tidak sendirian, banyak ibu mengalami hal yang sama. 🤍');
        await sendKondisiMenu(userId);
        setUserStep(userId, 'kondisi_menu');
        return true;
    }
    if (
        command.includes('perasaan') ||
        command.includes('stres') ||
        command.includes('stress') ||
        command === 'capek' ||
        command === 'khawatir'
    ) {
        await sendPerasaanMenu(userId);
        setUserStep(userId, 'perasaan_menu');
        return true;
    }
    if (command.includes('latihan') || command === 'tips') {
        await sendLatihanMenu(userId);
        setUserStep(userId, 'latihan_menu');
        return true;
    }
    if (command === 'bantuan' || command.includes('bantuan langsung')) {
        await botBaileys.sendText(
            userId,
            'Jika Bunda merasa butuh bantuan lebih lanjut, itu bukan tanda gagal. Justru itu langkah yang sangat bijak. 🤍\n\n📞 *Hubungi kami di:*\n0878-4919-4804\n\nKami siap membantu Bunda kapan saja.'
        );
        await sendMainMenu(userId);
        setUserStep(userId, 'main_menu');
        return true;
    }
    return false;
}

// ─── Bot Events ───────────────────────────────────────────────────────────────
botBaileys.on('auth_failure', async (error: any) => console.log('ERROR BOT: ', error));
botBaileys.on('qr', (qr: any) => console.log('NEW QR CODE: ', qr));
botBaileys.on('ready', async () => {
    console.log('✅ READY BOT - Connected to WhatsApp');
    console.log('🔄 Listening for incoming messages...');
    console.log(`📝 Message listeners registered: ${botBaileys.listenerCount('message')}`);
});

// ─── Message Handler ──────────────────────────────────────────────────────────
console.log('📝 Registering message event listener...');
botBaileys.on('message', async (message: any) => {
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

        // Keyword global (semangat, self-efficacy, menu, dst.) — berlaku di semua step kecuali welcome & consent
        if (userStep !== 'welcome' && userStep !== 'consent') {
            const handled = await handleGlobalKeyword(userId, command);
            if (handled) return;
        }

        switch (userStep) {

            // ── ONBOARDING ───────────────────────────────────────────────────
            case 'welcome':
                await botBaileys.sendText(
                    message.from,
                    'Halo, Bunda 🌸\n\nTerima kasih sudah bergabung. Di sini Bunda bisa belajar tentang tumbuh kembang anak, sekaligus menemukan cara agar lebih percaya diri dalam merawat anak dan tidak merasa sendirian.\n\nYuk kita jalani pelan-pelan bersama. 🤍'
                );
                await botBaileys.sendPoll(message.from, 'Apakah Bunda bersedia menggunakan bot edukasi stunting ini?', {
                    options: ['✅ Ya, saya setuju', '❌ Keluar'],
                    multiselect: false,
                });
                setUserStep(userId, 'consent');
                break;

            case 'consent':
                if (command.includes('ya') || command.includes('setuju') || command.includes('iya')) {
                    await botBaileys.sendText(
                        message.from,
                        'Alhamdulillah, Bunda sudah mengambil langkah yang tepat. 🌸\n\nSelamat datang! Mari kita mulai bersama.'
                    );
                    await sendMainMenu(message.from);
                    setUserStep(userId, 'main_menu');
                } else if (command.includes('keluar') || command.includes('tidak') || command.includes('gak')) {
                    await botBaileys.sendText(
                        message.from,
                        'Baik Bunda, terima kasih sudah mampir. 🌸\nKapan pun Bunda siap, kirim pesan lagi ya. Kami selalu di sini untuk Bunda. 💛'
                    );
                    setUserStep(userId, 'end');
                } else {
                    await botBaileys.sendText(message.from, 'Silakan pilih salah satu opsi di bawah ini, Bunda 🙏');
                    await botBaileys.sendPoll(message.from, 'Apakah Bunda bersedia menggunakan bot edukasi stunting ini?', {
                        options: ['✅ Ya, saya setuju', '❌ Keluar'],
                        multiselect: false,
                    });
                }
                break;

            // ── MAIN MENU ────────────────────────────────────────────────────
            case 'main_menu':
                if (command.includes('apa itu stunting') || command.includes('stunting')) {
                    await botBaileys.sendText(
                        message.from,
                        'Semakin Bunda memahami kondisi anak, semakin Bunda mampu mengambil keputusan yang tepat. 💪'
                    );
                    await sendStuntingSubmenu(message.from);
                    setUserStep(userId, 'stunting_menu');
                } else if (command.includes('kondisi anak') || command.includes('kondisi')) {
                    await botBaileys.sendText(
                        message.from,
                        'Yuk Bunda, kita lihat kondisi anak dengan pelan-pelan ya. Bunda tidak sendirian, banyak ibu mengalami hal yang sama. 🤍'
                    );
                    await sendKondisiMenu(message.from);
                    setUserStep(userId, 'kondisi_menu');
                } else if (command.includes('perasaan') || command.includes('hari ini')) {
                    await sendPerasaanMenu(message.from);
                    setUserStep(userId, 'perasaan_menu');
                } else if (command.includes('latihan') || command.includes('tips')) {
                    await sendLatihanMenu(message.from);
                    setUserStep(userId, 'latihan_menu');
                } else if (command.includes('bantuan')) {
                    await botBaileys.sendText(
                        message.from,
                        'Jika Bunda merasa butuh bantuan lebih lanjut, itu bukan tanda gagal. Justru itu langkah yang sangat bijak. 🤍\n\n📞 *Hubungi kami di:*\n0878-4919-4804\n\nKami siap membantu Bunda kapan saja.'
                    );
                    await sendMainMenu(message.from);
                } else {
                    await botBaileys.sendText(message.from, 'Silakan pilih salah satu menu di bawah ini, Bunda 🙏');
                    await sendMainMenu(message.from);
                }
                break;

            // ── MENU 1: STUNTING ─────────────────────────────────────────────
            case 'stunting_menu':
                if (command.includes('pengertian')) {
                    await botBaileys.sendText(
                        message.from,
                        '📖 *Pengertian Stunting*\n\nStunting adalah kondisi gagal tumbuh pada anak balita akibat kekurangan gizi kronis dan infeksi berulang, terutama pada 1.000 hari pertama kehidupan (dari kehamilan sampai usia 2 tahun).\n\n*Dampak pada otak:*\nStunting tidak hanya mempengaruhi tinggi badan, tetapi juga perkembangan otak anak. Anak stunting berisiko memiliki kemampuan belajar dan produktivitas yang lebih rendah di masa depan.\n\n*Kabar baiknya:*\nStunting dapat dicegah! Dengan nutrisi yang tepat dan stimulasi yang baik sejak dini, Bunda bisa melindungi tumbuh kembang anak. 💪'
                    );
                    await sendNavigasiSetelahKonten(message.from);
                    setUserStep(userId, 'stunting_navigasi');
                } else if (command.includes('penyebab')) {
                    await botBaileys.sendText(
                        message.from,
                        '🔍 *Penyebab Stunting*\n\nAda 5 penyebab utama yang perlu Bunda ketahui:\n\n1️⃣ *Kurang gizi* — Asupan protein, zat besi, zinc, dan vitamin A yang tidak cukup.\n\n2️⃣ *Pola makan yang buruk* — Pemberian MPASI yang terlambat atau tidak bergizi.\n\n3️⃣ *Infeksi berulang* — Diare dan ISPA yang sering membuat tubuh tidak bisa menyerap nutrisi optimal.\n\n4️⃣ *Sanitasi dan kebersihan* — Air minum yang tidak bersih dan lingkungan yang tidak higienis.\n\n5️⃣ *Akses kesehatan terbatas* — Kurang kontrol ke posyandu atau puskesmas.\n\nMemahami penyebab adalah langkah pertama pencegahan, Bunda! 🌱'
                    );
                    await sendNavigasiSetelahKonten(message.from);
                    setUserStep(userId, 'stunting_navigasi');
                } else if (command.includes('tanda')) {
                    await botBaileys.sendText(
                        message.from,
                        '⚠️ *Tanda-Tanda Stunting*\n\nAda 6 tanda awal yang perlu Bunda perhatikan:\n\n1. Tinggi badan anak di bawah rata-rata untuk usianya\n2. Berat badan sulit naik meski sudah makan cukup\n3. Pertumbuhan gigi terlambat\n4. Kemampuan bicara dan motorik lebih lambat\n5. Wajah tampak lebih muda dari usianya\n6. Anak cenderung lebih pendiam dan kurang aktif\n\n📋 *Cara cek di Posyandu:*\nGunakan KMS (Kartu Menuju Sehat). Jika garis pertumbuhan anak berada di bawah garis merah, segera konsultasi ke dokter atau ahli gizi ya, Bunda.'
                    );
                    await sendNavigasiSetelahKonten(message.from);
                    setUserStep(userId, 'stunting_navigasi');
                } else if (command.includes('dampak')) {
                    await botBaileys.sendText(
                        message.from,
                        '📉 *Dampak Stunting*\n\n*Jangka pendek:*\n• Daya tahan tubuh lemah, mudah sakit\n• Perkembangan motorik dan kognitif terlambat\n• Kemampuan belajar di sekolah terganggu\n\n*Jangka panjang:*\n• Produktivitas kerja lebih rendah saat dewasa\n• Risiko penyakit tidak menular (diabetes, hipertensi) lebih tinggi\n• Pada anak perempuan: berisiko melahirkan bayi stunting juga\n\nMengetahui dampak ini bukan untuk menakut-nakuti Bunda, tapi agar kita makin semangat dalam pencegahan. Setiap langkah kecil Bunda sangat berarti! 💪'
                    );
                    await sendNavigasiSetelahKonten(message.from);
                    setUserStep(userId, 'stunting_navigasi');
                } else if (command.includes('pencegahan') || command.includes('cara')) {
                    await botBaileys.sendText(
                        message.from,
                        '✅ *Cara Pencegahan Stunting*\n\n6 langkah konkret yang bisa Bunda mulai sekarang:\n\n1️⃣ *ASI Eksklusif 6 bulan* — Berikan ASI saja tanpa tambahan apapun hingga usia 6 bulan.\n\n2️⃣ *MPASI bergizi* — Mulai usia 6 bulan, berikan makanan padat bergizi: telur, ikan, daging, tempe, tahu, sayur, buah.\n\n3️⃣ *Rutin ke Posyandu* — Pantau tumbuh kembang anak setiap bulan.\n\n4️⃣ *Jaga kebersihan* — Cuci tangan sebelum menyiapkan makanan dan setelah dari toilet.\n\n5️⃣ *Air bersih* — Pastikan air minum sudah dimasak atau menggunakan air bersih.\n\n6️⃣ *Stimulasi dan bermain* — Ajak anak bicara, bermain, dan membaca sejak dini untuk mendukung perkembangan otak.\n\nBunda sudah melangkah ke arah yang benar! 🌟'
                    );
                    await sendNavigasiSetelahKonten(message.from);
                    setUserStep(userId, 'stunting_navigasi');
                } else if (command.includes('kembali') || command.includes('menu utama')) {
                    await sendMainMenu(message.from);
                    setUserStep(userId, 'main_menu');
                } else {
                    await botBaileys.sendText(message.from, 'Silakan pilih topik yang ingin Bunda pelajari 🙏');
                    await sendStuntingSubmenu(message.from);
                }
                break;

            case 'stunting_navigasi':
                if (command.includes('baca topik') || command.includes('topik lain') || command.includes('lain')) {
                    await sendStuntingSubmenu(message.from);
                    setUserStep(userId, 'stunting_menu');
                } else {
                    await sendMainMenu(message.from);
                    setUserStep(userId, 'main_menu');
                }
                break;

            // ── MENU 2: KONDISI ANAK ─────────────────────────────────────────
            case 'kondisi_menu':
                if (command.includes('berat badan')) {
                    await botBaileys.sendText(
                        message.from,
                        '💙 *Berat Badan Sulit Naik*\n\nBunda tidak sendirian, ini adalah kekhawatiran yang banyak ibu rasakan. 🤍\n\n*Mengapa ini bisa terjadi?*\nBerat badan sulit naik biasanya disebabkan oleh: asupan kalori yang kurang mencukupi kebutuhan tumbuh kembang, infeksi berulang yang menguras energi tubuh, atau kurangnya variasi makanan bergizi.\n\n*Satu langkah kecil yang bisa Bunda coba hari ini:*\nTambahkan 1 sumber protein ke menu makan anak — misalnya setengah butir telur rebus di sarapan. Sederhana, tapi dampaknya nyata.\n\nLangkah kecil Bunda hari ini sangat berarti untuk tumbuh kembang anak. 🌱'
                    );
                    await sendNavigasiSetelahKonten(message.from);
                    setUserStep(userId, 'kondisi_navigasi');
                } else if (command.includes('lebih pendek') || command.includes('pendek')) {
                    await botBaileys.sendText(
                        message.from,
                        '💙 *Anak Terlihat Lebih Pendek*\n\nBunda tidak sendirian, banyak ibu juga memperhatikan hal ini pada anaknya. 🤍\n\n*Mengapa ini bisa terjadi?*\nTinggi badan yang kurang berkembang bisa dipengaruhi oleh kekurangan gizi kronis terutama protein dan zinc, kurangnya stimulasi gerak, atau faktor genetik dikombinasikan dengan kurangnya nutrisi.\n\n*Satu langkah kecil yang bisa Bunda coba hari ini:*\nRutin ukur tinggi badan anak setiap bulan di Posyandu. Bawa buku KMS dan tanyakan ke kader apakah pertumbuhan anak sudah sesuai jalurnya.\n\nLangkah kecil Bunda hari ini sangat berarti untuk tumbuh kembang anak. 🌱'
                    );
                    await sendNavigasiSetelahKonten(message.from);
                    setUserStep(userId, 'kondisi_navigasi');
                } else if (command.includes('nafsu makan') || command.includes('nafsu')) {
                    await botBaileys.sendText(
                        message.from,
                        '💙 *Nafsu Makan Kurang*\n\nBunda tidak sendirian, ini adalah tantangan yang umum dihadapi oleh banyak ibu. 🤍\n\n*Mengapa ini bisa terjadi?*\nNafsu makan yang kurang bisa disebabkan oleh: jadwal makan yang tidak teratur, terlalu banyak camilan di luar waktu makan, suasana makan yang tegang, atau anak sedang dalam fase perkembangan normal.\n\n*Satu langkah kecil yang bisa Bunda coba hari ini:*\nCoba matikan TV atau singkirkan HP saat waktu makan. Duduk bersama anak dan jadikan momen makan sebagai waktu hangat keluarga.\n\nLangkah kecil Bunda hari ini sangat berarti untuk tumbuh kembang anak. 🌱'
                    );
                    await sendNavigasiSetelahKonten(message.from);
                    setUserStep(userId, 'kondisi_navigasi');
                } else if (command.includes('sering sakit') || command.includes('sakit')) {
                    await botBaileys.sendText(
                        message.from,
                        '💙 *Anak Sering Sakit*\n\nBunda tidak sendirian, melihat anak sering sakit memang menguras hati dan tenaga. 🤍\n\n*Mengapa ini bisa terjadi?*\nAnak yang sering sakit biasanya memiliki daya tahan tubuh yang belum optimal, bisa karena: kekurangan vitamin dan mineral (terutama vitamin C, zinc, dan zat besi), sanitasi lingkungan yang kurang bersih, atau kurang ASI di usia awal.\n\n*Satu langkah kecil yang bisa Bunda coba hari ini:*\nPastikan anak mencuci tangan dengan sabun sebelum makan dan setelah bermain. Kebiasaan sederhana ini sangat efektif mencegah infeksi.\n\nLangkah kecil Bunda hari ini sangat berarti untuk tumbuh kembang anak. 🌱'
                    );
                    await sendNavigasiSetelahKonten(message.from);
                    setUserStep(userId, 'kondisi_navigasi');
                } else if (command.includes('kembali') || command.includes('menu utama')) {
                    await sendMainMenu(message.from);
                    setUserStep(userId, 'main_menu');
                } else {
                    await botBaileys.sendText(message.from, 'Silakan pilih kondisi yang ingin Bunda diskusikan 🙏');
                    await sendKondisiMenu(message.from);
                }
                break;

            case 'kondisi_navigasi':
                if (command.includes('baca topik') || command.includes('topik lain') || command.includes('lain') || command.includes('kondisi lain')) {
                    await sendKondisiMenu(message.from);
                    setUserStep(userId, 'kondisi_menu');
                } else {
                    await sendMainMenu(message.from);
                    setUserStep(userId, 'main_menu');
                }
                break;

            // ── MENU 3: PERASAAN ─────────────────────────────────────────────
            case 'perasaan_menu':
                if (command.includes('khawatir')) {
                    setUserContext(userId, 'perasaan', 'khawatir');
                    await botBaileys.sendText(
                        message.from,
                        '💜 *Rasa khawatir itu tanda cinta Bunda yang luar biasa.*\n\nPerasaan khawatir tentang kondisi anak itu sangat wajar dan manusiawi. Banyak ibu merasakannya — Bunda tidak sendirian.\n\nKekhawatiran yang Bunda rasakan justru adalah tanda bahwa Bunda adalah ibu yang penuh perhatian dan peduli terhadap tumbuh kembang anaknya.\n\n*Reframing:* Bunda yang khawatir adalah Bunda yang peduli. Dan kepedulian itu sudah menjadi modal terbesar untuk perubahan.\n\n💡 *Strategi coping untuk saat ini:*\nTarik napas dalam-dalam 3 kali. Lalu tuliskan satu hal kecil yang sudah Bunda lakukan dengan baik untuk anak hari ini. Apapun itu, no matter how small.\n\nBunda tetap ibu yang sedang berusaha dan itu sangat berarti. 🌸'
                    );
                    await sendNavigasiPeelbatanMenu(message.from);
                    setUserStep(userId, 'perasaan_navigasi');
                } else if (command.includes('capek') || command.includes('stres') || command.includes('stress')) {
                    setUserContext(userId, 'perasaan', 'capek');
                    await botBaileys.sendText(
                        message.from,
                        '💜 *Perasaan capek dan stres itu sangat wajar, Bunda.*\n\nMerawat anak sambil menghadapi kekhawatiran tentang stunting adalah pekerjaan yang luar biasa berat. Banyak ibu juga merasakan hal yang sama — Bunda tidak sendirian.\n\nCapek dan stres itu bukan tanda bahwa Bunda gagal. Justru itu tanda bahwa Bunda sudah bekerja keras dan berusaha dengan sepenuh hati.\n\n*Reframing:* Bunda tetap ibu yang sedang berusaha. Dan usaha itu, sekecil apapun, sangat berarti bagi anak.\n\n💡 *Strategi coping untuk saat ini:*\nCoba teknik "5-4-3-2-1":\n• Lihat 5 benda di sekitar Bunda\n• Sentuh 4 benda berbeda tekstur\n• Dengarkan 3 suara\n• Cium 2 aroma\n• Rasakan 1 rasa\n\nTeknik ini membantu Bunda kembali ke momen sekarang dan meredakan stres. 🌿'
                    );
                    await sendNavigasiPeelbatanMenu(message.from);
                    setUserStep(userId, 'perasaan_navigasi');
                } else if (command.includes('kurang maksimal') || command.includes('maksimal')) {
                    setUserContext(userId, 'perasaan', 'kurang_maksimal');
                    await botBaileys.sendText(
                        message.from,
                        '💜 *Perasaan merasa kurang maksimal itu sangat manusiawi, Bunda.*\n\nHampir setiap ibu pernah merasa tidak cukup baik untuk anaknya. Bunda tidak sendirian dalam perasaan ini.\n\nPerasaan itu hadir karena Bunda memiliki standar tinggi untuk diri sendiri — dan itu adalah kualitas seorang ibu yang luar biasa.\n\n*Reframing:* Tidak ada ibu yang sempurna. Yang ada adalah ibu yang terus berusaha dan belajar. Dan Bunda sudah melakukan keduanya hari ini dengan membuka bot ini.\n\n💡 *Strategi coping untuk saat ini:*\nTuliskan (atau pikirkan) 3 hal yang sudah Bunda lakukan dengan baik untuk anak minggu ini. Seringkali kita lupa betapa banyak yang sudah kita lakukan.\n\nSetiap usaha kecil Bunda sangat berarti. 🌟'
                    );
                    await sendNavigasiPeelbatanMenu(message.from);
                    setUserStep(userId, 'perasaan_navigasi');
                } else if (command.includes('bingung') || command.includes('mulai dari mana')) {
                    setUserContext(userId, 'perasaan', 'bingung');
                    await botBaileys.sendText(
                        message.from,
                        '💜 *Rasa bingung itu wajar sekali, Bunda.*\n\nInformasi tentang stunting memang banyak dan kadang membingungkan. Bunda tidak sendirian — banyak ibu juga merasa kewalahan.\n\nRasa bingung itu justru menunjukkan bahwa Bunda serius ingin melakukan hal yang benar untuk anak. Itu sangat positif.\n\n*Reframing:* Bunda tidak harus mengetahui segalanya sekaligus. Cukup ambil satu langkah kecil hari ini.\n\n💡 *Strategi coping — Mulai dari yang paling sederhana:*\nHari ini, cukup satu hal: pastikan anak mendapat 1 makanan sumber protein (telur, tempe, tahu, atau ikan). Hanya itu. Besok, tambahkan satu hal lagi.\n\nPerjalanan seribu mil dimulai dari satu langkah. Bunda sudah mulai! 🚶‍♀️💛'
                    );
                    await sendNavigasiPeelbatanMenu(message.from);
                    setUserStep(userId, 'perasaan_navigasi');
                } else if (command.includes('kembali') || command.includes('menu utama')) {
                    await sendMainMenu(message.from);
                    setUserStep(userId, 'main_menu');
                } else {
                    await sendPerasaanMenu(message.from);
                }
                break;

            case 'perasaan_navigasi':
                if (command.includes('stress check') || command.includes('cek stres') || command.includes('check-in') || command.includes('cek kondisi')) {
                    await botBaileys.sendPoll(message.from, '🌡️ *Stress Check-in*\n\nSeberapa berat beban yang Bunda rasakan saat ini?', {
                        options: [
                            '😊 Tenang',
                            '😐 Sedikit lelah',
                            '😔 Sangat stres',
                        ],
                        multiselect: false,
                    });
                    setUserStep(userId, 'stress_checkin');
                } else if (command.includes('topik lain') || command.includes('perasaan lain') || command.includes('lain')) {
                    await sendPerasaanMenu(message.from);
                    setUserStep(userId, 'perasaan_menu');
                } else {
                    await sendMainMenu(message.from);
                    setUserStep(userId, 'main_menu');
                }
                break;

            case 'stress_checkin':
                if (command.includes('tenang')) {
                    await botBaileys.sendText(
                        message.from,
                        '😊 Alhamdulillah, Bunda! Kondisi yang tenang adalah modal yang luar biasa untuk merawat anak dengan optimal.\n\nPertahankan ya, Bunda. Bunda luar biasa! 🌸'
                    );
                    await sendMainMenu(message.from);
                    setUserStep(userId, 'main_menu');
                } else if (command.includes('sedikit lelah') || command.includes('lelah')) {
                    await botBaileys.sendText(
                        message.from,
                        '😐 Sedikit lelah itu wajar, Bunda. Istirahat sejenak adalah investasi agar Bunda bisa terus merawat anak dengan baik.\n\n💡 *Tips ringan:* Luangkan 10 menit untuk diri sendiri — duduk tenang, minum teh hangat, atau tarik napas dalam. Bunda berhak merawat diri juga. 🌿'
                    );
                    await sendMainMenu(message.from);
                    setUserStep(userId, 'main_menu');
                } else if (command.includes('sangat stres') || command.includes('sangat') || command.includes('stres berat')) {
                    await botBaileys.sendText(
                        message.from,
                        '😔 *Bunda, perasaan Bunda sangat valid. Terima kasih sudah jujur.*\n\nMerasakan stres yang berat bukan tanda kelemahan — itu tanda bahwa Bunda manusia yang butuh dukungan. Dan mencari dukungan adalah langkah yang sangat berani.\n\n*🆘 5 Langkah Coping Darurat:*\n\n1️⃣ *Berhenti sejenak* — Letakkan semua pekerjaan. Duduk atau berbaring.\n\n2️⃣ *Pernapasan kotak (4-4-4-4):*\n   • Hirup 4 hitungan\n   • Tahan 4 hitungan\n   • Hembuskan 4 hitungan\n   • Tahan 4 hitungan\n   Ulangi 3 kali.\n\n3️⃣ *Minum segelas air* — Sederhana tapi membantu tubuh dan pikiran kembali fokus.\n\n4️⃣ *Hubungi seseorang* — Ceritakan perasaan Bunda ke orang yang dipercaya.\n\n5️⃣ *Ingat satu hal kecil yang berarti* — Senyum anak, pelukan anak — itu cukup untuk saat ini.\n\n📞 *Jika Bunda butuh bantuan profesional:*\nHubungi kami di *0878-4919-4804*\n\nBunda tidak harus menanggung semua ini sendirian. 💙'
                    );
                    await sendMainMenu(message.from);
                    setUserStep(userId, 'main_menu');
                } else {
                    await botBaileys.sendPoll(message.from, '🌡️ *Stress Check-in*\n\nSeberapa berat beban yang Bunda rasakan saat ini?', {
                        options: [
                            '😊 Tenang',
                            '😐 Sedikit lelah',
                            '😔 Sangat stres',
                        ],
                        multiselect: false,
                    });
                }
                break;

            // ── MENU 4: LATIHAN ──────────────────────────────────────────────
            case 'latihan_menu':
                if (command.includes('makanan bergizi') || command.includes('bergizi')) {
                    setUserContext(userId, 'latihan', 'makanan_bergizi');
                    await botBaileys.sendText(
                        message.from,
                        '🥚 *Latihan: Memberikan 1 Makanan Bergizi Hari Ini*\n\nPilihan makanan bergizi yang mudah disiapkan:\n\n• *Telur* — Sumber protein lengkap, bisa direbus, orak-arik, atau dadar\n• *Ikan* — Kaya omega-3 untuk perkembangan otak\n• *Tempe / Tahu* — Protein nabati yang terjangkau dan bergizi\n• *Bayam / Brokoli* — Sumber zat besi dan vitamin\n• *Pisang / Pepaya* — Sumber vitamin C dan serat\n\n💡 *Tips:* Tidak perlu mewah atau sulit. Telur rebus + nasi sudah merupakan langkah yang luar biasa!\n\nBunda sudah memilih latihan yang tepat hari ini. Langkah kecil ini nyata dampaknya untuk anak. 🌟'
                    );
                    await botBaileys.sendPoll(message.from, 'Apakah Bunda sudah berhasil memberikan makanan bergizi hari ini?', {
                        options: [
                            '✅ Ya, berhasil!',
                            '🔄 Masih mencoba',
                            '⏳ Belum sempat',
                        ],
                        multiselect: false,
                    });
                    setUserStep(userId, 'cek_latihan');
                } else if (command.includes('makan bersama') || command.includes('bersama')) {
                    setUserContext(userId, 'latihan', 'makan_bersama');
                    await botBaileys.sendText(
                        message.from,
                        '👨‍👩‍👧 *Latihan: Mengajak Anak Makan Bersama*\n\nMakan bersama bukan hanya soal makanan — ini tentang koneksi.\n\n✅ *Cara melakukannya:*\n• Matikan TV dan singkirkan HP saat makan\n• Duduk semeja bersama anak\n• Ciptakan suasana rileks dan menyenangkan\n• Ajak anak bicara tentang hari-harinya\n• Jangan paksa atau tegur makan saat di meja\n\n💡 *Mengapa ini penting?*\nAnak yang makan dalam suasana tenang dan menyenangkan terbukti memiliki nafsu makan yang lebih baik dan lebih terbuka mencoba makanan baru.\n\nMomen makan bersama adalah investasi jangka panjang untuk hubungan Bunda dan anak. 💛'
                    );
                    await botBaileys.sendPoll(message.from, 'Apakah Bunda berhasil makan bersama anak hari ini?', {
                        options: [
                            '✅ Ya, berhasil!',
                            '🔄 Masih mencoba',
                            '⏳ Belum sempat',
                        ],
                        multiselect: false,
                    });
                    setUserStep(userId, 'cek_latihan');
                } else if (command.includes('kebiasaan makan') || command.includes('kebiasaan') || command.includes('memperhatikan')) {
                    setUserContext(userId, 'latihan', 'observasi');
                    await botBaileys.sendText(
                        message.from,
                        '🔍 *Latihan: Memperhatikan Kebiasaan Makan Anak*\n\nObservasi adalah langkah pertama yang sangat powerful, Bunda!\n\n📝 *Yang perlu Bunda perhatikan hari ini:*\n• Makanan apa yang anak mau / tidak mau?\n• Bagaimana porsi makannya?\n• Apakah ada makanan tertentu yang selalu ditolak?\n• Bagaimana suasana hati anak saat makan?\n• Jam berapa anak paling bersemangat makan?\n\n💡 *Tips:* Bunda bisa mencatat di buku kecil atau catatan HP. Informasi ini sangat berguna untuk disampaikan ke dokter atau ahli gizi di kunjungan berikutnya.\n\nObservasi Bunda hari ini bisa menjadi kunci untuk mengatasi masalah makan anak. 🗝️'
                    );
                    await botBaileys.sendPoll(message.from, 'Apakah Bunda berhasil memperhatikan kebiasaan makan anak hari ini?', {
                        options: [
                            '✅ Ya, berhasil!',
                            '🔄 Masih mencoba',
                            '⏳ Belum sempat',
                        ],
                        multiselect: false,
                    });
                    setUserStep(userId, 'cek_latihan');
                } else if (command.includes('cek latihan') || command.includes('cek')) {
                    await botBaileys.sendPoll(message.from, '📊 *Cek Latihan Bunda Hari Ini*\n\nBagaimana progres latihan Bunda?', {
                        options: [
                            '✅ Ya, berhasil!',
                            '🔄 Masih mencoba',
                            '⏳ Belum sempat',
                        ],
                        multiselect: false,
                    });
                    setUserStep(userId, 'cek_latihan');
                } else if (command.includes('kembali') || command.includes('menu utama')) {
                    await sendMainMenu(message.from);
                    setUserStep(userId, 'main_menu');
                } else {
                    await sendLatihanMenu(message.from);
                }
                break;

            case 'cek_latihan':
                if (command.includes('ya') || command.includes('berhasil')) {
                    await botBaileys.sendText(
                        message.from,
                        '🎉 *Luar biasa, Bunda!*\n\nBunda sudah membuktikan bahwa kepedulian dan tindakan nyata bisa berjalan beriringan. Setiap langkah kecil yang Bunda ambil hari ini nyata dampaknya untuk tumbuh kembang anak.\n\nBunda adalah ibu yang luar biasa! ✨'
                    );
                    await sendSelfEfficacyCheck(message.from);
                    setUserStep(userId, 'self_efficacy_check');
                } else if (command.includes('masih') || command.includes('mencoba')) {
                    await botBaileys.sendText(
                        message.from,
                        '💪 *Masih mencoba itu sudah lebih dari cukup, Bunda!*\n\nProses itu lebih penting dari hasil yang sempurna. Bunda sudah berusaha, dan itu sangat berarti.\n\nTerus coba ya, Bunda. Bunda pasti bisa! 🌱'
                    );
                    await sendSelfEfficacyCheck(message.from);
                    setUserStep(userId, 'self_efficacy_check');
                } else if (command.includes('belum') || command.includes('sempat')) {
                    await botBaileys.sendText(
                        message.from,
                        '🌸 *Tidak apa-apa sama sekali, Bunda.*\n\nHari ini mungkin memang tidak memungkinkan, dan itu wajar. Bunda bukan gagal — Bunda hanya sedang menghadapi hari yang penuh.\n\nEsok hari adalah kesempatan baru. Bunda pasti bisa mencobanya lagi. 💛'
                    );
                    await sendSelfEfficacyCheck(message.from);
                    setUserStep(userId, 'self_efficacy_check');
                } else {
                    await botBaileys.sendPoll(message.from, '📊 *Cek Latihan Bunda Hari Ini*', {
                        options: [
                            '✅ Ya, berhasil!',
                            '🔄 Masih mencoba',
                            '⏳ Belum sempat',
                        ],
                        multiselect: false,
                    });
                }
                break;

            case 'self_efficacy_check':
                if (command.includes('lebih percaya') || command.includes('percaya diri')) {
                    await botBaileys.sendText(
                        message.from,
                        '🌟 *Alhamdulillah, Bunda!*\n\nKepercayaan diri Bunda yang meningkat adalah tanda nyata bahwa Bunda telah berkembang. Dan anak Bunda adalah penerima manfaat terbesar dari kepercayaan diri Bunda itu.\n\nTerus pertahankan semangat ini ya, Bunda! 💛'
                    );
                    await sendMainMenu(message.from);
                    setUserStep(userId, 'main_menu');
                } else if (command.includes('sama saja')) {
                    await botBaileys.sendText(
                        message.from,
                        '🌱 *Tidak apa-apa, Bunda. Pertumbuhan itu membutuhkan waktu.*\n\nKepercayaan diri tidak selalu tumbuh sekaligus. Yang terpenting Bunda terus melangkah meski kecil.\n\nTeruslah berinteraksi dengan bot ini, insya Allah Bunda akan merasakan perbedaannya pelan-pelan. 🤍'
                    );
                    await sendMainMenu(message.from);
                    setUserStep(userId, 'main_menu');
                } else if (command.includes('masih bingung') || command.includes('bingung')) {
                    await botBaileys.sendText(
                        message.from,
                        '💙 *Bingung itu bagian dari proses belajar, Bunda.*\n\nJangan khawatir. Yuk kita jelajahi lebih lanjut bersama. Mulai dari menu edukasi stunting atau kondisi anak — pelan-pelan semuanya akan lebih jelas.\n\nBunda tidak harus paham semuanya sekaligus. 🌸'
                    );
                    await sendMainMenu(message.from);
                    setUserStep(userId, 'main_menu');
                } else {
                    await sendSelfEfficacyCheck(message.from);
                }
                break;

            // ── END ──────────────────────────────────────────────────────────
            case 'end':
                await botBaileys.sendText(
                    message.from,
                    'Halo kembali, Bunda 🌸\n\nSenang melihat Bunda kembali! Kapan pun Bunda siap, kita bisa mulai bersama lagi.'
                );
                await botBaileys.sendPoll(message.from, 'Apakah Bunda ingin memulai kembali?', {
                    options: ['✅ Ya, saya setuju', '❌ Tidak sekarang'],
                    multiselect: false,
                });
                setUserStep(userId, 'consent');
                break;

            default:
                await botBaileys.sendText(
                    message.from,
                    'Maaf Bunda, saya kurang paham. Ketik *menu* untuk kembali ke menu utama ya 🙏'
                );
                break;
        }
    } catch (error) {
        console.error('Error processing message:', error);
        try {
            await botBaileys.sendText(message.from, 'Maaf Bunda, terjadi kesalahan. Silakan coba lagi dalam beberapa saat 🙏');
        } catch (sendError) {
            console.error('Failed to send error message:', sendError);
        }
    }
});

// ─── Helper: Navigasi setelah konten Perasaan ─────────────────────────────────
async function sendNavigasiPeelbatanMenu(from: string): Promise<void> {
    await botBaileys.sendPoll(from, 'Bunda mau lanjut ke mana?', {
        options: [
            'Ceritakan perasaan lain',
            'Stress Check-in (cek kondisi)',
            'Kembali ke menu utama',
        ],
        multiselect: false,
    });
}

console.log('🚀 Bot Edukasi Stunting siap digunakan!');
