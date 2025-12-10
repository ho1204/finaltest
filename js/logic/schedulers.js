// ZombieSquadRush/js/logic/schedulers.js

// 스팀팩 다음 스폰 프레임 계산
// (현재 프레임 + 3초 대기 + 6~18초 랜덤)
export function scheduleNextStimpack(frameCount, FPS) {
    const minWait = 3 * FPS;
    const randomWait = (Math.random() * 12 + 6) * FPS; // 6~18초
    return frameCount + minWait + randomWait;
}

// 무기 아이템 다음 스폰 프레임 계산 (30초 간격)
export function scheduleNextWeaponItem(frameCount, FPS) {
    return frameCount + 30 * FPS;
}
