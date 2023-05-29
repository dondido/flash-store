const { pathname } = window.location;
const response = await fetch(`${pathname}/manifest.json`);
const { url, controls } = await response.json();
window.RufflePlayer = window.RufflePlayer || {};
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
controls.forEach(async ({ joystick, button }) => {
    if (joystick) {
        /* const Joystick = await import('./joystick.js');
        console.log(990)
        const j = new Joystick.default({
            down: () => {console.log(111, j)},
            move: () => {console.log(112, j)},
            up: () => {console.log(113, j)},
        }); */
        // const vj = document.createElement('virtual-joystick');
        // document.body.appendChild(vj);
        //document.body.innerHTML += '<virtual-joystick></virtual-joystick>';
        const { mappings } = joystick;
        const mapKeydown = direction => triggerKeydownEvent({ code: mappings[direction] });
        const mapKeyup = direction => triggerKeyupEvent({ code: mappings[direction] });
        document.querySelector('.controls').insertAdjacentHTML('beforeend', '<virtual-joystick></virtual-joystick>');
        const $joystick = document.querySelector('virtual-joystick');
        $joystick.addEventListener('joystickdown', () => {
            console.log(333, $joystick.dataset.capture.toString())
            $joystick.dataset.capture.split('').forEach(mapKeydown);
        });
        $joystick.addEventListener('joystickmove', () => {
            if($joystick.dataset.capture || $joystick.dataset.release) {
                //console.log(334, $joystick.dataset.release, $joystick.dataset.capture);
            }
            $joystick.dataset.release.split('').forEach(mapKeyup);
            $joystick.dataset.capture.split('').forEach(mapKeydown);
        });
        $joystick.addEventListener('joystickup', () => {
            // console.log(335, $joystick.dataset.release.toString());
            $joystick.dataset.release.split('').forEach(mapKeyup)});
    }
    if (button) {
        const Button = await import('./button.js');
        Button.default(button);
    }
});
