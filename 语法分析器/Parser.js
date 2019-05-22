class Parser {
    constructor() {
        this.Vt = ['*', '+', '(', ')', 'i']; // 终结符
        this.Vn = ['E', 'T', 'F']; // 非终结符 E 为起始符号
        this.grammar = {      // 文法规则
            E: ['E+T', 'T'],
            T: ['T*F', 'F'],
            F: ['(E)', 'i']
        };
        this.kong = 'ε';
        this.FIRST = {};
        this.FOLLOW = {};
        this.analyzeTable = {};
    }
    // 消除左递归
    removeLeftRecursion() {
        let tempG = {};
        for (let i = 0; i < this.Vn.length; i++) {
            // U0单独赋值
            for (let j = 0; j < i; j++) {
                // 将 Ui::=Ujy 的规则改写为 Ui::=x1y|x2y|x3y|...
                const right = this.grammar[this.Vn[i]];
                for (let k in right) {
                    if (right[k][0] === this.Vn[j]) {
                        const right2 = this.grammar[this.Vn[j]];
                        tempG[this.Vn[i]] = !tempG[this.Vn[i]] ? [] : tempG[this.Vn[i]];
                        for (let k2 in right2) {
                            tempG[this.Vn[i]].push(`${right2[k2]}${right[k].substring(1)}`);
                        }
                    } else {
                        tempG[this.Vn[i]] = !tempG[this.Vn[i]] ? [] : tempG[this.Vn[i]];
                        if (!tempG[this.Vn[i]].includes(right[k])) {
                            tempG[this.Vn[i]].push(right[k]);
                        }
                    }
                }
            }
        }
        // U0的情况单独赋值
        tempG[this.Vn[0]] = this.grammar[this.Vn[0]];
        this.grammar = tempG;
        console.log('>>消除间接递归完毕');

        // 消除直接左递归
        this.removeDirectLeftRecursion();
    }
    // 消除直接左递归
    removeDirectLeftRecursion() {
        for (let Vn of this.Vn) {
            const isLeft = this.grammar[Vn].some(item => item[0] === Vn);
            if (!isLeft) continue; // 该终结符不是直接左递归
            // 直接左递归转换算法
            const alpha = this.grammar[Vn].filter(item => item[0] === Vn).map(item => item.substring(1));
            const bate = this.grammar[Vn].filter(item => item[0] !== Vn);

            const newVn = String.fromCharCode(Vn.charCodeAt() + 6); // 新添加的非终结符
            this.Vn.push(newVn); // 更新非终结符
            this.grammar[newVn] = alpha.map(item => `${item}${newVn}`);
            this.grammar[newVn].push(this.kong);
            this.grammar[Vn] = bate.map(item => `${item}${newVn}`);
        }
        console.log('>>消除直接递归完毕');
    }
    buildFIRST() {
        const X = [...this.Vn, ...this.Vt];
        const dfs = (x, first) => {
            if ((this.isVt(x) || this.isKong(x)) && !first.includes(x)) {
                first.push(x);
            } else {
                for (let i in this.grammar[x]) {
                    dfs(this.grammar[x][i][0], first);
                }
            }
        }
        for (let i in X) {
            // 终结符
            if (this.isVt(X[i])) {
                this.FIRST[X[i]] = [X[i]];
            } else { //非终结符
                this.FIRST[X[i]] = [];
                dfs(X[i], this.FIRST[X[i]]);
            }
        }
        // 还没完
        console.log('>>FIRST集构造完毕');
    }
    buildFOLLOW() {
        // 规则1
        this.FOLLOW[this.Vn[0]] = ['#'];
        // 规则2
        for (let i in this.Vn) {
            let currVn = this.Vn[i];
            let right = this.grammar[currVn];
            for (let j in right) {
                let rightPart = right[j];
                for (let k = 0; k < rightPart.length; k++) {
                    if (this.isVn(rightPart[k]) && rightPart[k + 1]) {
                        let first = this.FIRST[rightPart[k + 1]].filter(item => item !== this.kong);
                        let follow = this.FOLLOW[rightPart[k]] ? this.FOLLOW[rightPart[k]] : [];
                        this.FOLLOW[rightPart[k]] = this.unioning(follow, first);
                        break;   // ------|
                    }            //       |
                }                //       |   
                // -----------------------| 
            }
        }
        // 规则3
        for (let i in this.Vn) {
            let currVn = this.Vn[i];
            let right = this.grammar[currVn];
            for (let j in right) {
                let rightPart = right[j];
                let last = rightPart[rightPart.length - 1];
                let lastSecond = rightPart[rightPart.length - 2];
                // 最后一个元素是 Vn
                if (this.isVn(last)) {
                    this.FOLLOW[last] = this.FOLLOW[last] ? this.FOLLOW[last] : [];
                    this.FOLLOW[last] = this.unioning(this.FOLLOW[last], this.FOLLOW[currVn]);
                }
                // 最后两个元素存在 && 最后两个元素为Vn && 最后一个Vn -> this.kong
                if (lastSecond && this.isVn(lastSecond) && this.isVn(last) && this.grammar[last].includes(this.kong)) {
                    this.FOLLOW[lastSecond] = this.FOLLOW[lastSecond] ? this.FOLLOW[lastSecond] : [];
                    this.FOLLOW[lastSecond] = this.unioning(this.FOLLOW[lastSecond], this.FOLLOW[currVn]);
                }
            }
        }
        console.log('>>FOLLOW集构造完毕');
    }
    buildAnalyzeTable() {
        const Vt = [...this.Vt, '#'];
        for (let i in this.Vn) {
            let Vn = this.Vn[i];
            let first = this.FIRST[Vn];
            this.analyzeTable[Vn] = {};
            for (let j in first) {
                let itemInFirst = first[j];
                // 情况（1）
                if (Vt.includes(itemInFirst)) {
                    // -------------------------------- //
                    // --------------BUG--------------- //
                    // -------------------------------- //
                    this.analyzeTable[Vn][itemInFirst] = `${this.grammar[Vn][j] ? this.grammar[Vn][j] : this.grammar[Vn][j - 1]}`;
                }
                // 情况（2）
                if (this.isKong(itemInFirst)) {
                    for (let k in this.FOLLOW[Vn]) {
                        let itemInFollow = this.FOLLOW[Vn][k];
                        this.analyzeTable[Vn][itemInFollow] = `${this.kong}`;
                    }
                }
            }
        }
        console.log('>>分析表构建完毕');
    }
    // 总控程序
    analyze(A) {
        let leftString = [...A, '#'];
        let analyzeStack = ['#', this.Vn[0]];
        let flag = true;
        let counter = 1;

        console.log('分析过程:');
        console.log(' ----------------------------------------------- ');
        console.log(`|步骤\t分析栈\t余留输入串\t生产式\t\t|`); // 打印
        console.log(' ----------------------------------------------- ');
        while(true) {
            const last = analyzeStack[analyzeStack.length - 1];
            const first = leftString[0];
            console.log(`|${counter}\t${analyzeStack.join('')}\t${leftString.join('')}\t\t${first === last ? '' : last+'->'+this.analyzeTable[last][first]}\t\t|`); // 打印
            if(this.isVn(last)) {
                // 查询分析表不存在
                if(!this.analyzeTable[last][first]) {
                    flag = false;
                    break;
                }
                const result = this.analyzeTable[last][first];
                analyzeStack.pop(); // 弹出栈顶
                analyzeStack = this.isKong(result) ? analyzeStack : analyzeStack.concat([...result].reverse()); //逆序入栈
            }
            if(last === first && last !== '#') {
                leftString.shift(); // 弹出剩余输入串的队首
                analyzeStack.pop(); // 弹出栈顶
            }
            if(last === first && last === '#') {
                flag = true;
                break;
            }
            counter++;
        }
        console.log(' ----------------------------------------------- ');
        console.log('分析结果:');
        if(flag) {
            console.log(`分析成功！${A} 是该文法的句子`);
        }else {
            console.log(`分析失败！${A} 不是该文法的句子`);
        }
    }
    isVn(x) {
        return this.Vn.includes(x);
    }
    isVt(x) {
        return this.Vt.includes(x);
    }
    isKong(x) {
        return this.kong === x;
    }
    printFIRST() {
        console.log('FIRST集:');
        console.log(this.FIRST);
    }
    printFOLLOW() {
        console.log('FOLLOW集:');
        console.log(this.FOLLOW);
    }
    printGrammar() {
        console.log('Grammar规则:');
        console.log(this.grammar);
    }
    printAnalyzeTable() {
        const tempVt = [...this.Vt, '#'];
        console.log('分析表:');
        console.log(' ----------------------------------------------- ');
        console.log('|' + tempVt.join('\t') +'\t|');
        console.log(' ----------------------------------------------- ');
        for(let Vn in this.analyzeTable){
            let row = '';
            for(let Vt of tempVt) {
                if(this.analyzeTable[Vn][Vt]) {
                    row += `${Vn}->${this.analyzeTable[Vn][Vt]}\t`;
                }else {
                    row += `∅\t`;
                }
            }
            console.log('|'+ row + '|');
        }
        console.log(' ----------------------------------------------- ');
    }
    /**
     * @param {String} x 
     * x 非终结符
     * @returns Boolean
     * 返回值表示该终结符能否推导到 this.kong
     */
    isCanBeKong(x) {
        let tag = false;
        const dfs = (x) => {
            // console.log(x);
            if (this.isKong(x)) {
                tag = true;
                return;
            };
            if (this.isVn(x)) {
                for (let i in this.grammar[x]) {
                    dfs(this.grammar[x][i][0]);
                }
            }
            return false;
        }
        dfs(x);
        return tag;
    }
    /**
     * 
     * @param {Array} A 
     * @param {Array} B 
     * @returns {Array}
     * @description
     * 求解两集合的并集
     * 返回交集结果数组
     */
    unioning(A, B) {
        return Array.from(new Set([...A, ...B]));
    }
}


module.exports = Parser;