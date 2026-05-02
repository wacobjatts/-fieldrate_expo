// src/screens/WalkthroughScreen.tsx

import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../theme/colors";

export default function WalkthroughScreen() {
  const [notes, setNotes] = useState("");
  const [scope, setScope] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);

  function organizeNotes() {
    const lines = notes.split("\n").map(l => l.trim()).filter(Boolean);

    const work: string[] = [];
    const opts: string[] = [];

    lines.forEach(line => {
      const lower = line.toLowerCase();

      if (lower.includes(" or ")) {
        opts.push(`${line} (decision pending).`);
        return;
      }

      if (lower.includes("remove") && lower.includes("baseboard")) {
        const qty = line.match(/(\d+)/)?.[1] || "";
        work.push(`Remove approximately ${qty} LF of existing baseboard.`);
        return;
      }

      if (lower.includes("install") && lower.includes("trim")) {
        work.push(`Install approximately 20 LF of Japanese maple trim.`);
        return;
      }

      if (lower.includes("scrape")) {
        work.push("Scrape adhesive residue in kitchen area.");
        return;
      }

      if (lower.includes("paint")) {
        work.push("Paint all walls, two (2) coats.");
        return;
      }

      if (lower.includes("transition")) {
        work.push("Verify and address transition at kitchen.");
        return;
      }

      work.push(line + ".");
    });

    setScope(work);
    setOptions(opts);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Walkthrough</Text>

      <TextInput
        style={styles.input}
        multiline
        placeholder="Type rough notes..."
        placeholderTextColor={COLORS.dim}
        value={notes}
        onChangeText={setNotes}
      />

      <Pressable style={styles.button} onPress={organizeNotes}>
        <Text style={styles.buttonText}>ORGANIZE NOTES</Text>
      </Pressable>

      <View style={styles.output}>
        <Text style={styles.header}>SCOPE OF WORK (DRAFT)</Text>

        {scope.map((line, i) => (
          <Text key={i} style={styles.line}>• {line}</Text>
        ))}

        {options.length > 0 && (
          <>
            <Text style={styles.subHeader}>OPTIONS</Text>
            {options.map((line, i) => (
              <Text key={i} style={styles.line}>• {line}</Text>
            ))}
          </>
        )}
      </View>

      <Pressable style={styles.save}>
        <Text style={styles.saveText}>APPROVE & SAVE</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  title: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
  },
  input: {
    height: 180,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    padding: 12,
    color: COLORS.text,
    marginBottom: 12,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: COLORS.background,
    fontWeight: "800",
  },
  output: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    borderRadius: 10,
  },
  header: {
    color: COLORS.primary,
    fontWeight: "800",
    marginBottom: 10,
  },
  subHeader: {
    color: COLORS.accent,
    marginTop: 10,
    fontWeight: "700",
  },
  line: {
    color: COLORS.text,
    marginBottom: 4,
  },
  save: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.success,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: {
    color: COLORS.success,
    fontWeight: "800",
  },
});