(function () {
    function normalize(value) {
        return String(value || "")
            .trim()
            .toLowerCase();
    }

    function setupMobileNavigation() {
        var button = document.querySelector("[data-mobile-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");

        if (!button || !menu) {
            return;
        }

        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupCoverFallbacks() {
        var covers = document.querySelectorAll("img[data-cover]");

        covers.forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing");
            });
        });
    }

    function setupHeroCarousel() {
        var carousel = document.querySelector("[data-hero-carousel]");

        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            if (timer || slides.length <= 1) {
                return;
            }

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

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                stop();
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupSearchPage() {
        var input = document.querySelector("[data-search-input]");
        var typeFilter = document.querySelector("[data-type-filter]");
        var yearFilter = document.querySelector("[data-year-filter]");
        var clearButton = document.querySelector("[data-clear-filter]");
        var resultCount = document.querySelector("[data-result-count]");
        var emptyState = document.querySelector("[data-empty-state]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-results] .movie-card"));

        if (!input || !cards.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        input.value = initialQuery;

        function applyFilters() {
            var query = normalize(input.value);
            var type = typeFilter ? typeFilter.value : "";
            var year = yearFilter ? yearFilter.value : "";
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search-text"));
                var cardType = card.getAttribute("data-type") || "";
                var cardYear = card.getAttribute("data-year") || "";
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesType = !type || cardType === type;
                var matchesYear = !year || cardYear === year;
                var visible = matchesQuery && matchesType && matchesYear;

                card.hidden = !visible;

                if (visible) {
                    visibleCount += 1;
                }
            });

            if (resultCount) {
                resultCount.textContent = visibleCount;
            }

            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }
        }

        input.addEventListener("input", applyFilters);

        if (typeFilter) {
            typeFilter.addEventListener("change", applyFilters);
        }

        if (yearFilter) {
            yearFilter.addEventListener("change", applyFilters);
        }

        if (clearButton) {
            clearButton.addEventListener("click", function () {
                input.value = "";

                if (typeFilter) {
                    typeFilter.value = "";
                }

                if (yearFilter) {
                    yearFilter.value = "";
                }

                applyFilters();
            });
        }

        applyFilters();
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileNavigation();
        setupCoverFallbacks();
        setupHeroCarousel();
        setupSearchPage();
    });
}());
