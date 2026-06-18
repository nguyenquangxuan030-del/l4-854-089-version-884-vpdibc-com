(function () {
  function select(selector, root) {
    return (root || document).querySelector(selector);
  }

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = select(".menu-toggle");
    var mobileNav = select(".mobile-nav");
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
      document.body.classList.toggle("menu-open", mobileNav.classList.contains("open"));
    });
  }

  function setupFilters() {
    var inputs = selectAll("[data-search-input]");
    inputs.forEach(function (input) {
      var scope = input.closest("section") || document;
      var cards = selectAll("[data-card]", scope);
      if (!cards.length) {
        scope = document;
        cards = selectAll("[data-card]", scope);
      }
      var typeSelect = select("[data-filter-type]", scope) || select("[data-filter-type]", input.closest("section") || document);
      function applyFilter() {
        var keyword = normalize(input.value);
        var typeValue = normalize(typeSelect ? typeSelect.value : "");
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-tags")
          ].join(" "));
          var cardType = normalize(card.getAttribute("data-type"));
          var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
          var typeMatched = !typeValue || cardType.indexOf(typeValue) !== -1;
          card.classList.toggle("is-hidden", !(keywordMatched && typeMatched));
        });
      }
      input.addEventListener("input", applyFilter);
      if (typeSelect) {
        typeSelect.addEventListener("change", applyFilter);
      }
    });
  }

  function setupHero() {
    var hero = select("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", hero);
    var dots = selectAll("[data-hero-dot]", hero);
    var prev = select("[data-hero-prev]", hero);
    var next = select("[data-hero-next]", hero);
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
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
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  window.initPlayer = function (videoId, buttonId, shellId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var shell = document.getElementById(shellId);
    var started = false;
    var hls = null;
    if (!video || !button || !shell || !source) {
      return;
    }
    function play() {
      if (!started) {
        started = true;
        shell.classList.add("is-playing");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.play().catch(function () {});
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 60
          });
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
            hls.loadSource(source);
          });
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      } else {
        video.play().catch(function () {});
      }
    }
    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!started || video.paused) {
        play();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupFilters();
    setupHero();
  });
})();
