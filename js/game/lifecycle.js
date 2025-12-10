import { state } from "../core/state.js";
import { FPS } from "../core/config.js";
import { Player } from "../entities/Player.js";
import { scheduleNextWeaponItem } from "../logic/schedulers.js";
import { animate } from "./loop.js";
import { bindHudElements, updateScoreUI, updateSquadUI, showBuffIndicator } from "./hud.js";

export function bindMenuElements({ menuScreen, startBtn, menuSubtitle, titleEl }) {
    state.menuScreen = menuScreen;
    state.startBtn = startBtn;
    state.menuSubtitle = menuSubtitle;
    state.titleEl = titleEl;

    startBtn.addEventListener("click", () => initGame());
}

export function initGame() {
    // 엔티티/배열 초기화
    state.player = new Player();

    state.bullets = [];
    state.zombies = [];
    state.gates = [];
    state.particles = [];
    state.floatingTexts = [];
    state.stimpacks = [];
    state.weaponItems = [];

    // 점수/웨이브/상태
    state.score = 0;
    state.waveCount = 1;
    state.distance = 0;
    state.spawnTimer = 0;
    state.frameCount = 0;
    state.gameState = "PLAYING";

    // 스폰 관련 플래그/카운터
    state.bossMode = false;
    state.nextStimpackFrame = Infinity;
    state.firstBossEncountered = false;
    state.nextWeaponItemFrame = 30 * FPS;
    state.firstSpawnDone = false;

    state.normalZombieKillCount = 0;
    state.normalZombieSpawnCount = 1;
    state.bulletGroupIdCounter = 0;
    state.bulletGroupGateHit = {};
    state.zombieSpawnedCount = 0;
    state.gateIdCounter = 0;

    // UI 초기화
    updateScoreUI();
    updateSquadUI();
    showBuffIndicator(false);

    if (state.menuScreen) state.menuScreen.classList.add("hidden");
    if (state.titleEl) state.titleEl.innerText = "ZOMBIE\nSQUAD";
    if (state.menuSubtitle) {
        state.menuSubtitle.innerHTML =
            "인류 최후의 방어선!<br>군인을 모아 좀비를 물리치세요.";
    }
    if (state.startBtn) state.startBtn.innerText = "작전 시작";

    animate();
}

export function gameOver() {
    state.gameState = "GAMEOVER";
    if (state.frameId) cancelAnimationFrame(state.frameId);

    if (state.menuScreen) state.menuScreen.classList.remove("hidden");
    if (state.titleEl) state.titleEl.innerText = "MISSION FAILED";

    const maxSquad = Math.floor(state.player?.squadSize ?? 1);

    if (state.menuSubtitle) {
        state.menuSubtitle.innerHTML =
            `최종 점수: <span style="color:#f1c40f">${state.score}</span><br>` +
            `최대 병력: ${maxSquad}`;
    }

    if (state.startBtn) state.startBtn.innerText = "다시 도전";
}

// main.js에서 한 번만 호출
export function bindHud({ scoreEl, squadEl, buffIndicator }) {
    bindHudElements({ score: scoreEl, squad: squadEl, buff: buffIndicator });
}
