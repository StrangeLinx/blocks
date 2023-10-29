
export default class Grid {

    constructor() {
        this.rows = 26;
        this.cols = 10;
        this.linesCleared = 0;
        this.newGrid();
    }

    newGrid() {
        // Make an empty grid with dimensions - rows * cols (26 by 10)
        this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(""));
    }

    place(piece) {
        for (let i = 0; i < piece.span.length; i++) {
            this.placeSquare(piece.type, piece.x + piece.span[i].x, piece.y + piece.span[i].y);
        }
    }

    placeSquare(type, x, y) {
        this.grid[y][x] = type;
    }

    valid(piece) {
        for (let i = 0; i < piece.span.length; i++) {
            let x = piece.x + piece.span[i].x;
            let y = piece.y + piece.span[i].y;
            if (!this.validX(x) || !this.validY(y)) {
                return false;
            }
            if (!this.free(x, y)) {
                return false;
            }
        }
        return true;
    }

    validXShift(piece, shift) {
        for (let i = 0; i < piece.span.length; i++) {
            let x = piece.x + piece.span[i].x + shift;
            if (!this.validX(x)) {
                return false;
            }
            let y = piece.y + piece.span[i].y;
            if (!this.free(x, y)) {
                return false;
            }
        }
        return true;
    }

    validYShift(piece, shift) {
        for (let i = 0; i < piece.span.length; i++) {
            let y = piece.y + piece.span[i].y + shift;
            if (!this.validY(y)) {
                return false;
            }
            let x = piece.x + piece.span[i].x;
            if (!this.free(x, y)) {
                return false;
            }
        }
        return true;
    }

    validX(x) {
        return (0 <= x && x < this.cols);
    }

    validY(y) {
        return (0 <= y && y < this.rows);
    }

    free(x, y) {
        return this.grid[y][x] === "";
    }

    clearLines() {
        let cleared = 0;
        // If a row is filled (no holes), then clear the line
        for (let y = this.rows - 1; y >= 0; y--) {
            let x = 0;
            let hole = false;
            while (x < this.cols && !hole) {
                if (this.free(x, y)) {
                    hole = true;
                }
                x++;
            }
            if (!hole) {
                this.clearLine(y);
                cleared++;
            }
        }

        return cleared;
    }

    clearLine(y) {
        // Remove row and add a new one on top
        this.grid.splice(y, 1);
        this.grid.push(new Array(this.cols).fill(""));
        this.linesCleared++;
    }

    checkPerfectClear() {
        // A perfect clear is when the last piece caused the board to be completely empty
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (!this.free(x, y)) {
                    return false;
                }
            }
        }

        return true;
    }

    fillSquare(type, x, y) {
        // Prevent filling a filled square
        if (type !== "" && !this.free(x, y)) {
            return;
        }
        this.placeSquare(type, x, y);
    }

    getGrid() {
        return this.grid;
    }
}