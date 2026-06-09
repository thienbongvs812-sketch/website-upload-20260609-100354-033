import { H as Hls } from './video-vendor-dru42stk.js';

function setupPlayer() {
  var video = document.querySelector('[data-video-player]');
  var overlay = document.querySelector('[data-play-overlay]');
  var message = document.querySelector('[data-player-message]');

  if (!video) {
    return;
  }

  var source = video.getAttribute('data-src');
  var attached = false;

  function setMessage(text) {
    if (message) {
      message.textContent = text;
    }
  }

  function attachSource() {
    if (attached || !source) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setMessage('已启用浏览器原生播放。');
      return;
    }

    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setMessage('播放源加载完成，可直接观看。');
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setMessage('播放源暂时无法加载，请稍后重试或检查网络。');
        }
      });
      return;
    }

    video.src = source;
    setMessage('当前浏览器将尝试直接打开播放源。');
  }

  function playVideo() {
    attachSource();

    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        setMessage('浏览器限制了自动播放，请再次点击播放按钮。');
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', function () {
      overlay.classList.add('is-hidden');
      playVideo();
    });
  }

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('click', attachSource, { once: true });
}

document.addEventListener('DOMContentLoaded', setupPlayer);
