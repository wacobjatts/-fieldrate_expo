import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../theme/colors";

type FieldRateCardProps = {
  title: string;
  children?: React.ReactNode;
  variant?: "default" | "highlighted" | "compact";
};

export default function FieldRateCard({ 
  title, 
  children, 
  variant = "default" 
}: FieldRateCardProps) {
  return (
    <View style={[
      styles.card,
      variant === "highlighted" && styles.cardHighlighted,
      variant === "compact" && styles.cardCompact,
    ]}>
      <Text style={[
        styles.title,
        variant === "highlighted" && styles.titleHighlighted,
      ]}>
        {title}
      </Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    backgroundColor: COLORS.surface,
  },
  cardHighlighted: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryDim,
  },
  cardCompact: {
    padding: 12,
    borderRadius: 12,
  },
  title: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  titleHighlighted: {
    color: COLORS.text,
  },
  content: {
    gap: 10,
  },
});
