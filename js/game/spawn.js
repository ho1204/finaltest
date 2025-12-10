import { state } from "../core/state.js";
import { FPS } from "../core/config.js";
import { ZombieHorde } from "../entities/ZombieHorde.js";
import { Gate } from "../entities/Gate.js";
import { WeaponItem } from "../entities/WeaponItem.js";
import { scheduleNextWeaponItem } from "../logic/schedulers.js";

export function spawnWeaponItem() {
    const type = Math.random() < 0.5 ? "shotgun" : "shuriken";
    state.weaponItems.push(new WeaponItem(type));
}

// 경고 UI는 기존 코드의 느낌 유지
function showBossWarning() {
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

export function spawnEnemies() {
    state.spawnTimer++;

    const spawnRate = 120; // 원본 유지

    if (state.spawnTimer <= spawnRate) {
        if (state.bossMode) {
            const bossExists = state.zombies.some(z => z.isBoss);
            if (!bossExists) state.bossMode = false;
        }
        return;
    }

    state.spawnTimer = 0;
    state.waveCount++;

    // 첫 스폰은 반드시 숫자벽
    if (!state.firstSpawnDone) {
        state.gates.push(new Gate());
        state.firstSpawnDone = true;
        return;
    }

    // 12 웨이브마다 보스
    if (!state.bossMode && state.waveCount % 12 === 0) {
        state.bossMode = true;
        state.zombies.push(new ZombieHorde(true));

        // 보스 등장 4초 후 스팀팩 1회 예약
        state.nextStimpackFrame = state.frameCount + 4 * FPS;
        state.firstBossEncountered = true;

        showBossWarning();
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

    // 보스 모드 종료 체크
    if (state.bossMode) {
        const bossExists = state.zombies.some(z => z.isBoss);
        if (!bossExists) state.bossMode = false;
    }
}

export function ensureWeaponItemSchedule() {
    if (state.frameCount >= state.nextWeaponItemFrame && state.weaponItems.length === 0) {
        spawnWeaponItem();
        state.nextWeaponItemFrame = scheduleNextWeaponItem(state.frameCount, FPS);
    }
}
