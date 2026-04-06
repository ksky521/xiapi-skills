const axios = require('axios');

const API_BASE_URL = 'https://daxiapi.com/coze';

async function getKline(token, code) {
    try {
        const response = await axios.post(`${API_BASE_URL}/get_kline`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                code: code
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

async function getDividendScore(token, code) {
    try {
        const klineData = await getKline(token, code);
        const {klines} = klineData;

        // 计算打分结果
        const scores = calculateScores(klines);

        // 取最近60天的数据
        const recentScores = scores.slice(-60);

        // 格式化输出
        const result = {
            code: code,
            name: klineData.name || '未知指数',
            scores: recentScores.map(item => ({
                date: item.date,
                score: item.totalScore,
                cs: item.cs,
                rsi: item.rsi
            }))
        };

        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// 计算EMA
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

// 计算MA
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

// 计算RSI
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

// 计算百分位数
function percentile(p, arr) {
    if (!arr.length) {
        return 0;
    }
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
}

// 计算滚动分数
function calculateRollingScore(value, historyValues, lowPercentile, highPercentile) {
    const validValues = historyValues.filter(v => v !== null && !isNaN(v));
    if (validValues.length < 10 || value === null) {
        return null;
    }

    const low = percentile(lowPercentile, validValues);
    const high = percentile(highPercentile, validValues);

    if (low === high) {
        return 50;
    }

    let score = ((value - low) / (high - low)) * 100;
    score = Math.max(0, Math.min(100, score));
    return parseFloat(score.toFixed(2));
}

// 计算综合分数
function calculateScores(data) {
    const ROLLING_WINDOW = 440;
    const PERCENTILE_LOW = 5;
    const PERCENTILE_HIGH = 95;
    const SCORE_MA_PERIOD = 5;

    const closes = data.map(d => d.close);
    const {cs} = calculateEMA(20, data);
    const [_, ma80Bias] = calculateMA(80, data);
    const rsi = calculateRSI(closes, 20);

    for (let i = 0; i < data.length; i++) {
        data[i].cs = cs[i] === '-' ? null : parseFloat(cs[i]);
        data[i].ma80Bias = ma80Bias[i] === '-' ? null : parseFloat(ma80Bias[i]);
        data[i].rsi = rsi[i];
    }

    const csValues = data.map(d => d.cs);
    const ma80BiasValues = data.map(d => d.ma80Bias);

    for (let i = 0; i < data.length; i++) {
        const current = data[i];
        if (current.cs === null || current.ma80Bias === null || current.rsi === null) {
            current.csScore = null;
            current.ma80Score = null;
            current.rsiScore = null;
            current.totalScore = null;
            current.scoreMA = null;
            continue;
        }

        const startIdx = Math.max(0, i - ROLLING_WINDOW + 1);
        const csHistory = csValues.slice(startIdx, i + 1);
        const ma80History = ma80BiasValues.slice(startIdx, i + 1);

        current.csScore = calculateRollingScore(current.cs, csHistory, PERCENTILE_LOW, PERCENTILE_HIGH);
        current.ma80Score = calculateRollingScore(current.ma80Bias, ma80History, PERCENTILE_LOW, PERCENTILE_HIGH);
        current.rsiScore = current.rsi;

        if (current.csScore !== null && current.ma80Score !== null && current.rsiScore !== null) {
            current.totalScore = parseFloat(
                (current.csScore * 0.35 + current.ma80Score * 0.35 + current.rsiScore * 0.3).toFixed(2)
            );
        } else {
            current.totalScore = null;
        }
    }

    for (let i = 0; i < data.length; i++) {
        const current = data[i];
        if (current.totalScore === null) {
            current.scoreMA = null;
            continue;
        }

        const scoreHistory = data
            .slice(Math.max(0, i - SCORE_MA_PERIOD + 1), i + 1)
            .filter(d => d.totalScore !== null)
            .map(d => d.totalScore);

        if (scoreHistory.length >= SCORE_MA_PERIOD) {
            current.scoreMA = parseFloat((scoreHistory.reduce((a, b) => a + b, 0) / scoreHistory.length).toFixed(2));
        } else {
            current.scoreMA = current.totalScore;
        }
    }

    return data;
}

module.exports = {
    getKline,
    getDividendScore
};
