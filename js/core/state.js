// state.js
import { FPS } from "./config.js";

export const state = {
    // render context
    ctx: null,

    // lifecycle
    gameState: "MENU", // MENU | PLAYING | GAMEOVER
    frameId: null,
    frameCount: 0,

    // score/flow
    score: 0,
    distance: 0,
    waveCount: 0,

    // entities
    player: null,
    bullets: [],
    zombies: [],
    gates: [],
    particles: [],
    floatingTexts: [],
    stimpacks: [],
    weaponItems: [],

    // spawn/flags
    spawnTimer: 0,
    bossMode: false,
    nextStimpackFrame: Infinity,
    firstBossEncountered: false,
    nextWeaponItemFrame: 0,
    firstSpawnDone: false,

    // difficulty counters
    normalZombieKillCount: 0,
    normalZombieSpawnCount: 1,

    // ids and hit tracking
    bulletGroupIdCounter: 0,
    bulletGroupGateHit: {},
    zombieSpawnedCount: 0,
    gateIdCounter: 0,

    // external handler (UI 레벨에서 주입)
    onGameOver: null
};

// ctx 주입
export function initState(ctx) {
    state.ctx = ctx;
}

// gameOver 콜백 연결 (저장만 함)
export function setGameOverHandler(fn) {
    state.onGameOver = typeof fn === "function" ? fn : null;
}

// 한 판 시작용 초기화
export function resetPlayState() {
    state.gameState = "PLAYING";
    state.frameId = null;
    state.frameCount = 0;

    state.score = 0;
    state.distance = 0;
    state.waveCount = 1;

    state.player = null;

    state.bullets = [];
    state.zombies = [];
    state.gates = [];
    state.particles = [];
    state.floatingTexts = [];
    state.stimpacks = [];
    state.weaponItems = [];

    state.spawnTimer = 0;
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
}

// 게임 오버 트리거(엔티티에서 호출 가능)
export function triggerGameOver() {
    if (state.gameState === "GAMEOVER") return;

    // 상태를 먼저 확정
    state.gameState = "GAMEOVER";

    // UI 핸들러가 있으면 호출
    if (state.onGameOver) {
        try {
            state.onGameOver();
        } catch (e) {
            // UI 쪽 에러가 나도 상태는 GAMEOVER 유지
            console.error("onGameOver handler error:", e);
        }
    }
}
