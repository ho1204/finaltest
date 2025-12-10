// input.js

export const input = {
    left: false,
    right: false
};

let touchStartX = 0;
let basePlayerX = 0;

export function initInput(canvas, getPlayer) {
    if (!canvas) throw new Error("initInput requires canvas");

    const onKeyDown = (e) => {
        if (e.key === "ArrowLeft") input.left = true;
        if (e.key === "ArrowRight") input.right = true;
    };

    const onKeyUp = (e) => {
        if (e.key === "ArrowLeft") input.left = false;
        if (e.key === "ArrowRight") input.right = false;
    };

    const onTouchStart = (e) => {
        e.preventDefault();
        const player = getPlayer?.();
        if (!player) return;

        touchStartX = e.touches[0].clientX;
        basePlayerX = player.x;
    };

    const onTouchMove = (e) => {
        e.preventDefault();
        const player = getPlayer?.();
        if (!player) return;

        const touchX = e.touches[0].clientX;
        const deltaX = touchX - touchStartX;
        player.targetX = basePlayerX + deltaX;
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });

    // 필요 시 해제용 반환
    return function cleanup() {
        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("keyup", onKeyUp);
        canvas.removeEventListener("touchstart", onTouchStart);
        canvas.removeEventListener("touchmove", onTouchMove);
    };
}
