import Game from "./game.js";
import Grid from "./grid.js";
import Bag from "./bag.js";
import Piece from "./piece.js";

export default class Save {

    constructor() {
        this.history = [];
        this.future = [];
    }

    save(game) {
        // This (game) object size is max ~3500 bytes.
        // Every 1000 drops is ~3.5MB which is ~5 minutes of gameplay at 3.33 pps (really fast)
        // Save around 5 minutes of gameplay history

        if (this.history.length > 1000) {
            this.history.shift();
        }

        this.history.push(this.cloneGame(game));

        // Clear future since new save sequence started
        this.future = [];
    }

    undo(game) {
        if (this.history.length === 0) {
            return;
        }
        this.future.push(this.cloneGame(game));
        this.restoreFromState(game, this.history.pop());
    }

    redo(game) {
        if (this.future.length === 0) {
            return;
        }
        this.history.push(this.cloneGame(game));
        this.restoreFromState(game, this.future.pop());
    }

    clear() {
        this.history = [];
    }

    cloneGame(game) {
        let clone = new Game();

        this.cloneProperties(clone, game);
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

        // Keep current startTime and timeElapsed

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
        clone.bag.holdPiece = game.bag.holdPiece ? new Piece(game.bag.holdPiece.type) : "";
        clone.bag.queue = [];
        for (let i = 0; i < game.bag.queue.length; i++) {
            clone.bag.queue.push(new Piece(game.bag.queue[i].type));
        }
    }

    restoreFromState(game, state) {
        // Note history is non existent
        // Only the current game has history - pass it down
        game.save = this;

        // Hard code to draw
        game.updatedGrid = true;
        game.updatedHold = true;
        game.updatedNext = true;

        // Properties
        game.bag = state.bag;
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

    }
}