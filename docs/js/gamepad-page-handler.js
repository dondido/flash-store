const LEFT_STICK_X = 0;
const DEADZONE = 0.15; // Ignore movements less than 15% out from center
const SCROLL_SPEED = 8; // Pixels to scroll per frame

let connectedGamepadIndex = null;
let buttonsState = [];
const axesState = [0, 0]; // For two axes (X and Y)

window.addEventListener('gamepadconnected', (e) => {
    connectedGamepadIndex = e.gamepad.index;
    // Start the interaction loop
    gamepadLoop();
});

window.addEventListener('gamepaddisconnected', (e) => {
    console.log('Gamepad disconnected');
    if (connectedGamepadIndex === e.gamepad.index) {
        connectedGamepadIndex = null;
    }
});

function gamepadLoop() {
    if (connectedGamepadIndex === null) return;
    // Fetch the latest gamepads snapshot
    const gamepads = navigator.getGamepads();
    const gp = gamepads[connectedGamepadIndex];
    if (!gp) return;
    // Process inputs
    handleButtons(gp.buttons);
    handleAxes(gp.axes);
    // Keep looping
    requestAnimationFrame(gamepadLoop);
}

function handleButtons(buttons) {
    const isButtonPressed = buttonsState.some((button, i) => !button.pressed && buttons[i].pressed);
    if (isButtonPressed) {
        document.activeElement?.click();
    }
    // Save current state for the next frame calculation
    buttonsState = buttons.slice(0, 12);
}

// Short, optimized helper to move focus between interactive elements.
function focusNextElement(direction, axis) {
    const nodes = Array.from(document.querySelectorAll('button, a, input, [tabindex="0"]')).filter(n => n.offsetParent !== null);
    if (!nodes.length) return;
    const active = document.activeElement && nodes.includes(document.activeElement) ? document.activeElement : nodes[0];
    if (axis === 1) {
        // Stick: pick nearest element in requested direction (horizontal/vertical)
        const a = active.getBoundingClientRect();
        const cx = a.left + a.width / 2, cy = a.top + a.height / 2;
        const horiz = axis === LEFT_STICK_X;
        const want = Math.sign(direction);
        let best = null, bestScore = Infinity;
        for (const el of nodes) {
            if (el === active) continue;
            const r = el.getBoundingClientRect();
            const dx = (r.left + r.width / 2) - cx;
            const dy = (r.top + r.height / 2) - cy;
            const primary = horiz ? dx : dy;
            if (Math.sign(primary) !== want) continue;
            const score = Math.abs(primary) * 1000 + Math.hypot(dx, dy);
            if (score < bestScore) { bestScore = score; best = el; }
        }
        if (best) return best.focus();
    }
    let index = nodes.indexOf(active) + Math.round(direction);
    if (index >= nodes.length) index = 0;
    if (index < 0) index = nodes.length - 1;
    return nodes[index].focus();
}

function handleAxes(axes) {
    const yAxis = axes[5];
    axesState.forEach((value, index) => {
        const axis = axes[index];
        if (Math.abs(axis) > DEADZONE && value !== axis) {
            focusNextElement(axis, index);
        }
        axesState[index] = axis; // Update the state for the next frame
    });
    if (Math.abs(yAxis) > DEADZONE) {
      // Scroll the page dynamically relative to how far the stick is pushed
      window.scrollBy(0, yAxis * SCROLL_SPEED);
    }
}
