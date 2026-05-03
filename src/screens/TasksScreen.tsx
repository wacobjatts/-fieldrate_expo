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
import { executionTaskRepository } from "../data/repositories/executionTaskRepository";
import type { ExecutionTask } from "../types/executionTask";

type TaskItem = {
  id: string;
  name: string;
  status: "pending" | "in-progress" | "completed";
  jobName?: string;
  quantity?: number;
  unit?: string;
};

export default function TasksScreen() {
  const { openDrawer } = useContext(DrawerContext);

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const loadData = useCallback(async () => {
    const executionTasks = await executionTaskRepository.getAll();

    const mapped: TaskItem[] = executionTasks.map((task) => ({
      id: task.id,
      name: task.name,
      status: task.status,
      jobName: task.jobName,
      quantity: task.quantity,
      unit: task.unit,
    }));

    setTasks(mapped);
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

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    if (filter === "completed") return task.status === "completed";
    return task.status !== "completed";
  });

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const pendingCount = tasks.filter((t) => t.status !== "completed").length;

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

      {/* Filter */}
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
              <View style={styles.checkbox}>
                {task.status === "completed" && (
                  <View style={styles.checkboxInner}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                )}
              </View>
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

              {task.quantity && (
                <Text style={styles.taskMeta}>
                  {task.quantity} {task.unit || ""}
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
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptyText}>
              Add tasks from Task Breakdown to build your field execution list.
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