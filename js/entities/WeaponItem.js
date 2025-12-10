// js/entities/WeaponItem.js

import { state } from "../core/state.js";
import { getCanvasSize } from "../core/canvas.js";

export class WeaponItem {
    constructor(type) {
        this.type = type; // "shotgun" | "shuriken" | "default" | ...

        this.width = 40;
        this.height = 40;

        const { width } = getCanvasSize();
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
                if (typeof player.setWeapon === "function") {
                    player.setWeapon(this.type);
                } else {
                    player.weaponType = this.type;
                }
                this.markedForDeletion = true;
            }
        }

        if (this.y > height + 50) this.markedForDeletion = true;
    }

    draw() {
        const ctx = state.ctx;
        if (!ctx) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // 임시 단순 아이콘(기존 스프라이트가 있으면 교체 가능)
        const bg = this.type === "shotgun" ? "#ff8800" : "#ffdd00";
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.roundRect(-18, -18, 36, 36, 5);
        ctx.fill();

        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#111";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.type, 0, 0);

        ctx.restore();
    }
}
