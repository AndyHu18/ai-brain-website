/**
 * PDF 生成器 - 公司介紹頁模組
 * @module pdf-generator/company-intro
 */

const PDFCompanyIntro = {
    /**
     * 繪製公司介紹頁（中文完整版）
     * @param {Object} doc - jsPDF 文件物件
     * @param {number} yPosition - 起始 Y 位置
     * @returns {number} 結束 Y 位置
     */
    draw(doc, yPosition) {
        const config = window.PDFConfig;
        const pageWidth = config.pageWidth;
        const pageHeight = config.pageHeight;
        const company = config.company;

        // 深色背景
        doc.setFillColor(...config.brandDark);
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
        doc.text('關於我們', config.margin, yPosition);

        yPosition += 15;
        doc.setFontSize(24);
        doc.text(company.name, config.margin, yPosition);

        yPosition += 10;
        doc.setTextColor(...config.brandPrimary);
        doc.setFontSize(14);
        doc.text(company.tagline, config.margin, yPosition);

        // 分隔線
        yPosition += 15;
        doc.setDrawColor(...config.brandPrimary);
        doc.setLineWidth(0.5);
        doc.line(config.margin, yPosition, config.margin + 60, yPosition);

        // 公司描述
        yPosition += 15;
        doc.setTextColor(220, 220, 220);
        doc.setFontSize(11);
        const descLines = doc.splitTextToSize(company.description, config.contentWidth);
        doc.text(descLines, config.margin, yPosition);

        // 服務項目
        yPosition += (descLines.length * 6) + 20;
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(13);
        doc.text('我們的核心服務', config.margin, yPosition);

        yPosition += 12;
        const cols = 2;
        const colWidth = config.contentWidth / cols;
        doc.setFontSize(10);
        doc.setTextColor(...config.brandPrimary);

        company.services.forEach((service, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = config.margin + (col * colWidth);
            const y = yPosition + (row * 12);
            doc.text(`▸ ${service}`, x, y);
        });

        // 聯絡資訊
        yPosition += (Math.ceil(company.services.length / cols) * 12) + 20;
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(13);
        doc.text('立即聯繫', config.margin, yPosition);

        yPosition += 12;
        doc.setFontSize(10);
        doc.setTextColor(200, 200, 200);
        doc.text(`網站：${company.website}`, config.margin, yPosition);
        yPosition += 8;
        doc.text(`電話：${company.phone}`, config.margin, yPosition);
        yPosition += 8;
        doc.text(`信箱：${company.email}`, config.margin, yPosition);

        // CTA
        yPosition += 25;
        doc.setFillColor(...config.brandPrimary);
        doc.roundedRect(config.margin, yPosition, 80, 14, 4, 4, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.text('免費諮詢', config.margin + 40, yPosition + 10, { align: 'center' });

        // 底部版權
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text(
            `© ${new Date().getFullYear()} ${company.name} 版權所有`,
            pageWidth / 2, pageHeight - 15, { align: 'center' }
        );

        return yPosition;
    },

    /**
     * 繪製公司介紹頁（英文 Fallback 版）
     * @param {Object} doc - jsPDF 文件物件
     * @param {number} yPosition - 起始 Y 位置
     * @returns {number} 結束 Y 位置
     */
    drawFallback(doc, yPosition) {
        const config = window.PDFConfig;
        const pageWidth = config.pageWidth;
        const pageHeight = config.pageHeight;
        const company = config.company;

        // 深色背景
        doc.setFillColor(...config.brandDark);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // 裝飾
        doc.setFillColor(210, 105, 30);
        doc.setGState(new doc.GState({ opacity: 0.15 }));
        doc.circle(pageWidth - 20, 50, 80, 'F');
        doc.setGState(new doc.GState({ opacity: 1 }));

        // 標題
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text('About Us', config.margin, yPosition);

        yPosition += 15;
        doc.setFontSize(24);
        doc.text('AI Brain Company', config.margin, yPosition);

        yPosition += 10;
        doc.setTextColor(...config.brandPrimary);
        doc.setFontSize(14);
        doc.text('Enterprise AI Solutions', config.margin, yPosition);

        // 分隔線
        yPosition += 15;
        doc.setDrawColor(...config.brandPrimary);
        doc.setLineWidth(0.5);
        doc.line(config.margin, yPosition, config.margin + 60, yPosition);

        // 服務列表
        yPosition += 20;
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(13);
        doc.text('Our Core Services', config.margin, yPosition);

        yPosition += 12;
        const services = [
            'Content Editor AI',
            'Voice Receptionist AI',
            'Brand Clone AI',
            'Customer Service Bot',
            'Meeting Notes AI',
            'AI Consulting'
        ];
        doc.setFontSize(10);
        doc.setTextColor(...config.brandPrimary);
        services.forEach((service, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            doc.text(`> ${service}`, config.margin + (col * 90), yPosition + (row * 12));
        });

        // 聯絡資訊
        yPosition += 50;
        doc.setTextColor(200, 200, 200);
        doc.setFontSize(10);
        doc.text(`Website: ${company.website}`, config.margin, yPosition);

        // CTA
        yPosition += 25;
        doc.setFillColor(...config.brandPrimary);
        doc.roundedRect(config.margin, yPosition, 80, 14, 4, 4, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.text('Free Consultation', config.margin + 40, yPosition + 10, { align: 'center' });

        return yPosition;
    }
};

// 暴露到全域
window.PDFCompanyIntro = PDFCompanyIntro;
