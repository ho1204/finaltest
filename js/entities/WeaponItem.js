import { state } from "../core/state.js";
import { getCanvasSize } from "../core/canvas.js";
import { Particle } from "./Particle.js";
import { drawWeaponItemSprite } from "../render/spritesItems.js";

export class WeaponItem {
    constructor(type) {
        const { width } = getCanvasSize();

        this.type = type; // shotgun | shuriken

        this.width = 40;
        this.height = 40;
        this.x = Math.random() * (width - this.width * 2) + this.width;
        this.y = -50;
        this.speed = 3;

        this.markedForDeletion = false;
    }

    update() {
        const { height } = getCanvasSize();
        const player = state.player;

        this.y += this.speed;

        if (player) {
            const dist = Math.hypot(this.x - player.x, this.y - player.y);
            if (dist < 40) {
                player.setWeapon(this.type);
                this.markedForDeletion = true;

                for (let i = 0; i < 5; i++) state.particles.push(new Particle(this.x, this.y, "#f1c40f"));
            }
        }

        if (this.y > height + 50) {
            this.markedForDeletion = true;
        }
    }

    draw() {
        drawWeaponItemSprite(state.ctx ?? state.__ctxFallback, this.x, this.y, this.type);
    }
}
