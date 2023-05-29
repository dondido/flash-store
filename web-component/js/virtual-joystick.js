window.customElements.define('virtual-joystick', class VirtualJoystick extends HTMLElement {
    static #style = `
        :host {
            --radius: 65px;
            --size: calc(var(--radius) * 2);
            --border: 1px solid gray;
            --border-radius: 50%;
            --background-color: rgba(255, 255, 255, 0.3);
            --transition: opacity 1s, background-color .2s;
            --background-color-active: rgba(255, 255, 255, 0.6);
            --background-color-active-after: rgba(255, 255, 255, 0.8);
            --transition-active-after: transform .1s, background-color 0.2s;
            --size-before: 50px;
            --border-radius-before: 50%;
            --border-before: 1px solid rgb(139, 139, 139);
            --transform-before: translate(calc(-50% + var(--radius)), calc(-50% + var(--radius)));
            --size-after: 50px;
            --border-radius-after: 50%;
            --border-after: 1px solid gray;
            --background-color-after: rgba(255, 255, 255, 0.5);
            --transition-after: transform .4s, background-color .2s;
        }
        .dynamic .joystick {
            opacity: 0;
            &.active {
                opacity: 1;
            }
        }
        .box .joystick:after  {
            transform: translate(calc(-50% + clamp(0px, var(--x), var(--size))), calc(-50% + clamp(0px, var(--y), var(--size))));
        }
        .joystick {
            --x: var(--radius);
            --y: var(--radius);
            width: var(--size);
            height: var(--size);
            border: var(--border);
            background-color: var(--background-color);
            border-radius: var(--border-radius);
            position: absolute;
            box-sizing: border-box;
            transition: var(--transition);
            &.active {
                background-color: var(--background-color-active);
                &:after {
                    background-color: var(--background-color-active-after);
                    transition: var(--transition-active-after);
                }
            }
            &:after,
            &:before {
                content: "";
                display: block;
                position: absolute;
            }
            &:after {
                width: var(--size-after);
                height: var(--size-after);
                border: var(--border-after);
                border-radius: var(--border-radius-after);
                background-color: var(--background-color-after);
                transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y)));
                transition: var(--transition-after);
            }
            &:before {
                width: var(--size-before);
                height: var(--size-before);
                border: var(--border-before);
                border-radius: var(--border-radius-before);
                transform: var(--transform-before);
            }
        }
    `
    static #getDir = (degree) => {
        const dirs = ['ne', 'n', 'nw', 'w', 'sw', 's', 'sw'];
        const acute = 45;
        let treshold = 22.5;
        for (let dir of dirs) {
            if (degree >= treshold && degree < (treshold += acute)) {
                return dir;
            }
        }
        return 'w';
    }
    static #getUniqueDir(a = '', b = '') {
        let dir = '';
        if (a.includes(b[0]) === false) {
            dir = b[0];
            if (b[1] && a.includes(b[1]) === false) {
                dir = b;
            }
        }
        return dir;
    }
    #down = () => this.dispatchEvent(new CustomEvent('joypaddown'))
    #move = () => this.dispatchEvent(new CustomEvent('joypadmove'))
    #up = () => this.dispatchEvent(new CustomEvent('joypadup'))
    #setXY(x, y) {
        this.#element.style.setProperty('--x', `${x}px`);
        this.#element.style.setProperty('--y', `${y}px`);
    };
    #calcCrow({ clientX, clientY }) {
        const { host } = this.shadowRoot;
        const { lock } = this.dataset;
        const dx = lock === 'x' ? this.#r : clientX - host.offsetLeft - this.#element.offsetLeft;
        const dy = lock === 'y' ? this.#r : clientY - host.offsetTop - this.#element.offsetTop;
        const dxr = dx - this.#r;
        const dyr = dy - this.#r;
        const hypot = Math.hypot(dxr, dyr);
        return { dx, dy, dxr, dyr, hypot };
    }
    #log({
        degree = 0,
        force = 0,
        radian = 0,
        distance = 0,
        direction = '',
        hypot = 0,
        capture = '',
        release = '',
        x = this.#element.offsetWidth + this.#element.offsetLeft,
        y = this.#element.offsetTop + this.#element.offsetTop,
    }) {
        Object.assign(
            this.dataset,
            { degree, force, radian, distance, direction, hypot, capture, release, x, y }
        );
    }
   #isInside(event) {
        const { clientX, clientY } = event;
        let { offsetLeft: x, offsetTop: y, offsetWidth: w, offsetHeight: h } = this;
        if (!this.dataset.mode) {
            x += this.#element.offsetLeft;
            y += this.#element.offsetTop;
            w = this.#element.offsetWidth;
            h = this.#element.offsetHeight;
        }
        const inside = clientX >= x && clientX <= x + w && clientY >= y && clientY <= y + h;
        return inside;
    }
    #r = 0
    #element = null
    constructor() {
        super();
        let output = {};
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <slot name="style"><style>${VirtualJoystick.#style}</style></slot>
            <slot name="aside"></slot>
            <slot><div class="joystick"></div></slot>
        `;
        this.#element = this.shadowRoot.lastElementChild.firstElementChild;
        if (this.dataset.mode) {
            this.shadowRoot.lastElementChild.classList.add('dynamic');
            output = { x: 0, y: 0 };
        }
        if (this.dataset.shape) {
            this.shadowRoot.lastElementChild.classList.add('box');
        }
        this.#r = this.#element.offsetWidth / 2;
        this.#log(output);
    }
    connectedCallback() {
        document.addEventListener('pointerdown', this.#start);
    }
    #start = (event) => {
        let crow;
        const { clientX, clientY } = event;
        const attachEvents = () => {
            this.#element.classList.add('active');
            this.#element.setPointerCapture(event.pointerId);
            this.#bind(event, crow, this.#down);
            this.#element.onpointermove = this.#bind;
            this.#element.onpointerup = this.#end;
        }
        if (this.#isInside(event)) {
            crow = this.#calcCrow(event);
            if (this.dataset.mode) {
                if (this.dataset.mode === 'semi') {
                    this.#element.parentElement.classList.remove('dynamic');
                }
                this.#element.style.left = `${clientX - this.offsetLeft - this.#element.offsetWidth / 2}px`;
                this.#element.style.top = `${clientY - this.offsetLeft - this.#element.offsetHeight / 2}px`;
                attachEvents();
            }
            else if (crow.hypot <= this.#r) {
                attachEvents();
            }
        }
    }
    #bind = (event, { dx, dy, dxr, dyr, hypot } = this.#calcCrow(event), cb = this.#move) => {
        const r = this.#r;
        const angle = Math.atan2(dyr, dxr);
        let degree = angle * 180 / Math.PI;
        let x = dx;
        let y = dy;
        if (!this.dataset.shape && hypot > r) {
            x = r * Math.cos(angle) + r;
            y = r * Math.sin(angle) + r;
        }
        degree = (degree > 0 ? 360 : 0) - degree;
        const direction = VirtualJoystick.#getDir(degree);
        this.#log({
            hypot,
            degree,
            direction,
            capture: VirtualJoystick.#getUniqueDir(this.dataset.direction, direction),
            release: VirtualJoystick.#getUniqueDir(direction, this.dataset.direction),
            x: x + this.#element.offsetLeft,
            y: y + this.#element.offsetTop,
            radian: (angle > 0 ? 2 * Math.PI : 0) - angle,
            distance: Math.min(hypot, r),
            force: hypot / r,
        });
        this.#setXY(x, y);
        cb();
    };
    #end = () => {
        this.#element.classList.remove('active');
        this.#log({});
        this.#setXY(this.#r, this.#r);
        this.#element.onpointerup = this.#element.onpointermove = null;
        this.#up();
    };
});
