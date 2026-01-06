/**
 * @file    : script-service-nav.js
 * @purpose : 服務頁面導航控制（透明導航欄滾動狀態 + 浮動返回按鈕）
 * @depends : 無
 */

(function () {
    'use strict';

    /**
     * 初始化透明導航欄滾動效果
     */
    function initTransparentNavbar() {
        const navbar = document.querySelector('.navbar-transparent');
        if (!navbar) return;

        const heroSection = document.querySelector('.service-hero');
        const heroHeight = heroSection ? heroSection.offsetHeight : 400;
        const scrollThreshold = heroHeight * 0.3; // 滾動超過 hero 30% 時變換

        function updateNavbarState() {
            if (window.scrollY > scrollThreshold) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        // 防抖優化
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateNavbarState();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // 初始化狀態
        updateNavbarState();
    }

    /**
     * 創建並初始化浮動返回按鈕
     */
    function initFloatingBackButton() {
        // 如果已存在則跳過
        if (document.querySelector('.floating-back-btn')) return;

        // 創建按鈕元素
        const backBtn = document.createElement('a');
        backBtn.href = '../index.html';
        backBtn.className = 'floating-back-btn';
        backBtn.innerHTML = '<span class="back-icon">←</span> 返回首頁';
        backBtn.setAttribute('aria-label', '返回首頁');

        document.body.appendChild(backBtn);

        const heroSection = document.querySelector('.service-hero');
        const heroHeight = heroSection ? heroSection.offsetHeight : 400;
        const showThreshold = heroHeight * 0.5; // 滾動超過 hero 50% 時顯示

        function updateButtonVisibility() {
            if (window.scrollY > showThreshold) {
                backBtn.classList.add('visible');
            } else {
                backBtn.classList.remove('visible');
            }
        }

        // 防抖優化
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateButtonVisibility();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // 初始化狀態
        updateButtonVisibility();
    }

    /**
     * 手機版選單切換（支援透明導航欄）
     */
    function initMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (!navToggle || !navMenu) return;

        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');

            const spans = navToggle.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        });

        // 點擊連結後關閉選單
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            });
        });
    }

    /**
     * 主初始化
     */
    function init() {
        initTransparentNavbar();
        initFloatingBackButton();
        initMobileMenu();
        console.log('📍[ServiceNav] 服務頁面導航已初始化');
    }

    // DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
