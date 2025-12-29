// =========================
  // Timeline: only one open at a time
  // =========================
  document.querySelectorAll(".origin-item").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        document.querySelectorAll(".origin-item").forEach((other) => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  document.querySelectorAll(".back-to-top").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  });

  function setActive(id) {
    document.querySelectorAll("nav a").forEach(a => {
      const match = a.getAttribute("href") === `#${id}`;
      a.classList.toggle("is-active", match);
    });
  }

  // =========================
  // Modal (Share Your Story)
  // =========================
  const counterTargets = {
    stories: 48,
    actions: 126,
    hours: 34
  };

  const impactSection = document.getElementById("impact");
  const counterEls = Array.from(document.querySelectorAll("[data-counter]"));


  const modal = document.getElementById("storyModal");
  const openButtons = [
    document.getElementById("openStoryModal"),
    document.getElementById("openStoryModal2"),
    document.getElementById("openStoryModal3"),
    document.getElementById("openStoryModal4"),
  ].filter(Boolean);

  const closeBtn = document.getElementById("closeStoryModal");
  const cancelBtn = document.getElementById("cancelStory");
  const storyText = document.getElementById("storyText");
  let lastFocusEl = null;

  function openModal() {
    lastFocusEl = document.activeElement;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => storyText?.focus(), 50);
  }

  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocusEl) lastFocusEl.focus();
  }

  openButtons.forEach(btn => btn.addEventListener("click", openModal));
  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") {
      closeModal();
    }
  });

  const form = document.getElementById("storyForm");
  const helper = document.getElementById("formHelper");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const storyObj = {
      name: (data.get("name") || "").toString().trim(),
      tag: (data.get("tag") || "Story").toString().trim(),
      story: (data.get("story") || "").toString().trim(),
      ts: new Date().toISOString()
    };

    const key = "zylo_stories";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.unshift(storyObj);
    localStorage.setItem(key, JSON.stringify(existing));

    helper.textContent = "Submitted! (Saved in this browser for demo.) You can close this window now.";
    form.reset();

    bumpCounters({ stories: 1, actions: 1, hours: 1 });
  });

  setActive("home");

const sections = [...document.querySelectorAll("section[id]")];

let currentActive = null;

const observer = new IntersectionObserver(
  (entries) => {
    const centerY = window.innerHeight / 2;

    let best = null;
    let bestDistance = Infinity;

    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const rect = entry.boundingClientRect;
      const distance = Math.abs(rect.top - centerY);

      if (distance < bestDistance) {
        bestDistance = distance;
        best = entry.target;
      }
    });

    if (best && best.id !== currentActive) {
      currentActive = best.id;
      setActive(best.id);
    }
  },
  {
    root: null,
    rootMargin: "-40% 0px -40% 0px",
    threshold: 0
  }
);

sections.forEach(section => observer.observe(section));

  document.querySelectorAll('nav a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href")?.slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", "#" + id);
      setActive(id);
    });
  });

  // =========================
  // Impact counters
  // =========================

  function animateNumber(el, to) {
    const start = 0;
    const duration = 900;
    const t0 = performance.now();

    function step(t) {
      const p = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.floor(start + (to - start) * eased);
      el.textContent = val.toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  let countersRun = false;

  const impactObs = new IntersectionObserver((entries) => {
    const hit = entries.some(en => en.isIntersecting);
    if (hit && !countersRun) {
      countersRun = true;
      counterEls.forEach(el => {
        const key = el.getAttribute("data-counter");
        const target = counterTargets[key] ?? 0;
        animateNumber(el, target);
      });
    }
  }, { threshold: 0.35 });

  if (impactSection) impactObs.observe(impactSection);

  // Helper to bump counters after demo submissions
  function bumpCounters(delta) {
    Object.keys(delta).forEach(k => {
      if (typeof counterTargets[k] === "number") counterTargets[k] += delta[k];
    });
    counterEls.forEach(el => {
      const key = el.getAttribute("data-counter");
      if (counterTargets[key] != null) el.textContent = counterTargets[key].toLocaleString();
    });
  }