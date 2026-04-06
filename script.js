const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const header = document.querySelector(".site-header");
const progress = document.querySelector(".scroll-progress");
const revealItems = document.querySelectorAll(".reveal");
const countItems = document.querySelectorAll("[data-count]");
const tiltCards = document.querySelectorAll(".tilt-card");
const parallaxItems = document.querySelectorAll("[data-parallax]");
const buttons = document.querySelectorAll(".magnetic");
const heroTitle = document.querySelector(".hero-title");
const form = document.querySelector(".contact-form");

function splitHeroLines() {
  if (!heroTitle || prefersReducedMotion) return;

  const lines = heroTitle.querySelectorAll(".split-line");
  lines.forEach((line, index) => {
    const text = line.textContent.trim();
    line.textContent = "";
    const inner = document.createElement("span");
    inner.textContent = text;
    inner.style.display = "inline-block";
    inner.style.transform = "translateY(110%)";
    inner.style.opacity = "0";
    inner.style.transition = `transform 1s cubic-bezier(0.2, 0.8, 0.2, 1) ${index * 0.12}s, opacity 1s cubic-bezier(0.2, 0.8, 0.2, 1) ${index * 0.12}s`;
    line.appendChild(inner);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        inner.style.transform = "translateY(0)";
        inner.style.opacity = "1";
      });
    });
  });
}

function updateHeaderAndProgress() {
  const scrollY = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;

  if (header) {
    header.classList.toggle("is-scrolled", scrollY > 18);
  }

  if (progress) {
    progress.style.width = `${ratio}%`;
  }
}

function createRevealObserver() {
  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function animateCount(target) {
  const raw = target.dataset.count;
  const value = Number(raw);
  const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
  const duration = 1400;
  const start = performance.now();

  function frame(now) {
    const progressRatio = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progressRatio, 3);
    const current = value * eased;
    target.textContent = current.toFixed(decimals);

    if (progressRatio < 1) {
      requestAnimationFrame(frame);
    } else {
      target.textContent = Number(raw).toFixed(decimals);
    }
  }

  requestAnimationFrame(frame);
}

function createCountObserver() {
  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    countItems.forEach((item) => {
      item.textContent = item.dataset.count;
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.8 }
  );

  countItems.forEach((item) => observer.observe(item));
}

function setupTilt() {
  if (prefersReducedMotion) return;

  tiltCards.forEach((card) => {
    let rafId = null;

    const reset = () => {
      if (rafId) cancelAnimationFrame(rafId);
      card.style.transform = "";
    };

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 10;
      const rotateX = (0.5 - py) * 10;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });
    });

    card.addEventListener("pointerleave", reset);
    card.addEventListener("pointercancel", reset);
  });
}

function setupParallax() {
  if (prefersReducedMotion || !parallaxItems.length) return;

  let ticking = false;

  function update() {
    const viewportHeight = window.innerHeight;
    parallaxItems.forEach((item) => {
      const speed = Number(item.dataset.parallax || 0.1);
      const rect = item.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = center - viewportHeight / 2;
      item.style.transform = `translate3d(0, ${distance * speed * -0.12}px, 0)`;
    });
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
}

function setupMagneticButtons() {
  if (prefersReducedMotion) return;

  buttons.forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
    });

    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });
}

function setupForm() {
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const submitButton = form.querySelector("button[type='submit']");
    if (submitButton) {
      const original = submitButton.textContent;
      submitButton.textContent = "ありがとうございます";
      submitButton.disabled = true;

      setTimeout(() => {
        submitButton.textContent = original;
        submitButton.disabled = false;
        form.reset();
      }, 1800);
    }
  });
}

splitHeroLines();
updateHeaderAndProgress();
createRevealObserver();
createCountObserver();
setupTilt();
setupParallax();
setupMagneticButtons();
setupForm();

window.addEventListener("scroll", updateHeaderAndProgress, { passive: true });
window.addEventListener("resize", updateHeaderAndProgress);
