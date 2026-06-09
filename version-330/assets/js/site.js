(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileNav() {
    var button = qs('[data-mobile-toggle]');
    var nav = qs('[data-nav-links]');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHeaderSearch() {
    qsa('[data-site-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[type="search"]', form);
        var query = input ? input.value.trim() : '';
        var prefix = form.getAttribute('data-prefix') || '';

        if (query) {
          window.location.href = prefix + 'search.html?q=' + encodeURIComponent(query);
        }
      });
    });
  }

  function setupHero() {
    var slider = qs('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var active = 0;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === active);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }
  }

  function setupFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var keywordInput = qs('[data-filter-keyword]', scope);
      var yearSelect = qs('[data-filter-year]', scope);
      var typeSelect = qs('[data-filter-type]', scope);
      var countTarget = qs('[data-filter-count]', scope);
      var emptyState = qs('[data-empty-state]', scope);
      var cards = qsa('[data-movie-card]', scope);

      function apply() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var year = normalize(yearSelect && yearSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-search'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardType = normalize(card.getAttribute('data-type'));
          var matched = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (year && cardYear !== year) {
            matched = false;
          }
          if (type && cardType !== type) {
            matched = false;
          }

          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });

        if (countTarget) {
          countTarget.textContent = String(visible);
        }
        if (emptyState) {
          emptyState.classList.toggle('is-visible', visible === 0);
        }
      }

      [keywordInput, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && keywordInput) {
        keywordInput.value = q;
      }

      apply();
    });
  }

  function setupImageFallbacks() {
    qsa('img[data-fallback-title]').forEach(function (image) {
      image.addEventListener('error', function () {
        var frame = image.closest('.poster-frame, .hero-poster, .detail-poster');
        if (frame) {
          frame.classList.add('poster-missing');
          frame.setAttribute('data-title', image.getAttribute('data-fallback-title') || '影片封面');
        }
        image.remove();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupHeaderSearch();
    setupHero();
    setupFilters();
    setupImageFallbacks();
  });
})();
