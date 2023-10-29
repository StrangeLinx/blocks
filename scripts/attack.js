
export default class Attack {

    // Uses TETRI.OS' "Multiplier" attack table

    // From Tetrio's discord:
    // Attack for singles (1 line clear):
    //   floor(log1p(1.25*combo))
    //   combo is combo level achieved from line clear
    // 
    // Attack for other line clears:
    //   floor((Base + B2BL)*(4 + combo)/4)
    //   Base is the base attack of the line clear
    //   B2BL is the current back to back level (determined by amount of back to backs performed)
    //   combo is the combo level

    constructor() {
        this.base = {
            1: 0,
            2: 1,
            3: 2,
            4: 4
        };

        this.tSpinBase = {
            1: 2,
            2: 4,
            3: 6
        };

    }

    calc(lineClears, combo = 0, b2b = 0, tspin = false, miniTSpin = false, perfectClear = false) {
        let perfectClearAttack = 0;
        if (perfectClear) {
            perfectClearAttack = 10;
        }

        // Singles (no t spin) and Mini T Spin Singles with b2b 0 are equivalent
        if (lineClears === 1 && (!(tspin || miniTSpin) || (miniTSpin && b2b === 0))) {
            return this.single(combo) + perfectClearAttack;
        }

        return this.multiple(lineClears, combo, b2b, tspin) + perfectClearAttack;
    }

    single(combo) {
        return Math.floor(Math.log1p(1.25 * combo));
    }

    multiple(lineClears, combo, b2b, tSpin) {
        let base = this.baseAttack(lineClears, tSpin);
        let B2BL = this.b2bLevel(b2b);
        return Math.floor((base + B2BL) * (4 + combo) / 4);
    }

    baseAttack(lineClears, tSpin) {
        if (tSpin) {
            return this.tSpinBase[lineClears];
        }

        // Normal line clear and mini t spins have same base attack
        return this.base[lineClears];
    }

    b2bLevel(b2b) {
        if (b2b <= 0) {
            return 0;
        }
        if (b2b <= 2) {
            return 1;
        }
        if (b2b <= 7) {
            return 2;
        }
        if (b2b <= 23) {
            return 3;
        }
        if (b2b <= 66) {
            return 4;
        }
        if (b2b <= 184) {
            return 5;
        }
        if (b2b <= 503) {
            return 6;
        }
        if (b2b <= 1369) {
            return 7;
        }
        // 1370+
        return 8;
    }

}