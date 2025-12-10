import { state } from "../core/state.js";
import { getCanvasSize } from "../core/canvas.js";
import { Particle } from "./Particle.js";

export class Gate {
    constructor() {
        const { width } = getCanvasSize();

        this.id = state.gateIdCounter++;
        this.width = width / 2.5 * 0.9;
        this.height = 60 * 0.9;

        this.x = Math.random() * (width - this.width);
        this.y = -100;
        this.speed = 2;

        this.value = 0;
        this.hitCount = 0;

        this.markedForDeletion = false;
    }

    update() {
        const { height } = getCanvasSize();
        const player = state.player;

        this.y += this.speed;

        if (player) {
            if (
                this.y + this.height / 2 > player.y - 20 &&
                this.y - this.height / 2 < player.y + 20 &&
                this.x < player.x &&
                this.x + this.width > player.x
            ) {
                player.squadSize += this.value;
                this.markedForDeletion = true;

                for (let i = 0; i < 5; i++) {
                    state.particles.push(new Particle(player.x, player.y, "#3498db"));
                }
            }
        }

        if (this.y > height + 50) this.markedForDeletion = true;
    }

    hit() {
        this.hitCount++;
        this.value += 1;
    }

    draw() {
        const ctx = state.ctx ?? state.__ctxFallback;
        if (!ctx) return;

        ctx.save();
        ctx.globalAlpha = 0.95;

        const grd = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        grd.addColorStop(0, "#4a6a8a");
        grd.addColorStop(0.3, "#3a5a7a");
        grd.addColorStop(0.7, "#2a4a6a");
        grd.addColorStop(1, "#1a3a5a");
        ctx.fillStyle = grd;

        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 6);
        ctx.fill();

        const borderGradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y);
        borderGradient.addColorStop(0, "#8a9aab");
        borderGradient.addColorStop(0.5, "#5a6a7a");
        borderGradient.addColorStop(1, "#8a9aab");
        ctx.strokeStyle = borderGradient;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.strokeStyle = "#2a3a4a";
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x + 3, this.y + 3, this.width - 6, this.height - 6);

        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.fillRect(this.x, this.y, this.width, this.height * 0.3);

        ctx.strokeStyle = "rgba(100, 120, 140, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.33, this.y);
        ctx.lineTo(this.x + this.width * 0.33, this.y + this.height);
        ctx.moveTo(this.x + this.width * 0.67, this.y);
        ctx.lineTo(this.x + this.width * 0.67, this.y + this.height);
        ctx.stroke();

        ctx.globalAlpha = 1.0;

        ctx.fillStyle = "#ffffff";
        ctx.font = "900 32px 'Orbitron', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0,0,0,0.9)";
        ctx.shadowBlur = 8;

        const displayVal = Math.floor(this.value);
        ctx.strokeStyle = "rgba(0,0,0,0.9)";
        ctx.lineWidth = 4;
        ctx.strokeText("+" + displayVal, this.x + this.width / 2, this.y + this.height / 2);

        const textGradient = ctx.createLinearGradient(
            this.x + this.width / 2 - 30, this.y + this.height / 2,
            this.x + this.width / 2 + 30, this.y + this.height / 2
        );
        textGradient.addColorStop(0, "#ffffff");
        textGradient.addColorStop(0.5, "#ffff88");
        textGradient.addColorStop(1, "#ffffff");
        ctx.fillStyle = textGradient;
        ctx.fillText("+" + displayVal, this.x + this.width / 2, this.y + this.height / 2);

        ctx.restore();
    }
}
