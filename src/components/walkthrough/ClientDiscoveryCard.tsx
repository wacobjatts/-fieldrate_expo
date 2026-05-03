// src/components/walkthrough/ClientDiscoveryCard.tsx

import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS } from "../../theme/colors";
import type { WalkthroughClientDiscovery } from "../../types/walkthrough";

type ClientDiscoveryCardProps = {
  value: WalkthroughClientDiscovery;
  onChange: (next: WalkthroughClientDiscovery) => void;
};

export default function ClientDiscoveryCard({ value, onChange }: ClientDiscoveryCardProps) {
  const hasAnyContent = Boolean(
    value.clientConversationNotes ||
      value.conceptA_description ||
      value.conceptA_price ||
      value.conceptA_notes ||
      value.conceptB_description ||
      value.conceptB_price ||
      value.conceptB_notes ||
      value.conceptC_description ||
      value.conceptC_price ||
      value.conceptC_notes ||
      value.productMaterialNotes ||
      value.preferredOptions ||
      value.avoidConcernItems ||
      value.budgetConversationNotes ||
      value.basicRange ||
      value.midRange ||
      value.premiumRange ||
      value.pricingRisks ||
      value.timelineConversationNotes ||
      value.idealStartWindow ||
      value.requiredFinishDeadline ||
      value.possiblePhases ||
      value.accessDisruptionNotes
  );

  return (
    <View style={styles.content}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Client Conversation Notes</Text>
        <TextInput
          style={styles.input}
          multiline
          placeholder="Capture raw client thoughts and requests..."
          placeholderTextColor={COLORS.dim}
          value={value.clientConversationNotes}
          onChangeText={(text) => onChange({ ...value, clientConversationNotes: text })}
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
            value={value.conceptA_description}
            onChangeText={(text) => onChange({ ...value, conceptA_description: text })}
          />
          <TextInput
            style={styles.shortInput}
            placeholder="Rough cost range (no exact numbers)"
            placeholderTextColor={COLORS.dim}
            value={value.conceptA_price}
            onChangeText={(text) => onChange({ ...value, conceptA_price: text })}
          />
          <TextInput
            style={styles.input}
            multiline
            placeholder="Pros, cons, constraints, considerations"
            placeholderTextColor={COLORS.dim}
            value={value.conceptA_notes}
            onChangeText={(text) => onChange({ ...value, conceptA_notes: text })}
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
            value={value.conceptB_description}
            onChangeText={(text) => onChange({ ...value, conceptB_description: text })}
          />
          <TextInput
            style={styles.shortInput}
            placeholder="Rough cost range (no exact numbers)"
            placeholderTextColor={COLORS.dim}
            value={value.conceptB_price}
            onChangeText={(text) => onChange({ ...value, conceptB_price: text })}
          />
          <TextInput
            style={styles.input}
            multiline
            placeholder="Pros, cons, constraints, considerations"
            placeholderTextColor={COLORS.dim}
            value={value.conceptB_notes}
            onChangeText={(text) => onChange({ ...value, conceptB_notes: text })}
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
            value={value.conceptC_description}
            onChangeText={(text) => onChange({ ...value, conceptC_description: text })}
          />
          <TextInput
            style={styles.shortInput}
            placeholder="Rough cost range (no exact numbers)"
            placeholderTextColor={COLORS.dim}
            value={value.conceptC_price}
            onChangeText={(text) => onChange({ ...value, conceptC_price: text })}
          />
          <TextInput
            style={styles.input}
            multiline
            placeholder="Pros, cons, constraints, considerations"
            placeholderTextColor={COLORS.dim}
            value={value.conceptC_notes}
            onChangeText={(text) => onChange({ ...value, conceptC_notes: text })}
          />
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoIcon}>📷</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.label}>Product / Material Options</Text>
        <View style={styles.conceptBlock}>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Products, finishes, fixtures, materials, or brands discussed..."
            placeholderTextColor={COLORS.dim}
            value={value.productMaterialNotes}
            onChangeText={(text) => onChange({ ...value, productMaterialNotes: text })}
          />
          <TextInput
            style={styles.input}
            multiline
            placeholder="What does the client seem drawn to?"
            placeholderTextColor={COLORS.dim}
            value={value.preferredOptions}
            onChangeText={(text) => onChange({ ...value, preferredOptions: text })}
          />
          <TextInput
            style={styles.input}
            multiline
            placeholder="Products, materials, costs, or choices to avoid..."
            placeholderTextColor={COLORS.dim}
            value={value.avoidConcernItems}
            onChangeText={(text) => onChange({ ...value, avoidConcernItems: text })}
          />
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoIcon}>📷</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.label}>Budget / Pricing Strategy</Text>
        <View style={styles.conceptBlock}>
          <TextInput
            style={styles.input}
            multiline
            placeholder="What budget range, comfort level, or pricing concerns came up?"
            placeholderTextColor={COLORS.dim}
            value={value.budgetConversationNotes}
            onChangeText={(text) => onChange({ ...value, budgetConversationNotes: text })}
          />
          <TextInput
            style={styles.shortInput}
            placeholder="Simple / minimum viable option range..."
            placeholderTextColor={COLORS.dim}
            value={value.basicRange}
            onChangeText={(text) => onChange({ ...value, basicRange: text })}
          />
          <TextInput
            style={styles.shortInput}
            placeholder="Balanced option range..."
            placeholderTextColor={COLORS.dim}
            value={value.midRange}
            onChangeText={(text) => onChange({ ...value, midRange: text })}
          />
          <TextInput
            style={styles.shortInput}
            placeholder="Higher-end option range..."
            placeholderTextColor={COLORS.dim}
            value={value.premiumRange}
            onChangeText={(text) => onChange({ ...value, premiumRange: text })}
          />
          <TextInput
            style={styles.input}
            multiline
            placeholder="Unknowns that could affect cost..."
            placeholderTextColor={COLORS.dim}
            value={value.pricingRisks}
            onChangeText={(text) => onChange({ ...value, pricingRisks: text })}
          />
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.label}>Timeline / Phasing</Text>
        <View style={styles.conceptBlock}>
          <TextInput
            style={styles.input}
            multiline
            placeholder="What timing expectations or constraints came up?"
            placeholderTextColor={COLORS.dim}
            value={value.timelineConversationNotes}
            onChangeText={(text) => onChange({ ...value, timelineConversationNotes: text })}
          />
          <TextInput
            style={styles.shortInput}
            placeholder="When would they like to start?"
            placeholderTextColor={COLORS.dim}
            value={value.idealStartWindow}
            onChangeText={(text) => onChange({ ...value, idealStartWindow: text })}
          />
          <TextInput
            style={styles.shortInput}
            placeholder="Any hard deadlines?"
            placeholderTextColor={COLORS.dim}
            value={value.requiredFinishDeadline}
            onChangeText={(text) => onChange({ ...value, requiredFinishDeadline: text })}
          />
          <TextInput
            style={styles.shortInput}
            placeholder="Could this be broken into phases?"
            placeholderTextColor={COLORS.dim}
            value={value.possiblePhases}
            onChangeText={(text) => onChange({ ...value, possiblePhases: text })}
          />
          <TextInput
            style={styles.input}
            multiline
            placeholder="Access limits, working hours, living conditions, business disruption..."
            placeholderTextColor={COLORS.dim}
            value={value.accessDisruptionNotes}
            onChangeText={(text) => onChange({ ...value, accessDisruptionNotes: text })}
          />
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.label}>Client Package Preview</Text>
        <View style={styles.previewContainer}>
          {!hasAnyContent ? (
            <Text style={styles.emptyPreviewText}>Client package preview will appear here.</Text>
          ) : (
            <View style={styles.previewContent}>
              {value.clientConversationNotes ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewHeading}>Client Notes</Text>
                  <Text style={styles.previewText}>{value.clientConversationNotes}</Text>
                </View>
              ) : null}

              {(value.conceptA_description || value.conceptA_price || value.conceptA_notes) ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewHeading}>Concept A</Text>
                  {value.conceptA_description ? <Text style={styles.previewText}>{value.conceptA_description}</Text> : null}
                  {value.conceptA_price ? <Text style={styles.previewText}>Price Range: {value.conceptA_price}</Text> : null}
                  {value.conceptA_notes ? <Text style={styles.previewText}>Notes: {value.conceptA_notes}</Text> : null}
                </View>
              ) : null}

              {(value.conceptB_description || value.conceptB_price || value.conceptB_notes) ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewHeading}>Concept B</Text>
                  {value.conceptB_description ? <Text style={styles.previewText}>{value.conceptB_description}</Text> : null}
                  {value.conceptB_price ? <Text style={styles.previewText}>Price Range: {value.conceptB_price}</Text> : null}
                  {value.conceptB_notes ? <Text style={styles.previewText}>Notes: {value.conceptB_notes}</Text> : null}
                </View>
              ) : null}

              {(value.conceptC_description || value.conceptC_price || value.conceptC_notes) ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewHeading}>Concept C</Text>
                  {value.conceptC_description ? <Text style={styles.previewText}>{value.conceptC_description}</Text> : null}
                  {value.conceptC_price ? <Text style={styles.previewText}>Price Range: {value.conceptC_price}</Text> : null}
                  {value.conceptC_notes ? <Text style={styles.previewText}>Notes: {value.conceptC_notes}</Text> : null}
                </View>
              ) : null}

              {(value.productMaterialNotes || value.preferredOptions || value.avoidConcernItems) ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewHeading}>Product / Material Options</Text>
                  {value.productMaterialNotes ? <Text style={styles.previewText}>{value.productMaterialNotes}</Text> : null}
                  {value.preferredOptions ? <Text style={styles.previewText}>Preferred: {value.preferredOptions}</Text> : null}
                  {value.avoidConcernItems ? <Text style={styles.previewText}>Avoid: {value.avoidConcernItems}</Text> : null}
                </View>
              ) : null}

              {(value.budgetConversationNotes || value.basicRange || value.midRange || value.premiumRange || value.pricingRisks) ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewHeading}>Budget / Pricing Strategy</Text>
                  {value.budgetConversationNotes ? <Text style={styles.previewText}>{value.budgetConversationNotes}</Text> : null}
                  {value.basicRange ? <Text style={styles.previewText}>Basic: {value.basicRange}</Text> : null}
                  {value.midRange ? <Text style={styles.previewText}>Mid: {value.midRange}</Text> : null}
                  {value.premiumRange ? <Text style={styles.previewText}>Premium: {value.premiumRange}</Text> : null}
                  {value.pricingRisks ? <Text style={styles.previewText}>Risks: {value.pricingRisks}</Text> : null}
                </View>
              ) : null}

              {(value.timelineConversationNotes || value.idealStartWindow || value.requiredFinishDeadline || value.possiblePhases || value.accessDisruptionNotes) ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewHeading}>Timeline / Phasing</Text>
                  {value.timelineConversationNotes ? <Text style={styles.previewText}>{value.timelineConversationNotes}</Text> : null}
                  {value.idealStartWindow ? <Text style={styles.previewText}>Start: {value.idealStartWindow}</Text> : null}
                  {value.requiredFinishDeadline ? <Text style={styles.previewText}>Deadline: {value.requiredFinishDeadline}</Text> : null}
                  {value.possiblePhases ? <Text style={styles.previewText}>Phases: {value.possiblePhases}</Text> : null}
                  {value.accessDisruptionNotes ? <Text style={styles.previewText}>Access/Disruption: {value.accessDisruptionNotes}</Text> : null}
                </View>
              ) : null}
            </View>
          )}
        </View>
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
  previewContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  emptyPreviewText: {
    color: COLORS.muted,
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
  },
  previewContent: {
    gap: 16,
  },
  previewSection: {
    gap: 4,
  },
  previewHeading: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  previewText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
  },
});
