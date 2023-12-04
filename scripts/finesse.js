
export default function(piece, keySequence) {
    // If only hard drop finesse passes
    if (keySequence.length === 0) {
        return [true, ""];
    }

    // Automatic pass with Soft Drop
    if (keySequence.includes("Soft Drop")) {
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
    ignoreInitialDAS(userSequence);

    let numKeysIsLessOrEqual = true;

    // Ensure the keys pressed (and held) matches one of the sequences
    for (let sequence of sequences) {
        if (userSequence.length < sequence.length) { // Less is good
            continue;
        }

        if (userSequence.length > sequence.length) { // More is bad
            numKeysIsLessOrEqual = false;
            continue;
        }

        // Allow user keypress in any order
        let match = true;
        userSequence.forEach(key => {
            if (!sequence.includes(key)) {
                match = false;
            }
        });

        if (match) {
            return true;
        }
    }

    // If amount of keys pressed is less than all the sequences, then pass
    if (numKeysIsLessOrEqual) {
        return true;
    }

    return false;
}

function ignoreInitialDAS(sequence) {
    // If player has leftDAS then rightDAS's, ignore the initial leftDAS
    if (sequence[0] === "LeftDAS" && sequence.includes("RightDAS")) {
        sequence.shift();
    }
    // Similarly for rightDAS
    if (sequence[0] === "RightDAS" && sequence.includes("LeftDAS")) {
        sequence.shift();
    }
}

function tipify(sequences) {
    let tip = "";
    for (let sequence of sequences) {
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
        0: [["Left", "LeftDAS"]],
        1: [["Left", "LeftDAS", "Right"]],
        2: [["Left", "Left"]],
        3: [["Left"]],
        4: [["Hard Drop"]],
        5: [["Right"]],
        6: [["Right", "Right"]],
        7: [["Right", "RightDAS", "Left"]],
        8: [["Right", "RightDAS"]]
    },
    // 
    // ALL the below fail finesse
    // Return the preferable sequence
    // 
    1: {
        0: [["Left", "LeftDAS"]],
        1: [["Left", "LeftDAS", "Right"]],
        2: [["Left", "Left"]],
        3: [["Left"]],
        4: [["Hard Drop"]],
        5: [["Right"]],
        6: [["Right", "Right"]],
        7: [["Right", "RightDAS", "Left"]],
        8: [["Right", "RightDAS"]]
    },
    2: {
        0: [["Left", "LeftDAS"]],
        1: [["Left", "LeftDAS", "Right"]],
        2: [["Left", "Left"]],
        3: [["Left"]],
        4: [["Hard Drop"]],
        5: [["Right"]],
        6: [["Right", "Right"]],
        7: [["Right", "RightDAS", "Left"]],
        8: [["Right", "RightDAS"]]
    },
    3: {
        0: [["Left", "LeftDAS"]],
        1: [["Left", "LeftDAS", "Right"]],
        2: [["Left", "Left"]],
        3: [["Left"]],
        4: [["Hard Drop"]],
        5: [["Right"]],
        6: [["Right", "Right"]],
        7: [["Right", "RightDAS", "Left"]],
        8: [["Right", "RightDAS"]]
    }
};

const finesseI = {
    0: {
        1: [["Left", "LeftDAS"]],
        2: [["Left", "LeftDAS", "Right"], ["Left", "Left"]],
        3: [["Left"]],
        4: [["Hard Drop"]],
        5: [["Right"]],
        6: [["Right", "RightDAS", "Left"], ["Right", "Right"]],
        7: [["Right", "RightDAS"]]
    },
    1: {
        "-1": [["Rotate CCW", "Left", "LeftDAS"], ["Rotate CW", "Left", "LeftDAS"]],  // 2 ok
        0: [["Left", "LeftDAS", "Rotate CCW"]],    // fail
        1: [["Left", "LeftDAS", "Rotate CW"]],
        2: [["Left", "Rotate CCW"]],               // fail
        3: [["Rotate CCW"]],                       // fail
        4: [["Rotate CW"]],
        5: [["Right", "Rotate CW"]],
        6: [["Right", "RightDAS", "Rotate CCW"]],  // fail
        7: [["Right", "RightDAS", "Rotate CW"]],
        8: [["Rotate CW", "Right", "RightDAS"]],
    },
    // All of rotation 2 fail
    2: {
        1: [["Left", "LeftDAS"]],
        2: [["Left", "LeftDAS", "Right"], ["Left", "Left"]],
        3: [["Left"]],
        4: [["Hard Drop"]],
        5: [["Right"]],
        6: [["Right", "RightDAS", "Left"], ["Right", "Right"]],
        7: [["Right", "RightDAS"]]
    },
    3: {
        0: [["Rotate CCW", "Left", "LeftDAS"]],
        1: [["Left", "LeftDAS", "Rotate CCW"]],
        2: [["Left", "LeftDAS", "Rotate CW"]],    // fail
        3: [["Left", "Rotate CCW"]],
        4: [["Rotate CCW"]],
        5: [["Rotate CW"]],                       // fail
        6: [["Right", "Rotate CW"]],              // fail
        7: [["Right", "RightDAS", "Rotate CCW"]],
        8: [["Right", "RightDAS", "Rotate CW"]],  // fail
        9: [["Rotate CW", "Right", "RightDAS"], ["Rotate CCW", "Right", "RightDAS"]],  // 2 ok
    }
};

const finesseLJT = {
    0: {
        1: [["Left", "LeftDAS"]],
        2: [["Left", "Left"], ["Left", "LeftDAS", "Right"]],
        3: [["Left"]],
        4: [["Hard Drop"]],
        5: [["Right"]],
        6: [["Right", "Right"]],
        7: [["Right", "RightDAS", "Left"]],
        8: [["Right", "RightDAS"]],
    },
    1: {
        0: [["Rotate CW", "Left", "LeftDAS"]],
        1: [["Left", "LeftDAS", "Rotate CW"]],
        2: [["Left", "Left", "Rotate CW"], ["Left", "LeftDAS", "Right", "Rotate CW"]],
        3: [["Left", "Rotate CW"]],
        4: [["Rotate CW"]],
        5: [["Right", "Rotate CW"]],
        6: [["Right", "Right", "Rotate CW"]],
        7: [["Right", "RightDAS", "Left", "Rotate CW"]],
        8: [["Right", "RightDAS", "Rotate CW"]],
    },
    2: {
        1: [["Left", "LeftDAS", "Rotate 180"]],
        2: [["Left", "Left", "Rotate 180"], ["Left", "LeftDAS", "Right", "Rotate 180"]],
        3: [["Left", "Rotate 180"]],
        4: [["Rotate 180"]],
        5: [["Right", "Rotate 180"]],
        6: [["Right", "Right", "Rotate 180"]],
        7: [["Right", "RightDAS", "Left", "Rotate 180"]],
        8: [["Right", "RightDAS", "Rotate 180"]],
    },
    3: {
        1: [["Left", "LeftDAS", "Rotate CCW"]],
        2: [["Left", "Left", "Rotate CCW"], ["Left", "LeftDAS", "Right", "Rotate CCW"]],
        3: [["Left", "Rotate CCW"]],
        4: [["Rotate CCW"]],
        5: [["Right", "Rotate CCW"]],
        6: [["Right", "Right", "Rotate CCW"]],
        7: [["Right", "RightDAS", "Left", "Rotate CCW"]],
        8: [["Right", "RightDAS", "Rotate CCW"]],
        9: [["Rotate CCW", "Right", "RightDAS"]],
    }
};

const finesseSZ = {
    0: finesseLJT[0], // Same as LJT finesse
    1: {
        0: [["Left", "LeftDAS", "Rotate CCW"], ["Rotate CW", "Left", "LeftDAS"]], // 2 ok
        1: [["Left", "LeftDAS", "Rotate CW"]],
        2: [["Left", "Rotate CCW"]],  // fail
        3: [["Rotate CCW"]],            // fail
        4: [["Rotate CW"]],
        5: [["Right", "Rotate CW"]],
        6: [["Right", "Right", "Rotate CW"]],
        7: [["Right", "RightDAS", "Rotate CCW"]], // fail
        8: [["Right", "RightDAS", "Rotate CW"]],
    },
    2: finesseLJT[0], // fail
    3: {
        1: [["Left", "LeftDAS", "Rotate CCW"]],
        2: [["Left", "LeftDAS", "Rotate CW"]],  // fail
        3: [["Left", "Rotate CCW"]],
        4: [["Rotate CCW"]],
        5: [["Rotate CW"]],                       // fail
        6: [["Right", "Rotate CW"]],              // fail
        7: [["Right", "Right", "Rotate CW"], ["Right", "RightDAS", "Left", "Rotate CCW"]], // 2 ok
        8: [["Right", "RightDAS", "Rotate CCW"]],
        9: [["Right", "RightDAS", "Rotate CW"]],
    }
};

//
// finesseLibrary[pieceType][rotation][x] = Array of preferred sequences
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
