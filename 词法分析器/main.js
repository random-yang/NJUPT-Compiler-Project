let LA = require('./LexicalAnalyzer');
const la = new LA();

// 传入被处理文件PATH
la.readFile('main.cpp');
// 调用预处理
// 结果写到preprocess.txt中
la.preprocessor('preprocess.txt');
// 调用分析器
// 结果写到process.txt中
la.processor('process.txt');