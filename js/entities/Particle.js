// js/entities/Particle.js
import { state } from "../core/state.js";

export class Particle {
    constructor(x, y, color = "#ffffff") {
        this.x = x;
        this.y = y;
        this.color = color;

        this.size = Math.random() * 4 + 2;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * 6 - 3;

        this.life = 1.0;        // 1.0 -> 0
        this.decay = 0.05;      // 프레임당 감소량
        this.markedForDeletion = false;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        this.life -= this.decay;
        if (this.life <= 0) {
            this.life = 0;
            this.markedForDeletion = true;
        }
    }

    draw() {
        const ctx = state.ctx;
        if (!ctx) return;

        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
