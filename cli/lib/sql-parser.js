class Tokenizer {
    constructor(text) {
        this.text = text;
        this.pos = 0;
        this.tokens = [];
    }

    tokenize() {
        while (this.pos < this.text.length) {
            this.skipWhitespace();
            if (this.pos >= this.text.length) break;

            const char = this.text[this.pos];

            if (char === '(') {
                this.tokens.push({type: 'LPAREN', value: '('});
                this.pos++;
            } else if (char === ')') {
                this.tokens.push({type: 'RPAREN', value: ')'});
                this.pos++;
            } else if (char === '[') {
                this.tokens.push({type: 'LBRACKET', value: '['});
                this.pos++;
            } else if (char === ']') {
                this.tokens.push({type: 'RBRACKET', value: ']'});
                this.pos++;
            } else if (char === ',') {
                this.tokens.push({type: 'COMMA', value: ','});
                this.pos++;
            } else if ('=!<>'.includes(char)) {
                this.readOperator();
            } else if (char === "'" || char === '"') {
                this.readString(char);
            } else if (/\d/.test(char)) {
                this.readNumber();
            } else if (/[a-zA-Z_]/.test(char)) {
                this.readWord();
            } else {
                throw new Error(`未知字符: ${char} at position ${this.pos}`);
            }
        }
        return this.tokens;
    }

    skipWhitespace() {
        while (this.pos < this.text.length && /\s/.test(this.text[this.pos])) {
            this.pos++;
        }
    }

    readOperator() {
        const start = this.pos;
        const char = this.text[this.pos];

        if (char === '!' && this.text[this.pos + 1] === '=') {
            this.tokens.push({type: 'OP', value: '!='});
            this.pos += 2;
        } else if (char === '>' && this.text[this.pos + 1] === '=') {
            this.tokens.push({type: 'OP', value: '>='});
            this.pos += 2;
        } else if (char === '<' && this.text[this.pos + 1] === '=') {
            this.tokens.push({type: 'OP', value: '<='});
            this.pos += 2;
        } else if ('=!<>'.includes(char)) {
            this.tokens.push({type: 'OP', value: char});
            this.pos++;
        } else {
            throw new Error(`无效操作符 at position ${start}`);
        }
    }

    readString(quote) {
        this.pos++;
        const start = this.pos;
        while (this.pos < this.text.length && this.text[this.pos] !== quote) {
            this.pos++;
        }
        if (this.pos >= this.text.length) {
            throw new Error(`未闭合的字符串 at position ${start - 1}`);
        }
        const value = this.text.substring(start, this.pos);
        this.tokens.push({type: 'STRING', value});
        this.pos++;
    }

    readNumber() {
        const start = this.pos;
        while (this.pos < this.text.length && /[\d.]/.test(this.text[this.pos])) {
            this.pos++;
        }
        const value = parseFloat(this.text.substring(start, this.pos));
        this.tokens.push({type: 'NUMBER', value});
    }

    readWord() {
        const start = this.pos;
        while (this.pos < this.text.length && /[a-zA-Z0-9_]/.test(this.text[this.pos])) {
            this.pos++;
        }
        const value = this.text.substring(start, this.pos);

        const upper = value.toUpperCase();
        if (upper === 'AND') {
            this.tokens.push({type: 'AND', value: upper});
        } else if (upper === 'OR') {
            this.tokens.push({type: 'OR', value: upper});
        } else if (upper === 'IN') {
            this.tokens.push({type: 'IN', value: upper});
        } else if (upper === 'BETWEEN') {
            this.tokens.push({type: 'BETWEEN', value: upper});
        } else {
            this.tokens.push({type: 'IDENT', value});
        }
    }
}

class Parser {
    constructor(tokens, fieldMap = {}) {
        this.tokens = tokens;
        this.pos = 0;
        this.fieldMap = fieldMap;
    }

    parse() {
        if (this.tokens.length === 0) {
            return {error: '空条件'};
        }
        const result = this.parseExpression();
        if (this.pos < this.tokens.length) {
            return {error: `未解析的 token: ${JSON.stringify(this.tokens[this.pos])}`};
        }
        return result;
    }

    parseExpression() {
        return this.parseOr();
    }

    parseOr() {
        let left = this.parseAnd();

        while (this.match('OR')) {
            const right = this.parseAnd();
            if (left.type === 'or') {
                left.conditions.push(right);
            } else {
                left = {type: 'or', conditions: [left, right]};
            }
        }

        return left;
    }

    parseAnd() {
        let left = this.parseFactor();

        while (this.match('AND')) {
            const right = this.parseFactor();
            if (left.type === 'and') {
                left.conditions.push(right);
            } else {
                left = {type: 'and', conditions: [left, right]};
            }
        }

        return left;
    }

    parseFactor() {
        if (this.match('LPAREN')) {
            const expr = this.parseExpression();
            if (!this.match('RPAREN')) {
                return {error: '缺少右括号 )'};
            }
            return expr;
        }

        return this.parseCondition();
    }

    parseCondition() {
        const fieldToken = this.expect('IDENT');
        if (fieldToken.error) return fieldToken;

        const field = fieldToken.value;

        if (this.match('IN')) {
            if (this.match('LPAREN')) {
                const values = [];
                do {
                    const valueToken = this.tokens[this.pos];
                    if (valueToken.type === 'STRING' || valueToken.type === 'NUMBER') {
                        values.push(valueToken.value);
                        this.pos++;
                    } else if (valueToken.type === 'IDENT') {
                        values.push(valueToken.value);
                        this.pos++;
                    } else {
                        return {error: 'IN 列表中无效的值'};
                    }
                } while (this.match('COMMA'));

                if (!this.match('RPAREN')) {
                    return {error: 'IN 列表缺少 )'};
                }
                return {type: 'condition', field, op: 'IN', value: values};
            }

            if (this.match('LBRACKET')) {
                const minToken = this.tokens[this.pos];
                if (minToken.type !== 'NUMBER' && minToken.type !== 'IDENT') {
                    return {error: '区间下限无效'};
                }
                const min = minToken.value;
                this.pos++;

                if (!this.match('COMMA')) {
                    return {error: '区间缺少逗号'};
                }

                const maxToken = this.tokens[this.pos];
                if (maxToken.type !== 'NUMBER' && maxToken.type !== 'IDENT') {
                    return {error: '区间上限无效'};
                }
                const max = maxToken.value;
                this.pos++;

                if (!this.match('RBRACKET')) {
                    return {error: '区间缺少 ]'};
                }
                return {type: 'condition', field, op: 'BETWEEN', value: [min, max]};
            }

            return {error: 'IN 后缺少 ( 或 ['};
        }

        const opToken = this.expect('OP');
        if (opToken.error) return opToken;

        const op = opToken.value;
        const valueToken = this.tokens[this.pos];

        if (!valueToken) {
            return {error: '缺少值'};
        }

        if (valueToken.type === 'STRING') {
            this.pos++;
            return {type: 'condition', field, op, value: valueToken.value};
        }

        if (valueToken.type === 'NUMBER') {
            this.pos++;
            return {type: 'condition', field, op, value: valueToken.value};
        }

        if (valueToken.type === 'IDENT') {
            this.pos++;
            if (this.fieldMap[valueToken.value]) {
                return {type: 'condition', field, op: 'FIELD_CMP', cmpOp: op, value: valueToken.value};
            }
            return {type: 'condition', field, op, value: valueToken.value};
        }

        return {error: `无效的值: ${JSON.stringify(valueToken)}`};
    }

    match(type) {
        if (this.pos < this.tokens.length && this.tokens[this.pos].type === type) {
            this.pos++;
            return true;
        }
        return false;
    }

    expect(type) {
        if (this.pos < this.tokens.length && this.tokens[this.pos].type === type) {
            const token = this.tokens[this.pos];
            this.pos++;
            return token;
        }
        return {error: `期望 ${type}，但得到 ${this.tokens[this.pos] ? this.tokens[this.pos].type : 'EOF'}`};
    }
}

function parseSql(text, fieldMap = {}) {
    text = text.trim();
    if (!text) return {error: '请输入查询条件'};

    text = text.replace(/^\s*SELECT\s+.*?\s+FROM\s+stocks\s*/i, '');
    text = text.replace(/^\s*SELECT\s+\*\s+FROM\s+stocks\s*/i, '');
    text = text.replace(/^\s*FROM\s+stocks\s*/i, '');

    let whereText = '';
    let orderByText = '';
    let limitText = '';

    const limitMatch = text.match(/\bLIMIT\s+(\d+)\s*$/i);
    if (limitMatch) {
        limitText = limitMatch[1];
        text = text.substring(0, limitMatch.index).trim();
    }

    const orderMatch = text.match(/\bORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?\s*$/i);
    if (orderMatch) {
        orderByText = orderMatch[0];
        text = text.substring(0, orderMatch.index).trim();
    }

    const whereMatch = text.match(/^\s*WHERE\s+/i);
    if (whereMatch) {
        whereText = text.substring(whereMatch[0].length).trim();
    } else {
        whereText = text;
    }

    if (!whereText) return {error: '请输入 WHERE 条件'};

    try {
        const tokenizer = new Tokenizer(whereText);
        const tokens = tokenizer.tokenize();
        const parser = new Parser(tokens, fieldMap);
        const parseResult = parser.parse();

        if (parseResult.error) return parseResult;

        const result = {conditions: parseResult};

        if (orderMatch) {
            result.orderBy = {
                field: orderMatch[1],
                dir: (orderMatch[2] || 'DESC').toUpperCase()
            };
        }

        if (limitText) {
            const n = parseInt(limitText, 10);
            if (n < 1 || n > 100) return {error: 'LIMIT 必须在 1~100 之间'};
            result.limit = n;
        }

        return result;
    } catch (err) {
        return {error: err.message};
    }
}

module.exports = {Tokenizer, Parser, parseSql};