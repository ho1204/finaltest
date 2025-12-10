// main.js

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
import { WeaponItem } from "./entities/WeaponItem.js";
import { Particle } from "./entities/Particle.js";
import { FloatingText } from "./entities/FloatingText.js";

// --------------------
// DOM refs (late bind)
// --------------------
let scoreEl, squadEl, menuScreen, startBtn, menuSubtitle, buffIndicator, titleEl;

// canvas refs
let canvas, ctx;

// --------------------
// HUD helpers
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
// Effects helpers
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
    const type = Math.random() < 0.5 ? "shotgun" : "shuriken";
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

    // 첫 스폰은 숫자벽
    if (!state.firstSpawnDone) {
        state.gates.push(new Gate());
        state.firstSpawnDone = true;
        return;
    }

    // 12웨이브마다 보스
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

    // 보스 모드 해제 체크
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

    // 스팀팩 스폰
    if (
        state.frameCount >= state.nextStimpackFrame &&
        state.stimpacks.length === 0 &&
        state.firstBossEncountered
    ) {
        state.stimpacks.push(new Stimpack());
        state.nextStimpackFrame = Infinity;
    }

    // 무기 아이템 스폰
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
            }
        }

        // gate hit
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

    state.zombies.forEach(z => z.update());
    state.gates.forEach(g => g.update());
    state.stimpacks.forEach(s => s.update());
    state.weaponItems.forEach(w => w.update());
    state.particles.forEach(p => p.update());
    state.floatingTexts.forEach(t => t.update());

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
    state.bullets.forEach(b => b.draw());
    state.particles.forEach(p => p.draw());
    if (state.player) state.player.draw();
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
// Boot (✅ 지연 로드/즉시 로드 모두 안전)
// --------------------
function boot() {
    // DOM
    scoreEl = document.getElementById("score");
    squadEl = document.getElementById("squad");
    menuScreen = document.getElementById("menu-screen");
    startBtn = document.getElementById("start-btn");
    menuSubtitle = document.getElementById("menu-subtitle");
    buffIndicator = document.getElementById("buff-indicator");
    titleEl = document.querySelector(".title");

    // Canvas init
    const init = initCanvas("gameCanvas", "game-container");
    canvas = init.canvas;
    ctx = init.ctx;

    // Core init
    initState(ctx);

    // game over handler 1회만
    setGameOverHandler(gameOverUI);

    // input은 player getter로
    initInput(canvas, () => state.player);

    // resize
    window.addEventListener("resize", () => {
        resizeCanvas("game-container");
    });

    // Button
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

    // 초기 HUD
    syncHUD();
}

// DOM이 이미 준비된 뒤에도 즉시 boot
if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", boot);
} else {
    boot();
}
