const { pathname } = window.location;
await navigator.serviceWorker.register('./sw.js');
const response = await fetch(`${pathname}game.json`);
const { url, controls, aspectRatio } = await response.json();
window.RufflePlayer = window.RufflePlayer || {};
document.getElementById('container').style.aspectRatio = aspectRatio;
const ruffle = window.RufflePlayer.newest();
const player = ruffle.createPlayer();
player.config = {
    contextMenu: 'rightClickOnly'
};
const container = document.getElementById('container');
const triggerKeydownEvent = event => window.dispatchEvent(new KeyboardEvent('keydown', event));
const triggerKeyupEvent = event => window.dispatchEvent(new KeyboardEvent('keyup', event));
container.appendChild(player);
player.load(`${pathname}/${url}`);
controls.forEach(async (control) => {
    const { type } = control;
    if ('joystick' === type) {
        const { mappings, dataset } = control;
        const mapKeydown = direction => triggerKeydownEvent({ code: mappings[direction] });
        const mapKeyup = direction => triggerKeyupEvent({ code: mappings[direction] });
        document.body.insertAdjacentHTML('beforeend', '<virtual-joystick></virtual-joystick>');
        const $joystick = document.querySelector('virtual-joystick');
        $joystick.addEventListener('joystickdown', () => {
            $joystick.dataset.capture.split('').forEach(mapKeydown);
        });
        $joystick.addEventListener('joystickmove', () => {
            $joystick.dataset.release.split('').forEach(mapKeyup);
            $joystick.dataset.capture.split('').forEach(mapKeydown);
        });
        $joystick.addEventListener('joystickup', () => {
            $joystick.dataset.release.split('').forEach(mapKeyup);
        });
        if (dataset) {
            Object.assign($joystick.dataset, dataset);
        }
    }
    if ('button' === type) {
        const Button = await import('./button.js');
        Button.default(control);
    }
});
