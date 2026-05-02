import React, { useCallback, useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS } from "../theme/colors";
import { DrawerContext } from "../navigation/AppNavigator";
import { logRepository } from "../data/repositories/logRepository";
import { summarizeLogsByTask, calculateOverallAverageMHPerUnit, type TaskRateSummary } from "../domain/performanceMath";
import type { WorkLog } from "../types/log";

export default function TimeCostScreen() {
  const { openDrawer } = useContext(DrawerContext);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [summaries, setSummaries] = useState<TaskRateSummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const logData = await logRepository.getAll();
    setLogs(logData);
    setSummaries(summarizeLogsByTask(logData));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  async function refresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  // Calculate totals
  const totalManHours = logs.reduce((sum, log) => sum + log.manHours, 0);
  const totalQuantity = logs.reduce((sum, log) => sum + log.quantity, 0);
  const totalLaborCost = logs.reduce((sum, log) => sum + (log.laborCost || 0), 0);
  const overallRate = calculateOverallAverageMHPerUnit(logs);

  // Planned vs Actual calculations (using demo values if no data)
  const plannedHours = totalManHours > 0 ? totalManHours * 1.15 : 500;
  const actualHours = totalManHours > 0 ? totalManHours : 432;
  const plannedCost = totalLaborCost > 0 ? totalLaborCost * 1.1 : 85000;
  const actualCost = totalLaborCost > 0 ? totalLaborCost : 77280;

  const hoursVariance = plannedHours - actualHours;
  const costVariance = plannedCost - actualCost;
  const hoursPercent = Math.round((actualHours / plannedHours) * 100);
  const costPercent = Math.round((actualCost / plannedCost) * 100);

  const isUnderBudget = costVariance >= 0;
  const isUnderHours = hoursVariance >= 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.menuButton} onPress={openDrawer}>
          <View style={styles.menuIcon}>
            <View style={styles.menuLine} />
            <View style={[styles.menuLine, styles.menuLineShort]} />
            <View style={styles.menuLine} />
          </View>
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Time & Cost</Text>
          <Text style={styles.headerSubtitle}>Production Analysis</Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Performance Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, isUnderHours ? styles.summaryCardGood : styles.summaryCardWarning]}>
            <Text style={styles.summaryLabel}>Hours</Text>
            <Text style={styles.summaryValue}>{hoursPercent}%</Text>
            <Text style={[styles.summaryVariance, isUnderHours ? styles.varianceGood : styles.varianceWarning]}>
              {isUnderHours ? "Under" : "Over"} by {Math.abs(hoursVariance).toFixed(0)}h
            </Text>
          </View>

          <View style={[styles.summaryCard, isUnderBudget ? styles.summaryCardGood : styles.summaryCardWarning]}>
            <Text style={styles.summaryLabel}>Cost</Text>
            <Text style={styles.summaryValue}>{costPercent}%</Text>
            <Text style={[styles.summaryVariance, isUnderBudget ? styles.varianceGood : styles.varianceWarning]}>
              {isUnderBudget ? "Under" : "Over"} ${Math.abs(costVariance).toFixed(0)}
            </Text>
          </View>
        </View>

        {/* Planned vs Actual */}
        <View style={styles.comparisonCard}>
          <Text style={styles.cardTitle}>Planned vs Actual</Text>

          {/* Hours Comparison */}
          <View style={styles.comparisonRow}>
            <View style={styles.comparisonLabel}>
              <Text style={styles.comparisonName}>Man Hours</Text>
            </View>
            <View style={styles.comparisonValues}>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonItemLabel}>Planned</Text>
                <Text style={styles.comparisonItemValue}>{plannedHours.toFixed(0)}</Text>
              </View>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonItemLabel}>Actual</Text>
                <Text style={[styles.comparisonItemValue, styles.actualValue]}>{actualHours.toFixed(0)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarPlanned, { width: "100%" }]} />
              <View 
                style={[
                  styles.progressBarActual, 
                  { width: `${Math.min(hoursPercent, 100)}%` },
                  !isUnderHours && styles.progressBarOver
                ]} 
              />
            </View>
          </View>

          {/* Cost Comparison */}
          <View style={[styles.comparisonRow, styles.marginTop]}>
            <View style={styles.comparisonLabel}>
              <Text style={styles.comparisonName}>Labor Cost</Text>
            </View>
            <View style={styles.comparisonValues}>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonItemLabel}>Planned</Text>
                <Text style={styles.comparisonItemValue}>${plannedCost.toLocaleString()}</Text>
              </View>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonItemLabel}>Actual</Text>
                <Text style={[styles.comparisonItemValue, styles.actualValue]}>${actualCost.toLocaleString()}</Text>
              </View>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarPlanned, { width: "100%" }]} />
              <View 
                style={[
                  styles.progressBarActual, 
                  { width: `${Math.min(costPercent, 100)}%` },
                  !isUnderBudget && styles.progressBarOver
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Production Rates */}
        <View style={styles.ratesCard}>
          <Text style={styles.cardTitle}>Production Rates</Text>
          <Text style={styles.cardSubtitle}>Man-hours per unit by task</Text>

          {summaries.length === 0 ? (
            <View style={styles.emptyRates}>
              <Text style={styles.emptyText}>
                No production data yet. Log work to see rates.
              </Text>
            </View>
          ) : (
            summaries.map((summary) => (
              <View key={`${summary.taskName}-${summary.unit}`} style={styles.rateItem}>
                <View style={styles.rateHeader}>
                  <Text style={styles.rateName}>{summary.taskName}</Text>
                  <Text style={styles.rateUnit}>{summary.unit}</Text>
                </View>

                <View style={styles.rateStats}>
                  <View style={styles.rateStat}>
                    <Text style={styles.rateStatValue}>{summary.averageMHPerUnit.toFixed(2)}</Text>
                    <Text style={styles.rateStatLabel}>Avg MH</Text>
                  </View>
                  <View style={styles.rateStat}>
                    <Text style={[styles.rateStatValue, styles.bestRate]}>{summary.bestMHPerUnit.toFixed(2)}</Text>
                    <Text style={styles.rateStatLabel}>Best</Text>
                  </View>
                  <View style={styles.rateStat}>
                    <Text style={[styles.rateStatValue, styles.worstRate]}>{summary.worstMHPerUnit.toFixed(2)}</Text>
                    <Text style={styles.rateStatLabel}>Worst</Text>
                  </View>
                  <View style={styles.rateStat}>
                    <Text style={styles.rateStatValue}>{summary.logCount}</Text>
                    <Text style={styles.rateStatLabel}>Logs</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStatsCard}>
          <Text style={styles.cardTitle}>Quick Stats</Text>
          <View style={styles.quickStatsGrid}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{logs.length}</Text>
              <Text style={styles.quickStatLabel}>Total Logs</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{totalManHours.toFixed(0)}</Text>
              <Text style={styles.quickStatLabel}>Man Hours</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{totalQuantity.toFixed(0)}</Text>
              <Text style={styles.quickStatLabel}>Units</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{overallRate.toFixed(2)}</Text>
              <Text style={styles.quickStatLabel}>Avg MH/Unit</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: {
    gap: 4,
  },
  menuLine: {
    width: 18,
    height: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 1,
  },
  menuLineShort: {
    width: 12,
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: COLORS.dim,
    fontSize: 11,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  summaryCardGood: {
    borderColor: COLORS.success,
    backgroundColor: "rgba(0, 255, 156, 0.05)",
  },
  summaryCardWarning: {
    borderColor: COLORS.warning,
    backgroundColor: "rgba(255, 184, 0, 0.05)",
  },
  summaryLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: "900",
  },
  summaryVariance: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },
  varianceGood: {
    color: COLORS.success,
  },
  varianceWarning: {
    color: COLORS.warning,
  },
  comparisonCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardSubtitle: {
    color: COLORS.dim,
    fontSize: 11,
    marginBottom: 16,
  },
  comparisonRow: {
    marginBottom: 8,
  },
  marginTop: {
    marginTop: 20,
  },
  comparisonLabel: {
    marginBottom: 8,
  },
  comparisonName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },
  comparisonValues: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  comparisonItem: {
    alignItems: "center",
  },
  comparisonItemLabel: {
    color: COLORS.dim,
    fontSize: 10,
    marginBottom: 2,
  },
  comparisonItemValue: {
    color: COLORS.muted,
    fontSize: 16,
    fontWeight: "700",
  },
  actualValue: {
    color: COLORS.primary,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primaryDim,
    overflow: "hidden",
    position: "relative",
  },
  progressBarPlanned: {
    position: "absolute",
    height: "100%",
    backgroundColor: "rgba(139, 155, 180, 0.3)",
    borderRadius: 4,
  },
  progressBarActual: {
    position: "absolute",
    height: "100%",
    backgroundColor: COLORS.success,
    borderRadius: 4,
  },
  progressBarOver: {
    backgroundColor: COLORS.warning,
  },
  ratesCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  emptyRates: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    color: COLORS.dim,
    fontSize: 12,
    textAlign: "center",
  },
  rateItem: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rateName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  rateUnit: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  rateStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rateStat: {
    alignItems: "center",
  },
  rateStatValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },
  bestRate: {
    color: COLORS.success,
  },
  worstRate: {
    color: COLORS.warning,
  },
  rateStatLabel: {
    color: COLORS.dim,
    fontSize: 9,
    marginTop: 2,
  },
  quickStatsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  quickStat: {
    width: "47%",
    backgroundColor: COLORS.primaryDim,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickStatValue: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  quickStatLabel: {
    color: COLORS.dim,
    fontSize: 10,
    marginTop: 2,
  },
});
