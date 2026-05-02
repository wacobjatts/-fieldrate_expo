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
import type { WorkLog } from "../types/log";

type Phase = {
  id: string;
  name: string;
  status: "completed" | "active" | "upcoming";
  startDate: string;
  endDate: string;
  progress: number;
};

export default function ScheduleScreen() {
  const { openDrawer } = useContext(DrawerContext);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeProject, setActiveProject] = useState("Riverside Tower");

  const loadData = useCallback(async () => {
    const logData = await logRepository.getAll();
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

  // Generate phases from log data or use demo
  const uniquePhases = [...new Set(logs.map((l) => l.phase).filter(Boolean))];
  
  const phases: Phase[] = uniquePhases.length > 0 
    ? uniquePhases.map((phase, i) => ({
        id: `phase-${i}`,
        name: phase || "General",
        status: i === 0 ? "completed" : i === 1 ? "active" : "upcoming",
        startDate: "Jan 15",
        endDate: "Feb 28",
        progress: i === 0 ? 100 : i === 1 ? 65 : 0,
      }))
    : [
        { id: "1", name: "Site Prep", status: "completed", startDate: "Jan 15", endDate: "Jan 28", progress: 100 },
        { id: "2", name: "Foundation", status: "completed", startDate: "Jan 29", endDate: "Feb 15", progress: 100 },
        { id: "3", name: "Framing", status: "active", startDate: "Feb 16", endDate: "Mar 30", progress: 72 },
        { id: "4", name: "Mechanical", status: "upcoming", startDate: "Apr 1", endDate: "May 15", progress: 0 },
        { id: "5", name: "Finishes", status: "upcoming", startDate: "May 16", endDate: "Jun 30", progress: 0 },
      ];

  const completedPhases = phases.filter((p) => p.status === "completed").length;
  const overallProgress = Math.round(
    phases.reduce((sum, p) => sum + p.progress, 0) / phases.length
  );

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
          <Text style={styles.headerTitle}>Schedule</Text>
          <Text style={styles.headerSubtitle}>{activeProject}</Text>
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
        {/* Progress Overview */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Overall Progress</Text>
            <Text style={styles.progressPercent}>{overallProgress}%</Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${overallProgress}%` }]}
            />
          </View>

          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>{completedPhases}</Text>
              <Text style={styles.progressStatLabel}>Completed</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>
                {phases.filter((p) => p.status === "active").length}
              </Text>
              <Text style={styles.progressStatLabel}>Active</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>
                {phases.filter((p) => p.status === "upcoming").length}
              </Text>
              <Text style={styles.progressStatLabel}>Upcoming</Text>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Project Timeline</Text>

          {phases.map((phase, index) => (
            <View key={phase.id} style={styles.timelineItem}>
              {/* Timeline Line */}
              <View style={styles.timelineLine}>
                <View
                  style={[
                    styles.timelineDot,
                    phase.status === "completed" && styles.timelineDotCompleted,
                    phase.status === "active" && styles.timelineDotActive,
                  ]}
                />
                {index < phases.length - 1 && (
                  <View
                    style={[
                      styles.timelineConnector,
                      phase.status === "completed" && styles.timelineConnectorCompleted,
                    ]}
                  />
                )}
              </View>

              {/* Phase Card */}
              <View
                style={[
                  styles.phaseCard,
                  phase.status === "active" && styles.phaseCardActive,
                ]}
              >
                <View style={styles.phaseHeader}>
                  <Text style={styles.phaseName}>{phase.name}</Text>
                  <View
                    style={[
                      styles.phaseStatus,
                      phase.status === "completed" && styles.phaseStatusCompleted,
                      phase.status === "active" && styles.phaseStatusActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.phaseStatusText,
                        phase.status === "completed" && styles.phaseStatusTextCompleted,
                        phase.status === "active" && styles.phaseStatusTextActive,
                      ]}
                    >
                      {phase.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.phaseDates}>
                  {phase.startDate} - {phase.endDate}
                </Text>

                {phase.status !== "upcoming" && (
                  <View style={styles.phaseProgress}>
                    <View style={styles.phaseProgressBar}>
                      <View
                        style={[
                          styles.phaseProgressFill,
                          { width: `${phase.progress}%` },
                          phase.status === "completed" && styles.phaseProgressFillCompleted,
                        ]}
                      />
                    </View>
                    <Text style={styles.phaseProgressText}>{phase.progress}%</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
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
  progressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  progressPercent: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "900",
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.primaryDim,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  progressStat: {
    alignItems: "center",
  },
  progressStatValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
  },
  progressStatLabel: {
    color: COLORS.dim,
    fontSize: 10,
    marginTop: 2,
  },
  timelineSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  timelineLine: {
    width: 30,
    alignItems: "center",
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    zIndex: 1,
  },
  timelineDotCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  timelineDotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  timelineConnectorCompleted: {
    backgroundColor: COLORS.success,
  },
  phaseCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginLeft: 8,
    marginBottom: 12,
  },
  phaseCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryDim,
  },
  phaseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  phaseName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },
  phaseStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
  },
  phaseStatusCompleted: {
    backgroundColor: "rgba(0, 255, 156, 0.15)",
  },
  phaseStatusActive: {
    backgroundColor: COLORS.primaryDim,
  },
  phaseStatusText: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: COLORS.muted,
  },
  phaseStatusTextCompleted: {
    color: COLORS.success,
  },
  phaseStatusTextActive: {
    color: COLORS.primary,
  },
  phaseDates: {
    color: COLORS.dim,
    fontSize: 11,
    marginBottom: 10,
  },
  phaseProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  phaseProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(139, 155, 180, 0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  phaseProgressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  phaseProgressFillCompleted: {
    backgroundColor: COLORS.success,
  },
  phaseProgressText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "700",
    width: 32,
    textAlign: "right",
  },
});
