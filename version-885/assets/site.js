(function () {
  var mobileToggle = document.querySelector('.mobile-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      var expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  var topButton = document.querySelector('.back-to-top');
  if (topButton) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 360) {
        topButton.classList.add('is-visible');
      } else {
        topButton.classList.remove('is-visible');
      }
    });
    topButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('.hero-section');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
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

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    hero.querySelectorAll('[data-hero-direction]').forEach(function (button) {
      button.addEventListener('click', function () {
        var direction = button.getAttribute('data-hero-direction') === 'next' ? 1 : -1;
        showSlide(current + direction);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  document.querySelectorAll('[data-filter-form]').forEach(function (panel) {
    var targetSelector = panel.getAttribute('data-filter-form');
    var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector + ' .movie-card'));
    var input = panel.querySelector('[data-filter-keyword]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var year = panel.querySelector('[data-filter-year]');
    var clear = panel.querySelector('[data-filter-clear]');

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var keywordValue = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchesKeyword = !keywordValue || haystack.indexOf(keywordValue) !== -1;
        var matchesRegion = !regionValue || normalize(card.getAttribute('data-region')).indexOf(regionValue) !== -1;
        var matchesType = !typeValue || normalize(card.getAttribute('data-type')).indexOf(typeValue) !== -1;
        var matchesYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
        card.classList.toggle('hidden-card', !(matchesKeyword && matchesRegion && matchesType && matchesYear));
      });
    }

    [input, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (clear) {
      clear.addEventListener('click', function () {
        [input, region, type, year].forEach(function (control) {
          if (control) {
            control.value = '';
          }
        });
        applyFilter();
      });
    }
  });

  document.querySelectorAll('.player-shell').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-button');
    var overlay = shell.querySelector('.player-overlay');
    var message = shell.querySelector('.player-message');

    function showMessage(text) {
      if (message) {
        message.textContent = text;
        message.classList.add('is-visible');
      }
    }

    function startPlayer() {
      if (!video) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      shell.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      video.setAttribute('playsinline', 'playsinline');

      if (!video.getAttribute('data-ready')) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          video._hls = hls;
          video.setAttribute('data-ready', '1');
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.setAttribute('data-ready', '1');
        } else {
          showMessage('当前设备暂时无法打开该视频，请更换现代浏览器后重试。');
          return;
        }
      }

      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          showMessage('点击视频画面即可继续播放。');
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayer();
      });
    }

    if (overlay) {
      overlay.addEventListener('click', function () {
        startPlayer();
      });
    }
  });

  var searchRoot = document.querySelector('[data-search-root]');
  if (searchRoot && typeof SEARCH_MOVIES !== 'undefined') {
    var params = new URLSearchParams(window.location.search);
    var searchInput = searchRoot.querySelector('[data-search-input]');
    var searchButton = searchRoot.querySelector('[data-search-button]');
    var resultGrid = searchRoot.querySelector('[data-search-results]');
    var empty = searchRoot.querySelector('[data-search-empty]');
    var initialQuery = params.get('q') || '';

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (match) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[match];
      });
    }

    function cardTemplate(item) {
      return '<article class="movie-card">' +
        '<a href="./' + escapeHtml(item.file) + '">' +
        '<div class="poster-wrap">' +
        '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="rating-pill">★ ' + escapeHtml(item.rating) + '</span>' +
        '<span class="play-mask">▶</span>' +
        '</div>' +
        '<div class="card-body">' +
        '<h3>' + escapeHtml(item.title) + '</h3>' +
        '<p class="card-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</p>' +
        '<p class="card-desc">' + escapeHtml(item.oneLine) + '</p>' +
        '<p class="card-category">' + escapeHtml(item.categoryName) + '</p>' +
        '</div>' +
        '</a>' +
        '</article>';
    }

    function runSearch() {
      var query = String(searchInput.value || '').trim().toLowerCase();
      var results = SEARCH_MOVIES.filter(function (item) {
        var haystack = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' ').toLowerCase();
        return !query || haystack.indexOf(query) !== -1;
      }).slice(0, 120);

      resultGrid.innerHTML = results.map(cardTemplate).join('');
      if (empty) {
        empty.style.display = results.length ? 'none' : 'block';
      }
    }

    if (searchInput) {
      searchInput.value = initialQuery;
      searchInput.addEventListener('input', runSearch);
      searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          runSearch();
        }
      });
    }

    if (searchButton) {
      searchButton.addEventListener('click', runSearch);
    }

    runSearch();
  }
})();
