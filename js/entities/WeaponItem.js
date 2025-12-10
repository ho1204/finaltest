// js/logic/weapons.js

import { FPS } from "../core/config.js";

/**
 * "한 파일에서만 무기 추가/수정"
 * - 탄 수 계산
 * - 데미지 배율
 * - 연사 배율
 * - 탄 색상
 * - 발사 패턴(탄 생성)
 * 을 모두 여기서 관리
 */

/** 기존 룰 기반: 스쿼드 규모에 따라 시각적 탄 수 */
function computeBaseVolleyCountFromSquad(squadSize) {
    const squad = Math.max(1, Math.floor(squadSize));
    const visualBullets = Math.min(20, Math.floor((squad - 1) / 20) + 1);
    return visualBullets;
}

/** 기본 탄 색상 룰 */
function defaultBulletColorBySquad(squadSize) {
    if (squadSize > 300) return "#c0392b";
    if (squadSize > 200) return "#e74c3c";
    if (squadSize > 100) return "#d35400";
    return "#f39c12";
}

/**
 * 무기 정의 객체 규격
 * {
 *   key,
 *   label,
 *   intervalMul,              // 1.0 = 기본
 *   volleyCount(player),      // 이번 발사에서 생성할 탄 개수
 *   damagePerBullet(player, volleyCount),
 *   bulletColor(player),
 *   fire({ player, Bullet, groupId }) => Bullet[]
 * }
 */

export const WEAPONS = {
    default: {
        key: "default",
        label: "기본",

        intervalMul: 1.0,

        volleyCount(player) {
            return computeBaseVolleyCountFromSquad(player.squadSize);
        },

        damagePerBullet(player, volleyCount) {
            const effectiveSquad = Math.max(1, player.squadSize);
            return Math.max(1, effectiveSquad / Math.max(1, volleyCount));
        },

        bulletColor(player) {
            return defaultBulletColorBySquad(player.squadSize);
        },

        fire({ player, Bullet, groupId }) {
            const count = this.volleyCount(player);
            const color = this.bulletColor(player);
            const dmg = this.damagePerBullet(player, count);

            const bullets = [];

            // 기존 기본 패턴: 3발 이상이면 원형 클러스터, 1~2발은 가로 퍼짐
            if (count >= 3) {
                const clusterRadius = 10;
                for (let i = 0; i < count; i++) {
                    const angle = (Math.PI * 2 / count) * i;
                    const bx = player.x + Math.cos(angle) * clusterRadius;
                    const by = player.y - 20 + Math.sin(angle) * clusterRadius;
                    bullets.push(new Bullet(bx, by, dmg, groupId, color, "default", 0, -15));
                }
            } else {
                for (let i = 0; i < count; i++) {
                    const spread = (i - (count - 1) / 2) * 8;
                    bullets.push(new Bullet(player.x + spread, player.y - 20, dmg, groupId, color, "default", 0, -15));
                }
            }

            return bullets;
        }
    },

    shotgun: {
        key: "shotgun",
        label: "샷건",

        intervalMul: 1.0, // 필요하면 여기만 바꾸면 됨

        volleyCount(player) {
            const base = computeBaseVolleyCountFromSquad(player.squadSize);
            return Math.max(1, Math.round(base * 1.3));
        },

        damagePerBullet(player, volleyCount) {
            const effectiveSquad = Math.max(1, player.squadSize);
            return Math.max(1, effectiveSquad / Math.max(1, volleyCount));
        },

        bulletColor(player) {
            return defaultBulletColorBySquad(player.squadSize);
        },

        fire({ player, Bullet, groupId }) {
            const count = this.volleyCount(player);
            const color = this.bulletColor(player);
            const dmg = this.damagePerBullet(player, count);

            const bullets = [];

            // 전방 20도 부채꼴
            const spreadDeg = 20;
            const spreadRad = spreadDeg * Math.PI / 180;
            const startAngle = -Math.PI / 2 - spreadRad / 2;
            const step = count > 1 ? spreadRad / (count - 1) : 0;

            const speed = 15;

            for (let i = 0; i < count; i++) {
                const angle = startAngle + step * i;
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;
                bullets.push(new Bullet(player.x, player.y - 20, dmg, groupId, color, "shotgun", vx, vy));
            }

            return bullets;
        }
    },

    shuriken: {
        key: "shuriken",
        label: "표창",

        intervalMul: 1.0,

        volleyCount(player) {
            // 표창은 기본 탄 수를 그대로 사용
            return computeBaseVolleyCountFromSquad(player.squadSize);
        },

        damagePerBullet(player, volleyCount) {
            const effectiveSquad = Math.max(1, player.squadSize);
            // 표창 기본 데미지 30% 감소
            return Math.max(1, (effectiveSquad / Math.max(1, volleyCount)) * 0.7);
        },

        bulletColor() {
            return "#f1c40f";
        },

        fire({ player, Bullet, groupId }) {
            const count = this.volleyCount(player);
            const color = this.bulletColor(player);
            const dmg = this.damagePerBullet(player, count);

            const bullets = [];
            const speed = 15;
            const vy = -speed;

            // 기존 표창 패턴: 3발 이상이면 원형 클러스터로 생성
            if (count >= 3) {
                const clusterRadius = 10;
                for (let i = 0; i < count; i++) {
                    const angle = (Math.PI * 2 / count) * i;
                    const bx = player.x + Math.cos(angle) * clusterRadius;
                    const by = player.y - 20 + Math.sin(angle) * clusterRadius;
                    bullets.push(new Bullet(bx, by, dmg, groupId, color, "shuriken", 0, vy));
                }
            } else {
                for (let i = 0; i < count; i++) {
                    const spread = (i - (count - 1) / 2) * 8;
                    bullets.push(new Bullet(player.x + spread, player.y - 20, dmg, groupId, color, "shuriken", 0, vy));
                }
            }

            return bullets;
        }
    }
};

/** 안전한 조회 */
export function getWeaponDef(type) {
    return WEAPONS[type] ?? WEAPONS.default;
}

/** (선택) 무기 아이템 스폰 등에서 사용 가능 */
export function getWeaponKeys() {
    return Object.keys(WEAPONS);
}

/** (선택) 기본 발사 간격(초 단위 의미 유지용) */
export function getBaseShootIntervalFrames() {
    return FPS / 2; // 0.5초
}
