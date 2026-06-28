/**
 * Native Gamepad API handler for controller input
 * Maps gamepad buttons and axes to keyboard events
 */

/**
 * Normalizes input to a keyboard event object
 * @param {string|KeyboardEvent} input - A keyboard code string or event object
 * @returns {KeyboardEvent} Event object
 */
const normaliseToRawEvent = (input) => {
    if (!input) return null;
    if (typeof input === 'string') {
        return { code: input, key: input.replace('Key', '') };
    }
    return input;
};
/* 
Face Buttons (Indices 0–3)
The four main action buttons, typically arranged in a diamond or cross shape.
    Index 0: Bottom button (e.g., A on Xbox, X on PlayStation)
    Index 1: Right button (e.g., B on Xbox, Circle on PlayStation)
    Index 2: Left button (e.g., X on Xbox, Square on PlayStation)
    Index 3: Top button (e.g., Y on Xbox, Triangle on PlayStation)
    Bumpers & Triggers (Indices 4–7)
The upper shoulder buttons and lower triggers.
    Index 4: Left Bumper (LB / L1)
    Index 5: Right Bumper (RB / R1)
    Index 6: Left Trigger (LT / L2)
    Index 7: Right Trigger (RT / R2)
System Buttons (Indices 8–11)
Central system and menu buttons.
    Index 8: Select / Back / Share
    Index 9: Start / Menu / Options
    Index 10: Left Analog Stick Click (LS / L3)
    Index 11: Right Analog Stick Click (RS / R3)
D-Pad (Indices 12–15)
The directional pad (Directional buttons).
    Index 12: D-Pad Up
    Index 13: D-Pad Down
    Index 14: D-Pad Left
    Index 15: D-Pad Right
Analog Sticks (Axes 0–3)
The axes array contains values ranging from -1.0 (up/left) to 1.0 (down/right). Neutral is 0.0.
    Axis 0: Left Stick Horizontal (Left = -1.0, Right = 1.0)
    Axis 1: Left Stick Vertical (Up = -1.0, Down = 1.0)
    Axis 2: Right Stick Horizontal (Left = -1.0, Right = 1.0)
    Axis 3: Right Stick Vertical (Up = -1.0, Down = 1.0)
 */
export function initGamepadHandler(event, player, { button = [], joystick = [] } = {}) {
    const gamepadState = new Map(); // Track button/axis states to detect changes
    const axisDeadzone = 0.3; // Deadzone for analog sticks
    const axisMapping = {
        // Left stick
        0: { negative: normaliseToRawEvent('ArrowLeft'), positive: normaliseToRawEvent('ArrowRight') },
        1: { negative: normaliseToRawEvent('ArrowUp'), positive: normaliseToRawEvent('ArrowDown') },
        // Right stick (optional, can be mapped to other keys)
        2: { negative: normaliseToRawEvent('KeyA'), positive: normaliseToRawEvent('KeyD') },
        3: { negative: normaliseToRawEvent('KeyW'), positive: normaliseToRawEvent('KeyS') }
    };
    const directionMapping = joystick?.[0]?.mappings || {};
    const buttonMapping = {
        ...button.reduce((a, { mappings }, i) => ({ ...a, [i + 1]: mappings[0] }), {}),
        8: normaliseToRawEvent('Tab'),
        9: normaliseToRawEvent('Enter'),
        12: normaliseToRawEvent(directionMapping.n),
        13: normaliseToRawEvent(directionMapping.s),
        14: normaliseToRawEvent(directionMapping.w),
        15: normaliseToRawEvent(directionMapping.e),
    };
    const dispatchKeyboardEvent = (event, state) => {
        const keyboardEvent = new KeyboardEvent(state ? 'keydown' : 'keyup', event);
        (player || document.body).focus();
        window.dispatchEvent(keyboardEvent);
    };
    const handleGamepadInput = () => {
        const [pad] = (navigator.getGamepads?.() || []).filter(Boolean);
        if (!pad) {
            requestAnimationFrame(handleGamepadInput);
            return;
        };
        
        const padId = pad.index;
        if (!gamepadState.has(padId)) {
            gamepadState.set(padId, {
                buttons: new Array(pad.buttons.length).fill(false),
                axes: new Array(pad.axes.length).fill(0)
            });
        }
        
        const state = gamepadState.get(padId);
        
        // Handle buttons
        pad.buttons.forEach((button, buttonIndex) => {
            const pressed = button.pressed;
            const wasPressed = state.buttons[buttonIndex];

            if (pressed !== wasPressed) {
                state.buttons[buttonIndex] = pressed;
                const event = buttonMapping[buttonIndex];
                if (event) {
                    dispatchKeyboardEvent(event, pressed);
                }
            }
        });
        
        // Handle analog sticks and triggers
        pad.axes.forEach((axisValue, axisIndex) => {
            const deadzonedValue = Math.abs(axisValue) > axisDeadzone ? axisValue : 0;
            const wasActive = Math.abs(state.axes[axisIndex]) > axisDeadzone;
            const isActive = Math.abs(deadzonedValue) > axisDeadzone;
            
            if (isActive || wasActive) {
                const mapping = axisMapping[axisIndex];
                if (mapping) {
                    const wasNegative = state.axes[axisIndex] < -axisDeadzone;
                    const isNegative = deadzonedValue < -axisDeadzone;
                    const wasPositive = state.axes[axisIndex] > axisDeadzone;
                    const isPositive = deadzonedValue > axisDeadzone;
                    
                    if (wasNegative && !isNegative) {
                        dispatchKeyboardEvent(mapping.negative, false);
                    }
                    if (!wasNegative && isNegative) {
                        dispatchKeyboardEvent(mapping.negative, true);
                    }
                    if (wasPositive && !isPositive) {
                        dispatchKeyboardEvent(mapping.positive, false);
                    }
                    if (!wasPositive && isPositive) {
                        dispatchKeyboardEvent(mapping.positive, true);
                    }
                }
            }
            state.axes[axisIndex] = deadzonedValue;
        });
        requestAnimationFrame(handleGamepadInput);
    };
    
    // Start polling gamepad input
    requestAnimationFrame(handleGamepadInput);
    
    // Return cleanup function
    return () => cancelAnimationFrame(handleGamepadInput);
}
