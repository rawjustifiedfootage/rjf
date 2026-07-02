const categories = [
  { name: "Characters", icon: "person", color: "var(--primary)", description: "Roster karakter RJF, role, style, dan status progres." },
  { name: "Feature", icon: "auto_awesome", color: "var(--secondary)", description: "Fitur utama game, sistem musim, event, dan pembaruan gameplay." },
  { name: "Shop", icon: "storefront", color: "var(--tertiary)", description: "Item shop, bundle, kosmetik, dan penawaran mingguan." },
  { name: "Creations", icon: "palette", color: "var(--error)", description: "Karya komunitas, showcase, map, skin, dan ide buatan player." }
];

const articles = [
  { title: "RJF Studio Feature Hub", category: "Feature", text: "Pusat informasi untuk sistem musim, event, karakter, shop, dan kreasi komunitas RJF Studio." },
  { title: "Character Roster", category: "Characters", text: "Daftar karakter utama, role, visual identity, dan catatan balancing terbaru." },
  { title: "Season Timeline", category: "Feature", text: "Musim berubah setiap 7 hari dengan urutan Hujan, Kemarau, Salju, dan Subur." },
  { title: "Weekly Shop Rotation", category: "Shop", text: "Rotasi item mingguan untuk bundle, kosmetik, dan item spesial RJF Studio." },
  { title: "Creator Showcase", category: "Creations", text: "Tempat menampilkan karya player, konsep map, desain skin, dan highlight komunitas." },
  { title: "Community Builds", category: "Creations", text: "Kumpulan ide, eksperimen, dan karya komunitas yang paling niat. Ada yang terlalu niat, tapi itu masalah bagus." }
];

const updates = [
  { label: "Version 26.4.5", time: "Now", color: "var(--primary)", text: "RJF Studio preview updated with the new seasonal timeline." },
  { label: "Season System", time: "7d cycle", color: "var(--secondary)", text: "Musim berganti otomatis setiap 7 hari: Hujan, Kemarau, Salju, lalu Subur." },
  { label: "Community", time: "Discord", color: "var(--tertiary)", text: "Join komunitas RJF lewat tombol Community di navbar." }
];

const seasons = [
  { name: "Hujan", slug: "hujan", icon: "rainy", note: "Air melimpah, suasana lembap, dan tanaman mulai pulih.", effect: "rain", particles: 72 },
  { name: "Kemarau", slug: "kemarau", icon: "sunny", note: "Hari panas, resource tertentu lebih langka, stamina diuji.", effect: "heat", particles: 26 },
  { name: "Salju", slug: "salju", icon: "ac_unit", note: "Area membeku, visual berubah dingin, dan rute terasa lebih berat.", effect: "snow", particles: 82 },
  { name: "Subur", slug: "subur", icon: "psychiatry", note: "Panen meningkat, crafting lebih nyaman, ekonomi bernapas lega.", effect: "leaf", particles: 46 }
];

const categoryGrid = document.querySelector("#categoryGrid");
const updatesList = document.querySelector("#updatesList");
const resultGrid = document.querySelector("#resultGrid");
const resultsPanel = document.querySelector("#resultsPanel");
const resultsTitle = document.querySelector("#resultsTitle");
const modal = document.querySelector("#modal");
const modalContent = document.querySelector("#modalContent");
const scrim = document.querySelector("#scrim");
const sidebar = document.querySelector("#sidebar");
const toastWrap = document.querySelector("#toastWrap");
const currentSeason = document.querySelector("#currentSeason");
const seasonTitle = document.querySelector("#seasonTitle");
const seasonDates = document.querySelector("#seasonDates");
const daysRemaining = document.querySelector("#daysRemaining");
const seasonProgress = document.querySelector("#seasonProgress");
const seasonSteps = document.querySelector("#seasonSteps");
const seasonAmbience = document.querySelector("#seasonAmbience");
const seasonPreviewSlug = new URLSearchParams(window.location.search).get("season");
let activeSeasonSlug = "";
let seasonTimer = null;

function renderCategories() {
  categoryGrid.innerHTML = categories.map((category) => `
    <button class="category-card" data-category="${category.name}" style="color: ${category.color}">
      <span class="category-card__icon">
        <span class="material-symbols-outlined">${category.icon}</span>
      </span>
      <h2>${category.name}</h2>
    </button>
  `).join("");
}

function renderUpdates() {
  updatesList.innerHTML = updates.map((update, index) => `
    <button class="update-item" data-update="${index}">
      <span class="update-meta">
        <span style="color: ${update.color}">${update.label}</span>
        <span>${update.time}</span>
      </span>
      <p>${update.text}</p>
    </button>
  `).join("");
}

function formatCountdown(ms) {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [days, hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function applySeasonTheme(season) {
  document.body.classList.remove("season-hujan", "season-kemarau", "season-salju", "season-subur");
  document.body.classList.add(`season-${season.slug}`);
}

function renderSeasonEffects(season) {
  if (activeSeasonSlug === season.slug) return;
  activeSeasonSlug = season.slug;
  applySeasonTheme(season);

  const particleClass = `season-particle--${season.effect}`;
  seasonAmbience.innerHTML = Array.from({ length: season.particles }, (_, index) => {
    const x = Math.round(Math.random() * 100);
    const size = season.effect === "rain"
      ? 24 + Math.round(Math.random() * 34)
      : season.effect === "heat"
        ? 24 + Math.round(Math.random() * 38)
        : 5 + Math.round(Math.random() * 12);
    const duration = season.effect === "rain"
      ? 0.7 + Math.random() * 0.65
      : season.effect === "heat"
        ? 5 + Math.random() * 4
        : 7 + Math.random() * 9;
    const delay = Math.random() * -12;
    const opacity = season.effect === "heat" ? 0.24 + Math.random() * 0.26 : 0.35 + Math.random() * 0.55;
    const drift = Math.round((Math.random() * 90 - 45) * (index % 2 ? 1 : -1));

    return `<span class="season-particle ${particleClass}" style="--x:${x}%; --size:${size}px; --duration:${duration}s; --delay:${delay}s; --opacity:${opacity}; --drift:${drift}px"></span>`;
  }).join("");
}

function renderSeasonTimeline() {
  const cycleLength = 7;
  const dayMs = 24 * 60 * 60 * 1000;
  const cycleMs = cycleLength * dayMs;
  const startDate = new Date("2026-01-01T00:00:00");
  const now = new Date();
  const elapsedMs = Math.max(0, now - startDate);
  const elapsedDays = Math.floor(elapsedMs / dayMs);
  const cycleIndex = Math.floor(elapsedMs / cycleMs);
  const calendarSeasonIndex = cycleIndex % seasons.length;
  const previewSeasonIndex = seasons.findIndex((season) => season.slug === seasonPreviewSlug);
  const seasonIndex = previewSeasonIndex >= 0 ? previewSeasonIndex : calendarSeasonIndex;
  const activeSeason = seasons[seasonIndex];
  const activeStart = new Date(startDate.getTime() + cycleIndex * cycleMs);
  const activeEnd = new Date(activeStart.getTime() + (cycleLength - 1) * dayMs);
  const nextStart = new Date(activeStart.getTime() + cycleMs);
  const dayInCycle = elapsedDays % cycleLength;
  const remainingMs = nextStart - now;
  const dateFormat = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" });

  renderSeasonEffects(activeSeason);
  currentSeason.textContent = `Musim ${activeSeason.name}`;
  seasonTitle.textContent = `Musim ${activeSeason.name}`;
  seasonDates.textContent = `${activeSeason.note} Periode: ${dateFormat.format(activeStart)} - ${dateFormat.format(activeEnd)}. Berikutnya mulai ${dateFormat.format(nextStart)}.`;
  daysRemaining.textContent = formatCountdown(remainingMs);
  seasonProgress.style.width = `${Math.max(2, ((cycleMs - remainingMs) / cycleMs) * 100)}%`;
  seasonSteps.innerHTML = seasons.map((season, index) => {
    const stepStart = new Date(activeStart.getTime() + (index - seasonIndex) * cycleLength * dayMs);
    if (index < seasonIndex) stepStart.setDate(stepStart.getDate() + seasons.length * cycleLength);
    const stepEnd = new Date(stepStart.getTime() + (cycleLength - 1) * dayMs);

    return `
      <article class="season-step ${index === seasonIndex ? "is-active" : ""}">
        <span class="material-symbols-outlined">${season.icon}</span>
        <strong>${season.name}</strong>
        <span>${dateFormat.format(stepStart)} - ${dateFormat.format(stepEnd)}</span>
      </article>
    `;
  }).join("");
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastWrap.append(toast);
  setTimeout(() => toast.remove(), 3200);
}

function openModal(title, body, extra = "") {
  modalContent.innerHTML = `
    <h2>${title}</h2>
    <p>${body}</p>
    ${extra}
  `;
  if (!modal.open) modal.showModal();
}

function closeModal() {
  modal.close();
}

function filterArticles(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return articles.filter((item) =>
    item.title.toLowerCase().includes(needle) ||
    item.category.toLowerCase().includes(needle) ||
    item.text.toLowerCase().includes(needle)
  );
}

function renderResults(items, title) {
  resultsTitle.textContent = title;
  resultsPanel.hidden = false;
  resultGrid.innerHTML = items.length
    ? items.map((item) => `
        <button class="result-card" data-open-article="${item.title}">
          <small>${item.category}</small>
          <h3>${item.title}</h3>
          <p>${item.text}</p>
        </button>
      `).join("")
    : `<article class="result-card"><h3>No results found</h3><p>Coba cari characters, feature, shop, creations, atau season. Kalau tetap kosong, ya berarti datanya belum lahir.</p></article>`;
  resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function runSearch(form) {
  const query = new FormData(form).get("query") || "";
  const matches = filterArticles(query);
  renderResults(matches, `Results for "${query.trim() || "nothing"}"`);
}

function showCategory(categoryName) {
  const category = categories.find((item) => item.name === categoryName);
  const matches = articles.filter((item) => item.category === categoryName);
  document.querySelectorAll(".side-nav a").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.category === categoryName);
  });
  renderResults(matches, `${categoryName} Articles`);
  if (category) showToast(`${category.name} dibuka.`);
  sidebar.classList.remove("is-open");
  scrim.hidden = true;
}

function showArticle(title) {
  const article = articles.find((item) => item.title === title);
  if (!article) return;
  openModal(
    article.title,
    article.text,
    `<div class="modal-list">
      <button class="primary-btn" onclick="window.print()">Print / Save Guide</button>
      <small>Category: ${article.category}</small>
    </div>`
  );
}

function animateCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  const formatter = new Intl.NumberFormat("en-US");
  counters.forEach((counter) => {
    const target = Number(counter.dataset.counter);
    const suffix = counter.dataset.suffix || "";
    const start = performance.now();
    const duration = 1200;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(target * eased);

      if (suffix === "K") {
        counter.textContent = `${(value / 1000).toFixed(1)}K`;
      } else if (suffix === "M+") {
        counter.textContent = `${Math.max(1, Math.floor(value / 1000000))}M+`;
      } else {
        counter.textContent = formatter.format(value);
      }

      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
}

function openSettings() {
  openModal(
    "Settings",
    "Adjust the preview without needing to summon a framework the size of a small planet.",
    `<div class="setting-row">
      <span>Theme</span>
      <select class="select" id="themeSelect">
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>
    </div>
    <div class="setting-row">
      <span>Reduce animations</span>
      <select class="select" id="motionSelect">
        <option value="off">Off</option>
        <option value="on">On</option>
      </select>
    </div>`
  );

  const themeSelect = document.querySelector("#themeSelect");
  const motionSelect = document.querySelector("#motionSelect");
  themeSelect.value = document.documentElement.classList.contains("light") ? "light" : "dark";
  motionSelect.value = document.body.classList.contains("reduce-motion") ? "on" : "off";

  themeSelect.addEventListener("change", () => setTheme(themeSelect.value));
  motionSelect.addEventListener("change", () => {
    document.body.classList.toggle("reduce-motion", motionSelect.value === "on");
    showToast("Animation preference updated.");
  });
}

function setTheme(theme) {
  document.documentElement.classList.toggle("light", theme === "light");
  document.documentElement.classList.toggle("dark", theme !== "light");
  localStorage.setItem("rjf-theme", theme);
  document.querySelector("#themeToggle .material-symbols-outlined").textContent = theme === "light" ? "light_mode" : "dark_mode";
}

function showPatchNotes() {
  openModal(
    "Patch Notes",
    "Version 26.4.5 menambahkan identitas RJF STUDIO, navigasi baru, timeline musim 7 hari, dan link Community ke Discord.",
    `<div class="modal-list">
      ${updates.map((update) => `<article class="result-card"><small>${update.label}</small><h3>${update.time}</h3><p>${update.text}</p></article>`).join("")}
    </div>`
  );
}

function bindEvents() {
  document.querySelector("#heroSearch").addEventListener("submit", (event) => {
    event.preventDefault();
    runSearch(event.currentTarget);
  });

  document.querySelector("#topSearch").addEventListener("submit", (event) => {
    event.preventDefault();
    runSearch(event.currentTarget);
  });

  document.querySelector("#clearResults").addEventListener("click", () => {
    resultsPanel.hidden = true;
    resultGrid.innerHTML = "";
  });

  document.querySelector("#menuToggle").addEventListener("click", () => {
    sidebar.classList.add("is-open");
    scrim.hidden = false;
  });

  scrim.addEventListener("click", () => {
    sidebar.classList.remove("is-open");
    scrim.hidden = true;
  });

  document.querySelector("#themeToggle").addEventListener("click", () => {
    const nextTheme = document.documentElement.classList.contains("light") ? "dark" : "light";
    setTheme(nextTheme);
    showToast(`${nextTheme === "light" ? "Light" : "Dark"} mode enabled.`);
  });

  document.querySelector("#notificationBtn").addEventListener("click", () => {
    document.querySelector("#notificationCount").textContent = "0";
    openModal(
      "Notifications",
      "Ada tiga update RJF terbaru. Tidak terlalu dramatis, jadi internet mungkin kecewa.",
      `<div class="modal-list">
        ${updates.map((update, index) => `<button class="update-item" data-update="${index}"><span class="update-meta"><span>${update.label}</span><span>${update.time}</span></span><p>${update.text}</p></button>`).join("")}
      </div>`
    );
  });

  document.querySelector("#profileBtn").addEventListener("click", () => {
    openModal("Profile", "Logged in as RJF Member. Saved creations: 12. Productivity level: masih bisa dinegosiasikan.");
  });

  document.querySelector("#supportBtn").addEventListener("click", () => {
    openModal("Support RJF STUDIO", "Butuh bantuan? Hubungi rjfstudio.support@gmail.com. Tombol di bawah ini cuma demo, jadi dompet aman dari jumpscare.", `<button class="primary-btn" id="fakeDonate">Send Support Ping</button>`);
    setTimeout(() => {
      document.querySelector("#fakeDonate")?.addEventListener("click", () => showToast("Support ping terkirim secara imajiner."));
    });
  });

  document.querySelector("#settingsBtn")?.addEventListener("click", (event) => {
    event.preventDefault();
    openSettings();
  });

  document.querySelector("#patchBtn")?.addEventListener("click", (event) => {
    event.preventDefault();
    showPatchNotes();
  });

  document.querySelector("#modalClose").addEventListener("click", closeModal);

  document.addEventListener("click", (event) => {
    const categoryTarget = event.target.closest("[data-category]");
    const articleTarget = event.target.closest("[data-open-article]");
    const updateTarget = event.target.closest("[data-update]");
    const navTarget = event.target.closest("[data-view]");
    const sectionTarget = event.target.closest("[data-section]");
    const footerTarget = event.target.closest("[data-footer]");

    if (categoryTarget) showCategory(categoryTarget.dataset.category);
    if (sectionTarget) {
      sidebar.classList.remove("is-open");
      scrim.hidden = true;
      document.querySelectorAll(".side-nav a").forEach((link) => link.classList.toggle("is-active", link === sectionTarget));
    }
    if (articleTarget) showArticle(articleTarget.dataset.openArticle);
    if (updateTarget) {
      const update = updates[Number(updateTarget.dataset.update)];
      openModal(update.label, update.text, `<p><strong>Posted:</strong> ${update.time}</p>`);
    }
    if (navTarget) {
      document.querySelectorAll(".nav-link").forEach((link) => link.classList.remove("is-active"));
      navTarget.classList.add("is-active");
      showToast(`${navTarget.dataset.view} view selected.`);
    }
    if (footerTarget) {
      event.preventDefault();
      openModal(footerTarget.dataset.footer, "Demo link opened. Di versi produksi, ini diarahkan ke halaman RJF STUDIO yang sesuai.");
    }
  });

  modal.addEventListener("click", (event) => {
    const modalBox = modal.getBoundingClientRect();
    const inside = event.clientX >= modalBox.left && event.clientX <= modalBox.right && event.clientY >= modalBox.top && event.clientY <= modalBox.bottom;
    if (!inside) closeModal();
  });
}

function init() {
  renderCategories();
  renderUpdates();
  renderSeasonTimeline();
  if (seasonTimer) clearInterval(seasonTimer);
  seasonTimer = setInterval(renderSeasonTimeline, 1000);
  bindEvents();
  setTheme(localStorage.getItem("rjf-theme") || "dark");

  const statObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  statObserver.observe(document.querySelector(".stats-panel"));
}

init();
