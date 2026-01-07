/**
 * PDF 生成器 - 封面頁模組
 * @module pdf-generator/cover-page
 */

const PDFCoverPage = {
    /**
     * 繪製封面頁
     * @param {Object} doc - jsPDF 文件物件
     * @param {Object} reportData - 報告數據
     * @param {number} yPosition - 起始 Y 位置
     * @returns {number} 結束 Y 位置
     */
    draw(doc, reportData, yPosition) {
        const config = window.PDFConfig;
        const pageHeight = config.pageHeight;
        const pageWidth = config.pageWidth;

        // 深色背景區域
        doc.setFillColor(...config.brandDark);
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
        doc.setTextColor(...config.brandPrimary);
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
        doc.setDrawColor(...config.brandPrimary);
        doc.setLineWidth(0.5);
        doc.line(config.margin, yPosition, pageWidth - config.margin, yPosition);

        // 六大分析維度預覽
        yPosition += 15;
        doc.setTextColor(...config.textPrimary);
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
        doc.setTextColor(...config.textSecondary);

        const cols = 2;
        const colWidth = config.contentWidth / cols;
        dimensions.forEach((dim, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = config.margin + (col * colWidth) + 10;
            const y = yPosition + (row * 12);
            doc.text(`• ${dim}`, x, y);
        });

        // 底部公司標識
        doc.setTextColor(...config.brandPrimary);
        doc.setFontSize(10);
        doc.text(`由 ${config.company.name} 提供`, pageWidth / 2, pageHeight - 20, { align: 'center' });

        doc.setTextColor(...config.textSecondary);
        doc.setFontSize(8);
        doc.text(config.company.website, pageWidth / 2, pageHeight - 12, { align: 'center' });

        return yPosition + 50;
    }
};

// 暴露到全域
window.PDFCoverPage = PDFCoverPage;
