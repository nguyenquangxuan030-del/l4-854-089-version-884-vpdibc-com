(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var searchForms = document.querySelectorAll('[data-search-form]');
  searchForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      var target = './search.html';
      if (value) {
        target += '?q=' + encodeURIComponent(value);
      }
      window.location.href = target;
    });
  });

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var emptyState = document.querySelector('[data-empty-state]');

  if (filterInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (query) {
      filterInput.value = query;
    }

    var runFilter = function () {
      var keyword = normalize(filterInput.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle('hidden-card', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    };

    filterInput.addEventListener('input', runFilter);
    runFilter();
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));

  if (slides.length) {
    var current = 0;
    var setSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('active', idx === current);
      });
    };

    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () {
        setSlide(idx);
      });
    });

    setInterval(function () {
      setSlide(current + 1);
    }, 5600);
  }

  var players = document.querySelectorAll('[data-player]');
  players.forEach(function (box) {
    var video = box.querySelector('video');
    var layer = box.querySelector('[data-play-layer]');
    var button = box.querySelector('[data-play-button]');
    var url = box.getAttribute('data-play-url');
    var prepared = false;
    var hlsInstance = null;

    if (!video || !url) {
      return;
    }

    var prepare = function () {
      if (prepared) {
        return;
      }
      prepared = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else {
        video.src = url;
      }
    };

    var play = function () {
      prepare();
      if (layer) {
        layer.classList.add('hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (layer) {
            layer.classList.remove('hidden');
          }
        });
      }
    };

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      if (layer) {
        layer.classList.add('hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (layer && video.currentTime === 0) {
        layer.classList.remove('hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
