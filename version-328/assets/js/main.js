(function () {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 12) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function play() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                play();
            });
        });

        show(0);
        play();
    });

    document.querySelectorAll('[data-search-area]').forEach(function (area) {
        var input = area.querySelector('[data-search-input]');
        var yearFilter = area.querySelector('[data-year-filter]');
        var regionFilter = area.querySelector('[data-region-filter]');
        var categoryFilter = area.querySelector('[data-category-filter]');
        var cards = Array.prototype.slice.call(area.querySelectorAll('[data-card]'));
        var empty = area.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (input && initialQuery && area.hasAttribute('data-search-page')) {
            input.value = initialQuery;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function apply() {
            var query = normalize(input ? input.value : '');
            var year = yearFilter ? yearFilter.value : '';
            var region = regionFilter ? regionFilter.value : '';
            var category = categoryFilter ? categoryFilter.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search-text'));
                var ok = true;

                if (query && text.indexOf(query) === -1) {
                    ok = false;
                }
                if (year && card.getAttribute('data-year') !== year) {
                    ok = false;
                }
                if (region && card.getAttribute('data-region') !== region) {
                    ok = false;
                }
                if (category && card.getAttribute('data-category') !== category) {
                    ok = false;
                }

                card.classList.toggle('is-hidden', !ok);
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, yearFilter, regionFilter, categoryFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        apply();
    });
})();
