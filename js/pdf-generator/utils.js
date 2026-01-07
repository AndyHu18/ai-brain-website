/**
 * PDF 生成器 - 工具函數模組
 * @module pdf-generator/utils
 */

const PDFUtils = {
    /**
     * 格式化日期
     * @param {Date} date - 日期物件
     * @returns {string} 格式化後的日期字串 YYYYMMDD
     */
    formatDate(date) {
        return date.toISOString().split('T')[0].replace(/-/g, '');
    },

    /**
     * 檢查是否需要換頁
     * @param {number} yPosition - 當前 Y 位置
     * @param {number} requiredSpace - 所需空間
     * @param {Object} doc - jsPDF 文件物件
     * @param {Object} config - 配置物件
     * @returns {number} 新的 Y 位置
     */
    checkPageBreak(yPosition, requiredSpace, doc, config) {
        if (yPosition > config.pageHeight - requiredSpace) {
            doc.addPage();
            return config.margin;
        }
        return yPosition;
    },

    /**
     * 繪製區塊標題
     * @param {Object} doc - jsPDF 文件物件
     * @param {string} title - 標題文字
     * @param {number} yPosition - Y 位置
     * @param {Object} config - 配置物件
     * @returns {number} 新的 Y 位置
     */
    drawSectionTitle(doc, title, yPosition, config) {
        // 裝飾方塊
        doc.setFillColor(...config.brandPrimary);
        doc.roundedRect(config.margin, yPosition, 8, 8, 2, 2, 'F');

        // 標題文字
        doc.setTextColor(...config.textPrimary);
        doc.setFontSize(14);
        doc.text(title, config.margin + 12, yPosition + 6);

        return yPosition + 15;
    }
};

// 暴露到全域
window.PDFUtils = PDFUtils;
