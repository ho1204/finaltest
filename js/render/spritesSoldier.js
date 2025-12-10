// spritesSoldier.js

export function drawSoldierSprite(ctx, x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // 그림자
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(0, 6, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 몸통
    const bodyGradient = ctx.createLinearGradient(-8, -10, -8, 4);
    bodyGradient.addColorStop(0, "#5a6b4a");
    bodyGradient.addColorStop(0.5, "#4a5b3a");
    bodyGradient.addColorStop(1, "#3a4b2a");
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.roundRect(-9, -10, 18, 15, 3);
    ctx.fill();

    // 조끼
    ctx.fillStyle = "#2a3a2a";
    ctx.fillRect(-9, -2, 18, 5);

    // 조끼 패치
    ctx.fillStyle = "#1a2a1a";
    ctx.fillRect(-7, -10, 3, 12);
    ctx.fillRect(4, -10, 3, 12);

    // 버클/스트랩
    ctx.fillStyle = "#3a4a3a";
    ctx.fillRect(-1, -5, 2, 8);

    // 머리
    const skinGradient = ctx.createRadialGradient(0, -14, 0, 0, -14, 9);
    skinGradient.addColorStop(0, "#f4c2a1");
    skinGradient.addColorStop(1, "#d4a281");
    ctx.fillStyle = skinGradient;
    ctx.beginPath();
    ctx.arc(0, -14, 9, 0, Math.PI * 2);
    ctx.fill();

    // 헬멧
    const helmetGradient = ctx.createLinearGradient(0, -20, 0, -10);
    helmetGradient.addColorStop(0, "#6a7a6a");
    helmetGradient.addColorStop(0.5, "#5a6a5a");
    helmetGradient.addColorStop(1, "#4a5a4a");
    ctx.fillStyle = helmetGradient;
    ctx.beginPath();
    ctx.arc(0, -16, 10, Math.PI, 0);
    ctx.bezierCurveTo(10, -16, 10, -12, 0, -12);
    ctx.bezierCurveTo(-10, -12, -10, -16, -10, -16);
    ctx.fill();

    // 헬멧 네트 패턴
    ctx.strokeStyle = "rgba(30, 40, 30, 0.5)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-8, -14);
    ctx.lineTo(8, -14);
    ctx.moveTo(-6, -16);
    ctx.lineTo(6, -16);
    ctx.stroke();

    // 헬멧 정상부/밴드
    ctx.fillStyle = "#4a5a4a";
    ctx.fillRect(-2, -26, 4, 5);
    ctx.fillStyle = "#2a3a2a";
    ctx.fillRect(-8, -13, 16, 2);

    // 고글
    ctx.fillStyle = "rgba(20, 20, 30, 0.9)";
    ctx.beginPath();
    ctx.roundRect(-8, -17, 16, 7, 2);
    ctx.fill();

    const lensGradient = ctx.createLinearGradient(-6, -17, -6, -11);
    lensGradient.addColorStop(0, "rgba(50, 100, 150, 0.6)");
    lensGradient.addColorStop(0.5, "rgba(30, 80, 130, 0.8)");
    lensGradient.addColorStop(1, "rgba(20, 60, 110, 0.6)");
    ctx.fillStyle = lensGradient;
    ctx.fillRect(-6, -17, 5, 5);
    ctx.fillRect(1, -17, 5, 5);

    ctx.fillStyle = "rgba(150, 200, 255, 0.4)";
    ctx.fillRect(-5, -16, 3, 2);
    ctx.fillRect(2, -16, 3, 2);

    // 총
    ctx.save();
    ctx.translate(9, -2);

    const gunGradient = ctx.createLinearGradient(0, 0, 12, 0);
    gunGradient.addColorStop(0, "#2a2a2a");
    gunGradient.addColorStop(0.5, "#1a1a1a");
    gunGradient.addColorStop(1, "#0a0a0a");
    ctx.fillStyle = gunGradient;
    ctx.beginPath();
    ctx.roundRect(0, -2.5, 14, 5, 1);
    ctx.fill();

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, -1.5, 12, 3);

    ctx.fillStyle = "#3a3a3a";
    ctx.fillRect(0, 1.5, 3, 5);

    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(12, -1, 2, 2);

    ctx.fillStyle = "#4a4a4a";
    ctx.fillRect(6, -3, 1, 2);

    ctx.restore();
    ctx.restore();
}
