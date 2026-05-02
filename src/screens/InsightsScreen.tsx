import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../theme/colors";

export default function InsightsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.kicker}>FIELD RATE</Text>
      <Text style={styles.title}>Insights</Text>
      <Text style={styles.sub}>Rebuilt clean. Layout and behavior will match the original app.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 18,
    paddingTop: 28,
  },
  kicker: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 10,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  sub: {
    color: COLORS.muted,
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
  },
});
