// src/screens/EstimateScreen.tsx

import React, { useCallback, useMemo, useState, useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import { logRepository } from "../data/repositories/logRepository";
import { calculateEstimate } from "../domain/estimateMath";
import { summarizeLogsByTask, type TaskRateSummary } from "../domain/performanceMath";
import { COLORS } from "../theme/colors";

import type { WorkLog } from "../types/log";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// --- STATIC MOCK DATA FOR COCKPIT IMMERSION (TEMPORARY PLACEHOLDERS) ---
const DUMMY_TASKS = [
  { id: "1", name: "Demolition", desc: "Remove existing cabinets", qty: 1.0, unit: "LS", crew: 2, hrsUnit: 8.0, manHours: 16.0, laborCost: 1040.0 },
  { id: "2", name: "Framing Walls", desc: "New wall framing", qty: 120, unit: "LF", crew: 3, hrsUnit: 0.75, manHours: 90.0, laborCost: 5850.0 },
  { id: "3", name: "Install Windows", desc: "Double pane", qty: 4, unit: "EA", crew: 2, hrsUnit: 2.5, manHours: 10.0, laborCost: 650.0 },
  { id: "4", name: "Drywall", desc: "Hang & finish", qty: 320, unit: "SF", crew: 3, hrsUnit: 0.6, manHours: 64.0, laborCost: 4160.0 },
  { id: "5", name: "Paint", desc: "Walls & ceiling", qty: 320, unit: "SF", crew: 2, hrsUnit: 0.25, manHours: 16.0, laborCost: 1040.0 },
];

const DUMMY_MATERIALS = [
  { id: "1", name: "2x4 Lumber", desc: "Studs", qty: 120, unit: "LF", cost: 4.20, waste: "10%", total: 554.40 },
  { id: "2", name: "Plywood 1/2\"", desc: "Sheathing", qty: 32, unit: "EA", cost: 32.00, waste: "5%", total: 1075.20 },
  { id: "3", name: "Drywall 1/2\"", desc: "Sheets", qty: 10, unit: "EA", cost: 13.50, waste: "5%", total: 141.75 },
  { id: "4", name: "Joint Compound", desc: "All Purpose", qty: 6, unit: "GAL", cost: 18.00, waste: "0%", total: 108.00 },
  { id: "5", name: "Paint - Wall", desc: "Eggshell", qty: 3, unit: "GAL", cost: 42.00, waste: "0%", total: 126.00 },
];

const DUMMY_SUBS = [
  { id: "1", name: "Electrical Co.", scope: "Rough-in + devices", quote: 3200, markup: "10%", total: 3520, status: "Approved" },
  { id: "2", name: "Plumbing Co.", scope: "Reroute & fixtures", quote: 1800, markup: "10%", total: 1980, status: "Pending" },
  { id: "3", name: "HVAC Co.", scope: "Vent relocation", quote: 1100, markup: "10%", total: 1210, status: "Pending" },
];

const DUMMY_ALLOWANCES = [
  { id: "1", name: "Tile Selection", amount: 2500, covers: "Material only", excludes: "Install, trim", notes: "Client to select by 6/1" },
  { id: "2", name: "Appliance Allowance", amount: 3000, covers: "Standard grade", excludes: "Upgrades", notes: "Client to select by 6/1" },
];

const JOB_CONDITIONS = [
  { label: "Access Difficulty", value: 75, level: "High" },
  { label: "Design Clarity", value: 50, level: "Medium" },
  { label: "Site Congestion", value: 80, level: "High" },
  { label: "Weather Exposure", value: 45, level: "Medium" },
  { label: "Crew Experience", value: 85, level: "High" },
  { label: "Material Availability", value: 25, level: "Low" },
];

export default function EstimateScreen() {
  // --- REAL LOGIC & ENGINE STATE ---
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [summaries, setSummaries] = useState<TaskRateSummary[]>([]);
  const [selected, setSelected] = useState("");
  const [quantity, setQuantity] = useState("120");
  const [rate, setRate] = useState("85");
  const [diff, setDiff] = useState("1.15");
  const [cont, setCont] = useState("0.1"); // Kept logic source of truth
  const [refreshing, setRefreshing] = useState(false);

  // --- COCKPIT UI STATE ---
  const [overhead, setOverhead] = useState("12");
  const [profit, setProfit] = useState("18");
  const [isCurtainOpen, setIsCurtainOpen] = useState(false);
  const [isPipelineOpen, setIsPipelineOpen] = useState(true);

  const curtainAnim = useRef(new Animated.Value(0)).current;

  // --- DATA LOADING ---
  const load = useCallback(async () => {
    const data = await logRepository.getAll();
    const s = summarizeLogsByTask(data);
    setLogs(data);
    setSummaries(s);
    if (s.length && !selected) setSelected(s[0].taskName);
  }, [selected]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  // --- ENGINE CALCULATIONS ---
  const sel = summaries.find((s) => s.taskName === selected);

  const est = useMemo(() =>
    calculateEstimate({
      quantity: Number(quantity) || 0,
      mhPerUnit: sel?.averageMHPerUnit || 0,
      ratePerHour: Number(rate) || 0,
      difficultyFactor: Number(diff) || 1,
      contingencyPercent: Number(cont) || 0, // Engine uses this for labor contingency, but we will apply to project total for the HUD
    }),
    [quantity, rate, diff, cont, sel]
  );

  // --- COMBINING REAL DATA + TEMPORARY PLACEHOLDERS ---
  const mockLabor = DUMMY_TASKS.reduce((sum, t) => sum + t.laborCost, 0);
  const mockManHours = DUMMY_TASKS.reduce((sum, t) => sum + t.manHours, 0);

  const laborSubtotal = est.laborSubtotal + mockLabor;
  const totalManHours = est.totalManHours + mockManHours;

  const materialSubtotal = DUMMY_MATERIALS.reduce((sum, m) => sum + m.total, 0);
  const subSubtotal = DUMMY_SUBS.reduce((sum, s) => sum + s.total, 0);
  const allowanceSubtotal = DUMMY_ALLOWANCES.reduce((sum, a) => sum + a.amount, 0);

  // Live Totals (combining engine + static placeholders)
  const directCost = laborSubtotal + materialSubtotal + subSubtotal + allowanceSubtotal;
  const contingencyAmt = directCost * (Number(cont) || 0); // HUD scaling
  const overheadAmt = (directCost + contingencyAmt) * ((Number(overhead) || 0) / 100);
  const profitAmt = (directCost + contingencyAmt + overheadAmt) * ((Number(profit) || 0) / 100);
  const finalPrice = directCost + contingencyAmt + overheadAmt + profitAmt;

  // --- ACTIONS ---
  const toggleCurtain = () => {
    // Flex layout handles the main area shrinking automatically when curtain width changes
    Animated.timing(curtainAnim, {
      toValue: isCurtainOpen ? 0 : SCREEN_WIDTH * 0.85, // 85% width when open
      duration: 250,
      useNativeDriver: false,
    }).start();
    setIsCurtainOpen(!isCurtainOpen);
  };

  const togglePipeline = () => setIsPipelineOpen(!isPipelineOpen);

  const formatCurrency = (val: number) =>
    val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const getLevelColor = (level: string) => {
    if (level === "High") return COLORS.warning;
    if (level === "Medium") return "#B084FF";
    return COLORS.success;
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* ===== TOP HEADER BAR ===== */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>FR</Text>
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.headerMeta}>
              <Text style={styles.headerMetaText}>ESTIMATE</Text>
              <Text style={styles.headerMetaDot}>•</Text>
              <View style={styles.draftBadge}>
                <Text style={styles.draftBadgeText}>v1 (DRAFT)</Text>
              </View>
            </View>
            <Text style={styles.projectTitle}>Coastal Kitchen Remodel</Text>
          </View>
        </View>
        <Pressable style={styles.sendButton} onPress={toggleCurtain}>
          <Text style={styles.sendButtonText}>{isCurtainOpen ? "CLOSE" : "PREVIEW"}</Text>
        </Pressable>
      </View>

      {/* ===== HUD METRICS STRIP (HORIZONTALLY SCROLLABLE) ===== */}
      <View style={styles.hudStripContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hudStripContent}>
          <View style={styles.hudMetricItem}>
            <Text style={styles.hudLabel}>DIRECT COST</Text>
            <Text style={styles.hudValue}>${formatCurrency(directCost)}</Text>
          </View>
          <View style={styles.hudDivider} />
          <View style={styles.hudMetricItem}>
            <Text style={styles.hudLabel}>CONTINGENCY ({(Number(cont) * 100).toFixed(0)}%)</Text>
            <Text style={[styles.hudValue, { color: COLORS.warning }]}>${formatCurrency(contingencyAmt)}</Text>
          </View>
          <View style={styles.hudDivider} />
          <View style={styles.hudMetricItem}>
            <Text style={styles.hudLabel}>OVERHEAD ({overhead}%)</Text>
            <Text style={[styles.hudValue, { color: "#B084FF" }]}>${formatCurrency(overheadAmt)}</Text>
          </View>
          <View style={styles.hudDivider} />
          <View style={styles.hudMetricItem}>
            <Text style={styles.hudLabel}>PROFIT ({profit}%)</Text>
            <Text style={[styles.hudValue, { color: COLORS.success }]}>${formatCurrency(profitAmt)}</Text>
          </View>
          <View style={styles.hudDivider} />
          <View style={styles.hudMetricItemFinal}>
            <Text style={styles.hudLabel}>FINAL PRICE</Text>
            <Text style={styles.hudFinalValue}>${formatCurrency(finalPrice)}</Text>
          </View>
        </ScrollView>
      </View>

      {/* ===== MAIN WORKSPACE ===== */}
      <View style={styles.workspace}>
        
        {/* MAIN CONTENT (Shrinks automatically via flex when curtain opens) */}
        <View style={styles.mainCol}>
          <ScrollView
            style={styles.mainScroll}
            contentContainerStyle={styles.mainScrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={COLORS.primary} />}
            showsVerticalScrollIndicator={false}
          >
            {/* PIPELINE CARD (COLLAPSIBLE) */}
            <View style={styles.card}>
              <Pressable style={styles.cardHeader} onPress={togglePipeline}>
                <Text style={styles.cardTitle}>PROJECT PIPELINE</Text>
                <Text style={styles.cardAction}>{isPipelineOpen ? "COLLAPSE" : "EXPAND"}</Text>
              </Pressable>
              {isPipelineOpen && (
                <View style={styles.pipelineRow}>
                  {[
                    { name: "WALKTHROUGH", count: "14 items", done: true },
                    { name: "SCOPE", count: "8 sections", done: true },
                    { name: "TASKS", count: "42 tasks", done: true },
                    { name: "MATERIALS", count: "36 items", done: true },
                    { name: "ESTIMATE", count: "Active", active: true },
                  ].map((stage, idx) => (
                    <View key={idx} style={[styles.pipelineNode, stage.active && styles.pipelineNodeActive]}>
                      <Text style={[styles.pipelineNodeIcon, { color: stage.done ? COLORS.success : stage.active ? COLORS.primary : COLORS.dim }]}>
                        {stage.done ? "✓" : stage.active ? "●" : "○"}
                      </Text>
                      <View>
                        <Text style={[styles.pipelineNodeText, stage.active && { color: COLORS.primary }]}>{stage.name}</Text>
                        <Text style={styles.pipelineNodeCount}>{stage.count}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* TASKS & LABOR SECTION (CARD-BASED FOR MOBILE) */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>1</Text>
                  </View>
                  <Text style={styles.cardTitle}>TASKS & LABOR</Text>
                  <Text style={styles.cardSubtitle}>{DUMMY_TASKS.length + (sel ? 1 : 0)} Tasks</Text>
                </View>
                <Pressable>
                  <Text style={styles.cardAction}>+ ADD TASK</Text>
                </Pressable>
              </View>

              <Text style={styles.microLabel}>SELECT TASK RATE REFERENCE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {summaries.length === 0 ? (
                  <Text style={styles.emptyText}>No rates available. Log work first.</Text>
                ) : (
                  summaries.map((s) => (
                    <Pressable 
                      key={s.taskName} 
                      style={[styles.chip, selected === s.taskName && styles.chipActive]}
                      onPress={() => setSelected(s.taskName)}
                    >
                      <Text style={[styles.chipText, selected === s.taskName && styles.chipTextActive]}>
                        {s.taskName} ({s.averageMHPerUnit.toFixed(2)} MH/{s.unit})
                      </Text>
                    </Pressable>
                  ))
                )}
              </ScrollView>

              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 2 }]}>TASK / DESCRIPTION</Text>
                <Text style={[styles.th, { width: 60 }]}>QTY</Text>
                <Text style={[styles.th, { width: 50 }]}>UNIT</Text>
                <Text style={[styles.th, { width: 60 }]}>RATE/HR</Text>
                <Text style={[styles.th, { width: 60 }]}>MH/UNIT</Text>
                <Text style={[styles.th, { width: 80, textAlign: 'right' }]}>LABOR COST</Text>
              </View>

              {/* REAL ENGINE ROW */}
              <View style={styles.tableRow}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.rowTitle}>{selected || "Select Task"}</Text>
                  <Text style={styles.rowDesc}>Engine calculation</Text>
                </View>
                <TextInput style={[styles.tableInput, { width: 60 }]} value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" />
                <Text style={[styles.rowText, { width: 50 }]}>{sel?.unit || "—"}</Text>
                <TextInput style={[styles.tableInput, { width: 60 }]} value={rate} onChangeText={setRate} keyboardType="decimal-pad" />
                <Text style={[styles.rowText, { width: 60 }]}>{sel?.averageMHPerUnit.toFixed(2) || "0.00"}</Text>
                <Text style={[styles.rowHighlight, { width: 80, textAlign: 'right' }]}>${est.laborSubtotal.toFixed(2)}</Text>
              </View>

              {/* PLACEHOLDER DUMMY ROWS */}
              {DUMMY_TASKS.map((task) => (
                <View key={task.id} style={styles.tableRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.rowTitle}>{task.name}</Text>
                    <Text style={styles.rowDesc}>{task.desc}</Text>
                  </View>
                  <Text style={[styles.rowText, { width: 60 }]}>{task.qty.toFixed(2)}</Text>
                  <Text style={[styles.rowText, { width: 50 }]}>{task.unit}</Text>
                  <Text style={[styles.rowText, { width: 60 }]}>$85</Text>
                  <Text style={[styles.rowText, { width: 60 }]}>{task.hrsUnit.toFixed(2)}</Text>
                  <Text style={[styles.rowText, { width: 80, textAlign: 'right' }]}>${formatCurrency(task.laborCost)}</Text>
                </View>
              ))}

              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Labor Subtotal</Text>
                <View style={styles.subtotalRight}>
                  <Text style={styles.subtotalMeta}>{totalManHours.toFixed(2)} MH</Text>
                  <Text style={styles.subtotalValue}>${formatCurrency(laborSubtotal)}</Text>
                </View>
              </View>
            </View>

            {/* MATERIALS SECTION (PLACEHOLDERS) */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>2</Text>
                  </View>
                  <Text style={styles.cardTitle}>MATERIALS</Text>
                  <Text style={styles.cardSubtitle}>{DUMMY_MATERIALS.length} Items</Text>
                </View>
                <Pressable>
                  <Text style={styles.cardAction}>+ ADD MATERIAL</Text>
                </Pressable>
              </View>

              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 2 }]}>ITEM / DESCRIPTION</Text>
                <Text style={[styles.th, { width: 50 }]}>QTY</Text>
                <Text style={[styles.th, { width: 50 }]}>UNIT</Text>
                <Text style={[styles.th, { width: 80 }]}>UNIT COST</Text>
                <Text style={[styles.th, { width: 60 }]}>WASTE</Text>
                <Text style={[styles.th, { width: 80, textAlign: 'right' }]}>TOTAL</Text>
              </View>
              
              {DUMMY_MATERIALS.map((mat) => (
                <View key={mat.id} style={styles.tableRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.rowTitle}>{mat.name}</Text>
                    <Text style={styles.rowDesc}>{mat.desc}</Text>
                  </View>
                  <Text style={[styles.rowText, { width: 50 }]}>{mat.qty}</Text>
                  <Text style={[styles.rowText, { width: 50 }]}>{mat.unit}</Text>
                  <Text style={[styles.rowText, { width: 80 }]}>${mat.cost.toFixed(2)}</Text>
                  <Text style={[styles.rowText, { width: 60 }]}>{mat.waste}</Text>
                  <Text style={[styles.rowText, { width: 80, textAlign: 'right' }]}>${mat.total.toFixed(2)}</Text>
                </View>
              ))}

              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Materials Subtotal</Text>
                <Text style={styles.subtotalValue}>${formatCurrency(materialSubtotal)}</Text>
              </View>
            </View>

            {/* SUBCONTRACTORS SECTION (PLACEHOLDERS) */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>3</Text>
                  </View>
                  <Text style={styles.cardTitle}>SUBCONTRACTORS</Text>
                  <Text style={styles.cardSubtitle}>{DUMMY_SUBS.length} Items</Text>
                </View>
                <Pressable>
                  <Text style={styles.cardAction}>+ ADD SUB</Text>
                </Pressable>
              </View>

              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 2 }]}>SUBCONTRACTOR / SCOPE</Text>
                <Text style={[styles.th, { width: 80 }]}>QUOTE</Text>
                <Text style={[styles.th, { width: 60 }]}>MARKUP</Text>
                <Text style={[styles.th, { width: 80, textAlign: 'right' }]}>TOTAL</Text>
              </View>

              {DUMMY_SUBS.map((sub) => (
                <View key={sub.id} style={styles.tableRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.rowTitle}>{sub.name}</Text>
                    <Text style={styles.rowDesc}>{sub.scope}</Text>
                  </View>
                  <Text style={[styles.rowText, { width: 80 }]}>${sub.quote.toFixed(2)}</Text>
                  <Text style={[styles.rowText, { width: 60 }]}>{sub.markup}</Text>
                  <Text style={[styles.rowText, { width: 80, textAlign: 'right', color: COLORS.primary }]}>${formatCurrency(sub.total)}</Text>
                </View>
              ))}

              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Subcontractor Subtotal</Text>
                <Text style={styles.subtotalValue}>${formatCurrency(subSubtotal)}</Text>
              </View>
            </View>

            {/* ALLOWANCES SECTION (PLACEHOLDERS) */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>4</Text>
                  </View>
                  <Text style={styles.cardTitle}>ALLOWANCES</Text>
                  <Text style={styles.cardSubtitle}>{DUMMY_ALLOWANCES.length} Allowances</Text>
                </View>
                <Pressable>
                  <Text style={styles.cardAction}>+ ADD ALLOWANCE</Text>
                </Pressable>
              </View>

              {DUMMY_ALLOWANCES.map((allow) => (
                <View key={allow.id} style={styles.tableRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.rowTitle}>{allow.name}</Text>
                    <Text style={styles.rowDesc}>Covers: {allow.covers} | Excludes: {allow.excludes}</Text>
                    <Text style={styles.allowanceNote}>{allow.notes}</Text>
                  </View>
                  <Text style={[styles.rowHighlight, { width: 100, textAlign: 'right' }]}>${formatCurrency(allow.amount)}</Text>
                </View>
              ))}

              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Allowances Total</Text>
                <Text style={styles.subtotalValue}>${formatCurrency(allowanceSubtotal)}</Text>
              </View>
            </View>

            {/* JOB CONDITIONS & CONTINGENCY ENGINE */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>5</Text>
                  </View>
                  <Text style={styles.cardTitle}>JOB CONDITIONS & CONTINGENCY</Text>
                </View>
                <Pressable>
                  <Text style={styles.cardAction}>Edit</Text>
                </Pressable>
              </View>

              <Text style={styles.helperText}>Adjusting factors scales the contingency calculation dynamically.</Text>
              
              <View style={styles.sliderGrid}>
                <View style={styles.sliderRow}>
                  <Text style={styles.sliderLabel}>Difficulty Factor (Engine)</Text>
                  <TextInput style={styles.sliderInput} value={diff} onChangeText={setDiff} keyboardType="decimal-pad" />
                </View>
                <View style={styles.sliderRow}>
                  <Text style={styles.sliderLabel}>Contingency % (Engine)</Text>
                  <TextInput style={styles.sliderInput} value={cont} onChangeText={setCont} keyboardType="decimal-pad" />
                </View>
              </View>

              {/* Decorative Conditions for mock immersion */}
              <View style={[styles.conditionsGrid, { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#1A2235' }]}>
                {JOB_CONDITIONS.map((cond, idx) => (
                  <View key={idx} style={styles.conditionRow}>
                    <Text style={styles.conditionLabel}>{cond.label}</Text>
                    <View style={styles.conditionBarContainer}>
                      <View style={[styles.conditionBar, { width: `${cond.value}%`, backgroundColor: getLevelColor(cond.level) }]} />
                    </View>
                    <Text style={[styles.conditionLevel, { color: getLevelColor(cond.level) }]}>{cond.level}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Calculated Contingency</Text>
                <Text style={[styles.subtotalValue, { color: COLORS.warning }]}>+ ${formatCurrency(contingencyAmt)}</Text>
              </View>
            </View>

            {/* PRICING & MARKUP */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>6</Text>
                  </View>
                  <Text style={styles.cardTitle}>PRICING & MARKUP</Text>
                </View>
                <Pressable>
                  <Text style={styles.cardAction}>Edit</Text>
                </Pressable>
              </View>
              
              <View style={styles.sliderGrid}>
                <View style={styles.sliderRow}>
                  <Text style={styles.sliderLabel}>Overhead %</Text>
                  <TextInput style={styles.sliderInput} value={overhead} onChangeText={setOverhead} keyboardType="decimal-pad" />
                  <Text style={styles.rowHighlight}>${formatCurrency(overheadAmt)}</Text>
                </View>
                <View style={styles.sliderRow}>
                  <Text style={styles.sliderLabel}>Profit %</Text>
                  <TextInput style={styles.sliderInput} value={profit} onChangeText={setProfit} keyboardType="decimal-pad" />
                  <Text style={[styles.rowHighlight, { color: COLORS.success }]}>${formatCurrency(profitAmt)}</Text>
                </View>
              </View>

              <View style={[styles.subtotalRow, { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 12, paddingTop: 12 }]}>
                <Text style={[styles.subtotalLabel, { color: COLORS.text, fontSize: 16 }]}>FINAL PRICE</Text>
                <Text style={[styles.subtotalValue, { color: COLORS.success, fontSize: 24 }]}>${formatCurrency(finalPrice)}</Text>
              </View>
            </View>

            {/* ESTIMATE RECORD / VERSION HISTORY */}
            <View style={styles.card}>
              <View style={styles.recordSection}>
                <Text style={styles.recordLabel}>ESTIMATE RECORD</Text>
                <Text style={styles.recordText}>Draft created: May 13, 2025 at 9:45 AM by You</Text>
              </View>

              <View style={styles.versionSection}>
                <Text style={styles.recordLabel}>VERSION HISTORY</Text>
                <View style={styles.versionRow}>
                  <View style={styles.versionBadgeActive}>
                    <View style={styles.versionDot} />
                    <Text style={styles.versionBadgeActiveText}>v1</Text>
                  </View>
                  <View style={styles.versionBadge}>
                    <View style={styles.versionDotInactive} />
                    <Text style={styles.versionBadgeText}>v2</Text>
                  </View>
                  <View style={styles.versionBadge}>
                    <View style={styles.versionDotInactive} />
                    <Text style={styles.versionBadgeText}>v3</Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <Pressable style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>SAVE AS NEW VERSION</Text>
                </Pressable>
                <Pressable style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>DUPLICATE</Text>
                </Pressable>
                <Pressable style={[styles.actionButton, styles.actionButtonDanger]}>
                  <Text style={styles.actionButtonDangerText}>DELETE DRAFT</Text>
                </Pressable>
              </View>
            </View>

            {/* BOTTOM PADDING */}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>

        {/* 3) RIGHT CURTAIN (LIVE DOCUMENT PREVIEW) */}
        <Animated.View style={[styles.curtainCol, { width: curtainAnim }]}>
          <View style={styles.curtainInner}>
            <View style={styles.curtainHeader}>
              <Text style={styles.curtainHeaderText}>LIVE DOCUMENT PREVIEW</Text>
              <Pressable onPress={toggleCurtain} style={styles.curtainClose}>
                <Text style={styles.curtainCloseText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.paper} showsVerticalScrollIndicator={false}>
              {/* WYSIWYG Document Content */}
              <View style={styles.paperHeader}>
                <View>
                  <Text style={styles.paperCompany}>YOUR COMPANY</Text>
                  <Text style={styles.paperSmall}>LIC # 123456</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.paperDocType}>ESTIMATE</Text>
                  <Text style={styles.paperSmall}># EST-2025-0007</Text>
                  <Text style={styles.paperSmall}>Date: May 13, 2025</Text>
                  <Text style={styles.paperSmall}>Expires: Jun 13, 2025</Text>
                </View>
              </View>

              <View style={styles.paperDivider} />

              <View style={styles.paperClientRow}>
                <View>
                  <Text style={styles.paperSectionTitle}>Client</Text>
                  <Text style={styles.paperText}>John Doe</Text>
                  <Text style={styles.paperText}>123 Ocean View Dr</Text>
                  <Text style={styles.paperText}>San Diego, CA 92109</Text>
                </View>
                <View>
                  <Text style={styles.paperSectionTitle}>Project</Text>
                  <Text style={styles.paperText}>Coastal Kitchen Remodel</Text>
                </View>
              </View>

              <Text style={styles.paperSectionTitle}>SCOPE SUMMARY</Text>
              <View style={styles.paperList}>
                <Text style={styles.paperText}>• Demolition</Text>
                <Text style={styles.paperText}>• Framing and structural modifications</Text>
                <Text style={styles.paperText}>• Drywall, texture, and paint</Text>
                <Text style={styles.paperText}>• Electrical and plumbing rough-in</Text>
                <Text style={styles.paperText}>• Window installation</Text>
              </View>

              <Text style={styles.paperSectionTitle}>COST BREAKDOWN</Text>
              <View style={styles.paperCostTable}>
                <View style={styles.paperCostRow}>
                  <Text style={styles.paperText}>Labor</Text>
                  <Text style={styles.paperText}>${formatCurrency(laborSubtotal)}</Text>
                </View>
                <View style={styles.paperCostRow}>
                  <Text style={styles.paperText}>Materials</Text>
                  <Text style={styles.paperText}>${formatCurrency(materialSubtotal)}</Text>
                </View>
                <View style={styles.paperCostRow}>
                  <Text style={styles.paperText}>Subcontractors</Text>
                  <Text style={styles.paperText}>${formatCurrency(subSubtotal)}</Text>
                </View>
                <View style={styles.paperCostRow}>
                  <Text style={styles.paperText}>Allowances</Text>
                  <Text style={styles.paperText}>${formatCurrency(allowanceSubtotal)}</Text>
                </View>
                <View style={[styles.paperCostRow, { marginTop: 8 }]}>
                  <Text style={[styles.paperText, { fontWeight: "700" }]}>Direct Cost</Text>
                  <Text style={[styles.paperText, { fontWeight: "700" }]}>${formatCurrency(directCost)}</Text>
                </View>
                <View style={styles.paperCostRow}>
                  <Text style={styles.paperText}>Contingency ({(Number(cont) * 100).toFixed(0)}%)</Text>
                  <Text style={styles.paperText}>${formatCurrency(contingencyAmt)}</Text>
                </View>
                <View style={styles.paperCostRow}>
                  <Text style={styles.paperText}>Overhead ({overhead}%)</Text>
                  <Text style={styles.paperText}>${formatCurrency(overheadAmt)}</Text>
                </View>
                <View style={styles.paperCostRow}>
                  <Text style={styles.paperText}>Profit ({profit}%)</Text>
                  <Text style={styles.paperText}>${formatCurrency(profitAmt)}</Text>
                </View>
              </View>

              <View style={styles.paperFinalRow}>
                <Text style={styles.paperFinalLabel}>TOTAL ESTIMATE</Text>
                <Text style={styles.paperFinalTotal}>${formatCurrency(finalPrice)}</Text>
              </View>

              <Text style={styles.paperSectionTitle}>ASSUMPTIONS & EXCLUSIONS</Text>
              <View style={styles.paperList}>
                <Text style={styles.paperText}>• Work performed during normal business hours</Text>
                <Text style={styles.paperText}>• Site access available</Text>
                <Text style={styles.paperText}>• No hazardous material removal</Text>
                <Text style={styles.paperText}>• Permits and fees excluded</Text>
                <Text style={styles.paperText}>• Appliance upgrades excluded</Text>
              </View>

              <View style={styles.paperSignatures}>
                <View style={styles.paperSigLine}>
                  <Text style={styles.paperSmall}>Client Signature / Date</Text>
                </View>
                <View style={styles.paperSigLine}>
                  <Text style={styles.paperSmall}>Authorized Signature / Date</Text>
                </View>
              </View>

              <Text style={styles.paperThankYou}>Thank you for the opportunity to work with you.</Text>
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#06090F",
  },

  // Header Bar
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0A0D14",
    borderBottomWidth: 1,
    borderBottomColor: "#1A2235",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "rgba(0, 242, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.primary,
  },
  headerInfo: {
    flex: 1,
  },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  headerMetaText: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.dim,
  },
  headerMetaDot: {
    fontSize: 9,
    color: COLORS.dim,
    marginHorizontal: 4,
  },
  draftBadge: {
    backgroundColor: "#1A2235",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  draftBadgeText: {
    fontSize: 8,
    fontWeight: "800",
    color: COLORS.warning,
  },
  projectTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  sendButtonText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#06090F",
  },

  // HUD Metrics Strip
  hudStripContainer: {
    backgroundColor: "#0D111A",
    borderBottomWidth: 1,
    borderBottomColor: "#1A2235",
  },
  hudStripContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  hudMetricItem: {
    paddingHorizontal: 16,
  },
  hudMetricItemFinal: {
    paddingHorizontal: 20,
    backgroundColor: "#0A0D14",
    paddingVertical: 6,
    marginLeft: 4,
  },
  hudLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: COLORS.dim,
    marginBottom: 2,
  },
  hudValue: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },
  hudFinalValue: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.success,
    textShadowColor: "rgba(0, 255, 156, 0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  hudDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#1A2235",
  },

  // Workspace layout with dynamic sizing via flex
  workspace: {
    flex: 1,
    flexDirection: "row",
  },
  mainCol: {
    flex: 1,
  },
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    padding: 12,
    gap: 12,
  },

  // Cards
  card: {
    backgroundColor: "#0D111A",
    borderWidth: 1,
    borderColor: "#1A2235",
    borderRadius: 10,
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontSize: 11,
    color: COLORS.dim,
  },
  cardAction: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
  },
  sectionBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "rgba(0, 242, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.primary,
  },

  // Pipeline
  pipelineRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pipelineNode: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#131824",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#1A2235",
  },
  pipelineNodeActive: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(0, 242, 255, 0.05)",
  },
  pipelineNodeIcon: {
    fontSize: 12,
    fontWeight: "700",
  },
  pipelineNodeText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.text,
  },
  pipelineNodeCount: {
    fontSize: 8,
    color: COLORS.dim,
  },

  // Chip Scroll
  microLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#64748B",
    marginBottom: 8,
    marginTop: 4,
  },
  chipScroll: {
    flexGrow: 0,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: "#131824",
    borderWidth: 1,
    borderColor: "#1A2235",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  chipActive: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(0, 242, 255, 0.1)",
  },
  chipText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.dim,
  },
  chipTextActive: {
    color: COLORS.primary,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.dim,
    fontStyle: "italic",
  },

  // Table Structure
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1A2235",
    paddingBottom: 8,
    marginBottom: 8,
    gap: 8,
  },
  th: {
    fontSize: 9,
    fontWeight: "800",
    color: "#64748B",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#131824",
    gap: 8,
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },
  rowDesc: {
    fontSize: 10,
    color: COLORS.dim,
    marginTop: 2,
  },
  rowText: {
    fontSize: 12,
    color: COLORS.text,
  },
  rowHighlight: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primary,
  },
  tableInput: {
    backgroundColor: "#06090F",
    borderWidth: 1,
    borderColor: "#1A2235",
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    textAlign: "center",
  },

  // Allowance Row specific
  allowanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  allowanceInfo: {
    flex: 1,
    paddingRight: 12,
  },
  allowanceNote: {
    fontSize: 10,
    color: COLORS.warning,
    marginTop: 4,
  },

  // Subtotal Row
  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#1A2235",
    backgroundColor: "#0A0D14",
    marginHorizontal: -14,
    paddingHorizontal: 14,
    marginBottom: -14,
    paddingBottom: 12,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  subtotalLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.dim,
  },
  subtotalRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  subtotalMeta: {
    fontSize: 11,
    color: COLORS.dim,
  },
  subtotalValue: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary,
  },

  // Job Conditions
  conditionsGrid: {
    gap: 10,
    marginBottom: 16,
  },
  conditionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  conditionLabel: {
    fontSize: 11,
    color: COLORS.text,
    width: 110,
  },
  conditionBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: "#1A2235",
    borderRadius: 3,
    overflow: "hidden",
  },
  conditionBar: {
    height: "100%",
    borderRadius: 3,
  },
  conditionLevel: {
    fontSize: 9,
    fontWeight: "800",
    width: 50,
    textAlign: "right",
  },

  // Pricing Modifiers
  sliderGrid: {
    gap: 12,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1,
  },
  sliderInput: {
    backgroundColor: "#06090F",
    borderWidth: 1,
    borderColor: "#1A2235",
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    textAlign: "center",
    width: 80,
    marginRight: 16,
  },
  pricingRows: {
    gap: 8,
    marginBottom: 16,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#131824",
  },
  pricingLabel: {
    fontSize: 13,
    color: COLORS.text,
  },
  pricingValue: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },
  finalPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#1A2235",
  },
  finalPriceLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary,
  },
  finalPriceValue: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.success,
    textShadowColor: "rgba(0, 255, 156, 0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  helperText: {
    fontSize: 11,
    color: COLORS.dim,
    marginBottom: 16,
  },

  // Record & Versions
  recordSection: {
    marginBottom: 12,
  },
  recordLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.dim,
    marginBottom: 4,
  },
  recordText: {
    fontSize: 11,
    color: COLORS.text,
  },
  versionSection: {
    marginBottom: 16,
  },
  versionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  versionBadgeActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 242, 255, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  versionBadgeActiveText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.primary,
  },
  versionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  versionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  versionBadgeText: {
    fontSize: 10,
    color: COLORS.dim,
  },
  versionDotInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.dim,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: "#1A2235",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.text,
  },
  actionButtonDanger: {
    borderColor: "#FF4D4D",
  },
  actionButtonDangerText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FF4D4D",
  },

  // Curtain (Right Panel)
  curtainCol: {
    backgroundColor: "#0A0D14",
    borderLeftWidth: 1,
    borderLeftColor: "#1A2235",
    overflow: "hidden",
  },
  curtainInner: {
    flex: 1,
    width: SCREEN_WIDTH * 0.85,
    padding: 12,
  },
  curtainHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  curtainHeaderText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.text,
  },
  curtainClose: {
    padding: 4,
  },
  curtainCloseText: {
    fontSize: 16,
    color: COLORS.dim,
  },

  // Paper (Document Preview)
  paper: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 20,
  },
  paperHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  paperCompany: {
    fontSize: 16,
    fontWeight: "900",
    color: "#000",
    letterSpacing: -0.3,
  },
  paperDocType: {
    fontSize: 16,
    fontWeight: "300",
    color: "#666",
    letterSpacing: 1.5,
  },
  paperSmall: {
    fontSize: 8,
    color: "#666",
    marginTop: 2,
  },
  paperDivider: {
    height: 2,
    backgroundColor: "#000",
    marginBottom: 12,
  },
  paperClientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  paperSectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#000",
    marginBottom: 6,
    marginTop: 12,
  },
  paperText: {
    fontSize: 10,
    color: "#333",
    lineHeight: 16,
  },
  paperList: {
    marginBottom: 12,
  },
  paperCostTable: {
    borderTopWidth: 1,
    borderTopColor: "#DDD",
    paddingTop: 6,
    marginBottom: 12,
  },
  paperCostRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  paperFinalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 2,
    borderTopColor: "#000",
    marginTop: 6,
    paddingTop: 10,
  },
  paperFinalLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#000",
  },
  paperFinalTotal: {
    fontSize: 14,
    fontWeight: "900",
    color: "#009050",
  },
  paperSignatures: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
  },
  paperSigLine: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    width: "45%",
    paddingTop: 6,
  },
  paperThankYou: {
    fontSize: 9,
    color: "#666",
    textAlign: "center",
    marginTop: 24,
    fontStyle: "italic",
  },
});
