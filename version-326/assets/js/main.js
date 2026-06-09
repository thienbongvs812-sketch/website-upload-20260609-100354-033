(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var header = document.querySelector(".site-header");
        var toggle = document.querySelector(".menu-toggle");
        var mobileMenu = document.querySelector(".mobile-menu");

        function onScroll() {
            if (!header) {
                return;
            }
            if (window.scrollY > 20) {
                header.classList.add("is-scrolled");
            } else {
                header.classList.remove("is-scrolled");
            }
        }

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });

        if (toggle && mobileMenu) {
            toggle.addEventListener("click", function () {
                mobileMenu.classList.toggle("open");
            });
        }

        document.querySelectorAll("[data-global-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var target = form.getAttribute("data-search-target") || "search.html";
                if (query) {
                    window.location.href = target + "?q=" + encodeURIComponent(query);
                } else {
                    window.location.href = target;
                }
            });
        });

        initHeroCarousel();
        initCardFilters();
    });

    function initHeroCarousel() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var prev = carousel.querySelector(".hero-prev");
        var next = carousel.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
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

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
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

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initCardFilters() {
        var panel = document.querySelector("[data-card-filter]");
        if (!panel) {
            return;
        }
        var keywordInput = panel.querySelector("[data-filter-keyword]");
        var yearSelect = panel.querySelector("[data-filter-year]");
        var typeSelect = panel.querySelector("[data-filter-type]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";

        if (keywordInput && q) {
            keywordInput.value = q;
        }

        function matchText(card, query) {
            if (!query) {
                return true;
            }
            var haystack = [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-genre") || "",
                card.getAttribute("data-tags") || "",
                card.getAttribute("data-type") || ""
            ].join(" ").toLowerCase();
            return haystack.indexOf(query.toLowerCase()) !== -1;
        }

        function apply() {
            var query = keywordInput ? keywordInput.value.trim() : "";
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";

            cards.forEach(function (card) {
                var ok = true;
                if (year && card.getAttribute("data-year") !== year) {
                    ok = false;
                }
                if (type && (card.getAttribute("data-type") || "").indexOf(type) === -1) {
                    ok = false;
                }
                if (!matchText(card, query)) {
                    ok = false;
                }
                card.style.display = ok ? "" : "none";
            });
        }

        [keywordInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    }

    window.createMoviePlayer = function (source) {
        ready(function () {
            var video = document.getElementById("movie-player");
            var overlay = document.getElementById("player-overlay");
            var hls = null;
            var loaded = false;

            if (!video || !source) {
                return;
            }

            function load() {
                if (loaded) {
                    return;
                }
                loaded = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.load();
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    return;
                }

                video.src = source;
                video.load();
            }

            function play() {
                load();
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                var attempt = function () {
                    var promise = video.play();
                    if (promise && typeof promise.catch === "function") {
                        promise.catch(function () {});
                    }
                };
                if (hls && window.Hls) {
                    hls.once(window.Hls.Events.MANIFEST_PARSED, attempt);
                    window.setTimeout(attempt, 450);
                } else {
                    attempt();
                }
            }

            if (overlay) {
                overlay.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
        });
    };
})();
