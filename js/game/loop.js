import { state } from "../core/state.js";
import { FPS } from "../core/config.js";
import { ctx, getCanvasSize } from "../core/canvas.js";
import { scheduleNextStimpack } from "../logic/schedulers.js";
import { spawnEnemies, ensureWeaponItemSchedule } from "./spawn.js";
import { createParticles, createFloatingText } from "./effects.js";
import { updateScoreUI } from "./hud.js";

export function drawBackground() {
    const { width: canvasWidth, height: canvasHeight } = getCanvasSize();

    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, "#1a1a1a");
    gradient.addColorStop(0.3, "#0f0f0f");
    gradient.addColorStop(0.7, "#0a0a0a");
    gradient.addColorStop(1, "#050505");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    if (Math.random() < 0.3) {
        ctx.fillStyle = "rgba(80, 60, 40, 0.15)";
        const dustX = Math.random() * canvasWidth;
        const dustY = Math.random() * canvasHeight;
        const dustSize = Math.random() * 3 + 1;
        ctx.beginPath();
        ctx.arc(dustX, dustY, dustSize, 0, Math.PI * 2);
        ctx.fill();
    }

    const lightGradient = ctx.createRadialGradient(
        canvasWidth / 2, canvasHeight * 0.3, 0,
        canvasWidth / 2, canvasHeight * 0.3, canvasHeight * 0.6
    );
    lightGradient.addColorStop(0, "rgba(100, 80, 60, 0.1)");
    lightGradient.addColorStop(0.5, "rgba(50, 40, 30, 0.05)");
    lightGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = lightGradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.strokeStyle = "rgba(100, 80, 60, 0.2)";
    ctx.lineWidth = 2;
    ctx.setLineDash([40, 20, 10, 20]);
    ctx.lineDashOffset = -state.distance * 0.5;

    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2, 0);
    ctx.lineTo(canvasWidth / 2, canvasHeight);
    ctx.stroke();

    ctx.strokeStyle = "rgba(80, 60, 40, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvasWidth * 0.25, 0);
    ctx.lineTo(canvasWidth * 0.25, canvasHeight);
    ctx.moveTo(canvasWidth * 0.75, 0);
    ctx.lineTo(canvasWidth * 0.75, canvasHeight);
    ctx.stroke();

    ctx.setLineDash([]);

    ctx.fillStyle = "rgba(40, 30, 20, 0.3)";
    ctx.fillRect(0, canvasHeight - 20, canvasWidth, 20);

    if (Math.random() < 0.1) {
        ctx.fillStyle = "rgba(50, 50, 50, 0.2)";
        const smokeX = Math.random() * canvasWidth;
        const smokeY = canvasHeight - 30 + Math.sin(Date.now() * 0.001) * 10;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, 8, 0, Math.PI * 2);
        ctx.arc(smokeX + 5, smokeY - 3, 6, 0, Math.PI * 2);
        ctx.fill();
    }
}

export function update() {
    if (state.gameState !== "PLAYING") return;

    const { width: canvasWidth, height: canvasHeight } = getCanvasSize();

    state.frameCount++;
    state.distance += 5;

    state.player.update();

    // 스팀팩 스폰 체크(첫 보스 이후만)
    if (
        state.frameCount >= state.nextStimpackFrame &&
        state.stimpacks.length === 0 &&
        state.firstBossEncountered
    ) {
        // Stimpack 생성은 엔티티에서 처리한다고 가정
        state.stimpacks.push(new state.StimpackClass());
        state.nextStimpackFrame = Infinity;
    }

    // 무기 아이템 스폰 체크
    ensureWeaponItemSchedule();

    // 총알 업데이트 + 충돌
    state.bullets.forEach((bullet) => {
        bullet.update();

        let hitZombie = false;

        for (let zombie of state.zombies) {
            if (zombie.markedForDeletion) continue;

            const dist = Math.hypot(bullet.x - zombie.x, bullet.y - zombie.y);

            if (dist < zombie.radius + 10) {
                hitZombie = true;

                let appliedDamage = bullet.damage;

                if (bullet.weaponType === "shuriken") {
                    if (bullet.hitCount === 0) appliedDamage = bullet.damage;
                    else if (bullet.hitCount === 1) appliedDamage = bullet.damage * 0.5;
                    else if (bullet.hitCount === 2) appliedDamage = bullet.damage * 0.3;
                    else appliedDamage = 0;
                }

                if (appliedDamage > 0) {
                    const isDead = zombie.takeDamage(appliedDamage);

                    createFloatingText(
                        `-${Math.floor(appliedDamage)}`,
                        bullet.x, bullet.y,
                        "#f1c40f",
                        "20px",
                        20
                    );
                    createParticles(bullet.x, bullet.y - 10, "#c0392b");

                    if (isDead) {
                        if (!zombie.isBoss) {
                            state.normalZombieKillCount++;
                            state.normalZombieSpawnCount = Math.min(
                                30,
                                1 + Math.floor(state.normalZombieKillCount / 50)
                            );
                        }

                        const gain = Math.floor(zombie.maxHp / 2);
                        state.score += gain;
                        updateScoreUI();

                        createFloatingText(
                            `+${gain}점`,
                            zombie.x, zombie.y,
                            "#f1c40f",
                            "24px",
                            40
                        );
                    }
                }

                bullet.hitCount++;

                if (bullet.weaponType !== "shuriken" || bullet.hitCount >= 3) {
                    bullet.markedForDeletion = true;
                    break;
                }

                if (bullet.weaponType !== "shuriken") break;
            }
        }

        // 게이트 타격(좀비를 안 맞췄을 때)
        if (!hitZombie) {
            for (let gate of state.gates) {
                if (
                    bullet.y < gate.y + gate.height &&
                    bullet.y > gate.y &&
                    bullet.x > gate.x &&
                    bullet.x < gate.x + gate.width
                ) {
                    createParticles(bullet.x, bullet.y, "#fff");

                    const key = `${bullet.groupId}-${gate.id}`;
                    if (!state.bulletGroupGateHit[key]) {
                        state.bulletGroupGateHit[key] = true;
                        gate.hit();
                    }
                    break;
                }
            }
        }

        // 화면 이탈 처리
        if (
            bullet.y < -50 || bullet.y > canvasHeight + 50 ||
            bullet.x < -50 || bullet.x > canvasWidth + 50
        ) {
            bullet.markedForDeletion = true;
        }
    });

    state.zombies.forEach(z => z.update());
    state.gates.forEach(g => g.update());
    state.stimpacks.forEach(s => s.update());
    state.weaponItems.forEach(w => w.update());
    state.particles.forEach(p => p.update());
    state.floatingTexts.forEach(t => t.update());

    // 정리
    state.bullets = state.bullets.filter(b => !b.markedForDeletion);
    state.zombies = state.zombies.filter(z => !z.markedForDeletion);
    state.gates = state.gates.filter(g => !g.markedForDeletion);
    state.stimpacks = state.stimpacks.filter(s => !s.markedForDeletion);
    state.weaponItems = state.weaponItems.filter(w => !w.markedForDeletion);
    state.particles = state.particles.filter(p => p.life > 0);
    state.floatingTexts = state.floatingTexts.filter(t => !t.markedForDeletion);

    // 스팀팩이 화면 밖으로 사라졌을 때 다음 예약(원본 의도 반영)
    if (state.firstBossEncountered && state.stimpacks.length === 0 && state.nextStimpackFrame === Infinity) {
        // “먹었든 못 먹었든” 다음 예약은 Stimpack 엔티티가 처리하는 구조가 가장 깔끔하지만
        // 현재는 원본 호환을 위해 안전하게 한 번 더 예약 가능하도록 둠.
        state.nextStimpackFrame = scheduleNextStimpack(state.frameCount, FPS);
    }

    spawnEnemies();
}

export function draw() {
    if (state.gameState !== "PLAYING") return;

    const { width: canvasWidth, height: canvasHeight } = getCanvasSize();
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    drawBackground();

    state.gates.forEach(g => g.draw());
    state.stimpacks.forEach(s => s.draw());
    state.weaponItems.forEach(w => w.draw());
    state.zombies.forEach(z => z.draw());
    state.bullets.forEach(b => b.draw());
    state.particles.forEach(p => p.draw());
    state.player.draw();
    state.floatingTexts.forEach(t => t.draw());
}

export function animate() {
    if (state.gameState !== "PLAYING") return;

    update();
    draw();

    state.frameId = requestAnimationFrame(animate);
}
