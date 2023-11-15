// Note this only supports Tetrio screenshots

// Constants
const c = {
    // Measure y relative to image width (hence YWidth)
    onlyGridXStart: 0.00849,
    onlyGridXWidth: 0.98089,
    onlyGridYStart: 0,
    onlyGridYWidth: 0.00849,  // (h - w * constant)

    zenYStart: 0.65,
    zenYEnd: 0.9,
    zenXBarStart: 0.72086,

    zenGridXStart: 0.24642,
    gridXStart: 0.28119,
    gridXWidth: 0.47239,
    gridYStart: 0,
    gridYWidth: 0.00511,     // (h - w * constant)

    holdXStart: 0.02761,
    holdXWidth: 0.19018,
    holdYStart: 0.88344,
    holdYWidth: 0.09509,

    nextXStart: 0.78221,
    nextXWidth: 0.18916,
    nextYStart: 0.88446,
    nextUnit: 0.66258 / 14,    // queue height over number of squares (14)
    nextUnitsH: 2,
    nextAdjacentYStart: 3,
};

export default async function(img) {
    // Load the image into structures
    const canvas = await loadImage(img);
    const [gridImgData, holdImgData, nextImgsData] = retrieveImageComponents(canvas);
    // Process each component
    const [grid, nextPiece] = processGrid(gridImgData);
    const hold = processHold(holdImgData);
    const nextPieces = processNext(nextImgsData, nextPiece);
    return [grid, hold, nextPieces];
}

async function loadImage(img) {
    // Load image and return canvas context
    return new Promise(resolve => {
        // Create image source
        const imgSrc = URL.createObjectURL(img);
        const imgObject = new Image();

        imgObject.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = imgObject.width;
            canvas.height = imgObject.height;
            ctx.drawImage(imgObject, 0, 0);
            URL.revokeObjectURL(imgSrc);
            resolve(canvas);
        };

        imgObject.src = imgSrc;
    });
}

function retrieveImageComponents(canvas) {
    // Returns the canvas context image data
    // Components are the grid, hold piece, and next pieces

    const w = canvas.width;
    const h = canvas.height;
    const ctx = canvas.getContext("2d");
    // xstart, xwidth, ystart, yheight
    let xs, xw, ys, yh;

    // A grid's height is twice it's width and note, user may have taken a partial screenshot
    // If screenshot of just the grid, just return that
    if (h > w * 1.5) {
        // Remove grid borders
        xs = Math.floor(w * c.onlyGridXStart);
        xw = Math.floor(w * c.onlyGridXWidth);
        ys = 0;
        yh = Math.floor(h - w * c.onlyGridYWidth); // border measured (w * c) relative to width
        const grid = retrieveImageComponent(ctx, xs, xw, ys, yh);
        return [grid, "", ""];
    }

    // Base image height span on width since user may have cropped height
    // (Width is more reliable)

    // Zen modes and live mode have different grid formats
    let zen = identifyMode(canvas);

    // Grid
    if (zen) {
        xs = Math.floor(w * c.zenGridXStart);
    } else {
        xs = Math.floor(w * c.gridXStart);
    }
    xw = Math.floor(w * c.gridXWidth);
    ys = 0;
    yh = Math.floor(h - w * c.gridYWidth);           // height may vary so measure border (w * c) relative to width
    const grid = retrieveImageComponent(ctx, xs, xw, ys, yh);

    // Hold
    xs = Math.floor(w * c.holdXStart);
    xw = Math.floor(w * c.holdXWidth);
    ys = Math.floor(h - w * c.holdYStart);           // Offsetting using width
    yh = Math.floor(w * c.holdYWidth);               // Determine hold height
    const hold = retrieveImageComponent(ctx, xs, xw, ys, yh);

    // Next - retrieve the image component of each piece (5 in queue)
    let unit = w * c.nextUnit;
    xs = Math.floor(w * c.nextXStart);
    xw = Math.floor(w * c.nextXWidth);
    ys = Math.floor(h - w * c.nextYStart);
    yh = Math.floor(c.nextUnitsH * unit);            // piece unit height
    let nextYStart = c.nextAdjacentYStart * unit + 1;    // ys to next ys
    const next = [];
    for (let i = 0; i < 5; i++) {
        next.push(retrieveImageComponent(ctx, xs, xw, ys, yh));
        ys = Math.floor(ys + nextYStart);
    }

    return [grid, hold, next];
}

function identifyMode(canvas) {
    const ctx = canvas.getContext("2d");
    const gameImgData = retrieveImageComponent(ctx, 0, canvas.width, 0, canvas.height);
    // The bar is the one that displays the number of garbage lines (left) or zen level (right)
    return identifyBar(gameImgData);
}

function identifyBar(imgData) {
    let yStart = Math.floor(imgData.height * c.zenYStart);
    let yEnd = Math.floor(imgData.height * c.zenYEnd);

    // Identify vertical bar allowing 11 pixels of freedom (left favored)
    let center = Math.floor(c.zenXBarStart * imgData.width);
    for (let offSet = -7; offSet <= 3; offSet++) {
        let x = center + offSet;
        if (verticalLine(x, yStart, yEnd, imgData)) {
            return true;
        }
    }

    return false;
}

function verticalLine(x, yStart, yEnd, imgData) {
    // Color to be checking - either white or red
    let [r, g, b] = getPixel(x, yStart, imgData);
    let checkColor;

    if (white(r, g, b)) {
        checkColor = white;
    } else if (red(r, g, b)) {
        checkColor = red;
    } else {
        return false; // zen Bar is red or white
    }

    for (let y = yStart; y < yEnd; y++) {
        if (!checkColor(...getPixel(x, y, imgData))) {
            // Color change means it's not a bar
            // May fail if screenshot is too "busy" (full or particles)
            return false;
        }
    }

    return true;
}

function retrieveImageComponent(ctx, xs, xw, ys, yh) {
    try {
        return grid = ctx.getImageData(xs, ys, xw, yh);
    }

    catch {
        console.log("Invalid image. Check dimensions.");
        console.log(`x start: ${xs}, x width : ${xw}`);
        console.log(`y start: ${ys}, y height: ${yh}`);
        return "";
    }
}

function processGrid(imgData) {
    // grid width & height, piece square, and offset to center
    const width = imgData.width;
    const height = imgData.height;
    const square = Math.floor(width / 10);
    const offSet = Math.floor(width / 20);
    let maxRows = 26;

    // Look for next piece while creating grid
    let lookForNext = false;
    let nextPiece = "";

    // Start on row 0 (bottom) and move up until (including) the last row
    // Order of events:
    // 1. Add rows to the grid
    // 2. Encounter an empty row (stop adding rows to the grid)
    // 3. Look until you find the next piece
    let y = height - offSet;
    const grid = [];
    while (y >= 0 && maxRows > 0) {
        const row = [];

        for (let i = 0; i < 10; i++) {
            let x = i * square + offSet;
            let type = colorToValue(...getPixel(x, y, imgData));

            if (lookForNext && type && "oiljstz".includes(type)) {
                nextPiece = type;
                break;
            } else {
                row.push(type);
            }
        }

        // 3. Found the next piece we're done
        if (nextPiece) {
            break;
        }

        // Can't have floating lines in Tetrio (standardly)
        // 2. Start looking for next piece and stop adding rows to the grid
        if (empty(row)) {
            lookForNext = true;
        }

        // 1. Add row to the grid
        if (!lookForNext) {
            grid.push(row);
        }

        y -= square;
        maxRows -= 1;
    }

    // Fill in empty rows on top
    while (grid.length < 26) {
        grid.push(Array(10).fill(""));
    }

    return [grid, nextPiece];
}

function empty(row) {
    // Empty when the whole array is empty strings
    return row.every(val => val === "");
}

function processHold(imgData) {
    if (!imgData) {
        return "";
    }

    return identifyPiece(imgData);
}

function processNext(imgsData, next) {
    if (!imgsData) {
        return next;
    }

    for (let i = 0; i < imgsData.length; i++) {
        next += identifyPiece(imgsData[i]);
    }

    return next;
}

function identifyPiece(imgData) {
    // imgData ratio of width: height ~ (2 : 1)

    // Try identifying by color
    let type = identifyPieceByColor(imgData);
    if (type === "empty") {
        return "";
    } else if (type) {
        return type;
    }

    // Try identifying i piece (longer than other pieces)
    if (identifyIPiece(imgData)) {
        return "i";
    }

    // Lastly try to find a pattern
    return identifyPieceByPosition(imgData);
}

function identifyPieceByColor(imgData) {
    // x, y towards center. Offset downwards a bit to increase accuracy
    let x = Math.floor(imgData.width / 2);
    let y = Math.floor(imgData.height * 0.625);
    let [r, g, b] = getPixel(x, y, imgData);

    // No hold piece
    if (black(r, g, b)) {
        return "empty";
    }

    let piece = colorToPiece(r, g, b);
    if (piece) {
        return piece;
    }
}

function identifyIPiece(imgData) {
    // Middle left or middle right
    let y = Math.floor(imgData.height * 0.5);

    let x = Math.floor(imgData.width * 0.0625);
    if (!black(...getPixel(x, y, imgData))) {
        return true;
    }

    x = Math.floor(imgData.width * 9.9375);
    if (!black(...getPixel(x, y, imgData))) {
        return true;
    }

    return false;
}

function identifyPieceByPosition(imgData) {
    // Bottom left, middle, right
    let y = Math.floor(imgData.height * 0.75);

    let x = Math.floor(imgData.width * 0.2);
    let botLeft = !black(...getPixel(x, y, imgData));
    x = Math.floor(imgData.width * 0.5);
    let botMid = !black(...getPixel(x, y, imgData));
    x = Math.floor(imgData.width * 0.8);
    let botRight = !black(...getPixel(x, y, imgData));

    // Top left, middle, right
    y = Math.floor(imgData.height * 0.25);

    x = Math.floor(imgData.width * 0.2);
    let topLeft = !black(...getPixel(x, y, imgData));
    x = Math.floor(imgData.width * 0.5);
    let topMid = !black(...getPixel(x, y, imgData));
    x = Math.floor(imgData.width * 0.8);
    let topRight = !black(...getPixel(x, y, imgData));

    if (botLeft && botMid && botRight && topRight) {
        return "l";
    }
    if (botLeft && botMid && botRight && topLeft) {
        return "j";
    }
    if (botLeft && botMid && topMid && topRight) {
        return "s";
    }
    if (botLeft && botMid && botRight && topMid) {
        return "t";
    }
    if (botMid && botRight && topLeft && topMid) {
        return "z";
    }
    if (topMid && botMid) {
        return "o";
    }

    return "";
}

function colorToValue(r, g, b) {
    if (black(r, g, b)) {
        return "";
    }
    if (gray(r, g, b)) {
        return "g";
    }
    return colorToPiece(r, g, b);
}

function colorToPiece(r, g, b) {
    if (red(r, g, b)) {
        return "z";
    }
    if (green(r, g, b)) {
        return "s";
    }
    if (blue(r, g, b)) {
        return "j";
    }
    if (orange(r, g, b)) {
        return "l";
    }
    if (cyan(r, g, b)) {
        return "i";
    }
    if (yellow(r, g, b)) {
        return "o";
    }
    if (pink(r, g, b)) {
        return "t";
    }
    return "";
}

function trueWhite(r, g, b) {
    // Bright white
    return (r > 220 && g > 220 && b > 220);
}

function white(r, g, b) {
    // Bright color (trueWhite is more strict)
    let sum = (r + g + b);
    return (r > 150 && g > 150 && b > 150) && (530 < sum);
}

function black(r, g, b, tolerance = 35) {
    // Absence of color is black
    return (r <= tolerance) && (g <= tolerance) && (b <= tolerance);
}

function gray(r, g, b, tolerance = 10) {
    if (black(r, g, b)) {
        return false;
    }
    // Closer to white
    if (r > 210 && g > 210 && b > 210) {
        return false;
    }

    // Chromatic and r, g, b have similar values
    let max = Math.max(r, g, b);
    let low = max - tolerance;
    let high = max + tolerance;

    return (
        (low < r && r < high) &&
        (low < g && g < high) &&
        (low < b && b < high)
    );
}

function red(r, g, b, min = 50) {
    if (gray(r, g, b) || trueWhite(r, g, b)) {
        return false;
    }

    // Red should be dominating
    if (r < g || r < b) {
        return false;
    }

    // Not too dark
    if (r < min) {
        return false;
    }

    let hue = RGBtoHue(r, g, b);
    return inRange(hue, 340, 360) || inRange(hue, 0, 10);
}

function orange(r, g, b) {
    return inRange(RGBtoHue(r, g, b), 10, 40);
}

function yellow(r, g, b) {
    return inRange(RGBtoHue(r, g, b), 40, 75);
}

function green(r, g, b) {
    return inRange(RGBtoHue(r, g, b), 75, 140);
}

function cyan(r, g, b) {
    return inRange(RGBtoHue(r, g, b), 140, 200);
}

function blue(r, g, b) {
    return inRange(RGBtoHue(r, g, b), 200, 255);
}


function pink(r, g, b) {
    return inRange(RGBtoHue(r, g, b), 255, 340);
}

function RGBtoHue(r, g, b) {
    let min = Math.min(r, g, b);
    let max = Math.max(r, g, b);

    // chromatic
    if (min === max) {
        return 0;
    }

    let hue = 0;
    if (max === r) {
        hue = (g - b) / (max - min);
    } else if (max === g) {
        hue = 2 + (b - r) / (max - min);
    } else {
        hue = 4 + (r - g) / (max - min);
    }

    hue *= 60;
    hue %= 360;
    if (hue < 0) {
        hue += 360;
    }

    return Math.round(hue);
}

function inRange(val, min, max) {
    return min <= val && val <= max;
}

function getPixel(x, y, imgData) {
    const p = xyIndex(x, y, imgData.width);
    return [
        imgData.data[p],
        imgData.data[p + 1],
        imgData.data[p + 2]
    ];
}

function setPixel(x, y, imgData, r, g, b) {
    const p = xyIndex(x, y, imgData.width);
    imgData.data[p] = r;
    imgData.data[p + 1] = g;
    imgData.data[p + 2] = b;
}

function xyIndex(x, y, w) {
    return 4 * (y * w + x);
}