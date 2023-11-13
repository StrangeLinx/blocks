
export default class Display {

    constructor(game) {
        this.game = game;

        // Grid, overflow grid, hold, and next (queue) row & column constants
        this.createGridProperties();

        // Get grid, overflow grid, hold, next, countdowns
        this.retrieveGameElements();
        this.sizeGameElements();

        this.createGridCells();
        this.bindGridEvents();

        // hold, next edit options
        this.bindHoldNextEvents();
    }
    

    createGridProperties() {
        this.rows = 20;
        this.cols = 10;
        this.overflowRows = 6;
        this.holdRows = 4;
        this.holdCols = 6;
        this.nextRows = 16;
        this.nextCols = 6;
        this.blind = false;
    }

    retrieveGameElements() {
        // Main game grids
        this.grid = document.querySelector("#grid");
        this.gridOverflow = document.querySelector("#grid-overflow");
        this.gridCells = [];
        this.hold = document.querySelector("#holdPiece");
        this.next = document.querySelector("#next");

        // Stats
        this.linesDisplay = document.querySelector("#lines");
        this.lines = 0;

        this.b2bDisplay = document.querySelector("#b2b");
        this.b2b = 0;

        this.comboDisplay = document.querySelector("#combo");
        this.combo = 0;

        this.piecesDisplay = document.querySelector("#pieces");
        this.piecesPlaced = 0;
        this.ppsDisplay = document.querySelector("#pps");

        this.attackDisplay = document.querySelector("#attack");
        this.attack = 0;
        this.apmDisplay = document.querySelector("#apm");

        this.timerDisplay = document.querySelector("#timer");
        this.timerInterval;
        this.startTime;

        // Countdown
        this.countdownContainer = document.querySelector("#countdown-container");
        this.countdown = document.querySelector("#countdown");
        this.countdownInterval;
        this.countdownTransitionTimeout;
    }

    sizeGameElements() {
        // Calculate width and height to retain 1:1 aspect ratio
        let unit = 1.5; // rem units

        let width = unit * this.cols;
        let height = unit * this.rows;

        this.grid.style.width = `${width}rem`;
        this.grid.style.height = `${height}rem`;

        // Overflow has 6 rows and 10 columns
        height = this.overflowRows * unit;
        this.gridOverflow.style.width = `${width}rem`;
        this.gridOverflow.style.height = `${height}rem`;
        this.gridOverflow.style.top = `-${height}rem`;

        // Hold has 4 rows and 6 columns
        width = unit * this.holdCols;
        height = unit * this.holdRows;
        this.hold.style.width = `${width}rem`;
        this.hold.style.height = `${height}rem`;

        // Queue 16 rows and 6 columns
        height = unit * this.nextRows;
        this.next.style.width = `${width}rem`;
        this.next.style.height = `${height}rem`;
    }

    setBlind(flag) {
        this.blind = flag;
    }

    createGridCells() {
        // grid.js - (0, 0) is bottom left
        // display: grid - (20, 1) is bottom left
        // transform the row
        let invertRow = 19;

        // Grid
        for (let r = 0; r < this.rows; r++) {
            let row = [];
            for (let c = 0; c < this.cols; c++) {
                let cell = this.createSquare((invertRow - r) + 1, c + 1, "empty");
                this.grid.appendChild(cell);
                row.push(cell);
            }
            this.gridCells.push(row);
        }

        // Similar as above
        // grid.js - (20, 0) is bottom left
        // display: grid - (6, 1) is bottom left
        invertRow = 25;

        // Overflow grid
        for (let r = this.rows; r < this.rows + this.overflowRows; r++) {
            let row = [];
            for (let c = 0; c < this.cols; c++) {
                let cell = this.createSquare((invertRow - r) + 1, c + 1, "empty-overflow");
                this.gridOverflow.appendChild(cell);
                row.push(cell);
            }
            this.gridCells.push(row);
        }
    }

    bindGridEvents() {
        this.triggerFill = false;
        this.triggerClear = false;

        this.grid.addEventListener("mousedown", ev => this.clickGrid(ev, false));
        this.grid.addEventListener("mouseover", ev => this.hoverGrid(ev, false));

        this.gridOverflow.addEventListener("mousedown", ev => this.clickGrid(ev, true));
        this.gridOverflow.addEventListener("mouseover", ev => this.hoverGrid(ev, true));

        document.querySelector(".game-container").addEventListener("mouseup", ev => this.releaseGrid(ev));
    }

    clickGrid(ev, overFlowGrid) {
        if (!this.game.sandbox()) {
            return;
        }

        // Grid may have a border
        if (ev.target.id === "grid" || ev.target.id === "grid-overflow") {
            return;
        }

        // Otherwise clicked on a cell
        this.clickCell(ev.target);
        this.activateCell(ev.target, overFlowGrid);
        ev.preventDefault();
    }

    hoverGrid(ev, overFlowGrid) {
        if (!this.game.sandbox()) {
            return;
        }

        if (ev.target.id === "grid" || ev.target.id === "grid-overflow") {
            return;
        }

        this.activateCell(ev.target, overFlowGrid);
    }

    releaseGrid(ev) {
        this.triggerFill = false;
        this.triggerClear = false;
    }

    clickCell(cell) {
        if (cell.className === "empty" || cell.className === "empty-overflow" || cell.className === "preview") {
            this.triggerFill = true;
            this.triggerClear = false;
        } else {
            this.triggerFill = false;
            this.triggerClear = true;
        }
    }

    activateCell(cell, overFlowCell) {
        let yOffset = 0;
        if (overFlowCell) {
            yOffset = 6;
        }

        // determine index
        let x = cell.style.gridColumnStart - 1;
        let y = 20 - cell.style.gridRowStart + yOffset;

        if (this.triggerFill) {
            this.game.update({
                type: "fillSquare",
                pieceType: "g",
                x: x,
                y: y,
            });
        } else if (this.triggerClear) {
            this.game.update({
                type: "fillSquare",
                pieceType: "",
                x: x,
                y: y,
            });
        }
    }

    bindHoldNextEvents() {
        this.showEditQueueMenu = false;
        this.hold.addEventListener("click", () => this.clickQueue());
        this.next.addEventListener("click", () => this.clickQueue());
    }

    clickQueue() {
        if (!this.game.sandbox()) {
            return;
        }

        this.showEditQueueMenu = true;
        this.pause();
    }

    getShowEditQueueMenu() {
        return this.showEditQueueMenu;
    }

    setShowEditQueueMenu(update) {
        this.showEditQueueMenu = update;
    }

    drawGrid(grid, currentPiece, dropPreview) {

        // Grid
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                let currentSquare = this.gridCells[r][c];
                let desiredSquare = grid[r][c];
                if (desiredSquare === "") {
                    currentSquare.className = "empty";
                    if (this.blind) {
                        currentSquare.classList.add("blind");
                    } else {
                        currentSquare.classList.remove("blind");
                    }
                } else {
                    currentSquare.className = desiredSquare;
                    if (this.blind) {
                        currentSquare.classList.add("blind");
                    } else {
                        currentSquare.classList.remove("blind");
                    }
                }
            }
        }

        // Overflow Grid
        for (let r = this.rows; r < this.rows + this.overflowRows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (grid[r][c] === "") {
                    this.gridCells[r][c].className = "empty-overflow";
                } else {
                    this.gridCells[r][c].className = grid[r][c];
                }
            }
        }

        if (!this.blind) {
            this.drawPiece(dropPreview);
            this.drawPiece(currentPiece);
        }
    }

    drawPiece(piece) {
        if (!piece) {
            return;
        }
        for (let i = 0; i < piece.span.length; i++) {
            let r = piece.y + piece.span[i].y;
            let c = piece.x + piece.span[i].x;
            this.gridCells[r][c].className = piece.type;
        }
    }

    drawHold(piece) {
        this.hold.innerHTML = "";
        if (!piece) {
            return;
        }

        // Center point for hold is (3, 3)
        let xCenter = 3;
        let yCenter = 3;
        for (let i = 0; i < piece.span.length; i++) {
            let row = yCenter - piece.span[i].y; // up 1 unit for piece is -1 unit in grid
            let col = xCenter + piece.span[i].x;
            let square = this.createSquare(row, col, piece.type);
            this.hold.appendChild(square);
        }
    }

    drawNext(pieces) {
        this.next.innerHTML = "";
        if (!pieces) {
            return;
        }
        // Origin for queue starts at (3, 3)
        // Origin for following is (3, 6) - add 3 to y
        let xCenter = 3;
        let yCenter = 3;
        pieces.forEach(piece => {
            for (let i = 0; i < piece.span.length; i++) {
                let row = yCenter - piece.span[i].y;
                let col = xCenter + piece.span[i].x;
                let square = this.createSquare(row, col, piece.type);
                this.next.appendChild((this.createSquare(row, col, piece.type)));
            }
            yCenter += 3;
        });
    }

    createSquare(row, column, type) {
        const square = document.createElement("div");
        square.style.gridRowStart = row;
        square.style.gridColumnStart = column;
        square.classList.add(type);
        return square;
    }

    pause(timeElapsed) {
        if (timeElapsed === 0) {
            this.resetTimer();
            this.resetStats();
        } else if (Number.isFinite(timeElapsed)) {
            this.updateTimer(timeElapsed);
        }

        this.stopStats();

        // Stop countdown
        clearInterval(this.countdownInterval);
        clearTimeout(this.countdownTransitionTimeout);
        this.countdownContainer.style.display = "none";
    }

    drawCountdown(resetTimer) {

        if (resetTimer) {
            this.resetTimer();
            this.resetStats();
        }

        let count = 2;
        this.resetCountdown();
        this.countTransition(count);

        this.countdownInterval = setInterval(() => {
            count--;
            this.countTransition(count);
            if (count <= 0) {
                clearInterval(this.countdownInterval);
                this.finalCountTransition();
            }
        }, 1000);
    }

    resetCountdown() {
        clearInterval(this.countdownInterval);
        clearTimeout(this.countdownTransitionTimeout);

        // Show countdown
        this.countdownContainer.style.display = "flex";

        // Remove transition styles
        this.countdownContainer.classList.remove("countdown-container-transition");
        this.countdown.classList.remove("countdown-transition");
    }

    resetTimer() {
        clearInterval(this.timerInterval);
        this.timerDisplay.innerHTML = "00:00:00";
    }

    resetStats() {
        this.ppsDisplay.innerHTML = "0";
        this.apmDisplay.innerHTML = "0";
    }

    countTransition(count) {
        this.countdown.innerHTML = count;
        this.countdown.classList.remove("countdown-transition");
        this.countdown.innerHTML = count;
        setTimeout(() => {
            this.countdown.classList.add("countdown-transition");
        }, 1);
    }

    finalCountTransition() {
        this.countdown.innerHTML = "Go!";
        this.countdownContainer.classList.add("countdown-container-transition");
        this.countdown.innerHTML = "Go!";

        this.countdownTransitionTimeout = setTimeout(() => {
            this.countdownContainer.classList.remove("countdown-container-transition");
            this.countdown.classList.remove("countdown-transition");
            this.countdownContainer.style.display = "none";
        }, 1000);
    }

    startStats() {
        clearInterval(this.timerInterval);

        this.timerInterval = setInterval(() => {
            let milliseconds = Date.now() - this.startTime;
            let seconds = milliseconds / 1000;
            let minutes = seconds / 60;
            this.updateTimer(milliseconds);
            this.updatePPS(seconds);
            this.updateAPM(minutes);
        }, 10);
    }

    stopStats() {
        clearInterval(this.timerInterval);
    }

    updateStartTime(startTime) {
        this.startTime = startTime;
    }

    updateTimer(milliseconds) {

        // Hundredths of a second (centisecond)
        let cs = Math.floor((milliseconds % 1000) / 10);
        let s = Math.floor(milliseconds / 1000) % 60;
        let m = Math.floor(milliseconds / 60000);

        if (cs < 10) {
            cs = "0" + cs;
        }
        if (s < 10) {
            s = "0" + s;
        }
        if (m < 10) {
            m = "0" + m;
        }

        this.timerDisplay.innerHTML = `${m}:${s}:${cs}`;
    }

    updatePPS(seconds) {
        // Pieces per second
        let pps;
        if (this.piecesPlaced <= 0) {
            pps = 0;
        } else {
            pps = (this.piecesPlaced / seconds).toFixed(2);
        }
        this.ppsDisplay.innerHTML = `${pps}`;
    }

    updateAPM(minutes) {
        // Attack per minute
        let apm;
        if (this.attack <= 0) {
            apm = 0;
        } else {
            apm = (this.attack / minutes).toFixed(1);
        }
        this.apmDisplay.innerHTML = `${apm}`;
    }

    setStats(linesCleared, B2B, combo, piecesPlaced, attack) {
        this.linesCleared = linesCleared;
        this.linesDisplay.innerHTML = linesCleared;

        this.b2b = B2B;
        this.b2bDisplay.innerHTML = B2B;

        this.combo = combo;
        this.comboDisplay.innerHTML = combo;

        this.piecesPlaced = piecesPlaced;
        this.piecesDisplay.innerHTML = piecesPlaced;

        this.attack = attack;
        this.attackDisplay.innerHTML = attack;

        let milliseconds = Date.now() - this.startTime;
        if (!Number.isFinite(milliseconds) || milliseconds === 0) {
            return;
        }
        let seconds = milliseconds / 1000;
        let minutes = seconds / 60;
        this.updatePPS(seconds);
        this.updateAPM(minutes);
    }
}