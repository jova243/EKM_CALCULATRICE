let input = document.getElementById("inputBox");
let buttons = document.querySelectorAll("button");
let expression = "";
let memory = 0;
let lastAnswer = 0;
let degMode = true;

function factorial(n){
    if(n < 0) return NaN;
    if(n === 0) return 1;
    let res = 1;
    for(let i=1;i<=n;i++) res *= i;
    return res;
}

function safeEvaluate(exp) {
    if (!exp || exp.trim() === '') return 0;
    
    console.log("Évaluation de:", exp);
    

    exp = exp.replace(/(\d+(?:\.\d+)?)²/g, (match, num) => `Math.pow(${num},2)`);
    
    exp = exp.replace(/\(([^)]+)\)²/g, (match, inner) => `Math.pow((${inner}),2)`);
    
  
    exp = exp.replace(/√(\d+(?:\.\d+)?)/g, (match, num) => `Math.sqrt(${num})`);
    
    
    exp = exp.replace(/√\(([^)]+)\)/g, (match, inner) => `Math.sqrt(${inner})`);
    
    
    exp = exp.replace(/π/g, "Math.PI")
             .replace(/e/g, "Math.E")
             .replace(/Ans/g, lastAnswer.toString());
    
    
    exp = exp.replace(/\^/g, "**");
    
    
    function evaluateOneFunction(str) {
        
        const lastSin = str.lastIndexOf('sin(');
        const lastCos = str.lastIndexOf('cos(');
        const lastTan = str.lastIndexOf('tan(');
        const lastLog = str.lastIndexOf('log(');
        const lastLn = str.lastIndexOf('ln(');
        
        const positions = [lastSin, lastCos, lastTan, lastLog, lastLn].filter(p => p !== -1);
        if (positions.length === 0) return {str: str, changed: false};
        
        const startPos = Math.max(...positions);
        
        let funcName;
        if (startPos === lastSin) funcName = 'sin';
        else if (startPos === lastCos) funcName = 'cos';
        else if (startPos === lastTan) funcName = 'tan';
        else if (startPos === lastLog) funcName = 'log';
        else if (startPos === lastLn) funcName = 'ln';
        
        let parenCount = 0;
        let endPos = -1;
        let arg = "";
        
        for (let i = startPos + funcName.length + 1; i < str.length; i++) {
            if (str[i] === '(') {
                parenCount++;
            } else if (str[i] === ')') {
                if (parenCount === 0) {
                    endPos = i;
                    arg = str.substring(startPos + funcName.length + 1, i);
                    break;
                }
                parenCount--;
            }
        }
        
        if (endPos === -1) return {str: str, changed: false};
        

        const argResult = evaluateOneFunction(arg);
        let argValue;
        
        if (argResult.changed) {
            argValue = argResult.str;
        } else {
            
            try {
                argValue = new Function('return ' + arg.replace(/,/g, '.'))();
            } catch {
                argValue = parseFloat(arg) || 0;
            }
        }
        
        
        let result;
        switch(funcName) {
            case 'sin':
                result = Math.sin(degMode ? argValue * Math.PI / 180 : argValue);
                break;
            case 'cos':
                result = Math.cos(degMode ? argValue * Math.PI / 180 : argValue);
                break;
            case 'tan':
                result = Math.tan(degMode ? argValue * Math.PI / 180 : argValue);
                break;
            case 'log':
                result = Math.log10(argValue);
                break;
            case 'ln':
                result = Math.log(argValue);
                break;
            default:
                result = argValue;
        }
        
        
        const before = str.substring(0, startPos);
        const after = str.substring(endPos + 1);
        const newStr = before + result.toString() + after;
        
        return {str: newStr, changed: true};
    }
    
    
    let currentExp = exp;
    let changed = true;
    
    while (changed) {
        const result = evaluateOneFunction(currentExp);
        currentExp = result.str;
        changed = result.changed;
    }
    
    try {
        currentExp = currentExp.replace(/,/g, '.');
        
        const result = new Function('return ' + currentExp)();
        
        const rounded = Math.abs(result) < 1e-12 ? 0 : Number(result.toFixed(10));
        
        console.log("Résultat final:", rounded);
        return rounded;
    } catch (e) {
        console.error("Erreur d'évaluation:", e.message);
        throw new Error("Erreur de calcul");
    }
}

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        let val = btn.innerText;

        switch(val) {
            case "AC":
                expression = "";
                input.value = "0";
                break;

            case "DEL":
                expression = expression.slice(0, -1);
                input.value = expression || "0";
                break;

            case "=":
                try {
                    let result = safeEvaluate(expression);
                    input.value = result;
                    expression = result.toString();
                    lastAnswer = result;
                } catch(error) {
                    input.value = "Erreur";
                    expression = "";
                    console.error("Erreur:", error.message);
                }
                break;

            case "π":
            case "e":
                expression += val;
                input.value = expression;
                break;

            case "√":
                expression += "√(";
                input.value = expression;
                break;

            case "x²":
                if (expression) {
                    if (/[\d)]$/.test(expression)) {
                        expression += "²";
                    } else {
                        expression = `(${expression})²`;
                    }
                    input.value = expression;
                }
                break;

            case "xʸ":
                expression += "^";
                input.value = expression;
                break;

            case "1/x":
                if (expression) {
                    expression = `1/(${expression})`;
                    input.value = expression;
                }
                break;

            case "n!":
                if (expression) {
                    try {
                        let num = parseInt(expression);
                        expression = factorial(num).toString();
                        input.value = expression;
                    } catch {
                        input.value = "Erreur";
                        expression = "";
                    }
                }
                break;

            case "±":
                if (expression) {
                    expression = `-(${expression})`;
                    input.value = expression;
                }
                break;

            case "|x|":
                if (expression) {
                    expression = `abs(${expression})`;
                    input.value = expression;
                }
                break;

            case "sin":
            case "cos":
            case "tan":
            case "log":
            case "ln":
                expression += val + "(";
                input.value = expression;
                break;

            case "(":
            case ")":
                expression += val;
                input.value = expression;
                break;

            case "DEG/RAD":
                degMode = !degMode;
                btn.innerText = degMode ? "DEG" : "RAD";
                input.style.color = degMode ? "black" : "blue";
                break;

            case "MC": 
                memory = 0; 
                input.value = "Mémoire effacée";
                setTimeout(() => input.value = expression || "0", 1000);
                break;
                
            case "MR": 
                expression += memory.toString(); 
                input.value = expression; 
                break;
                
            case "M+": 
                try {
                    let current = parseFloat(safeEvaluate(expression)) || 0;
                    memory += current; 
                    input.value = "M+ " + current;
                    setTimeout(() => input.value = expression || "0", 800);
                } catch {
                    input.value = "Erreur M+";
                }
                break;
                
            case "M-": 
                try {
                    let current = parseFloat(safeEvaluate(expression)) || 0;
                    memory -= current; 
                    input.value = "M- " + current;
                    setTimeout(() => input.value = expression || "0", 800);
                } catch {
                    input.value = "Erreur M-";
                }
                break;

            default:
                
                if ("0123456789+-*/.%".includes(val)) {
                    expression += val;
                    input.value = expression;
                }
        }
    });
});