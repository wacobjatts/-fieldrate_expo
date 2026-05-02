import React, { useCallback, useState } from "react";
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import FieldRateCard from "../components/fieldrate/FieldRateCard";
import FieldRateScreen from "../components/fieldrate/FieldRateScreen";
import { logRepository } from "../data/repositories/logRepository";
import {
  calculateOverallAverageMHPerUnit,
  summarizeLogsByTask,
  type TaskRateSummary,
} from "../domain/performanceMath";
import { COLORS } from "../theme/colors";
import type { WorkLog } from "../types/log";

export default function PerformanceScreen() {
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [summaries, setSummaries] = useState<TaskRateSummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadPerformance = useCallback(async () => {
    const savedLogs = await logRepository.getAll();
    setLogs(savedLogs);
    setSummaries(summarizeLogsByTask(savedLogs));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPerformance();
    }, [loadPerformance])
  );

  async function deleteLog(logId: string) {
    await logRepository.remove(logId);
    await loadPerformance();
  }

  async function refresh() {
    setRefreshing(true);
    await loadPerformance();
    setRefreshing(false);
  }

  const totalManHours = logs.reduce((total, log) => total + log.manHours, 0);
  const totalQuantity = logs.reduce((total, log) => total + log.quantity, 0);
  const overallRate = calculateOverallAverageMHPerUnit(logs);

  return (
    <FieldRateScreen
      title="Performance"
      subtitle="Analyze production rates"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={COLORS.primary} />
      }
    >
      <FieldRateCard title="Production Summary">
        <View style={styles.metricGrid}>
          <MetricCard label="Logs" value={String(logs.length)} />
          <MetricCard label="Total Quantity" value={formatNumber(totalQuantity)} />
          <MetricCard label="Total MH" value={formatNumber(totalManHours)} />
          <MetricCard label="Avg MH/Unit" value={formatNumber(overallRate)} highlight />
        </View>
      </FieldRateCard>

      <FieldRateCard title="Rate Memory">
        {summaries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>+</Text>
            <Text style={styles.emptyText}>
              No rate memory yet. Log work first to build performance history.
            </Text>
          </View>
        ) : (
          summaries.map((summary) => (
            <View key={`${summary.taskName}-${summary.unit}`} style={styles.summaryItem}>
              <View style={styles.summaryHeader}>
                <Text style={styles.taskName}>{summary.taskName}</Text>
                <Text style={styles.unit}>{summary.unit}</Text>
              </View>

              <View style={styles.summaryStats}>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryStatValue}>{summary.logCount}</Text>
                  <Text style={styles.summaryStatLabel}>Logs</Text>
                </View>
                <View style={styles.summaryStat}>
                  <Text style={[styles.summaryStatValue, styles.primaryValue]}>
                    {formatNumber(summary.averageMHPerUnit)}
                  </Text>
                  <Text style={styles.summaryStatLabel}>Avg MH</Text>
                </View>
                <View style={styles.summaryStat}>
                  <Text style={[styles.summaryStatValue, styles.successValue]}>
                    {formatNumber(summary.bestMHPerUnit)}
                  </Text>
                  <Text style={styles.summaryStatLabel}>Best</Text>
                </View>
                <View style={styles.summaryStat}>
                  <Text style={[styles.summaryStatValue, styles.warningValue]}>
                    {formatNumber(summary.worstMHPerUnit)}
                  </Text>
                  <Text style={styles.summaryStatLabel}>Worst</Text>
                </View>
              </View>

              <View style={styles.difficultyRow}>
                <Text style={styles.difficultyLabel}>Difficulty</Text>
                <View style={styles.difficultyBar}>
                  <View 
                    style={[
                      styles.difficultyFill, 
                      { width: `${(summary.averageDifficulty / 5) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.difficultyValue}>{formatNumber(summary.averageDifficulty)}/5</Text>
              </View>
            </View>
          ))
        )}
      </FieldRateCard>

      <FieldRateCard title="Recent Logs">
        {logs.length === 0 ? (
          <Text style={styles.emptyText}>No logs yet.</Text>
        ) : (
          logs.slice(0, 10).map((log) => (
            <View key={log.id} style={styles.logItem}>
              <View style={styles.logHeader}>
                <Text style={styles.logTaskName}>{log.taskName}</Text>
                <Text style={styles.logDate}>
                  {new Date(log.date).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.logMeta}>
                {log.quantity} {log.unit} - {log.manHours.toFixed(1)} MH - {log.mhPerUnit.toFixed(2)} MH/unit
              </Text>
              <Pressable style={styles.deleteButton} onPress={() => deleteLog(log.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </View>
          ))
        )}
      </FieldRateCard>
    </FieldRateScreen>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

function MetricCard({ label, value, highlight }: MetricCardProps) {
  return (
    <View style={[styles.metric, highlight && styles.metricHighlight]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, highlight && styles.metricValueHighlight]}>{value}</Text>
    </View>
  );
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "0";
  return value % 1 === 0 ? String(value) : value.toFixed(2);
}

const styles = StyleSheet.create({
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metric: {
    minWidth: "46%",
    flexGrow: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: COLORS.background,
  },
  metricHighlight: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryDim,
  },
  metricLabel: {
    color: COLORS.dim,
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 4,
  },
  metricValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
  },
  metricValueHighlight: {
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyIcon: {
    fontSize: 32,
    color: COLORS.dim,
    marginBottom: 8,
  },
  emptyText: {
    color: COLORS.dim,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  summaryItem: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    backgroundColor: COLORS.background,
    marginBottom: 8,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  taskName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  unit: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryStat: {
    alignItems: "center",
  },
  summaryStatValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },
  primaryValue: {
    color: COLORS.primary,
  },
  successValue: {
    color: COLORS.success,
  },
  warningValue: {
    color: COLORS.warning,
  },
  summaryStatLabel: {
    color: COLORS.dim,
    fontSize: 9,
    marginTop: 2,
  },
  difficultyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  difficultyLabel: {
    color: COLORS.dim,
    fontSize: 10,
    fontWeight: "600",
    width: 50,
  },
  difficultyBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  difficultyFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  difficultyValue: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    width: 30,
    textAlign: "right",
  },
  logItem: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: COLORS.background,
    marginBottom: 8,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  logTaskName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  logDate: {
    color: COLORS.dim,
    fontSize: 10,
  },
  logMeta: {
    color: COLORS.muted,
    fontSize: 11,
    marginBottom: 8,
  },
  deleteButton: {
    alignSelf: "flex-start",
  },
  deleteText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: "700",
  },
});
