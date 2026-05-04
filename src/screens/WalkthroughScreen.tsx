// src/screens/WalkthroughScreen.tsx

import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import FieldRateCard from "../components/fieldrate/FieldRateCard";
import FieldRateScreen from "../components/fieldrate/FieldRateScreen";
import ClientDiscoveryCard from "../components/walkthrough/ClientDiscoveryCard";
import { walkthroughRepository } from "../data/repositories/walkthroughRepository";
import { COLORS } from "../theme/colors";
import type {
  WalkthroughClientDiscovery,
  WalkthroughContentBlock,
  WalkthroughDraft,
  WalkthroughTag,
} from "../types/walkthrough";

const TAGS: { tag: WalkthroughTag; label: string; meaning: string }[] = [
  { tag: "none", label: "T", meaning: "Normal" },
  { tag: "blue", label: "Blue", meaning: "Self / definite work" },
  { tag: "cyan", label: "Cyan", meaning: "Sub / trade item" },
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

function createTextBlock(
  text: string,
  tag: WalkthroughTag,
  isBold: boolean,
  isUnderline: boolean
): WalkthroughContentBlock {
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    type: "text",
    text,
    tag,
    createdAt: now(),
    isBold,
    isUnderline,
  } as unknown as WalkthroughContentBlock;
}

function createImageBlock(tag: WalkthroughTag): WalkthroughContentBlock {
  return {
    id: Date.now().toString(),
    type: "image",
    uri: "placeholder",
    caption: "",
    tag,
    createdAt: now(),
  };
}

function createSnapshot(
  projectName: string,
  title: string,
  contentBlocks: WalkthroughContentBlock[],
  scopeDraft: string
) {
  return {
    id: `snap-${Date.now()}`,
    title,
    projectName,
    contentBlocks,
    scopeDraft,
    createdAt: now(),
  };
}

export default function WalkthroughScreen() {
  const [projectName, setProjectName] = useState("Untitled Project");
  const [title, setTitle] = useState("Initial Walkthrough");
  const [activeTag, setActiveTag] = useState<WalkthroughTag>("none");
  const [inputText, setInputText] = useState("");
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isBold, setIsBold] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [contentBlocks, setContentBlocks] = useState<WalkthroughContentBlock[]>([]);
  const [scopeDraft, setScopeDraft] = useState("");
  const [snapshots, setSnapshots] = useState<WalkthroughDraft["snapshots"]>([]);
  const [reviewOpen, setReviewOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [clientDiscoveryOpen, setClientDiscoveryOpen] = useState(false);
  const [clientDiscovery, setClientDiscovery] = useState<WalkthroughClientDiscovery>(defaultClientDiscovery);

  useEffect(() => {
    async function loadSaved() {
      const saved = await walkthroughRepository.getLatest();
      if (!saved) return;

      setProjectName(saved.projectName || "Untitled Project");
      setTitle(saved.title || "Initial Walkthrough");
      setContentBlocks(saved.contentBlocks || []);
      setScopeDraft(saved.scopeDraft || "");
      setSnapshots(saved.snapshots || []);
      setClientDiscovery(saved.clientDiscovery || defaultClientDiscovery);
    }

    loadSaved();
  }, []);

  useEffect(() => {
    const draft: WalkthroughDraft = {
      id: "current-walkthrough-draft",
      projectName,
      title,
      contentBlocks,
      scopeDraft,
      snapshots,
      clientDiscovery,
      createdAt: now(),
      updatedAt: now(),
    };

    walkthroughRepository.save(draft);
  }, [projectName, title, contentBlocks, scopeDraft, snapshots, clientDiscovery]);

  function saveSnapshot() {
    if (contentBlocks.length === 0 && !scopeDraft.trim()) return;

    setSnapshots((prev) =>
      [createSnapshot(projectName, title, contentBlocks, scopeDraft), ...prev].slice(0, 12)
    );
  }

  function addTextBlock() {
    const lines = inputText.split("\n");
    const newBlocks: WalkthroughContentBlock[] = [];

    for (let i = 0; i < lines.length; i++) {
      const cleanLine = lines[i].trim();
      if (cleanLine) {
        newBlocks.push(createTextBlock(cleanLine, activeTag, isBold, isUnderline));
      }
    }

    if (newBlocks.length === 0) return;

    setContentBlocks((prev) => [...prev, ...newBlocks]);
    setInputText("");
  }

  function addImagePlaceholder() {
    setContentBlocks((prev) => [...prev, createImageBlock(activeTag)]);
  }

  function startEditing(id: string, text: string) {
    if (editingBlockId && editingBlockId !== id) {
      setContentBlocks((prev) =>
        prev.map((block) =>
          block.id === editingBlockId && block.type === "text"
            ? { ...block, text: editingText }
            : block
        )
      );
    }
    setEditingBlockId(id);
    setEditingText(text);
  }

  function saveEditing(id: string) {
    setContentBlocks((prev) =>
      prev.map((block) =>
        block.id === id && block.type === "text"
          ? { ...block, text: editingText }
          : block
      )
    );
    setEditingBlockId(null);
    setEditingText("");
  }

  function removeBlock(id: string) {
    saveSnapshot();
    if (editingBlockId === id) {
      setEditingBlockId(null);
      setEditingText("");
    }
    setContentBlocks((prev) => prev.filter((block) => block.id !== id));
  }

  function moveBlockUp(id: string) {
    saveSnapshot();
    setContentBlocks((prev) => {
      const index = prev.findIndex((block) => block.id === id);
      if (index <= 0) return prev;
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  }

  function moveBlockDown(id: string) {
    saveSnapshot();
    setContentBlocks((prev) => {
      const index = prev.findIndex((block) => block.id === id);
      if (index === -1 || index >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  }

  function updateImageCaption(id: string, caption: string) {
    setContentBlocks((prev) =>
      prev.map((block) =>
        block.id === id && block.type === "image" ? { ...block, caption } : block
      )
    );
  }

  function tagCount(tag: WalkthroughTag) {
    return contentBlocks.filter((block) => (block.tag || "none") === tag).length;
  }

  function buildDraftTextForTags(tags: WalkthroughTag[] | "all") {
    const relevantTags = tags === "all" ? TAGS : TAGS.filter((t) => tags.includes(t.tag));

    const textParts = relevantTags.map((tagItem) => {
      const groupBlocks = contentBlocks.filter((block) => (block.tag || "none") === tagItem.tag);
      if (groupBlocks.length === 0) return "";
      
      const lines = groupBlocks.map((block) => {
        const text = block.type === "text" ? block.text : block.caption || "Photo block";
        return `• ${text}`;
      });
      return `${tagItem.meaning}:\n${lines.join("\n")}`;
    }).filter(Boolean);

    return textParts.join("\n\n");
  }

  function insertToDraft(tags: WalkthroughTag[] | "all") {
    const textToInsert = buildDraftTextForTags(tags);
    if (!textToInsert) return;

    setScopeDraft((prev) =>
      prev.trim() ? `${prev.trim()}\n\n${textToInsert}` : textToInsert
    );
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

  function restoreSnapshot(snapshotId: string) {
    const snapshot = snapshots.find((item) => item.id === snapshotId);
    if (!snapshot) return;

    saveSnapshot();

    setProjectName(snapshot.projectName);
    setTitle(snapshot.title);
    setContentBlocks(snapshot.contentBlocks);
    setScopeDraft(snapshot.scopeDraft);
  }

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
            Capture messy jobsite notes. Photos are inline blocks. Colors are field triage only.
          </Text>

          <View style={styles.toolbar}>
            {TAGS.map((item) => (
              <Pressable
                key={item.tag}
                style={[
                  styles.tagButton,
                  activeTag === item.tag && styles.tagButtonActive,
                  item.tag === "blue" && styles.blueBorder,
                  item.tag === "cyan" && styles.cyanBorder,
                  item.tag === "orange" && styles.orangeBorder,
                  item.tag === "red" && styles.redBorder,
                ]}
                onPress={() => setActiveTag(item.tag)}
              >
                <Text style={styles.tagText}>{item.label}</Text>
              </Pressable>
            ))}

            <View style={styles.formatGroup}>
              <Pressable
                style={[styles.formatButton, isBold && styles.formatButtonActive]}
                onPress={() => setIsBold(!isBold)}
              >
                <Text style={[styles.formatText, { fontWeight: "bold" }]}>B</Text>
              </Pressable>
              <Pressable
                style={[styles.formatButton, isUnderline && styles.formatButtonActive]}
                onPress={() => setIsUnderline(!isUnderline)}
              >
                <Text style={[styles.formatText, { textDecorationLine: "underline" }]}>U</Text>
              </Pressable>
            </View>

            <Pressable style={styles.cameraButton} onPress={addImagePlaceholder}>
              <Text style={styles.cameraText}>📷</Text>
            </Pressable>
          </View>

          <TextInput
            style={[
              styles.roughInput,
              { color: getTagTextColor(activeTag), borderColor: getTagBorderColor(activeTag) },
              isBold && { fontWeight: "bold" },
              isUnderline && { textDecorationLine: "underline" }
            ]}
            multiline
            placeholder="Type rough walkthrough notes..."
            placeholderTextColor={COLORS.dim}
            value={inputText}
            onChangeText={setInputText}
          />

          <Pressable style={styles.primaryButton} onPress={addTextBlock}>
            <Text style={styles.primaryButtonText}>Add Text Block</Text>
          </Pressable>
        </FieldRateCard>


        <FieldRateCard title="Inline Notes">
          {contentBlocks.length === 0 && (
            <Text style={styles.emptyText}>No walkthrough content yet.</Text>
          )}

          {contentBlocks.map((block, index) => {
            const formatProps = block as unknown as { isBold?: boolean; isUnderline?: boolean };
            const isEditing = editingBlockId === block.id;

            return (
              <View key={block.id} style={[styles.noteItem, tagStyle(block.tag || "none")]}>
                {block.type === "text" ? (
                  isEditing ? (
                    <TextInput
                      style={[
                        styles.inlineEditInput,
                        { color: getTagTextColor(block.tag || "none") },
                        formatProps.isBold && { fontWeight: "bold" },
                        formatProps.isUnderline && { textDecorationLine: "underline" }
                      ]}
                      value={editingText}
                      onChangeText={setEditingText}
                      multiline
                      autoFocus
                    />
                  ) : (
                    <Pressable onPress={() => startEditing(block.id, block.text)}>
                      <Text style={[
                        styles.noteText,
                        { color: getTagTextColor(block.tag || "none") },
                        formatProps.isBold && { fontWeight: "bold" },
                        formatProps.isUnderline && { textDecorationLine: "underline" }
                      ]}>
                        {block.text}
                      </Text>
                    </Pressable>
                  )
                ) : (
                  <View>
                    <View style={styles.imagePlaceholder}>
                      <Text style={styles.imageIcon}>📷</Text>
                      <Text style={styles.imageText}>Photo block placeholder</Text>
                    </View>
                    <TextInput
                      value={block.caption || ""}
                      onChangeText={(text) => updateImageCaption(block.id, text)}
                      placeholder="Photo caption..."
                      placeholderTextColor={COLORS.dim}
                      style={styles.captionInput}
                    />
                  </View>
                )}

                <View style={styles.itemFooter}>
                  <View style={styles.reorderControls}>
                    {index > 0 && (
                      <Pressable onPress={() => moveBlockUp(block.id)}>
                        <Text style={styles.controlText}>↑</Text>
                      </Pressable>
                    )}
                    {index < contentBlocks.length - 1 && (
                      <Pressable onPress={() => moveBlockDown(block.id)}>
                        <Text style={styles.controlText}>↓</Text>
                      </Pressable>
                    )}
                  </View>
                  <View style={styles.actionControls}>
                    {isEditing && (
                      <Pressable onPress={() => saveEditing(block.id)}>
                        <Text style={styles.doneText}>Done</Text>
                      </Pressable>
                    )}
                    <Pressable onPress={() => removeBlock(block.id)}>
                      <Text style={styles.removeText}>Remove</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
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
                <Text style={styles.countValue}>{tagCount(item.tag)}</Text>
                <Text style={styles.countLabel}>{item.meaning}</Text>
              </View>
            ))}
          </View>

          {reviewOpen && (
            <View style={styles.noteList}>
              {TAGS.map((tagItem) => {
                const groupBlocks = contentBlocks.filter((block) => (block.tag || "none") === tagItem.tag);
                if (groupBlocks.length === 0) return null;

                return (
                  <View key={tagItem.tag} style={styles.groupContainer}>
                    <Text style={[styles.groupTitle, { color: getTagTextColor(tagItem.tag) }]}>
                      {tagItem.meaning}
                    </Text>
                    {groupBlocks.map((block) => {
                      const formatProps = block as unknown as { isBold?: boolean; isUnderline?: boolean };

                      return (
                        <View key={block.id} style={[styles.noteItem, tagStyle(block.tag || "none")]}>
                          <Text style={[
                            styles.noteText,
                            { color: getTagTextColor(block.tag || "none") },
                            formatProps.isBold && { fontWeight: "bold" },
                            formatProps.isUnderline && { textDecorationLine: "underline" }
                          ]}>
                            {block.type === "text" ? block.text : block.caption || "Photo block"}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                );
              })}

              <View style={styles.insertActions}>
                <Pressable style={styles.insertButton} onPress={() => insertToDraft(["blue"])}>
                  <Text style={[styles.insertButtonText, { color: getTagTextColor("blue") }]}>Insert Blue Items</Text>
                </Pressable>
                <Pressable style={styles.insertButton} onPress={() => insertToDraft(["cyan"])}>
                  <Text style={[styles.insertButtonText, { color: getTagTextColor("cyan") }]}>Insert Cyan Items</Text>
                </Pressable>
                <Pressable style={styles.insertButton} onPress={() => insertToDraft(["orange"])}>
                  <Text style={[styles.insertButtonText, { color: getTagTextColor("orange") }]}>Insert Orange Items</Text>
                </Pressable>
                <Pressable style={styles.insertButton} onPress={() => insertToDraft(["red"])}>
                  <Text style={[styles.insertButtonText, { color: getTagTextColor("red") }]}>Insert Red Items</Text>
                </Pressable>
                <Pressable style={styles.insertButton} onPress={() => insertToDraft("all")}>
                  <Text style={[styles.insertButtonText, { color: COLORS.text }]}>Insert All</Text>
                </Pressable>
              </View>
            </View>
          )}
        </FieldRateCard>

        <FieldRateCard title="Rough Scope Draft">
          <View style={styles.discoveryInsertSection}>
            <Text style={styles.label}>Insert From Client Discovery</Text>
            <View style={styles.insertActions}>
              <Pressable style={styles.insertButton} onPress={() => insertClientDiscovery("concepts")}>
                <Text style={styles.insertButtonText}>Insert Concepts</Text>
              </Pressable>
              <Pressable style={styles.insertButton} onPress={() => insertClientDiscovery("products")}>
                <Text style={styles.insertButtonText}>Insert Products / Materials</Text>
              </Pressable>
              <Pressable style={styles.insertButton} onPress={() => insertClientDiscovery("budget")}>
                <Text style={styles.insertButtonText}>Insert Budget Strategy</Text>
              </Pressable>
              <Pressable style={styles.insertButton} onPress={() => insertClientDiscovery("timeline")}>
                <Text style={styles.insertButtonText}>Insert Timeline</Text>
              </Pressable>
              <Pressable style={styles.insertButton} onPress={() => insertClientDiscovery("all")}>
                <Text style={styles.insertButtonText}>Insert All Discovery</Text>
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
        </FieldRateCard>

        <FieldRateCard title="Document Preview">
          <Text style={styles.previewTitle}>Field-to-Office Handoff</Text>
          <Text style={styles.previewText}>
            {scopeDraft.trim() || "Your rough scope draft will preview here."}
          </Text>
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
                  <Text style={styles.historyTitle}>{snapshot.title}</Text>
                  <Text style={styles.historyMeta}>
                    {new Date(snapshot.createdAt).toLocaleString()}
                  </Text>
                  <Pressable onPress={() => restoreSnapshot(snapshot.id)}>
                    <Text style={styles.restoreText}>Restore</Text>
                  </Pressable>
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
  if (tag === "cyan") return styles.cyanTag;
  if (tag === "orange") return styles.orangeTag;
  if (tag === "red") return styles.redTag;
  return styles.normalTag;
}

function getTagTextColor(tag: WalkthroughTag) {
  if (tag === "blue") return COLORS.primary;
  if (tag === "cyan") return COLORS.primary;
  if (tag === "orange") return COLORS.warning;
  if (tag === "red") return COLORS.danger;
  return COLORS.text;
}

function getTagBorderColor(tag: WalkthroughTag) {
  if (tag === "blue") return COLORS.primary;
  if (tag === "cyan") return COLORS.primary;
  if (tag === "orange") return COLORS.warning;
  if (tag === "red") return COLORS.danger;
  return COLORS.border;
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
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  tagButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: COLORS.surface,
  },
  tagButtonActive: {
    backgroundColor: COLORS.primaryDim,
    borderColor: COLORS.primary,
  },
  tagText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "800",
  },
  blueBorder: {
    borderColor: COLORS.primary,
  },
  cyanBorder: {
    borderColor: COLORS.primary,
  },
  orangeBorder: {
    borderColor: COLORS.warning,
  },
  redBorder: {
    borderColor: COLORS.danger,
  },
  formatGroup: {
    flexDirection: "row",
    gap: 8,
    marginLeft: "auto",
  },
  formatButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: COLORS.surface,
  },
  formatButtonActive: {
    backgroundColor: COLORS.primaryDim,
    borderColor: COLORS.primary,
  },
  formatText: {
    color: COLORS.text,
    fontSize: 13,
  },
  cameraButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: COLORS.primaryDim,
  },
  cameraText: {
    color: COLORS.primary,
    fontWeight: "900",
  },
  roughInput: {
    minHeight: 150,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    textAlignVertical: "top",
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  primaryButtonText: {
    color: COLORS.background,
    fontWeight: "900",
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
  noteText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
  },
  inlineEditInput: {
    fontSize: 13,
    lineHeight: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 8,
    backgroundColor: COLORS.background,
    textAlignVertical: "top",
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  reorderControls: {
    flexDirection: "row",
    gap: 16,
  },
  controlText: {
    color: COLORS.dim,
    fontSize: 16,
    fontWeight: "900",
  },
  actionControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  doneText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  normalTag: {
    borderColor: COLORS.border,
  },
  blueTag: {
    borderColor: COLORS.primary,
  },
  cyanTag: {
    borderColor: COLORS.primary,
  },
  orangeTag: {
    borderColor: COLORS.warning,
  },
  redTag: {
    borderColor: COLORS.danger,
  },
  imagePlaceholder: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 22,
    alignItems: "center",
    backgroundColor: COLORS.surface,
  },
  imageIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  imageText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  captionInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    marginTop: 8,
  },
  removeText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: "800",
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
  restoreText: {
    color: COLORS.primary,
    fontWeight: "800",
    marginTop: 8,
    textAlign: "right",
  },
});
