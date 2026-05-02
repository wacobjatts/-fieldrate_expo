import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import FieldRateCard from "../components/fieldrate/FieldRateCard";
import FieldRateScreen from "../components/fieldrate/FieldRateScreen";
import { logRepository } from "../data/repositories/logRepository";
import { calculateEstimate } from "../domain/estimateMath";
import { summarizeLogsByTask, type TaskRateSummary } from "../domain/performanceMath";
import { COLORS } from "../theme/colors";
import type { ScopeItem } from "../types/scope";

export default function ScopeOfWorkScreen() {
  const [projectName, setProjectName] = useState("Untitled Project");
  const [clientName, setClientName] = useState("");
  const [jobAddress, setJobAddress] = useState("");
  const [scope, setScope] = useState<ScopeItem[]>([]);
  const [summaries, setSummaries] = useState<TaskRateSummary[]>([]);
  const [activePhaseId, setActivePhaseId] = useState("default");
  const [activePhaseName, setActivePhaseName] = useState("General");
  const [rate, setRate] = useState("85");

  useEffect(() => {
    logRepository.getAll().then((logs) => {
      setSummaries(summarizeLogsByTask(logs));
    });
  }, []);

  function addLine() {
    setScope((prev) => [
      ...prev,
      { id: Date.now().toString(), taskName: "", quantity: 0, phaseId: activePhaseId, phaseName: activePhaseName, lineType: "selfPerform" },
    ]);
  }

  function updateLine(id: string, patch: Partial<ScopeItem>) {
    setScope((prev) => prev.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  }

  function removeLine(id: string) {
    setScope((prev) => prev.filter((line) => line.id !== id));
  }

  const phases = useMemo(() => {
    const map = new Map<string, string>();
    map.set("default", "General");
    scope.forEach((line) => map.set(line.phaseId || "default", line.phaseName || "General"));
    map.set(activePhaseId, activePhaseName || "General");
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [scope, activePhaseId, activePhaseName]);

  const lineResults = useMemo(() => {
    return scope.map((line) => {
      const summary = summaries.find((item) => item.taskName === line.taskName);

      const baseEstimate = calculateEstimate({
        quantity: line.quantity,
        mhPerUnit: summary?.averageMHPerUnit || 0,
        ratePerHour: Number(rate) || 0,
        difficultyFactor: 1,
        contingencyPercent: 0,
      });

      const type = line.lineType || "selfPerform";

      if (type === "subcontractor") {
        const bid = line.subcontractorBid || 0;
        const markup = line.subcontractorMarkup || 0;
        const total = bid * (1 + markup);

        return {
          line,
          estimate: {
            totalManHours: 0,
            laborSubtotal: bid,
            contingencyAmount: total - bid,
            bidTotal: total,
          },
        };
      }

      if (type === "allowance") {
        const val = line.quantity || 0;
        return {
          line,
          estimate: {
            totalManHours: 0,
            laborSubtotal: val,
            contingencyAmount: 0,
            bidTotal: val,
          },
        };
      }

      if (type === "credit") {
        const val = -(line.quantity || 0);
        return {
          line,
          estimate: {
            totalManHours: 0,
            laborSubtotal: val,
            contingencyAmount: 0,
            bidTotal: val,
          },
        };
      }

      return { line, estimate: baseEstimate };
    });
  }, [scope, summaries, rate, activePhaseId]);

  const totals = lineResults.reduce((acc, item) => {
  const type = item.line.lineType || "selfPerform";

  if (type === "subcontractor") acc.subs += item.estimate.bidTotal;
  else if (type === "allowance") acc.allowances += item.estimate.bidTotal;
  else if (type === "credit") acc.credits += item.estimate.bidTotal;
  else acc.self += item.estimate.bidTotal;

  acc.total += item.estimate.bidTotal;
  return acc;
}, { self: 0, subs: 0, allowances: 0, credits: 0, total: 0 });

const total = lineResults.reduce((sum, item) => sum + item.estimate.bidTotal, 0);

  return (
    <FieldRateScreen title="Scope of Work">
      <FieldRateCard title="Settings">
        <TextInput value={projectName} onChangeText={setProjectName} placeholder="Project Name" style={styles.input} />
        <TextInput value={clientName} onChangeText={setClientName} placeholder="Client Name" style={styles.input} />
        <TextInput value={jobAddress} onChangeText={setJobAddress} placeholder="Job Address" style={styles.input} />
        <TextInput value={rate} onChangeText={setRate} placeholder="Rate / Hr" style={styles.input} />
      </FieldRateCard>

      <FieldRateCard title="Phase">
        <TextInput value={activePhaseName} onChangeText={setActivePhaseName} placeholder="Phase Name" style={styles.input} />
        <View style={styles.row}>
          {phases.map((phase) => (
            <Pressable key={phase.id} onPress={() => { setActivePhaseId(phase.id); setActivePhaseName(phase.name); }}>
              <Text style={activePhaseId === phase.id ? styles.active : styles.link}>{phase.name}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={() => { const id = Date.now().toString(); setActivePhaseId(id); setActivePhaseName("New Phase"); }}>
          <Text style={styles.add}>New Phase</Text>
        </Pressable>
      </FieldRateCard>

      <FieldRateCard title="Scope Lines">
        {lineResults.map((item) => (
          <View key={item.line.id} style={styles.line}>
            <View style={styles.row}>
              <Pressable onPress={() => updateLine(item.line.id, { lineType: "selfPerform" })}>
                <Text style={item.line.lineType === "selfPerform" ? styles.active : styles.link}>Self</Text>
              </Pressable>
              <Pressable onPress={() => updateLine(item.line.id, { lineType: "subcontractor" })}>
                <Text style={item.line.lineType === "subcontractor" ? styles.active : styles.link}>Sub</Text>
              </Pressable>
              <Pressable onPress={() => updateLine(item.line.id, { lineType: "allowance" })}>
                <Text style={item.line.lineType === "allowance" ? styles.active : styles.link}>Allowance</Text>
              </Pressable>
              <Pressable onPress={() => updateLine(item.line.id, { lineType: "credit" })}>
                <Text style={item.line.lineType === "credit" ? styles.active : styles.link}>Credit</Text>
              </Pressable>
            </View>

            <TextInput
              value={item.line.taskName}
              onChangeText={(text) => updateLine(item.line.id, { taskName: text })}
              placeholder="Task"
              style={styles.input}
            />
            <TextInput
              value={String(item.line.quantity)}
              onChangeText={(text) => updateLine(item.line.id, { quantity: Number(text) || 0 })}
              placeholder="Quantity"
              style={styles.input}
            />
            <Text style={styles.total}>${item.estimate.bidTotal.toFixed(2)}</Text>
            <Pressable onPress={() => removeLine(item.line.id)}>
              <Text style={styles.delete}>Remove Line</Text>
            </Pressable>
          </View>
        ))}

        <Pressable onPress={addLine}>
          <Text style={styles.add}>Add Line</Text>
        </Pressable>
      </FieldRateCard>

      <FieldRateCard title="Totals">
        <Text>Self Perform: {totals.self.toFixed(2)}</Text>
        <Text>Subcontractors: {totals.subs.toFixed(2)}</Text>
        <Text>Allowances: {totals.allowances.toFixed(2)}</Text>
        <Text>Credits: {totals.credits.toFixed(2)}</Text>
        <Text style={styles.total}>Total: {totals.total.toFixed(2)}</Text>
      </FieldRateCard>
    </FieldRateScreen>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: "#002f6f", padding: 8, color: "#fff", marginBottom: 8 },
  line: { marginBottom: 14 },
  total: { color: COLORS.primary, fontWeight: "900" },
  delete: { color: COLORS.danger, marginTop: 8 },
  add: { color: COLORS.primary, marginTop: 10 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  link: { color: COLORS.primary },
  active: { color: COLORS.success, fontWeight: "900" },
});
