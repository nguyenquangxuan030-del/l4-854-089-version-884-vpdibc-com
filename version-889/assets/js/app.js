(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  function escapeText(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  var panel = document.querySelector("[data-search-panel]");
  var resultBox = document.querySelector("[data-search-results]");
  var closeSearch = document.querySelector("[data-search-close]");
  var searchItems = window.SEARCH_ITEMS || [];

  function openPanel() {
    if (!panel) {
      return;
    }
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
  }

  function closePanel() {
    if (!panel) {
      return;
    }
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
  }

  function renderSearch(query) {
    if (!resultBox) {
      return;
    }
    var keyword = String(query || "").trim().toLowerCase();
    if (!keyword) {
      resultBox.innerHTML = "";
      closePanel();
      return;
    }
    var hits = searchItems.filter(function (item) {
      var text = [item.title, item.region, item.year, item.tags].join(" ").toLowerCase();
      return text.indexOf(keyword) !== -1;
    }).slice(0, 12);
    if (!hits.length) {
      resultBox.innerHTML = '<div class="search-hit"><strong>未找到匹配影片</strong><span>请尝试其他片名、类型或地区关键词</span></div>';
      openPanel();
      return;
    }
    resultBox.innerHTML = hits.map(function (item) {
      return '<a class="search-hit" href="' + escapeText(item.url) + '"><strong>' + escapeText(item.title) + '</strong><span>' + escapeText(item.region) + ' · ' + escapeText(item.year) + ' · ' + escapeText(item.tags) + '</span></a>';
    }).join("");
    openPanel();
  }

  document.querySelectorAll("[data-global-search]").forEach(function (input) {
    input.addEventListener("input", function () {
      renderSearch(input.value);
    });
    input.addEventListener("focus", function () {
      if (input.value.trim()) {
        renderSearch(input.value);
      }
    });
  });

  if (closeSearch) {
    closeSearch.addEventListener("click", closePanel);
  }
  if (panel) {
    panel.addEventListener("click", function (event) {
      if (event.target === panel) {
        closePanel();
      }
    });
  }

  document.querySelectorAll("[data-filter-area]").forEach(function (area) {
    var keywordInput = area.querySelector("[data-filter-keyword]");
    var yearSelect = area.querySelector("[data-filter-year]");
    var regionSelect = area.querySelector("[data-filter-region]");
    var resetButton = area.querySelector("[data-filter-reset]");
    var cards = Array.prototype.slice.call(area.querySelectorAll("[data-title]"));
    var empty = area.querySelector("[data-filter-empty]");

    function applyFilter() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var region = regionSelect ? regionSelect.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var cardText = [card.dataset.title, card.dataset.tags, card.dataset.region, card.dataset.year].join(" ").toLowerCase();
        var matchKeyword = !keyword || cardText.indexOf(keyword) !== -1;
        var matchYear = !year || card.dataset.year === year;
        var matchRegion = !region || card.dataset.region === region;
        var show = matchKeyword && matchYear && matchRegion;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [keywordInput, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
    if (resetButton) {
      resetButton.addEventListener("click", function () {
        if (keywordInput) {
          keywordInput.value = "";
        }
        if (yearSelect) {
          yearSelect.value = "";
        }
        if (regionSelect) {
          regionSelect.value = "";
        }
        applyFilter();
      });
    }
  });

  function attachStream(video) {
    if (!video || video.dataset.ready === "1") {
      return;
    }
    var url = video.getAttribute("data-stream");
    if (!url) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video._hls = hls;
    } else {
      video.src = url;
    }
    video.dataset.ready = "1";
  }

  document.querySelectorAll(".player-frame").forEach(function (frame) {
    var video = frame.querySelector("video");
    var button = frame.querySelector(".play-overlay");

    function playVideo() {
      attachStream(video);
      if (video) {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }
    if (video) {
      video.addEventListener("playing", function () {
        frame.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        frame.classList.remove("is-playing");
      });
      video.addEventListener("ended", function () {
        frame.classList.remove("is-playing");
      });
    }
  });
})();
