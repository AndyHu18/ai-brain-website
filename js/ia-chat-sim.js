/* ── Industry Analyzer Chat Simulation ── */
(function () {
  "use strict";

  /* Characters: two CS reps speaking directly to the visitor */
  const CHEN = {
    name: "小陳 ・ AI 顧問",
    avatar: "images/chat-avatar-male.png",
    side: "left",
  };

  const AMY = {
    name: "Amy ・ 方案規劃師",
    avatar: "images/chat-avatar-female.png",
    side: "right",
  };

  /* Script — explain analysis benefits naturally, speaking to visitor */
  const SCRIPT = [
    {
      who: CHEN,
      text: "嗨，歡迎！上面那個行業分析可以幫你看看，你的行業現在適合什麼樣的網站方案",
    },
    {
      who: AMY,
      text: "它會根據你的行業特性，分析你的客戶最常用哪些功能，像是線上預約、AI 客服這些",
    },
    {
      who: CHEN,
      text: "還會幫你比較不同方案的差別，讓你知道從哪個開始比較適合",
    },
    {
      who: AMY,
      text: "分析完會產生一份完整報告，包含 PDF 跟 Podcast，可以帶回去慢慢研究",
    },
    {
      who: CHEN,
      text: "整個過程大概 30 秒，選你的行業就可以開始了",
    },
    {
      who: AMY,
      text: "有問題的話我們都在，隨時可以問 😊",
    },
  ];

  const TYPEWRITER_SPEED = 45; /* ms per character */
  const MSG_INTERVAL = 1800; /* ms between messages */
  const RESTART_DELAY = 6000; /* ms before loop restart */

  const chatBody = document.getElementById("iaChatBody");
  if (!chatBody) return;

  let running = false;

  /* ── Helpers ── */
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const createRow = (who) => {
    const row = document.createElement("div");
    row.className = `ia-chat-row ${who.side === "right" ? "right" : ""}`;

    const avatarEl = document.createElement("div");
    avatarEl.className = "ia-chat-avatar";
    const img = document.createElement("img");
    img.src = who.avatar;
    img.alt = who.name;
    img.loading = "lazy";
    avatarEl.appendChild(img);

    const bubble = document.createElement("div");
    bubble.className = "ia-chat-bubble";

    const nameEl = document.createElement("div");
    nameEl.className = "ia-chat-name";
    nameEl.textContent = who.name;
    bubble.appendChild(nameEl);

    const textEl = document.createElement("span");
    textEl.className = "ia-chat-text";
    bubble.appendChild(textEl);

    row.appendChild(avatarEl);
    row.appendChild(bubble);
    chatBody.appendChild(row);

    /* Trigger animation */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => row.classList.add("visible"));
    });

    return { row, textEl, bubble };
  };

  const showTypingDots = (who) => {
    const row = document.createElement("div");
    row.className = `ia-chat-row ${who.side === "right" ? "right" : ""}`;

    const avatarEl = document.createElement("div");
    avatarEl.className = "ia-chat-avatar";
    const img = document.createElement("img");
    img.src = who.avatar;
    img.alt = who.name;
    img.loading = "lazy";
    avatarEl.appendChild(img);

    const bubble = document.createElement("div");
    bubble.className = "ia-chat-bubble";
    bubble.innerHTML =
      '<div class="ia-chat-typing-dots"><span></span><span></span><span></span></div>';

    row.appendChild(avatarEl);
    row.appendChild(bubble);
    chatBody.appendChild(row);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => row.classList.add("visible"));
    });

    return row;
  };

  const typeText = async (textEl, text) => {
    const cursor = document.createElement("span");
    cursor.className = "ia-chat-typing-cursor";
    textEl.after(cursor);

    for (let i = 0; i < text.length; i++) {
      textEl.textContent += text[i];
      chatBody.scrollTop = chatBody.scrollHeight;
      await sleep(TYPEWRITER_SPEED + Math.random() * 20);
    }

    cursor.remove();
  };

  /* ── Main loop ── */
  const runConversation = async () => {
    if (running) return;
    running = true;
    chatBody.innerHTML = "";

    for (const entry of SCRIPT) {
      /* Show typing indicator */
      const dots = showTypingDots(entry.who);
      chatBody.scrollTop = chatBody.scrollHeight;
      await sleep(800 + Math.random() * 600);

      /* Remove dots, add real message */
      dots.remove();
      const { textEl } = createRow(entry.who);

      /* Only male gets typewriter; female appears instantly */
      if (entry.who.side === "left") {
        await typeText(textEl, entry.text);
      } else {
        textEl.textContent = entry.text;
        chatBody.scrollTop = chatBody.scrollHeight;
      }

      await sleep(MSG_INTERVAL + Math.random() * 400);
    }

    /* Loop */
    await sleep(RESTART_DELAY);
    running = false;
    runConversation();
  };

  /* ── Start when section enters viewport ── */
  let started = false;
  const kick = () => {
    if (started) return;
    started = true;
    runConversation().catch((err) => console.error("[ia-chat] error:", err));
  };

  const chatSection = document.getElementById("iaChat");
  if (chatSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            observer.unobserve(e.target);
            kick();
          }
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(chatSection);

    /* Fallback: always start after 5s (chat loops anyway) */
    setTimeout(kick, 5000);
  }
})();
