// src/screens/ScopeOfWorkScreen.tsx

import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import FieldRateCard from "../components/fieldrate/FieldRateCard";
import FieldRateScreen from "../components/fieldrate/FieldRateScreen";
import { scopeRepository } from "../data/repositories/scopeRepository";
import { COLORS } from "../theme/colors";
import type { ScopeComponent, ScopeDraft, ScopeItem } from "../types/scope";

function now() {
  return new Date().toISOString();
}

function createScopeItem(): ScopeItem {
  return {
    id: Date.now().toString(),
    title: "",
    description: "",
    components: [],
    executionType: "selfPerform",
    materialType: "fixed",
    inclusions: [],
    exclusions: [],
    status: "draft",
    createdAt: now(),
    updatedAt: now(),
  };
}

export default function ScopeOfWorkScreen() {
  const [projectName, setProjectName] = useState("Untitled Project");
  const [status, setStatus] = useState<ScopeDraft["status"]>("draft");
  const [scopeItems, setScopeItems] = useState<ScopeItem[]>([createScopeItem()]);
  const [globalInclusions, setGlobalInclusions] = useState("Labor\nStandard cleanup\nDebris removal as noted");
  const [globalExclusions, setGlobalExclusions] = useState("Structural changes unless noted\nElectrical unless noted\nPermit fees unless noted");
  const [globalNotes, setGlobalNotes] = useState("");
  const [similarOpen, setSimilarOpen] = useState(false);

  function addScopeLine() {
    setScopeItems((prev) => [...prev, createScopeItem()]);
  }

  function updateScopeLine(id: string, patch: Partial<ScopeItem>) {
    setScopeItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...patch, updatedAt: now() } : item
      )
    );
  }

  function removeScopeLine(id: string) {
    setScopeItems((prev) => prev.filter((item) => item.id !== id));
  }

  function addComponent(scopeId: string) {
    const component: ScopeComponent = {
      id: Date.now().toString(),
      description: "",
    };

    setScopeItems((prev) =>
      prev.map((item) =>
        item.id === scopeId
          ? { ...item, components: [...item.components, component], updatedAt: now() }
          : item
      )
    );
  }

  function updateComponent(scopeId: string, componentId: string, description: string) {
    setScopeItems((prev) =>
      prev.map((item) =>
        item.id === scopeId
          ? {
              ...item,
              components: item.components.map((component) =>
                component.id === componentId
                  ? { ...component, description }
                  : component
              ),
              updatedAt: now(),
            }
          : item
      )
    );
  }

  async function saveDraft() {
    const draft: ScopeDraft = {
      id: "current-scope-draft",
      projectName,
      items: scopeItems,
      globalInclusions: globalInclusions.split("\n").filter(Boolean),
      globalExclusions: globalExclusions.split("\n").filter(Boolean),
      globalNotes,
      status,
      createdAt: now(),
      updatedAt: now(),
    };

    await scopeRepository.save(draft);
    Alert.alert("Scope Saved", "Your scope draft has been saved.");
  }

  return (
    <FieldRateScreen title="Scope of Work" subtitle="Define what is included and excluded">
      <FieldRateCard title="Scope Control">
        <View style={styles.statusRow}>
          <View>
            <Text style={styles.label}>Project</Text>
            <TextInput
              value={projectName}
              onChangeText={setProjectName}
              style={styles.titleInput}
            />
          </View>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{status.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.helperText}>
          Scope defines the work. Labor, materials, pricing, and performance happen later.
        </Text>
      </FieldRateCard>

      <FieldRateCard title="Scope Lines">
        {scopeItems.map((item, index) => (
          <View key={item.id} style={styles.scopeCard}>
            <View style={styles.scopeHeader}>
              <Text style={styles.scopeNumber}>{index + 1}</Text>
              <TextInput
                value={item.title}
                onChangeText={(text) => updateScopeLine(item.id, { title: text })}
                placeholder="Scope title"
                placeholderTextColor={COLORS.dim}
                style={styles.scopeTitle}
              />
            </View>

            <TextInput
              value={item.description}
              onChangeText={(text) => updateScopeLine(item.id, { description: text })}
              placeholder="Describe what is included in this scope line"
              placeholderTextColor={COLORS.dim}
              style={styles.textArea}
              multiline
            />

            <Text style={styles.sectionLabel}>Execution</Text>
            <View style={styles.chipRow}>
              <Pressable
                style={[
                  styles.chip,
                  item.executionType === "selfPerform" && styles.chipActive,
                ]}
                onPress={() => updateScopeLine(item.id, { executionType: "selfPerform" })}
              >
                <Text style={styles.chipText}>Self Perform</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.chip,
                  item.executionType === "subcontractor" && styles.chipActive,
                ]}
                onPress={() =>
                  updateScopeLine(item.id, { executionType: "subcontractor" })
                }
              >
                <Text style={styles.chipText}>Subcontractor</Text>
              </Pressable>
            </View>

            {item.executionType === "subcontractor" && (
              <TextInput
                value={item.subcontractorName || ""}
                onChangeText={(text) =>
                  updateScopeLine(item.id, { subcontractorName: text })
                }
                placeholder="Subcontractor name"
                placeholderTextColor={COLORS.dim}
                style={styles.input}
              />
            )}

            <Text style={styles.sectionLabel}>Material</Text>
            <View style={styles.chipRow}>
              <Pressable
                style={[
                  styles.chip,
                  item.materialType === "fixed" && styles.chipActive,
                ]}
                onPress={() => updateScopeLine(item.id, { materialType: "fixed" })}
              >
                <Text style={styles.chipText}>Fixed</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.chip,
                  item.materialType === "allowance" && styles.allowanceActive,
                ]}
                onPress={() => updateScopeLine(item.id, { materialType: "allowance" })}
              >
                <Text style={styles.chipText}>Allowance</Text>
              </Pressable>
            </View>

            {item.materialType === "allowance" && (
              <>
                <TextInput
                  value={item.allowanceAmount ? String(item.allowanceAmount) : ""}
                  onChangeText={(text) =>
                    updateScopeLine(item.id, {
                      allowanceAmount: Number(text) || 0,
                    })
                  }
                  placeholder="Allowance amount"
                  placeholderTextColor={COLORS.dim}
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
                <TextInput
                  value={item.allowanceNote || ""}
                  onChangeText={(text) =>
                    updateScopeLine(item.id, { allowanceNote: text })
                  }
                  placeholder="Allowance note"
                  placeholderTextColor={COLORS.dim}
                  style={styles.input}
                />
              </>
            )}

            <Text style={styles.sectionLabel}>Components</Text>
            {item.components.map((component) => (
              <TextInput
                key={component.id}
                value={component.description}
                onChangeText={(text) => updateComponent(item.id, component.id, text)}
                placeholder="Component / included step"
                placeholderTextColor={COLORS.dim}
                style={styles.input}
              />
            ))}

            <Pressable style={styles.subtleButton} onPress={() => addComponent(item.id)}>
              <Text style={styles.subtleButtonText}>+ Add Component</Text>
            </Pressable>

            <TextInput
              value={item.notes || ""}
              onChangeText={(text) => updateScopeLine(item.id, { notes: text })}
              placeholder="Notes / assumptions"
              placeholderTextColor={COLORS.dim}
              style={styles.textArea}
              multiline
            />

            <Pressable onPress={() => removeScopeLine(item.id)}>
              <Text style={styles.removeText}>Remove Scope Line</Text>
            </Pressable>
          </View>
        ))}

        <Pressable style={styles.addLineButton} onPress={addScopeLine}>
          <Text style={styles.addLineText}>+ Add Scope Line</Text>
        </Pressable>
      </FieldRateCard>

      <FieldRateCard title="Similar Past Scopes">
        <Pressable onPress={() => setSimilarOpen((value) => !value)}>
          <Text style={styles.libraryToggle}>
            {similarOpen ? "Hide" : "Show"} scope library placeholder
          </Text>
        </Pressable>

        {similarOpen && (
          <View style={styles.libraryBox}>
            <Text style={styles.libraryTitle}>Window Replacement</Text>
            <Text style={styles.libraryText}>
              Used before: remove window, prep opening, install unit, seal, trim.
            </Text>
            <Text style={styles.libraryTitle}>Interior Remodel</Text>
            <Text style={styles.libraryText}>
              Used before: demo, framing, drywall, paint, flooring.
            </Text>
          </View>
        )}
      </FieldRateCard>

      <FieldRateCard title="Global Inclusions">
        <TextInput
          value={globalInclusions}
          onChangeText={setGlobalInclusions}
          multiline
          style={styles.textArea}
        />
      </FieldRateCard>

      <FieldRateCard title="Global Exclusions">
        <TextInput
          value={globalExclusions}
          onChangeText={setGlobalExclusions}
          multiline
          style={styles.textArea}
        />
      </FieldRateCard>

      <FieldRateCard title="Global Notes">
        <TextInput
          value={globalNotes}
          onChangeText={setGlobalNotes}
          placeholder="General notes, assumptions, or clarifications"
          placeholderTextColor={COLORS.dim}
          multiline
          style={styles.textArea}
        />
      </FieldRateCard>

      <View style={styles.actionRow}>
        <Pressable style={styles.secondaryButton} onPress={saveDraft}>
          <Text style={styles.secondaryButtonText}>Save Draft</Text>
        </Pressable>

        <Pressable
          style={styles.primaryButton}
          onPress={() => {
            setStatus("sent-to-estimate");
            saveDraft();
          }}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </Pressable>
      </View>
    </FieldRateScreen>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  label: {
    color: COLORS.dim,
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 4,
  },
  titleInput: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 6,
    minWidth: 180,
  },
  statusBadge: {
    borderWidth: 1,
    borderColor: COLORS.warning,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    color: COLORS.warning,
    fontSize: 10,
    fontWeight: "900",
  },
  helperText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
  scopeCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    gap: 10,
  },
  scopeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  scopeNumber: {
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
  scopeTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 6,
  },
  sectionLabel: {
    color: COLORS.dim,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    marginTop: 4,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryDim,
  },
  allowanceActive: {
    borderColor: COLORS.warning,
    backgroundColor: "rgba(255, 180, 60, 0.15)",
  },
  chipText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "800",
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
  textArea: {
    minHeight: 82,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    fontSize: 14,
    textAlignVertical: "top",
  },
  subtleButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  subtleButtonText: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  removeText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right",
  },
  addLineButton: {
    alignItems: "center",
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    borderStyle: "dashed",
  },
  addLineText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  libraryToggle: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  libraryBox: {
    marginTop: 12,
    gap: 8,
  },
  libraryTitle: {
    color: COLORS.text,
    fontWeight: "900",
  },
  libraryText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontWeight: "900",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryButtonText: {
    color: COLORS.background,
    fontWeight: "900",
  },
});