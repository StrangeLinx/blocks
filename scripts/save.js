import Game from "./game.js";
import Mode from "./mode.js";
import Grid from "./grid.js";
import Bag from "./bag.js";

export default class Save {

    constructor() {
        this.history = [];
        this.future = [];
    }

    save(game) {
        // This (game) object size is max ~3500 bytes.
        // Every 5000 moves is less than 17.5MB which is ~5 minutes of efficient game play at 3.33 pps (really fast)
        // Save around 5 minutes of (fast) game play history

        if (this.history.length > 5000) {
            this.history.shift();
        }

        this.history.push(this.cloneGame(game));

        // Clear future since new save sequence started
        this.future = [];
    }

    undo(game) {
        do {
            // If nothing to check you're done
            if (this.history.length === 0) {
                break;
            }
            // Undo
            this.future.push(this.cloneGame(game));
            this.restoreFromState(game, this.history.pop());

            // If user preference is to undo on drop,
            // keep undoing until they're last move is drop
        } while (game.undoOnDrop && game.lastMove !== "drop");
    }

    redo(game) {
        do {
            if (this.future.length === 0) {
                break;
            }
            this.history.push(this.cloneGame(game));
            this.restoreFromState(game, this.future.pop());
        } while (game.undoOnDrop && game.lastMove !== "drop");
    }

    clear() {
        this.history = [];
        this.future = [];
    }

    cloneGame(game) {
        let clone = new Game();

        this.cloneProperties(clone, game);
        this.cloneMode(clone, game);
        this.cloneGrid(clone, game);
        this.cloneBag(clone, game);

        return clone;
    }

    cloneProperties(clone, game) {
        clone.linesCleared = game.linesCleared;
        clone.tSpin = game.tSpin;
        clone.miniTSpin = game.miniTSpin;
        clone.b2b = game.b2b;
        clone.maxB2B = game.maxB2B;
        clone.combo = game.combo;
        clone.maxCombo = game.maxCombo;
        clone.piecesPlaced = game.piecesPlaced;
        clone.totalAttack = game.totalAttack;
        clone.restartOnModeChange = game.restartOnModeChange;
        clone.lastMove = game.lastMove;

        // Keep current startTime, timeElapsed, undoOnDrop preference

    }

    cloneMode(clone, game) {
        clone.mode = new Mode();
        clone.mode.menuPause = game.mode.menuPause;
        clone.mode.type = game.mode.type;
        clone.mode.win = game.mode.win;
        clone.mode.piecesPlaced = game.mode.piecesPlaced;
        clone.mode.linesCleared = game.mode.linesCleared;
        clone.mode.previousPiecesPlaced = game.mode.previousPiecesPlaced;

        // Hard code for user input
        if (game.mode.type === "lookahead") {
            clone.mode.blind = false;
            clone.mode.shouldPause = true;
            clone.mode.showLookaheadReadyMenu = true;
        }
    }

    cloneGrid(clone, game) {
        clone.grid = new Grid();
        for (let i = 0; i < clone.grid.grid.length; i++) {
            clone.grid.grid[i] = [...game.grid.grid[i]];
        }
    }

    cloneBag(clone, game) {
        clone.bag = new Bag();
        clone.bag.held = game.bag.held;
        clone.bag.holdPiece = clone.bag.clonePiece(game.bag.holdPiece);
        clone.bag.queue = [];
        for (let i = 0; i < game.bag.queue.length; i++) {
            let clonedPiece = clone.bag.clonePiece(game.bag.queue[i]);
            clone.bag.queue.push(clonedPiece);
        }
        clone.bag.queueSize = game.bag.queueSize;
    }

    restoreFromState(game, state) {
        // Note history is non existent
        // Only the current game has history - pass it down
        game.save = this;

        // Hard code to draw
        game.updatedGrid = true;
        game.updatedHold = true;
        game.updatedNext = true;

        // Maintain current number of lookahead pieces
        let temp = game.mode.numLookaheadPieces;
        game.mode = state.mode;
        game.mode.numLookaheadPieces = temp;

        // Properties
        let currentQueueSize = game.bag.queueSize;
        game.bag = state.bag;
        game.bag.updateQueueSize(currentQueueSize);
        game.grid = state.grid;

        game.linesCleared = state.linesCleared;
        game.tSpin = state.tSpin;
        game.miniTSpin = state.miniTSpin;
        game.b2b = state.b2b;
        game.maxB2B = state.maxB2B;
        game.combo = state.combo;
        game.maxCombo = state.maxCombo;
        game.piecesPlaced = state.piecesPlaced;
        game.totalAttack = state.totalAttack;
        game.restartOnModeChange = state.restartOnModeChange;
        game.lastMove = state.lastMove;

    }
}