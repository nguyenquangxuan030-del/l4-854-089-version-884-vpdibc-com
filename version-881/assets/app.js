(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-item]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
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
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      if (slides.length > 1) {
        start();
      }
    }

    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));

    inputs.forEach(function (input) {
      var root = input.closest("main") || document;
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-search-card]"));

      input.addEventListener("input", function () {
        var value = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var keywords = (card.getAttribute("data-keywords") || card.textContent || "").toLowerCase();
          card.classList.toggle("is-hidden", value !== "" && keywords.indexOf(value) === -1);
        });
      });
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-video-stage]")).forEach(function (stage) {
      var video = stage.querySelector("[data-video]");
      var button = stage.querySelector("[data-video-start]");

      if (!video) {
        return;
      }

      var source = video.getAttribute("data-src");
      var hls = null;
      var state = "idle";
      var pending = null;

      function attach() {
        if (!source) {
          return Promise.resolve();
        }

        if (state === "ready") {
          return Promise.resolve();
        }

        if (pending) {
          return pending;
        }

        state = "loading";
        pending = new Promise(function (resolve) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            state = "ready";
            resolve();
            return;
          }

          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              maxBufferLength: 45,
              backBufferLength: 30
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              state = "ready";
              resolve();
            });
            hls.on(window.Hls.Events.ERROR, function () {
              if (state !== "ready") {
                video.src = source;
                state = "ready";
                resolve();
              }
            });
            window.setTimeout(function () {
              if (state !== "ready") {
                state = "ready";
                resolve();
              }
            }, 1600);
            return;
          }

          video.src = source;
          state = "ready";
          resolve();
        });

        return pending;
      }

      function play() {
        stage.classList.add("is-active");
        attach().then(function () {
          var result = video.play();
          if (result && typeof result.catch === "function") {
            result.catch(function () {
              stage.classList.remove("is-active");
            });
          }
        });
      }

      if (button) {
        button.addEventListener("click", play);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });

      video.addEventListener("play", function () {
        stage.classList.add("is-active");
      });

      video.addEventListener("pause", function () {
        if (video.currentTime === 0) {
          stage.classList.remove("is-active");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
