// js/entities/Player.js

import { FPS } from "../core/config.js";
import { getCanvasSize } from "../core/canvas.js";
import { input } from "../core/input.js";
import { state } from "../core/state.js";
import { Bullet } from "./Bullet.js";

// ✅ 무기 정의를 WeaponItem.js에서 가져온다
import { getWeaponDef, getBaseShootIntervalFrames } from "./WeaponItem.js";

export class Player {
    constructor() {
        const { width, height } = getCanvasSize();

        this.width = 40;
        this.height = 40;

        this.x = width / 2;
        this.y = height - 80;
        this.targetX = this.x;

        this.speed = 0.15;
        this.maxSpeed = 8;

        this.squadSize = 1;

        this.shootTimer = 0;
        this.shootInterval = getBaseShootIntervalFrames();

        this.isStimpackActive = false;
        this.stimpackEndTime = 0;

        this.weaponType = "default";
    }

    update() {
        const { width } = getCanvasSize();

        if (input?.left) this.targetX -= this.maxSpeed;
        if (input?.right) this.targetX += this.maxSpeed;

        const edge = this.width * (1 + Math.min(this.squadSize, 5) * 0.1) / 2;
        if (this.targetX < edge) this.targetX = edge;
        if (this.targetX > width - edge) this.targetX = width - edge;

        this.x += (this.targetX - this.x) * this.speed;

        if (this.isStimpackActive && state.frameCount >= this.stimpackEndTime) {
            this.isStimpackActive = false;
        }

        this.shootTimer++;

        const weapon = getWeaponDef(this.weaponType);

        let interval = this.shootInterval * (weapon.intervalMul ?? 1.0);

        if (this.isStimpackActive) interval /= 2;

        if (this.shootTimer >= interval) {
            this.shoot();
            this.shootTimer = 0;
        }
    }

    shoot() {
        const weapon = getWeaponDef(this.weaponType);
        const groupId = state.bulletGroupIdCounter++;

        const newBullets = weapon.fire({
            player: this,
            Bullet,
            groupId
        });

        if (Array.isArray(newBullets) && newBullets.length) {
            state.bullets.push(...newBullets);
        }
    }

    activateStimpack() {
        this.isStimpackActive = true;
        this.stimpackEndTime = state.frameCount + (5 * FPS);
    }

    setWeapon(type) {
        this.weaponType = type;
    }

    draw(ctx) {
        if (!ctx) ctx = state.ctx ?? state.__ctxFallback;
        if (!ctx) return;

        ctx.save();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 14, 0, Math.PI * 2);
        ctx.fill();

        if (this.squadSize > 1) {
            ctx.fillStyle = "#00d4ff";
            ctx.font = "bold 16px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(Math.floor(this.squadSize), this.x, this.y - 24);
        }

        ctx.restore();
    }
}
