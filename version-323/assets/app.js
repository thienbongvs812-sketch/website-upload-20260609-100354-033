(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      button.textContent = panel.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        stop();
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function textOfCard(card) {
    return [
      card.getAttribute("data-title"),
      card.getAttribute("data-year"),
      card.getAttribute("data-region"),
      card.getAttribute("data-type"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-tags"),
      card.textContent
    ].join(" ").toLowerCase();
  }

  function initFiltering() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-box]"));
    var list = document.querySelector("[data-filter-list]");
    if (!inputs.length || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    inputs.forEach(function (input) {
      input.value = query;
    });
    function apply(value) {
      var needle = String(value || "").trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var matched = !needle || textOfCard(card).indexOf(needle) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }
    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        apply(input.value);
      });
    });
    apply(query);
  }

  function attachHls(video, source) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      return;
    }
    video.src = source;
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector(".player-cover");
      var source = player.getAttribute("data-src");
      if (!video || !source) {
        return;
      }
      function start() {
        if (!video.getAttribute("data-ready")) {
          attachHls(video, source);
          video.setAttribute("data-ready", "true");
        }
        player.classList.add("is-playing");
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }
      if (cover) {
        cover.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (!video.getAttribute("data-ready")) {
          start();
        }
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHeroSlider();
    initFiltering();
    initPlayers();
  });
})();
