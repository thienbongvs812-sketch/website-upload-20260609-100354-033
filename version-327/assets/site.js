(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    function initHeader() {
        var header = document.querySelector('[data-header]');
        var toggle = document.querySelector('[data-nav-toggle]');
        var panel = document.querySelector('[data-nav-panel]');

        function updateHeader() {
            if (!header) {
                return;
            }
            header.classList.toggle('is-scrolled', window.scrollY > 18);
        }

        updateHeader();
        window.addEventListener('scroll', updateHeader, { passive: true });

        if (toggle && panel) {
            toggle.addEventListener('click', function () {
                panel.classList.toggle('is-open');
            });
        }
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initFilters() {
        var searchInput = document.querySelector('[data-filter-search]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var emptyTip = document.querySelector('[data-empty-tip]');
        var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
        var quickButtons = Array.prototype.slice.call(document.querySelectorAll('[data-quick-filter]'));
        var clearButton = document.querySelector('[data-clear-filter]');

        if (!cards.length) {
            return;
        }

        function selectValue(name) {
            var item = document.querySelector('[data-filter-select="' + name + '"]');
            return normalize(item ? item.value : '');
        }

        function applyFilter(extraTerm) {
            var query = normalize(searchInput ? searchInput.value : '');
            if (extraTerm) {
                query = normalize(extraTerm);
                if (searchInput) {
                    searchInput.value = extraTerm;
                }
            }

            var year = selectValue('year');
            var type = selectValue('type');
            var region = selectValue('region');
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardType = normalize(card.getAttribute('data-type'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var matched = true;

                if (query && haystack.indexOf(query) === -1) {
                    matched = false;
                }
                if (year && cardYear !== year) {
                    matched = false;
                }
                if (type && cardType !== type) {
                    matched = false;
                }
                if (region && cardRegion !== region) {
                    matched = false;
                }

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyTip) {
                emptyTip.hidden = visible !== 0;
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', function () {
                applyFilter();
            });
        }

        selects.forEach(function (select) {
            select.addEventListener('change', function () {
                applyFilter();
            });
        });

        quickButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                applyFilter(button.getAttribute('data-quick-filter'));
            });
        });

        if (clearButton) {
            clearButton.addEventListener('click', function () {
                if (searchInput) {
                    searchInput.value = '';
                }
                selects.forEach(function (select) {
                    select.value = '';
                });
                applyFilter();
            });
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');
        if (initialQuery && searchInput) {
            searchInput.value = initialQuery;
            applyFilter();
        }
    }

    function initPlayer() {
        var playButton = document.querySelector('[data-play-button]');
        if (!playButton) {
            return;
        }

        var targetId = playButton.getAttribute('data-player-target');
        var video = document.getElementById(targetId);
        var shell = document.querySelector('[data-player-shell]');
        var hasLoaded = false;

        function attachSource() {
            if (!video || hasLoaded) {
                return;
            }

            var source = video.getAttribute('data-m3u8');
            if (!source) {
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
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }

            hasLoaded = true;
        }

        playButton.addEventListener('click', function () {
            attachSource();
            if (shell) {
                shell.classList.add('is-playing');
            }
            if (video) {
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {
                        if (shell) {
                            shell.classList.remove('is-playing');
                        }
                    });
                }
            }
        });
    }

    ready(function () {
        initHeader();
        initHero();
        initFilters();
        initPlayer();
    });
}());
