import { state } from "../core/state.js";
import { FPS } from "../core/config.js";
import { getCanvasSize } from "../core/canvas.js";
import { scheduleNextStimpack } from "../logic/schedulers.js";
import { Particle } from "./Particle.js";
import { drawStimpackSprite } from "../render/spritesItems.js";

export class Stimpack {
    constructor() {
        const { width } = getCanvasSize();

        this.width = 40;
        this.height = 40;
        this.x = Math.random() * (width - this.width * 2) + this.width;
        this.y = -50;
        this.speed = 3;

        this.markedForDeletion = false;
    }

    update() {
        const { height } = getCanvasSize();
        const player = state.player;

        this.y += this.speed;

        if (player) {
            const dist = Math.hypot(this.x - player.x, this.y - player.y);
            if (dist < 40) {
                player.activateStimpack();
                this.markedForDeletion = true;

                for (let i = 0; i < 5; i++) state.particles.push(new Particle(this.x, this.y, "#2ecc71"));

                state.nextStimpackFrame = scheduleNextStimpack(state.frameCount, FPS);
            }
        }

        if (this.y > height + 50) {
            this.markedForDeletion = true;
            state.nextStimpackFrame = scheduleNextStimpack(state.frameCount, FPS);
        }
    }

    draw() {
        drawStimpackSprite(state.ctx ?? state.__ctxFallback, this.x, this.y);
    }
}
