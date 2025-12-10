// ZombieSquadRush/js/logic/balance.js

// 총알 1줄당 군인 20명(시각 탄막 기준)
export function computeBulletsPerVolleyForSquad(squadSize) {
    const squad = Math.max(1, Math.floor(squadSize));
    const visualBullets = Math.min(20, Math.floor((squad - 1) / 20) + 1);
    return visualBullets;
}

export function getBulletsPerVolley(player) {
    if (!player) return 1;

    let baseCount = computeBulletsPerVolleyForSquad(player.squadSize);

    if (player.weaponType === 'shotgun') {
        baseCount = Math.max(1, Math.round(baseCount * 1.3)); // 샷건 30% 증가
    }
    return baseCount;
}

// 스팀팩 + 무기 적용 연사력 계산
// FPS는 외부에서 주입
export function getCurrentShootIntervalForCalc(player, FPS) {
    if (!player) return FPS / 2;

    let interval = player.shootInterval;

    // 원본 코드 유지(샷건은 현재 1.0 배)
    if (player.weaponType === 'shotgun') interval *= 1.0;

    // 스팀팩 2배 연사
    if (player.isStimpackActive) interval /= 2;

    return interval;
}

export function getVolleysPerSecond(player, FPS) {
    return FPS / getCurrentShootIntervalForCalc(player, FPS);
}

export function getShotsPerSecond(player, FPS) {
    return getBulletsPerVolley(player) * getVolleysPerSecond(player, FPS);
}

// 좀비 기본 체력 산식
export function getBaseZombieHp(player, FPS) {
    const shotsPerSecond = getShotsPerSecond(player, FPS);
    // 1초당 발사 데미지의 50배 기준(난이도)
    return Math.max(10, Math.floor(shotsPerSecond * 50));
}
