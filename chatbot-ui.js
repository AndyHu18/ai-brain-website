/**
 * AI 智能大腦公司 - Chatbot UI 模組
 * 負責聊天視窗的 UI 互動與訊息顯示
 *
 * @module chatbot-ui
 * @version 1.1.0
 * @dependencies chatbot-core.js (ChatbotCore)
 * @exports ChatbotUI (全域)
 */

// ============================================================
// ChatbotUI 類別 - UI 互動管理
// ============================================================
const ChatbotUI = {
  /** @type {HTMLElement|null} 聊天視窗 */
  chatWindow: null,
  /** @type {HTMLElement|null} 聊天按鈕 */
  chatToggle: null,
  /** @type {HTMLElement|null} 訊息容器 */
  chatMessages: null,
  /** @type {number} 訊息 ID 計數器 - 防止同毫秒 ID 碰撞 */
  _messageIdCounter: 0,

  /**
   * 生成唯一訊息 ID（使用 UUID 或降級方案）
   * @returns {string} 唯一 ID
   */
  _generateUniqueId() {
    this._messageIdCounter++;
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return "msg-" + crypto.randomUUID();
    }
    const random = Math.random().toString(36).substring(2, 9);
    return `msg-${Date.now()}-${this._messageIdCounter}-${random}`;
  },

  /**
   * 初始化聊天客服 UI
   */
  init() {
    this.chatToggle = document.getElementById("chatToggle");
    this.chatWindow = document.getElementById("chatWindow");
    this.chatMessages = document.getElementById("chatMessages");
    const chatClose = document.getElementById("chatClose");
    const chatForm = document.getElementById("chatForm");
    const chatInput = document.getElementById("chatInput");

    if (!this.chatToggle || !this.chatWindow) return;

    this.chatToggle.addEventListener("click", () => this.toggleWindow());
    chatClose?.addEventListener("click", () => this.closeWindow());

    chatForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const message = chatInput.value.trim();
      if (!message) return;
      await this.handleSendMessage(message, chatInput);
    });
  },

  /**
   * 切換聊天視窗開關
   */
  toggleWindow() {
    this.chatWindow.classList.toggle("active");
    this.chatToggle.classList.toggle("active");

    // 隱藏通知徽章
    const badge = this.chatToggle.querySelector(".chat-notification");
    if (badge) badge.style.display = "none";

    // 首次開啟時發送歡迎訊息
    const hasShownWelcome = sessionStorage.getItem("chatbot_welcome_shown");
    if (this.chatWindow.classList.contains("active") && !hasShownWelcome) {
      sessionStorage.setItem("chatbot_welcome_shown", "true");
      setTimeout(() => {
        this.addMessage(
          "您好！我是 AI 智能大腦的客服顧問「小腦」。請問有什麼我可以協助您的嗎？",
          "bot",
        );
      }, 500);
    }
  },

  /**
   * 關閉聊天視窗
   */
  closeWindow() {
    this.chatWindow.classList.remove("active");
    this.chatToggle.classList.remove("active");
  },

  /**
   * 處理發送訊息
   * @param {string} message - 用戶訊息
   * @param {HTMLInputElement} inputElement - 輸入框元素
   */
  async handleSendMessage(message, inputElement) {
    this.addMessage(message, "user");
    inputElement.value = "";

    const loadingId = this.addMessage("思考中...", "bot", true);

    try {
      const response = await ChatbotCore.sendMessage(message);
      this.removeMessage(loadingId);
      this.addMessage(response, "bot");
    } catch (error) {
      this.removeMessage(loadingId);

      let errorMessage;
      if (error.message.includes("尚未配置")) {
        errorMessage =
          "AI 客服功能正在準備中，請稍後再試。\n\n如需即時協助，歡迎直接透過諮詢表單聯繫我們！";
      } else if (
        error.message.includes("Failed to fetch") ||
        error.name === "AbortError"
      ) {
        errorMessage = "網路連線似乎有問題，請檢查您的網路後再試一次。";
      } else {
        errorMessage =
          "抱歉，系統暫時無法回應。請稍後再試或直接填寫諮詢表單，我們會盡快與您聯繫。";
      }

      this.addMessage(errorMessage, "bot");
      console.error("[ChatbotUI] API error:", error.message);
    }
  },

  /**
   * 新增訊息到聊天視窗
   * @param {string} text - 訊息內容
   * @param {string} sender - 發送者 ('user' | 'bot')
   * @param {boolean} isLoading - 是否為載入狀態
   * @returns {string} 訊息 ID
   */
  addMessage(text, sender, isLoading = false) {
    const messageId = this._generateUniqueId();

    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.id = messageId;
    messageDiv.dataset.msgId = messageId;
    messageDiv.dataset.sender = sender;
    messageDiv.dataset.isLoading = isLoading ? "true" : "false";

    const avatarHtml =
      sender === "bot"
        ? '<div class="msg-avatar"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.17A7 7 0 0 1 14 23h-4a7 7 0 0 1-6.83-4H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 12 2zm-2 12a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm4 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/></svg></div>'
        : "";

    if (isLoading) {
      messageDiv.classList.add("loading");
      messageDiv.innerHTML = `${avatarHtml}<div class="message-content"><span class="loading-dots"><span></span><span></span><span></span></span></div>`;
    } else {
      messageDiv.innerHTML = `${avatarHtml}<div class="message-content">${this.formatMessage(text)}</div>`;
    }

    this.chatMessages.appendChild(messageDiv);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

    return messageId;
  },

  /**
   * 移除訊息
   * @param {string} messageId - 訊息 ID
   * @returns {boolean} 是否成功移除
   */
  removeMessage(messageId) {
    let message =
      document.getElementById(messageId) ||
      this.chatMessages.querySelector(`[data-msg-id="${messageId}"]`);

    if (message) {
      message.remove();
      return true;
    }

    const loadingMessages = this.chatMessages.querySelectorAll(
      ".chat-message.loading",
    );
    if (loadingMessages.length > 0) {
      loadingMessages[0].remove();
      return true;
    }
    return false;
  },

  /**
   * HTML 轉義（防 XSS）
   * @param {string} text - 原始文字
   * @returns {string} 轉義後的安全文字
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * 格式化訊息（先轉義再處理 Markdown）
   * @param {string} text - 原始文字
   * @returns {string} 格式化後的 HTML
   */
  formatMessage(text) {
    const safe = this.escapeHtml(text);
    return safe
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
  },

  /**
   * 取得聊天視窗狀態
   * @returns {boolean} 是否開啟
   */
  isWindowOpen() {
    return this.chatWindow?.classList.contains("active") || false;
  },
};

// 暴露到全域
window.ChatbotUI = ChatbotUI;
