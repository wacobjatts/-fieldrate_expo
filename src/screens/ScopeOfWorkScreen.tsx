import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as Clipboard from "expo-clipboard";

import FieldRateCard from "../components/fieldrate/FieldRateCard";
import FieldRateScreen from "../components/fieldrate/FieldRateScreen";
import { logRepository } from "../data/repositories/logRepository";
import { calculateEstimate } from "../domain/estimateMath";
import { summarizeLogsByTask, type TaskRateSummary } from "../domain/performanceMath";
import { COLORS } from "../theme/colors";
import type { ScopeItem } from "../types/scope";
import type { WorkLog } from "../types/log";

export default function ScopeOfWorkScreen() {
  const [projectName, setProjectName] = useState("Untitled Project");
  const [clientName, setClientName] = useState("");
  const [jobAddress, setJobAddress] = useState("");
  const [scope, setScope] = useState<ScopeItem[]>([]);
  const [summaries, setSummaries] = useState<TaskRateSummary[]>([]);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [activePhaseId, setActivePhaseId] = useState("default");
  const [activePhaseName, setActivePhaseName] = useState("General");
  const [rate, setRate] = useState("85");

  useEffect(() => {
    logRepository.getAll().then((logs) => {
      setLogs(logs);
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

  function calculateLine(line: ScopeItem) {
    const summary = summaries.find((item) => item.taskName === line.taskName);

    const estimate = calculateEstimate({
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
      return { line, estimate: { totalManHours: 0, laborSubtotal: bid, contingencyAmount: total - bid, bidTotal: total } };
    }

    if (type === "allowance") {
      const value = line.quantity || 0;
      return { line, estimate: { totalManHours: 0, laborSubtotal: value, contingencyAmount: 0, bidTotal: value } };
    }

    if (type === "credit") {
      const value = -(line.quantity || 0);
      return { line, estimate: { totalManHours: 0, laborSubtotal: value, contingencyAmount: 0, bidTotal: value } };
    }

    return { line, estimate };
  }

  const lineResults = useMemo(() => {
    return scope
      .filter((line) => (line.phaseId || "default") === activePhaseId)
      .map(calculateLine);
  }, [scope, summaries, rate, activePhaseId]);

  const allLineResults = useMemo(() => {
    return scope.map(calculateLine);
  }, [scope, summaries, rate]);

  const actualsByTask = useMemo(() => {
    return logs.reduce<Record<string, { manHours: number; laborCost: number }>>((acc, log) => {
      const key = log.taskName;
      if (!acc[key]) acc[key] = { manHours: 0, laborCost: 0 };
      acc[key].manHours += log.manHours || 0;
      acc[key].laborCost += log.laborCost || 0;
      return acc;
    }, {});
  }, [logs]);

  const healthTotals = allLineResults.reduce(
    (acc, item) => {
      const actual = actualsByTask[item.line.taskName];
      acc.estimatedHours += item.estimate.totalManHours || 0;
      acc.estimatedCost += item.estimate.bidTotal || 0;
      acc.actualHours += actual?.manHours || 0;
      acc.actualCost += actual?.laborCost || 0;
      return acc;
    },
    { estimatedHours: 0, actualHours: 0, estimatedCost: 0, actualCost: 0 }
  );

  const hourDrift = healthTotals.actualHours - healthTotals.estimatedHours;
  const costDrift = healthTotals.actualCost - healthTotals.estimatedCost;
  const costDriftPercent = healthTotals.estimatedCost > 0 ? costDrift / healthTotals.estimatedCost : 0;

  const healthLabel = costDriftPercent <= 0 ? "On Track" : costDriftPercent <= 0.1 ? "Watch" : "Over Budget";
  const healthColor = costDriftPercent <= 0 ? COLORS.success : costDriftPercent <= 0.1 ? COLORS.warning : COLORS.danger;

  const projectTotals = allLineResults.reduce((acc, item) => {
    const type = item.line.lineType || "selfPerform";
    if (type === "subcontractor") acc.subs += item.estimate.bidTotal;
    else if (type === "allowance") acc.allowances += item.estimate.bidTotal;
    else if (type === "credit") acc.credits += item.estimate.bidTotal;
    else acc.self += item.estimate.bidTotal;
    acc.total += item.estimate.bidTotal;
    return acc;
  }, { self: 0, subs: 0, allowances: 0, credits: 0, total: 0 });

  const totals = lineResults.reduce((acc, item) => {
    const type = item.line.lineType || "selfPerform";
    if (type === "subcontractor") acc.subs += item.estimate.bidTotal;
    else if (type === "allowance") acc.allowances += item.estimate.bidTotal;
    else if (type === "credit") acc.credits += item.estimate.bidTotal;
    else acc.self += item.estimate.bidTotal;
    acc.total += item.estimate.bidTotal;
    return acc;
  }, { self: 0, subs: 0, allowances: 0, credits: 0, total: 0 });

  const projectedProfitLoss = projectTotals.total - healthTotals.actualCost;

  function buildEstimateText(mode: "phase" | "project") {
    const data = mode === "phase" ? lineResults : allLineResults;
    const rows = data.map((item, index) => {
      const line = item.line;
      const est = item.estimate;
      const type = line.lineType || "selfPerform";
      return [
        `${index + 1}. ${line.taskName || "Unassigned Task"}`,
        `Type: ${type}`,
        `Quantity: ${line.quantity}`,
        `Total: $${est.bidTotal.toFixed(2)}`,
      ].join("\n");
    });
    const totalAmount = data.reduce((sum, item) => sum + item.estimate.bidTotal, 0);
    return [
      projectName,
      clientName ? `Client: ${clientName}` : "",
      jobAddress ? `Job Address: ${jobAddress}` : "",
      "",
      mode === "phase" ? `Phase: ${activePhaseName}` : "Full Project",
      "",
      ...rows,
      "",
      "--------------------",
      `Total: $${totalAmount.toFixed(2)}`,
    ].filter(Boolean).join("\n");
  }

  return (
    <FieldRateScreen title="Scope of Work" subtitle="Build and track project scope">
      {/* Project Settings */}
      <FieldRateCard title="Project Settings">
        <View style={styles.copyButtons}>
          <Pressable style={styles.copyButton} onPress={async () => Clipboard.setStringAsync(buildEstimateText("phase"))}>
            <Text style={styles.copyButtonText}>Copy Phase</Text>
          </Pressable>
          <Pressable style={styles.copyButton} onPress={async () => Clipboard.setStringAsync(buildEstimateText("project"))}>
            <Text style={styles.copyButtonText}>Copy Project</Text>
          </Pressable>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Project Name</Text>
          <TextInput value={projectName} onChangeText={setProjectName} style={styles.input} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Client Name</Text>
          <TextInput value={clientName} onChangeText={setClientName} placeholder="Optional" placeholderTextColor={COLORS.dim} style={styles.input} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Job Address</Text>
          <TextInput value={jobAddress} onChangeText={setJobAddress} placeholder="Optional" placeholderTextColor={COLORS.dim} style={styles.input} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Rate / Hr ($)</Text>
          <TextInput value={rate} onChangeText={setRate} keyboardType="decimal-pad" style={styles.input} />
        </View>
      </FieldRateCard>

      {/* Phase Selection */}
      <FieldRateCard title="Phase">
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phase Name</Text>
          <TextInput value={activePhaseName} onChangeText={setActivePhaseName} style={styles.input} />
        </View>
        <View style={styles.phaseList}>
          {phases.map((phase) => (
            <Pressable 
              key={phase.id} 
              style={[styles.phaseChip, activePhaseId === phase.id && styles.phaseChipActive]}
              onPress={() => { setActivePhaseId(phase.id); setActivePhaseName(phase.name); }}
            >
              <Text style={[styles.phaseChipText, activePhaseId === phase.id && styles.phaseChipTextActive]}>
                {phase.name}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={styles.addPhaseButton} onPress={() => { const id = Date.now().toString(); setActivePhaseId(id); setActivePhaseName("New Phase"); }}>
          <Text style={styles.addPhaseText}>+ New Phase</Text>
        </Pressable>
      </FieldRateCard>

      {/* Scope Lines */}
      <FieldRateCard title="Scope Lines">
        {lineResults.map((item) => (
          <View key={item.line.id} style={styles.scopeLine}>
            {/* Line Type Selection */}
            <View style={styles.lineTypeRow}>
              {(["selfPerform", "subcontractor", "allowance", "credit"] as const).map((type) => (
                <Pressable 
                  key={type} 
                  style={[styles.lineTypeChip, item.line.lineType === type && styles.lineTypeChipActive]}
                  onPress={() => updateLine(item.line.id, { lineType: type })}
                >
                  <Text style={[styles.lineTypeText, item.line.lineType === type && styles.lineTypeTextActive]}>
                    {type === "selfPerform" ? "Self" : type === "subcontractor" ? "Sub" : type === "allowance" ? "Allow" : "Credit"}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              value={item.line.taskName}
              onChangeText={(text) => updateLine(item.line.id, { taskName: text })}
              placeholder="Task name"
              placeholderTextColor={COLORS.dim}
              style={styles.input}
            />
            <TextInput
              value={String(item.line.quantity || "")}
              onChangeText={(text) => updateLine(item.line.id, { quantity: Number(text) || 0 })}
              placeholder="Quantity"
              placeholderTextColor={COLORS.dim}
              keyboardType="decimal-pad"
              style={styles.input}
            />

            {item.line.lineType === "subcontractor" && (
              <>
                <TextInput
                  value={item.line.subcontractorName || ""}
                  onChangeText={(text) => updateLine(item.line.id, { subcontractorName: text })}
                  placeholder="Subcontractor Name"
                  placeholderTextColor={COLORS.dim}
                  style={styles.input}
                />
                <View style={styles.row}>
                  <View style={styles.flex}>
                    <TextInput
                      value={item.line.subcontractorBid ? String(item.line.subcontractorBid) : ""}
                      onChangeText={(text) => updateLine(item.line.id, { subcontractorBid: Number(text) || 0 })}
                      placeholder="Bid ($)"
                      placeholderTextColor={COLORS.dim}
                      keyboardType="decimal-pad"
                      style={styles.input}
                    />
                  </View>
                  <View style={styles.flex}>
                    <TextInput
                      value={item.line.subcontractorMarkup ? String(item.line.subcontractorMarkup) : ""}
                      onChangeText={(text) => updateLine(item.line.id, { subcontractorMarkup: Number(text) || 0 })}
                      placeholder="Markup (0.15)"
                      placeholderTextColor={COLORS.dim}
                      keyboardType="decimal-pad"
                      style={styles.input}
                    />
                  </View>
                </View>
              </>
            )}

            <View style={styles.lineFooter}>
              <Text style={styles.lineTotal}>${item.estimate.bidTotal.toFixed(2)}</Text>
              <Pressable onPress={() => removeLine(item.line.id)}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <Pressable style={styles.addLineButton} onPress={addLine}>
          <Text style={styles.addLineText}>+ Add Line</Text>
        </Pressable>
      </FieldRateCard>

      {/* Phase Totals */}
      <FieldRateCard title="Phase Totals">
        <View style={styles.totalsGrid}>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Self Perform</Text>
            <Text style={styles.totalValue}>${totals.self.toFixed(2)}</Text>
          </View>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Subcontractors</Text>
            <Text style={styles.totalValue}>${totals.subs.toFixed(2)}</Text>
          </View>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Allowances</Text>
            <Text style={styles.totalValue}>${totals.allowances.toFixed(2)}</Text>
          </View>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Credits</Text>
            <Text style={[styles.totalValue, totals.credits < 0 && styles.creditValue]}>${totals.credits.toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.grandTotal}>
          <Text style={styles.grandTotalLabel}>Phase Total</Text>
          <Text style={styles.grandTotalValue}>${totals.total.toFixed(2)}</Text>
        </View>
      </FieldRateCard>

      {/* Project Health */}
      <FieldRateCard title="Project Health">
        <View style={[styles.healthBadge, { borderColor: healthColor }]}>
          <Text style={[styles.healthLabel, { color: healthColor }]}>{healthLabel}</Text>
          <Text style={styles.healthPercent}>{(costDriftPercent * 100).toFixed(1)}% drift</Text>
        </View>

        <View style={styles.healthGrid}>
          <View style={styles.healthItem}>
            <Text style={styles.healthItemLabel}>Est. Hours</Text>
            <Text style={styles.healthItemValue}>{healthTotals.estimatedHours.toFixed(1)}</Text>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.healthItemLabel}>Actual Hours</Text>
            <Text style={styles.healthItemValue}>{healthTotals.actualHours.toFixed(1)}</Text>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.healthItemLabel}>Hour Drift</Text>
            <Text style={[styles.healthItemValue, hourDrift > 0 && styles.driftWarning]}>{hourDrift.toFixed(1)}</Text>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.healthItemLabel}>Est. Cost</Text>
            <Text style={styles.healthItemValue}>${healthTotals.estimatedCost.toFixed(0)}</Text>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.healthItemLabel}>Actual Cost</Text>
            <Text style={styles.healthItemValue}>${healthTotals.actualCost.toFixed(0)}</Text>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.healthItemLabel}>Cost Drift</Text>
            <Text style={[styles.healthItemValue, costDrift > 0 && styles.driftWarning]}>${costDrift.toFixed(0)}</Text>
          </View>
        </View>

        <View style={styles.profitLoss}>
          <Text style={styles.profitLossLabel}>Projected Profit/Loss</Text>
          <Text style={[styles.profitLossValue, projectedProfitLoss < 0 && styles.lossValue]}>
            ${projectedProfitLoss.toFixed(2)}
          </Text>
        </View>
      </FieldRateCard>

      {/* Project Totals */}
      <FieldRateCard title="Project Totals" variant="highlighted">
        <View style={styles.totalsGrid}>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Self Perform</Text>
            <Text style={styles.totalValue}>${projectTotals.self.toFixed(2)}</Text>
          </View>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Subcontractors</Text>
            <Text style={styles.totalValue}>${projectTotals.subs.toFixed(2)}</Text>
          </View>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Allowances</Text>
            <Text style={styles.totalValue}>${projectTotals.allowances.toFixed(2)}</Text>
          </View>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Credits</Text>
            <Text style={[styles.totalValue, projectTotals.credits < 0 && styles.creditValue]}>${projectTotals.credits.toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.grandTotal}>
          <Text style={styles.grandTotalLabel}>Project Total</Text>
          <Text style={[styles.grandTotalValue, styles.primaryValue]}>${projectTotals.total.toFixed(2)}</Text>
        </View>
      </FieldRateCard>
    </FieldRateScreen>
  );
}

const styles = StyleSheet.create({
  copyButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  copyButton: {
    flex: 1,
    backgroundColor: COLORS.primaryDim,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  copyButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  inputGroup: {
    gap: 4,
    marginBottom: 10,
  },
  inputLabel: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    fontSize: 14,
  },
  phaseList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  phaseChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  phaseChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryDim,
  },
  phaseChipText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  phaseChipTextActive: {
    color: COLORS.primary,
  },
  addPhaseButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  addPhaseText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  scopeLine: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    gap: 8,
  },
  lineTypeRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
  },
  lineTypeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  lineTypeChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryDim,
  },
  lineTypeText: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
  },
  lineTypeTextActive: {
    color: COLORS.primary,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  flex: {
    flex: 1,
  },
  lineFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  lineTotal: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  removeText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: "700",
  },
  addLineButton: {
    alignItems: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    borderStyle: "dashed",
  },
  addLineText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  totalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  totalItem: {
    width: "47%",
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  totalLabel: {
    color: COLORS.dim,
    fontSize: 10,
  },
  totalValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  creditValue: {
    color: COLORS.success,
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  grandTotalLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  grandTotalValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
  },
  primaryValue: {
    color: COLORS.primary,
  },
  healthBadge: {
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  healthLabel: {
    fontSize: 14,
    fontWeight: "800",
  },
  healthPercent: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
  },
  healthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  healthItem: {
    width: "31%",
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  healthItemLabel: {
    color: COLORS.dim,
    fontSize: 9,
  },
  healthItemValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  driftWarning: {
    color: COLORS.warning,
  },
  profitLoss: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  profitLossLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },
  profitLossValue: {
    color: COLORS.success,
    fontSize: 18,
    fontWeight: "900",
  },
  lossValue: {
    color: COLORS.danger,
  },
});
