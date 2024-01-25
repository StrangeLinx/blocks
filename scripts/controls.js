
export default class Controls {

    constructor(game) {

        this.game = game;

        this.createIntervalGlobals();
        this.createMoves();
        this.loadUserKeybindPreferences();
        this.loadUserHandlingPreferences();
        this.newKeySequence();

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
            "Redo": { type: "redo" },
            "Fill Type O": { type: "fill", pieceType: "o" },
            "Fill Type I": { type: "fill", pieceType: "i" },
            "Fill Type L": { type: "fill", pieceType: "l" },
            "Fill Type J": { type: "fill", pieceType: "j" },
            "Fill Type S": { type: "fill", pieceType: "s" },
            "Fill Type T": { type: "fill", pieceType: "t" },
            "Fill Type Z": { type: "fill", pieceType: "z" },
            "Fill Type G": { type: "fill", pieceType: "g" },
        };
    }

    loadUserKeybindPreferences() {
        // Check browser support
        if (!this.localStorageSupport()) {
            this.loadDefaultKeybinds();
            return;
        }

        let version = localStorage.getItem("version");

        if (version !== "1.3") {
            localStorage.setItem("version", "1.3");
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
            "Left": "arrowleft",
            "Right": "arrowright",
            "Soft Drop": "arrowdown",
            // Spacebar
            "Hard Drop": " ",
            "Rotate CW": "x",
            "Rotate CCW": "z",
            "Rotate 180": "a",
            "Hold": "c",
            "Restart": "r",
            "Pause": "escape",
            "Undo": ["control", "z"],
            "Redo": ["control", "y"],
            "Fill Type O": ["alt", "o"],
            "Fill Type I": ["alt", "i"],
            "Fill Type L": ["alt", "l"],
            "Fill Type J": ["alt", "j"],
            "Fill Type S": ["alt", "s"],
            "Fill Type T": ["alt", "t"],
            "Fill Type Z": ["alt", "z"],
            "Fill Type G": ["alt", "g"],
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

    newKeySequence() {
        this.keySequence = {
            keyPresses: 0,
            sequence: []
        };
    }

    press(ev) {

        let key = ev.key.toLowerCase();

        if (!(key in this.pressed)) {
            return;
        }

        // Prevent event listener's repeat
        if (this.pressed[key]) {
            return;
        }
        this.pressed[key] = true;

        // Ensure there's a valid action relating to keys pressed
        let action = this.getControl(key);
        if (!action) {
            return;
        }

        // Prevent default browser actions when key is mapped
        // Ex: Prevent Shift + Right key combo to highlight
        //     Prevent Slash (/) in FireFox from opening Quick find (if key is mapped)
        ev.preventDefault();

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
            this.addKeySequence(action);
            this.game.update(move);
        }
    }

    addKeySequence(action) {
        // Reset sequence on a gameflow action or when "Holding" piece
        if (action === "Restart" || action === "Pause" || action === "Hold") {
            this.newKeySequence();
        }
        else if (action === "Hard Drop") {
            this.game.keySequence = this.keySequence;
            this.newKeySequence();
        }
        else {
            this.keySequence.keyPresses++;
            this.keySequence.sequence.push(action);
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
        this.addKeySequence("Left");
        this.game.update(move);

        // If instant move to wall
        let ARR = this.ARR;
        if (ARR === 0) {
            move = { type: "leftWall" };
            ARR = 8;
        }

        this.leftInterval = setTimeout(() => {
            // Not addKeySequence("LeftDAS") since not pressing additional keys
            // LeftDAS occurs when player holds key
            this.keySequence.sequence.push("LeftDAS");
            this.game.update(move);
            this.repeatLeft(move, ARR);
        }, this.DAS);

    }

    repeatLeft(move, ARR) {
        this.leftInterval = setInterval(() => {
            if (!this.keySequence.sequence.includes("LeftDAS")) {
                this.keySequence.sequence.push("LeftDAS");
            }
            this.game.update(move);
        }, ARR);
    }

    right(move) {
        clearTimeout(this.leftInterval);
        clearInterval(this.leftInterval);
        this.addKeySequence("Right");
        this.game.update(move);

        // If instant move to wall
        let ARR = this.ARR;
        if (ARR === 0) {
            move = { type: "rightWall" };
            ARR = 8;
        }

        this.rightInterval = setTimeout(() => {
            this.keySequence.sequence.push("RightDAS");
            this.game.update(move);
            this.repeatRight(move, ARR);
        }, this.DAS);
    }

    repeatRight(move, ARR) {
        this.rightInterval = setInterval(() => {
            if (!this.keySequence.sequence.includes("RightDAS")) {
                this.keySequence.sequence.push("RightDAS");
            }
            this.game.update(move);
        }, ARR);
    }

    down(move) {
        let repeatRate = this.SDF;
        if (this.SDF === Infinity) {
            move = { type: "shiftFloor" };
            repeatRate = 8;
        }

        this.addKeySequence("Soft Drop");
        this.game.update(move);
        this.softDropInterval = setInterval(() => {
            if (!this.keySequence.sequence.includes("Soft Drop Repeat")) {
                this.keySequence.sequence.push("Soft Drop Repeat");
            }
            this.game.update(move);
        }, repeatRate);
    }

    undo(move) {
        clearInterval(this.redoInterval);
        let repeatRate = 150;
        this.newKeySequence();
        this.game.update(move);
        this.undoInterval = setInterval(() => {
            this.game.update(move);
        }, repeatRate);
    }

    redo(move) {
        clearInterval(this.undoInterval);
        let repeatRate = 150;
        this.newKeySequence();
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