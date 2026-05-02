import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import FieldRateCard from "../components/fieldrate/FieldRateCard";
import FieldRateScreen from "../components/fieldrate/FieldRateScreen";
import { calculateLaborCost, calculateMHPerUnit, calculateManHours } from "../domain/fieldrateMath";
import { logRepository } from "../data/repositories/logRepository";
import { COLORS } from "../theme/colors";
import type { ProductionUnit, WorkLog, WorkLogStatusTag } from "../types/log";

const units: ProductionUnit[] = ["EA", "LF", "SF", "CY"];
const statusTags: WorkLogStatusTag[] = ["standard", "exceptional", "problem"];

type ScoreKey = "workFlow" | "planAccuracy" | "crewEfficiency" | "conditionImpact" | "communication";

const scoreLabels: Record<ScoreKey, string> = {
  workFlow: "Work Flow",
  planAccuracy: "Plan Accuracy",
  crewEfficiency: "Crew Efficiency",
  conditionImpact: "Condition Impact",
  communication: "Communication",
};

export default function LogWorkScreen() {
  const [jobName, setJobName] = useState("Current Project");
  const [phase, setPhase] = useState("General");
  const [taskName, setTaskName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<ProductionUnit>("LF");
  const [crewSize, setCrewSize] = useState("1");
  const [hours, setHours] = useState("");
  const [ratePerHour, setRatePerHour] = useState("");
  const [notes, setNotes] = useState("");
  const [statusTag, setStatusTag] = useState<WorkLogStatusTag>("standard");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [scores, setScores] = useState<Record<ScoreKey, number>>({
    workFlow: 3,
    planAccuracy: 3,
    crewEfficiency: 3,
    conditionImpact: 3,
    communication: 3,
  });

  const quantityNum = Number(quantity) || 0;
  const crewNum = Number(crewSize) || 0;
  const hoursNum = Number(hours) || 0;
  const rateNum = Number(ratePerHour) || 0;

  const manHours = useMemo(() => calculateManHours(crewNum, hoursNum), [crewNum, hoursNum]);
  const mhPerUnit = useMemo(() => calculateMHPerUnit(manHours, quantityNum), [manHours, quantityNum]);
  const laborCost = useMemo(() => calculateLaborCost(mhPerUnit, quantityNum, rateNum), [mhPerUnit, quantityNum, rateNum]);

  const averageScore = useMemo(() => {
    const values = Object.values(scores);
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }, [scores]);

  const difficulty = Math.min(5, Math.max(1, Math.round(6 - averageScore))) as WorkLog["difficulty"];

  const canSave = taskName.trim().length > 0 && quantityNum > 0 && crewNum > 0 && hoursNum > 0;

  async function saveLog() {
    if (!canSave) {
      Alert.alert("Missing log info", "Add a task, quantity, crew size, and hours on site.");
      return;
    }

    const log: WorkLog = {
      id: String(Date.now()),
      jobId: "local-project",
      jobName: jobName.trim() || "Current Project",
      phase: phase.trim() || "General",
      date: new Date().toISOString(),
      taskName: taskName.trim(),
      quantity: quantityNum,
      unit,
      crewSize: crewNum,
      hours: hoursNum,
      manHours,
      mhPerUnit,
      ratePerHour: rateNum || undefined,
      laborCost: rateNum ? laborCost : undefined,
      workFlow: scores.workFlow,
      planAccuracy: scores.planAccuracy,
      crewEfficiency: scores.crewEfficiency,
      conditionImpact: scores.conditionImpact,
      communication: scores.communication,
      difficulty,
      statusTag,
      notes: notes.trim() || undefined,
    };

    await logRepository.save(log);
    setTaskName("");
    setQuantity("");
    setHours("");
    setNotes("");
    setStatusTag("standard");
    Alert.alert("Work logged", "This production rate is saved to FieldRate history.");
  }

  return (
    <FieldRateScreen
      title="Log Work"
      subtitle="Record field production"
    >
      <FieldRateCard title="Active Project">
        <LabeledInput label="Project" value={jobName} onChangeText={setJobName} />
        <LabeledInput label="Phase" value={phase} onChangeText={setPhase} />
      </FieldRateCard>

      <FieldRateCard title="Log a Task">
        <LabeledInput
          label="Task"
          value={taskName}
          onChangeText={setTaskName}
          placeholder="What work was done?"
        />

        <View style={styles.row}>
          <View style={styles.flex}>
            <LabeledInput
              label="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.unitBox}>
            <Text style={styles.label}>Unit</Text>
            <View style={styles.unitGrid}>
              {units.map((item) => (
                <Pill key={item} label={item} active={unit === item} onPress={() => setUnit(item)} />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.flex}>
            <LabeledInput label="Crew Size" value={crewSize} onChangeText={setCrewSize} keyboardType="decimal-pad" />
          </View>
          <View style={styles.flex}>
            <LabeledInput label="Hours on Site" value={hours} onChangeText={setHours} keyboardType="decimal-pad" />
          </View>
        </View>

        <View style={styles.mathBox}>
          <Text style={styles.mathText}>{crewNum || 0} x {hoursNum || 0} = {formatNumber(manHours)} MH</Text>
          <Text style={styles.muted}>{formatNumber(mhPerUnit)} MH / {unit}</Text>
        </View>

        <LabeledInput label="Rate" value={ratePerHour} onChangeText={setRatePerHour} keyboardType="decimal-pad" placeholder="Optional labor rate" />
      </FieldRateCard>

      <FieldRateCard title="Production Conditions">
        {(Object.keys(scoreLabels) as ScoreKey[]).map((key) => (
          <ScoreRow
            key={key}
            label={scoreLabels[key]}
            value={scores[key]}
            onChange={(value) => setScores((current) => ({ ...current, [key]: value }))}
          />
        ))}
      </FieldRateCard>

      <FieldRateCard title="Additional Details">
        <Pressable style={styles.detailToggle} onPress={() => setDetailsOpen((value) => !value)}>
          <Text style={styles.detailText}>{detailsOpen ? "Hide Details" : "Add More Detail"}</Text>
        </Pressable>

        {detailsOpen ? (
          <>
            <LabeledInput
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Delays, conditions, wins..."
              multiline
            />
            <Text style={styles.label}>Day Tag</Text>
            <View style={styles.tagRow}>
              {statusTags.map((tag) => (
                <Pill
                  key={tag}
                  label={tag === "standard" ? "Standard" : tag === "exceptional" ? "Exceptional" : "Problem"}
                  active={statusTag === tag}
                  onPress={() => setStatusTag(tag)}
                />
              ))}
            </View>
          </>
        ) : null}
      </FieldRateCard>

      <Pressable style={[styles.saveButton, !canSave && styles.saveButtonDisabled]} onPress={saveLog}>
        <Text style={styles.saveText}>Log Work</Text>
      </Pressable>
    </FieldRateScreen>
  );
}

type LabeledInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "decimal-pad";
  multiline?: boolean;
};

function LabeledInput({ label, value, onChangeText, placeholder, keyboardType = "default", multiline = false }: LabeledInputProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.dim}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline && styles.textArea]}
      />
    </View>
  );
}

type PillProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function Pill({ label, active, onPress }: PillProps) {
  return (
    <Pressable style={[styles.pill, active && styles.pillActive]} onPress={onPress}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

type ScoreRowProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

function ScoreRow({ label, value, onChange }: ScoreRowProps) {
  return (
    <View style={styles.scoreRow}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <View style={styles.scorePills}>
        {[1, 2, 3, 4, 5].map((score) => (
          <Pressable 
            key={score} 
            style={[styles.scorePill, value === score && styles.scorePillActive]} 
            onPress={() => onChange(score)}
          >
            <Text style={[styles.scorePillText, value === score && styles.scorePillTextActive]}>{score}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "0";
  return value % 1 === 0 ? String(value) : value.toFixed(2);
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  unitBox: {
    flex: 1,
  },
  unitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "700",
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  pill: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
  },
  pillActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryDim,
  },
  pillText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  pillTextActive: {
    color: COLORS.primary,
  },
  mathBox: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    padding: 14,
    backgroundColor: COLORS.primaryDim,
    alignItems: "center",
  },
  mathText: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "900",
  },
  muted: {
    color: COLORS.dim,
    marginTop: 4,
    fontSize: 12,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  scoreLabel: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  scorePills: {
    flexDirection: "row",
    gap: 4,
  },
  scorePill: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  scorePillActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryDim,
  },
  scorePillText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  scorePillTextActive: {
    color: COLORS.primary,
  },
  detailToggle: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  detailText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  tagRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 8,
  },
  saveButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveText: {
    color: COLORS.background,
    fontWeight: "900",
    fontSize: 15,
  },
});
