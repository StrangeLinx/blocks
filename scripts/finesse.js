
export default function(piece, keySequence) {
    // If only hard drop finesse passes
    if (keySequence.keyPresses === 0) {
        return [true, ""];
    }

    // Automatic pass with Soft Drop
    if (keySequence.sequence.includes("Soft Drop")) {
        return [true, ""];
    }

    // Retrieve the preferred sequences of key press (and hold)
    let sequences = finesseLibrary[piece.type][piece.rot][piece.x];
    let pass = efficientSequence(keySequence, sequences);

    if (pass) {
        return [true, ""];
    }

    return [false, tipify(sequences)];
}

function efficientSequence(userSequence, sequences) {
    // Ensure player key presses are as efficient (or better) than the recommended finesse sequence
    return userSequence.keyPresses <= sequences.keyPresses;
}

function tipify(sequences) {
    let tip = "";
    for (let sequence of sequences.sequences) {
        if (tip !== "") {
            tip += " or </br>";
        }
        tip += sequence.join(", ");
    }
    // Improve readability
    tip = tip.replaceAll("Left, LeftDAS", "DAS Left");
    tip = tip.replaceAll("Right, RightDAS", "DAS Right");
    return tip;
}

const finesseO = {
    0: {
        0: { keyPresses: 1, sequences: [["Left", "LeftDAS"]] },
        1: { keyPresses: 2, sequences: [["Left", "LeftDAS", "Right"]] },
        2: { keyPresses: 2, sequences: [["Left", "Left"]] },
        3: { keyPresses: 1, sequences: [["Left"]] },
        4: { keyPresses: 0, sequences: [["Hard Drop"]] },
        5: { keyPresses: 1, sequences: [["Right"]] },
        6: { keyPresses: 2, sequences: [["Right", "Right"]] },
        7: { keyPresses: 2, sequences: [["Right", "RightDAS", "Left"]] },
        8: { keyPresses: 1, sequences: [["Right", "RightDAS"]] },
    },
};

// 
// ALL the below fail finesse for O
// 
finesseO[1] = finesseO[0];
finesseO[2] = finesseO[0];
finesseO[3] = finesseO[0];

const finesseI = {
    0: {
        1: { keyPresses: 1, sequences: [["Left", "LeftDAS"]] },
        2: { keyPresses: 2, sequences: [["Left", "LeftDAS", "Right"], ["Left", "Left"]] },
        3: { keyPresses: 1, sequences: [["Left"]] },
        4: { keyPresses: 0, sequences: [["Hard Drop"]] },
        5: { keyPresses: 1, sequences: [["Right"]] },
        6: { keyPresses: 2, sequences: [["Right", "RightDAS", "Left"], ["Right", "Right"]] },
        7: { keyPresses: 1, sequences: [["Right", "RightDAS"]] },
    },
    1: {
        "-1": { keyPresses: 2, sequences: [["Rotate CCW", "Left", "LeftDAS"], ["Rotate CW", "Left", "LeftDAS"]] },  // 2 ok
        0: { keyPresses: 2, sequences: [["Left", "LeftDAS", "Rotate CCW"]] },    // fail
        1: { keyPresses: 2, sequences: [["Left", "LeftDAS", "Rotate CW"]] },
        2: { keyPresses: 2, sequences: [["Left", "Rotate CCW"]] },               // fail
        3: { keyPresses: 1, sequences: [["Rotate CCW"]] },                       // fail
        4: { keyPresses: 1, sequences: [["Rotate CW"]] },
        5: { keyPresses: 2, sequences: [["Right", "Rotate CW"]] },
        6: { keyPresses: 2, sequences: [["Right", "RightDAS", "Rotate CCW"]] },  // fail
        7: { keyPresses: 2, sequences: [["Right", "RightDAS", "Rotate CW"]] },
        8: { keyPresses: 2, sequences: [["Rotate CW", "Right", "RightDAS"]] },
    },
    // All of rotation 2 fail
    2: {
        1: { keyPresses: 1, sequences: [["Left", "LeftDAS"]] },
        2: { keyPresses: 2, sequences: [["Left", "LeftDAS", "Right"], ["Left", "Left"]] },
        3: { keyPresses: 1, sequences: [["Left"]] },
        4: { keyPresses: 0, sequences: [["Hard Drop"]] },
        5: { keyPresses: 1, sequences: [["Right"]] },
        6: { keyPresses: 2, sequences: [["Right", "RightDAS", "Left"], ["Right", "Right"]] },
        7: { keyPresses: 1, sequences: [["Right", "RightDAS"]] },
    },
    3: {
        0: { keyPresses: 2, sequences: [["Rotate CCW", "Left", "LeftDAS"]] },
        1: { keyPresses: 2, sequences: [["Left", "LeftDAS", "Rotate CCW"]] },
        2: { keyPresses: 2, sequences: [["Left", "LeftDAS", "Rotate CW"]] },    // fail
        3: { keyPresses: 2, sequences: [["Left", "Rotate CCW"]] },
        4: { keyPresses: 1, sequences: [["Rotate CCW"]] },
        5: { keyPresses: 1, sequences: [["Rotate CW"]] },                       // fail
        6: { keyPresses: 2, sequences: [["Right", "Rotate CW"]] },              // fail
        7: { keyPresses: 2, sequences: [["Right", "RightDAS", "Rotate CCW"]] },
        8: { keyPresses: 2, sequences: [["Right", "RightDAS", "Rotate CW"]] },  // fail
        9: { keyPresses: 2, sequences: [["Rotate CW", "Right", "RightDAS"], ["Rotate CCW", "Right", "RightDAS"]] },  // 2 ok
    }
};

const finesseLJT = {
    0: {
        1: { keyPresses: 1, sequences: [["Left", "LeftDAS"]] },
        2: { keyPresses: 2, sequences: [["Left", "Left"], ["Left", "LeftDAS", "Right"]] },
        3: { keyPresses: 1, sequences: [["Left"]] },
        4: { keyPresses: 0, sequences: [["Hard Drop"]] },
        5: { keyPresses: 1, sequences: [["Right"]] },
        6: { keyPresses: 2, sequences: [["Right", "Right"]] },
        7: { keyPresses: 2, sequences: [["Right", "RightDAS", "Left"]] },
        8: { keyPresses: 1, sequences: [["Right", "RightDAS"]] },
    },
    1: {
        0: { keyPresses: 2, sequences: [["Rotate CW", "Left", "LeftDAS"]] },
        1: { keyPresses: 2, sequences: [["Left", "LeftDAS", "Rotate CW"]] },
        2: { keyPresses: 3, sequences: [["Left", "Left", "Rotate CW"], ["Left", "LeftDAS", "Right", "Rotate CW"]] },
        3: { keyPresses: 2, sequences: [["Left", "Rotate CW"]] },
        4: { keyPresses: 1, sequences: [["Rotate CW"]] },
        5: { keyPresses: 2, sequences: [["Right", "Rotate CW"]] },
        6: { keyPresses: 3, sequences: [["Right", "Right", "Rotate CW"]] },
        7: { keyPresses: 3, sequences: [["Right", "RightDAS", "Left", "Rotate CW"]] },
        8: { keyPresses: 2, sequences: [["Right", "RightDAS", "Rotate CW"]] },
    },
    2: {
        1: { keyPresses: 2, sequences: [["Left", "LeftDAS", "Rotate 180"]] },
        2: { keyPresses: 3, sequences: [["Left", "Left", "Rotate 180"], ["Left", "LeftDAS", "Right", "Rotate 180"]] },
        3: { keyPresses: 2, sequences: [["Left", "Rotate 180"]] },
        4: { keyPresses: 1, sequences: [["Rotate 180"]] },
        5: { keyPresses: 2, sequences: [["Right", "Rotate 180"]] },
        6: { keyPresses: 3, sequences: [["Right", "Right", "Rotate 180"]] },
        7: { keyPresses: 3, sequences: [["Right", "RightDAS", "Left", "Rotate 180"]] },
        8: { keyPresses: 2, sequences: [["Right", "RightDAS", "Rotate 180"]] },
    },
    3: {
        1: { keyPresses: 2, sequences: [["Left", "LeftDAS", "Rotate CCW"]] },
        2: { keyPresses: 3, sequences: [["Left", "Left", "Rotate CCW"], ["Left", "LeftDAS", "Right", "Rotate CCW"]] },
        3: { keyPresses: 2, sequences: [["Left", "Rotate CCW"]] },
        4: { keyPresses: 1, sequences: [["Rotate CCW"]] },
        5: { keyPresses: 2, sequences: [["Right", "Rotate CCW"]] },
        6: { keyPresses: 3, sequences: [["Right", "Right", "Rotate CCW"]] },
        7: { keyPresses: 3, sequences: [["Right", "RightDAS", "Left", "Rotate CCW"]] },
        8: { keyPresses: 2, sequences: [["Right", "RightDAS", "Rotate CCW"]] },
        9: { keyPresses: 2, sequences: [["Rotate CCW", "Right", "RightDAS"]] },
    }
};

const finesseSZ = {
    0: finesseLJT[0], // Same as LJT finesse
    1: {
        0: { keyPresses: 2, sequences: [["Left", "LeftDAS", "Rotate CCW"], ["Rotate CW", "Left", "LeftDAS"]] }, // 2 ok
        1: { keyPresses: 2, sequences: [["Left", "LeftDAS", "Rotate CW"]] },
        2: { keyPresses: 2, sequences: [["Left", "Rotate CCW"]] },  // fail
        3: { keyPresses: 1, sequences: [["Rotate CCW"]] },            // fail
        4: { keyPresses: 1, sequences: [["Rotate CW"]] },
        5: { keyPresses: 2, sequences: [["Right", "Rotate CW"]] },
        6: { keyPresses: 3, sequences: [["Right", "Right", "Rotate CW"]] },
        7: { keyPresses: 2, sequences: [["Right", "RightDAS", "Rotate CCW"]] }, // fail
        8: { keyPresses: 2, sequences: [["Right", "RightDAS", "Rotate CW"]] },
    },
    2: finesseLJT[0], // fail
    3: {
        1: { keyPresses: 2, sequences: [["Left", "LeftDAS", "Rotate CCW"]] },
        2: { keyPresses: 2, sequences: [["Left", "LeftDAS", "Rotate CW"]] },  // fail
        3: { keyPresses: 2, sequences: [["Left", "Rotate CCW"]] },
        4: { keyPresses: 1, sequences: [["Rotate CCW"]] },
        5: { keyPresses: 1, sequences: [["Rotate CW"]] },                       // fail
        6: { keyPresses: 2, sequences: [["Right", "Rotate CW"]] },              // fail
        7: { keyPresses: 3, sequences: [["Right", "Right", "Rotate CW"], ["Right", "RightDAS", "Left", "Rotate CCW"]] }, // 2 ok
        8: { keyPresses: 2, sequences: [["Right", "RightDAS", "Rotate CCW"]] },
        9: { keyPresses: 2, sequences: [["Right", "RightDAS", "Rotate CW"], ["Rotate CCW", "Right", "RightDAS"]] }, // 2 ok
    }
};

//
// finesseLibrary[pieceType][rotation][x] = { key presses, array of key press sequences }
// pieceType is the current piece type
// rotation is the current piece rotation
// x represents the column the current piece was placed
// 
const finesseLibrary = {
    o: finesseO,
    i: finesseI,
    l: finesseLJT,
    j: finesseLJT,
    s: finesseSZ,
    t: finesseLJT,
    z: finesseSZ
};
