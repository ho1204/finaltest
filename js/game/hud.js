import { state } from "../core/state.js";

let scoreEl = null;
let squadEl = null;
let buffIndicator = null;

export function bindHudElements({ score, squad, buff }) {
    scoreEl = score;
    squadEl = squad;
    buffIndicator = buff;
}

export function updateScoreUI() {
    if (scoreEl) scoreEl.innerText = state.score;
}

export function updateSquadUI() {
    if (squadEl) squadEl.innerText = Math.floor(state.player?.squadSize ?? 1);
}

export function showBuffIndicator(show) {
    if (!buffIndicator) return;
    buffIndicator.style.display = show ? "block" : "none";
}

export function addSquad(amount) {
    if (!state.player) return;

    state.player.squadSize += amount;

    updateSquadUI();

    if (!squadEl) return;

    squadEl.style.transform = "scale(1.5)";
    squadEl.style.color = "#00ff88";
    squadEl.style.textShadow = "0 0 15px rgba(0, 255, 136, 0.8)";

    setTimeout(() => {
        squadEl.style.transform = "scale(1)";
        squadEl.style.color = "#00d4ff";
        squadEl.style.textShadow = "0 0 6px rgba(0, 212, 255, 0.6)";
    }, 200);
}
