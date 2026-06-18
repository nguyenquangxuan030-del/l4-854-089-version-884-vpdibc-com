(function() {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mainNav = document.querySelector('[data-main-nav]');

    if (menuButton && mainNav) {
        menuButton.addEventListener('click', function() {
            mainNav.classList.toggle('open');
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let heroIndex = 0;
    let heroTimer = null;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function(slide, current) {
            slide.classList.toggle('active', current === heroIndex);
        });
        dots.forEach(function(dot, current) {
            dot.classList.toggle('active', current === heroIndex);
        });
    }

    function startHero() {
        if (slides.length <= 1) {
            return;
        }
        heroTimer = window.setInterval(function() {
            showHero(heroIndex + 1);
        }, 5200);
    }

    dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
            window.clearInterval(heroTimer);
            showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
            startHero();
        });
    });

    showHero(0);
    startHero();

    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const searchInput = document.querySelector('[data-filter-search]');
    const categorySelect = document.querySelector('[data-filter-category]');
    const yearSelect = document.querySelector('[data-filter-year]');
    const typeSelect = document.querySelector('[data-filter-type]');
    const emptyState = document.querySelector('[data-empty-state]');

    function normalized(value) {
        return String(value || '').trim().toLowerCase();
    }

    function cardText(card) {
        return [
            card.getAttribute('data-title'),
            card.getAttribute('data-category'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        const query = normalized(searchInput ? searchInput.value : '');
        const category = normalized(categorySelect ? categorySelect.value : '');
        const year = normalized(yearSelect ? yearSelect.value : '');
        const type = normalized(typeSelect ? typeSelect.value : '');
        let visible = 0;

        cards.forEach(function(card) {
            const text = cardText(card);
            const matchesQuery = !query || text.indexOf(query) !== -1;
            const matchesCategory = !category || normalized(card.getAttribute('data-category')) === category;
            const matchesYear = !year || normalized(card.getAttribute('data-year')) === year;
            const matchesType = !type || normalized(card.getAttribute('data-type')) === type;
            const shouldShow = matchesQuery && matchesCategory && matchesYear && matchesType;
            card.style.display = shouldShow ? '' : 'none';
            if (shouldShow) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('show', visible === 0);
        }
    }

    [searchInput, categorySelect, yearSelect, typeSelect].forEach(function(control) {
        if (control) {
            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        }
    });

    applyFilters();
})();
