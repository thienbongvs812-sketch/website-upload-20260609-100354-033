const MovieSite = (() => {
  const ready = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  };

  const hideBrokenImages = () => {
    document.querySelectorAll('img').forEach((image) => {
      image.addEventListener('error', () => {
        image.style.opacity = '0';
      });
    });
  };

  const initMenu = () => {
    const toggle = document.querySelector('.menu-toggle');
    const panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', () => {
      panel.classList.toggle('is-open');
    });
  };

  const initHero = () => {
    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    let current = 0;
    const activate = (index) => {
      current = index;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => activate(index));
    });
    window.setInterval(() => {
      activate((current + 1) % slides.length);
    }, 5200);
  };

  const initSearchFilter = () => {
    const input = document.querySelector('[data-filter-input]');
    const cards = Array.from(document.querySelectorAll('[data-search]'));
    const empty = document.querySelector('[data-empty-state]');
    if (!input || !cards.length) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query) {
      input.value = query;
    }
    const apply = () => {
      const value = input.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach((card) => {
        const matched = !value || card.getAttribute('data-search').toLowerCase().includes(value);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    };
    input.addEventListener('input', apply);
    apply();
  };

  const initPlayer = (url) => {
    ready(() => {
      const video = document.querySelector('[data-video-player]');
      const cover = document.querySelector('[data-player-cover]');
      const start = document.querySelector('[data-player-start]');
      if (!video || !url) {
        return;
      }
      let started = false;
      let hlsInstance = null;
      const load = () => {
        if (started) {
          video.play().catch(() => {});
          return;
        }
        started = true;
        if (cover) {
          cover.classList.add('is-hidden');
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          video.play().catch(() => {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
          });
          return;
        }
        video.src = url;
        video.play().catch(() => {});
      };
      if (start) {
        start.addEventListener('click', load);
      }
      if (cover) {
        cover.addEventListener('click', load);
      }
      video.addEventListener('click', () => {
        if (!started) {
          load();
        }
      });
      window.addEventListener('beforeunload', () => {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };

  ready(() => {
    hideBrokenImages();
    initMenu();
    initHero();
    initSearchFilter();
  });

  return {
    initPlayer
  };
})();
