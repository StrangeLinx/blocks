import processImage from "./image.js";

export default class Menu {

    constructor(game, controls, display) {

        this.game = game;
        this.controls = controls;
        this.display = display;

        this.createMenus();
        this.bindMenuEvents();
        this.addCurrentKeybindsToControlsMenu();
        this.addCurrentValuesToHandlingMenu();

        this.show(this.mainMenu);
        this.activeMenu = "main";
        this.directToGame = false;

        this.activeKeybindButton = "";
        this.maxQueueSize = 20;
    }

    createMenus() {
        this.createMainMenu();
        this.createChangeModeMenu();
        this.createModePreferenceMenu();
        this.createGarbageSettingsMenu();
        this.createSettingsMenu();
        this.createControlsMenu();
        this.createHandlingMenu();
        this.createRestoreMenu();
        this.createResultsMenu();
        this.createEditQueueMenu();
        this.createLookaheadReadyMenu();
        this.createInGameElements();
    }

    createMainMenu() {
        this.mainMenu = document.querySelector("#main-menu");
        // Options
        this.playButton = document.querySelector(".play-button");
        this.changeModeButton = document.querySelector(".change-mode-button");
        this.settingsButton = document.querySelector(".settings-button");
        this.uploadButton = document.getElementById("load-file");
    }

    createChangeModeMenu() {
        this.changeModeMenu = document.querySelector("#change-mode-menu");
        this.freeButton = document.querySelector(".free-button");
        this.b2bButton = document.querySelector(".b2b-button");
        this.lookButton = document.querySelector(".lookahead-button");
        this.finesseButton = document.querySelector(".finesse-button");
        this.sprintButton = document.querySelector(".sprint-button");
        this.modePreferenceButton = document.querySelector(".mode-preference-button");
        this.changeModeDoneButton = document.querySelector(".change-mode-done");
    }

    createModePreferenceMenu() {
        this.modePreferenceMenu = document.querySelector("#mode-preference-menu");
        this.modeGarbageSettingsButton = document.querySelector(".mode-garbage-settings");
        this.autocolorButton = document.querySelector(".autocolor");
        this.lookaheadShowQueueButton = document.querySelector(".lookahead-show-queue");
        this.finesseRequire180Button = document.querySelector(".finesse-require-180-button");
        this.modePreferenceDoneButton = document.querySelector(".mode-preference-done");
    }

    createGarbageSettingsMenu() {
        this.garbageSettingsMenu = document.querySelector("#garbage-settings-menu");
        this.cheeseLayerButton = document.querySelector(".garbage-cheese-layer-container");
        this.cheeseLayerInput = document.querySelector("#garbage-cheese-layer");
        this.APSButton = document.querySelector(".garbage-APS-container");
        this.APSAttackInput = document.querySelector("#APS-attack");
        this.APSSecondInput = document.querySelector("#APS-second");
        this.backfireButton = document.querySelector(".garbage-backfire-container");
        this.backfireInput = document.querySelector("#garbage-backfire");
        this.comboBlockingButton = document.querySelector(".combo-blocking");
        this.cheesinessInput = document.querySelector("#cheesiness");
        this.garbageSettingsDoneButton = document.querySelector(".garbage-settings-done");
    }

    createSettingsMenu() {
        this.settingsMenu = document.querySelector("#settings-menu");
        this.controlsButton = document.querySelector(".controls-button");
        this.handlingButton = document.querySelector(".handling-button");
        this.garbageSettingsButton = document.querySelector(".garbage-settings");
        this.restoreButton = document.querySelector(".restore-button");
        this.settingsDoneButton = document.querySelector(".settings-done-button");
    }

    createControlsMenu() {
        this.controlsMenu = document.querySelector("#controls-menu");
        this.keybindButtons = document.querySelectorAll(".keybind-option");
        this.controlsDoneButton = document.querySelector(".controls-done");
    }

    createHandlingMenu() {
        this.handlingMenu = document.querySelector("#handling-menu");
        this.DASInput = document.querySelector("#DAS");
        this.ARRInput = document.querySelector("#ARR");
        this.SDFInput = document.querySelector("#SDF");
        this.handlingDoneButton = document.querySelector(".handling-done");
    }

    createRestoreMenu() {
        this.restoreMenu = document.querySelector("#restore-menu");
        this.restoreDropButton = document.querySelector(".restore-on-drop");
        this.restoreMoveButton = document.querySelector(".restore-on-move");
        this.restoreDoneButton = document.querySelector(".restore-done");
    }

    createResultsMenu() {
        this.resultsMenu = document.querySelector("#results-menu");
        this.resultItems = document.querySelectorAll(".result-item");
        this.resultsRetryButton = document.querySelector(".result-retry");
        this.resultsMenuButton = document.querySelector(".result-menu");
    }

    createEditQueueMenu() {
        this.editQueueMenu = document.querySelector("#edit-queue-menu");
        this.queueSizeInput = document.querySelector("#queue-size");
        this.holdInput = document.querySelector("#hold-queue");
        this.nextInput = document.querySelector("#next-queue");
        this.editQueueDoneButton = document.querySelector(".edit-queue-done");
    }

    createLookaheadReadyMenu() {
        this.lookaheadReadyMenu = document.querySelector("#lookahead-ready-menu");
        this.lookaheadPiecesBottomInput = document.querySelector("#lookahead-pieces-input");
    }

    createInGameElements() {
        this.finesseTipComment = document.querySelector("#finesse-tip-comment");
        this.gameMenuButton = document.querySelector(".game-menu-button");
        this.gameSettingsButton = document.querySelector(".game-settings-button");
    }

    bindMenuEvents() {
        this.bindMainMenuEvents();
        this.bindChangeModeMenuEvents();
        this.bindModePreferenceMenuEvents();
        this.bindGarbageSettingsMenuEvents();
        this.bindSettingsMenuEvents();
        this.bindControlsMenuEvents();
        this.bindHandlingMenuEvents();
        this.bindRestoreMenuEvents();
        this.bindResultsMenuEvents();
        this.bindEditQueueMenuEvents();
        this.bindLookaheadReadyMenuEvents();
        this.bindInGameElementEvents();
    }

    bindMainMenuEvents() {
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
    }

    bindChangeModeMenuEvents() {
        this.freeButton.addEventListener("click", ev => this.updateGameModeFromMenu(ev.currentTarget));
        this.b2bButton.addEventListener("click", ev => this.updateGameModeFromMenu(ev.currentTarget));
        this.lookButton.addEventListener("click", ev => this.updateGameModeFromMenu(ev.currentTarget));
        this.finesseButton.addEventListener("click", ev => this.updateGameModeFromMenu(ev.currentTarget));
        this.sprintButton.addEventListener("click", ev => this.updateGameModeFromMenu(ev.currentTarget));

        this.modePreferenceButton.addEventListener("click", () => {
            this.hide(this.changeModeMenu);
            this.activeMenu = "modePreference";
            this.show(this.modePreferenceMenu);
        });

        this.changeModeDoneButton.addEventListener("click", () => {
            this.hide(this.changeModeMenu);
            this.activeMenu = "main";
            this.show(this.mainMenu);
        });
    }

    bindModePreferenceMenuEvents() {
        this.loadUserModePreferences();

        this.modeGarbageSettingsButton.addEventListener("click", ev => {
            this.hide(this.modePreferenceMenu);
            this.activeMenu = "garbageSettings";
            this.show(this.garbageSettingsMenu);
        });

        this.autocolorButton.addEventListener("click", ev => {
            let status = ev.target.classList.toggle("user-choice");
            this.display.autocolorEnabled = status;

            if (this.controls.localStorageSupport()) {
                localStorage.setItem("autocolor", status);
            }
        });

        this.lookaheadShowQueueButton.addEventListener("click", ev => {
            let status = ev.target.classList.toggle("user-choice");
            this.game.mode.lookaheadShowQueue = status;

            if (this.controls.localStorageSupport()) {
                localStorage.setItem("showQueue", status);
            }
        });

        this.finesseRequire180Button.addEventListener("click", ev => {
            let status = ev.target.classList.toggle("user-choice");
            this.game.mode.finesseRequire180 = status;

            if (this.controls.localStorageSupport()) {
                localStorage.setItem("require180", status);
            }
        });

        this.modePreferenceDoneButton.addEventListener("click", () => {
            this.hide(this.modePreferenceMenu);
            this.activeMenu = "changeMode";
            this.show(this.changeModeMenu);
        });
    }

    bindGarbageSettingsMenuEvents() {
        this.loadUserGarbagePreferences();

        this.cheeseLayerButton.addEventListener("click", ev => {
            // Clicking on a label produces two click events (one on label and second on input)
            // Prevent two events from happening if clicked on label
            if (ev.target !== this.cheeseLayerButton && ev.target !== this.cheeseLayerInput) {
                return;
            }
            this.toggleGarbageMode(ev.currentTarget);
            this.game.activateCheeseLayer();
        });

        this.APSButton.addEventListener("click", ev => {
            if (ev.target !== this.APSButton && ev.target !== this.APSAttackInput && ev.target !== this.APSSecondInput) {
                return;
            }
            this.toggleGarbageMode(ev.currentTarget);
        });

        this.backfireButton.addEventListener("click", ev => {
            if (ev.target !== this.backfireButton && ev.target !== this.backfireInput) {
                return;
            }
            this.toggleGarbageMode(ev.currentTarget);
        });

        // Deactivate by double clicking
        this.cheeseLayerButton.addEventListener("dblclick", () => this.deactivateGarbageMode());
        this.APSButton.addEventListener("dblclick", () => this.deactivateGarbageMode());
        this.backfireButton.addEventListener("dblclick", () => this.deactivateGarbageMode());

        this.comboBlockingButton.addEventListener("click", () => {
            let status = this.comboBlockingButton.classList.toggle("user-choice");
            this.saveGarbagePreference("comboBlocking", status);
            this.game.comboBlocking = status;
        });


        this.cheeseLayerInput.addEventListener("blur", ev => {
            // Only allow integer in range [0, 20]
            if (!this.validGarbageInput(ev, true, 0, 20)) {
                return;
            }
            let num = Number(ev.currentTarget.value);
            this.saveGarbagePreference("cheeseLayer", num);
            this.game.cheeseLayer = num;
            this.game.activateCheeseLayer();
        });

        this.APSAttackInput.addEventListener("blur", ev => {
            // range [1, 20]
            if (!this.validGarbageInput(ev, true, 1, 20)) {
                return;
            }
            let num = Number(ev.currentTarget.value);
            this.saveGarbagePreference("APSAttack", num);
            this.game.APSAttack = num;

        });

        this.APSSecondInput.addEventListener("blur", ev => {
            // range [0.1, 600]
            if (!this.validGarbageInput(ev, false, 0.1, 600)) {
                return;
            }
            let num = Number(ev.currentTarget.value);
            this.saveGarbagePreference("APSSecond", num);
            this.game.APSSecond = num;

        });

        this.backfireInput.addEventListener("blur", ev => {
            // range [0, 20]
            if (!this.validGarbageInput(ev, false, 0, 20)) {
                return;
            }
            let num = Number(ev.currentTarget.value);
            this.saveGarbagePreference("backfireRate", num);
            this.game.backfireRate = num;
        });

        this.cheesinessInput.addEventListener("blur", ev => {
            // range [0, 100]
            if (!this.validGarbageInput(ev, false, 0, 100)) {
                return;
            }
            let num = Number(ev.currentTarget.value);
            this.saveGarbagePreference("cheesiness", num);
            this.game.cheesiness = num / 100;
        });

        this.garbageSettingsDoneButton.addEventListener("click", () => this.hideGarbageSettings());
    }

    bindSettingsMenuEvents() {
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

        this.garbageSettingsButton.addEventListener("click", () => {
            // This button is also available in the Mode Preferences menu
            // Ensure to return to the correct menu after closing garbage settings
            this.returnToSettings = true;

            this.hide(this.settingsMenu);
            this.activeMenu = "garbageSettings";
            this.show(this.garbageSettingsMenu);
        });

        this.restoreButton.addEventListener("click", () => {
            this.hide(this.settingsMenu);
            this.activeMenu = "restore";
            this.show(this.restoreMenu);
        });

        this.settingsDoneButton.addEventListener("click", () => this.hideSettings());
    }

    bindControlsMenuEvents() {
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

        this.controlsDoneButton.addEventListener("click", () => this.hideControls());
    }

    bindHandlingMenuEvents() {
        this.DASInput.addEventListener("blur", ev => this.updateHandling(ev));
        this.ARRInput.addEventListener("blur", ev => this.updateHandling(ev));
        this.SDFInput.addEventListener("blur", ev => this.updateHandling(ev));

        this.handlingDoneButton.addEventListener("click", ev => {
            this.hide(this.handlingMenu);
            this.show(this.settingsMenu);
            this.activeMenu = "settings";
        });
    }

    bindRestoreMenuEvents() {
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
    }

    bindResultsMenuEvents() {
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

    bindEditQueueMenuEvents() {
        this.holdInput.addEventListener("blur", ev => this.updateQueue(ev, true));
        this.nextInput.addEventListener("blur", ev => this.updateQueue(ev, false));
        this.queueSizeInput.addEventListener("blur", () => this.updateQueueSize());

        this.editQueueDoneButton.addEventListener("click", ev => {
            this.hide(this.editQueueMenu);
            this.activeMenu = "";
            this.game.play();
        });
    }

    bindLookaheadReadyMenuEvents() {
        this.lookaheadPiecesBottomInput.addEventListener("blur", () => this.validateAndChange());
    }

    bindInGameElementEvents() {
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
    }

    toggleGarbageMode(garbageModeButton) {
        // Deactivate all modes
        this.deactivateGarbageMode();

        // Activate mode clicked
        garbageModeButton.classList.add("user-choice");
        this.game[garbageModeButton.id] = true;
    }

    deactivateGarbageMode() {
        // Remove all statuses
        this.game.cheeseLayerActive = false;
        this.game.APS = false;
        this.game.backfire = false;

        this.cheeseLayerButton.classList.remove("user-choice");
        this.APSButton.classList.remove("user-choice");
        this.backfireButton.classList.remove("user-choice");
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

    validGarbageInput(ev, checkInt, min, max) {
        let val = ev.currentTarget.value;
        let num = Number(val);

        // Check if null or infinite
        if (!val || !isFinite(num)) {
            ev.currentTarget.classList.add("invalid");
            return false;
        }

        // Check if integer when requested
        if (checkInt && !Number.isInteger(num)) {
            ev.currentTarget.classList.add("invalid");
            return false;
        }

        // Check inclusive range. num is in [min, max]
        if (num < min || num > max) {
            ev.currentTarget.classList.add("invalid");
            return false;
        }

        ev.currentTarget.classList.remove("invalid");
        return true;
    }

    saveGarbagePreference(key, val) {
        if (!this.controls.localStorageSupport()) {
            return;
        }

        localStorage.setItem(key, val);
    }

    loadUserModePreferences() {

        // autocolor is initially on
        let autocolorPiece = true;
        // show-queue and strict 180 are initially off
        let lookaheadShowQueue, finesseStrict180;

        // Retrieve user preferences
        if (this.controls.localStorageSupport()) {

            // If autocolor preference previously NOT defined then enabled by default
            let temp = localStorage.getItem("autocolor");
            if (temp) {
                autocolorPiece = (temp === "true");
            }

            // If following preferences previously NOT defined then disabled by default
            lookaheadShowQueue = (localStorage.getItem("showQueue") === "true");
            finesseStrict180 = (localStorage.getItem("require180") === "true");
        }

        this.display.autocolorEnabled = autocolorPiece;
        if (autocolorPiece) {
            this.autocolorButton.classList.add("user-choice");
        } else {
            this.autocolorButton.classList.remove("user-choice");
        }

        if (lookaheadShowQueue) {
            this.game.mode.lookaheadShowQueue = lookaheadShowQueue;
            this.lookaheadShowQueueButton.classList.add("user-choice");
        }

        if (finesseStrict180) {
            this.game.mode.finesseRequire180 = finesseStrict180;
            this.finesseRequire180Button.classList.add("user-choice");
        }
    }

    loadUserGarbagePreferences() {
        if (!this.controls.localStorageSupport()) {
            return;
        }

        let cheeseLayer = localStorage.getItem("cheeseLayer");
        let APSAttack = localStorage.getItem("APSAttack");
        let APSSecond = localStorage.getItem("APSSecond");
        let backfireRate = localStorage.getItem("backfireRate");
        let cheesiness = localStorage.getItem("cheesiness");
        let comboBlocking = (localStorage.getItem("comboBlocking") === "true");

        if (cheeseLayer && isFinite(cheeseLayer)) {
            this.cheeseLayerInput.value = cheeseLayer;
            this.game.cheeseLayer = cheeseLayer;
        } else {
            this.game.cheeseLayer = Number(this.cheeseLayerInput.value); // default
        }

        if (APSAttack && isFinite(APSAttack)) {
            this.APSAttackInput.value = APSAttack;
            this.game.APSAttack = APSAttack;
        } else {
            this.game.APSAttack = Number(this.APSAttackInput.value);
        }

        if (APSSecond && isFinite(APSSecond)) {
            this.APSSecondInput.value = APSSecond;
            this.game.APSSecond = APSSecond;
        } else {
            this.game.APSSecond = Number(this.APSSecondInput.value);
        }

        if (backfireRate && isFinite(backfireRate)) {
            this.backfireInput.value = backfireRate;
            this.game.backfireRate = backfireRate;
        } else {
            this.game.backfireRate = Number(this.backfireInput.value);
        }

        if (cheesiness && isFinite(cheesiness)) {
            this.cheesinessInput.value = cheesiness;
            this.game.cheesiness = cheesiness / 100;
        } else {
            this.game.cheesiness = Number(this.cheesinessInput.value) / 100;
        }

        if (comboBlocking) {
            this.comboBlockingButton.classList.add("user-choice");
            this.game.comboBlocking = comboBlocking;
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

    hideGarbageSettings() {
        this.hide(this.garbageSettingsMenu);

        if (this.returnToSettings) {
            this.activeMenu = "settings";
            this.show(this.settingsMenu);
            this.returnToSettings = false;
        } else {
            this.activeMenu = "modePreference";
            this.show(this.modePreferenceMenu);
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

    press(ev) {
        let key = ev.key.toLowerCase();

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
            this.controls.press(ev);
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

        else if (this.activeMenu === "modePreference") {
            this.hide(this.modePreferenceMenu);
            this.activeMenu = "changeMode";
            this.show(this.changeModeMenu);
        }

        else if (this.activeMenu === "garbageSettings") {
            this.hideGarbageSettings();
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
        // Remove "active" status when selecting another mode
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