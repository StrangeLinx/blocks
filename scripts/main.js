import Game from "./game.js";
import Display from "./display.js";
import Controls from "./controls.js";
import Menu from "./menu.js";


function main() {
    update();
    draw();
    window.requestAnimationFrame(main);
}

function update() {
    if (game.getUpdatedGameOver()) {
        display.pause(game.getTimeElapsed());
        menu.showResults(game.getResults());
        game.setUpdatedGameOver(false);
    }

    if (game.getShowLookaheadReadyMenu()) {
        display.pause(game.getTimeElapsed());
        menu.showLookaheadReadyMenu();
        game.setShowLookaheadReadyMenu(false);
    }

    if (game.getUpdatedPause()) {
        display.pause(game.getTimeElapsed());
        menu.showMain();
        game.setUpdatedPause(false);
    }

    if (display.getShowEditQueueMenu()) {
        game.pause();
        menu.showEditQueue();
        display.setShowEditQueueMenu(false);
    }

    if (game.getStartTimer()) {
        display.updateStartTime(game.getStartTime());  // Synchronize time
        display.startStats();
        game.setStartTimer(false);
    }

}

function draw() {
    display.setBlind(game.blind());
    if (game.getUpdatedGrid()) {
        display.drawGrid(game.getGrid(), game.getCurrentPiece(), game.getDropPreview());
        game.setUpdatedGrid(false);
    }

    if (game.getUpdatedHold()) {
        display.drawHold(game.getHoldPiece());
        game.setUpdatedHold(false);
    }

    if (game.getUpdatedNext()) {
        display.drawNext(game.getNextPieces());
        game.setUpdatedNext(false);

        // When queue is updated, a piece was placed. Update stats
        display.setStats(game.getLinesCleared(), game.getB2B(), game.getCombo(), game.getPiecesPlaced(), game.getAttack());
    }

    

    if (game.getStartCountdown()) {
        display.drawCountdown(game.getResetTimer());
        game.setStartCountdown(false);
    }
}

const game = new Game();
const controls = new Controls(game);
const display = new Display(game);
const menu = new Menu(game, controls);

document.addEventListener("keydown", ev => {
    if (menu.active()) {
        menu.press(ev.key);
    } else {
        controls.press(ev.key);
    }
});

document.addEventListener("keyup", ev => {
    controls.release(ev.key);
});

window.requestAnimationFrame(main);