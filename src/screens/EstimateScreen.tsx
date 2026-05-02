import React, { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import FieldRateCard from "../components/fieldrate/FieldRateCard";
import FieldRateScreen from "../components/fieldrate/FieldRateScreen";
import { logRepository } from "../data/repositories/logRepository";
import { calculateEstimate } from "../domain/estimateMath";
import { summarizeLogsByTask, type TaskRateSummary } from "../domain/performanceMath";
import { COLORS } from "../theme/colors";

import type { WorkLog } from "../types/log";

export default function EstimateScreen() {
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [summaries, setSummaries] = useState<TaskRateSummary[]>([]);
  const [selected, setSelected] = useState("");
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("85");
  const [diff, setDiff] = useState("1.15");
  const [cont, setCont] = useState("0.1");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await logRepository.getAll();
    const s = summarizeLogsByTask(data);
    setLogs(data);
    setSummaries(s);
    if (s.length && !selected) setSelected(s[0].taskName);
  }, [selected]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const sel = summaries.find((s) => s.taskName === selected);

  const est = useMemo(() =>
    calculateEstimate({
      quantity: Number(quantity) || 0,
      mhPerUnit: sel?.averageMHPerUnit || 0,
      ratePerHour: Number(rate) || 0,
      difficultyFactor: Number(diff) || 1,
      contingencyPercent: Number(cont) || 0,
    }),
    [quantity, rate, diff, cont, sel]
  );

  return (
    <FieldRateScreen 
      title="Estimate" 
      subtitle="Build estimates from field rates"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={COLORS.primary} />}
    >
      {/* Rate Selection */}
      <FieldRateCard title="Select Rate">
        {summaries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No rates available. Log work first to build rate memory.
            </Text>
          </View>
        ) : (
          <View style={styles.rateGrid}>
            {summaries.map((s) => (
              <Pressable 
                key={s.taskName} 
                style={[styles.rateCard, selected === s.taskName && styles.rateCardActive]}
                onPress={() => setSelected(s.taskName)}
              >
                <Text style={[styles.rateName, selected === s.taskName && styles.rateNameActive]}>
                  {s.taskName}
                </Text>
                <Text style={[styles.rateValue, selected === s.taskName && styles.rateValueActive]}>
                  {s.averageMHPerUnit.toFixed(2)} MH/{s.unit}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </FieldRateCard>

      {/* Inputs */}
      <FieldRateCard title="Estimate Inputs">
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Quantity</Text>
            <TextInput 
              value={quantity} 
              onChangeText={setQuantity} 
              placeholder="0" 
              placeholderTextColor={COLORS.dim}
              keyboardType="decimal-pad"
              style={styles.input} 
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Rate/Hr ($)</Text>
            <TextInput 
              value={rate} 
              onChangeText={setRate} 
              placeholder="85" 
              placeholderTextColor={COLORS.dim}
              keyboardType="decimal-pad"
              style={styles.input} 
            />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Difficulty Factor</Text>
            <TextInput 
              value={diff} 
              onChangeText={setDiff} 
              placeholder="1.15" 
              placeholderTextColor={COLORS.dim}
              keyboardType="decimal-pad"
              style={styles.input} 
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contingency %</Text>
            <TextInput 
              value={cont} 
              onChangeText={setCont} 
              placeholder="0.1" 
              placeholderTextColor={COLORS.dim}
              keyboardType="decimal-pad"
              style={styles.input} 
            />
          </View>
        </View>
      </FieldRateCard>

      {/* Result */}
      <FieldRateCard title="Estimate Result" variant="highlighted">
        <View style={styles.resultContainer}>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Selected Rate</Text>
            <Text style={styles.resultValue}>
              {sel ? `${sel.averageMHPerUnit.toFixed(2)} MH/${sel.unit}` : "—"}
            </Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Man Hours</Text>
            <Text style={styles.resultValue}>{est.totalManHours.toFixed(2)} MH</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Labor Subtotal</Text>
            <Text style={styles.resultValue}>${est.laborSubtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Contingency</Text>
            <Text style={styles.resultValue}>${est.contingencyAmount.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Bid Total</Text>
            <Text style={styles.totalValue}>${est.bidTotal.toFixed(2)}</Text>
          </View>
        </View>
      </FieldRateCard>

      {/* Quick Reference */}
      {sel && (
        <FieldRateCard title="Rate Details">
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{sel.logCount}</Text>
              <Text style={styles.detailLabel}>Logs</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailValue, styles.successText]}>{sel.bestMHPerUnit.toFixed(2)}</Text>
              <Text style={styles.detailLabel}>Best Rate</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailValue, styles.warningText]}>{sel.worstMHPerUnit.toFixed(2)}</Text>
              <Text style={styles.detailLabel}>Worst Rate</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{sel.averageDifficulty.toFixed(1)}</Text>
              <Text style={styles.detailLabel}>Avg Difficulty</Text>
            </View>
          </View>
        </FieldRateCard>
      )}
    </FieldRateScreen>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyText: {
    color: COLORS.dim,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  rateGrid: {
    gap: 8,
  },
  rateCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  rateCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryDim,
  },
  rateName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },
  rateNameActive: {
    color: COLORS.text,
  },
  rateValue: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  rateValueActive: {
    color: COLORS.primary,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputGroup: {
    flex: 1,
    gap: 6,
  },
  inputLabel: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    fontSize: 14,
    fontWeight: "600",
  },
  resultContainer: {
    gap: 8,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  resultLabel: {
    color: COLORS.muted,
    fontSize: 12,
  },
  resultValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
  },
  totalLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  totalValue: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: "900",
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  detailItem: {
    width: "47%",
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
  },
  detailLabel: {
    color: COLORS.dim,
    fontSize: 10,
    marginTop: 2,
  },
  successText: {
    color: COLORS.success,
  },
  warningText: {
    color: COLORS.warning,
  },
});
