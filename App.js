
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  useWindowDimensions,
  ScrollView,
} from "react-native";

const C = {
  bg: "#070B20",
  panel: "#0D122B",
  display: "#080F28",
  purple: "#743BFF",
  violet: "#A855F7",
  blue: "#2563EB",
  blueBtn: "#1C315B",
  blueBorder: "#3B5687",
  orange: "#FF8A38",
  orangeLight: "#FFB56B",
  pink: "#F43F80",
  teal: "#14B8A6",
  green: "#65A30D",
  white: "#F8FAFF",
  muted: "#929DC5",
  border: "#252D57",
};

export default function App() {
  const { width, height } = useWindowDimensions();
  const compact = height < 740;

  const [display, setDisplay] = useState("0");
  const [previous, setPrevious] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [expression, setExpression] = useState("");
  const [finished, setFinished] = useState(false);

  const gap = width < 360 ? 8 : 11;
  const padding = width < 360 ? 16 : 22;
  const buttonWidth = Math.min(
    88,
    (width - padding * 2 - gap * 3) / 4
  );
  const buttonHeight = compact ? 53 : Math.min(68, height * 0.085);

  const fmt = (n) => {
    if (!Number.isFinite(n)) return "Error";
    const rounded = Math.round((n + Number.EPSILON) * 1e10) / 1e10;
    return String(rounded);
  };

  const clear = () => {
    setDisplay("0");
    setPrevious(null);
    setOperator(null);
    setWaiting(false);
    setExpression("");
    setFinished(false);
  };

  const digit = (d) => {
    if (display === "Error") {
      setDisplay(String(d));
      setPrevious(null);
      setOperator(null);
      setExpression("");
      setWaiting(false);
      setFinished(false);
      return;
    }

    if (waiting || finished) {
      setDisplay(String(d));
      setWaiting(false);
      setFinished(false);
      return;
    }

    setDisplay((v) => (v === "0" ? String(d) : v + d));
  };

  const decimal = () => {
    if (display === "Error" || waiting || finished) {
      setDisplay("0.");
      setWaiting(false);
      setFinished(false);
      if (display === "Error") {
        setPrevious(null);
        setOperator(null);
        setExpression("");
      }
      return;
    }

    if (!display.includes(".")) setDisplay(display + ".");
  };

  const backspace = () => {
    if (display === "Error" || waiting || finished) {
      setDisplay("0");
      setWaiting(false);
      setFinished(false);
      return;
    }

    setDisplay((v) => {
      const next = v.slice(0, -1);
      return !next || next === "-" ? "0" : next;
    });
  };

  const sign = () => {
    if (display === "Error" || display === "0") return;
    setDisplay((v) => v.startsWith("-") ? v.slice(1) : "-" + v);
    setFinished(false);
  };

  const percent = () => {
    if (display === "Error") return;
    setDisplay(fmt(parseFloat(display) / 100));
    setWaiting(false);
    setFinished(false);
  };

  const compute = (a, b, op) => {
    switch (op) {
      case "+": return fmt(a + b);
      case "-": return fmt(a - b);
      case "*": return fmt(a * b);
      case "/": return b === 0 ? "Error" : fmt(a / b);
      default: return fmt(b);
    }
  };

  const chooseOperator = (next) => {
    if (display === "Error") return;

    const current = parseFloat(display);

    if (operator && waiting) {
      setOperator(next);
      setExpression(`${fmt(previous)} ${next}`);
      return;
    }

    let base = current;

    if (previous !== null && operator && !finished) {
      const result = compute(previous, current, operator);

      if (result === "Error") {
        setDisplay("Error");
        setPrevious(null);
        setOperator(null);
        setWaiting(false);
        setExpression("");
        return;
      }

      base = parseFloat(result);
      setDisplay(result);
    }

    setPrevious(base);
    setOperator(next);
    setExpression(`${fmt(base)} ${next}`);
    setWaiting(true);
    setFinished(false);
  };

  const equals = () => {
    if (
      previous === null ||
      operator === null ||
      waiting ||
      display === "Error"
    ) return;

    const right = parseFloat(display);
    const result = compute(previous, right, operator);

    setExpression(`${fmt(previous)} ${operator} ${display} =`);
    setDisplay(result);
    setPrevious(null);
    setOperator(null);
    setWaiting(true);
    setFinished(true);
  };

  const press = (b) => {
    if (b === "AC") return clear();
    if (b === "⌫") return backspace();
    if (b === "+/-") return sign();
    if (b === "%") return percent();
    if (b === ".") return decimal();
    if (b === "=") return equals();

    if (["+", "-", "*", "/"].includes(b)) {
      return chooseOperator(b);
    }

    if (/^\d$/.test(b)) digit(b);
  };

  const rows = [
    ["AC", "+/-", "%", "/"],
    ["7", "8", "9", "*"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "=", "⌫"],
  ];

  const buttonBackground = (b) => {
    if (b === "AC") return styles.clear;
    if (b === "+/-") return styles.sign;
    if (b === "%") return styles.percent;
    if (b === "⌫") return styles.delete;
    if (b === "=") return styles.equals;
    if (["+", "-", "*", "/"].includes(b)) return styles.operator;
    if (b === ".") return styles.decimal;
    return styles.number;
  };

  const buttonText = (b) => {
    if (b === "AC") return styles.clearText;
    if (b === "+/-") return styles.signText;
    if (b === "%") return styles.percentText;
    if (b === "⌫") return styles.deleteText;
    if (b === "=") return styles.equalsText;
    if (["+", "-", "*", "/"].includes(b)) return styles.operatorText;
    return styles.numberText;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, { paddingHorizontal: padding }]}>
          {/* TOP HEADER */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={styles.brandRow}>
                <View style={styles.brandDot} />
                <Text style={styles.brand}>RAIN'S CALCULATOR</Text>
              </View>

              <Text style={styles.title}>Calculator</Text>
              <Text style={styles.subtitle}>
                Your daily smart calculator
              </Text>
            </View>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>PRO ✦</Text>
            </View>
          </View>

          {/* DISPLAY CARD */}
          <View style={styles.glowBorder}>
            <View style={styles.displayCard}>
              <View style={styles.displayHeading}>
                <View style={styles.liveDot} />
                <Text style={styles.displayCaption}>CALCULATION</Text>
                <View style={{ flex: 1 }} />
                <Text style={styles.displaySymbol}>✦</Text>
              </View>

              <Text
                style={styles.expression}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.6}
              >
                {expression || "Let's calculate"}
              </Text>

              <View style={styles.separator} />

              <Text style={styles.resultLabel}>RESULT</Text>

              <Text
                style={[
                  styles.result,
                  compact && { fontSize: 45 },
                  display.length > 9 && { fontSize: 36 },
                  display.length > 15 && { fontSize: 26 },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.3}
              >
                {display}
              </Text>
            </View>
          </View>

          {/* CALCULATOR BUTTONS */}
          <View style={[styles.keypad, { gap }]}>
            {rows.map((row, ri) => (
              <View key={ri} style={[styles.row, { gap }]}>
                {row.map((b) => (
                  <TouchableOpacity
                    key={b}
                    activeOpacity={0.65}
                    onPress={() => press(b)}
                    accessibilityRole="button"
                    accessibilityLabel={
                      b === "*" ? "Multiply" :
                      b === "/" ? "Divide" :
                      b === "⌫" ? "Delete last digit" : b
                    }
                    style={[
                      styles.button,
                      buttonBackground(b),
                      { width: buttonWidth, height: buttonHeight },
                    ]}
                  >
                    <Text style={buttonText(b)}>
                      {b === "*" ? "×" : b === "/" ? "÷" : b}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <View style={styles.footerStar}>
              <Text style={styles.star}>✦</Text>
            </View>

            <Text style={styles.footerName}>
              SITTI RAINA ARELLANO
            </Text>

            <Text style={styles.footerCaption}>
              SIMPLE  •  FAST  •  ACCURATE
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  scroll: {
    flexGrow: 1,
  },

  container: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 25,
    alignItems: "center",
  },

  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: "#5865FF",
    marginRight: 8,
  },

  brand: {
    color: "#A9B3FF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },

  title: {
    color: C.white,
    fontSize: 31,
    fontWeight: "900",
    letterSpacing: -0.8,
  },

  subtitle: {
    color: "#9AA6D9",
    fontSize: 11,
    marginTop: 4,
  },

  badge: {
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: C.purple,
    backgroundColor: "#211744",
    paddingVertical: 12,
    paddingHorizontal: 13,
    marginLeft: 7,
  },

  badgeText: {
    color: "#C8B4FF",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1,
  },

  glowBorder: {
    width: "100%",
    padding: 2,
    borderRadius: 28,
    backgroundColor: C.purple,
    marginBottom: 22,
    shadowColor: C.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },

  displayCard: {
    width: "100%",
    minHeight: 190,
    borderRadius: 26,
    backgroundColor: C.panel,
    paddingHorizontal: 19,
    paddingVertical: 19,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#29325E",
  },

  displayHeading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#5D83FF",
    marginRight: 8,
  },

  displayCaption: {
    color: C.muted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.8,
  },

  displaySymbol: {
    color: C.violet,
    fontSize: 18,
  },

  expression: {
    width: "100%",
    color: "#B8A2FF",
    textAlign: "right",
    fontSize: 17,
    fontWeight: "600",
    minHeight: 25,
  },

  separator: {
    width: "100%",
    height: 1,
    backgroundColor: "#293152",
    marginVertical: 13,
  },

  resultLabel: {
    color: "#8490B8",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 3,
    textAlign: "right",
    marginBottom: 4,
  },

  result: {
    color: C.white,
    fontSize: 53,
    fontWeight: "300",
    textAlign: "right",
    letterSpacing: -1.5,
    width: "100%",
  },

  keypad: {
    width: "100%",
    alignItems: "center",
  },

  row: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },

  button: {
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 5,
    elevation: 3,
  },

  number: {
    backgroundColor: C.blueBtn,
    borderColor: C.blueBorder,
    shadowColor: "#5C8DFF",
  },

  numberText: {
    color: "#F1F5FF",
    fontSize: 25,
    fontWeight: "700",
  },

  clear: {
    backgroundColor: "#57223F",
    borderColor: "#A43C70",
    shadowColor: C.pink,
  },

  clearText: {
    color: "#FFB8D8",
    fontSize: 15,
    fontWeight: "900",
  },

  sign: {
    backgroundColor: "#174747",
    borderColor: "#25877D",
    shadowColor: C.teal,
  },

  signText: {
    color: "#A5FFF0",
    fontSize: 17,
    fontWeight: "900",
  },

  percent: {
    backgroundColor: "#25452B",
    borderColor: "#54834B",
    shadowColor: "#85D76C",
  },

  percentText: {
    color: "#D1FFBE",
    fontSize: 19,
    fontWeight: "900",
  },

  delete: {
    backgroundColor: "#30224C",
    borderColor: "#63489A",
    shadowColor: C.purple,
  },

  deleteText: {
    color: "#D6C8FF",
    fontSize: 23,
    fontWeight: "800",
  },

  operator: {
    backgroundColor: "#35265E",
    borderColor: "#7552C4",
    shadowColor: C.purple,
  },

  operatorText: {
    color: "#D9C8FF",
    fontSize: 28,
    fontWeight: "900",
  },

  decimal: {
    backgroundColor: "#243552",
    borderColor: "#455D84",
    shadowColor: C.blue,
  },

  equals: {
    backgroundColor: C.orange,
    borderColor: C.orangeLight,
    shadowColor: C.orange,
    shadowOpacity: 0.3,
    elevation: 7,
  },

  equalsText: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "900",
  },

  footer: {
    width: "100%",
    alignItems: "center",
    paddingTop: 26,
  },

  footerStar: {
    marginBottom: 9,
  },

  star: {
    color: "#5D7DFF",
    fontSize: 17,
  },

  footerName: {
    color: "#A9B4FF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.7,
    textAlign: "center",
  },

  footerCaption: {
    color: "#818BB4",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: 10,
    textAlign: "center",
  },
});
