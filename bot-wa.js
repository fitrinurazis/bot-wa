const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const axios = require("axios");

const GRUP_TARGETS = [
  "1203633223391447040@g.us", //bot wa
];

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("Bot is ready!");

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

const getRandomEhemResponse = () => {
  return ehemResponses[Math.floor(Math.random() * ehemResponses.length)];
};

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

const getRandomRomanticGreeting = () => {
  return romanticGreetings[
    Math.floor(Math.random() * romanticGreetings.length)
  ];
};

client.on("message", async (message) => {
  const sender = message.from;
  const query = message.body.toLowerCase();

  const isGroupTarget = GRUP_TARGETS.includes(sender);
  const isPrivateChat = !message.from.includes("@g.us");

  if (
    (isGroupTarget || isPrivateChat) &&
    (query === "/beb" || query === "/cika" || query === "/sayang")
  ) {
    const romanticGreeting = getRandomRomanticGreeting();
    client.sendMessage(sender, romanticGreeting);
  }

  else if (
    (isGroupTarget || isPrivateChat) &&
    (query.includes("/beb") ||
      query.includes("/cika") ||
      query.includes("/sayang"))
  ) {
    const cleanedQuery = query
      .replace(/\/beb/g, "")
      .replace(/\/cika/g, "")
      .replace(/\/sayang/g, "")
      .trim();

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

const containsSensitiveKeyword = (query) => {
  return sensitiveKeywords.some((keyword) =>
    query.toLowerCase().includes(keyword)
  );
};

const getHumanResponse = (query) => {

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
        const aiText = response.data.candidates[0].content; 
        if (aiText && aiText.parts && aiText.parts[0].text) {
          return aiText.parts[0].text.trim();
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

const getRandomRomanticResponse = (aiResponse) => {
  const randomPhrase =
    romanticPhrases[Math.floor(Math.random() * romanticPhrases.length)];
  return `${randomPhrase} ${aiResponse}`;
};

client.initialize();
