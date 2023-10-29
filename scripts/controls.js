
export default class Controls {

    constructor(game) {

        this.game = game;

        this.createIntervalGlobals();
        this.createMoves();
        this.loadUserKeybindPreferences();
        this.loadUserHandlingPreferences();

    }

    createIntervalGlobals() {
        this.leftInterval;
        this.rightInterval;
        this.softDropInterval;
        this.undoInterval;
        this.redoInterval;
    }

    createMoves() {
        this.moves = {
            left: { type: "shift", x: -1, y: 0 },
            right: { type: "shift", x: 1, y: 0 },
            down: { type: "shift", x: 0, y: -1 },
            drop: { type: "drop" },
            clockwise: { type: "rot", r: 1 },
            counterClockwise: { type: "rot", r: -1 },
            oneEighty: { type: "rot", r: 2 },
            hold: { type: "hold" },
            restart: { type: "restart" },
            pause: { type: "pause" },
            undo: { type: "undo" },
            redo: { type: "redo" }
        };
    }

    loadUserKeybindPreferences() {
        // Check browser support
        if (!this.localStorageSupport()) {
            this.loadDefaultKeybinds();
            return;
        }

        let controls = JSON.parse(localStorage.getItem("controls"));
        let pressed = JSON.parse(localStorage.getItem("pressed"));

        if (controls && pressed) {
            this.controls = controls;
            this.pressed = pressed;
        } else {
            this.loadDefaultKeybinds();
        }

    }

    loadDefaultKeybinds() {
        this.controls = {
            ArrowLeft: "left",
            ArrowRight: "right",
            ArrowDown: "down",
            c: "drop",
            ArrowUp: "clockwise",
            x: "counterClockwise",
            Shift: "oneEighty",
            z: "hold",
            r: "restart",
            Escape: "pause",
            q: "undo",
            w: "redo"
        };

        this.pressed = {
            ArrowLeft: false,
            ArrowRight: false,
            ArrowDown: false,
            c: false,
            ArrowUp: false,
            x: false,
            Shift: false,
            z: false,
            r: false,
            q: false,
            w: false
        };
    }

    loadUserHandlingPreferences() {
        if (!this.localStorageSupport()) {
            this.loadDefaultHandling();
            return;
        }

        let DAS = localStorage.getItem("DAS");
        let ARR = localStorage.getItem("ARR");
        let SDF = localStorage.getItem("SDF");

        if (DAS && ARR && SDF) {
            this.DAS = Number(DAS);
            this.ARR = Number(ARR);
            this.SDF = Number(SDF);
        } else {
            this.loadDefaultHandling();
        }
    }

    loadDefaultHandling() {
        this.DAS = 100;
        this.ARR = 0;
        this.SDF = Infinity;
    }

    saveUserKeybindPreferences() {
        if (!this.localStorageSupport()) {
            return;
        }

        localStorage.setItem("controls", JSON.stringify(this.controls));
        localStorage.setItem("pressed", JSON.stringify(this.pressed));
    }

    saveUserHandlingPreferences() {
        if (!this.localStorageSupport()) {
            return;
        }

        localStorage.setItem("DAS", this.DAS);
        localStorage.setItem("ARR", this.ARR);
        localStorage.setItem("SDF", this.SDF);
    }

    localStorageSupport() {
        return typeof (Storage) !== "undefined";
    }

    press(key) {
        let action = this.controls[key];

        // Ensure it's a valid key press
        if (!action) {
            return;
        }

        // Prevent event listener's repeat
        if (this.pressed[key]) {
            return;
        }
        this.pressed[key] = true;

        let move = this.moves[action];
        if (action === "left") {
            this.left(move);
        } else if (action === "right") {
            this.right(move);
        } else if (action === "down") {
            this.down(move);
        } else if (action === "undo") {
            this.undo(move);
        } else if (action === "redo") {
            this.redo(move);
        } else {
            this.game.update(move);
        }
    }

    release(key) {
        let action = this.controls[key];

        // validate
        if (!action) {
            return;
        }

        if (action === "left") {
            clearTimeout(this.leftInterval);
            clearInterval(this.leftInterval);
        } else if (action === "right") {
            clearTimeout(this.rightInterval);
            clearInterval(this.rightInterval);
        } else if (action === "down") {
            clearInterval(this.softDropInterval);
        } else if (action === "undo") {
            clearInterval(this.undoInterval);
        } else if (action === "redo") {
            clearInterval(this.redoInterval);
        }

        this.pressed[key] = false;
    }

    left(move) {
        clearTimeout(this.rightInterval);
        clearInterval(this.rightInterval);
        this.game.update(move);

        // If instant move to wall
        let ARR = this.ARR;
        if (ARR === 0) {
            move = { type: "leftWall" };
            ARR = 8;
        }

        this.leftInterval = setTimeout(() => {
            this.game.update(move);
            this.repeatLeft(move, ARR);
        }, this.DAS);

    }

    repeatLeft(move, ARR) {
        this.leftInterval = setInterval(() => {
            this.game.update(move);
        }, ARR);
    }

    right(move) {
        clearTimeout(this.leftInterval);
        clearInterval(this.leftInterval);
        this.game.update(move);

        // If instant move to wall
        let ARR = this.ARR;
        if (ARR === 0) {
            move = { type: "rightWall" };
            ARR = 8;
        }

        this.rightInterval = setTimeout(() => {
            this.game.update(move);
            this.repeatRight(move, ARR);
        }, this.DAS);
    }

    repeatRight(move, ARR) {
        this.rightInterval = setInterval(() => {
            this.game.update(move);
        }, ARR);
    }

    down(move) {
        let repeatRate = this.SDF;
        if (this.SDF === Infinity) {
            move = { type: "shiftFloor" };
            repeatRate = 8;
        }

        this.game.update(move);
        this.softDropInterval = setInterval(() => {
            this.game.update(move);
        }, repeatRate);
    }

    undo(move) {
        clearInterval(this.redoInterval);
        let repeatRate = 150;
        this.game.update(move);
        this.undoInterval = setInterval(() => {
            this.game.update(move);
        }, repeatRate);
    }

    redo(move) {
        clearInterval(this.undoInterval);
        let repeatRate = 150;
        this.game.update(move);
        this.redoInterval = setInterval(() => {
            this.game.update(move);

        }, repeatRate);
    }

    keybind(move) {
        // Find key from value
        return Object.keys(this.controls).find(key => this.controls[key] === move);
    }

    configureKeybind(move, newKey) {
        // Identify replaced key
        let oldKey = this.keybind(move);

        // Remove
        delete this.controls[oldKey];
        delete this.pressed[oldKey];

        // New keys
        this.controls[newKey] = move;
        this.pressed[newKey] = false;

        this.saveUserKeybindPreferences();
    }

    configureHandling(type, value) {
        if (type === "DAS") {
            this.DAS = value;
        } else if (type === "ARR") {
            this.ARR = value;
        } else if (type === "SDF") {
            this.SDF = value;
        }

        this.saveUserHandlingPreferences();
    }

}