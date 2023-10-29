import Piece from './piece.js';

export default class Bag {

    constructor() {
        this.types = ['o', 'i', 'l', 'j', 's', 't', 'z'];
        this.held = false;
        this.holdPiece = "";
        this.queue = [];
        this.addPiecesToQueue();
    }

    addPiecesToQueue() {
        this.shuffleTypes();
        this.types.forEach(type => {
            this.queue.push(new Piece(type));
        });
    }

    shuffleTypes() {
        // Fisher-Yates Shuffle
        let currentIndex = this.types.length;
        let randomIndex;

        while (currentIndex > 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [this.types[currentIndex], this.types[randomIndex]] = [
                this.types[randomIndex], this.types[currentIndex]];
        }
    }

    place() {
        let piece = this.queue.shift();
        // Ensure at least 7 pieces in queue
        if (this.queue.length < 7) {
            this.addPiecesToQueue();
        }
        this.held = false;
        return piece;
    }

    hold() {
        // Return [held, updated next]
        // Can't hold twice in a row
        if (this.held) {
            return [false, false];
        }
        // Place current piece in queue into hold
        if (this.holdPiece === "") {
            this.holdPiece = this.place();
            this.holdPiece.reset();
            this.held = true;
            return [true, true];
        }
        // Swap current piece and hold
        let tempPiece = this.holdPiece;
        this.holdPiece = this.queue[0];
        this.queue[0] = tempPiece;
        this.holdPiece.reset();
        this.held = true;
        return [true, false];
    }

    setCurrentPiece(piece) {
        this.queue[0] = piece;
    }

    getCurrentPiece() {
        return this.queue[0];
    }

    cloneCurrentPiece() {
        return this.clonePiece(this.queue[0]);
    }

    clonePiece(piece) {
        return new Piece(piece.type, piece.rot, piece.x, piece.y);
    }

    getHoldPiece() {
        return this.holdPiece;
    }

    getNextPieces() {
        return this.queue.slice(1, 6);
    }

    getAllNextPieces() {
        return this.queue;
    }

    updateHold(type) {
        // No change states
        if (!type && !this.holdPiece) {
            // No hold piece and none given
            return;
        }
        if (type === this.holdPiece.type) {
            // hold piece is same as given piece
            return;
        }

        // Allow hold if hold piece is updated
        this.held = false;
        if (!type) {
            this.holdPiece = "";
        } else {
            this.holdPiece = new Piece(type);
        }
    }

    updateNext(types) {
        // Clear
        this.queue = [];

        // Add the pieces
        for (let i = 0; i < types.length; i++) {
            this.queue.push(new Piece(types[i]));
        }

        // Ensure there's enough in queue
        if (this.queue.length < 7) {
            this.addPiecesToQueue();
        }

    }

}