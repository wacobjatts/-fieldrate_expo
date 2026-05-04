// src/screens/TasksScreen.tsx

import React, { useCallback, useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS } from "../theme/colors";
import { DrawerContext } from "../navigation/AppNavigator";
import { taskRepository } from "../data/repositories/taskRepository";
import type { TaskItem, TaskDraft, TaskStatus } from "../types/tasks";

export default function TasksScreen() {
  const { openDrawer } = useContext(DrawerContext);

  const [draftId, setDraftId] = useState("current-task-draft");
  const [projectName, setProjectName] = useState("Untitled Project");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const draft = await taskRepository.getLatest();
    if (draft) {
      setDraftId(draft.id);
      setProjectName(draft.projectName || "Untitled Project");
      setTasks(draft.tasks || []);
    } else {
      setTasks([]);
    }
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

  function updateTask(id: string, patch: Partial<TaskItem>) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...patch };
          const hrs = updated.estimatedHours || 0;
          const crew = updated.crewSize || 0;
          updated.estimatedManHours = hrs * crew;
          updated.updatedAt = new Date().toISOString();
          return updated;
        }
        return t;
      })
    );
  }

  function toggleStatus(id: string, current: TaskStatus) {
    const order: TaskStatus[] = ["draft", "planned", "in-progress", "complete"];
    const next = order[(order.indexOf(current) + 1) % order.length];
    updateTask(id, { status: next });
  }

  function addManualTask() {
    const newTask: TaskItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      projectName,
      source: "manual",
      title: "",
      description: "",
      executionType: "selfPerform",
      materialType: "fixed",
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
  }

  async function saveTasks() {
    const draft: TaskDraft = {
      id: draftId,
      projectName,
      tasks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await taskRepository.save(draft);
    Alert.alert("Saved", "Task breakdown saved successfully.");
  }

  async function clearTasks() {
    await taskRepository.clear();
    setTasks([]);
    Alert.alert("Cleared", "All tasks removed.");
  }

  const groupedTasks = tasks.reduce((acc, task) => {
    const group = task.scopeItemTitle || "Manual Tasks";
    if (!acc[group]) acc[group] = [];
    acc[group].push(task);
    return acc;
  }, {} as Record<string, TaskItem[]>);

  const completedCount = tasks.filter((t) => t.status === "complete").length;
  const pendingCount = tasks.length - completedCount;

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
          <Text style={styles.headerTitle}>Task Breakdown</Text>
          <Text style={styles.headerSubtitle}>
            {completedCount} complete / {pendingCount} pending
          </Text>
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
        <View style={styles.projectHeader}>
          <Text style={styles.projectLabel}>Project:</Text>
          <Text style={styles.projectName}>{projectName}</Text>
        </View>

        {Object.entries(groupedTasks).map(([groupTitle, groupTasks]) => (
          <View key={groupTitle} style={styles.groupContainer}>
            <Text style={styles.groupTitle}>{groupTitle}</Text>
            
            {groupTasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeaderRow}>
                  <TextInput
                    style={styles.taskTitleInput}
                    value={task.title}
                    onChangeText={(val) => updateTask(task.id, { title: val })}
                    placeholder="Task Title"
                    placeholderTextColor={COLORS.dim}
                  />
                  <Pressable
                    style={[
                      styles.statusBadge,
                      task.status === "complete" && styles.statusComplete,
                      task.status === "in-progress" && styles.statusInProgress,
                      task.status === "planned" && styles.statusPlanned,
                      task.status === "draft" && styles.statusDraft,
                    ]}
                    onPress={() => toggleStatus(task.id, task.status)}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        task.status === "complete" && styles.statusTextComplete,
                        task.status === "in-progress" && styles.statusTextInProgress,
                        task.status === "planned" && styles.statusTextPlanned,
                      ]}
                    >
                      {task.status.toUpperCase()}
                    </Text>
                  </Pressable>
                </View>

                <TextInput
                  style={styles.taskDescInput}
                  value={task.description}
                  onChangeText={(val) => updateTask(task.id, { description: val })}
                  placeholder="Task Description"
                  placeholderTextColor={COLORS.dim}
                  multiline
                />

                <View style={styles.metaRow}>
                  <View style={styles.metaBadge}>
                    <Text style={styles.metaBadgeText}>{task.executionType === "selfPerform" ? "Self Perform" : "Subcontractor"}</Text>
                  </View>
                  <View style={[styles.metaBadge, task.materialType === "allowance" && styles.metaBadgeAllowance]}>
                    <Text style={styles.metaBadgeText}>{task.materialType === "allowance" ? "Allowance" : "Fixed"}</Text>
                  </View>
                </View>

                <View style={styles.gridRow}>
                  <View style={styles.gridCol}>
                    <Text style={styles.inputLabel}>Qty</Text>
                    <TextInput
                      style={styles.inputField}
                      value={task.quantity !== undefined ? String(task.quantity) : ""}
                      onChangeText={(val) => updateTask(task.id, { quantity: parseFloat(val) || 0 })}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={COLORS.dim}
                    />
                  </View>
                  <View style={styles.gridCol}>
                    <Text style={styles.inputLabel}>Unit</Text>
                    <TextInput
                      style={styles.inputField}
                      value={task.unit || ""}
                      onChangeText={(val) => updateTask(task.id, { unit: val })}
                      placeholder="EA, SF..."
                      placeholderTextColor={COLORS.dim}
                    />
                  </View>
                  <View style={styles.gridCol}>
                    <Text style={styles.inputLabel}>Crew</Text>
                    <TextInput
                      style={styles.inputField}
                      value={task.crewSize !== undefined ? String(task.crewSize) : ""}
                      onChangeText={(val) => updateTask(task.id, { crewSize: parseFloat(val) || 0 })}
                      keyboardType="decimal-pad"
                      placeholder="1"
                      placeholderTextColor={COLORS.dim}
                    />
                  </View>
                  <View style={styles.gridCol}>
                    <Text style={styles.inputLabel}>Hrs/Ea</Text>
                    <TextInput
                      style={styles.inputField}
                      value={task.estimatedHours !== undefined ? String(task.estimatedHours) : ""}
                      onChangeText={(val) => updateTask(task.id, { estimatedHours: parseFloat(val) || 0 })}
                      keyboardType="decimal-pad"
                      placeholder="0.0"
                      placeholderTextColor={COLORS.dim}
                    />
                  </View>
                </View>

                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Est. Man Hours:</Text>
                  <Text style={styles.resultValue}>{task.estimatedManHours?.toFixed(1) || "0.0"}</Text>
                </View>

                <TextInput
                  style={styles.taskNotesInput}
                  value={task.notes || ""}
                  onChangeText={(val) => updateTask(task.id, { notes: val })}
                  placeholder="Task notes / conditions"
                  placeholderTextColor={COLORS.dim}
                  multiline
                />
              </View>
            ))}
          </View>
        ))}

        {tasks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>☑</Text>
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptyText}>
              Generate tasks from Scope of Work or add them manually below.
            </Text>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <Pressable style={styles.actionBtnOutline} onPress={addManualTask}>
            <Text style={styles.actionBtnOutlineText}>+ Add Manual Task</Text>
          </Pressable>
          <Pressable style={styles.actionBtnPrimary} onPress={saveTasks}>
            <Text style={styles.actionBtnPrimaryText}>Save Task Breakdown</Text>
          </Pressable>
          {tasks.length > 0 && (
            <Pressable style={styles.actionBtnDanger} onPress={clearTasks}>
              <Text style={styles.actionBtnDangerText}>Clear All Tasks</Text>
            </Pressable>
          )}
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
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  projectLabel: {
    color: COLORS.dim,
    fontSize: 14,
    fontWeight: "700",
  },
  projectName: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "900",
  },
  groupContainer: {
    marginBottom: 24,
  },
  groupTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 6,
  },
  taskCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  taskHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },
  taskTitleInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusDraft: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  statusPlanned: {
    borderColor: COLORS.warning,
    backgroundColor: "rgba(255, 180, 60, 0.1)",
  },
  statusInProgress: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryDim,
  },
  statusComplete: {
    borderColor: COLORS.success,
    backgroundColor: "rgba(0, 255, 156, 0.1)",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.muted,
  },
  statusTextPlanned: { color: COLORS.warning },
  statusTextInProgress: { color: COLORS.primary },
  statusTextComplete: { color: COLORS.success },
  taskDescInput: {
    color: COLORS.text,
    fontSize: 13,
    marginBottom: 12,
    minHeight: 40,
    textAlignVertical: "top",
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  metaBadge: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metaBadgeAllowance: {
    borderColor: COLORS.warning,
  },
  metaBadgeText: {
    color: COLORS.dim,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  gridRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  gridCol: {
    flex: 1,
  },
  inputLabel: {
    color: COLORS.dim,
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 4,
  },
  inputField: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    fontSize: 13,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 12,
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 8,
  },
  resultLabel: {
    color: COLORS.dim,
    fontSize: 12,
    fontWeight: "700",
  },
  resultValue: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "900",
  },
  taskNotesInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    color: COLORS.muted,
    backgroundColor: COLORS.background,
    fontSize: 12,
    minHeight: 60,
    textAlignVertical: "top",
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
  actionsContainer: {
    marginTop: 10,
    gap: 12,
  },
  actionBtnOutline: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  actionBtnOutlineText: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  actionBtnPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  actionBtnPrimaryText: {
    color: COLORS.background,
    fontWeight: "900",
  },
  actionBtnDanger: {
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  actionBtnDangerText: {
    color: COLORS.danger,
    fontWeight: "800",
  },
});
