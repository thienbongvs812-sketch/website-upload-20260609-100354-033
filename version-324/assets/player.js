async function loadHlsModule() {
    try {
        return await import("./hls-vendor-dru42stk.js");
    } catch (error) {
        console.warn("HLS module could not be loaded.", error);
        return null;
    }
}

function setStatus(player, message) {
    var status = player.querySelector("[data-player-status]");

    if (status) {
        status.textContent = message;
    }
}

async function prepareVideo(player) {
    var video = player.querySelector("[data-video]");

    if (!video) {
        return;
    }

    if (player.dataset.ready === "true") {
        return;
    }

    var source = video.getAttribute("data-src");

    if (!source) {
        setStatus(player, "当前页面没有可用播放源。");
        return;
    }

    player.dataset.ready = "true";

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        setStatus(player, "浏览器已加载播放源。");
        return;
    }

    var module = await loadHlsModule();
    var Hls = module && module.H;

    if (Hls && Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        setStatus(player, "HLS 播放源已加载。");
        return;
    }

    video.src = source;
    setStatus(player, "已尝试使用浏览器默认方式加载播放源。");
}

function setupPlayer(player) {
    var video = player.querySelector("[data-video]");
    var button = player.querySelector("[data-play-button]");

    if (!video || !button) {
        return;
    }

    button.addEventListener("click", async function () {
        await prepareVideo(player);
        player.classList.add("is-ready");

        try {
            await video.play();
        } catch (error) {
            setStatus(player, "播放源已就绪，请使用视频控件继续播放。");
            player.classList.remove("is-ready");
        }
    });

    video.addEventListener("play", function () {
        player.classList.add("is-ready");
    });
}

var players = document.querySelectorAll("[data-hls-player]");

players.forEach(function (player) {
    setupPlayer(player);
});
