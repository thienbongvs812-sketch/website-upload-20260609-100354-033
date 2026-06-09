(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var expanded = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', String(!expanded));
            mobilePanel.hidden = expanded;
        });
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
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

        function start() {
            stop();
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

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilterPanel() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var scope = panel.closest('section') || document;
            var list = scope.querySelector('[data-filter-list]');
            var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];
            var keywordInput = panel.querySelector('[data-filter-keyword]');
            var yearInput = panel.querySelector('[data-filter-year]');
            var typeSelect = panel.querySelector('[data-filter-type]');
            var regionSelect = panel.querySelector('[data-filter-region]');
            var resetButton = panel.querySelector('[data-filter-reset]');
            var resultCount = scope.querySelector('[data-result-count]');
            var emptyState = scope.querySelector('[data-empty-state]');

            function update() {
                var keyword = normalize(keywordInput && keywordInput.value);
                var year = normalize(yearInput && yearInput.value);
                var type = normalize(typeSelect && typeSelect.value);
                var region = normalize(regionSelect && regionSelect.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var search = normalize(card.getAttribute('data-search'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var cardRegion = normalize(card.getAttribute('data-region'));
                    var matched = true;

                    if (keyword && search.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }
                    if (type && cardType !== type) {
                        matched = false;
                    }
                    if (region && cardRegion.indexOf(region) === -1) {
                        matched = false;
                    }

                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (resultCount) {
                    resultCount.textContent = visible + ' 部影片';
                }
                if (emptyState) {
                    emptyState.hidden = visible !== 0;
                }
            }

            [keywordInput, yearInput, typeSelect, regionSelect].forEach(function (element) {
                if (element) {
                    element.addEventListener('input', update);
                    element.addEventListener('change', update);
                }
            });

            if (resetButton) {
                resetButton.addEventListener('click', function () {
                    if (keywordInput) keywordInput.value = '';
                    if (yearInput) yearInput.value = '';
                    if (typeSelect) typeSelect.value = '';
                    if (regionSelect) regionSelect.value = '';
                    update();
                });
            }

            update();
        });
    }

    function setupSearchPage() {
        var app = document.querySelector('[data-search-app]');
        if (!app || !window.MovieSearchData) {
            return;
        }

        var form = app.querySelector('form');
        var input = app.querySelector('[data-search-page-input]');
        var results = app.querySelector('[data-search-results]');
        var meta = app.querySelector('[data-search-meta]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"']/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[char];
            });
        }

        function renderCard(movie) {
            return [
                '<article class="movie-card">',
                '  <a class="movie-link" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
                '    <span class="poster-wrap" data-title="' + escapeHtml(movie.title) + '">',
                '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy" onerror="this.classList.add('image-error'); this.closest('.poster-wrap').classList.add('image-missing');">',
                '      <span class="poster-gradient"></span>',
                '      <span class="play-badge">▶</span>',
                '      <span class="meta-badge year-badge">' + escapeHtml(movie.year) + '</span>',
                '    </span>',
                '    <span class="card-body">',
                '      <strong>' + escapeHtml(movie.title) + '</strong>',
                '      <em>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</em>',
                '      <span>' + escapeHtml(movie.oneLine) + '</span>',
                '      <small>' + escapeHtml(movie.genre) + '</small>',
                '    </span>',
                '  </a>',
                '</article>'
            ].join('');
        }

        function runSearch(query) {
            var q = normalize(query);
            if (!q) {
                results.innerHTML = '';
                meta.textContent = '请输入关键词开始搜索';
                return;
            }

            var matched = window.MovieSearchData.filter(function (movie) {
                return normalize(movie.search).indexOf(q) !== -1;
            }).slice(0, 240);

            results.innerHTML = matched.map(renderCard).join('');
            meta.textContent = '找到 ' + matched.length + ' 条相关影片';
        }

        if (input) {
            input.value = initialQuery;
            input.addEventListener('input', function () {
                runSearch(input.value);
            });
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var query = input ? input.value.trim() : '';
                var nextUrl = './search.html' + (query ? '?q=' + encodeURIComponent(query) : '');
                window.history.replaceState({}, '', nextUrl);
                runSearch(query);
            });
        }

        runSearch(initialQuery);
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (shell) {
            var button = shell.querySelector('[data-player-start]');
            var video = shell.querySelector('video');
            var stream = shell.getAttribute('data-stream');
            var hasStarted = false;

            if (!button || !video || !stream) {
                return;
            }

            button.addEventListener('click', function () {
                if (hasStarted) {
                    video.play();
                    return;
                }

                hasStarted = true;
                shell.classList.add('is-playing');

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    video.play().catch(function () {});
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (data && data.fatal) {
                            try {
                                hls.destroy();
                            } catch (error) {}
                            video.src = stream;
                            video.play().catch(function () {});
                        }
                    });
                    return;
                }

                video.src = stream;
                video.play().catch(function () {});
            });
        });
    }

    setupHero();
    setupFilterPanel();
    setupSearchPage();
    setupPlayers();
})();
