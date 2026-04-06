const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const header = document.querySelector(".site-header");
const progress = document.querySelector(".scroll-progress");
const parallaxItems = document.querySelectorAll("[data-parallax]");
const navLinks = document.querySelectorAll(".nav a");
const scrollLinks = document.querySelectorAll(".js-scroll-link");
const lineButtons = document.querySelectorAll(".js-line-button");
const form = document.querySelector(".contact-form");
const toast = document.querySelector("#toast");

let toastTimer = null;

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("is-visible");

  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}

function updateScrollProgress() {
  if (!progress) return;

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  progress.style.width = `${ratio}%`;
}

function updateHeaderState() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 16);
}

function setupNavObserver() {
  if (!("IntersectionObserver" in window) || !navLinks.length) return;

  const linkMap = new Map(
    Array.from(navLinks)
      .map((link) => {
        const id = link.getAttribute("href");
        return [id ? id.replace("#", "") : "", link];
      })
      .filter(([id]) => id)
  );

  const sections = Array.from(linkMap.keys())
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => link.classList.remove("is-active"));
        const link = linkMap.get(entry.target.id);
        if (link) {
          link.classList.add("is-active");
        }
      });
    },
    {
      threshold: 0.45,
      rootMargin: "-20% 0px -40% 0px",
    }
  );

  sections.forEach((section) => observer.observe(section));
}

function setupSmoothScroll() {
  scrollLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    });
  });
}

function setupParallax() {
  if (prefersReducedMotion || !parallaxItems.length) return;

  let ticking = false;

  const update = () => {
    parallaxItems.forEach((item) => {
      const speed = Number(item.dataset.parallax || 0.08);
      const rect = item.getBoundingClientRect();
      const offset = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * speed;
      item.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  };

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
}

function setupLineButtons() {
  lineButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const formTarget = document.querySelector("#contact-form");
      if (formTarget) {
        formTarget.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      }
      showToast("公開時に公式LINEのURLへ差し替えできます。");
    });
  });
}

function setupForm() {
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.reset();
    showToast("送信ありがとうございます。内容を確認のうえご連絡します。");
  });
}

updateScrollProgress();
updateHeaderState();
setupNavObserver();
setupSmoothScroll();
setupParallax();
setupLineButtons();
setupForm();

window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("scroll", updateHeaderState, { passive: true });
window.addEventListener("resize", updateScrollProgress);
