const { pathname } = window.location;
await navigator.serviceWorker.register('../../sw.js');
const response = await fetch(`${pathname}game.json`);
const { controls, scale } = response.status === 200 ? await response.json?.() : {};
window.RufflePlayer = window.RufflePlayer || {};
const $playground = document.querySelector('.playground');
const $buttonInstall = document.querySelector('.button-install');
const $buttonPause = document.querySelector('.button-pause');
const $buttonMute = document.querySelector('.button-mute');
const $buttonFullscreen = document.querySelector('.button-fullscreen');
const $controls = document.querySelector('.controls');
const triggerKeydownEvent = event => window.dispatchEvent(new KeyboardEvent('keydown', event));
const triggerKeyupEvent = event => window.dispatchEvent(new KeyboardEvent('keyup', event));
const ruffle = window.RufflePlayer.newest();
const player = ruffle.createPlayer();
const gamePath = `${pathname}/game.swf`;
const exitFullscreen = () => {
    if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen();
        $buttonFullscreen?.classList.remove('active');
    }
};
const handleHashChange = () => {
    if (location.hash === '#play') {
        $playground.prepend(player);
        player.load(gamePath);
    }
    else {
        player.remove();
        exitFullscreen();
    }
};
let deferredPrompt;
player.config = {
    autoplay: 'on',
    contextMenu: 'rightClickOnly',
    warnOnUnsupportedContent: false,
    unmuteOverlay: 'hidden'
};
addEventListener('hashchange', handleHashChange);
handleHashChange();
fetch(gamePath);
$buttonPause.addEventListener('click', () => {
    $buttonPause.classList.contains('active') ? player.play() : player.pause();
    $buttonPause.classList.toggle('active');
});
$buttonMute.addEventListener('click', () => {
    player.volume = + $buttonMute.classList.contains('active');
    $buttonMute.classList.toggle('active');
});
if (navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
    $buttonFullscreen.remove();
} else {
    $buttonFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            $buttonFullscreen.classList.add('active');
        } else {
            exitFullscreen();
        }
    });
}
if (scale) {
    const { style } = $playground;
    const w = style.getPropertyValue('--w');
    const h = style.getPropertyValue('--h');
    const ratio = w / h;
    const setScale = () => {
        const { innerWidth, innerHeight } = window;
        const scale = ratio > innerWidth / innerHeight ? innerWidth / w : innerHeight / h;
        style.setProperty('--vw', innerWidth);
        style.setProperty('--vh', innerHeight);
        style.setProperty('--s', scale);
        style.setProperty('--to', innerWidth > w ? 'center' : 'left top');
    }
    window.addEventListener('resize', setScale);
    document.body.classList.add('scale');
    setScale();
}
if (controls?.length) {
    $buttonPause.insertAdjacentHTML('afterend', '<button type="button" class="menu-button button-toggle-controls"></button>');
    document.querySelector('.button-toggle-controls').onclick = ({ currentTarget }) => {
        currentTarget.classList.toggle('hide-gamepad');
    }
    controls.forEach(async (control) => {
        const { type } = control;
        if ('joystick' === type) {
            const { mappings, dataset = { mode: 'fixed' } } = control;
            const assignMapping = (direction) => {
                const code = mappings[direction];
                return typeof code === 'string' ? { code } : code;
            };
            const mapKeydown = direction => triggerKeydownEvent(assignMapping(direction));
            const mapKeyup = direction => triggerKeyupEvent(assignMapping(direction));
            const data = Object.entries(dataset).map(([key, value]) => `data-${key}=${value}`).join(' ');
            $controls.insertAdjacentHTML('beforeend', `<virtual-joystick ${data}></virtual-joystick>`);
            const $joystick = $controls.querySelector('virtual-joystick');
            const handleKeyEvents = () => {
                $joystick.dataset.release.split('').forEach(mapKeyup);
                $joystick.dataset.capture.split('').forEach(mapKeydown);
            };
            $joystick.addEventListener('joystickdown', handleKeyEvents);
            $joystick.addEventListener('joystickmove', handleKeyEvents);
            $joystick.addEventListener('joystickup', handleKeyEvents);
        }
        if ('button' === type) {
            const Button = await import('./button.js');
            Button.default(control, $controls);
        }
    });
}
window.addEventListener('beforeinstallprompt', (event) => {
    // Prevent the mini-infobar from appearing on mobile.
    event.preventDefault();
    console.log('👍', 'beforeinstallprompt', event);
    // Stash the event so it can be triggered later.
    deferredPrompt = event;
    $buttonInstall.hidden = false;
});
$buttonInstall.addEventListener('click', async () => {
    console.log('👍', 'butInstall-clicked');
    const promptEvent = deferredPrompt;
    if (!promptEvent) {
      // The deferred prompt isn't available.
      return;
    }
    // Show the install prompt.
    promptEvent.prompt();
    // Log the result
    const result = await promptEvent.userChoice;
    console.log('👍', 'userChoice', result);
    // Reset the deferred prompt variable, since
    // prompt() can only be called once.
    deferredPrompt = null;
    // Hide the install button.
    $buttonInstall.hidden = true;
  });