(function () {
    window.initMoviePlayer = function (source) {
        var video = document.getElementById('videoPlayer');
        var cover = document.getElementById('playerCover');
        var startButton = document.getElementById('startPlayback');
        var attached = false;
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function attachSource() {
            if (attached) {
                return;
            }
            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function playVideo() {
            attachSource();
            video.controls = true;
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', playVideo);
        }
        if (startButton) {
            startButton.addEventListener('click', playVideo);
        }
        video.addEventListener('click', function () {
            if (!attached) {
                playVideo();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
