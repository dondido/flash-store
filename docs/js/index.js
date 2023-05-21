const { pathname } = window.location;
const response = await fetch(`${pathname}/manifest.json`);
const { url, controls } = await response.json();
window.RufflePlayer = window.RufflePlayer || {};
const ruffle = window.RufflePlayer.newest();
console.log(url, controls);
const player = ruffle.createPlayer();
const container = document.getElementById('container');
container.appendChild(player);
player.load(`${pathname}/${url}`);
controls.forEach(async ({ joystick, button }) => {
    if (joystick) {
        const Joystick = await import('./joystick.js');
        Joystick.default(joystick);
    }
    if (button) {
        const Button = await import('./button.js');
        Button.default(button);
    }
});
