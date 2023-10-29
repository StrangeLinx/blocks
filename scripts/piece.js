
export default class Piece {

    constructor(type, rot = 0, x = 4, y = 21) {
        this.type = type;
        this.rot = rot;
        this.x = x;
        this.y = y;
        this.span = pieces[type][rot];
    }

    shift(x, y) {
        this.x += x;
        this.y += y;
    }

    rotate(r) {
        this.rot = (this.rot + r + 4) % 4;
        this.span = pieces[this.type][this.rot];
    }

    reset() {
        this.x = 4;
        this.y = 21;
        this.rot = 0;
        this.span = pieces[this.type][this.rot];
    }

    getRotate() {
        return this.rot;
    }
}

const pieces = {
    o: {
        0: { length: 4, 0: origin(), 1: up(), 2: right(), 3: upRight() },
        1: { length: 4, 0: origin(), 1: up(), 2: right(), 3: upRight() },
        2: { length: 4, 0: origin(), 1: up(), 2: right(), 3: upRight() },
        3: { length: 4, 0: origin(), 1: up(), 2: right(), 3: upRight() }
    },
    i: {
        0: { length: 4, 0: origin(), 1: left(), 2: right(), 3: right2() },
        1: { length: 4, 0: right(), 1: upRight(), 2: downRight(), 3: down2Right() },
        2: { length: 4, 0: down(), 1: downLeft(), 2: downRight(), 3: downRight2() },
        3: { length: 4, 0: origin(), 1: up(), 2: down(), 3: down2() }
    },
    l: {
        0: { length: 4, 0: origin(), 1: right(), 2: left(), 3: upRight() },
        1: { length: 4, 0: origin(), 1: down(), 2: up(), 3: downRight() },
        2: { length: 4, 0: origin(), 1: left(), 2: right(), 3: downLeft() },
        3: { length: 4, 0: origin(), 1: up(), 2: down(), 3: upLeft() }
    },
    j: {
        0: { length: 4, 0: origin(), 1: right(), 2: left(), 3: upLeft() },
        1: { length: 4, 0: origin(), 1: down(), 2: up(), 3: upRight() },
        2: { length: 4, 0: origin(), 1: left(), 2: right(), 3: downRight() },
        3: { length: 4, 0: origin(), 1: up(), 2: down(), 3: downLeft() }
    },
    s: {
        0: { length: 4, 0: origin(), 1: left(), 2: up(), 3: upRight() },
        1: { length: 4, 0: origin(), 1: up(), 2: right(), 3: downRight() },
        2: { length: 4, 0: origin(), 1: right(), 2: down(), 3: downLeft() },
        3: { length: 4, 0: origin(), 1: left(), 2: down(), 3: upLeft() }
    },
    t: {
        0: { length: 4, 0: origin(), 1: left(), 2: right(), 3: up() },
        1: { length: 4, 0: origin(), 1: up(), 2: down(), 3: right() },
        2: { length: 4, 0: origin(), 1: left(), 2: right(), 3: down() },
        3: { length: 4, 0: origin(), 1: up(), 2: down(), 3: left() }
    },
    z: {
        0: { length: 4, 0: origin(), 1: up(), 2: right(), 3: upLeft() },
        1: { length: 4, 0: origin(), 1: down(), 2: right(), 3: upRight() },
        2: { length: 4, 0: origin(), 1: left(), 2: down(), 3: downRight() },
        3: { length: 4, 0: origin(), 1: left(), 2: up(), 3: downLeft() }
    }
};

function origin() {
    return { x: 0, y: 0 };
}

function up() {
    return { x: 0, y: 1 };
}

function down() {
    return { x: 0, y: -1 };
}

function left() {
    return { x: -1, y: 0 };
}

function right() {
    return { x: 1, y: 0 };
}

function upLeft() {
    return { x: -1, y: 1 };
}

function upRight() {
    return { x: 1, y: 1 };
}

function downLeft() {
    return { x: -1, y: -1 };
}

function downRight() {
    return { x: 1, y: -1 };
}

function right2() {
    return { x: 2, y: 0 };
}

function down2() {
    return { x: 0, y: -2 };
}

function down2Right() {
    return { x: 1, y: -2 };
}

function downRight2() {
    return { x: 2, y: -1 };
}