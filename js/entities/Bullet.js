import { ctx, getCanvasSize } from "../core/canvas.js";

export class Bullet {
    constructor(x, y, damage, groupId, color, type = "default", vx = 0, vy = -15) {
        this.x = x;
        this.y = y;

        this.weaponType = type; // default | shotgun | shuriken

        this.radius = type === "shuriken" ? 6 : 3.63;

        this.damage = damage;
        this.groupId = groupId;
        this.color = color;

        this.vx = vx;
        this.vy = vy;

        this.markedForDeletion = false;
        this.hitCount = 0;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        const { width, height } = getCanvasSize();
        if (this.y < -50 || this.y > height + 50 || this.x < -50 || this.x > width + 50) {
            this.markedForDeletion = true;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.weaponType === "shuriken") {
            const rotation = (Date.now() * 0.01) % (Math.PI * 2);
            ctx.rotate(rotation);

            const r = this.radius;

            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.5);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(0.7, this.color);
            gradient.addColorStop(1, "rgba(241, 196, 15, 0.3)");

            ctx.shadowColor = this.color;
            ctx.shadowBlur = 12;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            ctx.beginPath();
            ctx.moveTo(0, -r);
            ctx.lineTo(r * 0.7, -r * 0.3);
            ctx.lineTo(r, 0);
            ctx.lineTo(r * 0.3, r * 0.7);
            ctx.lineTo(0, r);
            ctx.lineTo(-r * 0.3, r * 0.7);
            ctx.lineTo(-r, 0);
            ctx.lineTo(-r * 0.7, -r * 0.3);
            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.shadowBlur = 0;

            const innerR = r * 0.6;
            ctx.beginPath();
            ctx.moveTo(0, -innerR);
            ctx.lineTo(innerR * 0.7, -innerR * 0.3);
            ctx.lineTo(innerR, 0);
            ctx.lineTo(innerR * 0.3, innerR * 0.7);
            ctx.lineTo(0, innerR);
            ctx.lineTo(-innerR * 0.3, innerR * 0.7);
            ctx.lineTo(-innerR, 0);
            ctx.lineTo(-innerR * 0.7, -innerR * 0.3);
            ctx.closePath();

            const innerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, innerR);
            innerGradient.addColorStop(0, "#fff9c4");
            innerGradient.addColorStop(0.5, this.color);
            innerGradient.addColorStop(1, "rgba(241, 196, 15, 0.6)");
            ctx.fillStyle = innerGradient;
            ctx.fill();

            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2);
            ctx.fillStyle = "#2c3e50";
            ctx.fill();
            ctx.strokeStyle = "#34495e";
            ctx.lineWidth = 0.5;
            ctx.stroke();

            ctx.restore();
            return;
        }

        const bulletGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
        bulletGradient.addColorStop(0, this.color);
        bulletGradient.addColorStop(0.7, this.color);
        bulletGradient.addColorStop(1, "rgba(0,0,0,0.8)");

        ctx.fillStyle = bulletGradient;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.beginPath();
        ctx.arc(-this.radius * 0.3, -this.radius * 0.3, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }
}
