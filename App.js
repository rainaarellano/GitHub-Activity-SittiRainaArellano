
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  useWindowDimensions,
} from "react-native";

export default function App() {
  const { width, height } = useWindowDimensions();
  const compact = height < 750;
  const [display, setDisplay] = useState("0");
  const [firstOperand, setFirstOperand] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [calculation, setCalculation] = useState("");

  const clear = () => {
    setDisplay("0");
    setFirstOperand(null);
    setOperator(null);
    setWaiting(false);
    setCalculation("");
  };

  const inputDigit = (digit) => {
    if (waiting) {
      setDisplay(String(digit));
      setWaiting(false);
    } else {
      setDisplay(display === "0" ? String(digit) : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waiting) {
      setDisplay("0.");
      setWaiting(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const calculate = (a, b, op) => {
    let result;

    switch (op) {
      case "+":
        result = a + b;
        break;
      case "-":
        result = a - b;
        break;
      case "*":
        result = a * b;
        break;
      case "/":
        if (b === 0) return "Error";
        result = a / b;
        break;
      default:
        return b;
    }

    if (!Number.isFinite(result)) return "Error";
    return Math.round((result + Number.EPSILON) * 1e10) / 1e10;
  };

  const operation = (nextOp) => {
    if (display === "Error") return;

    const value = parseFloat(display);

    if (waiting && nextOp !== "=") {
      setOperator(nextOp);
      setCalculation(`${firstOperand} ${nextOp}`);
      return;
    }

    if (firstOperand === null) {
      if (nextOp !== "=") {
        setFirstOperand(value);
        setOperator(nextOp);
        setCalculation(`${display} ${nextOp}`);
        setWaiting(true);
      }
      return;
    }

    if (operator && nextOp === "=") {
      const expression = `${firstOperand} ${operator} ${display} =`;
      const result = calculate(firstOperand, value, operator);
      setCalculation(expression);

      if (result === "Error") {
        setDisplay("Error");
      } else {
        setDisplay(String(result));
      }

      setFirstOperand(null);
      setOperator(null);
      setWaiting(true);
      return;
    }

    if (operator) {
      const result = calculate(firstOperand, value, operator);

      if (result === "Error") {
        setDisplay("Error");
        setFirstOperand(null);
        setOperator(null);
        setWaiting(false);
        return;
      }

      setFirstOperand(result);
      setDisplay(String(result));
      setOperator(nextOp);
      setCalculation(`${result} ${nextOp}`);
      setWaiting(true);
    }
  };

  const handlePress = (btn) => {
    if (btn === "AC") {
      clear();
      return;
    }

    if (display === "Error") {
      if (/^\d$/.test(btn)) {
        clear();
        setDisplay(btn);
      } else if (btn === ".") {
        clear();
        setDisplay("0.");
      }
      return;
    }

    switch (btn) {
      case "+/-":
        if (display !== "0") {
          setDisplay(
            display.startsWith("-")
              ? display.slice(1)
              : "-" + display
          );
        }
        break;
      case "%":
        setDisplay(String(parseFloat(display) / 100));
        break;
      case ".":
        inputDecimal();
        break;
      case "=":
        if (operator !== null && firstOperand !== null && !waiting) {
          operation("=");
        }
        break;
      case "+":
      case "-":
      case "*":
      case "/":
        operation(btn);
        break;
      default:
        inputDigit(parseInt(btn, 10));
    }
  };

  const buttonColor = (btn) => {
    if (btn === "AC") return styles.clearButton;
    if (btn === "+/-") return styles.signButton;
    if (btn === "%") return styles.percentButton;
    if (btn === "=") return styles.equalsButton;
    if (["/", "*", "-", "+"].includes(btn)) {
      return styles.operatorButton;
    }
    if (btn === ".") return styles.decimalButton;
    return styles.numberButton;
  };

  const textColor = (btn) => {
    if (btn === "AC") return styles.clearText;
    if (btn === "+/-") return styles.signText;
    if (btn === "%") return styles.percentText;
    if (btn === "=") return styles.equalsText;
    if (["/", "*", "-", "+"].includes(btn)) {
      return styles.operatorText;
    }
    return styles.numberText;
  };

  const rows = [
    ["AC", "+/-", "%", "/"],
    ["7", "8", "9", "*"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "="],
  ];

  const gap = 9;
  const sidePadding = 20;
  const buttonWidth = Math.min(
    82,
    (width - sidePadding * 2 - gap * 3) / 4
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#10121F" />

      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>RAIN'S CALCULATOR</Text>
            <Text style={styles.title}>Calculator</Text>
            <Text style={styles.subtitle}>Your daily smart calculator</Text>
          </View>

          <View style={styles.proBadge}>
            <Text style={styles.proText}>PRO ✦</Text>
          </View>
        </View>

        <View style={styles.displayArea}>
          <View style={styles.displayCard}>
            <Text
              style={styles.expression}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
            >
              {calculation || "Let's calculate"}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.resultLabel}>RESULT</Text>

            <Text
              style={[
                styles.result,
                compact && { fontSize: 46 },
                display.length > 9 && { fontSize: 38 },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.35}
            >
              {display}
            </Text>
          </View>
        </View>

        <View style={styles.keypad}>
          {rows.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={[
                styles.row,
                { gap, marginBottom: compact ? 8 : 11 },
              ]}
            >
              {row.map((btn) => (
                <TouchableOpacity
                  key={btn}
                  activeOpacity={0.72}
                  onPress={() => handlePress(btn)}
                  style={[
                    styles.button,
                    buttonColor(btn),
                    {
                      width: btn === "0" ? buttonWidth * 2 + gap : buttonWidth,
                      height: compact ? 57 : 67,
                    },
                  ]}
                >
                  <Text style={textColor(btn)}>
                    {btn === "*" ? "×" : btn === "/" ? "÷" : btn}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        <Text style={styles.footer}>SIMPLE  •  FAST  •  ACCURATE</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#10121F",
  },

  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },

  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 10,
  },

  brand: {
    color: "#A78BFA",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2.5,
    marginBottom: 5,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.8,
  },

  subtitle: {
    color: "#8D93AC",
    fontSize: 11,
    marginTop: 4,
  },

  proBadge: {
    backgroundColor: "#28213F",
    borderWidth: 1,
    borderColor: "#7C5CFC",
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  proText: {
    color: "#D4C5FF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  displayArea: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    paddingBottom: 16,
  },

  displayCard: {
    minHeight: 155,
    width: "100%",
    backgroundColor: "#1B2034",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#303852",
    paddingHorizontal: 20,
    paddingVertical: 18,
    justifyContent: "center",
    alignItems: "flex-end",
  },

  expression: {
    width: "100%",
    color: "#B8A4FF",
    textAlign: "right",
    fontSize: 19,
    fontWeight: "600",
    minHeight: 29,
  },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#353C56",
    marginVertical: 13,
  },

  resultLabel: {
    color: "#8991AD",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 3,
    marginBottom: 4,
  },

  result: {
    color: "#FFFFFF",
    fontSize: 53,
    fontWeight: "300",
    letterSpacing: -1.5,
  },

  keypad: {
    width: "100%",
    alignItems: "center",
    paddingTop: 4,
  },

  row: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },

  button: {
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },

  numberButton: {
    backgroundColor: "#263657",
    borderColor: "#354C75",
  },

  numberText: {
    color: "#EAF2FF",
    fontSize: 25,
    fontWeight: "700",
  },

  clearButton: {
    backgroundColor: "#592D4A",
    borderColor: "#A64E7A",
  },

  clearText: {
    color: "#FFC1DE",
    fontSize: 16,
    fontWeight: "800",
  },

  signButton: {
    backgroundColor: "#204D50",
    borderColor: "#347F7D",
  },

  signText: {
    color: "#A6FFF0",
    fontSize: 17,
    fontWeight: "800",
  },

  percentButton: {
    backgroundColor: "#34552E",
    borderColor: "#5D914A",
  },

  percentText: {
    color: "#C7FFAD",
    fontSize: 19,
    fontWeight: "800",
  },

  operatorButton: {
    backgroundColor: "#392B68",
    borderColor: "#7258C7",
  },

  operatorText: {
    color: "#D9CCFF",
    fontSize: 28,
    fontWeight: "800",
  },

  decimalButton: {
    backgroundColor: "#34445D",
    borderColor: "#536B8D",
  },

  equalsButton: {
    backgroundColor: "#F28C45",
    borderColor: "#FFB26F",
  },

  equalsText: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "900",
  },

  footer: {
    color: "#717A97",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    textAlign: "center",
    paddingTop: 8,
    paddingBottom: 4,
  },
});
