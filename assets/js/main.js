/* ============================================================
   北京中航华信机电设备安装有限公司 官网交互脚本
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 头部滚动状态 ---------- */
  const header = document.querySelector(".header");
  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 10);
  };
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- 移动端导航 ---------- */
  const hamburger = document.querySelector(".hamburger");
  const nav = document.querySelector(".nav");
  let overlay = document.querySelector(".nav-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "nav-overlay";
    document.body.appendChild(overlay);
  }
  const closeNav = () => {
    hamburger && hamburger.classList.remove("open");
    nav && nav.classList.remove("open");
    overlay.classList.remove("show");
    document.body.style.overflow = "";
  };
  hamburger && hamburger.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    hamburger.classList.toggle("open", open);
    overlay.classList.toggle("show", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  overlay.addEventListener("click", closeNav);
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeNav());

  /* 移动端子菜单展开 */
  document.querySelectorAll(".nav > li.has-sub > a").forEach((link) => {
    link.addEventListener("click", (e) => {
      if (window.innerWidth <= 991) {
        e.preventDefault();
        link.parentElement.classList.toggle("open");
      }
    });
  });
  document.querySelectorAll(".nav a").forEach((a) => {
    a.addEventListener("click", () => {
      if (window.innerWidth <= 991 && !a.parentElement.classList.contains("has-sub")) closeNav();
    });
  });

  /* ---------- 首屏轮播 ---------- */
  const hero = document.querySelector(".hero");
  if (hero) {
    const slides = hero.querySelectorAll(".hero-slide");
    const dotsWrap = hero.querySelector(".hero-dots");
    const prevBtn = hero.querySelector(".hero-arrows .prev");
    const nextBtn = hero.querySelector(".hero-arrows .next");
    let idx = 0, timer = null;
    const DURATION = 6000;

    // 生成指示点
    if (dotsWrap && slides.length > 1) {
      slides.forEach((_, i) => {
        const b = document.createElement("button");
        b.setAttribute("aria-label", "第" + (i + 1) + "屏");
        if (i === 0) b.classList.add("active");
        b.addEventListener("click", () => { go(i); restart(); });
        dotsWrap.appendChild(b);
      });
    }
    const dots = dotsWrap ? dotsWrap.querySelectorAll("button") : [];

    function go(i) {
      slides[idx].classList.remove("active");
      idx = (i + slides.length) % slides.length;
      slides[idx].classList.add("active");
      dots.forEach((d, j) => d.classList.toggle("active", j === idx));
    }
    function restart() { clearInterval(timer); timer = setInterval(() => go(idx + 1), DURATION); }

    prevBtn && prevBtn.addEventListener("click", () => { go(idx - 1); restart(); });
    nextBtn && nextBtn.addEventListener("click", () => { go(idx + 1); restart(); });

    // 触屏滑动
    let startX = 0;
    hero.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 60) { go(idx + (dx < 0 ? 1 : -1)); restart(); }
    }, { passive: true });

    hero.addEventListener("mouseenter", () => clearInterval(timer));
    hero.addEventListener("mouseleave", restart);
    if (slides.length > 1) restart();
  }

  /* ---------- 首屏粒子网络 ---------- */
  const heroCanvas = document.querySelector(".hero-canvas");
  if (heroCanvas) {
    const ctx = heroCanvas.getContext("2d");
    let W, H, particles = [];
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    function sizeCanvas() {
      W = heroCanvas.width = heroCanvas.offsetWidth * DPR;
      H = heroCanvas.height = heroCanvas.offsetHeight * DPR;
      heroCanvas.style.width = heroCanvas.offsetWidth + "px";
      heroCanvas.style.height = heroCanvas.offsetHeight + "px";
    }
    function makeParticles() {
      const n = Math.min(70, Math.round(W / (28 * DPR)));
      particles = [];
      for (let i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - .5) * .35 * DPR, vy: (Math.random() - .5) * .35 * DPR,
          r: (Math.random() * 1.6 + .8) * DPR
        });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const linkDist = 130 * DPR;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(120, 200, 255, .55)";
        ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = "rgba(90, 170, 240, " + (0.22 * (1 - d / linkDist)).toFixed(3) + ")";
            ctx.lineWidth = 1 * DPR * 0.6;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    sizeCanvas();
    makeParticles();
    draw();
    window.addEventListener("resize", () => { sizeCanvas(); makeParticles(); });
  }

  /* ---------- 数字滚动 ---------- */
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animateNum = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = (el.dataset.decimals || 0) | 0;
    if (reducedMotion) { el.textContent = target.toFixed(decimals); return; }
    const dur = 1800;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals);
    };
    requestAnimationFrame(step);
  };
  // 标记中已有最终值（无 JS 时直接可见），启动后归零再滚动
  const numEls = document.querySelectorAll("[data-count]");
  if (!reducedMotion) numEls.forEach((el) => { el.textContent = "0"; });
  const numObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        animateNum(en.target);
        numObserver.unobserve(en.target);
      }
    });
  }, { threshold: .5 });
  numEls.forEach((el) => numObserver.observe(el));

  /* ---------- 滚动显现 ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("visible");
        revealObserver.unobserve(en.target);
      }
    });
  }, { threshold: .12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------- 回到顶部 ---------- */
  const backTop = document.querySelector(".back-top");
  if (backTop) {
    window.addEventListener("scroll", () => {
      backTop.classList.toggle("show", window.scrollY > 600);
    }, { passive: true });
    backTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- 案例筛选 ---------- */
  const filterBar = document.querySelector(".filter-bar");
  if (filterBar) {
    filterBar.addEventListener("click", (e) => {
      const chip = e.target.closest(".filter-chip");
      if (!chip) return;
      filterBar.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const cat = chip.dataset.filter;
      document.querySelectorAll("[data-cat]").forEach((card) => {
        const show = cat === "all" || card.dataset.cat === cat;
        card.style.display = show ? "" : "none";
        if (show) {
          card.classList.remove("visible");
          void card.offsetWidth;
          card.classList.add("visible");
        }
      });
    });
  }

  /* ---------- 联系表单 ---------- */
  const form = document.querySelector(".contact-form form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fields = form.querySelectorAll("[required]");
      let ok = true;
      fields.forEach((f) => {
        f.closest(".form-group").classList.toggle("invalid", !f.value.trim());
        if (!f.value.trim()) ok = false;
      });
      if (!ok) return;
      const btn = form.querySelector(".form-submit");
      const old = btn.textContent;
      btn.textContent = "提交成功，我们将尽快与您联系 ✓";
      btn.disabled = true;
      btn.style.opacity = .8;
      setTimeout(() => { btn.textContent = old; btn.disabled = false; btn.style.opacity = 1; form.reset(); }, 3000);
    });
    form.querySelectorAll("[required]").forEach((f) => {
      f.addEventListener("input", () => f.closest(".form-group").classList.remove("invalid"));
    });
  }

  /* ---------- 页脚年份 ---------- */
  document.querySelectorAll(".year-now").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
