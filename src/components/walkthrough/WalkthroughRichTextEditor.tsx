// src/components/walkthrough/WalkthroughRichTextEditor.tsx

import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Underline from "@tiptap/extension-underline";
import { COLORS } from "../../theme/colors";

const PINK = "#EC4899";

export type WalkthroughRichTextEditorProps = {
  value: any;
  onChange: (next: any) => void;
  resetKey?: number;
};

export default function WalkthroughRichTextEditor({
  value,
  onChange,
  resetKey,
}: WalkthroughRichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  useEffect(() => {
    if (editor && value && !editor.isDestroyed) {
      if (editor.isEmpty && Object.keys(value).length > 0) {
        editor.commands.setContent(value);
      }
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor && !editor.isDestroyed && resetKey !== undefined) {
      editor.commands.setContent("<p></p>");
    }
  }, [resetKey, editor]);

  const applyColor = (colorHex: string) => {
    if (!editor) return;
    editor.chain().focus().setColor(colorHex).run();
  };

  const toggleBold = () => {
    if (!editor) return;
    editor.chain().focus().toggleBold().run();
  };

  const toggleUnderline = () => {
    if (!editor) return;
    editor.chain().focus().toggleUnderline().run();
  };

  if (!editor) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Pressable
          style={[
            styles.formatBtn,
            editor.isActive("bold") && styles.formatBtnActive,
          ]}
          onPress={toggleBold}
        >
          <Text style={[styles.formatText, { fontWeight: "bold" }]}>B</Text>
        </Pressable>
        <Pressable
          style={[
            styles.formatBtn,
            editor.isActive("underline") && styles.formatBtnActive,
          ]}
          onPress={toggleUnderline}
        >
          <Text style={[styles.formatText, { textDecorationLine: "underline" }]}>
            U
          </Text>
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          style={[
            styles.colorBtn,
            editor.isActive("textStyle", { color: COLORS.text }) && styles.colorBtnActive,
          ]}
          onPress={() => applyColor(COLORS.text)}
        >
          <View style={[styles.colorSwatch, { backgroundColor: COLORS.text }]} />
          <Text style={styles.colorText}>T</Text>
        </Pressable>

        <Pressable
          style={[
            styles.colorBtn,
            editor.isActive("textStyle", { color: COLORS.primary }) && styles.colorBtnActive,
          ]}
          onPress={() => applyColor(COLORS.primary)}
        >
          <View style={[styles.colorSwatch, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.colorText}>Blue</Text>
        </Pressable>

        <Pressable
          style={[
            styles.colorBtn,
            editor.isActive("textStyle", { color: PINK }) && styles.colorBtnActive,
          ]}
          onPress={() => applyColor(PINK)}
        >
          <View style={[styles.colorSwatch, { backgroundColor: PINK }]} />
          <Text style={styles.colorText}>Pink</Text>
        </Pressable>

        <Pressable
          style={[
            styles.colorBtn,
            editor.isActive("textStyle", { color: COLORS.warning }) && styles.colorBtnActive,
          ]}
          onPress={() => applyColor(COLORS.warning)}
        >
          <View style={[styles.colorSwatch, { backgroundColor: COLORS.warning }]} />
          <Text style={styles.colorText}>Orange</Text>
        </Pressable>

        <Pressable
          style={[
            styles.colorBtn,
            editor.isActive("textStyle", { color: COLORS.danger }) && styles.colorBtnActive,
          ]}
          onPress={() => applyColor(COLORS.danger)}
        >
          <View style={[styles.colorSwatch, { backgroundColor: COLORS.danger }]} />
          <Text style={styles.colorText}>Red</Text>
        </Pressable>
      </View>

      <View style={styles.editorContainer}>
        <EditorContent editor={editor} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 8,
  },
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
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
  formatBtnActive: {
    backgroundColor: COLORS.primaryDim,
    borderColor: COLORS.primary,
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
  colorBtnActive: {
    backgroundColor: COLORS.primaryDim,
    borderColor: COLORS.primary,
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
    minHeight: 150,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    padding: 12,
  },
});
