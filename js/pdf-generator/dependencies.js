/**
 * PDF 生成器 - 依賴載入模組
 * @module pdf-generator/dependencies
 */

const PDFDependencies = {
    /** @type {boolean} 是否已載入 */
    loaded: false,

    /**
     * 載入 CDN 依賴
     * @returns {Promise<void>}
     */
    async load() {
        if (this.loaded) {
            return;
        }

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

        this.loaded = true;
        console.log('📍[PDFGenerator] 依賴載入完成');
    }
};

// 暴露到全域
window.PDFDependencies = PDFDependencies;
