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
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { COLORS } from "../theme/colors";
import { DrawerContext } from "../navigation/AppNavigator";
import { jobRepository } from "../data/repositories/jobRepository";
import { logRepository } from "../data/repositories/logRepository";
import { summarizeLogsByTask } from "../domain/performanceMath";
import type { Job } from "../types/job";
import type { WorkLog } from "../types/log";

export default function DashboardScreen() {
  const { openDrawer } = useContext(DrawerContext);
  const navigation = useNavigation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeJobExpanded, setActiveJobExpanded] = useState(false);

  const loadData = useCallback(async () => {
    const [jobData, logData] = await Promise.all([
      jobRepository.getAll(),
      logRepository.getAll(),
    ]);
    setJobs(jobData);
    setLogs(logData);
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

  const summaries = summarizeLogsByTask(logs);
  const totalManHours = logs.reduce((sum, log) => sum + log.manHours, 0);
  const recentLogs = logs.slice(0, 5);
  
  // Calculate efficiency percentage based on performance
  const avgEfficiency = summaries.length > 0 
    ? Math.round(summaries.reduce((sum, s) => sum + (s.averageDifficulty / 5) * 100, 0) / summaries.length)
    : 0;
  
  const efficiency = avgEfficiency > 0 ? 100 - avgEfficiency + 50 : 72;
  const drift = logs.length > 0 ? "+2.3%" : "0%";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.menuButton} onPress={openDrawer}>
            <View style={styles.menuIcon}>
              <View style={styles.menuLine} />
              <View style={[styles.menuLine, styles.menuLineShort]} />
              <View style={styles.menuLine} />
            </View>
          </Pressable>

          {/* Weather Capsule */}
          <View style={styles.weatherCapsule}>
            <Text style={styles.weatherIcon}>☀</Text>
            <Text style={styles.weatherTemp}>72°F</Text>
            <Text style={styles.weatherDesc}>Clear</Text>
          </View>

          {/* Hex Modules */}
          <View style={styles.hexModules}>
            <View style={styles.hexModule}>
              <Text style={styles.hexValue}>{efficiency}%</Text>
              <Text style={styles.hexLabel}>EFF</Text>
            </View>
            <View style={[styles.hexModule, styles.hexModuleAccent]}>
              <Text style={styles.hexValueAccent}>{drift}</Text>
              <Text style={styles.hexLabelAccent}>DRIFT</Text>
            </View>
          </View>
        </View>

        {/* Active Job Card */}
        <Pressable
          style={styles.activeJobCard}
          onPress={() => setActiveJobExpanded(!activeJobExpanded)}
        >
          <View style={styles.activeJobHeader}>
            <View style={styles.statusIndicator} />
            <Text style={styles.activeJobLabel}>ACTIVE PROJECT</Text>
          </View>

          <Text style={styles.activeJobName}>
            {jobs[0]?.name || "Riverside Tower"}
          </Text>
          <Text style={styles.activeJobAddress}>
            {jobs[0]?.location || "1847 Harbor Rd"}
          </Text>

          {/* Visual Mode - Ring and Orb */}
          <View style={styles.visualMode}>
            <View style={styles.timeRing}>
              <View style={styles.timeRingInner}>
                <Text style={styles.timeRingValue}>52h</Text>
                <Text style={styles.timeRingLabel}>logged</Text>
              </View>
              <View style={[styles.ringProgress, { transform: [{ rotate: "180deg" }] }]} />
            </View>

            <View style={styles.costOrb}>
              <Text style={styles.costOrbValue}>$97k</Text>
              <Text style={styles.costOrbLabel}>budget</Text>
            </View>
          </View>

          {activeJobExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.expandedRow}>
                <View style={styles.expandedStat}>
                  <Text style={styles.expandedStatValue}>5</Text>
                  <Text style={styles.expandedStatLabel}>Crew Size</Text>
                </View>
                <View style={styles.expandedStat}>
                  <Text style={styles.expandedStatValue}>Phase 2</Text>
                  <Text style={styles.expandedStatLabel}>Current Phase</Text>
                </View>
                <View style={styles.expandedStat}>
                  <Text style={styles.expandedStatValue}>{logs.length}</Text>
                  <Text style={styles.expandedStatLabel}>Work Logs</Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => navigation.navigate("Projects" as never)}
                >
                  <Text style={styles.actionButtonText}>View Project</Text>
                </Pressable>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => navigation.navigate("Log Work" as never)}
                >
                  <Text style={styles.actionButtonText}>Add Log</Text>
                </Pressable>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => navigation.navigate("Estimate" as never)}
                >
                  <Text style={styles.actionButtonText}>Estimate</Text>
                </Pressable>
              </View>
            </View>
          )}

          <Text style={styles.expandHint}>
            {activeJobExpanded ? "Tap to collapse" : "Tap to expand"}
          </Text>
        </Pressable>

        {/* Mid Row - Tasks and Recent Jobs */}
        <View style={styles.midRow}>
          {/* Tasks Capsule */}
          <View style={styles.tasksCapsule}>
            <View style={styles.capsuleHeader}>
              <Text style={styles.capsuleTitle}>Tasks</Text>
              <Text style={styles.capsuleCount}>{summaries.length}</Text>
            </View>
            {summaries.slice(0, 3).map((task, index) => (
              <View key={index} style={styles.taskItem}>
                <View style={styles.taskDot} />
                <Text style={styles.taskText} numberOfLines={1}>
                  {task.taskName}
                </Text>
              </View>
            ))}
            {summaries.length === 0 && (
              <Text style={styles.emptyText}>No tasks yet</Text>
            )}
          </View>

          {/* Recent Jobs */}
          <View style={styles.recentJobs}>
            <Text style={styles.capsuleTitle}>Recent</Text>
            {recentLogs.slice(0, 3).map((log, index) => (
              <View key={index} style={styles.recentItem}>
                <Text style={styles.recentName} numberOfLines={1}>
                  {log.jobName}
                </Text>
                <Text style={styles.recentMeta}>
                  {log.manHours.toFixed(1)} MH
                </Text>
              </View>
            ))}
            {recentLogs.length === 0 && (
              <Text style={styles.emptyText}>No recent logs</Text>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable
            style={styles.quickAction}
            onPress={() => navigation.navigate("Log Work" as never)}
          >
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>+</Text>
            </View>
            <Text style={styles.quickActionText}>Log</Text>
          </Pressable>

          <Pressable
            style={styles.quickAction}
            onPress={() => navigation.navigate("Tasks" as never)}
          >
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>☑</Text>
            </View>
            <Text style={styles.quickActionText}>Task</Text>
          </Pressable>

          <Pressable
            style={styles.quickAction}
            onPress={() => navigation.navigate("Projects" as never)}
          >
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>◈</Text>
            </View>
            <Text style={styles.quickActionText}>Job</Text>
          </Pressable>
        </View>

        {/* Production Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Production Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{logs.length}</Text>
              <Text style={styles.summaryLabel}>Total Logs</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalManHours.toFixed(0)}</Text>
              <Text style={styles.summaryLabel}>Man Hours</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summaries.length}</Text>
              <Text style={styles.summaryLabel}>Task Types</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{jobs.length || 1}</Text>
              <Text style={styles.summaryLabel}>Projects</Text>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
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
  weatherCapsule: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  weatherIcon: {
    fontSize: 16,
  },
  weatherTemp: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },
  weatherDesc: {
    color: COLORS.muted,
    fontSize: 11,
  },
  hexModules: {
    flexDirection: "row",
    gap: 8,
  },
  hexModule: {
    width: 52,
    height: 52,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  hexModuleAccent: {
    borderColor: COLORS.improving,
    backgroundColor: "rgba(0, 255, 204, 0.05)",
  },
  hexValue: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  hexLabel: {
    color: COLORS.dim,
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1,
  },
  hexValueAccent: {
    color: COLORS.improving,
    fontSize: 12,
    fontWeight: "800",
  },
  hexLabelAccent: {
    color: COLORS.improving,
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1,
    opacity: 0.7,
  },
  activeJobCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  activeJobHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 8,
  },
  activeJobLabel: {
    color: COLORS.dim,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
  },
  activeJobName: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  activeJobAddress: {
    color: COLORS.muted,
    fontSize: 14,
  },
  visualMode: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  timeRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: COLORS.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  timeRingInner: {
    alignItems: "center",
  },
  timeRingValue: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  timeRingLabel: {
    color: COLORS.dim,
    fontSize: 10,
    fontWeight: "600",
  },
  ringProgress: {
    position: "absolute",
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: "transparent",
    borderTopColor: COLORS.primary,
    borderRightColor: COLORS.primary,
  },
  costOrb: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  costOrbValue: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "900",
  },
  costOrbLabel: {
    color: COLORS.dim,
    fontSize: 10,
    fontWeight: "600",
  },
  expandedContent: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  expandedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  expandedStat: {
    alignItems: "center",
  },
  expandedStatValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
  },
  expandedStatLabel: {
    color: COLORS.dim,
    fontSize: 10,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primaryDim,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  actionButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  expandHint: {
    color: COLORS.dim,
    fontSize: 10,
    textAlign: "center",
    marginTop: 12,
  },
  midRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  tasksCapsule: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  capsuleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  capsuleTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  capsuleCount: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  taskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },
  taskText: {
    color: COLORS.muted,
    fontSize: 12,
    flex: 1,
  },
  recentJobs: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recentItem: {
    marginBottom: 8,
  },
  recentName: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },
  recentMeta: {
    color: COLORS.dim,
    fontSize: 10,
  },
  emptyText: {
    color: COLORS.dim,
    fontSize: 11,
    fontStyle: "italic",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  quickAction: {
    alignItems: "center",
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickActionIconText: {
    color: COLORS.primary,
    fontSize: 22,
  },
  quickActionText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  summaryItem: {
    width: "46%",
    backgroundColor: COLORS.primaryDim,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryValue: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: "900",
  },
  summaryLabel: {
    color: COLORS.dim,
    fontSize: 11,
    marginTop: 4,
  },
});
