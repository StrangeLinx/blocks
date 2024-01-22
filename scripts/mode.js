import checkFinesse from "./finesse.js";

export default class Mode {

    constructor(type = "free") {
        this.new(type);
        this.numLookaheadPieces = 3;
        this.lookaheadShowQueue = false;
        this.finesseRequire180 = false;
    }

    new(type) {
        if (type) {
            this.type = type;
        }
        this.menuPause = true;
        this.blind = false;
        this.win = false;
        this.piecesPlaced = 0;
        this.linesCleared = 0;
        this.previousPiecesPlaced = 0;
        this.shouldPause = false;
        this.showLookaheadReadyMenu = false;

        this.showFinesseTip = false;
        this.hideFinesseTip = true;
        this.finesseTip = "";
    }

    play() {
        this.update();
    }

    pause() {
        if (this.type === "lookahead") {
            this.blind = false;
        }
    }

    over() {
        this.showLookaheadReadyMenu = false;
    }

    restart() {
        if (this.type === "lookahead") {
            this.blind = false;
            this.shouldPause = true;
            this.showLookaheadReadyMenu = true;
        }
    }

    piecePlaced(lineClears) {
        this.piecesPlaced++;
        this.linesCleared += lineClears;
        this.update();
    }

    update() {
        this.checkWin();
        this.updateMode();
    }

    checkWin() {
        if (this.type === "sprint" && this.linesCleared >= 40) {
            this.win = true;
        }
    }

    updateMode() {
        if (this.type === "lookahead") {
            // Unpausing from a menu
            if (this.menuPause) {
                this.blind = false;
                this.shouldPause = true;
                this.showLookaheadReadyMenu = true;
            }
            // If player is blind and placed their pieces then un-blind
            else if (this.blind && this.placedLookaheadPieces()) {
                this.blind = false;
                this.shouldPause = true;
                this.showLookaheadReadyMenu = true;
                this.previousPiecesPlaced = this.piecesPlaced;
            }
            // If player is not blind then always blind
            else {
                this.blind = true;
            }
        }

        if (this.type === "finesse") {
            this.showFinesseTip = false;
            this.hideFinesseTip = true;
            this.finesseTip = "";
        }
    }

    /**
     * Change the type of mode
     * @param {String}
     * @returns {Boolean} whether mode type changed
     */
    change(type) {
        if (type && this.type !== type) {
            this.new(type);
            return true;
        }

        return false;
    }

    remainingLookaheadPieces() {
        return this.numLookaheadPieces - (this.piecesPlaced - this.previousPiecesPlaced);
    }

    placedLookaheadPieces() {
        // Ex: If player placed 15 and lookahead is 5 then they placed their lookahead pieces
        return this.remainingLookaheadPieces() === 0;
    }

    setLookaheadPieces(numPieces) {
        this.numLookaheadPieces = numPieces;
    }

    passFinesse(piece, keySequence) {
        // Only fail in finesse mode
        if (this.type !== "finesse") {
            return true;
        }

        let [pass, tip] = checkFinesse(piece, keySequence, this.finesseRequire180);

        if (pass) {
            return true;
        }

        this.showFinesseTip = true;
        this.finesseTip = tip;
        return false;
    }

    sandbox() {
        return this.type === "free" || this.type === "b2b" || this.type === "lookahead" || this.type === "finesse";
    }
}