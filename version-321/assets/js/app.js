(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(text) {
    return (text || "").toString().trim().toLowerCase();
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");

    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var previous = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initHeaderSearch() {
    var forms = document.querySelectorAll("[data-site-search]");

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");

        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });
  }

  function initPageFilter() {
    var input = document.querySelector("[data-page-filter]");
    var list = document.querySelector("[data-filter-list]");
    var count = document.querySelector("[data-filter-count]");

    if (!input || !list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

    function applyFilter() {
      var keyword = normalize(input.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matched = !keyword || haystack.indexOf(keyword) !== -1;

        card.classList.toggle("is-hidden", !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + " 部影片";
      }
    }

    input.addEventListener("input", applyFilter);
    applyFilter();
  }

  function movieResultCard(movie) {
    return [
      "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\">",
      "  <a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\">",
      "    <span class=\"poster-wrap\">",
      "      <img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "      <span class=\"movie-type\">" + escapeHtml(movie.type) + "</span>",
      "    </span>",
      "    <span class=\"movie-body\">",
      "      <strong>" + escapeHtml(movie.title) + "</strong>",
      "      <span class=\"movie-meta\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.year) + " · " + escapeHtml(movie.genre) + "</span>",
      "      <span class=\"movie-line\">" + escapeHtml(movie.oneLine) + "</span>",
      "    </span>",
      "  </a>",
      "</article>"
    ].join("\n");
  }

  function escapeHtml(text) {
    return (text || "").toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");
    var form = document.querySelector("[data-search-page-form]");
    var input = document.querySelector("[data-search-input]");
    var movies = window.MOVIE_SEARCH_INDEX || [];

    if (!results || !summary || !input) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;

    function render(query) {
      var keyword = normalize(query);
      var matched = movies.filter(function (movie) {
        if (!keyword) {
          return false;
        }

        var haystack = normalize([
          movie.title,
          movie.region,
          movie.year,
          movie.type,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(" "));

        return haystack.indexOf(keyword) !== -1;
      });

      if (!keyword) {
        results.innerHTML = "";
        summary.textContent = "请输入关键词开始搜索。";
        return;
      }

      summary.textContent = "找到 " + matched.length + " 部与“" + query + "”相关的影片。";
      results.innerHTML = matched.slice(0, 240).map(movieResultCard).join("\n");

      if (matched.length > 240) {
        summary.textContent += " 当前显示前 240 部，请输入更精确的关键词。";
      }
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var query = input.value.trim();
        var nextUrl = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
        window.history.replaceState(null, "", nextUrl);
        render(query);
      });
    }

    input.addEventListener("input", function () {
      render(input.value.trim());
    });

    render(initialQuery);
  }

  function initPlayers() {
    var players = document.querySelectorAll("[data-player]");

    players.forEach(function (player) {
      var button = player.querySelector(".player-start");
      var video = player.querySelector("video");

      if (!button || !video) {
        return;
      }

      button.addEventListener("click", function () {
        var src = button.getAttribute("data-src");

        if (!src) {
          return;
        }

        player.classList.add("is-playing");

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = src;
          video.play().catch(function () {});
        }
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHeaderSearch();
    initHeroCarousel();
    initPageFilter();
    initSearchPage();
    initPlayers();
  });
})();
