
(function() {
  var body = document.body;
  var toggle = document.querySelector(".nav-toggle");

  if (toggle) {
    toggle.addEventListener("click", function() {
      var opened = body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  var slider = document.querySelector("[data-hero-slider]");
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function() {
        showSlide(current + 1);
      }, 5600);
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        showSlide(index);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  var filterPanels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
  filterPanels.forEach(function(panel) {
    var scope = panel.parentElement || document;
    var input = panel.querySelector("[data-filter-input]");
    var selects = Array.prototype.slice.call(panel.querySelectorAll(".filter-select"));
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-item"));

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(input ? input.value : "");
      var values = {};
      selects.forEach(function(select) {
        values[select.getAttribute("data-filter")] = normalize(select.value);
      });

      cards.forEach(function(card) {
        var text = normalize(card.getAttribute("data-title"));
        var matched = !keyword || text.indexOf(keyword) !== -1;
        Object.keys(values).forEach(function(key) {
          if (!values[key]) {
            return;
          }
          if (normalize(card.getAttribute("data-" + key)) !== values[key]) {
            matched = false;
          }
        });
        card.classList.toggle("is-hidden", !matched);
      });
    }

    if (input) {
      input.addEventListener("input", applyFilters);
    }
    selects.forEach(function(select) {
      select.addEventListener("change", applyFilters);
    });
    applyFilters();
  });
}());
