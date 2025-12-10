import { state } from "../core/state.js";
import { Particle } from "../entities/Particle.js";
import { FloatingText } from "../entities/FloatingText.js";

export function createParticles(x, y, color) {
    for (let i = 0; i < 5; i++) {
        state.particles.push(new Particle(x, y, color));
    }
}

export function createFloatingText(text, x, y, color, fontSize = "24px", lifetime = 30) {
    state.floatingTexts.push(new FloatingText(text, x, y, color, fontSize, lifetime));
}
