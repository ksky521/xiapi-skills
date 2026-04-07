const DIVIDEND_SCORE_CONSTANTS = {
    ROLLING_WINDOW: 440,
    PERCENTILE_LOW: 5,
    PERCENTILE_HIGH: 95,
    SCORE_MA_PERIOD: 5,
    EMA_PERIOD: 20,
    MA_PERIOD: 80,
    RSI_PERIOD: 20,
    MIN_VALID_VALUES: 10,
    MIN_SCORE: 0,
    MAX_SCORE: 100,
    CS_WEIGHT: 0.35,
    MA80_WEIGHT: 0.35,
    RSI_WEIGHT: 0.3
};

function calculateEMA(period, data) {
    const closes = data.map(d => d.close);
    const cs = [];
    let ema = closes[0];
    const multiplier = 2 / (period + 1);

    for (let i = 0; i < closes.length; i++) {
        if (i === 0) {
            ema = closes[i];
        } else {
            ema = (closes[i] - ema) * multiplier + ema;
        }
        cs.push(((closes[i] - ema) / ema) * 100);
    }

    return {cs};
}

function calculateMA(period, data) {
    const closes = data.map(d => d.close);
    const ma = [];
    const maBias = [];

    for (let i = 0; i < closes.length; i++) {
        if (i < period - 1) {
            ma.push('-');
            maBias.push('-');
        } else {
            let sum = 0;
            for (let j = 0; j < period; j++) {
                sum += closes[i - j];
            }
            const avg = sum / period;
            ma.push(avg);
            maBias.push(((closes[i] - avg) / avg) * 100);
        }
    }

    return [ma, maBias];
}

function calculateRSI(closes, period = 20) {
    const rsiValues = [];
    let gains = 0;
    let losses = 0;

    for (let i = 0; i < closes.length; i++) {
        if (i < period) {
            rsiValues.push(null);
            continue;
        }

        const change = closes[i] - closes[i - 1];
        if (i === period) {
            let sumGain = 0;
            let sumLoss = 0;
            for (let j = 1; j <= period; j++) {
                const c = closes[j] - closes[j - 1];
                if (c > 0) {
                    sumGain += c;
                } else {
                    sumLoss += Math.abs(c);
                }
            }
            gains = sumGain / period;
            losses = sumLoss / period;
        } else {
            const currentGain = change > 0 ? change : 0;
            const currentLoss = change < 0 ? Math.abs(change) : 0;
            gains = (gains * (period - 1) + currentGain) / period;
            losses = (losses * (period - 1) + currentLoss) / period;
        }

        if (gains + losses === 0) {
            rsiValues.push(50);
        } else {
            const rs = gains / losses;
            rsiValues.push(parseFloat((100 - 100 / (1 + rs)).toFixed(2)));
        }
    }

    return rsiValues;
}

function percentile(p, arr) {
    if (!arr.length) {
        return 0;
    }
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
}

function calculateRollingScore(value, historyValues, lowPercentile, highPercentile) {
    const validValues = historyValues.filter(v => v !== null && !isNaN(v));
    if (validValues.length < DIVIDEND_SCORE_CONSTANTS.MIN_VALID_VALUES || value === null) {
        return null;
    }

    const low = percentile(lowPercentile, validValues);
    const high = percentile(highPercentile, validValues);

    if (low === high) {
        return 50;
    }

    let score = ((value - low) / (high - low)) * 100;
    score = Math.max(DIVIDEND_SCORE_CONSTANTS.MIN_SCORE, Math.min(DIVIDEND_SCORE_CONSTANTS.MAX_SCORE, score));
    return parseFloat(score.toFixed(2));
}

function calculateScores(data) {
    const dataCopy = data.map(item => ({...item}));

    const closes = dataCopy.map(d => d.close);
    const {cs} = calculateEMA(DIVIDEND_SCORE_CONSTANTS.EMA_PERIOD, dataCopy);
    const [_, ma80Bias] = calculateMA(DIVIDEND_SCORE_CONSTANTS.MA_PERIOD, dataCopy);
    const rsi = calculateRSI(closes, DIVIDEND_SCORE_CONSTANTS.RSI_PERIOD);
    for (let i = 0; i < dataCopy.length; i++) {
        dataCopy[i].cs = cs[i] === '-' ? null : parseFloat(cs[i]);
        dataCopy[i].ma80Bias = ma80Bias[i] === '-' ? null : parseFloat(ma80Bias[i]);
        dataCopy[i].rsi = rsi[i];
    }

    const csValues = dataCopy.map(d => d.cs);
    const ma80BiasValues = dataCopy.map(d => d.ma80Bias);

    for (let i = 0; i < dataCopy.length; i++) {
        const current = dataCopy[i];
        if (current.cs === null || current.ma80Bias === null || current.rsi === null) {
            current.csScore = null;
            current.ma80Score = null;
            current.rsiScore = null;
            current.totalScore = null;
            current.scoreMA = null;
            continue;
        }

        const startIdx = Math.max(0, i - DIVIDEND_SCORE_CONSTANTS.ROLLING_WINDOW + 1);
        const csHistory = csValues.slice(startIdx, i + 1);
        const ma80History = ma80BiasValues.slice(startIdx, i + 1);

        current.csScore = calculateRollingScore(
            current.cs,
            csHistory,
            DIVIDEND_SCORE_CONSTANTS.PERCENTILE_LOW,
            DIVIDEND_SCORE_CONSTANTS.PERCENTILE_HIGH
        );
        current.ma80Score = calculateRollingScore(
            current.ma80Bias,
            ma80History,
            DIVIDEND_SCORE_CONSTANTS.PERCENTILE_LOW,
            DIVIDEND_SCORE_CONSTANTS.PERCENTILE_HIGH
        );
        current.rsiScore = current.rsi;

        if (current.csScore !== null && current.ma80Score !== null && current.rsiScore !== null) {
            current.totalScore = parseFloat(
                (
                    current.csScore * DIVIDEND_SCORE_CONSTANTS.CS_WEIGHT +
                    current.ma80Score * DIVIDEND_SCORE_CONSTANTS.MA80_WEIGHT +
                    current.rsiScore * DIVIDEND_SCORE_CONSTANTS.RSI_WEIGHT
                ).toFixed(2)
            );
        } else {
            current.totalScore = null;
        }
    }

    for (let i = 0; i < dataCopy.length; i++) {
        const current = dataCopy[i];
        if (current.totalScore === null) {
            current.scoreMA = null;
            continue;
        }

        const scoreHistory = dataCopy
            .slice(Math.max(0, i - DIVIDEND_SCORE_CONSTANTS.SCORE_MA_PERIOD + 1), i + 1)
            .filter(d => d.totalScore !== null)
            .map(d => d.totalScore);

        if (scoreHistory.length >= DIVIDEND_SCORE_CONSTANTS.SCORE_MA_PERIOD) {
            current.scoreMA = parseFloat((scoreHistory.reduce((a, b) => a + b, 0) / scoreHistory.length).toFixed(2));
        } else {
            current.scoreMA = current.totalScore;
        }
    }

    return dataCopy;
}

module.exports = {
    DIVIDEND_SCORE_CONSTANTS,
    calculateEMA,
    calculateMA,
    calculateRSI,
    percentile,
    calculateRollingScore,
    calculateScores
};
