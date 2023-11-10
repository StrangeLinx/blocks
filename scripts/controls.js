
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
            "Left": { type: "shift", x: -1, y: 0 },
            "Right": { type: "shift", x: 1, y: 0 },
            "Soft Drop": { type: "shift", x: 0, y: -1 },
            "Hard Drop": { type: "drop" },
            "Rotate CW": { type: "rot", r: 1 },
            "Rotate CCW": { type: "rot", r: -1 },
            "Rotate 180": { type: "rot", r: 2 },
            "Hold": { type: "hold" },
            "Restart": { type: "restart" },
            "Pause": { type: "pause" },
            "Undo": { type: "undo" },
            "Redo": { type: "redo" }
        };
    }

    loadUserKeybindPreferences() {
        // Check browser support
        if (!this.localStorageSupport()) {
            this.loadDefaultKeybinds();
            return;
        }

        let version = localStorage.getItem("version");

        if (version !== "1.1") {
            localStorage.setItem("version", "1.1");
            this.loadDefaultKeybinds();
            this.saveUserKeybindPreferences();
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
            "Left": "ArrowLeft",
            "Right": "ArrowRight",
            "Soft Drop": "ArrowDown",
            // Spacebar
            "Hard Drop": " ",
            "Rotate CW": "x",
            "Rotate CCW": "z",
            "Rotate 180": "a",
            "Hold": "c",
            "Restart": "r",
            "Pause": "Escape",
            "Undo": ["Control", "z"],
            "Redo": ["Control", "y"]
        };
        this.createPressed();
    }

    createPressed() {
        this.pressed = {};
        for (let control of Object.keys(this.controls)) {
            let currKeys = this.controls[control];
            if (Array.isArray(currKeys)) {
                for (let key of currKeys) {
                    this.pressed[key] = false;
                }
            }
            else {
                this.pressed[currKeys] = false;
            }
        }
    }

    /**
     * Determines whether the pressing of a key will result in a control being activated
     * Prioritizes controls which activate the most number of keys
     * For example, ctrl+z is prioritized over z
     * If so, it returns the activated control
     * Otherwise, returns false
     * @param {string} key 
     * @returns {string} control
     */
    getControl(key) {
        let highestLength = 0;
        let highest = false;
        for (let control of Object.keys(this.controls)) {
            let currKeys = this.controls[control];
            // If multiple keys must be pressed in order to execute the control, then
            // Only allow the control if the pressing of this key will result in all keys being pressed
            if (Array.isArray(currKeys)) {
                if (currKeys.length <= highestLength) {
                    continue;
                }
                if (currKeys.includes(key)) {
                    let allPressed = true;
                    for (let currKey of currKeys) {
                        if (currKey === key) {
                            continue;
                        }
                        if (!this.pressed[currKey]) {
                            allPressed = false;
                            break;
                        }
                    }
                    if (allPressed) {
                        highest = control;
                        highestLength = currKeys.length;
                    }
                }
                // Otherwise, if the current key is the input key, then return the control
            } else if (key == currKeys) {
                if (highestLength == 0) {
                    highest = control;
                    highestLength = 1;
                }
            }
        }
        return highest;
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

        if (!(key in this.pressed)) {
            return;
        }

        // Prevent event listener's repeat
        if (this.pressed[key]) {
            return;
        }
        this.pressed[key] = true;

        // Ensure it's a valid key press
        let action = this.getControl(key);
        if (!action) {
            return;
        }

        let move = this.moves[action];
        if (action === "Left") {
            this.left(move);
        } else if (action === "Right") {
            this.right(move);
        } else if (action === "Soft Drop") {
            this.down(move);
        } else if (action === "Undo") {
            this.undo(move);
        } else if (action === "Redo") {
            this.redo(move);
        } else {
            this.game.update(move);
        }
    }

    release(key) {
        if (!(key in this.pressed)) {
            return;
        }
        let action = this.getControl(key);

        this.pressed[key] = false;
        // validate
        if (!action) {
            return;
        }

        if (action === "Left") {
            clearTimeout(this.leftInterval);
            clearInterval(this.leftInterval);
        } else if (action === "Right") {
            clearTimeout(this.rightInterval);
            clearInterval(this.rightInterval);
        } else if (action === "Soft Drop") {
            clearInterval(this.softDropInterval);
        } else if (action === "Undo") {
            clearInterval(this.undoInterval);
        } else if (action === "Redo") {
            clearInterval(this.redoInterval);
        }


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
        return this.controls[move];
    }

    configureKeybind(move, newKey) {

        this.controls[move] = newKey;
        this.createPressed();

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