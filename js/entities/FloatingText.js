import { ctx } from "../core/canvas.js";

export class FloatingText {
    constructor(text, x, y, color, fontSize = "24px", lifetime = 30) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.color = color;
        this.fontSize = fontSize;
        this.life = lifetime;
        this.maxLife = lifetime;
        this.speedY = -1;
        this.markedForDeletion = false;
    }

    update() {
        this.y += this.speedY;
        this.life--;
        if (this.life <= 0) this.markedForDeletion = true;
    }

    draw() {
        ctx.save();

        const opacity = this.life / this.maxLife;
        ctx.globalAlpha = opacity;

        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.fontSize} 'Orbitron'`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0,0,0,0.9)";
        ctx.shadowBlur = 6;

        ctx.strokeStyle = "rgba(0,0,0,0.8)";
        ctx.lineWidth = 3;
        ctx.strokeText(this.text, this.x, this.y);

        ctx.fillText(this.text, this.x, this.y);

        ctx.restore();
    }
}
