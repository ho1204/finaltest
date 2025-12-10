// spritesZombie.js

export function drawZombieSprite(ctx, x, y, scale = 1, isBoss = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // 그림자
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.ellipse(0, 9, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 몸통
    const bodyColor = isBoss ? "#6a4a4a" : "#6d7d8e";
    const bodyGradient = ctx.createLinearGradient(-10, -15, -10, 10);
    bodyGradient.addColorStop(0, bodyColor);
    bodyGradient.addColorStop(0.5, isBoss ? "#5a3a3a" : "#5d6d7e");
    bodyGradient.addColorStop(1, isBoss ? "#4a2a2a" : "#4d5d6e");
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.roundRect(-11, -15, 22, 26, 4);
    ctx.fill();

    // 옷
    ctx.fillStyle = "#2c3e50";
    ctx.beginPath();
    ctx.moveTo(-11, 5);
    ctx.lineTo(-6, -5);
    ctx.lineTo(-2, 3);
    ctx.lineTo(2, -3);
    ctx.lineTo(6, 5);
    ctx.lineTo(11, 5);
    ctx.lineTo(11, 10);
    ctx.lineTo(-11, 10);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#1a2a3a";
    ctx.beginPath();
    ctx.arc(-3, 2, 2, 0, Math.PI * 2);
    ctx.arc(4, 1, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 머리
    const headColor = isBoss ? "#7a5a5a" : "#8a9a9a";
    const headGradient = ctx.createRadialGradient(0, -20, 0, 0, -20, 12);
    headGradient.addColorStop(0, headColor);
    headGradient.addColorStop(0.7, isBoss ? "#6a4a4a" : "#7a8a8a");
    headGradient.addColorStop(1, isBoss ? "#5a3a3a" : "#6a7a7a");
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.arc(0, -20, 12, 0, Math.PI * 2);
    ctx.fill();

    // 눈
    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.arc(-4, -20, isBoss ? 3.5 : 2.5, 0, Math.PI * 2);
    ctx.arc(4, -20, isBoss ? 3.5 : 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 100, 100, 0.8)";
    ctx.beginPath();
    ctx.arc(-3.5, -20.5, 1, 0, Math.PI * 2);
    ctx.arc(4.5, -20.5, 1, 0, Math.PI * 2);
    ctx.fill();

    // 상처
    ctx.strokeStyle = "#8b0000";
    ctx.fillStyle = "#6b0000";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-4, -16);
    ctx.lineTo(4, -16);
    ctx.lineTo(3, -14);
    ctx.lineTo(-3, -14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-5, -18);
    ctx.lineTo(-3, -18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(3, -18);
    ctx.lineTo(5, -18);
    ctx.stroke();

    ctx.strokeStyle = "rgba(100, 50, 50, 0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-3, -22);
    ctx.lineTo(3, -22);
    ctx.moveTo(-2, -15);
    ctx.lineTo(2, -15);
    ctx.stroke();

    // 팔
    const armColor = isBoss ? "#7a5a5a" : "#8a9a9a";
    ctx.fillStyle = armColor;
    ctx.beginPath();
    ctx.roundRect(-15, -12, 5, 13, 2);
    ctx.roundRect(10, -12, 5, 13, 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(100, 80, 80, 0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-12, -10);
    ctx.lineTo(-12, 0);
    ctx.moveTo(12, -10);
    ctx.lineTo(12, 0);
    ctx.stroke();

    ctx.restore();
}
