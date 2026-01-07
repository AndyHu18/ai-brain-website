/**
 * PDF 生成器 - 配置模組
 * @module pdf-generator/config
 */

const PDFConfig = {
    // 頁面設定
    pageWidth: 210,         // A4 寬度 mm
    pageHeight: 297,        // A4 高度 mm
    margin: 15,             // 頁邊距 mm
    contentWidth: 180,      // 內容寬度 mm
    lineHeight: 7,          // 行高 mm

    // 品牌色彩
    brandPrimary: [210, 105, 30],    // #D2691E
    brandDark: [26, 15, 10],         // #1A0F0A
    textPrimary: [26, 15, 10],       // #1A0F0A
    textSecondary: [93, 64, 55],     // #5D4037

    // 公司資訊（軟編碼）
    company: {
        name: 'AI 智能大腦公司',
        tagline: '企業級 AI 導入專家',
        website: 'https://ai-brain.com.tw',
        phone: '(02) 2345-6789',
        email: 'contact@ai-brain.com.tw',
        description: '我們專注於將人工智慧技術轉化為可落地的商業解決方案，協助企業降低營運成本、提升服務效率、創造競爭優勢。',
        services: [
            '自動流量小編',
            '智慧接線生',
            '品牌分身術',
            '客服機器人',
            '智慧會議秘書',
            'AI 顧問'
        ]
    }
};

// 暴露到全域
window.PDFConfig = PDFConfig;
