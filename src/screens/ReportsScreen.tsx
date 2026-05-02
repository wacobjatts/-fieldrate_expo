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

type ReportType = "daily" | "weekly" | "cost" | "productivity";

export default function ReportsScreen() {
  const { openDrawer } = useContext(DrawerContext);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [summaries, setSummaries] = useState<TaskRateSummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeReport, setActiveReport] = useState<ReportType>("daily");

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

  // Group logs by date
  const logsByDate = logs.reduce<Record<string, WorkLog[]>>((acc, log) => {
    const date = new Date(log.date).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  const reportTypes: { key: ReportType; label: string }[] = [
    { key: "daily", label: "Daily" },
    { key: "weekly", label: "Weekly" },
    { key: "cost", label: "Cost" },
    { key: "productivity", label: "Productivity" },
  ];

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
          <Text style={styles.headerTitle}>Reports</Text>
          <Text style={styles.headerSubtitle}>Production Analytics</Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      {/* Report Type Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabs}>
            {reportTypes.map((type) => (
              <Pressable
                key={type.key}
                style={[styles.tab, activeReport === type.key && styles.tabActive]}
                onPress={() => setActiveReport(type.key)}
              >
                <Text style={[styles.tabText, activeReport === type.key && styles.tabTextActive]}>
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
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
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{logs.length}</Text>
            <Text style={styles.summaryLabel}>Logs</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalManHours.toFixed(0)}</Text>
            <Text style={styles.summaryLabel}>Man Hours</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalQuantity.toFixed(0)}</Text>
            <Text style={styles.summaryLabel}>Units</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>${(totalLaborCost / 1000).toFixed(1)}k</Text>
            <Text style={styles.summaryLabel}>Labor Cost</Text>
          </View>
        </View>

        {/* Report Content */}
        {activeReport === "daily" && (
          <View style={styles.reportSection}>
            <Text style={styles.sectionTitle}>Daily Log Summary</Text>
            
            {Object.keys(logsByDate).length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No daily logs recorded yet.</Text>
              </View>
            ) : (
              Object.entries(logsByDate).map(([date, dateLogs]) => {
                const dayMH = dateLogs.reduce((sum, l) => sum + l.manHours, 0);
                const dayQty = dateLogs.reduce((sum, l) => sum + l.quantity, 0);
                
                return (
                  <View key={date} style={styles.dailyCard}>
                    <View style={styles.dailyHeader}>
                      <Text style={styles.dailyDate}>{date}</Text>
                      <Text style={styles.dailyCount}>{dateLogs.length} logs</Text>
                    </View>
                    
                    <View style={styles.dailyStats}>
                      <View style={styles.dailyStat}>
                        <Text style={styles.dailyStatValue}>{dayMH.toFixed(1)}</Text>
                        <Text style={styles.dailyStatLabel}>MH</Text>
                      </View>
                      <View style={styles.dailyStat}>
                        <Text style={styles.dailyStatValue}>{dayQty}</Text>
                        <Text style={styles.dailyStatLabel}>Units</Text>
                      </View>
                    </View>

                    {dateLogs.map((log) => (
                      <View key={log.id} style={styles.logItem}>
                        <Text style={styles.logTask}>{log.taskName}</Text>
                        <Text style={styles.logMeta}>
                          {log.quantity} {log.unit} - {log.manHours.toFixed(1)} MH
                        </Text>
                      </View>
                    ))}
                  </View>
                );
              })
            )}
          </View>
        )}

        {activeReport === "weekly" && (
          <View style={styles.reportSection}>
            <Text style={styles.sectionTitle}>Weekly Summary</Text>
            <View style={styles.weeklyCard}>
              <View style={styles.weeklyRow}>
                <Text style={styles.weeklyLabel}>Total Hours</Text>
                <Text style={styles.weeklyValue}>{totalManHours.toFixed(0)} MH</Text>
              </View>
              <View style={styles.weeklyRow}>
                <Text style={styles.weeklyLabel}>Avg Daily Hours</Text>
                <Text style={styles.weeklyValue}>
                  {Object.keys(logsByDate).length > 0 
                    ? (totalManHours / Object.keys(logsByDate).length).toFixed(1) 
                    : "0"} MH
                </Text>
              </View>
              <View style={styles.weeklyRow}>
                <Text style={styles.weeklyLabel}>Days Logged</Text>
                <Text style={styles.weeklyValue}>{Object.keys(logsByDate).length}</Text>
              </View>
              <View style={styles.weeklyRow}>
                <Text style={styles.weeklyLabel}>Task Types</Text>
                <Text style={styles.weeklyValue}>{summaries.length}</Text>
              </View>
            </View>
          </View>
        )}

        {activeReport === "cost" && (
          <View style={styles.reportSection}>
            <Text style={styles.sectionTitle}>Cost Analysis</Text>
            <View style={styles.costCard}>
              <View style={styles.costHeader}>
                <Text style={styles.costTitle}>Labor Cost Breakdown</Text>
              </View>
              
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Total Labor Cost</Text>
                <Text style={styles.costValue}>${totalLaborCost.toLocaleString()}</Text>
              </View>
              
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Avg Cost per MH</Text>
                <Text style={styles.costValue}>
                  ${totalManHours > 0 ? (totalLaborCost / totalManHours).toFixed(2) : "0"}
                </Text>
              </View>
              
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Cost per Unit</Text>
                <Text style={styles.costValue}>
                  ${totalQuantity > 0 ? (totalLaborCost / totalQuantity).toFixed(2) : "0"}
                </Text>
              </View>
            </View>

            {/* Cost by Task */}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Cost by Task</Text>
            {summaries.map((summary) => {
              const taskLogs = logs.filter((l) => l.taskName === summary.taskName);
              const taskCost = taskLogs.reduce((sum, l) => sum + (l.laborCost || 0), 0);
              
              return (
                <View key={summary.taskName} style={styles.taskCostCard}>
                  <Text style={styles.taskCostName}>{summary.taskName}</Text>
                  <View style={styles.taskCostRow}>
                    <Text style={styles.taskCostLabel}>Total Cost</Text>
                    <Text style={styles.taskCostValue}>${taskCost.toLocaleString()}</Text>
                  </View>
                  <View style={styles.taskCostRow}>
                    <Text style={styles.taskCostLabel}>MH Rate</Text>
                    <Text style={styles.taskCostValue}>{summary.averageMHPerUnit.toFixed(2)} MH/{summary.unit}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {activeReport === "productivity" && (
          <View style={styles.reportSection}>
            <Text style={styles.sectionTitle}>Productivity Analysis</Text>
            
            <View style={styles.productivityCard}>
              <View style={styles.productivityHeader}>
                <Text style={styles.productivityTitle}>Overall Rate</Text>
                <Text style={styles.productivityValue}>{overallRate.toFixed(2)} MH/Unit</Text>
              </View>
            </View>

            {/* Task Performance */}
            {summaries.map((summary) => (
              <View key={summary.taskName} style={styles.performanceCard}>
                <View style={styles.performanceHeader}>
                  <Text style={styles.performanceName}>{summary.taskName}</Text>
                  <Text style={styles.performanceUnit}>{summary.unit}</Text>
                </View>

                <View style={styles.performanceStats}>
                  <View style={styles.performanceStat}>
                    <Text style={styles.performanceStatValue}>
                      {summary.averageMHPerUnit.toFixed(2)}
                    </Text>
                    <Text style={styles.performanceStatLabel}>Avg</Text>
                  </View>
                  <View style={styles.performanceStat}>
                    <Text style={[styles.performanceStatValue, styles.bestValue]}>
                      {summary.bestMHPerUnit.toFixed(2)}
                    </Text>
                    <Text style={styles.performanceStatLabel}>Best</Text>
                  </View>
                  <View style={styles.performanceStat}>
                    <Text style={[styles.performanceStatValue, styles.worstValue]}>
                      {summary.worstMHPerUnit.toFixed(2)}
                    </Text>
                    <Text style={styles.performanceStatLabel}>Worst</Text>
                  </View>
                  <View style={styles.performanceStat}>
                    <Text style={styles.performanceStatValue}>
                      {summary.averageDifficulty.toFixed(1)}
                    </Text>
                    <Text style={styles.performanceStatLabel}>Diff</Text>
                  </View>
                </View>

                <View style={styles.performanceBar}>
                  <View 
                    style={[
                      styles.performanceBarFill,
                      { width: `${Math.min((summary.bestMHPerUnit / summary.worstMHPerUnit) * 100, 100)}%` }
                    ]} 
                  />
                </View>
              </View>
            ))}

            {summaries.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No productivity data yet. Log work to see performance metrics.
                </Text>
              </View>
            )}
          </View>
        )}
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
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: {
    backgroundColor: COLORS.primaryDim,
    borderColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  summaryCard: {
    width: "47%",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryValue: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  summaryLabel: {
    color: COLORS.dim,
    fontSize: 10,
    marginTop: 2,
  },
  reportSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    color: COLORS.dim,
    fontSize: 12,
    textAlign: "center",
  },
  dailyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  dailyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dailyDate: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  dailyCount: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "600",
  },
  dailyStats: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dailyStat: {
    alignItems: "center",
  },
  dailyStatValue: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "800",
  },
  dailyStatLabel: {
    color: COLORS.dim,
    fontSize: 10,
  },
  logItem: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logTask: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },
  logMeta: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
  },
  weeklyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  weeklyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  weeklyLabel: {
    color: COLORS.muted,
    fontSize: 13,
  },
  weeklyValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  costCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  costHeader: {
    marginBottom: 12,
  },
  costTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  costLabel: {
    color: COLORS.muted,
    fontSize: 13,
  },
  costValue: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  taskCostCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  taskCostName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  taskCostRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  taskCostLabel: {
    color: COLORS.dim,
    fontSize: 12,
  },
  taskCostValue: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  productivityCard: {
    backgroundColor: COLORS.primaryDim,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 16,
    alignItems: "center",
  },
  productivityHeader: {
    alignItems: "center",
  },
  productivityTitle: {
    color: COLORS.dim,
    fontSize: 11,
    marginBottom: 4,
  },
  productivityValue: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: "900",
  },
  performanceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  performanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  performanceName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  performanceUnit: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  performanceStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  performanceStat: {
    alignItems: "center",
  },
  performanceStatValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },
  bestValue: {
    color: COLORS.success,
  },
  worstValue: {
    color: COLORS.warning,
  },
  performanceStatLabel: {
    color: COLORS.dim,
    fontSize: 9,
    marginTop: 2,
  },
  performanceBar: {
    height: 4,
    backgroundColor: COLORS.primaryDim,
    borderRadius: 2,
    overflow: "hidden",
  },
  performanceBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
});
