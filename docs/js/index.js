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
const ruffle = window.RufflePlayer.newest();
const player = ruffle.createPlayer();
const gamePath = `${pathname}/game.swf`;
const isWebview = /(android.*(; wv))/gi.test(navigator.userAgent);
const exitFullscreen = () => {
    if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen();
        $buttonFullscreen?.classList.remove('active');
    }
};
let deferredPrompt;
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
    player[$buttonPause.classList.toggle('active') ? 'pause' : 'play']();
});
$buttonMute.addEventListener('click', () => {
    player.volume = +$buttonMute.classList.toggle('active');
});
if (navigator.standalone || isWebview || window.matchMedia('(display-mode: standalone)').matches) {
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
if (isWebview) {
    document.body.classList.add('webview');
}
if (scale) {
    const { style } = $playground;
    const w = style.getPropertyValue('--w');
    const h = style.getPropertyValue('--h');
    const ratio = w / h;
    const setScale = () => {
        const { innerWidth, innerHeight } = window;
        const scale = ratio > innerWidth / innerHeight ? innerWidth / w : innerHeight / h;
        style.setProperty('--s', scale);
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
    const gamepad = Object.groupBy(controls, ({ type }) => type);
    gamepad.joystick?.forEach((control) => {
        const { mappings, dataset = { mode: 'fixed' } } = control;
        const triggerKeyboardEvent = (keyState) => (direction) => {
            const code = mappings[direction];
            const event = typeof code === 'string' ? { code, key: code.replace('Key', '') } : code;
            player.focus();
            window.dispatchEvent(new KeyboardEvent(keyState, event));
        }
        const data = Object.entries(dataset).map(([key, value]) => `data-${key}=${value}`).join(' ');
        $controls.insertAdjacentHTML('beforeend', `<virtual-joystick ${data}></virtual-joystick>`);
        const $joystick = $controls.querySelector('virtual-joystick');
        const handleKeyEvents = () => {
            $joystick.dataset.release.split('').forEach(triggerKeyboardEvent('keyup'));
            $joystick.dataset.capture.split('').forEach(triggerKeyboardEvent('keydown'));
        };
        $joystick.addEventListener('joystickdown', handleKeyEvents);
        $joystick.addEventListener('joystickmove', handleKeyEvents);
        $joystick.addEventListener('joystickup', handleKeyEvents);
    });
    if (gamepad.button?.length) {
        const $gamepadButtons = document.createElement('div');
        $gamepadButtons.className = 'gamepad-buttons';
        $controls.append($gamepadButtons);
        for (const control of gamepad.button) {
            const Button = await import('./button.js');
            Button.default(control, $gamepadButtons, player);
        }
    }
    Promise
        .allSettled([
            import(`${pathname}game.css`, { with: { type: 'css' } }),
            import('../css/gamepad.css', { with: { type: 'css' } }),
        ])
        .then(styleSheets => {
            document.adoptedStyleSheets = styleSheets
                .map(styleSheet => styleSheet.value?.default)
                .filter(Boolean);
        });
}
window.addEventListener('beforeinstallprompt', (event) => {
    // Prevent the mini-infobar from appearing on mobile.
    event.preventDefault();
    console.log('👍', 'beforeinstallprompt', event);
    // Stash the event so it can be triggered later.
    deferredPrompt = event;
});
$buttonInstall.addEventListener('click', async (event) => {
    if (isWebview) {
        return;
    }
    event.preventDefault();
    if (!deferredPrompt) {
      // The deferred prompt isn't available.
      return;
    }
    // Show the install prompt.
    deferredPrompt.prompt();
    // Log the result
    const result = await deferredPrompt.userChoice;
    console.log('👍', 'userChoice', result);
    // Reset the deferred prompt variable, since
    // prompt() can only be called once.
    deferredPrompt = null;
});
