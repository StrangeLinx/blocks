import processImage from "./image.js";

export default class Menu {

    constructor(game, controls, display) {

        this.game = game;
        this.controls = controls;
        this.display = display;

        this.initMenus();
        this.addButtonClickEvents();
        this.addCurrentKeybindsToControlsMenu();
        this.addCurrentValuesToHandlingMenu();

        this.show(this.mainMenu);
        this.activeMenu = "main";
        this.directToGame = false;

        this.activeKeybindButton = "";
        this.maxQueueSize = 20;
    }

    initMenus() {
        // All menus
        this.mainMenu = document.querySelector("#main-menu");
        this.changeModeMenu = document.querySelector("#change-mode-menu");
        this.settingsMenu = document.querySelector("#settings-menu");
        this.controlsMenu = document.querySelector("#controls-menu");
        this.handlingMenu = document.querySelector("#handling-menu");
        this.restoreMenu = document.querySelector("#restore-menu");
        this.resultsMenu = document.querySelector("#results-menu");
        this.editQueueMenu = document.querySelector("#edit-queue-menu");
        this.lookaheadReadyMenu = document.querySelector("#lookahead-ready-menu");
        this.finesseTipComment = document.querySelector("#finesse-tip-comment");

        // Main menu
        this.playButton = document.querySelector(".play-button");
        this.changeModeButton = document.querySelector(".change-mode-button");
        this.settingsButton = document.querySelector(".settings-button");
        this.uploadButton = document.getElementById("load-file");

        // Change Mode menu
        this.freeButton = document.querySelector(".free-button");
        this.b2bButton = document.querySelector(".b2b-button");
        this.lookButton = document.querySelector(".lookahead-button");
        this.finesseButton = document.querySelector(".finesse-button");
        this.sprintButton = document.querySelector(".sprint-button");
        this.changeModeDoneButton = document.querySelector(".change-mode-done");

        // Settings menu
        this.controlsButton = document.querySelector(".controls-button");
        this.handlingButton = document.querySelector(".handling-button");
        this.restoreButton = document.querySelector(".restore-button");
        this.settingsDoneButton = document.querySelector(".settings-done-button");

        // In game
        this.gameMenuButton = document.querySelector(".game-menu-button");
        this.gameSettingsButton = document.querySelector(".game-settings-button");

        // Look ahead ready menu
        this.lookaheadPiecesBottomInput = document.querySelector("#lookahead-pieces-input");

        // Control Menu
        this.keybindButtons = document.querySelectorAll(".keybind-option");
        this.controlsDoneButton = document.querySelector(".controls-done");

        // Handling Menu
        this.DASInput = document.querySelector("#DAS");
        this.ARRInput = document.querySelector("#ARR");
        this.SDFInput = document.querySelector("#SDF");
        this.handlingDoneButton = document.querySelector(".handling-done");

        // Restore Menu
        this.restoreDropButton = document.querySelector(".restore-on-drop");
        this.restoreMoveButton = document.querySelector(".restore-on-move");
        this.restoreDoneButton = document.querySelector(".restore-done");

        // In-game edit queue menu
        this.queueSizeInput = document.querySelector("#queue-size");
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
        this.playButton.addEventListener("click", () => {
            this.hide(this.mainMenu);
            this.activeMenu = "";
            this.game.play();
        });

        this.changeModeButton.addEventListener("click", () => {
            this.hide(this.mainMenu);
            this.activeMenu = "changeMode";
            this.show(this.changeModeMenu);
        });

        this.settingsButton.addEventListener("click", () => {
            this.hide(this.mainMenu);
            this.activeMenu = "settings";
            this.show(this.settingsMenu);
        });

        this.uploadButton.addEventListener("change", ev => this.loadGameFromImage(ev));

        // Change mode menu
        this.freeButton.addEventListener("click", ev => this.updateGameModeFromMenu(ev.target));
        this.b2bButton.addEventListener("click", ev => this.updateGameModeFromMenu(ev.target));
        this.lookButton.addEventListener("click", ev => this.updateGameModeFromMenu(ev.target));
        this.finesseButton.addEventListener("click", ev => this.updateGameModeFromMenu(ev.target));
        this.sprintButton.addEventListener("click", ev => this.updateGameModeFromMenu(ev.target));
        this.changeModeDoneButton.addEventListener("click", () => {
            this.hide(this.changeModeMenu);
            this.activeMenu = "main";
            this.show(this.mainMenu);
        });

        // Settings menu
        this.controlsButton.addEventListener("click", () => {
            this.hide(this.settingsMenu);
            this.activeMenu = "controls";
            this.show(this.controlsMenu);
        });

        this.handlingButton.addEventListener("click", () => {
            this.hide(this.settingsMenu);
            this.activeMenu = "handling";
            this.show(this.handlingMenu);
        });

        this.restoreButton.addEventListener("click", () => {
            this.hide(this.settingsMenu);
            this.activeMenu = "restore";
            this.show(this.restoreMenu);
        });

        this.settingsDoneButton.addEventListener("click", () => this.hideSettings());

        // In Game
        this.gameMenuButton.addEventListener("click", ev => {
            // Note to future Gamers:
            // if you remove this line, there will be a bug with element being clicked when spacebar is pressed
            this.gameMenuButton.blur();
            if (this.activeMenu === "lookReady") {
                this.game.pause();
                this.lookaheadReadyMenu.style.gridArea = "none";
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

        this.gameSettingsButton.addEventListener("click", () => {
            this.gameSettingsButton.blur();
            if (this.activeMenu === "lookReady") {
                this.game.pause();
                this.lookaheadReadyMenu.style.gridArea = "none";
                this.hide(this.lookaheadReadyMenu);
                this.directToGame = true;
                this.show(this.settingsMenu);
                this.activeMenu = "settings";
                return;
            }

            if (this.activeMenu) {
                return;
            }

            this.game.pause();

            this.directToGame = true;
            this.show(this.settingsMenu);
            this.activeMenu = "settings";
        });

        // Lookahead ready menu
        this.lookaheadPiecesBottomInput.addEventListener("blur", () => this.validateAndChange());

        // Controls Menu
        this.controlsDoneButton.addEventListener("click", () => this.hideControls());

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
            this.show(this.settingsMenu);
            this.activeMenu = "settings";
        });

        // Restore (Undo / Redo) preferences
        this.loadUserRestorePreference();
        this.restoreDropButton.addEventListener("click", ev => {
            this.game.undoOnDrop = true;
            this.restoreDropButton.classList.add("user-choice");
            this.restoreMoveButton.classList.remove("user-choice");

            if (this.controls.localStorageSupport) {
                localStorage.setItem("restore", "drop");
            }
        });
        this.restoreMoveButton.addEventListener("click", ev => {
            this.game.undoOnDrop = false;
            this.restoreMoveButton.classList.add("user-choice");
            this.restoreDropButton.classList.remove("user-choice");

            if (this.controls.localStorageSupport) {
                localStorage.setItem("restore", "move");
            }
        });
        this.restoreDoneButton.addEventListener("click", ev => {
            this.hide(this.restoreMenu);
            this.activeMenu = "settings";
            this.show(this.settingsMenu);
        });

        // Edit Queue
        this.holdInput.addEventListener("blur", ev => this.updateQueue(ev, true));
        this.nextInput.addEventListener("blur", ev => this.updateQueue(ev, false));
        this.queueSizeInput.addEventListener("blur", () => this.updateQueueSize());
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

    updateQueueSize() {
        let size = Number(this.queueSizeInput.value);

        if (!this.validateQueueSize(size)) {
            this.queueSizeInput.classList.add("invalid");
            return;
        }

        this.queueSizeInput.classList.remove("invalid");
        this.game.updateQueueSize(size);
    }

    validateQueueSize(size) {
        if (!Number.isInteger(size)) {
            return false;
        }
        if (size < 0) {
            return false;
        }
        if (size > this.maxQueueSize) {
            return false;
        }
        return true;
    }

    validateAndChange() {
        let pieceInput = this.lookaheadPiecesBottomInput;

        let adtEasterEgg = pieceInput.value.toLowerCase() === "adt";
        let valid = this.validateLookahead(pieceInput) || adtEasterEgg;
        if (!valid) {
            pieceInput.classList.add("invalid");
            return;
        }

        pieceInput.classList.remove("invalid");

        let numPieces;
        if (adtEasterEgg) {
            numPieces = 1;
        } else {
            numPieces = Number(pieceInput.value);
        }

        this.game.setLookaheadPieces(numPieces);
        if (numPieces > this.game.bag.queueSize) {
            this.queueSizeInput.value = numPieces;
            this.updateQueueSize();
        }
    }

    addCurrentKeybindsToControlsMenu() {
        for (let i = 0; i < this.keybindButtons.length; i++) {
            let span = this.keybindButtons[i].querySelector("span");
            let key = this.controls.keybind(this.keybindButtons[i].id);

            // When key is space, make it apparent
            if (key === " ") {
                key = "space";
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
        let piecesToPlace = this.game.mode.remainingLookaheadPieces();
        this.lookaheadPiecesBottomInput.value = piecesToPlace;
    }

    addCurrentValuesToHandlingMenu() {
        this.DASInput.value = this.controls.DAS;
        this.ARRInput.value = this.controls.ARR;
        this.SDFInput.value = this.controls.SDF;
    }

    validateLookahead(pieceInput) {
        const MAXLOOKAHEAD = this.maxQueueSize + 1;
        let pieces = Number(pieceInput.value);

        if (!(Number.isInteger(pieces) && 2 <= pieces && pieces <= MAXLOOKAHEAD)) {
            return false;
        }
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

    loadUserRestorePreference() {
        let restorePreference;

        // Retrieve user preference
        if (this.controls.localStorageSupport()) {
            restorePreference = localStorage.getItem("restore");
        }

        // Default restore option
        if (!restorePreference) {
            restorePreference = "drop";
        }

        if (restorePreference === "drop") {
            this.game.undoOnDrop = true;
            this.restoreDropButton.classList.add("user-choice");
            this.restoreMoveButton.classList.remove("user-choice");
        } else {
            this.game.undoOnDrop = false;
            this.restoreMoveButton.classList.add("user-choice");
            this.restoreDropButton.classList.remove("user-choice");
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
        this.lookaheadReadyMenu.style.gridArea = "comment";
        this.show(this.lookaheadReadyMenu);
        this.activeMenu = "lookReady";
    }

    showFinesseTipComment() {
        this.finesseTipComment.style.gridArea = "comment";
        this.finesseTipComment.innerHTML = this.game.getFinesseTip();
        this.show(this.finesseTipComment);
    }

    hideFinesseTipComment() {
        this.finesseTipComment.style.gridArea = "none";
        this.hide(this.finesseTipComment);
    }

    showEditQueue() {
        if (this.activeMenu === "lookReady") {
            this.game.pause();
            this.lookaheadReadyMenu.style.gridArea = "none";
            this.hide(this.lookaheadReadyMenu);
        }

        this.addQueueSizeToMenu();
        this.addHoldPieceToMenu();
        this.addNextPiecesToMenu();
        this.show(this.editQueueMenu);
        this.activeMenu = "editQueue";
    }

    addQueueSizeToMenu() {
        let size = this.game.bag.queueSize;
        this.queueSizeInput.value = size;
        this.queueSizeInput.classList.remove("invalid");
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

    hideSettings() {
        if (this.directToGame) {
            this.hide(this.settingsMenu);
            this.activeMenu = "";
            this.directToGame = false;
            this.game.play();
        } else {
            this.hide(this.settingsMenu);
            this.activeMenu = "main";
            this.show(this.mainMenu);
        }
    }

    hideControls() {
        if (this.activeKeybindButton) {
            this.activeKeybindButton.classList.remove("pending-user-input");
            this.activeKeybindButton = "";
        }
        this.hide(this.controlsMenu);
        this.activeMenu = "settings";
        this.show(this.settingsMenu);
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
            this.lookaheadReadyMenu.style.gridArea = "none";
            this.hide(this.lookaheadReadyMenu);
            this.game.mode.menuPause = false; // Prevent showing instructions menu twice. Already showing menu.
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
            this.holdInput === e || this.nextInput === e || this.lookaheadPiecesBottomInput === e;
    }

    previousScreen() {
        if (this.activeMenu === "main") {
            this.hide(this.mainMenu);
            this.activeMenu = "";
            this.game.play();
        }

        else if (this.activeMenu === "changeMode") {
            this.hide(this.changeModeMenu);
            this.activeMenu = "main";
            this.show(this.mainMenu);
        }

        else if (this.activeMenu === "settings") {
            this.hideSettings();
        }

        else if (this.activeMenu === "controls") {
            this.hideControls();
        }

        else if (this.activeMenu === "handling") {
            this.hide(this.handlingMenu);
            this.show(this.settingsMenu);
            this.activeMenu = "settings";
        }

        else if (this.activeMenu === "restore") {
            this.hide(this.restoreMenu);
            this.activeMenu = "settings";
            this.show(this.settingsMenu);
        }

        else if (this.activeMenu === "results") {
            this.hide(this.resultsMenu);
            this.activeMenu = "";
            this.game.new(true);
            this.game.play();
        }

        else if (this.activeMenu === "editQueue") {
            this.hide(this.editQueueMenu);
            this.activeMenu = "";
            this.game.play();
        }
    }

    active() {
        return this.activeMenu;
    }

    updateGameModeFromMenu(buttonPressed) {
        // Reset statuses
        this.freeButton.classList.remove("user-choice");
        this.b2bButton.classList.remove("user-choice");
        this.lookButton.classList.remove("user-choice");
        this.finesseButton.classList.remove("user-choice");
        this.sprintButton.classList.remove("user-choice");

        buttonPressed.classList.add("user-choice");

        this.game.updateMode(buttonPressed.id);
    }

    async loadGameFromImage(ev) {
        const [grid, hold, next] = await processImage(ev.target.files[0]);
        this.game.load(grid, hold, next);
    }
}