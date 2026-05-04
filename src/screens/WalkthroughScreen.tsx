// src/screens/WalkthroughScreen.tsx

import React, { useEffect, useState, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import FieldRateCard from "../components/fieldrate/FieldRateCard";
import FieldRateScreen from "../components/fieldrate/FieldRateScreen";
import ClientDiscoveryCard from "../components/walkthrough/ClientDiscoveryCard";
import WalkthroughRichTextEditor from "../components/walkthrough/WalkthroughRichTextEditor";
import { walkthroughRepository } from "../data/repositories/walkthroughRepository";
import { COLORS } from "../theme/colors";
import type {
  WalkthroughClientDiscovery,
  WalkthroughDraft,
  WalkthroughTag,
} from "../types/walkthrough";

const PINK = "#EC4899";

const TAGS: { tag: WalkthroughTag; label: string; meaning: string }[] = [
  { tag: "none", label: "T", meaning: "Normal" },
  { tag: "blue", label: "Blue", meaning: "Self / definite work" },
  { tag: "pink", label: "Pink", meaning: "Sub / trade item" },
  { tag: "orange", label: "Orange", meaning: "Maybe / allowance / pending" },
  { tag: "red", label: "Red", meaning: "Issues / Risks" },
];

const defaultClientDiscovery: WalkthroughClientDiscovery = {
  clientConversationNotes: "",
  conceptA_description: "",
  conceptA_price: "",
  conceptA_notes: "",
  conceptB_description: "",
  conceptB_price: "",
  conceptB_notes: "",
  conceptC_description: "",
  conceptC_price: "",
  conceptC_notes: "",
  productMaterialNotes: "",
  preferredOptions: "",
  avoidConcernItems: "",
  budgetConversationNotes: "",
  basicRange: "",
  midRange: "",
  premiumRange: "",
  pricingRisks: "",
  timelineConversationNotes: "",
  idealStartWindow: "",
  requiredFinishDeadline: "",
  possiblePhases: "",
  accessDisruptionNotes: "",
};

function now() {
  return new Date().toISOString();
}

function createSnapshot(
  projectName: string,
  title: string,
  scopeDraft: string,
  roughRichText?: any
) {
  return {
    id: `snap-${Date.now()}`,
    title,
    projectName,
    contentBlocks: [],
    scopeDraft,
    roughRichText,
    createdAt: now(),
  };
}

// Map rich text color to tag
function getColorTag(colorHex?: string): WalkthroughTag {
  if (!colorHex || colorHex === COLORS.text) return "none";
  if (colorHex === COLORS.primary) return "blue";
  if (colorHex === PINK) return "pink";
  if (colorHex === COLORS.warning) return "orange";
  if (colorHex === COLORS.danger) return "red";
  return "none";
}

// Extract tags present in a paragraph node
function getTagsInParagraph(paragraphNode: any): Set<WalkthroughTag> {
  const tags = new Set<WalkthroughTag>();
  if (!paragraphNode.content) return tags;
  
  paragraphNode.content.forEach((node: any) => {
    if (node.type === "text") {
      const colorMark = node.marks?.find((m: any) => m.type === "textStyle");
      const color = colorMark?.attrs?.color;
      tags.add(getColorTag(color));
    }
  });
  return tags;
}

// Group paragraphs by tag for Organized Review
function groupParagraphsByTag(json: any) {
  const groups: Record<WalkthroughTag, any[]> = {
    none: [],
    blue: [],
    pink: [],
    orange: [],
    red: [],
  };

  if (!json || !json.content) return groups;

  json.content.forEach((node: any) => {
    if (node.type === "paragraph" && node.content) {
      const tags = getTagsInParagraph(node);
      // If no formatted tags, it belongs to 'none'
      if (tags.size === 0 || (tags.size === 1 && tags.has("none"))) {
         groups.none.push(node);
      } else {
        // If a paragraph contains a tag, add the whole paragraph to that tag's group
        // If it contains multiple tags, it appears in multiple groups (preserving context)
        tags.forEach(tag => {
          if (tag !== "none") {
             groups[tag].push(node);
          }
        });
      }
    }
  });

  return groups;
}

export default function WalkthroughScreen() {
  const [projectName, setProjectName] = useState("Untitled Project");
  const [title, setTitle] = useState("Initial Walkthrough");
  const [scopeDraft, setScopeDraft] = useState("");
  const [scopeHandoffDraft, setScopeHandoffDraft] = useState("");
  const [selectedScopeText, setSelectedScopeText] = useState("");
  const [snapshots, setSnapshots] = useState<WalkthroughDraft["snapshots"]>([]);
  const [reviewOpen, setReviewOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [clientDiscoveryOpen, setClientDiscoveryOpen] = useState(false);
  const [clientDiscovery, setClientDiscovery] = useState<WalkthroughClientDiscovery>(defaultClientDiscovery);
  const [roughRichText, setRoughRichText] = useState<any>(null);
  const [editorResetKey, setEditorResetKey] = useState(0);

  useEffect(() => {
    async function loadSaved() {
      const saved = await walkthroughRepository.getLatest();
      if (!saved) return;

      setProjectName(saved.projectName || "Untitled Project");
      setTitle(saved.title || "Initial Walkthrough");
      setScopeDraft(saved.scopeDraft || "");
      setScopeHandoffDraft(saved.scopeHandoffDraft || "");
      setSnapshots(saved.snapshots || []);
      setClientDiscovery(saved.clientDiscovery || defaultClientDiscovery);
      setRoughRichText(saved.roughRichText || null);
    }

    loadSaved();
  }, []);

  useEffect(() => {
    const draft: WalkthroughDraft = {
      id: "current-walkthrough-draft",
      projectName,
      title,
      contentBlocks: [], // Legacy, keep empty
      scopeDraft,
      scopeHandoffDraft,
      snapshots,
      clientDiscovery,
      roughRichText,
      createdAt: now(),
      updatedAt: now(),
    };

    walkthroughRepository.save(draft);
  }, [projectName, title, scopeDraft, scopeHandoffDraft, snapshots, clientDiscovery, roughRichText]);

  function saveSnapshot() {
    if (!scopeDraft.trim() && !roughRichText) return;

    setSnapshots((prev) =>
      [createSnapshot(projectName, title, scopeDraft, roughRichText), ...prev].slice(0, 12)
    );
  }

  function clearScopeDraft() {
    saveSnapshot();
    setScopeDraft("");
  }

  function saveWholePageAndStartFresh() {
    saveSnapshot();
    setScopeDraft("");
    setRoughRichText(null);
    setEditorResetKey(prev => prev + 1);
    setTitle("Initial Walkthrough");
  }

  function buildClientDiscoveryText(section: "concepts" | "products" | "budget" | "timeline" | "all") {
    const parts: string[] = [];

    if (section === "concepts" || section === "all") {
      if (clientDiscovery.conceptA_description || clientDiscovery.conceptA_price || clientDiscovery.conceptA_notes) {
        parts.push("Concept A:");
        if (clientDiscovery.conceptA_description) parts.push(`• ${clientDiscovery.conceptA_description}`);
        if (clientDiscovery.conceptA_price) parts.push(`• Price: ${clientDiscovery.conceptA_price}`);
        if (clientDiscovery.conceptA_notes) parts.push(`• Notes: ${clientDiscovery.conceptA_notes}`);
      }
      if (clientDiscovery.conceptB_description || clientDiscovery.conceptB_price || clientDiscovery.conceptB_notes) {
        parts.push("Concept B:");
        if (clientDiscovery.conceptB_description) parts.push(`• ${clientDiscovery.conceptB_description}`);
        if (clientDiscovery.conceptB_price) parts.push(`• Price: ${clientDiscovery.conceptB_price}`);
        if (clientDiscovery.conceptB_notes) parts.push(`• Notes: ${clientDiscovery.conceptB_notes}`);
      }
      if (clientDiscovery.conceptC_description || clientDiscovery.conceptC_price || clientDiscovery.conceptC_notes) {
        parts.push("Concept C:");
        if (clientDiscovery.conceptC_description) parts.push(`• ${clientDiscovery.conceptC_description}`);
        if (clientDiscovery.conceptC_price) parts.push(`• Price: ${clientDiscovery.conceptC_price}`);
        if (clientDiscovery.conceptC_notes) parts.push(`• Notes: ${clientDiscovery.conceptC_notes}`);
      }
    }

    if (section === "products" || section === "all") {
      if (clientDiscovery.productMaterialNotes || clientDiscovery.preferredOptions || clientDiscovery.avoidConcernItems) {
        parts.push("Product / Material Options:");
        if (clientDiscovery.productMaterialNotes) parts.push(`• ${clientDiscovery.productMaterialNotes}`);
        if (clientDiscovery.preferredOptions) parts.push(`• Preferred: ${clientDiscovery.preferredOptions}`);
        if (clientDiscovery.avoidConcernItems) parts.push(`• Avoid / Concerns: ${clientDiscovery.avoidConcernItems}`);
      }
    }

    if (section === "budget" || section === "all") {
      if (clientDiscovery.budgetConversationNotes || clientDiscovery.basicRange || clientDiscovery.midRange || clientDiscovery.premiumRange || clientDiscovery.pricingRisks) {
        parts.push("Budget Strategy:");
        if (clientDiscovery.budgetConversationNotes) parts.push(`• ${clientDiscovery.budgetConversationNotes}`);
        if (clientDiscovery.basicRange) parts.push(`• Basic Range: ${clientDiscovery.basicRange}`);
        if (clientDiscovery.midRange) parts.push(`• Mid Range: ${clientDiscovery.midRange}`);
        if (clientDiscovery.premiumRange) parts.push(`• Premium Range: ${clientDiscovery.premiumRange}`);
        if (clientDiscovery.pricingRisks) parts.push(`• Risks: ${clientDiscovery.pricingRisks}`);
      }
    }

    if (section === "timeline" || section === "all") {
      if (clientDiscovery.timelineConversationNotes || clientDiscovery.idealStartWindow || clientDiscovery.requiredFinishDeadline || clientDiscovery.possiblePhases || clientDiscovery.accessDisruptionNotes) {
        parts.push("Timeline / Phasing:");
        if (clientDiscovery.timelineConversationNotes) parts.push(`• ${clientDiscovery.timelineConversationNotes}`);
        if (clientDiscovery.idealStartWindow) parts.push(`• Start: ${clientDiscovery.idealStartWindow}`);
        if (clientDiscovery.requiredFinishDeadline) parts.push(`• Deadline: ${clientDiscovery.requiredFinishDeadline}`);
        if (clientDiscovery.possiblePhases) parts.push(`• Phases: ${clientDiscovery.possiblePhases}`);
        if (clientDiscovery.accessDisruptionNotes) parts.push(`• Constraints: ${clientDiscovery.accessDisruptionNotes}`);
      }
    }

    return parts.join("\n");
  }

  function insertClientDiscovery(section: "concepts" | "products" | "budget" | "timeline" | "all") {
    const textToInsert = buildClientDiscoveryText(section);
    if (!textToInsert) return;

    setScopeDraft((prev) =>
      prev.trim() ? `${prev.trim()}\n\n${textToInsert}` : textToInsert
    );
  }

  function extractPlainTextFromRichText(json: any): string {
    if (!json || !json.content) return "";
    
    return json.content.map((node: any) => {
      if (node.type === "paragraph" && node.content) {
        return node.content.map((textNode: any) => textNode.text || "").join("");
      }
      return "";
    }).filter(Boolean).join("\n\n");
  }

  function extractPlainTextByTag(json: any, targetTag: WalkthroughTag | "all"): string {
    if (!json || !json.content) return "";

    const parts: string[] = [];

    json.content.forEach((node: any) => {
        if (node.type === "paragraph" && node.content) {
            let includeParagraph = false;
            
            if (targetTag === "all") {
                includeParagraph = true;
            } else {
                const tags = getTagsInParagraph(node);
                if (targetTag === "none") {
                    if (tags.size === 0 || (tags.size === 1 && tags.has("none"))) {
                        includeParagraph = true;
                    }
                } else if (tags.has(targetTag)) {
                    includeParagraph = true;
                }
            }

            if (includeParagraph) {
                const text = node.content.map((textNode: any) => textNode.text || "").join("");
                if (text) parts.push(`• ${text}`);
            }
        }
    });

    return parts.join("\n");
  }

  function insertRichNotesToDraft(tag: WalkthroughTag | "all") {
    if (!roughRichText) return;
    
    let plainText = "";

    if (tag === "all") {
        plainText = extractPlainTextFromRichText(roughRichText);
    } else {
        plainText = extractPlainTextByTag(roughRichText, tag);
    }
    
    if (!plainText.trim()) return;

    setScopeDraft((prev) =>
      prev.trim() ? `${prev.trim()}\n\n${plainText}` : plainText
    );
  }

  function sendEntireDraftToScope() {
    if (!scopeDraft.trim()) return;
    setScopeHandoffDraft(prev => prev.trim() ? `${prev.trim()}\n\n${scopeDraft}` : scopeDraft);
  }

  function sendSelectedToScope() {
    if (!selectedScopeText.trim()) return;
    setScopeHandoffDraft(prev => prev.trim() ? `${prev.trim()}\n\n${selectedScopeText}` : selectedScopeText);
  }

  function clearSelection() {
    setSelectedScopeText("");
  }

  function clearHandoffQueue() {
    setScopeHandoffDraft("");
  }

  function restoreSnapshot(snapshotId: string) {
    const snapshot = snapshots.find((item) => item.id === snapshotId);
    if (!snapshot) return;

    saveSnapshot();

    setProjectName(snapshot.projectName);
    setTitle(snapshot.title);
    setScopeDraft(snapshot.scopeDraft);
    setRoughRichText(snapshot.roughRichText || null);
    setEditorResetKey(prev => prev + 1);
  }

  function deleteSnapshot(snapshotId: string) {
    setSnapshots((prev) => prev.filter((s) => s.id !== snapshotId));
  }

  // Render a rich text paragraph natively
  const renderRichParagraph = (node: any, index: number) => {
    if (node.type !== "paragraph" || !node.content) return null;

    return (
      <Text key={index} style={styles.previewParagraph}>
        {node.content.map((child: any, i: number) => {
           if (child.type === "text") {
              const marks = child.marks || [];
              const isBold = marks.some((m: any) => m.type === "bold");
              const isUnderline = marks.some((m: any) => m.type === "underline");
              const colorMark = marks.find((m: any) => m.type === "textStyle");
              const color = colorMark?.attrs?.color || COLORS.text;
        
              return (
                <Text
                  key={i}
                  style={[
                    { color },
                    isBold && { fontWeight: "bold" },
                    isUnderline && { textDecorationLine: "underline" },
                  ]}
                >
                  {child.text}
                </Text>
              );
            }
            return null;
        })}
      </Text>
    );
  };

  const groupedParagraphs = useMemo(() => groupParagraphsByTag(roughRichText), [roughRichText]);

  return (
    <View style={styles.container}>
      <FieldRateScreen title="Walkthrough" subtitle="Capture field reality first">
        <View style={styles.topToggleContainer}>
          <Pressable
            style={styles.topToggleButton}
            onPress={() => setClientDiscoveryOpen(true)}
          >
            <Text style={styles.topToggleText}>Client Discovery</Text>
          </Pressable>
        </View>

        <FieldRateCard title="Walkthrough Control">
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Project Name</Text>
            <TextInput
              value={projectName}
              onChangeText={setProjectName}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Walkthrough Title</Text>
            <TextInput value={title} onChangeText={setTitle} style={styles.input} />
          </View>
        </FieldRateCard>

        <FieldRateCard title="Rough Notes">
          <Text style={styles.helper}>
            Capture messy jobsite notes. Select text to format colors for field triage.
          </Text>
          <WalkthroughRichTextEditor value={roughRichText} onChange={setRoughRichText} resetKey={editorResetKey} />
        </FieldRateCard>

        <FieldRateCard title="Organized Review">
          <Pressable onPress={() => setReviewOpen((value) => !value)}>
            <Text style={styles.libraryToggle}>
              {reviewOpen ? "Hide" : "Show"} grouped notes
            </Text>
          </Pressable>

          <View style={styles.countGrid}>
            {TAGS.map((item) => (
              <View key={item.tag} style={styles.countBox}>
                <Text style={styles.countValue}>{groupedParagraphs[item.tag].length}</Text>
                <Text style={styles.countLabel}>{item.meaning}</Text>
              </View>
            ))}
          </View>

          {reviewOpen && (
            <View style={styles.noteList}>
              {TAGS.map((tagItem) => {
                const paragraphs = groupedParagraphs[tagItem.tag];
                if (paragraphs.length === 0) return null;

                return (
                  <View key={tagItem.tag} style={styles.groupContainer}>
                    <Text style={[styles.groupTitle, { color: getTagTextColor(tagItem.tag) }]}>
                      {tagItem.meaning}
                    </Text>
                    {paragraphs.map((node, index) => (
                        <View key={index} style={[styles.noteItem, tagStyle(tagItem.tag)]}>
                           {renderRichParagraph(node, index)}
                        </View>
                    ))}
                  </View>
                );
              })}
            </View>
          )}
        </FieldRateCard>

        <FieldRateCard title="Rough Scope Draft">
          <View style={styles.discoveryInsertSection}>
            
            <Text style={styles.label}>Insert Review Items</Text>
            <View style={styles.insertActions}>
              <Pressable style={styles.insertButton} onPress={() => insertRichNotesToDraft("blue")}>
                  <Text style={[styles.insertButtonText, { color: getTagTextColor("blue") }]}>Insert Blue Items</Text>
              </Pressable>
              <Pressable style={styles.insertButton} onPress={() => insertRichNotesToDraft("pink")}>
                  <Text style={[styles.insertButtonText, { color: getTagTextColor("pink") }]}>Insert Pink Items</Text>
              </Pressable>
              <Pressable style={styles.insertButton} onPress={() => insertRichNotesToDraft("orange")}>
                  <Text style={[styles.insertButtonText, { color: getTagTextColor("orange") }]}>Insert Orange Items</Text>
              </Pressable>
              <Pressable style={styles.insertButton} onPress={() => insertRichNotesToDraft("red")}>
                  <Text style={[styles.insertButtonText, { color: getTagTextColor("red") }]}>Insert Red Items</Text>
              </Pressable>
            </View>

            <Text style={[styles.label, {marginTop: 16}]}>Insert From Client Discovery</Text>
            <View style={styles.insertActions}>
              <Pressable style={styles.insertButton} onPress={() => insertClientDiscovery("concepts")}>
                <Text style={styles.insertButtonText}>Insert Concepts</Text>
              </Pressable>
              <Pressable style={styles.insertButton} onPress={() => insertClientDiscovery("products")}>
                <Text style={styles.insertButtonText}>Insert Products</Text>
              </Pressable>
              <Pressable style={styles.insertButton} onPress={() => insertClientDiscovery("budget")}>
                <Text style={styles.insertButtonText}>Insert Budget</Text>
              </Pressable>
              <Pressable style={styles.insertButton} onPress={() => insertClientDiscovery("timeline")}>
                <Text style={styles.insertButtonText}>Insert Timeline</Text>
              </Pressable>
            </View>

             <Text style={[styles.label, {marginTop: 16}]}>Draft Actions</Text>
             <View style={styles.insertActions}>
                <Pressable style={styles.insertButton} onPress={() => insertRichNotesToDraft("all")}>
                    <Text style={styles.insertButtonText}>Insert All Rough Notes</Text>
                </Pressable>
                <Pressable style={styles.insertButton} onPress={() => insertClientDiscovery("all")}>
                    <Text style={styles.insertButtonText}>Insert All Discovery</Text>
                </Pressable>
                <Pressable style={[styles.insertButton, styles.dangerBtn]} onPress={clearScopeDraft}>
                    <Text style={[styles.insertButtonText, styles.dangerText]}>Clear Draft</Text>
                </Pressable>
                <Pressable style={[styles.insertButton, styles.dangerBtn]} onPress={saveWholePageAndStartFresh}>
                    <Text style={[styles.insertButtonText, styles.dangerText]}>Save Version & Start Fresh</Text>
                </Pressable>
             </View>
          </View>

          <TextInput
            style={styles.draftInput}
            multiline
            placeholder="Rewrite the messy notes into clean scope language..."
            placeholderTextColor={COLORS.dim}
            value={scopeDraft}
            onChangeText={setScopeDraft}
          />

          <View style={styles.discoveryInsertSection}>
            <Text style={[styles.label, {marginTop: 16}]}>Selected Text for Scope</Text>
            <TextInput
              style={[styles.draftInput, { minHeight: 80 }]}
              multiline
              placeholder="Paste or type specific text to send..."
              placeholderTextColor={COLORS.dim}
              value={selectedScopeText}
              onChangeText={setSelectedScopeText}
            />

            <Text style={[styles.label, {marginTop: 16}]}>Send to Office / Scope</Text>
            <View style={styles.insertActions}>
              <Pressable style={styles.insertButton} onPress={sendEntireDraftToScope}>
                  <Text style={styles.insertButtonText}>Send Entire Draft to Scope</Text>
              </Pressable>
              <Pressable style={styles.insertButton} onPress={sendSelectedToScope}>
                  <Text style={styles.insertButtonText}>Send Selected Section to Scope</Text>
              </Pressable>
              <Pressable style={[styles.insertButton, styles.dangerBtn]} onPress={clearSelection}>
                  <Text style={[styles.insertButtonText, styles.dangerText]}>Clear Selection</Text>
              </Pressable>
            </View>
          </View>
        </FieldRateCard>

        <FieldRateCard title="Document Preview">
          <Text style={styles.previewTitle}>Field-to-Office Handoff</Text>
          <Text style={styles.previewText}>
            {scopeDraft.trim() || "Your rough scope draft will preview here."}
          </Text>
        </FieldRateCard>

        <FieldRateCard title="Scope Handoff Queue">
          {scopeHandoffDraft ? (
            <Text style={styles.previewText}>{scopeHandoffDraft}</Text>
          ) : (
            <Text style={styles.emptyText}>Nothing sent to scope yet.</Text>
          )}
          {scopeHandoffDraft ? (
             <View style={[styles.insertActions, {marginTop: 16}]}>
                <Pressable style={[styles.insertButton, styles.dangerBtn]} onPress={clearHandoffQueue}>
                  <Text style={[styles.insertButtonText, styles.dangerText]}>Clear Handoff Queue</Text>
                </Pressable>
             </View>
          ) : null}
        </FieldRateCard>

        <FieldRateCard title="Previous Versions">
          <Pressable onPress={() => setHistoryOpen((value) => !value)}>
            <Text style={styles.libraryToggle}>
              {historyOpen ? "Hide" : "Show"} saved versions ({snapshots.length})
            </Text>
          </Pressable>

          {historyOpen && (
            <View style={styles.noteList}>
              {snapshots.length === 0 && (
                <Text style={styles.emptyText}>No previous versions yet.</Text>
              )}

              {snapshots.map((snapshot) => (
                <View key={snapshot.id} style={styles.historyItem}>
                  <View style={styles.historyTitleContent}>
                    <Text style={styles.historyTitle} numberOfLines={1}>{snapshot.title}</Text>
                    <Text style={styles.historyMeta}>
                      {new Date(snapshot.createdAt).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.historyActions}>
                    <Pressable onPress={() => restoreSnapshot(snapshot.id)}>
                      <Text style={styles.restoreText}>Restore</Text>
                    </Pressable>
                    <Pressable onPress={() => deleteSnapshot(snapshot.id)}>
                      <Text style={[styles.restoreText, styles.dangerText]}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </FieldRateCard>
      </FieldRateScreen>

      {clientDiscoveryOpen && (
        <View style={styles.curtainOverlay}>
          <View style={styles.curtainHeader}>
            <Text style={styles.curtainTitle}>Client Discovery</Text>
            <Pressable onPress={() => setClientDiscoveryOpen(false)}>
              <Text style={styles.closeCurtainText}>Close Discovery</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.curtainScroll} contentContainerStyle={styles.curtainContent}>
            <ClientDiscoveryCard value={clientDiscovery} onChange={setClientDiscovery} />
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function tagStyle(tag: WalkthroughTag) {
  if (tag === "blue") return styles.blueTag;
  if (tag === "pink") return styles.pinkTag;
  if (tag === "orange") return styles.orangeTag;
  if (tag === "red") return styles.redTag;
  return styles.normalTag;
}

function getTagTextColor(tag: WalkthroughTag) {
  if (tag === "blue") return COLORS.primary;
  if (tag === "pink") return PINK;
  if (tag === "orange") return COLORS.warning;
  if (tag === "red") return COLORS.danger;
  return COLORS.text;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topToggleContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  topToggleButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  topToggleText: {
    color: COLORS.primary,
    fontWeight: "900",
    fontSize: 14,
  },
  curtainOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    zIndex: 100,
  },
  curtainHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  curtainTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },
  closeCurtainText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 14,
  },
  curtainScroll: {
    flex: 1,
  },
  curtainContent: {
    padding: 16,
    paddingBottom: 40,
  },
  inputGroup: {
    gap: 4,
    marginBottom: 10,
  },
  label: {
    color: COLORS.dim,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
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
  helper: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  noteList: {
    gap: 10,
    marginTop: 12,
  },
  groupContainer: {
    marginBottom: 16,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 8,
    color: COLORS.text,
  },
  noteItem: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  normalTag: {
    borderColor: COLORS.border,
  },
  blueTag: {
    borderColor: COLORS.primary,
  },
  pinkTag: {
    borderColor: PINK,
  },
  orangeTag: {
    borderColor: COLORS.warning,
  },
  redTag: {
    borderColor: COLORS.danger,
  },
  libraryToggle: {
    color: COLORS.primary,
    fontWeight: "800",
    marginBottom: 12,
  },
  countGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  countBox: {
    width: "48%",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 10,
    backgroundColor: COLORS.background,
  },
  countValue: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "900",
  },
  countLabel: {
    color: COLORS.dim,
    fontSize: 10,
    marginTop: 4,
  },
  discoveryInsertSection: {
    marginBottom: 16,
  },
  insertActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  insertButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surface,
  },
  insertButtonText: {
    fontWeight: "800",
    fontSize: 11,
    color: COLORS.text,
  },
  dangerBtn: {
    borderColor: COLORS.danger,
  },
  dangerText: {
    color: COLORS.danger,
  },
  draftInput: {
    minHeight: 180,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    textAlignVertical: "top",
  },
  previewTitle: {
    color: COLORS.primary,
    fontWeight: "900",
    marginBottom: 8,
  },
  previewText: {
    color: COLORS.text,
    lineHeight: 20,
  },
  historyItem: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 10,
    backgroundColor: COLORS.background,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  historyTitleContent: {
    flex: 1,
    marginRight: 16,
  },
  historyTitle: {
    color: COLORS.text,
    fontWeight: "900",
  },
  historyMeta: {
    color: COLORS.dim,
    fontSize: 11,
    marginTop: 4,
  },
  historyActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  restoreText: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  previewParagraph: {
    marginBottom: 0,
    lineHeight: 20,
    fontSize: 14,
  },
});
