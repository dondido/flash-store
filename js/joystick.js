const insertStylesheet = (href) => {
    if (document.querySelector(`[${href}]`)) {
        return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = href;
    document.head.appendChild(link);
};
let events = [];
const getЕvents = (mappings, degree) => {
    const [top, right = {}, bottom = {}, left = {}] = mappings;
    const keys = [[left], [left, top], [top], [top, right], [right], [right, bottom], [bottom]];
    const acute = 45;
    let treshold = -22.5;
    for (let events of keys) {
        if (degree >= treshold && degree < (treshold += acute)) {
            return events;
        }
    }
    return [bottom, left];
};
const getUniqueEvents = function(event) {
    return this.events.every(({ code }) => code !== event.code);
};
const triggerKeydownEvent = event => window.dispatchEvent(new KeyboardEvent('keydown', event));
const triggerKeyupEvent = event => window.dispatchEvent(new KeyboardEvent('keyup', event));
export default ({ cssText, mappings }) => {
    const joystick = document.createElement('div');
    joystick.className = 'joystick';
    const { style } = joystick;
    if (cssText) {
        style.cssText = cssText;
    }
    document.body.appendChild(joystick);
    const { x, y, top, right, bottom, left } = joystick.getBoundingClientRect();
    const end = () => {
        joystick.classList.remove('focus');
        style.setProperty('--x', 65);
        style.setProperty('--y', 65);
        joystick.onpointerup = null;
        joystick.onpointermove = null;
        events.forEach(triggerKeyupEvent);
        events = [];
    };
    const move = ({ clientX, clientY }) => {
        const dx = clientX - x;
        const dy = clientY - y;
        const degree = Math.atan2(dy - 65, dx- 65) * 180 / Math.PI + 180;
        const newEvents = getЕvents(mappings, degree);
        style.setProperty('--x', dx);
        style.setProperty('--y', dy);
        events.filter(getUniqueEvents, { events: newEvents })?.forEach(triggerKeyupEvent);
        newEvents.filter(getUniqueEvents, { events })?.forEach(triggerKeydownEvent);
        events = newEvents;
    };
    const start = (event) => {
        const { clientX, clientY } = event;
        if (clientX >= left && clientX <= right && clientY >= top && clientY <= bottom) {
            joystick.classList.add('focus');
            move(event);
            joystick.setPointerCapture(event.pointerId);
            joystick.onpointermove = move;
            joystick.onpointerup = end;
        }
    };
    joystick.onpointerdown = start;
    document.addEventListener('pointerdown', start);
}
