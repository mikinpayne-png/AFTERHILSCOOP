(function () {
  function loadHeroVideo() {
    var video = document.querySelector('.custom-video');
    if (!video) return;

    var source = video.querySelector('source[data-src]');
    if (!source) return;

    source.src = source.dataset.src;
    source.removeAttribute('data-src');
    video.load();

    var playback = video.play();
    if (playback && typeof playback.catch === 'function') {
      playback.catch(function () {});
    }
  }

  function scheduleVideoLoad() {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadHeroVideo, { timeout: 2500 });
    } else {
      window.setTimeout(loadHeroVideo, 1200);
    }
  }

  window.addEventListener('load', scheduleVideoLoad, { once: true });
})();
