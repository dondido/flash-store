window.customElements.define('virtual-joystick', class VirtualJoystick extends HTMLElement {
    static #style = `
        .joystick {
            --r: 65;
            --x: var(--r);
            --y: var(--r);
            pointer-events: none;
            position: absolute;
            left: calc(20px);
            width: calc(var(--r) * 2px);
            height: calc(var(--r) * 2px);
            border: 1px solid gray;
            background-color: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transition: background-color 0.2s;
            &.focus {
                background-color: rgba(255, 255, 255, 0.6);
                &:after {
                    background-color: rgba(255, 255, 255, 0.8);
                    transition: transform 0.1s, background-color 0.2s;
                }
            }
            &:after,
            &:before {
                content: "";
                border-radius: 50%;
                width: 50px;
                height: 50px;
                display: block;
                position: absolute;
            }
            &:after {
                border: 1px solid gray;
                background-color: rgba(255, 255, 255, 0.5);
                transform: translate(calc(-50% + 1px * var(--x)), calc(-50% + 1px * var(--y)));
                transition: transform 0.4s, background-color 0.2s;
            }
            &:before {
                border: 1px solid rgb(139, 139, 139);
                transform: translate(calc(-50% + var(--r) * 1px), calc(-50% + var(--r) * 1px));
            }
        }
    `
    static #down(target) {
       // target.dispatchEvent(new CustomEvent('joypaddown', { detail: 'elem.value' }));
    }
    static #move(target) {
       // target.dispatchEvent(new CustomEvent('joypadmove', { detail: 'elem.value' }));
    }
    static #up(target) {
       // target.dispatchEvent(new CustomEvent('joypadup', { detail: 'elem.value' }));
    }
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
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <div class="joystick">
                <style>${VirtualJoystick.#style}</style>
            </div>
        `;
        this.r = + getComputedStyle(this.shadowRoot.firstElementChild).getPropertyValue('--r');
    }
    connectedCallback() {
        document.addEventListener('pointerdown', this.start);
    }
    setXY(x, y) {
        const { style } = this.shadowRoot.firstElementChild;
        style.setProperty('--x', x);
        style.setProperty('--y', y);
    };
    start = (event) => {
        const { clientX, clientY } = event;
        const element = this.shadowRoot.firstElementChild;
        const { offsetLeft: x, offsetTop: y, offsetWidth: w, offsetHeight: h } = element;
        if (clientX >= x && clientX <= x + w && clientY >= y && clientY <= y + h) {
            element.classList.add('focus');
            element.setPointerCapture(event.pointerId);
            this.bind(event, VirtualJoystick.#down);
            document.onpointermove = this.bind;
            document.onpointerup = this.end;
        }
    }
    bind = ({ clientX, clientY }, cb = VirtualJoystick.#move) => {
        const r = this.r;
        const element = this.shadowRoot.firstElementChild;
        const dx = clientX - element.offsetLeft;
        const dy = clientY - element.offsetTop;
        const dxr = dx - r;
        const dyr = dy - r;
        const angle = Math.atan2(dyr, dxr);
        const hypot = Math.hypot(dxr, dyr);
        const degree = angle * 180 / Math.PI;
        this.degree = (degree > 0 ? 360 : 0) - degree;
        hypot > r ? this.setXY(r * Math.cos(angle) + r, r * Math.sin(angle) + r) : this.setXY(dx, dy);
        //this.dir = VirtualJoystick.#getDir(this.degree);
        cb(this);
    };
    end = () => {
        const element = this.shadowRoot.firstElementChild;
        element.classList.remove('focus');
        this.setXY(this.r, this.r);
        document.onpointerup = document.onpointermove = null;
        //this.dir = '';
        VirtualJoystick.#up(this);
    };
})