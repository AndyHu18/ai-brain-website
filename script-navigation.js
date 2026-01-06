/**
 * @file    : script-navigation.js
 * @purpose : 導覽、滾動、選單功能
 * @depends : 無
 * @lines   : ~100
 */

/**
 * 導航列功能
 */
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    // 滾動時導航列效果
    let lastScrollY = 0;
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 100) {
            // 滾動後：增強陰影層次
            navbar.style.background = 'linear-gradient(180deg, #FFFFFF 0%, #FDF9F3 100%)';
            navbar.style.boxShadow = '0 2px 0 rgba(210, 105, 30, 0.1), 0 6px 20px rgba(62, 39, 35, 0.08)';
        } else {
            // 頂部：柔和層次
            navbar.style.background = 'linear-gradient(180deg, #FFFFFF 0%, #FDF9F3 100%)';
            navbar.style.boxShadow = '0 1px 0 rgba(210, 105, 30, 0.08), 0 4px 12px rgba(62, 39, 35, 0.04)';
        }

        lastScrollY = currentScrollY;
    });

    // 手機版選單切換
    navToggle?.addEventListener('click', () => {
        navMenu.classList.toggle('active');

        // 漢堡選單動畫
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
    navMenu?.querySelectorAll('.nav-link').forEach(link => {
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
 * 平滑滾動
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * 滾動動畫 (Intersection Observer)
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.service-card, .solution-item, .tech-category'
    );

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });
}
