(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileNav() {
        var toggle = $('[data-menu-toggle]');
        var nav = $('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var slides = $all('[data-hero-slide]');
        if (slides.length <= 1) {
            return;
        }

        var dots = $all('[data-hero-dot]');
        var prev = $('[data-hero-prev]');
        var next = $('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        restart();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initCardFilters() {
        var roots = $all('[data-filter-root]');
        roots.forEach(function (root) {
            var searchInput = $('[data-card-filter]', root);
            var yearSelect = $('[data-year-filter]', root);
            var typeSelect = $('[data-type-filter]', root);
            var cards = $all('[data-movie-card]');
            var count = $('[data-filter-count]');

            function apply() {
                var query = normalize(searchInput && searchInput.value);
                var year = normalize(yearSelect && yearSelect.value);
                var type = normalize(typeSelect && typeSelect.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year')
                    ].join(' '));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var matched = (!query || haystack.indexOf(query) !== -1) &&
                        (!year || cardYear === year) &&
                        (!type || cardType === type);
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = '显示 ' + visible + ' 部影片';
                }
            }

            [searchInput, yearSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
        });
    }

    function escapeHtml(value) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return String(value || '').replace(/[&<>"']/g, function (character) {
            return map[character];
        });
    }

    function createResultCard(movie) {
        var title = escapeHtml(movie.title);
        var url = escapeHtml(movie.url);
        var cover = escapeHtml(movie.cover);
        var year = escapeHtml(movie.year);
        var region = escapeHtml(movie.region);
        var oneLine = escapeHtml(movie.oneLine);
        var type = escapeHtml(movie.type);
        var category = escapeHtml(movie.category);

        return [
            '<article class="movie-card">',
            '  <a href="' + url + '" aria-label="观看 ' + title + '">',
            '    <div class="movie-cover">',
            '      <img class="cover-image" src="' + cover + '" alt="' + title + '" loading="lazy" onerror="this.remove();">',
            '      <span class="movie-year">' + year + '</span>',
            '      <span class="movie-region">' + region + '</span>',
            '      <span class="movie-play">▶</span>',
            '    </div>',
            '    <div class="movie-card-body">',
            '      <h3>' + title + '</h3>',
            '      <p>' + oneLine + '</p>',
            '      <div class="movie-tags"><span>' + type + '</span><span>' + category + '</span></div>',
            '    </div>',
            '  </a>',
            '</article>'
        ].join('');
    }

    function initSearchPage() {
        var input = $('#global-search');
        var results = $('[data-search-results]');
        var summary = $('[data-search-summary]');
        var button = $('[data-search-button]');
        var source = window.MOVIE_SEARCH_INDEX || [];
        if (!input || !results || !summary || !source.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (initial) {
            input.value = initial;
        }

        function render() {
            var query = normalize(input.value);
            if (!query) {
                results.innerHTML = '';
                summary.textContent = '请输入关键词开始搜索。';
                return;
            }

            var matches = source.filter(function (movie) {
                return normalize(movie.searchText).indexOf(query) !== -1;
            }).slice(0, 80);

            results.innerHTML = matches.map(createResultCard).join('');
            summary.textContent = '找到 ' + matches.length + ' 条相关结果，最多显示前 80 条。';
        }

        input.addEventListener('input', render);
        if (button) {
            button.addEventListener('click', render);
        }
        render();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNav();
        initHero();
        initCardFilters();
        initSearchPage();
    });
})();
