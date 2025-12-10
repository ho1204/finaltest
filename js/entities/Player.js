import { state } from "../core/state.js";
import { FPS } from "../core/config.js";
import { input } from "../core/input.js";
import { getCanvasSize } from "../core/canvas.js";
import { computeBulletsPerVolleyForSquad } from "../logic/balance.js";
import { Bullet } from "./Bullet.js";
import { FloatingText } from "./FloatingText.js";
import { drawSoldierSprite } from "../render/spritesSoldier.js";

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
        this.shootInterval = FPS / 2; // 0.5초

        this.isStimpackActive = false;
        this.stimpackEndFrame = 0;

        this.weaponType = "default"; // default | shotgun | shuriken
    }

    update() {
        const { width } = getCanvasSize();

        if (input.left) this.targetX -= this.maxSpeed;
        if (input.right) this.targetX += this.maxSpeed;

        const edge = this.width * (1 + Math.min(this.squadSize, 5) * 0.1) / 2;
        if (this.targetX < edge) this.targetX = edge;
        if (this.targetX > width - edge) this.targetX = width - edge;

        this.x += (this.targetX - this.x) * this.speed;

        if (this.isStimpackActive && state.frameCount >= this.stimpackEndFrame) {
            this.isStimpackActive = false;
            // buffIndicator는 hud에서 state/player 보고 처리하도록 할 예정
        }

        this.shootTimer++;

        let currentInterval = this.shootInterval;
        if (this.weaponType === "shotgun") currentInterval *= 1.0; // 원본 유지
        if (this.isStimpackActive) currentInterval /= 2;

        if (this.shootTimer >= currentInterval) {
            this.shoot();
            this.shootTimer = 0;
        }
    }

    shoot() {
        const effectiveSquad = Math.max(1, this.squadSize);

        const baseBulletCount = computeBulletsPerVolleyForSquad(this.squadSize);
        let bulletCount = baseBulletCount;

        if (this.weaponType === "shotgun") {
            bulletCount = Math.max(1, Math.round(baseBulletCount * 1.3));
        }

        let damagePerBullet = Math.max(1, effectiveSquad / bulletCount);

        if (this.weaponType === "shuriken") {
            damagePerBullet *= 0.7;
        }

        let bulletColor = "#f39c12";
        if (this.squadSize > 300) bulletColor = "#c0392b";
        else if (this.squadSize > 200) bulletColor = "#e74c3c";
        else if (this.squadSize > 100) bulletColor = "#d35400";

        const groupId = state.bulletGroupIdCounter++;

        if (this.weaponType === "shotgun") {
            const spreadRad = 20 * Math.PI / 180;
            const startAngle = -Math.PI / 2 - spreadRad / 2;
            const step = bulletCount > 1 ? spreadRad / (bulletCount - 1) : 0;
            const speed = 15;

            for (let i = 0; i < bulletCount; i++) {
                const angle = startAngle + step * i;
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;

                state.bullets.push(
                    new Bullet(this.x, this.y - 20, damagePerBullet, groupId, bulletColor, "shotgun", vx, vy)
                );
            }
            return;
        }

        if (this.weaponType === "shuriken") {
            const speed = 15;
            const vy = -speed;

            if (bulletCount >= 3) {
                const clusterRadius = 10;
                for (let i = 0; i < bulletCount; i++) {
                    const angle = (Math.PI * 2 / bulletCount) * i;
                    const bx = this.x + Math.cos(angle) * clusterRadius;
                    const by = this.y - 20 + Math.sin(angle) * clusterRadius;
                    state.bullets.push(
                        new Bullet(bx, by, damagePerBullet, groupId, "#f1c40f", "shuriken", 0, vy)
                    );
                }
            } else {
                for (let i = 0; i < bulletCount; i++) {
                    const spread = (i - (bulletCount - 1) / 2) * 8;
                    state.bullets.push(
                        new Bullet(this.x + spread, this.y - 20, damagePerBullet, groupId, "#f1c40f", "shuriken", 0, vy)
                    );
                }
            }
            return;
        }

        // default
        if (bulletCount >= 3) {
            const clusterRadius = 10;
            for (let i = 0; i < bulletCount; i++) {
                const angle = (Math.PI * 2 / bulletCount) * i;
                const bx = this.x + Math.cos(angle) * clusterRadius;
                const by = this.y - 20 + Math.sin(angle) * clusterRadius;
                state.bullets.push(new Bullet(bx, by, damagePerBullet, groupId, bulletColor));
            }
        } else {
            for (let i = 0; i < bulletCount; i++) {
                const spread = (i - (bulletCount - 1) / 2) * 8;
                state.bullets.push(new Bullet(this.x + spread, this.y - 20, damagePerBullet, groupId, bulletColor));
            }
        }
    }

    activateStimpack() {
        this.isStimpackActive = true;
        this.stimpackEndFrame = state.frameCount + 5 * FPS;

        state.floatingTexts.push(
            new FloatingText("SPEED UP!", this.x, this.y - 50, "#2ecc71", "30px", 60)
        );
    }

    setWeapon(type) {
        this.weaponType = type;

        const label = type === "shotgun" ? "샷건" : "표창";
        const color = type === "shotgun" ? "#e67e22" : "#f1c40f";

        state.floatingTexts.push(
            new FloatingText(label, this.x, this.y - 70, color, "26px", 60)
        );
    }

    draw() {
        // 20명 단위로 군인 1명씩 시각화, 최대 13명
        let drawCount = Math.floor((Math.max(1, this.squadSize) - 1) / 20) + 1;
        drawCount = Math.min(drawCount, 13);

        if (drawCount === 1) {
            drawSoldierSprite(state.ctx, this.x, this.y, 1.2);
        } else {
            const radius = 25;
            for (let i = 0; i < drawCount; i++) {
                const angle = (Math.PI * 2 / drawCount) * i - (Math.PI / 2);
                const ox = Math.cos(angle) * radius * (0.5 + (i % 2) * 0.5);
                const oy = Math.sin(angle) * radius * 0.8;
                drawSoldierSprite(state.ctx, this.x + ox, this.y + oy, 1.0);
            }
        }

        // 숫자 표시(원본 느낌 유지)
        const ctx = state.ctx;
        if (this.squadSize > 1) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 18px 'Orbitron'";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.strokeStyle = "rgba(0,0,0,0.9)";
            ctx.lineWidth = 5;

            const text = String(Math.floor(this.squadSize));
            ctx.strokeText(text, this.x, this.y - 50);

            const numGradient = ctx.createLinearGradient(this.x - 15, this.y - 55, this.x + 15, this.y - 45);
            numGradient.addColorStop(0, "#ffffff");
            numGradient.addColorStop(0.5, "#88ccff");
            numGradient.addColorStop(1, "#ffffff");
            ctx.fillStyle = numGradient;
            ctx.fillText(text, this.x, this.y - 50);
        }
    }
}
