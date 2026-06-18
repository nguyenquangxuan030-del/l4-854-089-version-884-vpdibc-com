(function () {
  const menuButton = document.querySelector('.mobile-menu-button');
  const navLinks = document.querySelector('.nav-links');

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('is-open');
      menuButton.classList.toggle('is-open', isOpen);
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function setupHeroCarousel() {
    const carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
    let current = 0;
    let timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 6200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const target = Number(dot.getAttribute('data-target-slide') || 0);
        showSlide(target);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  function uniqueSorted(values) {
    return Array.from(new Set(values.filter(Boolean))).sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });
  }

  function fillFilterOptions(cards, select, key) {
    if (!select) {
      return;
    }

    const values = uniqueSorted(cards.map(function (card) {
      return card.dataset[key] || '';
    }));

    values.forEach(function (value) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    const searchInput = document.getElementById('siteSearch');
    const cardList = document.querySelector('[data-card-list]');
    const visibleCount = document.getElementById('visibleCount');

    if (!cardList) {
      return;
    }

    const cards = Array.from(cardList.querySelectorAll('.movie-card'));
    const selects = Array.from(document.querySelectorAll('.filter-select'));

    selects.forEach(function (select) {
      const key = select.getAttribute('data-filter');
      fillFilterOptions(cards, select, key);
    });

    function applyFilters() {
      const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      const filters = {};
      selects.forEach(function (select) {
        const key = select.getAttribute('data-filter');
        filters[key] = select.value;
      });

      let count = 0;
      cards.forEach(function (card) {
        const searchText = (card.dataset.search || '').toLowerCase();
        const matchesQuery = !query || searchText.indexOf(query) !== -1;
        const matchesFilters = Object.keys(filters).every(function (key) {
          return !filters[key] || card.dataset[key] === filters[key];
        });
        const visible = matchesQuery && matchesFilters;
        card.classList.toggle('is-hidden', !visible);
        if (visible) {
          count += 1;
        }
      });

      if (visibleCount) {
        visibleCount.textContent = String(count);
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });
    applyFilters();
  }

  function setupPlayers() {
    const players = Array.from(document.querySelectorAll('[data-player]'));

    players.forEach(function (shell) {
      const video = shell.querySelector('video');
      const overlay = shell.querySelector('.player-overlay');
      if (!video || !overlay) {
        return;
      }

      const source = video.dataset.src;
      let loaded = false;
      let hlsInstance = null;

      function loadSource() {
        if (!source) {
          return;
        }

        if (loaded) {
          video.play().catch(function () {});
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
          }, { once: true });
        }

        loaded = true;
        shell.classList.add('is-playing');
        overlay.setAttribute('hidden', 'hidden');
      }

      overlay.addEventListener('click', loadSource);
      video.addEventListener('click', function () {
        if (!loaded) {
          loadSource();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  setupHeroCarousel();
  setupFilters();
  setupPlayers();
})();
