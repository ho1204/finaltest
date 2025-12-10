import { state } from "../core/state.js";
import { FPS } from "../core/config.js";
import { getCanvasSize } from "../core/canvas.js";
import { getBaseZombieHp } from "../logic/balance.js";
import { drawZombieSprite } from "../render/spritesZombie.js";

export class ZombieHorde {
    constructor(isBoss = false) {
        const { width } = getCanvasSize();

        this.isBoss = isBoss;
        this.radius = isBoss ? 84 : 40;

        this.x = Math.random() * (width - this.radius * 2) + this.radius;
        this.y = -150;

        const speedMultiplier = 0.95;
        this.speed = (isBoss ? 0.26 : (0.8 + Math.random() * 0.5)) * speedMultiplier;
        this.horizontalSpeed = ((isBoss ? 0.515 : 0.3) * 1.05) * speedMultiplier;

        let baseHp = getBaseZombieHp(state.player, FPS);

        let hpMultiplier = 1.0;
        if (this.isBoss) hpMultiplier = 0.7;
        else if (state.waveCount >= 2) hpMultiplier = 0.7;

        baseHp = Math.floor(baseHp * hpMultiplier * 0.95);

        if (state.bossMode && !this.isBoss) {
            baseHp = Math.floor(baseHp * 0.5 * 0.95);
        }

        if (this.isBoss) {
            this.hp = baseHp * 14.25;
            this.maxHp = this.hp;
        } else {
            state.zombieSpawnedCount++;

            if (state.zombieSpawnedCount <= 5) {
                const randHp = 30 + Math.floor(Math.random() * 31);
                let adjustedRandHp = Math.floor(randHp * hpMultiplier * 0.95);
                if (state.bossMode) adjustedRandHp = Math.floor(adjustedRandHp * 0.5 * 0.95);

                this.hp = adjustedRandHp;
                this.maxHp = this.hp;
            } else {
                this.hp = baseHp;
                this.maxHp = this.hp;
            }
        }

        this.markedForDeletion = false;
        this.hitShake = 0;

        this.subZombies = [];

        let visualCount = 1;
        if (!this.isBoss) {
            visualCount = Math.ceil(this.hp / 100);
            visualCount = Math.max(1, Math.min(visualCount, 15));
        }

        for (let i = 0; i < visualCount; i++) {
            this.subZombies.push({
                ox: (Math.random() - 0.5) * this.radius * 1.5,
                oy: (Math.random() - 0.5) * this.radius * 0.8,
                scale: 0.8 + Math.random() * 0.4,
                wobbleOffset: Math.random() * Math.PI * 2
            });
        }
    }

    takeDamage(damage) {
        this.hp -= damage;
        this.hitShake = 5;

        if (this.hp <= 0) {
            this.markedForDeletion = true;
            return true;
        }
        return false;
    }

    update() {
        const { height } = getCanvasSize();
        const player = state.player;

        this.y += this.speed;
        if (this.hitShake > 0) this.hitShake--;

        if (player) {
            const dx = player.x - this.x;
            const dirX = Math.sign(dx);
            this.x += dirX * this.horizontalSpeed;

            const dist = Math.hypot(this.x - player.x, this.y - player.y);
            if (dist < this.radius + 20) {
                // 순환참조 방지용: 콜백 방식
                if (typeof state.onGameOver === "function") state.onGameOver();
                else state.gameState = "GAMEOVER";
            }
        }

        if (this.y > height + 100) {
            if (this.hp > 0) {
                const penalty = Math.floor(this.hp * 0.8);
                state.score -= penalty;

                // 떠오르는 텍스트는 loop에서 그리도록 state에 직접 넣는 구조를 권장
                // 여기서는 단순히 표시 요청만 추가
                state.floatingTexts.push({
                    __tempText: `-${penalty}`,
                    x: this.x,
                    y: height - 50,
                    color: "#e74c3c",
                    fontSize: "40px",
                    lifetime: 40
                });
            }

            if (this.isBoss) {
                if (typeof state.onGameOver === "function") state.onGameOver();
                else state.gameState = "GAMEOVER";
            } else {
                this.markedForDeletion = true;
            }
        }
    }

    draw() {
        const ctx = state.ctx ?? state.__ctxFallback;
        if (!ctx) return;

        ctx.save();

        let shakeX = 0;
        if (this.hitShake > 0) shakeX = Math.sin(this.hitShake * Math.PI) * 5;

        ctx.translate(this.x + shakeX, this.y);

        if (this.isBoss) {
            const bossGlow = ctx.createRadialGradient(0, 0, this.radius, 0, 0, this.radius + 20);
            bossGlow.addColorStop(0, "rgba(200, 0, 0, 0.4)");
            bossGlow.addColorStop(0.5, "rgba(150, 0, 0, 0.2)");
            bossGlow.addColorStop(1, "rgba(100, 0, 0, 0)");
            ctx.fillStyle = bossGlow;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 20, 0, Math.PI * 2);
            ctx.fill();

            const pulse = Math.sin(Date.now() * 0.005) * 0.1 + 0.9;
            ctx.fillStyle = "rgba(255, 0, 0, 0.15)";
            ctx.beginPath();
            ctx.arc(0, 0, (this.radius + 15) * pulse, 0, Math.PI * 2);
            ctx.fill();

            drawZombieSprite(ctx, 0, 0, 3.5, true);
        } else {
            this.subZombies.sort((a, b) => a.oy - b.oy);

            this.subZombies.forEach(sub => {
                const wobble = Math.sin(Date.now() * 0.005 + sub.wobbleOffset) * 2;
                drawZombieSprite(ctx, sub.ox + wobble, sub.oy, sub.scale, false);
            });
        }

        const hpPercent = Math.max(0, this.hp / this.maxHp);
        const barWidth = this.radius * 2;

        const barBgGradient = ctx.createLinearGradient(-barWidth / 2, -this.radius - 20, -barWidth / 2, -this.radius - 10);
        barBgGradient.addColorStop(0, "#1a1a1a");
        barBgGradient.addColorStop(0.5, "#0a0a0a");
        barBgGradient.addColorStop(1, "#1a1a1a");
        ctx.fillStyle = barBgGradient;
        ctx.fillRect(-barWidth / 2 - 2, -this.radius - 22, barWidth + 4, 14);

        ctx.fillStyle = "rgba(20, 20, 20, 0.9)";
        ctx.fillRect(-barWidth / 2, -this.radius - 20, barWidth, 10);

        const hpBarGradient = ctx.createLinearGradient(-barWidth / 2, -this.radius - 20, -barWidth / 2 + barWidth * hpPercent, -this.radius - 10);
        if (this.isBoss) {
            hpBarGradient.addColorStop(0, "#aa44cc");
            hpBarGradient.addColorStop(1, "#8e22aa");
        } else {
            hpBarGradient.addColorStop(0, "#ff4444");
            hpBarGradient.addColorStop(1, "#cc2222");
        }
        ctx.fillStyle = hpBarGradient;
        ctx.fillRect(-barWidth / 2, -this.radius - 20, barWidth * hpPercent, 10);

        if (hpPercent > 0) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            ctx.fillRect(-barWidth / 2, -this.radius - 20, barWidth * hpPercent, 3);
        }

        ctx.strokeStyle = "#555555";
        ctx.lineWidth = 2;
        ctx.strokeRect(-barWidth / 2 - 2, -this.radius - 22, barWidth + 4, 14);
        ctx.strokeStyle = "#888888";
        ctx.lineWidth = 1;
        ctx.strokeRect(-barWidth / 2 - 1, -this.radius - 21, barWidth + 2, 12);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px 'Orbitron'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "rgba(0,0,0,0.9)";
        ctx.lineWidth = 4;
        const hpText = String(Math.floor(this.hp));
        ctx.strokeText(hpText, 0, -this.radius - 35);
        ctx.fillText(hpText, 0, -this.radius - 35);

        ctx.restore();
    }
}
