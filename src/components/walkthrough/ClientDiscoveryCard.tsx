// src/components/walkthrough/ClientDiscoveryCard.tsx

import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS } from "../../theme/colors";

export default function ClientDiscoveryCard() {
  const [clientConversationNotes, setClientConversationNotes] = useState("");
  
  const [conceptA_description, setConceptA_description] = useState("");
  const [conceptA_price, setConceptA_price] = useState("");
  const [conceptA_notes, setConceptA_notes] = useState("");

  const [conceptB_description, setConceptB_description] = useState("");
  const [conceptB_price, setConceptB_price] = useState("");
  const [conceptB_notes, setConceptB_notes] = useState("");

  const [conceptC_description, setConceptC_description] = useState("");
  const [conceptC_price, setConceptC_price] = useState("");
  const [conceptC_notes, setConceptC_notes] = useState("");

  const [budgetRangeIdeas, setBudgetRangeIdeas] = useState("");
  const [timelineIdeas, setTimelineIdeas] = useState("");

  return (
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

      <View style={styles.sectionContainer}>
        <Text style={styles.label}>Concept Options</Text>

        <View style={styles.conceptBlock}>
          <Text style={styles.conceptTitle}>Concept A</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="What is this approach?"
            placeholderTextColor={COLORS.dim}
            value={conceptA_description}
            onChangeText={setConceptA_description}
          />
          <TextInput
            style={styles.shortInput}
            placeholder="Rough cost range (no exact numbers)"
            placeholderTextColor={COLORS.dim}
            value={conceptA_price}
            onChangeText={setConceptA_price}
          />
          <TextInput
            style={styles.input}
            multiline
            placeholder="Pros, cons, constraints, considerations"
            placeholderTextColor={COLORS.dim}
            value={conceptA_notes}
            onChangeText={setConceptA_notes}
          />
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoIcon}>📷</Text>
          </View>
        </View>

        <View style={styles.conceptBlock}>
          <Text style={styles.conceptTitle}>Concept B</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="What is this approach?"
            placeholderTextColor={COLORS.dim}
            value={conceptB_description}
            onChangeText={setConceptB_description}
          />
          <TextInput
            style={styles.shortInput}
            placeholder="Rough cost range (no exact numbers)"
            placeholderTextColor={COLORS.dim}
            value={conceptB_price}
            onChangeText={setConceptB_price}
          />
          <TextInput
            style={styles.input}
            multiline
            placeholder="Pros, cons, constraints, considerations"
            placeholderTextColor={COLORS.dim}
            value={conceptB_notes}
            onChangeText={setConceptB_notes}
          />
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoIcon}>📷</Text>
          </View>
        </View>

        <View style={styles.conceptBlock}>
          <Text style={styles.conceptTitle}>Concept C</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="What is this approach?"
            placeholderTextColor={COLORS.dim}
            value={conceptC_description}
            onChangeText={setConceptC_description}
          />
          <TextInput
            style={styles.shortInput}
            placeholder="Rough cost range (no exact numbers)"
            placeholderTextColor={COLORS.dim}
            value={conceptC_price}
            onChangeText={setConceptC_price}
          />
          <TextInput
            style={styles.input}
            multiline
            placeholder="Pros, cons, constraints, considerations"
            placeholderTextColor={COLORS.dim}
            value={conceptC_notes}
            onChangeText={setConceptC_notes}
          />
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoIcon}>📷</Text>
          </View>
        </View>
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
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  sectionContainer: {
    gap: 12,
  },
  conceptBlock: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  conceptTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
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
  shortInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    fontSize: 14,
  },
  photoPlaceholder: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  photoIcon: {
    fontSize: 24,
  },
});
