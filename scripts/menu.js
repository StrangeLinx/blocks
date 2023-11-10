
export default class Menu {

    constructor(game, controls) {

        this.game = game;
        this.controls = controls;

        this.initMenus();
        this.addButtonClickEvents();
        this.addCurrentKeybindsToControlsMenu();
        this.addCurrentValuesToHandlingMenu();

        this.show(this.mainMenu);
        this.activeMenu = "main";
        this.directToGame = false;

        this.activeKeybindButton = "";
    }

    initMenus() {
        this.mainMenu = document.querySelector("#main-menu");
        this.controlsMenu = document.querySelector("#controls-menu");
        this.handlingMenu = document.querySelector("#handling-menu");
        this.resultsMenu = document.querySelector("#results-menu");
        this.editQueueMenu = document.querySelector("#edit-queue-menu");
        this.lookMenu = document.querySelector("#look-menu");
        this.lookaheadReadyMenu = document.querySelector("#lookahead-ready-menu");

        // Main menu
        this.freeButton = document.querySelector(".free-button");
        this.sprintButton = document.querySelector(".sprint-button");
        this.b2bButton = document.querySelector(".b2b-button");
        this.controlsButton = document.querySelector(".controls-button");
        this.handlingButton = document.querySelector(".handling-button");
        this.lookButton = document.querySelector(".lookahead-button");

        // In game
        this.gameMenuButton = document.querySelector(".game-menu-button");
        this.gameControlsButton = document.querySelector(".game-controls-button");

        // Look ahead menu
        this.lookaheadPiecesInput = document.querySelector("#lookahead");
        this.lookaheadPlayButton = document.querySelector(".lookahead-play");
        this.lookaheadInstructions = document.querySelector(".lookahead-instructions");

        // Control Menu
        this.keybindButtons = document.querySelectorAll(".keybind-option");
        this.controlsDoneButton = document.querySelector(".controls-done");

        // Handling Menu
        this.DASInput = document.querySelector("#DAS");
        this.ARRInput = document.querySelector("#ARR");
        this.SDFInput = document.querySelector("#SDF");
        this.handlingDoneButton = document.querySelector(".handling-done");

        // In-game edit queue menu
        this.holdInput = document.querySelector("#hold-queue");
        this.nextInput = document.querySelector("#next-queue");
        this.editQueueDoneButton = document.querySelector(".edit-queue-done");

        // Results Menu
        this.resultItems = document.querySelectorAll(".result-item");
        this.resultsRetryButton = document.querySelector(".result-retry");
        this.resultsMenuButton = document.querySelector(".result-menu");
    }

    addButtonClickEvents() {
        // Main menu
        this.freeButton.addEventListener("click", ev => {
            this.hide(this.mainMenu);
            this.activeMenu = "";
            this.game.play("free");
        });

        this.sprintButton.addEventListener("click", ev => {
            this.hide(this.mainMenu);
            this.activeMenu = "";
            this.game.play("sprint");
        });

        this.b2bButton.addEventListener("click", ev => {
            this.hide(this.mainMenu);
            this.activeMenu = "";
            this.game.play("b2b");
        });

        this.lookButton.addEventListener("click", ev => {
            this.hide(this.mainMenu);
            this.show(this.lookMenu);
            this.game.updateMode("lookahead");
            this.game.new(); // Ensure new game every time
            this.activeMenu = "look";
        });

        this.controlsButton.addEventListener("click", ev => {
            this.hide(this.mainMenu);
            this.show(this.controlsMenu);
            this.activeMenu = "controls";
        });

        this.handlingButton.addEventListener("click", ev => {
            this.hide(this.mainMenu);
            this.show(this.handlingMenu);
            this.activeMenu = "handling";
        });


        // In Game
        this.gameMenuButton.addEventListener("click", ev => {
            if (this.activeMenu === "lookReady") {
                this.game.pause();
                this.hide(this.lookaheadReadyMenu);
                this.show(this.mainMenu);
                this.activeMenu = "main";
                return;
            }

            // If another menu open ignore
            if (this.activeMenu) {
                return;
            }

            this.game.pause();

            this.show(this.mainMenu);
            this.activeMenu = "main";
        });

        this.gameControlsButton.addEventListener("click", ev => {
            if (this.activeMenu === "lookReady") {
                this.game.pause();
                this.hide(this.lookaheadReadyMenu);
                this.directToGame = true;
                this.show(this.controlsMenu);
                this.activeMenu = "controls";
                return;
            }

            if (this.activeMenu) {
                return;
            }

            this.game.pause();

            this.directToGame = true;
            this.show(this.controlsMenu);
            this.activeMenu = "controls";
        });


        // Lookahead menu
        this.lookaheadPiecesInput.addEventListener("blur", ev => this.validateLookahead(ev));
        this.lookaheadPlayButton.addEventListener("click", ev => {
            if (!this.validateLookahead(ev)) {
                return;
            }

            let numLookaheadPieces = Number(this.lookaheadPiecesInput.value);
            this.game.setLookaheadPieces(numLookaheadPieces);

            this.hide(this.lookMenu);
            this.showLookaheadReadyMenu();
        });


        // Controls Manu
        this.controlsDoneButton.addEventListener("click", ev => {
            this.hideControls();
        });

        for (let i = 0; i < this.keybindButtons.length; i++) {
            this.keybindButtons[i].addEventListener("click", ev => {
                // Allow only 1 active keybind configure at a time
                if (this.activeKeybindButton) {
                    this.activeKeybindButton.classList.remove("pending-user-input");
                }
                this.activeKeybindButton = this.keybindButtons[i];
                this.keybindButtons[i].classList.add("pending-user-input");
            });
        }

        // Handling
        this.DASInput.addEventListener("blur", ev => this.updateHandling(ev));
        this.ARRInput.addEventListener("blur", ev => this.updateHandling(ev));
        this.SDFInput.addEventListener("blur", ev => this.updateHandling(ev));
        this.handlingDoneButton.addEventListener("click", ev => {
            this.hide(this.handlingMenu);
            this.show(this.mainMenu);
            this.activeMenu = "main";
        });

        // Edit Queue
        this.holdInput.addEventListener("blur", ev => this.updateQueue(ev, true));
        this.nextInput.addEventListener("blur", ev => this.updateQueue(ev, false));
        this.editQueueDoneButton.addEventListener("click", ev => {
            this.hide(this.editQueueMenu);
            this.activeMenu = "";
            this.game.play();
        });

        // Results
        this.resultsRetryButton.addEventListener("click", () => {
            this.hide(this.resultsMenu);
            this.activeMenu = "";
            this.game.restart();
        });

        this.resultsMenuButton.addEventListener("click", () => {
            this.hide(this.resultsMenu);
            this.show(this.mainMenu);
            this.activeMenu = "main";
        });
    }

    addCurrentKeybindsToControlsMenu() {
        for (let i = 0; i < this.keybindButtons.length; i++) {
            let span = this.keybindButtons[i].querySelector("span");
            let key = this.controls.keybind(this.keybindButtons[i].id);

            // When key is space, make it apparent
            if (key === " ") {
                key = "Space";
            }

            span.innerHTML = key;

            if (key === undefined) {
                span.classList.add("invalid");
            } else {
                span.classList.remove("invalid");
            }
        }
    }

    populateLookaheadReadyMenu() {
        let piecesToPlace = this.game.mode.numLookaheadPieces - this.game.piecesPlaced % this.game.mode.numLookaheadPieces;
        this.lookaheadInstructions.innerHTML = `Get ready to place ${piecesToPlace} pieces.`;
    }

    addCurrentValuesToHandlingMenu() {
        this.DASInput.value = this.controls.DAS;
        this.ARRInput.value = this.controls.ARR;
        this.SDFInput.value = this.controls.SDF;
    }

    validateLookahead(ev) {
        const MAXLOOKAHEAD = 6;
        let pieces = Number(this.lookaheadPiecesInput.value);
        if (!(Number.isInteger(pieces) && 2 <= pieces && pieces <= MAXLOOKAHEAD)) {
            this.lookaheadPiecesInput.classList.add("invalid");
            return false;
        }

        this.lookaheadPiecesInput.classList.remove("invalid");
        return true;
    }

    updateHandling(ev) {
        let value = ev.target.value;
        if (value === "") {
            // use defaults
            this.controls.configureHandling(ev.target.id, Number(ev.target.placeholder));
            ev.target.classList.remove("invalid");
        }
        // validate
        else if (isNaN(value)) {
            ev.target.classList.add("invalid");
        } else {
            this.controls.configureHandling(ev.target.id, Number(value));
            ev.target.classList.remove("invalid");
        }

    }

    updateQueue(ev, hold) {

        let value = ev.target.value.toLowerCase();

        // Validate length, hold queue only allows 0 or 1
        if (hold && value.length > 1) {
            ev.target.classList.add("invalid");
            return;
        }

        // Validate string contains only oiljstz
        let allowable = "oiljstz";
        for (let i = 0; i < value.length; i++) {
            if (!allowable.includes(value[i])) {
                ev.target.classList.add("invalid");
                return;
            }
        }

        // Add to queue
        ev.target.classList.remove("invalid");
        if (hold) {
            this.game.update({
                type: "editHold",
                piece: value
            });
        } else {
            this.game.update({
                type: "editNext",
                pieces: value
            });
        }
    }

    show(menu) {
        menu.style.display = "flex";
    }

    showMain() {
        if (this.activeMenu) {
            return;
        }

        this.mainMenu.style.display = "flex";
        this.activeMenu = "main";
    }

    showLookaheadReadyMenu() {
        this.populateLookaheadReadyMenu();
        this.show(this.lookaheadReadyMenu);
        this.activeMenu = "lookReady";
    }

    showEditQueue() {
        this.addHoldPieceToMenu();
        this.addNextPiecesToMenu();
        this.show(this.editQueueMenu);
        this.activeMenu = "editQueue";
    }

    addHoldPieceToMenu() {
        let hold = this.game.getHoldPiece();
        this.holdInput.value = hold.type ? hold.type : "";
        this.holdInput.classList.remove("invalid");
    }

    addNextPiecesToMenu() {
        let next = this.game.getAllNextPieces();
        let nextQueue = "";
        for (let i = 0; i < next.length; i++) {
            nextQueue += next[i].type;
        }
        this.nextInput.value = nextQueue;
        this.nextInput.classList.remove("invalid");
    }

    hide(menu) {
        menu.style.display = "none";
    }

    showResults(results) {
        for (let i = 0; i < results.length; i++) {
            this.resultItems[i].innerHTML = results[i];
        }
        this.show(this.resultsMenu);
        this.activeMenu = "results";
    }

    hideControls() {
        if (this.activeKeybindButton) {
            this.activeKeybindButton.classList.remove("pending-user-input");
            this.activeKeybindButton = "";
        }
        if (this.directToGame) {
            this.hide(this.controlsMenu);
            this.activeMenu = "";
            this.directToGame = false;
            this.game.play();
        } else {
            this.hide(this.controlsMenu);
            this.show(this.mainMenu);
            this.activeMenu = "main";
        }
    }

    press(key) {
        if (this.activeKeybindButton) {
            this.controls.configureKeybind(this.activeKeybindButton.id, key);
            this.activeKeybindButton.classList.remove("pending-user-input");
            this.activeKeybindButton = "";
            this.addCurrentKeybindsToControlsMenu();
            this.unfocusKeybindOption();
        } else if (this.inputFocused()) {
            // Prevent previous screen if a user is typing
            // User is permitted to have restart set to "i". This prevents potential interruption when typing into an input field
            return;
        } else if (this.activeMenu === "lookReady") {
            this.hide(this.lookaheadReadyMenu);
            this.game.play();
            this.controls.press(key);
            this.activeMenu = "";
        } else if (key === this.controls.keybind("Pause")) {
            this.previousScreen();
        } else if (key === this.controls.keybind("Restart")) {
            this.game.new(true);
            while (this.activeMenu) {
                this.previousScreen();
            }
        }
    }

    unfocusKeybindOption() {
        // Ensure button is unfocused - "space" focuses element
        let e = document.activeElement;
        if (e.classList.value.includes("keybind-option")) {
            e.blur();
        }
    }

    inputFocused() {
        let e = document.activeElement;
        return this.DASInput === e || this.ARRInput === e || this.SDFInput === e ||
            this.holdInput === e || this.nextInput === e || this.lookaheadPiecesInput === e;
    }

    previousScreen() {
        if (this.activeMenu === "main") {
            this.hide(this.mainMenu);
            this.activeMenu = "";
            this.game.play();
        } else if (this.activeMenu === "controls") {
            this.hideControls();
        } else if (this.activeMenu === "handling") {
            this.hide(this.handlingMenu);
            this.show(this.mainMenu);
            this.activeMenu = "main";
        } else if (this.activeMenu === "results") {
            this.hide(this.resultsMenu);
            this.activeMenu = "";
            this.game.new(true);
            this.game.play();
        } else if (this.activeMenu === "editQueue") {
            this.hide(this.editQueueMenu);
            this.activeMenu = "";
            this.game.play();
        } else if (this.activeMenu === "look") {
            this.hide(this.lookMenu);
            this.show(this.mainMenu);
            this.activeMenu = "main";
        }
    }

    active() {
        return this.activeMenu;
    }
}