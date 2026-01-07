/**
 * PDF 生成器 - 主入口模組
 * @module pdf-generator/index
 * @depends config.js, dependencies.js, utils.js, cover-page.js, sections.js, company-intro.js
 */

const PDFGenerator = (function () {
    'use strict';

    /**
     * 使用 html2canvas 從 HTML 元素生成 PDF（支援中文）
     * @param {HTMLElement} element - 報告 HTML 元素
     * @param {Object} reportData - 報告數據
     * @returns {Promise<boolean>}
     */
    async function generatePDFFromHTML(element, reportData) {
        console.log('📍[PDFGenerator] 使用 html2canvas 截圖模式...');

        const config = window.PDFConfig;
        const { jsPDF } = window.jspdf;
        const html2canvas = window.html2canvas;

        // 暫時隱藏不需要放入 PDF 的區塊
        const elementsToHide = [
            '.report-email-cta',
            '.report-cta',
            '.report-download-section',
            '.download-hint'
        ];

        const hiddenElements = [];
        elementsToHide.forEach(selector => {
            const els = element.querySelectorAll(selector);
            els.forEach(el => {
                hiddenElements.push({ el, display: el.style.display });
                el.style.display = 'none';
            });
        });

        // 暫時調整樣式以適應 PDF
        const originalBg = element.style.background;
        element.style.background = '#1A0F0A';

        // 截圖（提高 scale 讓文字更大更清晰）
        const canvas = await html2canvas(element, {
            scale: 3,
            useCORS: true,
            backgroundColor: '#1A0F0A',
            logging: false
        });

        // 還原隱藏的元素
        hiddenElements.forEach(({ el, display }) => {
            el.style.display = display || '';
        });
        element.style.background = originalBg;

        // 創建 PDF
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = config.pageWidth;
        const pageHeight = config.pageHeight;
        const margin = config.margin;

        // 計算圖片尺寸
        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // 處理多頁
        let yOffset = 0;
        const pageContentHeight = pageHeight - (margin * 2);
        let currentPage = 0;

        while (yOffset < imgHeight) {
            if (currentPage > 0) {
                doc.addPage();
            }

            const sourceY = (yOffset / imgHeight) * canvas.height;
            const sourceHeight = Math.min(
                (pageContentHeight / imgHeight) * canvas.height,
                canvas.height - sourceY
            );

            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;
            pageCanvas.height = sourceHeight;
            const ctx = pageCanvas.getContext('2d');
            ctx.drawImage(
                canvas,
                0, sourceY, canvas.width, sourceHeight,
                0, 0, canvas.width, sourceHeight
            );

            const imgData = pageCanvas.toDataURL('image/jpeg', 0.95);
            const renderHeight = (sourceHeight / canvas.height) * imgHeight;
            doc.addImage(imgData, 'JPEG', margin, margin, imgWidth, renderHeight);

            yOffset += pageContentHeight;
            currentPage++;
        }

        // 添加公司介紹頁
        doc.addPage();
        window.PDFCompanyIntro.drawFallback(doc, config.margin);

        // 下載
        const filename = `AI分析報告_${reportData.websiteTitle || '網站'}_${window.PDFUtils.formatDate(new Date())}.pdf`;
        doc.save(filename);

        console.log('📍[PDFGenerator] PDF (html2canvas) 生成成功:', filename);
        return true;
    }

    /**
     * 純 jsPDF 繪製（英文 fallback，無中文支援）
     * @param {Object} reportData - 報告數據
     * @returns {Promise<boolean>}
     */
    async function generatePDFNative(reportData) {
        console.log('📍[PDFGenerator] 使用原生繪製模式...');

        const config = window.PDFConfig;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        doc.setFont('helvetica');
        let yPosition = config.margin;

        // 第一頁：報告封面
        yPosition = window.PDFCoverPage.draw(doc, reportData, yPosition);

        // 第二頁開始：分析內容
        doc.addPage();
        yPosition = config.margin;

        if (reportData.analysis?.summary) {
            yPosition = window.PDFSections.drawSection(
                doc, 'Executive Summary', reportData.analysis.summary, yPosition
            );
        }

        if (reportData.analysis?.services?.length > 0) {
            yPosition = window.PDFSections.drawServicesSection(
                doc, reportData.analysis.services, yPosition
            );
        }

        if (reportData.analysis?.aiOpportunities?.length > 0) {
            yPosition = window.PDFSections.drawOpportunitiesSection(
                doc, reportData.analysis.aiOpportunities, yPosition
            );
        }

        if (reportData.analysis?.departmentInsights?.length > 0) {
            yPosition = window.PDFSections.drawDepartmentsSection(
                doc, reportData.analysis.departmentInsights, yPosition
            );
        }

        // 最後一頁：公司介紹
        doc.addPage();
        window.PDFCompanyIntro.draw(doc, config.margin);

        // 下載 PDF
        const filename = `AI_Report_${reportData.websiteTitle || 'Website'}_${window.PDFUtils.formatDate(new Date())}.pdf`;
        doc.save(filename);

        console.log('📍[PDFGenerator] PDF (native) 生成成功:', filename);
        return true;
    }

    /**
     * 生成 PDF 報告（主入口）
     * @param {Object} reportData - 分析報告數據
     * @returns {Promise<boolean>}
     */
    async function generatePDF(reportData) {
        console.log('📍[PDFGenerator] 開始生成 PDF...');

        try {
            await window.PDFDependencies.load();

            const reportElement = document.getElementById('analyzer-result');

            if (reportElement && reportElement.innerHTML.trim() !== '') {
                return await generatePDFFromHTML(reportElement, reportData);
            } else {
                return await generatePDFNative(reportData);
            }

        } catch (error) {
            console.error('📍[PDFGenerator] PDF 生成失敗:', error);
            throw error;
        }
    }

    // 公開 API
    return {
        generatePDF,
        get CONFIG() { return window.PDFConfig; }
    };
})();

// 掛載到全域
window.PDFGenerator = PDFGenerator;

console.log('📍[PDFGenerator] 模組載入完成');
