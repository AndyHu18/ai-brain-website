/**
 * PDF 生成器 - 報告區塊繪製模組
 * @module pdf-generator/sections
 */

const PDFSections = {
    /**
     * 繪製通用文字區塊
     * @param {Object} doc - jsPDF 文件物件
     * @param {string} title - 區塊標題
     * @param {string} content - 區塊內容
     * @param {number} yPosition - 起始 Y 位置
     * @returns {number} 結束 Y 位置
     */
    drawSection(doc, title, content, yPosition) {
        const config = window.PDFConfig;
        yPosition = window.PDFUtils.checkPageBreak(yPosition, 60, doc, config);
        yPosition = window.PDFUtils.drawSectionTitle(doc, title, yPosition, config);

        // 內容文字（自動換行）
        doc.setTextColor(...config.textSecondary);
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(content, config.contentWidth);
        doc.text(lines, config.margin, yPosition);

        return yPosition + (lines.length * 5) + 15;
    },

    /**
     * 繪製服務項目區塊
     * @param {Object} doc - jsPDF 文件物件
     * @param {Array} services - 服務列表
     * @param {number} yPosition - 起始 Y 位置
     * @returns {number} 結束 Y 位置
     */
    drawServicesSection(doc, services, yPosition) {
        const config = window.PDFConfig;
        yPosition = window.PDFUtils.checkPageBreak(yPosition, 80, doc, config);
        yPosition = window.PDFUtils.drawSectionTitle(doc, '網站服務項目識別', yPosition, config);

        services.forEach((service, index) => {
            yPosition = window.PDFUtils.checkPageBreak(yPosition, 40, doc, config);

            // 卡片背景
            doc.setFillColor(255, 252, 249);
            doc.roundedRect(config.margin, yPosition, config.contentWidth, 25, 3, 3, 'F');

            // 服務名稱
            doc.setTextColor(...config.textPrimary);
            doc.setFontSize(11);
            doc.text(service.name || `服務 ${index + 1}`, config.margin + 5, yPosition + 8);

            // 服務描述
            doc.setTextColor(...config.textSecondary);
            doc.setFontSize(9);
            const desc = service.description || '';
            const descLines = doc.splitTextToSize(desc, config.contentWidth - 10);
            doc.text(descLines.slice(0, 2), config.margin + 5, yPosition + 16);

            // 類別標籤
            if (service.category) {
                doc.setFillColor(210, 105, 30);
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(8);
                const tagWidth = doc.getTextWidth(service.category) + 8;
                doc.roundedRect(
                    config.margin + config.contentWidth - tagWidth - 5,
                    yPosition + 4, tagWidth, 10, 2, 2, 'F'
                );
                doc.text(
                    service.category,
                    config.margin + config.contentWidth - tagWidth / 2 - 1,
                    yPosition + 10, { align: 'center' }
                );
            }

            yPosition += 30;
        });

        return yPosition + 10;
    },

    /**
     * 繪製 AI 機會表格
     * @param {Object} doc - jsPDF 文件物件
     * @param {Array} opportunities - 機會列表
     * @param {number} yPosition - 起始 Y 位置
     * @returns {number} 結束 Y 位置
     */
    drawOpportunitiesSection(doc, opportunities, yPosition) {
        const config = window.PDFConfig;
        yPosition = window.PDFUtils.checkPageBreak(yPosition, 80, doc, config);
        yPosition = window.PDFUtils.drawSectionTitle(doc, 'AI 自動化機會分析', yPosition, config);

        // 表頭
        const colWidths = [45, 60, 45, 30];
        const headers = ['領域', 'AI 應用', '預估效益', '難度'];

        doc.setFillColor(...config.brandDark);
        doc.rect(config.margin, yPosition, config.contentWidth, 10, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        let xPos = config.margin + 3;
        headers.forEach((header, i) => {
            doc.text(header, xPos, yPosition + 7);
            xPos += colWidths[i];
        });

        yPosition += 12;

        // 表格內容
        doc.setTextColor(...config.textPrimary);
        opportunities.forEach((opp, index) => {
            yPosition = window.PDFUtils.checkPageBreak(yPosition, 20, doc, config);

            // 斑馬紋背景
            if (index % 2 === 0) {
                doc.setFillColor(255, 252, 249);
                doc.rect(config.margin, yPosition - 3, config.contentWidth, 12, 'F');
            }

            xPos = config.margin + 3;
            doc.setFontSize(8);

            // 領域
            doc.setTextColor(...config.textPrimary);
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
            doc.setTextColor(...(diffColors[opp.difficulty] || config.textPrimary));
            doc.text(diffText[opp.difficulty] || '-', xPos, yPosition + 4);

            yPosition += 12;
        });

        return yPosition + 10;
    },

    /**
     * 繪製部門賦能區塊
     * @param {Object} doc - jsPDF 文件物件
     * @param {Array} departments - 部門列表
     * @param {number} yPosition - 起始 Y 位置
     * @returns {number} 結束 Y 位置
     */
    drawDepartmentsSection(doc, departments, yPosition) {
        const config = window.PDFConfig;
        yPosition = window.PDFUtils.checkPageBreak(yPosition, 80, doc, config);
        yPosition = window.PDFUtils.drawSectionTitle(doc, '部門賦能機會', yPosition, config);

        departments.forEach(dept => {
            yPosition = window.PDFUtils.checkPageBreak(yPosition, 50, doc, config);

            // 部門名稱
            doc.setTextColor(...config.brandPrimary);
            doc.setFontSize(11);
            doc.text(dept.department || '部門', config.margin, yPosition);

            yPosition += 8;

            // 機會列表
            doc.setTextColor(...config.textSecondary);
            doc.setFontSize(9);
            (dept.opportunities || []).forEach(opp => {
                doc.text(`  • ${opp}`, config.margin, yPosition);
                yPosition += 6;
            });

            // 推薦工具
            if (dept.tools?.length > 0) {
                doc.setTextColor(...config.textPrimary);
                doc.setFontSize(8);
                doc.text(`    推薦工具：${dept.tools.join('、')}`, config.margin, yPosition);
                yPosition += 10;
            }

            yPosition += 5;
        });

        return yPosition + 10;
    }
};

// 暴露到全域
window.PDFSections = PDFSections;
