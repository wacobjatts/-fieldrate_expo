// src/components/walkthrough/ClientDiscoveryCard.tsx

import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import FieldRateCard from "../fieldrate/FieldRateCard";
import { COLORS } from "../../theme/colors";

export default function ClientDiscoveryCard() {
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const [clientConversationNotes, setClientConversationNotes] = useState("");
  const [conceptOptions, setConceptOptions] = useState("");
  const [budgetRangeIdeas, setBudgetRangeIdeas] = useState("");
  const [timelineIdeas, setTimelineIdeas] = useState("");

  return (
    <FieldRateCard title="Client Discovery">
      <Pressable onPress={() => setDiscoveryOpen((prev) => !prev)}>
        <Text style={styles.toggleText}>
          {discoveryOpen ? "Hide discovery notes" : "Show discovery notes"}
        </Text>
      </Pressable>

      {discoveryOpen && (
        <View style={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Client Conversation Notes</Text>
            <TextInput
              style={styles.input}
              multiline
              placeholder="Capture raw client thoughts and requests..."
              placeholderTextColor={COLORS.dim}
              value={clientConversationNotes}
              onChangeText={setClientConversationNotes}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Concept Options</Text>
            <TextInput
              style={styles.input}
              multiline
              placeholder="Different approaches or design ideas..."
              placeholderTextColor={COLORS.dim}
              value={conceptOptions}
              onChangeText={setConceptOptions}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Budget Range Ideas</Text>
            <TextInput
              style={styles.input}
              multiline
              placeholder="Rough numbers discussed..."
              placeholderTextColor={COLORS.dim}
              value={budgetRangeIdeas}
              onChangeText={setBudgetRangeIdeas}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Timeline Ideas</Text>
            <TextInput
              style={styles.input}
              multiline
              placeholder="Expected start/end dates or constraints..."
              placeholderTextColor={COLORS.dim}
              value={timelineIdeas}
              onChangeText={setTimelineIdeas}
            />
          </View>
        </View>
      )}
    </FieldRateCard>
  );
}

const styles = StyleSheet.create({
  toggleText: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  content: {
    marginTop: 16,
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    color: COLORS.dim,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  input: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    textAlignVertical: "top",
    fontSize: 14,
  },
});
