// spritesItems.js

export function drawStimpackSprite(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // 후광
    ctx.shadowColor = "#00ff88";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 본체
    const kitGradient = ctx.createLinearGradient(-15, -15, -15, 15);
    kitGradient.addColorStop(0, "#f5f5f5");
    kitGradient.addColorStop(0.5, "#e8e8e8");
    kitGradient.addColorStop(1, "#d0d0d0");
    ctx.fillStyle = kitGradient;
    ctx.beginPath();
    ctx.roundRect(-16, -16, 32, 32, 4);
    ctx.fill();

    ctx.shadowBlur = 0;

    // 의료 십자
    ctx.fillStyle = "#ff3333";
    ctx.fillRect(-3, -12, 6, 24);
    ctx.fillRect(-12, -3, 24, 6);

    // 테두리
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 2;
    ctx.strokeRect(-16, -16, 32, 32);

    // 클립
    ctx.fillStyle = "#666666";
    ctx.fillRect(-8, -18, 16, 3);
    ctx.fillRect(-8, 15, 16, 3);

    // 하이라이트
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fillRect(-14, -14, 28, 8);

    ctx.restore();
}

export function drawWeaponItemSprite(ctx, x, y, type) {
    ctx.save();
    ctx.translate(x, y);

    ctx.shadowColor = type === "shotgun" ? "#ff8800" : "#ffdd00";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 상자
    const boxGradient = ctx.createLinearGradient(-18, -18, -18, 18);
    boxGradient.addColorStop(0, "#4a4a4a");
    boxGradient.addColorStop(0.3, "#3a3a3a");
    boxGradient.addColorStop(0.7, "#2a2a2a");
    boxGradient.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = boxGradient;
    ctx.beginPath();
    ctx.roundRect(-19, -19, 38, 38, 5);
    ctx.fill();

    ctx.shadowBlur = 0;

    // 테두리
    const borderGradient = ctx.createLinearGradient(-18, -18, 18, 18);
    borderGradient.addColorStop(0, "#888888");
    borderGradient.addColorStop(0.5, "#555555");
    borderGradient.addColorStop(1, "#333333");
    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 3;
    ctx.strokeRect(-18, -18, 36, 36);

    // 내부 테두리
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1;
    ctx.strokeRect(-15, -15, 30, 30);

    // 하이라이트
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillRect(-17, -17, 34, 12);

    // 라벨
    ctx.fillStyle = type === "shotgun" ? "#ff8800" : "#ffdd00";
    ctx.font = "bold 12px 'Rajdhani'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 4;

    const label = type === "shotgun" ? "샷건" : "표창";
    ctx.fillText(label, 0, 0);

    ctx.shadowBlur = 0;

    ctx.restore();
}
