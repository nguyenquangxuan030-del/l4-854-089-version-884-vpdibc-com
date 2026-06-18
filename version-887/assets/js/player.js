(function () {
    function formatTime(seconds) {
        if (!Number.isFinite(seconds) || seconds < 0) {
            return '0:00';
        }
        var minutes = Math.floor(seconds / 60);
        var remain = Math.floor(seconds % 60);
        return minutes + ':' + String(remain).padStart(2, '0');
    }

    function initPlayer() {
        var video = document.querySelector('[data-player]');
        if (!video) {
            return;
        }

        var source = video.getAttribute('data-src');
        var playButtons = Array.prototype.slice.call(document.querySelectorAll('[data-play-toggle]'));
        var muteButton = document.querySelector('[data-mute-toggle]');
        var fullscreenButton = document.querySelector('[data-fullscreen-toggle]');
        var progress = document.querySelector('[data-progress]');
        var currentTime = document.querySelector('[data-current-time]');
        var duration = document.querySelector('[data-duration]');
        var bigPlayButton = document.querySelector('.big-play-button');
        var hls = null;

        function loadSource() {
            if (!source) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        hls.destroy();
                        hls = null;
                        video.src = source;
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
        }

        function updatePlayState() {
            if (bigPlayButton) {
                bigPlayButton.classList.toggle('is-hidden', !video.paused);
            }
        }

        function togglePlay() {
            if (video.paused) {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            } else {
                video.pause();
            }
        }

        function updateProgress() {
            if (currentTime) {
                currentTime.textContent = formatTime(video.currentTime);
            }
            if (duration) {
                duration.textContent = formatTime(video.duration);
            }
            if (progress) {
                progress.max = Number.isFinite(video.duration) ? video.duration : 0;
                progress.value = Number.isFinite(video.currentTime) ? video.currentTime : 0;
            }
        }

        playButtons.forEach(function (button) {
            button.addEventListener('click', togglePlay);
        });

        video.addEventListener('click', togglePlay);
        video.addEventListener('play', updatePlayState);
        video.addEventListener('pause', updatePlayState);
        video.addEventListener('timeupdate', updateProgress);
        video.addEventListener('loadedmetadata', updateProgress);
        video.addEventListener('durationchange', updateProgress);

        if (muteButton) {
            muteButton.addEventListener('click', function () {
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? '取消静音' : '静音';
            });
        }

        if (fullscreenButton) {
            fullscreenButton.addEventListener('click', function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (video.requestFullscreen) {
                    video.requestFullscreen();
                }
            });
        }

        if (progress) {
            progress.addEventListener('input', function () {
                video.currentTime = Number(progress.value) || 0;
            });
        }

        loadSource();
        updatePlayState();
    }

    document.addEventListener('DOMContentLoaded', initPlayer);
    window.addEventListener('beforeunload', function () {
        var video = document.querySelector('[data-player]');
        if (video) {
            video.pause();
        }
    });
})();
