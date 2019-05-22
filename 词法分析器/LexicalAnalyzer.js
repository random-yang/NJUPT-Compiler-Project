let fs = require('fs');

/**
 * 预置的各种字典
 */
// 字母
const letters = [..."qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM"];

// 数字
const digits = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
];

// 保留字
const reserveds = [
    "auto", "break", "case", "switch", "char", "const", "continue", "default", "do", "while",
    "double", "else", "if", "enum", "extern", "float", "for", "goto", "int", "long", "register", "return", "short",
    "signed", "sizeof", "static", "struct", "typedef", "unino", "unsigned", "void", "volatile"
];

// 运算符
const operators = [
    "+", "-", "*", "/", "<", "<=", ">", ">=", "=", "==",
    "!=", "^", "\"", "\'", "#", "&",
    "&&", "|", "||", "%", "~", "<<", ">>", "\\", ".", "\?", "!"
];

// 分隔符
const seperators = [',', ';', '{', '}', '(', ')', '[', ']', ':','\"'];

module.exports = class LA {
    constructor() {
        this.data = '';
        this.point = 0;
        this.preProcessed = [];
        this.processed = [];
    }
    /**
     * 
     * @param {String} char 
     * @returns {Bool}
     */
    _isDigit(char) {
        return digits.includes(char);
    }
    /**
     * 
     * @param {String} char 
     * @returns {Bool}
     */
    _isLetter(char) {
        return letters.includes(char);
    }
    /**
     * 
     * @param {String} char 
     * @returns {Bool}
     */
    _isReserved(char) {
        return reserveds.includes(char);
    }
    /**
     * 
     * @param {String} char 
     * @return {Bool}
     */
    _isOperators(char) {
        return operators.includes(char);
    }
    /**
     * 
     * @param {String} char 
     * @return {Bool}
     */
    _isSeperator(char) {
        return seperators.includes(char);
    }
    _isFileEnd() {
        return this.point >= this.data.length;
    }
    _decresePoint() {
        this.point--;
    }
    _addPoint() {
        this.point++;
    }
    _getChar() {
        let temp = this.data[this.point];
        this._addPoint();
        return temp;
    }
    _initPoint() {
        this.point = 0;
    }
    readFile(path) {
        this.data = fs.readFileSync(path).toString();
    }
    writeFile(path, data) {
        fs.writeFileSync(path, data);
    }
    getPreProcessed() {
        return this.preProcessed;
    }
    getData() {
        return this.data;
    }
    /**
     * @param {String} path
     * @description
     * 预处理程序
     * 去掉注释、多余的空百符等等
     */
    preprocessor(path) {
        this._initPoint(); // 重置point
        let char = '';
        while (!this._isFileEnd()) { // 读到输入字符的末尾结束
            char = this._getChar();
            // 去除注释
            if (char === '/') {
                char = this._getChar()
                // 单行注释
                if (char === '/') {
                    while (this._getChar() !== '\n');
                    char = this._getChar();
                }
                else if (char === '*') {
                    /* 逻辑略显复杂 */
                    while (true) {
                        // 寻找右封闭的 *
                        while (this._getChar() !== '*') {
                            if (this._isFileEnd()) {
                                throw Error('注释缺少右封闭');
                            }
                        }
                        // 右边封闭完整
                        if (this._getChar() === '/') {
                            char = this._getChar();
                            break;
                        }
                        else {
                            this._decresePoint(); // 指针回退
                        }
                    }
                }
                // 普通的 / 符号
                else {
                    this.preProcessed.push('/');
                }
            }
            // 跳过回车、换行、制表符
            if (char === '\n' || char === '\r' || char === '\t') {
                continue;
            }
            // 去除多余空格符号 
            if (char === ' ') {
                while (!this._isFileEnd() && this._getChar() === ' ');
                this._decresePoint(); // 指针回退
            }
            this.preProcessed.push(char);
        }
        // 写入文件
        this.writeFile(path, this.preProcessed.join(''));
    }

    /**
     * @param {String} path
     * @description
     * 词法分析
     */
    processor(path) {

        this._initPoint(); // 重置point
        this.data = this.preProcessed;

        let char = '', token = '';
        while (!this._isFileEnd()) {
            token = ''; // 重制 token
            char = this._getChar();
            // 分隔符
            if (this._isSeperator(char)) {
                console.log(`3 分隔符 ${char}`);
                this.processed.push(`3 分隔符 ${char}\n`);
            }
            // 运算符
            else if (this._isOperators(char)) { // 一字符的运算符
                token += char;
                token += this._getChar();
                if (!this._isOperators(token)) { // 两个字符的运算符
                    this._decresePoint();
                    token = token.slice(0, token.length - 1);
                }
                console.log(`4 运算符 ${token}`);
                this.processed.push(`4 运算符 ${token}\n`);
            }
            // 标识符和保留字
            else if (this._isLetter(char) || char === '_') { // _ 或 数字开头
                token += char;
                do {
                    char = this._getChar();
                    token += char;
                } while (this._isDigit(char) || this._isLetter(char) || char === '_');

                this._decresePoint();
                token = token.slice(0, token.length - 1);

                // 查询保留字字典
                if (this._isReserved(token)) {
                    console.log(`1 保留字 ${token}`);
                    this.processed.push(`1 保留字 ${token}\n`);
                } else {
                    console.log(`2 标识符 ${token}`);
                    this.processed.push(`2 标识符 ${token}\n`);
                }
            }
            // 常数
            else if (this._isDigit(char)) {
                token += char;
                do {
                    char = this._getChar();
                    token += char;
                } while (this._isDigit(char));

                this._decresePoint();
                token = token.slice(0, token.length - 1);

                console.log(`5 常数 ${token}`);
                this.processed.push(`5 常数 ${token}\n`);
            }
            // 跳过单个空格
            else if (char === ' ') {
                continue;
            }
            else {
                throw Error(`Error: [${char}] is illigle`);
            }
        }

        // 写入文件
        this.writeFile(path, this.processed.join(''));
    }
}