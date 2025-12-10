// js/entities/Player.js

import { FPS } from "../core/config.js";
import { state } from "../core/state.js";
import { getCanvasSize } from "../core/canvas.js";
import { input } from "../core/input.js";
import { getWeaponDef, getBaseShootIntervalFrames } from "../logic/weapons.js";
import { Bullet } from "./Bullet.js";
import { drawSoldierSprite } from "../render/sprites.js";
import { createFloatingText } from "../logic/effects.js";

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
        this.baseShootInterval = getBaseShootIntervalFrames(); // 기본 0.5초

        // 스팀팩
        this.isStimpackActive = false;
        this.stimpackEndTime = 0;

        // 무기
        this.weaponType = "default";
    }

    getCurrentShootInterval() {
        const weapon = getWeaponDef(this.weaponType);
        let interval = this.baseShootInterval * (weapon.intervalMul ?? 1.0);

        if (this.isStimpackActive) interval /= 2; // 스팀팩 2배 연사
        return interval;
    }

    update() {
        const { width, height } = getCanvasSize();

        // 화면 높이 변동 대응
        this.y = height - 80;

        // 키 입력 기반 목표 이동
        if (input?.left) this.targetX -= this.maxSpeed;
        if (input?.right) this.targetX += this.maxSpeed;

        // 터치 입력에서 targetX를 직접 세팅하는 구조면 그대로 존중
        if (typeof input?.targetX === "number") {
            this.targetX = input.targetX;
        }

        // 경계 처리
        const edge = this.width * (1 + Math.min(this.squadSize, 5) * 0.1) / 2;
        if (this.targetX < edge) this.targetX = edge;
        if (this.targetX > width - edge) this.targetX = width - edge;

        // 부드러운 이동
        this.x += (this.targetX - this.x) * this.speed;

        // 스팀팩 종료
        if (this.isStimpackActive && state.frameCount >= this.stimpackEndTime) {
            this.isStimpackActive = false;
        }

        // 발사
        this.shootTimer++;
        const interval = this.getCurrentShootInterval();

        if (this.shootTimer >= interval) {
            this.shoot();
            this.shootTimer = 0;
        }
    }

    shoot() {
        const weapon = getWeaponDef(this.weaponType);
        const groupId = state.bulletGroupIdCounter++;

        const created = weapon.fire({
            player: this,
            Bullet,
            groupId,
            state
        });

        if (Array.isArray(created) && created.length) {
            state.bullets.push(...created);
        }
    }

    activateStimpack() {
        this.isStimpackActive = true;
        this.stimpackEndTime = state.frameCount + 5 * FPS;

        createFloatingText("SPEED UP!", this.x, this.y - 50, "#2ecc71", "30px", 60);
    }

    setWeapon(type) {
        this.weaponType = type;

        const weapon = getWeaponDef(type);
        const label = weapon.label ?? type;

        createFloatingText(label, this.x, this.y - 70, "#f1c40f", "26px", 60);
    }

    draw() {
        const ctx = state.ctx;
        if (!ctx) return;

        // 스쿼드 시각화 보정(기존 룰)
        let drawCount = Math.floor((Math.max(1, this.squadSize) - 1) / 20) + 1;
        drawCount = Math.min(drawCount, 13);

        if (drawCount === 1) {
            drawSoldierSprite(ctx, this.x, this.y, 1.2);
        } else {
            const radius = 25;
            for (let i = 0; i < drawCount; i++) {
                const angle = (Math.PI * 2 / drawCount) * i - Math.PI / 2;
                const ox = Math.cos(angle) * radius * (0.5 + (i % 2) * 0.5);
                const oy = Math.sin(angle) * radius * 0.8;
                drawSoldierSprite(ctx, this.x + ox, this.y + oy, 1.0);
            }
        }

        // 숫자 표시
        if (this.squadSize > 1) {
            ctx.save();
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 18px 'Orbitron'";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.strokeStyle = "rgba(0,0,0,0.9)";
            ctx.lineWidth = 5;
            ctx.strokeText(Math.floor(this.squadSize), this.x, this.y - 50);
            ctx.fillText(Math.floor(this.squadSize), this.x, this.y - 50);
            ctx.restore();
        }
    }
}
