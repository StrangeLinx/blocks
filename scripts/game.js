import Grid from "./grid.js";
import Bag from "./bag.js";
import Kick from "./kick.js";
import Attack from "./attack.js";
import Save from "./save.js";

export default class Game {

    constructor() {
        this.kick = new Kick();      // kick tables
        this.attack = new Attack();  // attack table
        this.save = new Save();

        this.new();

        // Default game mode is free play
        this.gameMode = "free";

        this.countdownTimeout;
        this.startCountdown = false;
        this.countingDown = false;

    }

    new() {
        this.grid = new Grid();
        this.bag = new Bag();

        this.updatedGrid = true;
        this.updatedHold = true;
        this.updatedNext = true;

        this.linesCleared = 0;
        this.tSpin = false;
        this.miniTSpin = false;
        this.b2b = -1;
        this.maxB2B = 0;
        this.combo = -1;
        this.maxCombo = 0;
        this.piecesPlaced = 0;
        this.totalAttack = 0;

        this.updatedPause = false;
        this.updatedGameOver = false;
        this.over = false;

        this.startTime = "";
        this.restartTimer = true;
        this.timeElapsed = 0;

    }

    update(move) {
        if (this.sandboxMove(move)) {
            return;
        }
        if (move.type === "restart") {
            this.restart(true);
            return;
        }
        else if (move.type === "pause") {
            this.pause();
        }
        // don't allow game play during 2 second count down or while paused
        else if (this.countingDown || this.paused) {
            return;
        }
        else if (move.type === "shift") {
            this.shift(move.x, move.y);
        }
        else if (move.type === "shiftFloor") { // Infinite soft drop
            this.shiftFloor();
        }
        else if (move.type === "leftWall") {
            this.leftWall();
        }
        else if (move.type === "rightWall") {
            this.rightWall();
        }
        else if (move.type === "drop") { // hard drop
            this.drop();
        }
        else if (move.type === "rot") {
            this.rotate(move.r);
        }
        else if (move.type === "hold") {
            this.hold();
        }
        else if (move.type === "undo") {
            this.undo();
        }
        else if (move.type === "redo") {
            this.redo();
        }
    }

    sandbox() {
        return this.gameMode === "free" || this.gameMode === "b2b";
    }

    sandboxMove(move) {
        // Validation for sandbox mode is performed in call origin
        if (move.type === "fillSquare") {
            this.fillSquare(move.pieceType, move.x, move.y);
            return true;
        }
        if (move.type === "editHold") {
            this.updateHold(move.piece);
            return true;
        }
        if (move.type === "editNext") {
            this.updateNext(move.pieces);
            return true;
        }

        return false;
    }

    play(mode) {
        this.updateMode(mode);

        this.paused = false;

        if (this.gameMode === "sprint") {
            clearTimeout(this.countdownTimeout);
            this.countdown();
        } else {
            this.updateStartTime();
        }
    }

    updateMode(mode) {
        // Changing game modes
        if (mode && this.gameMode !== mode) {
            this.new();
            this.gameMode = mode;
            this.save.clear();
        }

        // Same mode and game over then restart
        else if (this.over) {
            this.new();
        }
    }

    pause() {
        if (this.paused) {
            return;
        }

        // Stop countdown
        clearTimeout(this.countdownTimeout);

        this.paused = true;
        this.updatedPause = true;

        // Track game play time
        if (this.startTime) { // populated when previously paused
            this.timeElapsed = Date.now() - this.startTime;
        } else {
            this.timeElapsed = 0;
        }
    }

    restart(save = false) {
        if (save) {
            this.saveState();
        }
        this.new();
        this.play();
    }

    countdown() {
        this.startCountdown = true;  // state variable for display.js
        this.countingDown = true;    // state variable for game.js

        this.countdownTimeout = setTimeout(() => {
            this.countingDown = false;
            this.updateStartTime();
        }, 2000);
    }

    updateStartTime() {
        this.startTime = Date.now() - this.timeElapsed;
        this.displayStartTimer = true;
    }

    shift(x, y) {
        // Shift piece
        const shiftedPiece = this.bag.cloneCurrentPiece();
        shiftedPiece.shift(x, y);

        // Check it's a valid move
        if (this.grid.valid(shiftedPiece)) {
            // Replace current piece with shifted piece
            this.bag.setCurrentPiece(shiftedPiece);
            this.setUpdatedGrid(true);

            // T spin status is reset after a shift
            this.tSpin = false;
            this.miniTSpin = false;
        }
    }

    shiftFloor() {
        // Check if piece is shifted to the floor
        if (this.calculateDrop(this.bag.getCurrentPiece())) {

            // update status only if shifted
            this.setUpdatedGrid(true);
            this.tSpin = false;
            this.miniTSpin = false;
        };
    }

    leftWall() {
        // calculate wall (x = -1 is leftward) returns true if piece is was shifted left
        if (this.calculateWall(this.bag.getCurrentPiece(), -1)) {

            // update if shifted
            this.setUpdatedGrid(true);
            this.tSpin = false;
            this.miniTSpin = false;
        };
    }

    rightWall() {
        if (this.calculateWall(this.bag.getCurrentPiece(), 1)) {
            this.setUpdatedGrid(true);
            this.tSpin = false;
            this.miniTSpin = false;
        };
    }

    calculateWall(piece, x) {
        let shifted = false;

        // Shift piece until a wall (or another piece) is hit
        while (this.grid.validXShift(piece, x)) {
            piece.shift(x, 0);
            shifted = true;
        }

        return shifted;
    }

    drop() {
        this.saveState();

        const piece = this.bag.place();

        // Move piece down then place
        this.calculateDrop(piece);
        this.grid.place(piece);
        this.piecesPlaced++;

        // Clear rows that are filled
        let lineClears = this.grid.clearLines();
        this.linesCleared += lineClears;

        // Stats
        this.updateCombo(lineClears);
        this.updateB2B(lineClears);
        this.updateAttack(lineClears);

        this.setUpdatedGrid(true);
        this.setUpdatedNext(true);

        // Player can win or lose after a piece is dropped
        this.checkGameOver();
    }

    updateCombo(lineClears) {
        // Combo are consecutive line clears
        // Broken when a piece is placed and no row cleared
        if (lineClears === 0) {
            this.combo = -1;
        } else {
            this.combo++;
        }
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
    }

    updateB2B(lineClears) {
        // Back to back are how many consecutive "hard" clears are performed
        // No change if no line clears
        if (lineClears === 0) {
            return;
        }
        if (lineClears === 4 || this.tSpin || this.miniTSpin) {
            this.b2b++;
        } else {
            // Broken when a line clear is not a quad, tspin, or a mini t spin
            this.b2b = -1;
        }
        if (this.b2b > this.maxB2B) {
            this.maxB2B = this.b2b;
        }
    }

    updateAttack(lineClears) {
        // No change on attack when there are no line clears
        if (lineClears === 0) {
            return;
        }

        // Attack is based on the parameters passed
        let attack = this.attack.calc(lineClears, this.getCombo(), this.getB2B(), this.tSpin, this.miniTSpin, this.grid.checkPerfectClear());

        // In free play mode, player can do illegitimate clears (by manually filling cells) that are not seen in the attack table
        // Validate attack
        if (isFinite(attack)) {
            this.totalAttack += attack;
        }
    }

    calculateDrop(piece) {
        let shifted = false;

        // Shift piece down while legal
        while (this.grid.validYShift(piece, -1)) {
            piece.shift(0, -1);
            shifted = true;
        }

        return shifted;
    }

    rotate(r) {
        const rotatedPiece = this.bag.cloneCurrentPiece();

        // O piece only has 1 rotation
        if (rotatedPiece.type === "o") {
            return;
        }

        // Check if current rotation is valid
        rotatedPiece.rotate(r);
        if (this.grid.valid(rotatedPiece)) {
            this.bag.setCurrentPiece(rotatedPiece);
            this.updatedGrid = true;

            // T spins can be performed after a rotate
            this.checkTSpin(rotatedPiece, rotatedPiece.getRotate());
            return;
        }

        // If current rotation is not valid try "kicks" from the corresponding kick table
        let currentRotation = this.bag.getCurrentPiece().getRotate();
        let newRotation = rotatedPiece.getRotate();
        const table = this.kick.table(rotatedPiece.type, currentRotation, newRotation);

        let i = 0;
        while (i < table.length) {
            // Kick
            const kickedPiece = this.bag.clonePiece(rotatedPiece);
            kickedPiece.shift(table[i][0], table[i][1]);

            // Check if it's a valid kick
            if (this.grid.valid(kickedPiece)) {
                this.bag.setCurrentPiece(kickedPiece);
                this.updatedGrid = true;
                this.checkTSpin(kickedPiece, newRotation, currentRotation, i + 1);
                return;
            }

            i++; // try next kick
        }
    }

    checkTSpin(piece, nRot, cRot, kick) {

        // 
        // Condition for t spin (1 & 2 & ((3 & 4) or 5))
        // 1. Piece is a t
        // 2. (Satisfied from caller) Last move type is rotation
        // 3. At least 3 of the 4 corners are occupied (from the 3x3 subgrid of piece span)
        // 4. The t faces 2 of the occupied corners
        // 5. The t performed a TST or FIN kick:
        //    (new rotation, current rotation, kick) = (1 0 4), (3 0 4), (1 2 4), or (3 2 4)
        // 
        // Condition for mini t spin (1 & 2 & 3 & not (4 or 5))
        //
        // A mini t spin is not a t spin here - they are 2 different maneuvers
        //

        // Condition 1
        if (piece.type !== "t") {
            return;
        }

        // Condition 5
        if ((kick === 4) &&
            ((nRot === 1 && cRot === 0) ||
                (nRot === 3 && cRot === 0) ||
                (nRot === 1 && cRot === 2) ||
                (nRot === 3 && cRot === 2))) {
            this.tSpin = true;
            return;
        }

        // Condition 3
        // 3*3 possible subgrids from t piece where x represent the corners:
        //    x t x   x t x   x - x   x t x
        //    t t t   - t t   t t t   t t -
        //    x - x   x t x   x t x   x t x
        let topLeft = this.wallOrOccupied(piece.x - 1, piece.y + 1);
        let topRight = this.wallOrOccupied(piece.x + 1, piece.y + 1);
        let botLeft = this.wallOrOccupied(piece.x - 1, piece.y - 1);
        let botRight = this.wallOrOccupied(piece.x + 1, piece.y - 1);
        let count = topLeft + topRight + botLeft + botRight;

        if (count < 3) {
            return;
        }

        // Condition 4
        if (count === 4) {
            this.tSpin = true;
            return;
        }
        if (nRot === 0 && topLeft && topRight) {
            this.tSpin = true;
        } else if (nRot === 1 && topRight && botRight) {
            this.tSpin = true;
        } else if (nRot === 2 && botRight && botLeft) {
            this.tSpin = true;
        } else if (nRot === 3 && botLeft && topLeft) {
            this.tSpin = true;
        } else {
            this.miniTSpin = true;
        }

    }

    wallOrOccupied(x, y) {
        // If outside walls of the grid (out of bounds)
        if (!this.grid.validX(x)) {
            return 1;
        }

        // Check floor and ceiling as well
        if (!this.grid.validY(y)) {
            return 1;
        }

        // Otherwise (x, y) in grid bounds and must be occupied
        if (!this.grid.free(x, y)) {
            return 1;
        }

        // Given (x, y) is free - not a wall nor occupied.
        return 0;
    }

    hold() {
        let [updatedHold, updatedNext] = this.bag.hold();

        // updateHold is false when player tried holding twice in a row
        if (updatedHold) {
            this.setUpdatedGrid(updatedHold);
            this.setUpdatedHold(updatedHold);
            this.setUpdatedNext(updatedNext);
            this.tSpin = false;
            this.miniTSpin = false;
        }

        // If a player is dangerously high on the board,
        // a piece may spawn on top of another which causes a loss
        this.checkGameOver();
    }

    checkGameOver() {
        // Win if cleared 40 lines in sprint mode
        if (this.gameMode === "sprint" && this.linesCleared >= 40) {
            this.gameOver();
            return;
        }

        // Lose if topped out
        const piece = this.bag.getCurrentPiece();
        if (!this.grid.valid(piece)) {
            this.gameOver();
        }
    }

    gameOver() {
        this.pause();
        this.over = true;
        this.updatedGameOver = true;
    }

    saveState() {
        // Only in sandbox mode
        if (!this.sandbox()) {
            return;
        }

        this.save.save(this);
    }

    undo() {
        if (!this.sandbox()) {
            return;
        }

        this.save.undo(this);
    }

    redo() {
        if (!this.sandbox()) {
            return;
        }

        this.save.redo(this);
    }

    fillSquare(type, x, y) {
        if (this.countingDown || this.paused) {
            return;
        }

        this.grid.fillSquare(type, x, y);
        this.updatedGrid = true;
    }

    mode() {
        return this.gameMode;
    }

    getUpdatedGameOver() {
        return this.updatedGameOver;
    }

    setUpdatedGameOver(updated) {
        this.updatedGameOver = updated;
    }

    getUpdatedPause() {
        return this.updatedPause;
    }

    setUpdatedPause(updated) {
        this.updatedPause = updated;
    }

    getUpdatedGrid() {
        return this.updatedGrid;
    }

    setUpdatedGrid(updated) {
        this.updatedGrid = updated;
    }

    getUpdatedHold() {
        return this.updatedHold;
    }

    setUpdatedHold(updated) {
        this.updatedHold = updated;
    }

    getUpdatedNext() {
        return this.updatedNext;
    }

    setUpdatedNext(updated) {
        this.updatedNext = updated;
    }

    getGrid() {
        return this.grid.getGrid();
    }

    getCurrentPiece() {
        return this.bag.getCurrentPiece();
    }

    getDropPreview() {
        const piece = this.bag.cloneCurrentPiece();
        this.calculateDrop(piece);
        piece.type = "preview";
        return piece;
    }

    getHoldPiece() {
        return this.bag.getHoldPiece();
    }

    getNextPieces() {
        return this.bag.getNextPieces();
    }

    getAllNextPieces() {
        return this.bag.getAllNextPieces();
    }

    getStartCountdown() {
        return this.startCountdown;
    }

    setStartCountdown(update) {
        this.startCountdown = update;
    }

    getStartTimer() {
        return this.displayStartTimer;
    }

    setStartTimer(update) {
        this.displayStartTimer = update;
    }

    getResetTimer() {
        // Timer is reset when a new game is started (new game, user restart, game over)
        let restart = this.restartTimer;
        this.restartTimer = false;
        return restart;
    }

    getLinesCleared() {
        return this.linesCleared;
    }

    getB2B() {
        if (this.b2b <= 0) {
            return 0;
        }
        return this.b2b;
    }

    getCombo() {
        if (this.combo <= 0) {
            return 0;
        }
        return this.combo;
    }

    getPiecesPlaced() {
        return this.piecesPlaced;
    }

    getAttack() {
        return this.totalAttack;
    }

    getStartTime() {
        return this.startTime;
    }

    getTimeElapsed() {
        return this.timeElapsed;
    }

    getResults() {
        // Return lines, back to back chain, pieces placed,
        // pieces per second, attack, attack per minute, and time
        let seconds = this.timeElapsed / 1000;
        let minutes = seconds / 60;
        let pps = (this.piecesPlaced / seconds).toFixed(2);
        let apm = (this.totalAttack / minutes).toFixed(2);

        // Stopwatch stats
        let ms = this.timeElapsed % 1000;
        let s = Math.floor(this.timeElapsed / 1000) % 60;
        let m = Math.floor(this.timeElapsed / 60000);
        if (ms < 10) {
            ms = "00" + ms;
        } else if (ms < 100) {
            ms = "0" + ms;
        }
        if (s < 10) {
            s = "0" + s;
        }
        if (m < 10) {
            m = "0" + m;
        }
        let timer = `${m}:${s}:${ms}`;

        return [this.linesCleared, this.maxB2B, this.maxCombo, this.piecesPlaced, pps, this.totalAttack, apm, timer];
    }

    updateHold(type) {
        this.bag.updateHold(type);
        this.updatedHold = true;
    }

    updateNext(types) {
        this.bag.updateNext(types);
        this.updatedGrid = true;
        this.updatedNext = true;
    }

}
