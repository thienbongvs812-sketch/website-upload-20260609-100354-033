const state = {
  hlsModulePromise: null,
};

function qs(selector, root = document) {
  return root.querySelector(selector);
}

function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function initMobileMenu() {
  const button = qs("[data-mobile-menu-button]");
  const menu = qs("[data-mobile-menu]");

  if (!button || !menu) {
    return;
  }

  button.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
}

function initSearchForms() {
  qsa("[data-search-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      const input = qs("input[name='q']", form);
      const query = input ? input.value.trim() : "";

      if (!query) {
        event.preventDefault();
        window.location.href = "./search.html";
      }
    });
  });
}

function initHeroCarousel() {
  const slides = qsa("[data-hero-slide]");
  const dots = qsa("[data-hero-dot]");
  const prev = qs("[data-hero-prev]");
  const next = qs("[data-hero-next]");

  if (slides.length === 0) {
    return;
  }

  let index = 0;
  let timer = null;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === index);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === index);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(() => show(index + 1), 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      show(Number(dot.dataset.heroDot || 0));
      start();
    });
  });

  if (prev) {
    prev.addEventListener("click", () => {
      show(index - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      show(index + 1);
      start();
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  show(0);
  start();
}

function initCardFilters() {
  const grids = qsa("[data-card-grid]");

  grids.forEach((grid) => {
    const section = grid.closest("section") || document;
    const textInput = qs("[data-card-filter]", section);
    const yearSelect = qs("[data-year-filter]", section);
    const typeSelect = qs("[data-type-filter]", section);
    const counter = qs("[data-filter-count]", section);
    const cards = qsa(".movie-card", grid);

    function applyFilter() {
      const keyword = textInput ? textInput.value.trim().toLowerCase() : "";
      const year = yearSelect ? yearSelect.value : "";
      const type = typeSelect ? typeSelect.value : "";
      let visibleCount = 0;

      cards.forEach((card) => {
        const haystack = [
          card.dataset.title,
          card.dataset.year,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags,
        ].join(" ").toLowerCase();

        const matchKeyword = !keyword || haystack.includes(keyword);
        const matchYear = !year || card.dataset.year === year;
        const matchType = !type || card.dataset.type === type;
        const visible = matchKeyword && matchYear && matchType;

        card.classList.toggle("hidden-card", !visible);
        if (visible) {
          visibleCount += 1;
        }
      });

      if (counter) {
        counter.textContent = `${visibleCount} 部影片`;
      }
    }

    [textInput, yearSelect, typeSelect].forEach((control) => {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
  });
}

async function getHlsClass() {
  if (!state.hlsModulePromise) {
    state.hlsModulePromise = import("./hls-vendor.js");
  }

  const module = await state.hlsModulePromise;
  return module.H;
}

async function startPlayer(player) {
  const video = qs("video", player);
  const message = qs("[data-player-message]", player);
  const src = player.dataset.videoSrc;

  if (!video || !src) {
    return;
  }

  player.classList.add("loading");
  if (message) {
    message.textContent = "正在加载播放源…";
  }

  try {
    video.controls = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else {
      const Hls = await getHlsClass();

      if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
        });

        hls.loadSource(src);
        hls.attachMedia(video);
        player._hls = hls;
      } else {
        video.src = src;
      }
    }

    await video.play();
    player.classList.remove("loading");
    player.classList.add("playing");
    if (message) {
      message.textContent = "";
    }
  } catch (error) {
    player.classList.remove("loading");
    if (message) {
      message.textContent = "播放未自动开始，请再次点击播放器或检查浏览器是否允许播放。";
    }
    try {
      await video.play();
      player.classList.add("playing");
      if (message) {
        message.textContent = "";
      }
    } catch (secondError) {
      console.warn("Video playback failed", secondError || error);
    }
  }
}

function initPlayers() {
  qsa(".video-player[data-video-src]").forEach((player) => {
    const button = qs("[data-play-button]", player);

    if (button) {
      button.addEventListener("click", () => startPlayer(player));
    }

    player.addEventListener("dblclick", () => startPlayer(player));
  });
}

function renderSearchCard(movie) {
  return `
<article class="movie-card grid" data-title="${escapeHtml(movie.title)}" data-year="${escapeHtml(movie.year)}" data-type="${escapeHtml(movie.type)}" data-genre="${escapeHtml(movie.genre)}" data-tags="${escapeHtml(movie.tags)}">
  <a class="movie-cover" href="${escapeHtml(movie.url)}" aria-label="观看 ${escapeHtml(movie.title)}">
    <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}封面" loading="lazy">
    <span class="cover-shade"></span>
    <span class="movie-badge">${escapeHtml(movie.type)}</span>
    <span class="movie-duration">${escapeHtml(movie.duration)}</span>
  </a>
  <div class="movie-card-body">
    <div class="movie-meta-line">
      <span>${escapeHtml(movie.year)}</span>
      <span>${escapeHtml(movie.region)}</span>
      <span>评分 ${escapeHtml(movie.rating)}</span>
    </div>
    <h3><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
    <p>${escapeHtml(movie.oneLine)}</p>
    <div class="movie-card-footer">
      <a href="${escapeHtml(movie.categoryUrl)}">${escapeHtml(movie.category)}</a>
      <span>${escapeHtml(movie.views)} 次观看</span>
    </div>
  </div>
</article>`;
}

async function initSearchPage() {
  const root = qs("[data-search-page]");

  if (!root) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const query = (params.get("q") || "").trim();
  const formInput = qs(".page-search-form input[name='q']", root);
  const title = qs("[data-search-title]", root);
  const summary = qs("[data-search-summary]", root);
  const results = qs("[data-search-results]", root);

  if (formInput) {
    formInput.value = query;
  }

  if (!query || !results) {
    return;
  }

  const module = await import("./movies-index.js");
  const keyword = query.toLowerCase();
  const matches = module.MOVIES.filter((movie) => {
    return [
      movie.title,
      movie.year,
      movie.region,
      movie.type,
      movie.genre,
      movie.tags,
      movie.oneLine,
      movie.category,
    ].join(" ").toLowerCase().includes(keyword);
  });

  if (title) {
    title.textContent = `“${query}” 的搜索结果`;
  }

  if (summary) {
    summary.textContent = `找到 ${matches.length} 部匹配影片。`;
  }

  results.innerHTML = matches.length
    ? matches.slice(0, 300).map(renderSearchCard).join("\n")
    : `<p class="content-card">没有找到匹配影片，请尝试更换关键词。</p>`;
}

window.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initSearchForms();
  initHeroCarousel();
  initCardFilters();
  initPlayers();
  initSearchPage();
});
