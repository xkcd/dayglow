class Mode {
    constructor(name) {
        this.name = name;
    }
    // Ran when the mode is activated - should apply the mode's effects
    activate() { }
    // Ran when the mode is deactivated - should remove the mode's effects
    // Can return false to stop the mode change (if the mode doesn't want to be deactivated yet)
    deactivate() { }
}

class CSSMode extends Mode {
    constructor(name, cssClass) {
        super(name);
        this.cssClass = cssClass;
    }

    activate() {
        document.body.classList.add(this.cssClass);
    }

    deactivate() {
        document.body.classList.remove(this.cssClass);
    }
}

class GreyscaleMode extends CSSMode {
    activate() {
        super.activate();
        this.slogan = document.getElementById("slogan");
        this.initialSlogan = this.slogan.innerHTML;
        this.slogan.innerHTML = this.initialSlogan.replace("math", "maths");
    }

    deactivate() {
        super.deactivate();
        this.slogan.innerHTML = this.initialSlogan;
    }
}

class HackerMode extends CSSMode {
    activate() {
        super.activate();
        document.documentElement.classList.add(this.cssClass);

    }

    deactivate() {
        super.deactivate();
        document.documentElement.classList.remove(this.cssClass);
    }
}

class SpaceOperaMode extends Mode {
    activate() {
        if (document.getElementById('xkcd-sw-style')) return;

        this.meta = document.createElement('meta');
        this.meta.name = 'viewport';
        this.meta.content = 'width=device-width, initial-scale=1.0';
        document.getElementsByTagName('head')[0].appendChild(this.meta);

        this.style = document.createElement('style');
        this.style.id = 'xkcd-sw-style';
        this.style.textContent = /*css*/ `
          html {
            background: #000 !important;
            overflow: hidden !important;
            perspective: 200px !important;
            perspective-origin: 50% 100% !important;
          }

          body {
            transform-origin: 50% 50% !important;
            overflow: visible !important;
            margin: 0 auto !important;
            will-change: transform !important;
            background: transparent !important;
            filter: invert(1) hue-rotate(180deg);
            * { color: rgb(137 106 0) !important; }
            ul.comicNav li a { background: rgb(184 197 217) !important; }
          }

          #middleContainer {
            left: unset;
            margin-left: unset;
          }

          #masthead img {
            filter: saturate(4) hue-rotate(190deg) !important;
          }

          div {
            background: transparent !important;
          }

          * {
            border: 0 !important;
          }

          #xkcd-sw-stars {
            position: fixed;
            inset: 0;
            z-index: 0;
            pointer-events: none;
            left: 0;
            width: 100%;
            height: 100%;
          }
        `;
        document.head.appendChild(this.style);

        /* starry background */
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'xkcd-sw-stars';
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');

        const starCount = 500;
        Array.from({ length: starCount }, () => ({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            r: Math.random() * 1.5 + 0.3,
            o: Math.random() * 0.55 + 0.35,
        })).forEach(s => {
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(0,0,0,${s.o})`;
            this.ctx.fill();
        });

        /* scrolling */
        let offsetY = window.innerHeight * 0.65;
        const scrollSpeed = 0.4;  // auto-scroll pixels per frame

        function applyTransform() {
            document.body.style.setProperty(
                'transform',
                `rotateX(150deg) translateX(-50%) translateY(${offsetY}px)`,
                'important'
            );
        }
        applyTransform();

        const autoScroll = () => {
            offsetY -= scrollSpeed;
            // Reset after it goes offscreen, closer to the bottom this time
            if (offsetY < -2000) {
                offsetY = window.innerHeight * 0.85;
            }
            applyTransform();
            this.autoScrollFrame = requestAnimationFrame(autoScroll);
        };
        this.autoScrollFrame = requestAnimationFrame(autoScroll);

        this.wheelEventHandler = (e) => {
            e.preventDefault();
            offsetY -= e.deltaY;
            offsetY = Math.min(offsetY, window.innerHeight);
            applyTransform();
        };

        this.lastTouchY = 0;
        this.touchStartHandler = (e) => {
            this.lastTouchY = e.touches[0].clientY;
        };
        this.touchMoveHandler = (e) => {
            e.preventDefault();
            const currentTouchY = e.touches[0].clientY;
            const deltaY = this.lastTouchY - currentTouchY;

            offsetY -= deltaY;
            this.lastTouchY = currentTouchY;

            offsetY = Math.min(offsetY, window.innerHeight);
            applyTransform();
        };

        window.addEventListener('wheel', this.wheelEventHandler, { passive: false });
        window.addEventListener('touchstart', this.touchStartHandler, { passive: false });
        window.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
    }

    deactivate() {
        document.getElementsByTagName('head')[0].removeChild(this.meta);

        if (this.autoScrollFrame) {
            cancelAnimationFrame(this.autoScrollFrame);
        }

        this.style.remove();
        this.canvas.remove();
        document.body.style.removeProperty('transform');
        document.body.style.removeProperty('will-change');
        document.body.style.removeProperty('overflow');
        window.removeEventListener('wheel', this.wheelEventHandler);
        window.removeEventListener('touchstart', this.touchStartHandler);
        window.removeEventListener('touchmove', this.touchMoveHandler);
    }
}

class ThreeDGlassesMode extends CSSMode {
    activate() {
        super.activate();
        const comic = document.getElementById("comic");
        const comicImage = comic.querySelector("img");
        const comicImage1 = comicImage.cloneNode();
        const comicImage2 = comicImage.cloneNode();
        comicImage1.id = "comic1";
        comicImage2.id = "comic2";
        this.glassesDiv = document.createElement("div");
        this.glassesDiv.id = "glasses";
        this.glassesDiv.appendChild(comicImage1);
        this.glassesDiv.appendChild(comicImage2);
        comic.appendChild(this.glassesDiv);
    }

    deactivate() {
        super.deactivate();
        this.glassesDiv.remove();
        this.glassesDiv = null;
    }
}

class DorianGreyscaleMode extends CSSMode {
    activate() {
        super.activate();
        requestAnimationFrame(() => {
            document.body.classList.add("mode-dorian-greyscale-filter");
        });
    }

    deactivate() {
        super.deactivate();
        document.body.classList.remove("mode-dorian-greyscale-filter");
    }
}

class ModemMode extends CSSMode {
    playModem(duration=60) {
        const ctx = new window.AudioContext();
        const gain = ctx.createGain();
        gain.gain.value = 0.15;
        gain.connect(ctx.destination);

        const osc = ctx.createOscillator();
        this.osc = osc;
        osc.type = "sine";
        osc.frequency.value = 1800;

        const now = ctx.currentTime;
        const phaseRate = osc.frequency;

        osc.connect(gain);
        osc.start(now);

        const states = [0, 90, 180, 270];
        let currentState = 0;

        let t = now;
        const step = 1/2400;

        while (t < now + duration) {
            const options = [
                currentState,
                (currentState + 1) % 4,
                (currentState + 2) % 4,
                (currentState + 3) % 4
            ];

            currentState = options[Math.floor(Math.random() * options.length)];

            const offset = (states[currentState] - 180) * 2;
            osc.frequency.setValueAtTime(1800 + offset, t);

            t += step;
        }

        osc.stop(now + duration);
    }

    activate() {
        super.activate();

        // force a reflow/layout flush so it works in Firefox
        void document.body.offsetHeight;

        requestAnimationFrame(() => {
            document.body.classList.add("mode-modem-filter");
        });
        this.playModem();
    }

    deactivate() {
        super.deactivate();
        this.osc.stop();
        document.body.classList.remove("mode-modem-filter");
    }
}

class ScreensaverMode extends Mode {
    activate() {
        this.comic = document.getElementById("comic");
        if (!this.comic) return;

        const img = this.comic.querySelector("img");
        const children = this.comic.children;

        // If it's just an image, bounce the image to avoid dead space
        // Otherwise, bounce the whole comic div
        if (children.length === 1 && children[0] === img) {
            this.target = img;
        } else {
            this.target = this.comic;
        }

        const rect = this.target.getBoundingClientRect();
        this.bounceW = rect.width;
        this.bounceH = rect.height;

        this.savedStyles = this.target.style.cssText;
        this.target.style.position = "relative";
        this.target.style.zIndex = "9999";

        this.x = 0;
        this.y = 0;

        // Pick a random angle, avoiding +/- 10 degrees from the axes
        const a = (10 + Math.random() * 70) * Math.PI / 180;
        const angle = a + Math.floor(Math.random() * 4) * Math.PI / 2;
        this.vx = 2.5 * Math.cos(angle);
        this.vy = 2.5 * Math.sin(angle);

        this.onFrame = () => {
            // Use actual viewport position for bounce checks (handles scroll changes)
            const r = this.target.getBoundingClientRect();
            const nextX = r.left + this.vx;
            const nextY = r.top + this.vy;

            const vw = document.documentElement.clientWidth;
            const vh = document.documentElement.clientHeight;
            const minX = Math.min(0, vw - this.bounceW);
            const maxX = Math.max(0, vw - this.bounceW);
            const minY = Math.min(0, vh - this.bounceH);
            const maxY = Math.max(0, vh - this.bounceH);

            if ((nextX <= minX && this.vx < 0) || (nextX >= maxX && this.vx > 0)) this.vx *= -1;
            if ((nextY <= minY && this.vy < 0) || (nextY >= maxY && this.vy > 0)) this.vy *= -1;

            this.x += this.vx;
            this.y += this.vy;
            this.target.style.transform = `translate(${this.x}px, ${this.y}px)`;

            this.animFrame = requestAnimationFrame(this.onFrame);
        };

        this.animFrame = requestAnimationFrame(this.onFrame);
    }

    deactivate() {
        if (this.animFrame) cancelAnimationFrame(this.animFrame);
        if (this.target) {
            this.target.style.cssText = this.savedStyles;
        }
    }
}

class AirplaneMode extends Mode {
    activate() {
        this.comic = document.getElementById("comic");
        if (!this.comic) return;

        const img = this.comic.querySelector("img");
        const children = this.comic.children;
        if (children.length === 1 && children[0] === img) {
            this.target = img;
        } else {
            this.target = this.comic;
        }

        // Placeholder so the comic layout doesn't collapse
        const rect = this.target.getBoundingClientRect();
        this.placeholder = document.createElement('div');
        this.placeholder.style.cssText = `width:${rect.width}px;height:${rect.height}px`;
        this.target.parentNode.insertBefore(this.placeholder, this.target);

        // Wrapper holds comic and nyoom image
        this.nyoom = document.createElement('img');
        this.nyoom.src = '/3227/imgs/nyoom_2x.png';
        this.wrapper = document.createElement('div');
        this.wrapper.id = 'airplane-wrapper';
        this.wrapper.append(this.target, this.nyoom);
        document.body.appendChild(this.wrapper);


        this.dir = 1;
        this.x = -this.wrapper.scrollWidth - 20;
        this.startY = document.documentElement.clientHeight * 0.6;
        this.speed = 10;

        this.startPass = () => {
            if (this.dir === 1) {
                this.wrapper.style.flexDirection = 'row-reverse';
            } else {
                this.wrapper.style.flexDirection = 'row';
            }
        };
        this.startPass();

        this.onFrame = () => {
            const vw = document.documentElement.clientWidth;
            const w = this.wrapper.scrollWidth;

            this.x += this.speed * this.dir;

            const travel = vw + w + 40;
            let progress;
            if (this.dir === 1) {
                progress = (this.x + w + 20) / travel;
            } else {
                progress = (vw + 20 - this.x) / travel;
            }
            progress = Math.max(0, Math.min(1, progress));
            const y = this.startY - progress * 150;

            this.wrapper.style.transform = `translate(${this.x}px,${y}px) rotate(${-this.dir}deg)`;

            let offScreen;
            if (this.dir === 1) {
                offScreen = this.x > vw + 20;
            } else {
                offScreen = this.x < -w - 20;
            }
            if (offScreen) {
                this.pauseTimeout = setTimeout(() => {
                    this.dir *= -1;
                    if (this.dir === 1) {
                        this.x = -w - 20;
                    } else {
                        this.x = vw + 20;
                    }
                    this.startY = document.documentElement.clientHeight * (0.3 + Math.random() * 0.4);
                    this.speed = 6 + Math.random() * 4;
                    this.startPass();
                    this.animFrame = requestAnimationFrame(this.onFrame);
                }, 1500 + Math.random() * 1500);
                return;
            }

            this.animFrame = requestAnimationFrame(this.onFrame);
        };

        this.animFrame = requestAnimationFrame(this.onFrame);
    }

    deactivate() {
        if (this.animFrame) cancelAnimationFrame(this.animFrame);
        if (this.pauseTimeout) clearTimeout(this.pauseTimeout);
        if (this.wrapper && this.target) {
            this.placeholder.parentNode.insertBefore(this.target, this.placeholder);
            this.placeholder.remove();
            this.nyoom.remove();
            this.wrapper.remove();
        }
    }
}

class SpringMode extends CSSMode {
    activate() {
        super.activate();

        this.angleX = 0;
        this.angleY = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.lastScrollX = window.scrollX;
        this.lastScrollY = window.scrollY;
        this.lastTime = performance.now();
        this.animFrame = null;

        // Spring constants, might need to be adjusted
        this.stiffnessX = 0.07;
        this.stiffnessY = 0.07;
        this.dampingX = 0.96;
        this.dampingY = 0.96;
        this.impulseScaleX = 0.02;
        this.impulseScaleY = 0.02;

        this.onFrame = () => {
            const forceX = -this.stiffnessX * this.angleX;
            const forceY = -this.stiffnessY * this.angleY;

            this.velocityX = (this.velocityX + forceX) * this.dampingX;
            this.velocityY = (this.velocityY + forceY) * this.dampingY;

            this.angleX += this.velocityX;
            this.angleY += this.velocityY;

            const target = document.querySelector("#comic > :first-child");
            if (target) {
                const rotationX = Math.max(-80, Math.min(80, this.angleY));
                const rotationY = Math.max(-80, Math.min(80, -this.angleX));
                target.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
            }

            const moving = Math.abs(this.velocityX) > 0.01
                || Math.abs(this.velocityY) > 0.01
                || Math.abs(this.angleX) > 0.05
                || Math.abs(this.angleY) > 0.05;

            if (moving) {
                this.animFrame = requestAnimationFrame(this.onFrame);
            } else {
                this.angleX = 0;
                this.angleY = 0;
                if (target) target.style.transform = "";
                this.animFrame = null;
            }
        };

        this.onScroll = () => {
            const now = performance.now();
            const dt = now - this.lastTime;
            if (dt > 0) {
                this.velocityX += (window.scrollX - this.lastScrollX) / dt * 16 * this.impulseScaleX;
                this.velocityY += (window.scrollY - this.lastScrollY) / dt * 16 * this.impulseScaleY;
            }
            this.lastScrollX = window.scrollX;
            this.lastScrollY = window.scrollY;
            this.lastTime = now;

            if (!this.animFrame) {
                this.animFrame = requestAnimationFrame(this.onFrame);
            }
        };

        window.addEventListener("scroll", this.onScroll);
    }

    deactivate() {
        super.deactivate();
        window.removeEventListener("scroll", this.onScroll);
        if (this.animFrame) {
            cancelAnimationFrame(this.animFrame);
            this.animFrame = null;
        }
        const target = document.querySelector("#comic img") || document.querySelector("#comic canvas");
        if (target) {
            target.style.transform = "";
        }
    }
}

class StainedGlassMode extends Mode {
    activate() {
        const comic = document.getElementById("comic");
        const img = comic.querySelector("img");
        if (!img) return;

        let palette = ["#10686a", "#31eae5", "#dfed7c", "#fbd864", "#eea841", "#f9431a", "#b11810", "#390502"];
        for (let i = 0; i < palette.length - 1; i++) {
            const j = i + Math.floor(Math.random() * (palette.length - i));
            const temp = palette[i];
            palette[i] = palette[j];
            palette[j] = temp;
        }

        this.canvas = document.createElement("canvas");
        this.canvas.id = "stained-glass-canvas";
        const ctx = this.canvas.getContext("2d", { willReadFrequently: true });

        const draw = (drawImg) => {
            const w = drawImg.naturalWidth;
            const h = drawImg.naturalHeight;
            this.canvas.width = w;
            this.canvas.height = h;
            ctx.drawImage(drawImg, 0, 0, w, h);

            const imageData = ctx.getImageData(0, 0, w, h);
            const { data, width, height } = imageData;
            const visited = Array(width).fill().map(() => Array(height).fill(false));

            const isWhitespace = (i) => data[i] > 128 && data[i + 1] > 128 && data[i + 2] > 128 && data[i + 3] > 64;

            const floodFill = (startX, startY, color) => {
                const stack = [{x: startX, y: startY}];
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);

                while (stack.length > 0) {
                    const {x, y} = stack.pop();
                    if (x < 0 || x >= width || y < 0 || y >= height) continue;

                    if (visited[x][y]) continue;

                    const i = (y * width + x) * 4;
                    if (!isWhitespace(i)) continue;

                    visited[x][y] = true;
                    data[i] = r;
                    data[i + 1] = g;
                    data[i + 2] = b;

                    stack.push({x: x + 1, y}, {x: x - 1, y}, {x, y: y + 1}, {x, y: y - 1});
                }
            };

            let colorIndex = 0;
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    if (visited[x][y]) continue;
                    const i = (y * width + x) * 4;
                    if (isWhitespace(i)) {
                        floodFill(x, y, palette[colorIndex % palette.length]);
                        colorIndex++;
                    }
                }
            }

            ctx.putImageData(imageData, 0, 0);

            // Draw original image on top so line art acts as dark lead lines
            ctx.globalCompositeOperation = "multiply";
            ctx.drawImage(drawImg, 0, 0, w, h);
            ctx.drawImage(drawImg, 0, 0, w, h);

            img.style.display = "none";
            img.parentNode.insertBefore(this.canvas, img);
        };

        this.img = img;
        // fetch with crossOrigin to avoid tainting the canvas
        const corsImg = new Image();
        this.corsImg = corsImg;
        corsImg.crossOrigin = "anonymous";
        corsImg.onload = () => { if (this.corsImg === corsImg) draw(corsImg); };
        corsImg.src = img.src;
        if (corsImg.complete) draw(corsImg);
    }

    deactivate() {
        this.corsImg = null;
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.remove();
        }
        if (this.img) {
            this.img.style.display = "";
        }
    }
}

const modes = [
    new Mode("Light Mode"),
    new CSSMode("Lighter Mode", "mode-lighter"),
    new CSSMode("Dark Mode", "mode-dark"),
    new CSSMode("Darkest Mode", "mode-darkest"),
    new CSSMode("Blurry Mode", "mode-blurry"),
    new CSSMode("Grayscale Mode", "mode-grayscale"),
    new GreyscaleMode("Greyscale Mode", "mode-greyscale"),
    new DorianGreyscaleMode("Dorian Greyscale Mode", "mode-dorian-greyscale"),
    new SpaceOperaMode("Space Opera Mode"),
    new ThreeDGlassesMode("3D Mode", "mode-3d-glasses"),
    new CSSMode("Origami Mode", "mode-origami"),
    new CSSMode("Ink Mode", "mode-ink"),
    new SpringMode("Spring Mode", "mode-spring"),
    new CSSMode("Antipodes Mode", "mode-antipodes"),
    new HackerMode("Hacker Mode", "mode-hacker"),
    new ScreensaverMode("Screensaver Mode"),
    new ModemMode("Modem Mode", "mode-modem"),
    new StainedGlassMode("Stained Glass Mode"),
    new AirplaneMode("Airplane Mode"),
    new CSSMode("Boat Mode", "mode-boat"),
];

let activeMode = null;

function onModeChange(event) {
    console.log("Mode changed to", event.target.value);
    const selected = modes[event.target.selectedIndex];

    if (activeMode) {
        console.log("Deactivating mode", activeMode.name);
        let deactivate = activeMode.deactivate();
        if (deactivate != undefined && deactivate == false) {
            console.log("Mode", activeMode.name, "refused to deactivate, aborting mode change");
            return;
        }
    }

    console.log("Activating mode", selected.name);
    selected.activate();
    activeMode = selected;
    window.sessionStorage.setItem("activeMode", selected.name);
}

function setup() {
    const modeSelector = document.createElement("select");
    modeSelector.id = "modeSelector";

    for (const mode of modes) {
        modeSelector.appendChild(new Option(mode.name));
    }

    const comic = document.getElementById("comic");
    comic.insertAdjacentElement("afterend", modeSelector)
    modeSelector.addEventListener("change", onModeChange);

    const stylesheet = new CSSStyleSheet();
    stylesheet.replaceSync(/*css*/`
body.mode-lighter {
    filter: brightness(200%) saturate(150%);
    background-color: #e6edfa;
}

body.mode-dark {
    filter: invert(1) hue-rotate(180deg);
    background-color: #102242;
}

body.mode-darkest {
    background-color: black !important;
    color: black !important;
    border-color: black !important;

    * {
        background: transparent !important;
        color: black !important;
        border-color: black !important;
        box-shadow: none !important;
        -webkit-box-shadow: none !important;
    }

    img {
        filter: brightness(0);
    }

    #modeSelector {
        background: #111 !important;
        color: black !important;
    }
}

body.mode-boat {
    animation: boat-rock 6s ease-in-out infinite;
    transform-origin: center center;
    overflow-x: hidden;
}

@keyframes boat-rock {
    0% {
        transform: rotateZ(-1deg) translateY(0px);
    }
    50% {
        transform: rotateZ(1deg) translateY(-10px);
    }
    100% {
        transform: rotateZ(-1deg) translateY(0px);
    }
}

body.mode-blurry {
    filter: blur(2px);
}

body.mode-antipodes {
    transform: rotateZ(180deg);
}

html.mode-hacker { background: black; }
body.mode-hacker {
    filter: grayscale(1) brightness(0.9) blur(0.5px) invert(1) contrast(4.5) sepia(1) saturate(15) hue-rotate(40deg);
    a { color: black; }
}

body.mode-grayscale {
    filter: grayscale(1);
}

body.mode-greyscale {
    filter: grayscale(1);
}

body.mode-dorian-greyscale {
    transition: filter 300s ease-out;
    filter: sepia(0) contrast(1) grayscale(0) brightness(1) invert(0);
}

body.mode-dorian-greyscale-filter {
    filter: sepia(0.8) contrast(0.5) grayscale(0.3) brightness(0.9) invert(0.1);
}

body.mode-modem {
    #comic {
        max-height: 0px;
        overflow-y: hidden;
        transition: max-height 6000s linear;
    }
}

body.mode-modem-filter {
    #comic {
        max-height: 60000px;
    }
}

body.mode-origami div {
    transform: rotateZ(30deg);
}

body.mode-ink {
    div {
        mix-blend-mode: luminosity;
    }

    #comic img {
        filter: blur(0.5px);
    }
}

body.mode-3d-glasses {
    position: relative;

    #comic img {
        display: none;
    }

    div#glasses {
        display: inline-block;
        margin: 0 auto;
        position: relative;
    }

    #comic img#comic1 {
        position: relative;
        display: block;
        left: 2px;
        filter: invert(1) brightness(5%) sepia(100%) saturate(10000%) hue-rotate(177deg) brightness(4.5) invert(1) opacity(1);
    }

    #comic img#comic2 {
        position: absolute;
        top: 0;
        left: -2px;
        display: block;
        filter: invert(1) brightness(5%) sepia(100%) saturate(10000%) hue-rotate(36deg) brightness(4.5) invert(1) opacity(0.5);
    }

}

body.mode-spring {
    #comic {
        perspective: 800px;
    }
}

#airplane-wrapper {
    position: fixed;
    top: 0; left: 0;
    display: flex;
    align-items: center;
    gap: 16px;
    z-index: 99999;
    pointer-events: none;
}

#airplane-wrapper > *:not(img[src*="nyoom"]) {
    filter: blur(0.4px);
}

#airplane-wrapper img[src*="nyoom"] {
    height: 48px;
    width: auto;
    image-rendering: pixelated;
}
    `);
    document.adoptedStyleSheets = [stylesheet];

    const savedMode = window.sessionStorage.getItem("activeMode");
    if (savedMode) {
        const index = modes.findIndex(m => m.name === savedMode);
        if (index > 0) {
            modeSelector.selectedIndex = index;
            modeSelector.dispatchEvent(new Event("change"));
        }
    }
}

document.addEventListener("DOMContentLoaded", setup);
