
export default class Mode {

    constructor(type = "free") {
        this.new(type);
    }

    new(type) {
        this.type = type;
        this.win = false;
        this.piecesPlaced = 0;
        this.linesCleared = 0;
    }

    piecePlaced(lineClears) {
        this.piecesPlaced++;
        this.linesCleared += lineClears;
        this.update();
    }

    update() {
        this.checkWin();
    }

    checkWin() {
        if (this.type === "sprint" && this.linesCleared >= 40) {
            this.win = true;
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

    sandbox() {
        return this.type === "free" || this.type === "b2b";
    }
}