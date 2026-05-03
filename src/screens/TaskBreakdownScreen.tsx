// src/screens/TaskBreakdownScreen.tsx

import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import FieldRateScreen from "../components/fieldrate/FieldRateScreen";
import FieldRateCard from "../components/fieldrate/FieldRateCard";
import { executionTaskRepository } from "../data/repositories/executionTaskRepository";
import { COLORS } from "../theme/colors";

type TaskLine = {
  id: string;
  name: string;
  note: string;
  qty: string;
  unit: string;
  mhPerUnit: string;
  workers: string;
  blendedRate: string;
};

const starterTasks: TaskLine[] = [
  {
    id: "1",
    name: "Install Siding",
    note: "Exterior walls",
    qty: "900",
    unit: "SF",
    mhPerUnit: "0.048",
    workers: "2",
    blendedRate: "40",
  },
  {
    id: "2",
    name: "Install Windows",
    note: "Remove & replace",
    qty: "6",
    unit: "EA",
    mhPerUnit: "1.25",
    workers: "2",
    blendedRate: "40",
  },
];

export default function TaskBreakdownScreen() {
  const [tasks, setTasks] = useState<TaskLine[]>(starterTasks);

  function updateTask(id: string, patch: Partial<TaskLine>) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...patch } : task))
    );
  }

  function addTask() {
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: "",
        note: "",
        qty: "1",
        unit: "EA",
        mhPerUnit: "1",
        workers: "1",
        blendedRate: "40",
      },
    ]);
  }

  async function addTasksToProject(selectedTasks = tasks) {
    const cleanTasks = selectedTasks
      .filter((task) => task.name.trim())
      .map((task) => ({
        id: `exec-${Date.now()}-${task.id}`,
        name: task.name.trim(),
        status: "pending" as const,
        quantity: Number(task.qty) || undefined,
        unit: task.unit || undefined,
        source: "task-breakdown" as const,
        createdAt: new Date().toISOString(),
      }));

    if (cleanTasks.length === 0) {
      Alert.alert("No Tasks", "Add at least one task name first.");
      return;
    }

    await executionTaskRepository.saveMany(cleanTasks);

    Alert.alert(
      "Added to Project Tasks",
      `${cleanTasks.length} task(s) added to the field execution list.`
    );
  }

  function confirmAddOne(task: TaskLine) {
    Alert.alert(
      "Add to Project Tasks",
      `Add "${task.name || "Untitled Task"}" to the field task list?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Add", onPress: () => addTasksToProject([task]) },
      ]
    );
  }

  function confirmAddAll() {
    Alert.alert(
      "Add All Tasks",
      "Add all task breakdown lines to the field execution task list?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Add All", onPress: () => addTasksToProject(tasks) },
      ]
    );
  }

  const totals = useMemo(() => {
    return tasks.reduce(
      (acc, task) => {
        const qty = Number(task.qty) || 0;
        const rate = Number(task.mhPerUnit) || 0;
        const workers = Number(task.workers) || 1;
        const pay = Number(task.blendedRate) || 0;

        const mh = qty * rate;
        const duration = workers > 0 ? mh / workers : 0;
        const laborCost = mh * pay;

        acc.mh += mh;
        acc.duration += duration;
        acc.laborCost += laborCost;

        return acc;
      },
      { mh: 0, duration: 0, laborCost: 0 }
    );
  }, [tasks]);

  return (
    <FieldRateScreen title="Task Breakdown" subtitle="Labor forecast by task">
      <View style={styles.screenContent}>
        <FieldRateCard title="Forecast Summary">
          <View style={styles.summaryRow}>
            <Summary label="Predicted" value={`${totals.mh.toFixed(1)} MH`} />
            <Summary
              label="Duration"
              value={`${totals.duration.toFixed(1)} hrs`}
            />
            <Summary label="Labor" value={`$${totals.laborCost.toFixed(0)}`} />
          </View>
        </FieldRateCard>

        <FieldRateCard title="Tasks">
          <Pressable style={styles.addButton} onPress={addTask}>
            <Text style={styles.addButtonText}>+ Add Task</Text>
          </Pressable>

          {tasks.map((task, index) => {
            const qty = Number(task.qty) || 0;
            const mhPerUnit = Number(task.mhPerUnit) || 0;
            const workers = Number(task.workers) || 1;
            const blendedRate = Number(task.blendedRate) || 0;

            const predictedMH = qty * mhPerUnit;
            const duration = workers > 0 ? predictedMH / workers : 0;
            const laborCost = predictedMH * blendedRate;

            return (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskNumber}>{index + 1}</Text>
                  <TextInput
                    value={task.name}
                    onChangeText={(text) => updateTask(task.id, { name: text })}
                    placeholder="Task name"
                    placeholderTextColor={COLORS.dim}
                    style={styles.taskNameInput}
                  />
                </View>

                <TextInput
                  value={task.note}
                  onChangeText={(text) => updateTask(task.id, { note: text })}
                  placeholder="Task note / description"
                  placeholderTextColor={COLORS.dim}
                  style={styles.noteInput}
                />

                <View style={styles.grid}>
                  <InputBox
                    label="Quantity"
                    value={task.qty}
                    onChange={(text) => updateTask(task.id, { qty: text })}
                  />
                  <InputBox
                    label="Unit"
                    value={task.unit}
                    onChange={(text) => updateTask(task.id, { unit: text })}
                  />
                </View>

                <View style={styles.grid}>
                  <InputBox
                    label="MH / Unit"
                    value={task.mhPerUnit}
                    onChange={(text) =>
                      updateTask(task.id, { mhPerUnit: text })
                    }
                  />
                  <InputBox
                    label="Workers"
                    value={task.workers}
                    onChange={(text) => updateTask(task.id, { workers: text })}
                  />
                </View>

                <View style={styles.grid}>
                  <InputBox
                    label="Avg $ / HR"
                    value={task.blendedRate}
                    onChange={(text) =>
                      updateTask(task.id, { blendedRate: text })
                    }
                  />
                </View>

                <View style={styles.resultRow}>
                  <Result
                    label="Predicted"
                    value={`${predictedMH.toFixed(1)} MH`}
                  />
                  <Result label="Duration" value={`${duration.toFixed(1)} hrs`} />
                  <Result label="Labor" value={`$${laborCost.toFixed(0)}`} />
                </View>

                <Pressable
                  style={styles.exportButton}
                  onPress={() => confirmAddOne(task)}
                >
                  <Text style={styles.exportText}>Add to Project Tasks</Text>
                </Pressable>
              </View>
            );
          })}
        </FieldRateCard>

        <Pressable style={styles.primaryButton} onPress={confirmAddAll}>
          <Text style={styles.primaryText}>Add All Tasks to Project</Text>
        </Pressable>
      </View>
    </FieldRateScreen>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryBox}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function InputBox({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
}) {
  return (
    <View style={styles.inputBox}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={label === "Unit" ? "default" : "decimal-pad"}
        placeholderTextColor={COLORS.dim}
        style={styles.input}
      />
    </View>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.resultBox}>
      <Text style={styles.resultValue}>{value}</Text>
      <Text style={styles.resultLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
  },
  summaryBox: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: "900",
  },
  summaryLabel: {
    color: COLORS.dim,
    fontSize: 10,
    marginTop: 4,
  },
  addButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 14,
  },
  addButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  taskCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  taskNumber: {
    color: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 20,
    width: 30,
    height: 30,
    textAlign: "center",
    lineHeight: 28,
    fontWeight: "900",
  },
  taskNameInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 6,
  },
  noteInput: {
    color: COLORS.muted,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  grid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  inputBox: {
    flex: 1,
  },
  inputLabel: {
    color: COLORS.dim,
    fontSize: 10,
    marginBottom: 4,
    fontWeight: "700",
  },
  input: {
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
  },
  resultRow: {
    flexDirection: "row",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    marginTop: 4,
  },
  resultBox: {
    flex: 1,
  },
  resultValue: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  resultLabel: {
    color: COLORS.dim,
    fontSize: 10,
    marginTop: 3,
  },
  exportButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  exportText: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 8,
  },
  primaryText: {
    color: COLORS.background,
    fontWeight: "900",
    fontSize: 15,
  },
});