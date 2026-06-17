/**
 * Flow Engine for WhatsApp Chatbot
 * Manages conversation state and navigation through menu-driven flows
 */

export interface FlowNode {
  id: string;
  message: string;
  type: 'text' | 'poll' | 'menu';
  options?: string[];
  next?: { [key: string]: string };
  requiresInput?: boolean;
}

export interface FlowState {
  currentNode: string;
  history: string[];
  context: { [key: string]: any };
}

export class FlowEngine {
  private flows: Map<string, FlowNode>;
  private userStates: Map<string, FlowState>;

  constructor() {
    this.flows = new Map();
    this.userStates = new Map();
    this.initializeFlows();
  }

  private initializeFlows(): void {
    // Opening flow
    this.addNode({
      id: 'start',
      message: 'Halo, Bunda 🌸\nTerima kasih sudah bergabung. Di sini Bunda bisa berbagi dan belajar pelan-pelan tentang anak Bunda yang susah makan.\n\nTenang, Bunda tidak sendirian 🤍',
      type: 'text',
      next: { default: 'agreement' }
    });

    this.addNode({
      id: 'agreement',
      message: 'Chatbot ini berisi edukasi singkat, tips harian, dan dukungan untuk Bunda.',
      type: 'poll',
      options: ['Ya, saya setuju', 'Keluar'],
      next: {
        'ya, saya setuju': 'main_menu',
        'keluar': 'end'
      }
    });

    // Main menu
    this.addNode({
      id: 'main_menu',
      message: 'Bunda ingin mulai dari mana?',
      type: 'poll',
      options: [
        'Apa itu picky eater?',
        'Anak saya susah makan',
        'Saya khawatir & bingung',
        'Tips awal yang mudah',
        'Butuh bantuan langsung'
      ],
      next: {
        'apa itu picky eater?': 'picky_eater_intro',
        'anak saya susah makan': 'difficulty_eating',
        'saya khawatir & bingung': 'worried_confused',
        'tips awal yang mudah': 'easy_tips',
        'butuh bantuan langsung': 'immediate_help'
      }
    });

    // What is picky eater flow
    this.addNode({
      id: 'picky_eater_intro',
      message: 'Picky eater adalah kondisi ketika anak sering menolak makan, memilih makanan tertentu, atau makan sangat sedikit.',
      type: 'text',
      next: { default: 'picky_eater_submenu' }
    });

    this.addNode({
      id: 'picky_eater_submenu',
      message: 'Bunda mau tahu lebih lanjut tentang apa?',
      type: 'poll',
      options: [
        'Penyebab picky eater',
        'Karakteristik Perilaku Picky Eater',
        'Dampak Picky Eater',
        'Strategi menghadapi anak picky eater',
        'Hubungan dengan stunting'
      ],
      next: {
        'penyebab picky eater': 'causes',
        'karakteristik perilaku picky eater': 'characteristics',
        'dampak picky eater': 'impact',
        'strategi menghadapi anak picky eater': 'strategies',
        'hubungan dengan stunting': 'stunting_relation'
      }
    });

    // Causes node
    this.addNode({
      id: 'causes',
      message: `Faktor yang Mempengaruhi Anak Picky Eater:

1️⃣ Sensitivitas sensorik
Sebagian anak lebih sensitif terhadap tekstur, rasa, bau, atau suhu makanan. Misalnya menolak sayur karena lembek, bau menyengat, atau teksturnya berbeda. Kondisi ini sering membuat anak menolak dan memilih-milih makanan.

2️⃣ Pola asuh orang tua
Kebiasaan memberi hadiah agar anak mau makan dapat membuat anak hanya mau makan jika ada imbalan. Lama-kelamaan, anak jadi lebih selektif terhadap makanan.

3️⃣ Pengalaman awal MP-ASI & makanan baru
Kurangnya variasi rasa dan tekstur sejak MP-ASI membuat anak tidak terbiasa mencoba makanan baru. Anak jadi takut dan menolak makanan yang terasa asing.

4️⃣ Faktor biologis & genetik
Sensitivitas terhadap rasa pahit atau bau tertentu bisa diturunkan secara genetik. Anak dengan sensitivitas ini cenderung menolak sayuran atau makanan dengan rasa kuat.`,
      type: 'text',
      next: { default: 'return_to_submenu' }
    });

    // Characteristics node
    this.addNode({
      id: 'characteristics',
      message: `Karakteristik Perilaku Picky Eater pada Anak:

1️⃣ Pilih-pilih makanan
Anak hanya mau makan jenis makanan tertentu dan menolak makanan lainnya.

2️⃣ Menolak makanan baru
Anak enggan atau takut mencoba makanan yang belum familiar.

3️⃣ Preferensi makanan yang kuat
Anak hanya mau makan makanan favorit yang sama secara berulang.

4️⃣ Penolakan berdasarkan sensori
Anak menolak makanan karena warna, tekstur, atau aroma tertentu (misalnya hanya mau makanan lunak atau cair).`,
      type: 'text',
      next: { default: 'return_to_submenu' }
    });

    // Impact node
    this.addNode({
      id: 'impact',
      message: `Dampak Picky Eater

Anak yang pilih-pilih makanan bisa kekurangan gizi karena hanya mau makan jenis tertentu saja. Kalau dibiarkan lama, tubuh anak bisa kekurangan energi dan zat penting untuk tumbuh, sehingga berisiko pertumbuhannya terhambat atau menjadi stunting.`,
      type: 'text',
      next: { default: 'return_to_submenu' }
    });

    // Strategies node
    this.addNode({
      id: 'strategies',
      message: `Cara Mengatasi Anak Picky Eater (Edukasi & Tips Harian)

Tips Praktis yang Bisa Dilakukan Setiap Hari nih Bunda:

🍽️ 1. Jadi contoh yang baik
Makan sayur dan buah bersama anak. Anak lebih mudah meniru daripada disuruh.
👉 Tips: Ucapkan, "Enak ya wortelnya," saat makan.

🥕 2. Kenalkan makanan baru tanpa paksaan
Sajikan sedikit makanan baru di piring anak, meski belum dimakan.
👉 Tips: Coba ulang 10–15 kali di hari berbeda, ubah bentuk atau cara masaknya.

👨‍👩‍👧 3. Biasakan makan bersama keluarga
Makan bareng bikin anak merasa aman dan lebih mau mencoba.
👉 Tips: Matikan TV dan simpan HP saat makan.

🎨 4. Buat makanan terlihat menarik
Warna dan bentuk makanan sangat berpengaruh pada balita.
👉 Tips: Bentuk nasi atau sayur jadi karakter lucu.

💬 5. Hindari marah atau memaksa
Memaksa justru bikin anak makin menolak.
👉 Tips: Puji usaha anak meski hanya mencicip sedikit.

📝 6. Pantau perlahan, jangan buru-buru
Perubahan tidak instan, tapi akan terlihat jika dilakukan konsisten.
👉 Tips: Catat makanan yang sudah mau dicoba anak.`,
      type: 'text',
      next: { default: 'return_to_submenu' }
    });

    // Stunting relation node
    this.addNode({
      id: 'stunting_relation',
      message: `Hubungan Picky Eater dengan Stunting

Anak yang picky eater cenderung hanya mau makan jenis makanan tertentu saja. Akibatnya, asupan gizinya tidak lengkap, terutama protein, energi, vitamin, dan mineral yang penting untuk pertumbuhan. Jika kondisi ini berlangsung lama, tubuh anak kekurangan zat gizi yang dibutuhkan untuk tumbuh optimal.

Dalam jangka panjang, kekurangan gizi tersebut dapat menyebabkan pertumbuhan tinggi badan anak terhambat atau dikenal sebagai stunting. Jadi, picky eater yang tidak ditangani dengan baik bisa meningkatkan risiko stunting pada anak, terutama di usia balita yang merupakan masa penting pertumbuhan.`,
      type: 'text',
      next: { default: 'return_to_submenu' }
    });

    // Return to submenu helper
    this.addNode({
      id: 'return_to_submenu',
      message: 'Bunda mau belajar aspek lainnya?',
      type: 'poll',
      options: ['Ya, tampilkan menu lagi', 'Kembali ke menu utama'],
      next: {
        'ya, tampilkan menu lagi': 'picky_eater_submenu',
        'kembali ke menu utama': 'main_menu'
      }
    });

    // Difficulty eating flow
    this.addNode({
      id: 'difficulty_eating',
      message: 'Banyak Bunda-Bunda yang mengalami hal yang sama, Bun.\nBoleh saya tahu, yang paling sering terjadi apa?',
      type: 'poll',
      options: [
        'Anak menolak makan',
        'Makan sangat sedikit',
        'Hanya mau makanan tertentu',
        'Lama & main saat makan'
      ],
      next: {
        'anak menolak makan': 'refuses_to_eat',
        'makan sangat sedikit': 'eats_little',
        'hanya mau makanan tertentu': 'selective_eating',
        'lama & main saat makan': 'slow_eater'
      }
    });

    // Individual difficulty responses
    this.addNode({
      id: 'refuses_to_eat',
      message: `Terima kasih sudah cerita, Bun 🤍

Ini termasuk tanda picky eater ringan–sedang dan bisa diperbaiki pelan-pelan. Semangat Bunda!

Anak susah makan seperti menolak makan adalah hal yang sering terjadi pada balita dan masih normal.

Biasanya terjadi karena anak:
1️⃣ Masih belajar mengenal rasa dan tekstur
2️⃣ Ingin mandiri
3️⃣ Terlalu banyak distraksi (TV/gadget)
4️⃣ Pernah dipaksa makan

👉 Yang penting Bunda ingat:
Jangan marah atau memaksa anak makan.
Ciptakan suasana makan yang tenang dan rutin.

✨ Anak perlu waktu. Dengan cara yang tepat dan konsisten, kebiasaan makan anak bisa diperbaiki.`,
      type: 'text',
      next: { default: 'difficulty_tips' }
    });

    this.addNode({
      id: 'eats_little',
      message: `Terima kasih sudah cerita, Bun 🤍

Ini termasuk tanda picky eater ringan–sedang dan bisa diperbaiki pelan-pelan. Semangat Bunda!

Anak susah makan seperti makan sedikit adalah hal yang sering terjadi pada balita dan masih normal.

Biasanya terjadi karena anak:
1️⃣ Masih belajar mengenal rasa dan tekstur
2️⃣ Ingin mandiri
3️⃣ Terlalu banyak distraksi (TV/gadget)
4️⃣ Pernah dipaksa makan

👉 Yang penting Bunda ingat:
Jangan marah atau memaksa anak makan.
Ciptakan suasana makan yang tenang dan rutin.

✨ Anak perlu waktu. Dengan cara yang tepat dan konsisten, kebiasaan makan anak bisa diperbaiki.`,
      type: 'text',
      next: { default: 'difficulty_tips' }
    });

    this.addNode({
      id: 'selective_eating',
      message: `Terima kasih sudah cerita, Bun 🤍

Ini termasuk tanda picky eater ringan–sedang dan bisa diperbaiki pelan-pelan. Semangat Bunda!

Anak susah makan seperti pilih-pilih makanan adalah hal yang sering terjadi pada balita dan masih normal.

Biasanya terjadi karena anak:
1️⃣ Masih belajar mengenal rasa dan tekstur
2️⃣ Ingin mandiri
3️⃣ Terlalu banyak distraksi (TV/gadget)
4️⃣ Pernah dipaksa makan

👉 Yang penting Bunda ingat:
Jangan marah atau memaksa anak makan.
Ciptakan suasana makan yang tenang dan rutin.

✨ Anak perlu waktu. Dengan cara yang tepat dan konsisten, kebiasaan makan anak bisa diperbaiki.`,
      type: 'text',
      next: { default: 'difficulty_tips' }
    });

    this.addNode({
      id: 'slow_eater',
      message: `Terima kasih sudah cerita, Bun 🤍

Ini termasuk tanda picky eater ringan–sedang dan bisa diperbaiki pelan-pelan. Semangat Bunda!

Anak susah makan seperti lama & main saat makan adalah hal yang sering terjadi pada balita dan masih normal.

Biasanya terjadi karena anak:
1️⃣ Masih belajar mengenal rasa dan tekstur
2️⃣ Ingin mandiri
3️⃣ Terlalu banyak distraksi (TV/gadget)
4️⃣ Pernah dipaksa makan

👉 Yang penting Bunda ingat:
Jangan marah atau memaksa anak makan.
Ciptakan suasana makan yang tenang dan rutin.

✨ Anak perlu waktu. Dengan cara yang tepat dan konsisten, kebiasaan makan anak bisa diperbaiki.`,
      type: 'text',
      next: { default: 'difficulty_tips' }
    });

    // Daily tips for difficulty eating
    this.addNode({
      id: 'difficulty_tips',
      message: `Tips Hari Ini untuk Bunda

1. Fokus satu makanan bergizi dulu
Hari ini cukup targetkan 1 sumber protein (telur, tempe, tahu, ayam cincang).
👉 Nggak harus banyak, 2–3 suap juga sudah bagus.

2. Sajikan porsi kecil + pendamping favorit
Campurkan makanan bergizi dengan makanan yang anak suka.
👉 Contoh: nasi + telur orak-arik halus + kerupuk kesukaannya.

3. Makan bareng, jangan menyuapi sambil marah
Duduk sejajar, makan bareng, tanpa HP/TV.
👉 Ucapkan: "Ibu juga makan ini, enak loh."

4. Ubah tampilan, bukan rasanya
Kalau anak menolak, coba bentuk atau cara masak lain.
👉 Contoh: telur dadar gulung, tempe dipotong kecil-kecil.

5. Jangan kejar habis hari ini
Anak yang pilih pilih makanan butuh konsistensi, bukan paksaan.
👉 Hari ini makan sedikit = tetap dihitung usaha.

6. Validasi diri bunda dulu
Kalau anak menolak, itu bukan karena bunda gagal.
👉 Besok bisa coba lagi dengan cara berbeda.`,
      type: 'text',
      next: { default: 'ask_more_help' }
    });

    // Ask for more help
    this.addNode({
      id: 'ask_more_help',
      message: 'Bunda mau informasi atau tips lebih lanjut?',
      type: 'poll',
      options: ['Ya, saya mau belajar lagi', 'Kembali ke menu utama', 'Keluar'],
      next: {
        'ya, saya mau belajar lagi': 'main_menu',
        'kembali ke menu utama': 'main_menu',
        'keluar': 'end'
      }
    });

    // Worried & confused
    this.addNode({
      id: 'worried_confused',
      message: `Perasaan Bunda sangat wajar 🌷
Mengasuh anak yang susah makan memang melelahkan.

Yang paling Bunda rasakan saat ini apa?`,
      type: 'poll',
      options: ['Takut anak kurang gizi', 'Capek & stres', 'Merasa gagal', 'Bingung harus mulai dari mana'],
      next: {
        'takut anak kurang gizi': 'emotional_support',
        'capek & stres': 'emotional_support',
        'merasa gagal': 'emotional_support',
        'bingung harus mulai dari mana': 'emotional_support'
      }
    });

    this.addNode({
      id: 'emotional_support',
      message: `Bunda hebat, sudah melakukan yang terbaik.
Kita bisa belajar bersama, satu langkah kecil per hari.

🟢 Penguatan untuk Bunda

Ibu, merasa khawatir, capek, atau bingung bukan tanda ibu gagal.
Itu tanda ibu peduli dan sayang pada anak.

Mengasuh balita yang susah makan dan sedang dalam masa pertumbuhan memang berat.
Tidak semua hari berjalan mulus, dan itu sangat manusiawi.

🌱 Yang perlu ibu ingat:
1. Anak tidak butuh ibu yang sempurna, tapi ibu yang hadir dan konsisten
2. Perubahan besar datang dari langkah kecil yang diulang setiap hari
3. Makan 2–3 suap hari ini tetap lebih baik daripada tidak sama sekali

💪 Ibu sudah melakukan banyak hal baik:
1. Ibu mencari informasi
2. Ibu ingin belajar
3. Ibu tidak menyerah

Itu semua adalah kekuatan ibu ✨

Kita tidak perlu terburu-buru.
Hari ini kita fokus satu hal kecil yang bisa dilakukan untuk anak.`,
      type: 'text',
      next: { default: 'ask_more_help' }
    });

    // Easy tips
    this.addNode({
      id: 'easy_tips',
      message: `Ini 3 langkah ringan yang bisa Bunda coba hari ini:

1️⃣ Jangan memaksa anak makan
2️⃣ Jadwal makan teratur
3️⃣ Contohkan makan bersama

Bunda mau coba yang mana dulu?`,
      type: 'poll',
      options: ['Jelaskan tips ini lebih lanjut', 'Saya siap mulai', 'Kembali ke menu utama'],
      next: {
        'jelaskan tips ini lebih lanjut': 'strategies',
        'saya siap mulai': 'start_encouragement',
        'kembali ke menu utama': 'main_menu'
      }
    });

    this.addNode({
      id: 'start_encouragement',
      message: `Keren, Bun! 🌟

Mulai dengan satu tips saja hari ini. Langkah kecil akan membawa perubahan besar.

Ingat: konsistensi lebih penting daripada kesempurnaan.

Semangat! Bunda bisa kembali kapan saja kalau butuh dukungan 🤍`,
      type: 'text',
      next: { default: 'ask_more_help' }
    });

    // Immediate help
    this.addNode({
      id: 'immediate_help',
      message: `Jika Bunda merasa butuh pendampingan lebih lanjut, kami bisa bantu.

Silakan hubungi nomor WhatsApp ini untuk bantuan langsung:
📱 087849194804

Kami siap membantu Bunda 🤍`,
      type: 'text',
      next: { default: 'ask_more_help' }
    });

    // End node
    this.addNode({
      id: 'end',
      message: 'Terima kasih sudah menggunakan chatbot kami, Bun. Jaga kesehatan dan ingat, Bunda sudah melakukan pekerjaan yang luar biasa 🌸\n\nBunda bisa kembali kapan saja kalau butuh dukungan!',
      type: 'text',
      next: { default: 'start' }
    });
  }

  private addNode(node: FlowNode): void {
    this.flows.set(node.id, node);
  }

  public getNode(nodeId: string): FlowNode | undefined {
    return this.flows.get(nodeId);
  }

  public initializeUser(userId: string): void {
    if (!this.userStates.has(userId)) {
      this.userStates.set(userId, {
        currentNode: 'start',
        history: [],
        context: {}
      });
    }
  }

  public getUserState(userId: string): FlowState | undefined {
    return this.userStates.get(userId);
  }

  public processMessage(userId: string, message: string): { node: FlowNode; isNewConversation: boolean } | null {
    this.initializeUser(userId);
    const state = this.userStates.get(userId)!;
    const currentNode = this.flows.get(state.currentNode);

    if (!currentNode) return null;

    // If current node doesn't require input, return it directly
    if (!currentNode.requiresInput && state.history.length === 0) {
      state.history.push(state.currentNode);
      return { node: currentNode, isNewConversation: true };
    }

    // Process user input and navigate to next node
    const normalizedMessage = message.toLowerCase().trim();
    const nextNodeId = this.getNextNode(currentNode, normalizedMessage);

    if (nextNodeId) {
      state.history.push(state.currentNode);
      state.currentNode = nextNodeId;
      const nextNode = this.flows.get(nextNodeId);
      
      if (nextNode) {
        return { node: nextNode, isNewConversation: false };
      }
    }

    return null;
  }

  private getNextNode(currentNode: FlowNode, userInput: string): string | null {
    if (!currentNode.next) return null;

    // Check for exact match first
    if (currentNode.next[userInput]) {
      return currentNode.next[userInput];
    }

    // Check for default next
    if (currentNode.next['default']) {
      return currentNode.next['default'];
    }

    // Try partial matching for options
    for (const [key, value] of Object.entries(currentNode.next)) {
      if (userInput.includes(key) || key.includes(userInput)) {
        return value;
      }
    }

    return null;
  }

  public resetUser(userId: string): void {
    this.userStates.set(userId, {
      currentNode: 'start',
      history: [],
      context: {}
    });
  }

  public getCurrentNode(userId: string): FlowNode | null {
    const state = this.userStates.get(userId);
    if (!state) return null;
    return this.flows.get(state.currentNode) || null;
  }
}
