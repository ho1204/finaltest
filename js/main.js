// js/main.js

console.log("main.js loaded");

// --------------------
// Imports
// --------------------
import { FPS } from "./core/config.js";
import { initCanvas, resizeCanvas, getCanvasSize } from "./core/canvas.js";
import { state, initState, resetPlayState, setGameOverHandler } from "./core/state.js";
import { initInput } from "./core/input.js";

import { Player } from "./entities/Player.js";
import { ZombieHorde } from "./entities/ZombieHorde.js";
import { Gate } from "./entities/Gate.js";
import { Stimpack } from "./entities/Stimpack.js";
import { Particle } from "./entities/Particle.js";
import { FloatingText } from "./entities/FloatingText.js";

// ✅ 무기 드랍 아이템 + 무기 키 목록을 같은 파일에서
import { WeaponItem } from "./entities/WeaponItem.js";
import { getWeaponKeys } from "./logic/weapons.js";

// --------------------
// DOM refs
// --------------------
let scoreEl, squadEl, menuScreen, startBtn, menuSubtitle, buffIndicator, titleEl;

// canvas refs
let canvas, ctx;

// --------------------
// HUD
// --------------------
function syncHUD() {
    if (scoreEl) scoreEl.innerText = Math.floor(state.score);
    if (squadEl) squadEl.innerText = state.player ? Math.floor(state.player.squadSize) : 1;

    if (buffIndicator) {
        buffIndicator.style.display =
            state.player && state.player.isStimpackActive ? "block" : "none";
    }
}

// --------------------
// Effects
// --------------------
function createParticles(x, y, color) {
    for (let i = 0; i < 5; i++) {
        state.particles.push(new Particle(x, y, color));
    }
}

function createFloatingText(text, x, y, color, fontSize = "24px", lifetime = 30) {
    state.floatingTexts.push(new FloatingText(text, x, y, color, fontSize, lifetime));
}

// --------------------
// Spawning
// --------------------
function spawnWeaponItem() {
    const keys = getWeaponKeys().filter(k => k !== "default");
    const type = keys[Math.floor(Math.random() * keys.length)];
    state.weaponItems.push(new WeaponItem(type));
}

function scheduleNextWeaponItem() {
    state.nextWeaponItemFrame = state.frameCount + 30 * FPS;
}

function bossWarning() {
    const warning = document.createElement("div");
    warning.innerText = "BOSS APPROACHING";
    warning.style.position = "absolute";
    warning.style.top = "20%";
    warning.style.width = "100%";
    warning.style.textAlign = "center";
    warning.style.color = "#ff4444";
    warning.style.fontSize = "44px";
    warning.style.fontWeight = "900";
    warning.style.fontFamily = "Orbitron";
    warning.style.textShadow =
        "0 0 20px rgba(255, 68, 68, 0.8), " +
        "0 0 40px rgba(255, 68, 68, 0.5), " +
        "0 4px 8px rgba(0,0,0,0.9)";
    warning.style.letterSpacing = "4px";
    warning.style.zIndex = "5";
    document.body.appendChild(warning);

    setTimeout(() => warning.remove(), 2500);
}

function spawnEnemies() {
    state.spawnTimer++;

    const spawnRate = 120;
    if (state.spawnTimer <= spawnRate) return;

    state.spawnTimer = 0;
    state.waveCount++;

    if (!state.firstSpawnDone) {
        state.gates.push(new Gate());
        state.firstSpawnDone = true;
        return;
    }

    if (!state.bossMode && state.waveCount % 12 === 0) {
        state.bossMode = true;
        state.zombies.push(new ZombieHorde(true));

        state.nextStimpackFrame = state.frameCount + 4 * FPS;
        state.firstBossEncountered = true;

        bossWarning();
        return;
    }

    const rand = Math.random();

    if (rand < 0.6) {
        for (let i = 0; i < state.normalZombieSpawnCount; i++) {
            state.zombies.push(new ZombieHorde(false));
        }
    } else if (rand < 0.8) {
        state.gates.push(new Gate());
    } else {
        state.gates.push(new Gate());
        setTimeout(() => {
            for (let i = 0; i < state.normalZombieSpawnCount; i++) {
                state.zombies.push(new ZombieHorde(false));
            }
        }, 600);
    }

    if (state.bossMode) {
        const bossExists = state.zombies.some(z => z.isBoss);
        if (!bossExists) state.bossMode = false;
    }
}

// --------------------
// Main update
// --------------------
function update() {
    if (state.gameState !== "PLAYING") return;
    if (!state.player) return;

    state.frameCount++;
    state.distance += 5;

    state.player.update();

    if (
        state.frameCount >= state.nextStimpackFrame &&
        state.stimpacks.length === 0 &&
        state.firstBossEncountered
    ) {
        state.stimpacks.push(new Stimpack());
        state.nextStimpackFrame = Infinity;
    }

    if (state.frameCount >= state.nextWeaponItemFrame && state.weaponItems.length === 0) {
        spawnWeaponItem();
        scheduleNextWeaponItem();
    }

    // bullets update + collision
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
                        bullet.x,
                        bullet.y,
                        "#f1c40f",
                        "20px",
                        20
                    );
                    createParticles(bullet.x, bullet.y - 10, "#c0392b");

                    // 폭탄 광역
                    if (bullet.weaponType === "bomb" && bullet.explosionRadius > 0) {
                        const r = bullet.explosionRadius;

                        for (const z2 of state.zombies) {
                            if (z2 === zombie) continue;
                            if (z2.markedForDeletion) continue;

                            const d2 = Math.hypot(z2.x - bullet.x, z2.y - bullet.y);
                            if (d2 <= r) {
                                z2.takeDamage(appliedDamage);
                            }
                        }

                        bullet.markedForDeletion = true;
                    }

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

                        createFloatingText(
                            `+${gain}점`,
                            zombie.x,
                            zombie.y,
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

        // 숫자벽 증가 규칙 유지
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
    });

    // entities update
    state.zombies.forEach(z => z.update());
    state.gates.forEach(g => g.update());
    state.stimpacks.forEach(s => s.update());
    state.weaponItems.forEach(w => w.update());
    state.particles.forEach(p => p.update());
    state.floatingTexts.forEach(t => t.update());

    // clean arrays
    state.bullets = state.bullets.filter(b => !b.markedForDeletion);
    state.zombies = state.zombies.filter(z => !z.markedForDeletion);
    state.gates = state.gates.filter(g => !g.markedForDeletion);
    state.stimpacks = state.stimpacks.filter(s => !s.markedForDeletion);
    state.weaponItems = state.weaponItems.filter(w => !w.markedForDeletion);
    state.particles = state.particles.filter(p => p.life > 0);
    state.floatingTexts = state.floatingTexts.filter(t => !t.markedForDeletion);

    spawnEnemies();
    syncHUD();
}

// --------------------
// Main draw
// --------------------
function draw() {
    const { width, height } = getCanvasSize();
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);

    state.gates.forEach(g => g.draw());
    state.stimpacks.forEach(s => s.draw());
    state.weaponItems.forEach(w => w.draw());
    state.zombies.forEach(z => z.draw());

    // Bullet.draw(ctx) 형태면 아래 유지
    state.bullets.forEach(b => b.draw(ctx));

    state.particles.forEach(p => p.draw());
    if (state.player) state.player.draw(ctx);
    state.floatingTexts.forEach(t => t.draw());
}

// --------------------
// Loop
// --------------------
function animate() {
    if (state.gameState !== "PLAYING") return;

    update();
    draw();

    state.frameId = requestAnimationFrame(animate);
}

// --------------------
// Game start / over UI
// --------------------
function initGame() {
    resetPlayState();
    state.player = new Player();

    if (titleEl) titleEl.innerHTML = "ZOMBIE<br>SQUAD";
    if (menuSubtitle) {
        menuSubtitle.innerHTML =
            "인류 최후의 방어선!<br>군인을 모아 좀비를 물리치세요.";
    }
    if (startBtn) startBtn.innerText = "작전 시작";

    if (menuScreen) menuScreen.classList.add("hidden");

    syncHUD();
    animate();
}

function gameOverUI() {
    state.gameState = "GAMEOVER";
    if (state.frameId) cancelAnimationFrame(state.frameId);

    if (menuScreen) menuScreen.classList.remove("hidden");
    if (titleEl) titleEl.innerText = "MISSION FAILED";

    if (menuSubtitle) {
        const maxSquad = state.player ? Math.floor(state.player.squadSize) : 1;
        menuSubtitle.innerHTML =
            `최종 점수: <span style="color:#f1c40f">${Math.floor(state.score)}</span><br>` +
            `최대 병력: ${maxSquad}`;
    }

    if (startBtn) startBtn.innerText = "다시 도전";
}

// --------------------
// Boot
// --------------------
window.addEventListener("DOMContentLoaded", () => {
    scoreEl = document.getElementById("score");
    squadEl = document.getElementById("squad");
    menuScreen = document.getElementById("menu-screen");
    startBtn = document.getElementById("start-btn");
    menuSubtitle = document.getElementById("menu-subtitle");
    buffIndicator = document.getElementById("buff-indicator");
    titleEl = document.querySelector(".title");

    const init = initCanvas("gameCanvas", "game-container");
    canvas = init.canvas;
    ctx = init.ctx;

    initState(ctx);

    setGameOverHandler(gameOverUI);

    initInput(canvas, () => state.player);

    window.addEventListener("resize", () => {
        resizeCanvas("game-container");
    });

    if (startBtn) {
        startBtn.addEventListener("click", () => {
            try {
                initGame();
            } catch (e) {
                console.error("initGame error:", e);
                if (menuSubtitle) menuSubtitle.innerHTML = "실행 에러 발생<br>콘솔 확인";
            }
        });
    }

    syncHUD();
});
