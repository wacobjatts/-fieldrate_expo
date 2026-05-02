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
import { summarizeLogsByTask, type TaskRateSummary } from "../domain/performanceMath";
import type { WorkLog } from "../types/log";

type TaskItem = {
  id: string;
  name: string;
  status: "pending" | "in-progress" | "completed";
  assignee?: string;
  jobName?: string;
  mhPerUnit?: number;
  unit?: string;
};

export default function TasksScreen() {
  const { openDrawer } = useContext(DrawerContext);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [summaries, setSummaries] = useState<TaskRateSummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

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

  // Convert summaries to task items
  const tasks: TaskItem[] = summaries.map((s, i) => ({
    id: `task-${i}`,
    name: s.taskName,
    status: s.logCount > 2 ? "completed" : s.logCount > 0 ? "in-progress" : "pending",
    mhPerUnit: s.averageMHPerUnit,
    unit: s.unit,
    jobName: logs.find((l) => l.taskName === s.taskName)?.jobName,
  }));

  // Demo tasks if none exist
  const displayTasks: TaskItem[] = tasks.length > 0 ? tasks : [
    { id: "1", name: "Foundation Pour", status: "completed", jobName: "Riverside Tower" },
    { id: "2", name: "Rebar Installation", status: "in-progress", jobName: "Riverside Tower" },
    { id: "3", name: "Formwork Setup", status: "pending", jobName: "Harbor Point" },
    { id: "4", name: "Concrete Finishing", status: "pending", jobName: "Summit Ridge" },
  ];

  const filteredTasks = displayTasks.filter((task) => {
    if (filter === "all") return true;
    if (filter === "completed") return task.status === "completed";
    return task.status !== "completed";
  });

  const completedCount = displayTasks.filter((t) => t.status === "completed").length;
  const pendingCount = displayTasks.filter((t) => t.status !== "completed").length;

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
          <Text style={styles.headerTitle}>Tasks</Text>
          <Text style={styles.headerSubtitle}>
            {completedCount} completed / {pendingCount} pending
          </Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      {/* Filter Pills */}
      <View style={styles.filterRow}>
        <Pressable
          style={[styles.filterPill, filter === "all" && styles.filterPillActive]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>
            All
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterPill, filter === "pending" && styles.filterPillActive]}
          onPress={() => setFilter("pending")}
        >
          <Text style={[styles.filterText, filter === "pending" && styles.filterTextActive]}>
            Pending
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterPill, filter === "completed" && styles.filterPillActive]}
          onPress={() => setFilter("completed")}
        >
          <Text style={[styles.filterText, filter === "completed" && styles.filterTextActive]}>
            Completed
          </Text>
        </Pressable>
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
        {filteredTasks.map((task) => (
          <View key={task.id} style={styles.taskCard}>
            <View style={styles.taskLeft}>
              <Pressable style={styles.checkbox}>
                {task.status === "completed" && (
                  <View style={styles.checkboxInner}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                )}
              </Pressable>
            </View>

            <View style={styles.taskContent}>
              <Text
                style={[
                  styles.taskName,
                  task.status === "completed" && styles.taskNameCompleted,
                ]}
              >
                {task.name}
              </Text>
              {task.jobName && (
                <Text style={styles.taskJob}>{task.jobName}</Text>
              )}
              {task.mhPerUnit !== undefined && (
                <Text style={styles.taskMeta}>
                  {task.mhPerUnit.toFixed(2)} MH/{task.unit || "unit"}
                </Text>
              )}
            </View>

            <View style={styles.taskRight}>
              <View
                style={[
                  styles.statusBadge,
                  task.status === "completed" && styles.statusCompleted,
                  task.status === "in-progress" && styles.statusInProgress,
                  task.status === "pending" && styles.statusPending,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    task.status === "completed" && styles.statusTextCompleted,
                    task.status === "in-progress" && styles.statusTextInProgress,
                  ]}
                >
                  {task.status === "in-progress" ? "Active" : task.status}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {filteredTasks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>☑</Text>
            <Text style={styles.emptyTitle}>No tasks found</Text>
            <Text style={styles.emptyText}>
              Tasks are created from work logs. Log some work to see tasks here.
            </Text>
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
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.primaryDim,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  filterTextActive: {
    color: COLORS.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  taskCard: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    alignItems: "center",
  },
  taskLeft: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: "800",
  },
  taskContent: {
    flex: 1,
  },
  taskName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },
  taskNameCompleted: {
    color: COLORS.muted,
    textDecorationLine: "line-through",
  },
  taskJob: {
    color: COLORS.dim,
    fontSize: 11,
    marginTop: 2,
  },
  taskMeta: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  taskRight: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusCompleted: {
    backgroundColor: "rgba(0, 255, 156, 0.15)",
  },
  statusInProgress: {
    backgroundColor: COLORS.primaryDim,
  },
  statusPending: {
    backgroundColor: "rgba(139, 155, 180, 0.15)",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
    color: COLORS.muted,
  },
  statusTextCompleted: {
    color: COLORS.success,
  },
  statusTextInProgress: {
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.3,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 40,
  },
});
