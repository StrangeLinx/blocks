
export default class Grid {

    constructor() {
        this.rows = 26;
        this.cols = 10;
        this.linesCleared = 0;
        this.cheeseLayer = 0;
        this.cheeseLinesCleared = 0;
        this.garbageQueue = [];
        this.newGarbageHole();
        this.newGrid();
    }

    newGrid() {
        this.grid = this.emptyGrid();
    }

    emptyGrid() {
        // Make an empty grid with dimensions - rows * cols (26 by 10)
        return Array.from({ length: this.rows }, () => Array(this.cols).fill(""));
    }

    newGarbageHole() {
        let oldHole = this.garbageHole;
        // Ensure a different garbage hole every time
        do {
            this.garbageHole = Math.floor(Math.random() * this.cols);
        } while (this.garbageHole === oldHole);
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
        this.cheeseCleared(y);
        // Remove row and add a new one on top
        this.grid.splice(y, 1);
        this.grid.push(new Array(this.cols).fill(""));
        this.linesCleared++;
    }

    cheeseCleared(row) {
        // Cheese is cleared when the line belongs to one of the cheese layers
        if (row < this.cheeseLayer) {
            this.cheeseLayer--;
            this.cheeseLinesCleared++;
        }
    }

    updateCheeseLayer(cheesiness) {
        if (this.cheeseLinesCleared <= 0) {
            return;
        }

        // Restore cheese layer
        this.addCheeseLayers(this.cheeseLinesCleared, cheesiness);
        this.cheeseLayer += this.cheeseLinesCleared;
        this.cheeseLinesCleared = 0;
    }

    adjustCheeseLayer(newLayers, cheesiness) {
        let difference = newLayers - this.cheeseLayer;
        this.cheeseLayer = newLayers;


        if (difference === 0) {
            return;
        }

        if (difference < 0) {
            this.removeCheeseLayers(difference * (-1));
        }

        if (difference > 0) {
            this.addCheeseLayers(difference, cheesiness);
        }
    }

    removeCheeseLayers(amount) {
        // Remove a layer and add a clean empty row on top
        for (let i = 0; i < amount; i++) {
            this.grid.shift();
            this.grid.push(new Array(this.cols).fill(""));
        }
    }

    addCheeseLayers(amount, cheesiness) {
        for (let i = 0; i < amount; i++) {
            this.addLinesToGarbageQueue(1, cheesiness);
        }
        this.receiveGarbage(amount);
    }

    queueGarbage(amount, cheesiness) {
        if (this.garbageLimitReached() || amount < 0) {
            return;
        }

        this.addLinesToGarbageQueue(amount, cheesiness);
    }

    garbageLimitReached() {
        if (this.garbageQueue.length > 500) {
            return true;
        }

        return false;
    }

    addLinesToGarbageQueue(amount, cheesiness) {
        // Generate new garbage hole
        // If cheesiness is 0, then garbage is considered clean
        if (Math.random() < cheesiness) {
            this.newGarbageHole();
        }

        // Full garbage rows
        const garbageLines = Array.from({ length: amount }, () => Array(this.cols).fill("g"));

        // Add hole to each garbage line and add to garbage queue
        for (let i = 0; i < amount; i++) {
            garbageLines[i][this.garbageHole] = "";
            this.garbageQueue.push(garbageLines[i]);
        }

    }

    cancelGarbage(attack) {
        if (attack <= 0 || this.garbageQueue.length <= 0) {
            return 0;
        }

        let linesCancelled = this.garbageQueue.splice(0, attack).length;
        return linesCancelled;
    }

    receiveGarbage(limit = 8) {
        if (this.garbageQueue.length <= 0 || limit === 0) {
            return false;
        }

        // Allow a max of 8 lines (default) to queue at a time
        if (this.garbageQueue.length >= limit) {
            this.receiveGarbageLines(limit);
        } else {
            this.receiveGarbageLines(this.garbageQueue.length);
        }

        return true;
    }

    receiveGarbageLines(num) {
        // Remove lines that will be added
        const start = this.rows - num;
        this.grid.splice(start, this.cols);

        // Add garbage lines
        for (let i = 0; i < num; i++) {
            this.grid.unshift(this.garbageQueue.shift());
        }

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
        this.placeSquare(type, x, y);
    }

    getGrid() {
        return this.grid.slice(0, this.rows);
    }

    setGrid(grid) {
        this.grid = grid;
    }

    getGarbageLines() {
        return this.garbageQueue.length;
    }


    createSubgrid(squares) {
        // Assumes square(x = 0, y = 0) is bottom left

        // Create an empty 4x4 grid
        const len = 4;
        const subgrid = Array.from({ length: len }, () => Array(len).fill(0));


        // Calculate minimum to have values 0 <= x, y <= 4
        let minX = Infinity;
        let minY = Infinity;

        for (let square of squares) {
            if (square.x < minX) {
                minX = square.x;
            }

            if (square.y < minY) {
                minY = square.y;
            }
        }


        // Plot piece in 4x4 minigrid
        let x, y;
        for (let square of squares) {
            x = square.x - minX;
            y = square.y - minY;

            if (0 <= x && x < len && 0 <= y && y < len) {
                subgrid[y][x] = 1;
            }
        }

        return subgrid;

    }
}