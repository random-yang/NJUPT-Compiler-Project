const Parser = require('./Parser')

const PR = new Parser();
PR.removeLeftRecursion();
PR.buildFIRST();
PR.buildFOLLOW();
PR.buildAnalyzeTable();
PR.printGrammar()
PR.printFIRST()
PR.printFOLLOW()
PR.printAnalyzeTable();
PR.analyze('i+i+i');