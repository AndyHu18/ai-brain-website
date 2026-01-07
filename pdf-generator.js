/**
 * @file    : pdf-generator.js
 * @purpose : 分析報告 PDF 生成模組（含公司介紹）
 * @version : 1.0.0
 * @depends : jsPDF, html2canvas (CDN)
 */

const PDFGenerator = (function () {
    'use strict';

    // PDF 配置（軟編碼）
    const CONFIG = {
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

    /**
     * 載入 CDN 依賴
     */
    async function loadDependencies() {
        const scripts = [
            'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
        ];

        for (const src of scripts) {
            if (!document.querySelector(`script[src="${src}"]`)) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = src;
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }
        }

        console.log('📍[PDFGenerator] 依賴載入完成');
    }

    /**
     * 生成 PDF 報告
     * @param {Object} reportData - 分析報告數據
     */
    async function generatePDF(reportData) {
        console.log('📍[PDFGenerator] 開始生成 PDF...');

        try {
            await loadDependencies();

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // 載入中文字體支援
            doc.setFont('helvetica');

            let yPosition = CONFIG.margin;

            // ============================================================
            // 第一頁：報告封面
            // ============================================================
            yPosition = drawCoverPage(doc, reportData, yPosition);

            // ============================================================
            // 第二頁開始：分析內容
            // ============================================================
            doc.addPage();
            yPosition = CONFIG.margin;

            // 執行摘要
            if (reportData.analysis?.summary) {
                yPosition = drawSection(doc, '執行摘要', reportData.analysis.summary, yPosition);
            }

            // 服務項目
            if (reportData.analysis?.services?.length > 0) {
                yPosition = drawServicesSection(doc, reportData.analysis.services, yPosition);
            }

            // AI 機會
            if (reportData.analysis?.aiOpportunities?.length > 0) {
                yPosition = drawOpportunitiesSection(doc, reportData.analysis.aiOpportunities, yPosition);
            }

            // 部門賦能
            if (reportData.analysis?.departmentInsights?.length > 0) {
                yPosition = drawDepartmentsSection(doc, reportData.analysis.departmentInsights, yPosition);
            }

            // ============================================================
            // 最後一頁：公司介紹
            // ============================================================
            doc.addPage();
            yPosition = CONFIG.margin;
            yPosition = drawCompanyIntro(doc, yPosition);

            // 下載 PDF
            const filename = `AI分析報告_${reportData.websiteTitle || '網站'}_${formatDate(new Date())}.pdf`;
            doc.save(filename);

            console.log('📍[PDFGenerator] PDF 生成成功:', filename);
            return true;

        } catch (error) {
            console.error('📍[PDFGenerator] PDF 生成失敗:', error);
            throw error;
        }
    }

    /**
     * 繪製封面頁
     */
    function drawCoverPage(doc, reportData, yPosition) {
        const pageHeight = CONFIG.pageHeight;
        const pageWidth = CONFIG.pageWidth;

        // 深色背景區域
        doc.setFillColor(...CONFIG.brandDark);
        doc.rect(0, 0, pageWidth, 120, 'F');

        // 裝飾圓形
        doc.setFillColor(210, 105, 30);
        doc.setGState(new doc.GState({ opacity: 0.1 }));
        doc.circle(pageWidth - 30, 40, 60, 'F');
        doc.setGState(new doc.GState({ opacity: 1 }));

        // 標題
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.text('AI 賦能診斷報告', pageWidth / 2, 50, { align: 'center' });

        // 副標題
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text('30 秒看懂：AI 能幫你省多少？', pageWidth / 2, 65, { align: 'center' });

        // 網站資訊
        doc.setFontSize(16);
        doc.setTextColor(...CONFIG.brandPrimary);
        doc.text(reportData.websiteTitle || '目標網站', pageWidth / 2, 90, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(200, 200, 200);
        doc.text(reportData.websiteUrl || '', pageWidth / 2, 100, { align: 'center' });

        // 生成時間
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(9);
        const genTime = new Date(reportData.generatedAt || Date.now()).toLocaleString('zh-TW');
        doc.text(`報告生成時間：${genTime}`, pageWidth / 2, 110, { align: 'center' });

        // 分隔線
        yPosition = 140;
        doc.setDrawColor(...CONFIG.brandPrimary);
        doc.setLineWidth(0.5);
        doc.line(CONFIG.margin, yPosition, pageWidth - CONFIG.margin, yPosition);

        // 六大分析維度預覽
        yPosition += 15;
        doc.setTextColor(...CONFIG.textPrimary);
        doc.setFontSize(14);
        doc.text('六大 AI 賦能維度分析', pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 15;
        const dimensions = [
            '網站服務項目識別',
            'AI 自動化機會分析',
            '部門賦能機會',
            '職位層級賦能建議',
            '網站 AI 優化建議',
            '銷售漏斗 AI 應用'
        ];

        doc.setFontSize(11);
        doc.setTextColor(...CONFIG.textSecondary);

        const cols = 2;
        const colWidth = CONFIG.contentWidth / cols;
        dimensions.forEach((dim, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = CONFIG.margin + (col * colWidth) + 10;
            const y = yPosition + (row * 12);
            doc.text(`• ${dim}`, x, y);
        });

        // 底部公司標識
        doc.setTextColor(...CONFIG.brandPrimary);
        doc.setFontSize(10);
        doc.text(`由 ${CONFIG.company.name} 提供`, pageWidth / 2, pageHeight - 20, { align: 'center' });

        doc.setTextColor(...CONFIG.textSecondary);
        doc.setFontSize(8);
        doc.text(CONFIG.company.website, pageWidth / 2, pageHeight - 12, { align: 'center' });

        return yPosition + 50;
    }

    /**
     * 繪製通用區塊
     */
    function drawSection(doc, title, content, yPosition) {
        // 檢查是否需要換頁
        if (yPosition > CONFIG.pageHeight - 60) {
            doc.addPage();
            yPosition = CONFIG.margin;
        }

        // 區塊標題
        doc.setFillColor(...CONFIG.brandPrimary);
        doc.roundedRect(CONFIG.margin, yPosition, 8, 8, 2, 2, 'F');

        doc.setTextColor(...CONFIG.textPrimary);
        doc.setFontSize(14);
        doc.text(title, CONFIG.margin + 12, yPosition + 6);

        yPosition += 15;

        // 內容文字（自動換行）
        doc.setTextColor(...CONFIG.textSecondary);
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(content, CONFIG.contentWidth);
        doc.text(lines, CONFIG.margin, yPosition);

        return yPosition + (lines.length * 5) + 15;
    }

    /**
     * 繪製服務項目區塊
     */
    function drawServicesSection(doc, services, yPosition) {
        if (yPosition > CONFIG.pageHeight - 80) {
            doc.addPage();
            yPosition = CONFIG.margin;
        }

        // 區塊標題
        doc.setFillColor(...CONFIG.brandPrimary);
        doc.roundedRect(CONFIG.margin, yPosition, 8, 8, 2, 2, 'F');

        doc.setTextColor(...CONFIG.textPrimary);
        doc.setFontSize(14);
        doc.text('網站服務項目識別', CONFIG.margin + 12, yPosition + 6);

        yPosition += 15;

        // 服務卡片
        services.forEach((service, index) => {
            if (yPosition > CONFIG.pageHeight - 40) {
                doc.addPage();
                yPosition = CONFIG.margin;
            }

            // 卡片背景
            doc.setFillColor(255, 252, 249);
            doc.roundedRect(CONFIG.margin, yPosition, CONFIG.contentWidth, 25, 3, 3, 'F');

            // 服務名稱
            doc.setTextColor(...CONFIG.textPrimary);
            doc.setFontSize(11);
            doc.text(service.name || `服務 ${index + 1}`, CONFIG.margin + 5, yPosition + 8);

            // 服務描述
            doc.setTextColor(...CONFIG.textSecondary);
            doc.setFontSize(9);
            const desc = service.description || '';
            const descLines = doc.splitTextToSize(desc, CONFIG.contentWidth - 10);
            doc.text(descLines.slice(0, 2), CONFIG.margin + 5, yPosition + 16);

            // 類別標籤
            if (service.category) {
                doc.setFillColor(210, 105, 30);
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(8);
                const tagWidth = doc.getTextWidth(service.category) + 8;
                doc.roundedRect(CONFIG.margin + CONFIG.contentWidth - tagWidth - 5, yPosition + 4, tagWidth, 10, 2, 2, 'F');
                doc.text(service.category, CONFIG.margin + CONFIG.contentWidth - tagWidth / 2 - 1, yPosition + 10, { align: 'center' });
            }

            yPosition += 30;
        });

        return yPosition + 10;
    }

    /**
     * 繪製 AI 機會表格
     */
    function drawOpportunitiesSection(doc, opportunities, yPosition) {
        if (yPosition > CONFIG.pageHeight - 80) {
            doc.addPage();
            yPosition = CONFIG.margin;
        }

        // 區塊標題
        doc.setFillColor(...CONFIG.brandPrimary);
        doc.roundedRect(CONFIG.margin, yPosition, 8, 8, 2, 2, 'F');

        doc.setTextColor(...CONFIG.textPrimary);
        doc.setFontSize(14);
        doc.text('AI 自動化機會分析', CONFIG.margin + 12, yPosition + 6);

        yPosition += 15;

        // 表頭
        const colWidths = [45, 60, 45, 30];
        const headers = ['領域', 'AI 應用', '預估效益', '難度'];

        doc.setFillColor(...CONFIG.brandDark);
        doc.rect(CONFIG.margin, yPosition, CONFIG.contentWidth, 10, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        let xPos = CONFIG.margin + 3;
        headers.forEach((header, i) => {
            doc.text(header, xPos, yPosition + 7);
            xPos += colWidths[i];
        });

        yPosition += 12;

        // 表格內容
        doc.setTextColor(...CONFIG.textPrimary);
        opportunities.forEach((opp, index) => {
            if (yPosition > CONFIG.pageHeight - 20) {
                doc.addPage();
                yPosition = CONFIG.margin;
            }

            // 斑馬紋背景
            if (index % 2 === 0) {
                doc.setFillColor(255, 252, 249);
                doc.rect(CONFIG.margin, yPosition - 3, CONFIG.contentWidth, 12, 'F');
            }

            xPos = CONFIG.margin + 3;
            doc.setFontSize(8);

            // 領域
            doc.text(String(opp.area || '').substring(0, 12), xPos, yPosition + 4);
            xPos += colWidths[0];

            // AI 應用
            doc.text(String(opp.application || '').substring(0, 18), xPos, yPosition + 4);
            xPos += colWidths[1];

            // 預估效益
            doc.setTextColor(39, 174, 96);
            doc.text(String(opp.estimatedBenefit || '').substring(0, 12), xPos, yPosition + 4);
            xPos += colWidths[2];

            // 難度標籤
            const diffColors = {
                low: [39, 174, 96],
                medium: [241, 196, 15],
                high: [231, 76, 60]
            };
            const diffText = { low: '低', medium: '中', high: '高' };
            doc.setTextColor(...(diffColors[opp.difficulty] || CONFIG.textPrimary));
            doc.text(diffText[opp.difficulty] || '-', xPos, yPosition + 4);

            doc.setTextColor(...CONFIG.textPrimary);
            yPosition += 12;
        });

        return yPosition + 10;
    }

    /**
     * 繪製部門賦能區塊
     */
    function drawDepartmentsSection(doc, departments, yPosition) {
        if (yPosition > CONFIG.pageHeight - 80) {
            doc.addPage();
            yPosition = CONFIG.margin;
        }

        // 區塊標題
        doc.setFillColor(...CONFIG.brandPrimary);
        doc.roundedRect(CONFIG.margin, yPosition, 8, 8, 2, 2, 'F');

        doc.setTextColor(...CONFIG.textPrimary);
        doc.setFontSize(14);
        doc.text('部門賦能機會', CONFIG.margin + 12, yPosition + 6);

        yPosition += 15;

        departments.forEach(dept => {
            if (yPosition > CONFIG.pageHeight - 50) {
                doc.addPage();
                yPosition = CONFIG.margin;
            }

            // 部門名稱
            doc.setTextColor(...CONFIG.brandPrimary);
            doc.setFontSize(11);
            doc.text(dept.department || '部門', CONFIG.margin, yPosition);

            yPosition += 8;

            // 機會列表
            doc.setTextColor(...CONFIG.textSecondary);
            doc.setFontSize(9);
            (dept.opportunities || []).forEach(opp => {
                doc.text(`  • ${opp}`, CONFIG.margin, yPosition);
                yPosition += 6;
            });

            // 推薦工具
            if (dept.tools?.length > 0) {
                doc.setTextColor(...CONFIG.textPrimary);
                doc.setFontSize(8);
                doc.text(`    推薦工具：${dept.tools.join('、')}`, CONFIG.margin, yPosition);
                yPosition += 10;
            }

            yPosition += 5;
        });

        return yPosition + 10;
    }

    /**
     * 繪製公司介紹頁
     */
    function drawCompanyIntro(doc, yPosition) {
        const pageWidth = CONFIG.pageWidth;
        const pageHeight = CONFIG.pageHeight;
        const company = CONFIG.company;

        // 深色背景
        doc.setFillColor(...CONFIG.brandDark);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // 裝飾
        doc.setFillColor(210, 105, 30);
        doc.setGState(new doc.GState({ opacity: 0.15 }));
        doc.circle(pageWidth - 20, 50, 80, 'F');
        doc.circle(30, pageHeight - 50, 60, 'F');
        doc.setGState(new doc.GState({ opacity: 1 }));

        // 標題區
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text('關於我們', CONFIG.margin, yPosition);

        yPosition += 15;
        doc.setFontSize(24);
        doc.text(company.name, CONFIG.margin, yPosition);

        yPosition += 10;
        doc.setTextColor(...CONFIG.brandPrimary);
        doc.setFontSize(14);
        doc.text(company.tagline, CONFIG.margin, yPosition);

        // 分隔線
        yPosition += 15;
        doc.setDrawColor(...CONFIG.brandPrimary);
        doc.setLineWidth(0.5);
        doc.line(CONFIG.margin, yPosition, CONFIG.margin + 60, yPosition);

        // 公司描述
        yPosition += 15;
        doc.setTextColor(220, 220, 220);
        doc.setFontSize(11);
        const descLines = doc.splitTextToSize(company.description, CONFIG.contentWidth);
        doc.text(descLines, CONFIG.margin, yPosition);

        // 服務項目
        yPosition += (descLines.length * 6) + 20;
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(13);
        doc.text('我們的核心服務', CONFIG.margin, yPosition);

        yPosition += 12;
        const cols = 2;
        const colWidth = CONFIG.contentWidth / cols;
        doc.setFontSize(10);
        doc.setTextColor(...CONFIG.brandPrimary);

        company.services.forEach((service, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = CONFIG.margin + (col * colWidth);
            const y = yPosition + (row * 12);
            doc.text(`▸ ${service}`, x, y);
        });

        // 聯絡資訊
        yPosition += (Math.ceil(company.services.length / cols) * 12) + 20;
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(13);
        doc.text('立即聯繫', CONFIG.margin, yPosition);

        yPosition += 12;
        doc.setFontSize(10);
        doc.setTextColor(200, 200, 200);
        doc.text(`網站：${company.website}`, CONFIG.margin, yPosition);
        yPosition += 8;
        doc.text(`電話：${company.phone}`, CONFIG.margin, yPosition);
        yPosition += 8;
        doc.text(`信箱：${company.email}`, CONFIG.margin, yPosition);

        // CTA
        yPosition += 25;
        doc.setFillColor(...CONFIG.brandPrimary);
        doc.roundedRect(CONFIG.margin, yPosition, 80, 14, 4, 4, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.text('免費諮詢', CONFIG.margin + 40, yPosition + 10, { align: 'center' });

        // 底部版權
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text(`© ${new Date().getFullYear()} ${company.name} 版權所有`, pageWidth / 2, pageHeight - 15, { align: 'center' });

        return yPosition;
    }

    /**
     * 格式化日期
     */
    function formatDate(date) {
        return date.toISOString().split('T')[0].replace(/-/g, '');
    }

    // 公開 API
    return {
        generatePDF,
        CONFIG
    };
})();

// 掛載到全域
window.PDFGenerator = PDFGenerator;
