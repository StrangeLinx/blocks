import Grid from "./grid.js";
import Bag from "./bag.js";
import Kick from "./kick.js";
import Attack from "./attack.js";
import Save from "./save.js";
import Mode from "./mode.js";

export default class Game {

    constructor() {
        this.kick = new Kick();      // kick tables
        this.attack = new Attack();  // attack table
        this.save = new Save();
        this.mode = new Mode();
        this.bag = new Bag();

        this.new();

        this.undoOnDrop = true;
        this.countdownTimeout;
        this.startCountdown = false;
        this.countingDown = false;

    }

    new(fromMenu = false) {
        this.grid = new Grid();
        this.bag.new();
        this.mode.new();
        this.mode.menuPause = fromMenu;
        this.restartOnModeChange = true;
        this.lastMove = "";

        this.pieceToReveal = "";

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

        this.updatedPause = true;
        this.updatedGameOver = false;
        this.over = false;

        this.startTime = "";
        this.restartTimer = true;
        this.timeElapsed = 0;

    }

    update(move) {

        if (this.sandboxUpdate(move)) {
            return;
        }
        if (this.gameFlowUpdate(move)) {
            return;
        }
        // Prevent game play in count down or when paused
        if (this.countingDown || this.paused) {
            return;
        }
        // Otherwise it's relating to a piece
        this.pieceUpdate(move);
    }

    updateQueueSize(size) {
        this.bag.updateQueueSize(size);
        this.updatedNext = true;
    }

    sandbox() {
        return this.mode.sandbox();
    }

    sandboxUpdate(move) {
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

    gameFlowUpdate(move) {
        if (move.type === "undo") {
            this.undo();
            return true;
        }
        if (move.type === "redo") {
            this.redo();
            return true;
        }
        if (move.type === "play") {
            this.play(move.mode);
            return true;
        }
        if (move.type === "pause") {
            this.pause();
            return true;
        }
        if (move.type === "restart") {
            this.restart(true);
            return true;
        }

        return false;
    }

    pieceUpdate(move) {
        if (move.type === "shift") {
            this.shift(move.x, move.y);
        }
        // Infinite soft drop
        else if (move.type === "shiftFloor") {
            this.shiftFloor();
        }
        else if (move.type === "leftWall") {
            this.leftWall();
        }
        else if (move.type === "rightWall") {
            this.rightWall();
        }
        // Hard drop
        else if (move.type === "drop") {
            this.drop();
        }
        else if (move.type === "rot") {
            this.rotate(move.r);
        }
        else if (move.type === "hold") {
            this.hold();
        }
    }

    play(type) {
        this.updateMode(type);
        this.mode.play();

        // Pauses in lookahead mode for user to get ready
        if (this.checkModePause()) {
            return;
        }

        this.updatedPause = false;
        this.paused = false;

        this.updatedGrid = true;
        this.updatedHold = true;
        this.updatedNext = true;

        if (this.mode.type === "sprint") {
            clearTimeout(this.countdownTimeout);
            this.countdown();
        } else {
            this.updateStartTime();
        }
    }

    updateMode(type) {
        // Note mode can only be updated from menu

        // Always restart if changing mode to sprint
        if (type === "sprint" && this.mode.change(type)) {
            this.bag.updateQueueSize(5);
            this.new();
            this.save.clear();
            return;
        }

        let updatedMode = this.mode.change(type);
        // If mode change made start fresh
        if (updatedMode && this.restartOnModeChange) {
            this.new(true);
            this.save.clear();
            return;
        }

        // Same mode and game over then start fresh
        if (!updatedMode && this.over) {
            this.new(true);
            return;
        }

        // Restart on next mode change
        // Adding this so when user loads a board from a screenshot (see load()), it doesn't get wiped
        this.restartOnModeChange = true;
    }

    pause(fromMenu = true) {
        // Ensure mode is updated
        this.mode.menuPause = fromMenu;

        if (this.paused) {
            return;
        }

        this.paused = true;
        this.updatedPause = true;
        this.displayStartTimer = false;

        this.mode.pause();
        this.updatedGrid = true;
        this.updatedHold = true;
        this.updatedNext = true;

        // Stop countdown
        clearTimeout(this.countdownTimeout);
        this.countingDown = false;

        // Track game play time
        if (this.startTime) { // populated when previously paused
            this.timeElapsed = Date.now() - this.startTime;
        } else {
            this.timeElapsed = 0;
        }
    }

    restart(save = false) {
        if (save) {
            this.saveState("restart");
        }
        this.new();
        this.lastMove = "restart";

        this.mode.restart();

        // If mode doesn't pause then play
        if (!this.checkModePause()) {
            this.play();
        }
    }

    checkModePause() {
        if (this.mode.shouldPause) {
            this.mode.shouldPause = false;
            this.pause(false);
            return true;
        }
        return false;
    }

    countdown() {
        this.startCountdown = true;  // state variable for driver to start countdown
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
            this.saveState("shift");

            // Replace current piece with shifted piece
            this.bag.setCurrentPiece(shiftedPiece);
            this.setUpdatedGrid(true);

            // T spin status is reset after a shift
            this.tSpin = false;
            this.miniTSpin = false;
        }
    }

    shiftFloor() {
        let piece = this.bag.getCurrentPiece();

        // Calculate if move will move and save (before moving)
        if (this.grid.validYShift(piece, -1)) {
            this.saveState("shiftFloor");
        }

        // Check if piece is shifted to the floor
        if (this.calculateDrop(piece)) {

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

        // Save before shifting
        let direction = x === -1 ? "leftWall" : "rightWall";
        if (this.grid.validXShift(piece, x)) {
            this.saveState(direction);
            piece.shift(x, 0);
            shifted = true;
        }

        // Shift piece until a wall (or another piece) is hit
        while (this.grid.validXShift(piece, x)) {
            piece.shift(x, 0);
            shifted = true;
        }

        return shifted;
    }

    drop() {
        if (!this.passFinesse(this.getCurrentPiece())) {
            return;
        }

        this.saveState("drop");

        const piece = this.bag.place();

        // Move piece down then place
        this.calculateDrop(piece);
        this.grid.place(piece);
        this.piecesPlaced++;

        // Clear rows that are filled
        let lineClears = this.grid.clearLines();
        this.linesCleared += lineClears;

        this.mode.piecePlaced(lineClears);
        this.checkModePause();

        // Stats
        this.updateCombo(lineClears);
        this.updateB2B(lineClears);
        this.updateAttack(lineClears);

        // Player can win or lose after a piece is dropped
        this.checkGameOver();

        if (this.mode.blind) {
            this.pieceToReveal = piece;
        }

        this.setUpdatedGrid(true);
        this.setUpdatedHold(true);
        this.setUpdatedNext(true);

    }

    passFinesse(piece) {
        // this.keySequence is passed from controls.js
        let pass = this.mode.passFinesse(piece, this.keySequence);
        if (pass) {
            return true;
        }

        this.save.undoDrop(this);
        return false;
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
            // Broken when a line clear is not a quad, tSpin, or a mini t spin
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

        // Check if current rotation is valid
        rotatedPiece.rotate(r);
        if (this.grid.valid(rotatedPiece)) {
            this.saveState("rotate");
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
                this.saveState("rotate");
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
        // 3. At least 3 of the 4 corners are occupied (from the 3x3 sub-grid of piece span)
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
        // 3*3 possible sub-grids from t piece where x represent the corners:
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
        if (!this.bag.validToHold()) {
            return;
        }

        this.saveState("hold");
        let [updatedHold, updatedNext] = this.bag.hold();

        // updateHold is false when player tried holding twice in a row
        if (updatedHold) {
            this.updatedGrid = updatedHold;
            this.updatedHold = updatedHold;
            if (!this.updatedNext) { // If set to true don't reset status
                this.updatedNext = updatedNext;
            }
            this.tSpin = false;
            this.miniTSpin = false;
        }

        // If a player is dangerously high on the board,
        // a piece may spawn on top of another which causes a loss
        this.checkGameOver();
    }

    checkGameOver() {
        if (this.mode.win) {
            this.gameOver();
        } else if (this.toppedOut()) {
            this.gameOver();
        }
    }

    toppedOut() {
        // Topped out when the current piece spawns on an occupied square (not a valid grid placement)
        return !(this.grid.valid(this.bag.getCurrentPiece()));
    }

    gameOver() {
        this.mode.over();
        this.pause();
        this.over = true;
        this.updatedGameOver = true;
    }

    saveState(move) {
        if (!this.sandbox()) {
            return;
        }

        this.save.save(this);
        this.lastMove = move;
    }

    undo() {
        if (!this.sandbox()) {
            return;
        }
        if (this.mode.type === "lookahead") {
            this.lookaheadUndo();
        }
        else {
            this.save.undo(this);
        }

        this.checkModePause();
    }

    lookaheadUndo() {
        // Calculate amount of pieces to undo
        let numLookaheadPiecesPlaced = this.mode.piecesPlaced - this.mode.previousPiecesPlaced;
        if (numLookaheadPiecesPlaced === 0) {
            numLookaheadPiecesPlaced = this.mode.numLookaheadPieces;
        }

        for (let i = 0; i < numLookaheadPiecesPlaced; i++) {
            this.save.undoDrop(this);
        };
    }

    redo() {
        if (!this.sandbox()) {
            return;
        }
        if (this.mode.type === "lookahead") {
            this.lookaheadRedo();
        } else {
            this.save.redo(this);
        }

        this.checkModePause();
    }

    lookaheadRedo() {
        // Redo the amount of lookahead pieces
        for (let i = 0; i < this.mode.numLookaheadPieces; i++) {
            this.save.redoDrop(this);
        }
    }

    fillSquare(type, x, y) {
        this.grid.fillSquare(type, x, y);
        this.updatedGrid = true;
    }

    load(grid, hold, next) {
        if (!grid) {
            return;
        }

        this.restartOnModeChange = false;
        this.saveState("restart");

        this.grid.setGrid(grid);
        this.updateHold(hold);
        this.updateNext(next);
    }

    mode() {
        return this.mode.type;
    }

    setLookaheadPieces(numPieces) {
        if (numPieces === this.mode.numLookaheadPieces) {
            return;
        }

        this.mode.setLookaheadPieces(numPieces);

        // Currently playing this mode and updating look ahead pieces.
        // Save current state for a smoother "undo transition"
        /**if (this.piecesPlaced > 0) {
            this.save.save(this);
        }*/
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

    blind() {
        return this.mode.blind;
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

    getShowLookaheadReadyMenu() {
        return this.mode.showLookaheadReadyMenu;
    }

    setShowLookaheadReadyMenu(update) {
        this.mode.showLookaheadReadyMenu = update;
    }

    showFinesseTip() {
        return this.mode.showFinesseTip;
    }

    hideFinesseTip() {
        return this.mode.hideFinesseTip;
    }

    getFinesseTip() {
        return this.mode.finesseTip;
    }

    revealDroppedPiece() {
        let temp = this.pieceToReveal;
        this.pieceToReveal = "";
        return temp;
    }

}
