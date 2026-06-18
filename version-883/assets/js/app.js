(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".site-nav");

  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === currentSlide);
    });
  }

  if (slides.length) {
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5600);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function filterCards(scope) {
    var input = scope.querySelector(".search-input");
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var empty = scope.querySelector(".empty-result");
    var keyword = normalize(input ? input.value : "");
    var activeChip = scope.querySelector(".filter-chip.active");
    var filter = activeChip ? activeChip.getAttribute("data-filter") : "all";
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year")
      ].join(" "));
      var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var okFilter = filter === "all" || haystack.indexOf(normalize(filter)) !== -1;
      var ok = okKeyword && okFilter;

      card.style.display = ok ? "" : "none";

      if (ok) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("visible", visible === 0);
    }
  }

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    var input = scope.querySelector(".search-input");

    if (input) {
      input.addEventListener("input", function () {
        filterCards(scope);
      });
    }

    scope.querySelectorAll(".filter-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        scope.querySelectorAll(".filter-chip").forEach(function (item) {
          item.classList.remove("active");
        });

        chip.classList.add("active");
        filterCards(scope);
      });
    });
  });

  function startVideo(player) {
    var video = player.querySelector("video");
    var overlay = player.querySelector(".play-overlay");

    if (!video || !overlay) {
      return;
    }

    var stream = overlay.getAttribute("data-stream");

    if (!stream) {
      return;
    }

    if (!video.getAttribute("data-ready")) {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
        player.hlsInstance = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      }

      video.setAttribute("data-ready", "1");
    }

    overlay.classList.add("is-hidden");
    video.controls = true;

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  document.querySelectorAll(".movie-player").forEach(function (player) {
    var overlay = player.querySelector(".play-overlay");
    var video = player.querySelector("video");

    if (overlay) {
      overlay.addEventListener("click", function () {
        startVideo(player);
      });
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          startVideo(player);
        }
      });
    }
  });
})();
