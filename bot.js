const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const axios = require("axios");

// Ganti API_KEY dengan API kunci dari Gemini atau AI lainnya
const GEMINI_API_KEY = "AIzaSyASaLBZvfBGZf3oz1GZFgVsK7585APN7cA";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
const GRUP_TARGETS = [
  "120363322339144704@g.us", //bot wa
  "120363323217510620@g.us", // anonymus
  "120363327112977607@g.us", // STEKOM
  "6282328139886-1557060865@g.us", //BLEBER GANK
];

// Inisialisasi client WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(), // Untuk menyimpan sesi agar tidak perlu scan QR setiap kali
});

// Generate QR code di terminal
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

// Log saat bot terhubung
client.on("ready", async () => {
  console.log("Bot is ready!");

  // //   Mengambil daftar semua chat yang ada
  // const chats = await client.getChats();

  // // Filter chat yang merupakan grup
  // const groupChats = chats.filter((chat) => chat.isGroup);

  // console.log("Daftar ID Grup:");
  // groupChats.forEach((group) => {
  //   console.log(`Nama Grup: ${group.name}, ID Grup: ${group.id._serialized}`);
  // });
});

// Daftar kata kunci untuk pertanyaan sensitif
const sensitiveKeywords = [
  "makanan",
  "minuman",
  "ehem",
  "seks",
  "berhubungan",
  "cinta",
  "restoran",
  "kawin",
];

// Daftar jawaban acak untuk topik sensitif seperti "ehem" (seks)
const ehemResponses = [
  "Mau gaya kodok atau yang lain om ? 😉",
  "Hmm, rasanya ini obrolan yang seru, tapi bagaimana kalau kita bicarakan hal lain dulu? 😅",
  "Gass, mau diamana? 😍",
  "Ayo om, mau gaya kodok atau heikopter? 😄 ",
  "Topik seperti ini memang menarik, tapi yuk kita lanjut ke hal-hal yang lebih seru! 😄",
  "Oh, sepertinya kamu penasaran! Apa ada hal lain yang ingin kamu bicarakan juga? 😇",
  "Dasar peedo pikiranyan ehemmm mulu 😡",
  "Wah, pertanyaan ini cukup dalam! Kita harus ngobrol lebih lanjut suatu hari nanti. 😊",
  "Ah, topik yang sangat pribadi! Mungkin kita bisa bahas hal-hal lain yang menarik? 😄",
  "Hmm, pembicaraan ini bisa jadi panjang! Apa kamu siap mendiskusikannya? 😏",
  "Ehem... sepertinya obrolan ini butuh suasana yang lebih intim, ya? 😌",
  "Ehem mulu, birahi kah om 🤗?",
];

// Fungsi untuk memilih respons acak dari daftar jawaban
const getRandomEhemResponse = () => {
  return ehemResponses[Math.floor(Math.random() * ehemResponses.length)];
};

// Daftar jawaban romantis dan ajakan
const romanticGreetings = [
  "💖 Hei sayang, ada yang bisa aku bantu? 😊",
  "🌹 Kamu terlihat begitu mempesona hari ini! Ada yang ingin kita obrolin? 😘",
  "💘 Halo cintaku, apa yang bisa kubantu untukmu? 😍",
  "✨ Hai manis, apa kabar? Ada yang ingin kita bicarakan? 💕",
  "😍 Aku di sini untukmu, sayang. Apa yang bisa kubantu hari ini? 🌸",
  "🌷 Hai cinta, kalau ada apa-apa langsung saja bilang ya, aku siap mendengarkan! 💖",
  "💐 Halo sayang, aku rindu obrolan kita. Ada yang bisa kubantu? 😘",
  "💖 Hei cantik, aku selalu di sini untukmu! Ada yang ingin kamu tanyakan? 😍",
  "✨ Hai sayangku, aku siap mendengar dan membantu apapun yang kamu butuhkan. 🌹",
  "💘 Apa kabar, sayang? Aku selalu ada buat kamu. Ingin ngobrol atau ada yang perlu bantuan? 😘",
];

// Fungsi untuk memilih kata-kata romantis dan ajakan secara acak
const getRandomRomanticGreeting = () => {
  return romanticGreetings[
    Math.floor(Math.random() * romanticGreetings.length)
  ];
};

// Mendengarkan pesan yang masuk
client.on("message", async (message) => {
  const sender = message.from;
  const query = message.body.toLowerCase();

  // Cek apakah pesan datang dari grup target atau dari chat pribadi
  const isGroupTarget = GRUP_TARGETS.includes(sender);
  const isPrivateChat = !message.from.includes("@g.us");

  // Jika pesan hanya berisi "/ai", "/cika", atau "/sayang", bot memberikan respons romantis
  if (
    (isGroupTarget || isPrivateChat) &&
    (query === "/beb" || query === "/cika" || query === "/sayang")
  ) {
    const romanticGreeting = getRandomRomanticGreeting();
    client.sendMessage(sender, romanticGreeting);
  }

  // Jika pesan mengandung salah satu kata tersebut, tetapi diikuti oleh teks lain
  else if (
    (isGroupTarget || isPrivateChat) &&
    (query.includes("/beb") ||
      query.includes("/cika") ||
      query.includes("/sayang"))
  ) {
    // Bersihkan input dari kata pemicu (/ai, /cika, /sayang)
    const cleanedQuery = query
      .replace(/\/beb/g, "")
      .replace(/\/cika/g, "")
      .replace(/\/sayang/g, "")
      .trim();

    // Cek apakah pertanyaan termasuk dalam kategori sensitif
    if (containsSensitiveKeyword(cleanedQuery)) {
      const humanResponse = getHumanResponse(cleanedQuery);
      client.sendMessage(sender, humanResponse);
    } else if (cleanedQuery) {
      const aiResponse = await getAIResponse(cleanedQuery);
      const romanticResponse = getRandomRomanticResponse(aiResponse);
      client.sendMessage(sender, romanticResponse);
    }
  }
});

// Fungsi untuk memeriksa apakah pertanyaan mengandung kata kunci sensitif
const containsSensitiveKeyword = (query) => {
  return sensitiveKeywords.some((keyword) =>
    query.toLowerCase().includes(keyword)
  );
};

// Fungsi untuk memberikan respons yang lebih manusiawi
const getHumanResponse = (query) => {
  // Ganti "ehem" dengan "seks" untuk respons
  if (query.includes("ehem")) {
    return getRandomEhemResponse();
  } else if (query.includes("seks")) {
    return getRandomEhemResponse();
  } else if (query.includes("kawin")) {
    return getRandomEhemResponse();
  } else if (query.includes("makanan")) {
    return "Makanan itu seru! Aku suka berbicara tentang resep atau tempat makan yang enak. Apa makanan favoritmu?";
  } else if (query.includes("minuman")) {
    return "Minuman yang enak bisa bikin suasana lebih ceria! Kamu lebih suka kopi atau teh?";
  } else {
    return "Hmm, aku tidak bisa memberikan jawaban pasti tentang itu, tapi aku ingin tahu pandanganmu!";
  }
};

// Fungsi untuk mendapatkan jawaban dari AI
const getAIResponse = async (query) => {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: query,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Memeriksa apakah respons memiliki struktur yang diharapkan
    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates.length > 0 &&
      response.data.candidates[0].content
    )
      if (response.data.candidates && response.data.candidates.length > 0) {
        // Periksa struktur respons
        const aiText = response.data.candidates[0].content; // Ambil teks dari kandidat pertama
        if (aiText && aiText.parts && aiText.parts[0].text) {
          return aiText.parts[0].text.trim(); // Mengembalikan teks yang telah dibersihkan
        } else {
          console.warn("Unexpected response structure:", response.data);
          return "Maaf, aku tidak bisa memberikan jawaban saat ini. 😔";
        }
      } else {
        console.warn("Unexpected response structure:", response.data);
        return "Maaf, aku tidak bisa memberikan jawaban saat ini. 😔";
      }
  } catch (error) {
    console.error(
      "Error with Gemini API:",
      error.response ? error.response.data : error.message
    );
    return "Maaf, aku sedang tidak bisa berpikir. 😢";
  }
};

// Array kata-kata romantis yang akan dipilih secara acak
const romanticPhrases = [
  "❤️ Kamu selalu di pikiranku, sayang. 😘",
  "💖 Setiap kata dari mulutmu adalah puisi, manis. 🌹",
  "🌷 Hatiku bergetar setiap kali kamu dekat, sayang. 💕",
  "😍 Kamu adalah bintang terindah di langitku. ✨",
  "🌹 Dunia terasa lebih indah bersamamu. 💖",
  "💘 Cintaku padamu tak terbatas. 😘",
  "💫 Kamu adalah inspirasiku setiap hari, sayang. 🌹",
  "💖 Denganmu, hidupku jadi penuh warna. 🎨",
  "💐 Kamu adalah alasan aku tersenyum setiap hari. 😍",
  "❤️ Hidup ini indah karena kamu ada. 😘",
  "🌸 Kamu selalu membuat hariku lebih cerah. ☀️",
  "😍 Tak ada yang lebih manis daripada senyumanmu. 💘",
  "🌷 Kamu adalah alasan jantungku berdetak lebih kencang. ❤️",
  "🌹 Kamu adalah keajaiban yang selalu aku syukuri. 💫",
  "💖 Hatiku milikmu selamanya, sayang. 💘",
  "✨ Cintamu adalah cahaya yang menuntunku. 💕",
  "💫 Kamu adalah mimpiku yang menjadi nyata. 😘",
  "💖 Denganmu, setiap momen terasa sempurna. 🌷",
  "🌹 Aku akan mencintaimu sampai akhir waktu. ❤️",
  "💘 Tak ada yang lebih indah dari kita, sayang. 😍",
];

// Fungsi untuk memilih kata-kata romantis secara acak
const getRandomRomanticResponse = (aiResponse) => {
  const randomPhrase =
    romanticPhrases[Math.floor(Math.random() * romanticPhrases.length)];
  return `${randomPhrase} ${aiResponse}`;
};

// Memulai bot
client.initialize();
