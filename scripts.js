
// Get the id="display" input
const display = document.getElementById('display');

// Add a Error message if the equation is wrong
function appendValue(value) { //appendValue() - Adds number or symbol to the field
    if (display.value === 'Error') display.value = '';
    display.value += value;
}

// Clear display - empties everything
function clearDisplay() {
    display.value = '';
}

// Delete last number - removes the last character
function deleteChar() {
    display.value = display.value.slice(0, -1);
}

// Main calculate function
function calculate() {
    try {
        const raw = display.value;
        if (!raw) return; //if empty it will stop

        // Convert any percent symbols in the equation and converts them into something JavaScript can understand.
        const processed = preprocessPercent(raw); // 200 - 50% = 200 becomes 200*50/100

        // To make sure the input only has digits, operators, parentheses, decimal point and spaces
        // If something weird (like a letter) appears, it throws an error 'Invalid Characters'.
        if (/[^0-9.+\-*/()\. \s]/.test(processed)) throw new Error('Invalid Characters');

        // Evaluate expression safely using Function constructor
        // The math expression stored in processed is use to compute simple basic operations
        const result = Function('"use strict"; return (' + processed + ');')();

        // Show result - converts the result to a string and shows it in the display.
        display.value = String(result);

    } catch (err) { // 'err' - special variable that .js automatically creates when something goes wrong
        display.value = 'Error'; // shows "Error" on text field
        console.error(err); // shows the detailed error message in the browser console (for developers)
    }
}


function preprocessPercent(expression) { // preprocessPercent() - Converts % into real math
    if (!expression) return ''; // If expression is empty or undefined, it just returns an empty string.

    // remove spaces for easier matching
    let expr = expression.replace(/\s+/g, ''); // The \s+ is Regular Expression (RegEx) means one or more spaces

    // Pattern: capture a (left number), operator, b (right number) followed by %
    // The below pattern looks for any formula that looks like:
    // // 200 - 50%
    // // 100 + 10%
    // // 50 * 20%
    const pattern = /(-?(\d+(\.\d+)?))([+\-*/])(-?(\d+(\.\d+)?))%/;
    // // the -?         - optional negative sign (ex: -50)
    // // the \d+        - One or more digits
    // // the (\.\d+)?   - optional decimal (ex: .5 or .25)
    // // the [+\-*/]    - One operator (+, -, *, /)
    // // the %          - A percent symbol

    // .test(expr) checks if the pattern still exists in the string
    // If expr = "200-50%", the loop runs once.
    // If expr = "200-50%+30%", it might run twice.
    while (pattern.test(expr)) {

        // match -> the entire matched text (like "200-50%")
        // a -> the first number (ex; 200)
        // _aDec -> the decimal part of a (if any) - unused but captured for RegEx structure
        // op -> the operator (+, -, *, /)
        // b -> the number before % (ex; 50)
        // This function replaces the percent-based equation (a op b%) with a proper math formula.

        expr = expr.replace(pattern, (match, a, _aDec, op, b) =>{
            if (op === '+' || op === '-') {
                // Treat b% as percentage of a: a + (a*b/100) or a - (a*b/100) | 200 - 50% will become 200 - (200 * 50 / 100)
                return `${a}${op}(${a}*${b}/100)`;
            } else if (op === '*') {
                // Multiplication: a * (b/100) | 50 * 20% -> 50 * (20 / 100) * 10
                return `${a}*(${b}/100)`;
            } else if (op === '/') {
                // Division: a / (b/100) | 100 / 50% -> 100 / (50 / 100) -> 100 / 0.5 -> 200
                return `${a}/(${b}/100)`;
            }
            return match; // fallback or backup option just in case nothing else works
            // If all the operators doesn't work. This code will acts as a safety net so the program doesn't crash.
        });
    }

    // Convert any remaining standalone number% -> (number/100)
    expr = expr.replace(/(-?(\d+(\.\d+)?))%/g, '($1/100)');
    // 5% becomes (5/100)
    // 12.5% becomes (12.5/100)

    //return the updated expression
    return expr;
}