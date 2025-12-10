// js/entities/Player.js

import { state } from "../core/state.js";
import { getCanvasSize } from "../core/canvas.js";
import { FPS } from "../core/config.js";
import { getWeaponDef, getBaseShootIntervalFrames } from "../logic/weapons.js";
import { Bullet } from "./Bullet.js";

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
        this.weaponType = "default";

        // 스팀팩 상태
        this.isStimpackActive = false;
        this.stimpackEndTime = 0;
    }

    update() {
        const { width } = getCanvasSize();

        // 입력 모듈이 targetX를 갱신한다고 가정하고
        // 여기서는 targetX로 부드럽게 이동만 수행
        const edge = this.width / 2;
        if (this.targetX < edge) this.targetX = edge;
        if (this.targetX > width - edge) this.targetX = width - edge;

        this.x += (this.targetX - this.x) * this.speed;

        // 스팀팩 종료
        if (this.isStimpackActive && state.frameCount >= this.stimpackEndTime) {
            this.isStimpackActive = false;
        }

        // 발사 타이머
        this.shootTimer++;

        const w = getWeaponDef(this.weaponType);

        let interval = getBaseShootIntervalFrames() * (w.intervalMul ?? 1);

        if (this.isStimpackActive) interval /= 2;

        if (this.shootTimer >= interval) {
            this.shoot();
            this.shootTimer = 0;
        }
    }

    shoot() {
        const w = getWeaponDef(this.weaponType);
        const groupId = state.bulletGroupIdCounter++;

        const newBullets = w.fire({
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
        this.stimpackEndTime = state.frameCount + 5 * FPS;
    }

    setWeapon(type) {
        this.weaponType = type || "default";
    }

    draw() {
        const ctx = state.ctx;
        if (!ctx) return;

        ctx.save();

        // 간단 병력 표시(원래 스프라이트가 있으면 교체 가능)
        ctx.fillStyle = "#88ccff";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 14, 0, Math.PI * 2);
        ctx.fill();

        // 스쿼드 숫자
        const n = Math.floor(this.squadSize);
        if (n > 1) {
            ctx.fillStyle = "#fff";
            ctx.font = "bold 16px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(String(n), this.x, this.y - 30);
        }

        ctx.restore();
    }
}
