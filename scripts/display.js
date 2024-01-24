
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

        this.createHoldCells();
        this.createNextCells();

        // hold, next edit options
        this.bindHoldNextEvents();
    }

    updateQueueWidth() {
        let unit = 1.5;
        let width = unit * this.nextCols;
        this.next.style.width = `${width}rem`;
    }

    updateQueueSize(queueSize) {
        let n = Math.floor((queueSize - 1) / 5);
        if (n == -1) {
            n = 0;
        }

        // Ensure only resizing on change
        let newNextCols = 6 + n * 5;
        if (this.nextCols === newNextCols) {
            return;
        }

        this.nextCols = newNextCols;
        this.createNextCells();
        this.updateQueueWidth();
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
        this.blindShowQueue = false;
        this.autocolorEnabled = true;
    }

    retrieveGameElements() {
        // Main game grids
        this.grid = document.querySelector("#grid");
        this.gridOverflow = document.querySelector("#grid-overflow");
        this.gridCells = [];
        this.holdCells = [];
        this.nextCells = [];
        this.hold = document.querySelector("#holdPiece");
        this.next = document.querySelector("#next");


        // Stats
        this.linesDisplay = document.querySelector("#lines-stat");
        this.lines = 0;

        this.b2bDisplay = document.querySelector("#b2b-stat");
        this.b2b = 0;

        this.comboDisplay = document.querySelector("#combo-stat");
        this.combo = 0;

        this.piecesDisplay = document.querySelector("#pieces-stat");
        this.piecesPlaced = 0;
        this.ppsDisplay = document.querySelector("#pps-stat");

        this.attackDisplay = document.querySelector("#attack-stat");
        this.attack = 0;
        this.apmDisplay = document.querySelector("#apm-stat");

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

        // Queue has 16 rows
        this.updateQueueWidth();
        height = unit * this.nextRows;

        this.next.style.height = `${height}rem`;
    }

    setBlind(flag, showQueue) {
        this.blind = flag;
        this.blindShowQueue = showQueue;
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
                let cell = this.createSquare((invertRow - r) + 1, c + 1, "outline");
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
                let cell = this.createSquare((invertRow - r) + 1, c + 1, "empty");
                this.gridOverflow.appendChild(cell);
                row.push(cell);
            }
            this.gridCells.push(row);
        }
    }

    createHoldCells() {
        for (let r = 0; r < this.holdRows; r++) {
            let row = [];
            for (let c = 0; c < this.holdCols; c++) {
                let cell = this.createSquare(r + 1, c + 1, "empty");
                this.hold.appendChild(cell);
                row.push(cell);
            }
            this.holdCells.push(row);
        }
    }

    createNextCells() {
        this.next.innerHTML = "";
        this.nextCells = [];
        this.next.style.gridTemplateColumns = `repeat(${this.nextCols}, 1fr)`;
        for (let r = 0; r < this.nextRows; r++) {
            let row = [];
            for (let c = 0; c < this.nextCols; c++) {
                let cell = this.createSquare(r + 1, c + 1, "empty");
                this.next.appendChild(cell);
                row.push(cell);
            }
            this.nextCells.push(row);
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
        if (!this.game.sandbox() || this.blind) {
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
        // Determine if active first
        if (!this.triggerFill && !this.triggerClear) {
            return;
        }

        if (!this.game.sandbox() || this.blind) {
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
        if (this.empty(cell)) {
            this.triggerFill = true;
            this.triggerClear = false;
            this.activatedCells = [];
        } else {
            this.triggerFill = false;
            this.triggerClear = true;
        }
    }

    empty(cell) {
        return (cell.className === "outline" || cell.className === "empty" || cell.className === "preview");
    }

    activateCell(gridCell, overFlowCell) {
        // If cell is occupied don't even consider on fill
        if (this.triggerFill && !this.empty(gridCell)) {
            return;
        }

        let yOffset = 0;
        if (overFlowCell) {
            yOffset = 6;
        }

        // determine index
        let x = gridCell.style.gridColumnStart - 1;
        let y = 20 - gridCell.style.gridRowStart + yOffset;

        let cell;
        if (this.triggerFill) {
            cell = {
                type: "fillSquare",
                pieceType: "g",
                x: x,
                y: y,
            };
            if (this.autocolorEnabled) {
                this.activatedCells.push(cell);
            }
        } else if (this.triggerClear) {
            cell = {
                type: "fillSquare",
                pieceType: "",
                x: x,
                y: y,
            };
        }

        if (this.autocolor()) {
            return;
        }

        this.game.update(cell);

    }

    autocolor() {
        // Autocolor checks every 4 "drawn" cells.
        // If no piece is identified from these 4 cells then rest drawn cells are grey


        if (!this.autocolorEnabled) {
            return false;
        }

        if (this.activatedCells.length !== 4) {
            return false;
        }

        // Cells can represent a piece. If so, determine which piece it is
        if (!this.game.calculatePieceType(this.activatedCells)) {
            // No piece identified
            return false;
        }

        // Piece identified
        for (let coloredCell of this.activatedCells) {
            this.game.update(coloredCell);
        }
        this.activatedCells = [];

        return true;
    }

    bindHoldNextEvents() {
        this.showEditQueueMenu = false;
        this.hold.addEventListener("click", () => this.clickQueue());
        this.next.addEventListener("click", () => this.clickQueue());
    }

    clickQueue() {
        if (!this.game.sandbox() || this.blind) {
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
    /**
     * Removes coloring from classlist of div element
     * @param {HTMLDivElement} square 
     */
    removeColor(square) {
        let pieceTypes = "goiljstz";
        for (let type of pieceTypes) {
            square.classList.remove(type);
        }

        square.classList.remove("preview");
        square.classList.remove("outline");
        square.classList.remove("empty");
    }
    /**
     * Adds or removes blind class from a div element depending on blindness,
     * And gives it color according to piece type
     * @param {HTMLDivElement} square 
     * @param {String} type 
     * @param {Boolean} expose determines if piece should be shown (defined by user preference)
     */
    updateSquare(square, type, expose = false) {
        square.classList.add(type);
        if (this.blind && !expose) {
            square.classList.add("blind");
        } else {
            square.classList.remove("blind");
        }
    }

    drawGrid(grid, currentPiece, dropPreview) {

        // Grid
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                let currentSquare = this.gridCells[r][c];
                let desiredSquare = grid[r][c];
                if (desiredSquare === "") {
                    desiredSquare = "outline";
                }
                this.removeColor(currentSquare);
                this.updateSquare(currentSquare, desiredSquare);
            }
        }

        // Overflow Grid
        for (let r = this.rows; r < this.rows + this.overflowRows; r++) {
            for (let c = 0; c < this.cols; c++) {
                let currentSquare = this.gridCells[r][c];
                let desiredSquare = grid[r][c];
                if (desiredSquare === "") {
                    desiredSquare = "empty";
                }
                this.removeColor(currentSquare);
                this.updateSquare(currentSquare, desiredSquare);
            }
        }

        this.drawPiece(dropPreview);
        this.drawPiece(currentPiece);
    }

    /**
     * 
     * @param {*} piece 
     */
    drawPiece(piece) {
        if (!piece) {
            return;
        }
        for (let i = 0; i < piece.span.length; i++) {
            let r = piece.y + piece.span[i].y;
            let c = piece.x + piece.span[i].x;
            let currentSquare = this.gridCells[r][c];
            this.removeColor(currentSquare);
            this.updateSquare(currentSquare, piece.type);
        }
    }

    drawHold(piece) {
        for (let r = 0; r < this.holdRows; r++) {
            for (let c = 0; c < this.holdCols; c++) {
                let currentSquare = this.holdCells[r][c];
                this.removeColor(currentSquare);
                this.updateSquare(currentSquare, "empty", this.blindShowQueue);
            }
        }

        if (!piece) {
            return;
        }

        // Center point for hold is (3, 3)
        let xCenter = 2;
        let yCenter = 2;
        for (let i = 0; i < piece.span.length; i++) {
            let row = yCenter - piece.span[i].y; // up 1 unit for piece is -1 unit in grid
            let col = xCenter + piece.span[i].x;
            this.holdCells[row][col].classList.add(piece.type);
        }
    }

    drawNext(pieces) {
        this.updateQueueSize(pieces.length);

        for (let r = 0; r < this.nextRows; r++) {
            for (let c = 0; c < this.nextCols; c++) {
                let currentSquare = this.nextCells[r][c];
                this.removeColor(currentSquare);
                this.updateSquare(currentSquare, "empty", this.blindShowQueue);
            }
        }

        if (!pieces) {
            return;
        }

        let xCenter = 2;
        let yCenter = 2;
        let pieceNum = 0;
        const verticalSlots = 5;
        for (let piece of pieces) {
            pieceNum += 1;
            for (let i = 0; i < piece.span.length; i++) {
                let row = yCenter - piece.span[i].y;
                let col = xCenter + piece.span[i].x;
                let currCell = this.nextCells[row][col];
                currCell.classList.add(piece.type);
            }
            yCenter += 3;
            if (pieceNum % verticalSlots == 0) {
                xCenter += 5;
                yCenter = 2;
            }
        }
    }

    setBlindPiecePlacement(piece) {
        if (!piece) {
            return;
        }

        for (let i = 0; i < piece.span.length; i++) {
            let r = piece.y + piece.span[i].y; // up 1 unit for piece is -1 unit in grid
            let c = piece.x + piece.span[i].x;
            let prevClasses = this.gridCells[r][c].classList;
            this.gridCells[r][c].classList = "";
            this.gridCells[r][c].classList.add(piece.type);
            this.gridCells[r][c].classList.remove("blind");
            setTimeout(() => {
                this.gridCells[r][c].classList = prevClasses;
                this.gridCells[r][c].classList.remove("blind");
                if (this.blind) {
                    this.gridCells[r][c].classList.add("blind");
                }
            }, 1);
        }

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