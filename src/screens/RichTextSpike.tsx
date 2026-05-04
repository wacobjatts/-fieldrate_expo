// TEMPORARY SPIKE. Do not build product logic here.
// src/screens/RichTextSpike.tsx

import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, ScrollView, SafeAreaView } from "react-native";
import { RichText, useEditorBridge } from "@10play/tentap-editor";
import { COLORS } from "../theme/colors";

export default function RichTextSpike() {
  const [jsonOutput, setJsonOutput] = useState<any>(null);

  const editor = useEditorBridge({
    autofocus: true,
    avoidIosKeyboard: true,
    onChange: () => {
      editor.getJSON().then((json: any) => {
        setJsonOutput(json);
      });
    },
  });

  const applyColor = (colorHex: string) => {
    // Assumes TextColor extension is available/configured in the bridge
    editor.setColor(colorHex);
  };

  const renderNode = (node: any, index: number) => {
    if (node.type === "paragraph") {
      return (
        <Text key={index} style={styles.previewParagraph}>
          {node.content ? node.content.map((child: any, i: number) => renderNode(child, i)) : null}
        </Text>
      );
    }

    if (node.type === "text") {
      const marks = node.marks || [];
      const isBold = marks.some((m: any) => m.type === "bold");
      const isUnderline = marks.some((m: any) => m.type === "underline");
      const colorMark = marks.find((m: any) => m.type === "textStyle");
      const color = colorMark?.attrs?.color || COLORS.text;

      return (
        <Text
          key={index}
          style={[
            { color },
            isBold && { fontWeight: "bold" },
            isUnderline && { textDecorationLine: "underline" },
          ]}
        >
          {node.text}
        </Text>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rich Text Spike — Temporary Test</Text>
      </View>

      <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        <View style={styles.toolbar}>
          <Pressable
            style={styles.formatBtn}
            onPress={() => editor.toggleBold()}
          >
            <Text style={[styles.formatText, { fontWeight: "bold" }]}>B</Text>
          </Pressable>
          <Pressable
            style={styles.formatBtn}
            onPress={() => editor.toggleUnderline()}
          >
            <Text style={[styles.formatText, { textDecorationLine: "underline" }]}>U</Text>
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.colorBtn} onPress={() => applyColor(COLORS.text)}>
            <View style={[styles.colorSwatch, { backgroundColor: COLORS.text }]} />
            <Text style={styles.colorText}>T</Text>
          </Pressable>
          <Pressable style={styles.colorBtn} onPress={() => applyColor(COLORS.primary)}>
            <View style={[styles.colorSwatch, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.colorText}>Blue/Cyan</Text>
          </Pressable>
          <Pressable style={styles.colorBtn} onPress={() => applyColor(COLORS.warning)}>
            <View style={[styles.colorSwatch, { backgroundColor: COLORS.warning }]} />
            <Text style={styles.colorText}>Orange</Text>
          </Pressable>
          <Pressable style={styles.colorBtn} onPress={() => applyColor(COLORS.danger)}>
            <View style={[styles.colorSwatch, { backgroundColor: COLORS.danger }]} />
            <Text style={styles.colorText}>Red</Text>
          </Pressable>
        </View>

        <View style={styles.editorContainer}>
          <RichText editor={editor} />
        </View>

        <Text style={styles.sectionTitle}>Native Read-Only Preview</Text>
        <View style={styles.previewContainer}>
          {jsonOutput?.content ? (
            jsonOutput.content.map((node: any, i: number) => renderNode(node, i))
          ) : (
            <Text style={styles.placeholder}>Type above to see AST rendered natively...</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>AST JSON Output</Text>
        <View style={styles.jsonContainer}>
          <Text style={styles.jsonText}>
            {jsonOutput ? JSON.stringify(jsonOutput, null, 2) : "No data yet."}
          </Text>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  formatBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
  },
  formatText: {
    color: COLORS.text,
    fontSize: 14,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  colorBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: COLORS.surface,
    gap: 6,
  },
  colorSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  colorText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "800",
  },
  editorContainer: {
    minHeight: 200,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    padding: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.primary,
    fontWeight: "900",
    marginBottom: 8,
    textTransform: "uppercase",
    fontSize: 12,
  },
  previewContainer: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: COLORS.background,
    marginBottom: 24,
  },
  previewParagraph: {
    marginBottom: 8,
    lineHeight: 20,
    fontSize: 14,
  },
  placeholder: {
    color: COLORS.dim,
    fontStyle: "italic",
    fontSize: 13,
  },
  jsonContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#111",
    marginBottom: 40,
  },
  jsonText: {
    color: "#0f0",
    fontFamily: "monospace",
    fontSize: 10,
  },
});
