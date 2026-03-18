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
  const navbar = document.querySelector(".navbar");
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");

  // 透明導航欄由 script-service-nav.js 獨立控制，此處跳過
  const isTransparent =
    navbar && navbar.classList.contains("navbar-transparent");

  // 滾動時導航列效果 - 使用 CSS class 切換
  let lastScrollY = 0;
  if (!isTransparent) {
    window.addEventListener("scroll", () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 50) {
        navbar.classList.add("navbar-scrolled");
      } else {
        navbar.classList.remove("navbar-scrolled");
      }

      lastScrollY = currentScrollY;
    });
  }

  // 手機版選單切換
  navToggle?.addEventListener("click", () => {
    navMenu.classList.toggle("active");

    // 漢堡選單動畫
    const spans = navToggle.querySelectorAll("span");
    if (navMenu.classList.contains("active")) {
      spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
      spans[1].style.opacity = "0";
      spans[2].style.transform = "rotate(-45deg) translate(5px, -5px)";
    } else {
      spans[0].style.transform = "";
      spans[1].style.opacity = "";
      spans[2].style.transform = "";
    }
  });

  // 點擊連結後關閉選單
  navMenu?.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active");
      const spans = navToggle.querySelectorAll("span");
      spans[0].style.transform = "";
      spans[1].style.opacity = "";
      spans[2].style.transform = "";
    });
  });
}

/**
 * 平滑滾動
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        const navHeight = document.querySelector(".navbar").offsetHeight;
        const targetPosition = targetElement.offsetTop - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });
}

/**
 * 滾動動畫 (Intersection Observer)
 * 增加 rootMargin 讓元素提早觸發動畫
 */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    ".service-card, .solution-item, .tech-category",
  );

  const observerOptions = {
    root: null,
    // 📍 關鍵改動：提前 300px 開始偵測，讓內容在用戶滑到前就開始顯示
    rootMargin: "0px 0px 300px 0px",
    threshold: 0.01, // 只需 1% 可見就觸發
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach((el, index) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    // 縮短延遲時間，讓動畫更快完成
    el.style.transition = `opacity 0.4s ease ${index * 0.05}s, transform 0.4s ease ${index * 0.05}s`;
    observer.observe(el);
  });
}

// 自動初始化
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initSmoothScroll();
  initScrollAnimations();
});
