/* let activeVideos = [];
const up = ({ target }) => target.load();
const move = ({ target, pointerId }) => {
    if (target.classList.contains('game-link-video')) {
        target.setPointerCapture(pointerId);
        target.play();
        activeVideos.push(target);
    }
    else {
        activeVideos.forEach(activeVideo => activeVideo.load());
        activeVideos = [];
    }
}
document.addEventListener('pointermove', move); */