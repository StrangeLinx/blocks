
export default class Mode {

    constructor(type = "free") {
        this.new(type);
        this.numLookaheadPieces = 3;
    }

    new(type) {
        if (type) {
            this.type = type;
        }
        this.menuPause = false;
        this.blind = false;
        this.win = false;
        this.piecesPlaced = 0;
        this.linesCleared = 0;
        this.shouldPause = false;
        this.showLookaheadReadyMenu = false;
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
            // If player is not blind then always blind
            else if (this.blind && this.placedLookaheadPieces()) {
                this.blind = false;
                this.shouldPause = true;
                this.showLookaheadReadyMenu = true;
            } else {
                this.blind = true;
            }
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

    allowSave() {
        // Only in sandbox mode
        if (!this.sandbox()) {
            return false;
        }
        // Save on start
        if (this.piecesPlaced === 0) {
            return true;
        }
        if (this.type === "lookahead" && !this.placedLookaheadPieces()) {
            return false;
        }
        return true;
    }

    placedLookaheadPieces() {
        // Haven't placed anything if 0
        if (this.piecesPlaced === 0) {
            return false;
        }
        // Ex: If player placed 15 and lookahead is 5 then they placed their lookahead pieces
        return this.piecesPlaced % this.numLookaheadPieces === 0;
    }

    setLookaheadPieces(numPieces) {
        this.numLookaheadPieces = numPieces;
    }

    sandbox() {
        return this.type === "free" || this.type === "b2b" || this.type === "lookahead";
    }
}