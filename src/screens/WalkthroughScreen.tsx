// src/screens/WalkthroughScreen.tsx

import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import FieldRateCard from "../components/fieldrate/FieldRateCard";
import FieldRateScreen from "../components/fieldrate/FieldRateScreen";
import { COLORS } from "../theme/colors";

type WalkthroughTag = "none" | "blue" | "cyan" | "orange" | "red";

type WalkthroughNote = {
  id: string;
  text: string;
  tag: WalkthroughTag;
};

const TAGS: { tag: WalkthroughTag; label: string; meaning: string }[] = [
  { tag: "none", label: "T", meaning: "Normal" },
  { tag: "blue", label: "Blue", meaning: "Self / definite work" },
  { tag: "cyan", label: "Cyan", meaning: "Sub / trade item" },
  { tag: "orange", label: "Orange", meaning: "Maybe / allowance / pending" },
  { tag: "red", label: "Red", meaning: "Issue / risk / critical" },
];

export default function WalkthroughScreen() {
  const [activeTag, setActiveTag] = useState<WalkthroughTag>("none");
  const [roughText, setRoughText] = useState("");
  const [notes, setNotes] = useState<WalkthroughNote[]>([]);
  const [scopeDraft, setScopeDraft] = useState("");
  const [reviewOpen, setReviewOpen] = useState(true);

  function addRoughNote() {
    const clean = roughText.trim();
    if (!clean) return;

    setNotes((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: clean,
        tag: activeTag,
      },
    ]);

    setRoughText("");
  }

  function removeNote(id: string) {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }

  function tagCount(tag: WalkthroughTag) {
    return notes.filter((note) => note.tag === tag).length;
  }

  const scopeHintText = useMemo(() => {
    return notes
      .filter((note) => note.tag !== "none")
      .map((note) => `• ${note.text}`)
      .join("\n");
  }, [notes]);

  function sendHighlightsToDraft() {
    if (!scopeHintText) return;

    setScopeDraft((prev) =>
      prev.trim() ? `${prev.trim()}\n${scopeHintText}` : scopeHintText
    );
  }

  return (
    <FieldRateScreen title="Walkthrough" subtitle="Capture field reality first">
      <FieldRateCard title="Rough Notes">
        <Text style={styles.helper}>
          Capture messy jobsite notes. Colors are field triage only — nothing becomes scope until you choose.
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
        </View>

        <TextInput
          style={styles.roughInput}
          multiline
          placeholder="Type rough walkthrough notes..."
          placeholderTextColor={COLORS.dim}
          value={roughText}
          onChangeText={setRoughText}
        />

        <Pressable style={styles.primaryButton} onPress={addRoughNote}>
          <Text style={styles.primaryButtonText}>Add Note</Text>
        </Pressable>
      </FieldRateCard>

      <FieldRateCard title="Highlight Review">
        <Pressable onPress={() => setReviewOpen((value) => !value)}>
          <Text style={styles.libraryToggle}>
            {reviewOpen ? "Hide" : "Show"} grouped notes
          </Text>
        </Pressable>

        <View style={styles.countGrid}>
          {TAGS.filter((item) => item.tag !== "none").map((item) => (
            <View key={item.tag} style={styles.countBox}>
              <Text style={styles.countValue}>{tagCount(item.tag)}</Text>
              <Text style={styles.countLabel}>{item.meaning}</Text>
            </View>
          ))}
        </View>

        {reviewOpen && (
          <View style={styles.noteList}>
            {notes.length === 0 && (
              <Text style={styles.emptyText}>No walkthrough notes yet.</Text>
            )}

            {notes.map((note) => (
              <View key={note.id} style={[styles.noteItem, tagStyle(note.tag)]}>
                <Text style={styles.noteText}>{note.text}</Text>
                <Pressable onPress={() => removeNote(note.id)}>
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <Pressable style={styles.subtleButton} onPress={sendHighlightsToDraft}>
          <Text style={styles.subtleButtonText}>Send Highlighted Notes to Draft</Text>
        </Pressable>
      </FieldRateCard>

      <FieldRateCard title="Rough Scope Draft">
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

      <Pressable style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Walkthrough</Text>
      </Pressable>
    </FieldRateScreen>
  );
}

function tagStyle(tag: WalkthroughTag) {
  if (tag === "blue") return styles.blueTag;
  if (tag === "cyan") return styles.cyanTag;
  if (tag === "orange") return styles.orangeTag;
  if (tag === "red") return styles.redTag;
  return styles.normalTag;
}

const styles = StyleSheet.create({
  helper: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
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
  blueBorder: { borderColor: COLORS.primary },
  cyanBorder: { borderColor: COLORS.primary },
  orangeBorder: { borderColor: COLORS.warning },
  redBorder: { borderColor: COLORS.danger },
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
  noteList: {
    gap: 10,
    marginTop: 12,
  },
  noteItem: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  noteText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
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
  removeText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 8,
    textAlign: "right",
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  subtleButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  subtleButtonText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 12,
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
  saveButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.success,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  saveButtonText: {
    color: COLORS.success,
    fontWeight: "900",
  },
});