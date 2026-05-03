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

  const [productMaterialNotes, setProductMaterialNotes] = useState("");
  const [preferredOptions, setPreferredOptions] = useState("");
  const [avoidConcernItems, setAvoidConcernItems] = useState("");

  const [budgetConversationNotes, setBudgetConversationNotes] = useState("");
  const [basicRange, setBasicRange] = useState("");
  const [midRange, setMidRange] = useState("");
  const [premiumRange, setPremiumRange] = useState("");
  const [pricingRisks, setPricingRisks] = useState("");

  const [timelineConversationNotes, setTimelineConversationNotes] = useState("");
  const [idealStartWindow, setIdealStartWindow] = useState("");
  const [requiredFinishDeadline, setRequiredFinishDeadline] = useState("");
  const [possiblePhases, setPossiblePhases] = useState("");
  const [accessDisruptionNotes, setAccessDisruptionNotes] = useState("");

  const hasAnyContent = Boolean(
    clientConversationNotes ||
      conceptA_description ||
      conceptA_price ||
      conceptA_notes ||
      conceptB_description ||
      conceptB_price ||
      conceptB_notes ||
      conceptC_description ||
      conceptC_price ||
      conceptC_notes ||
      productMaterialNotes ||
      preferredOptions ||
      avoidConcernItems ||
      budgetConversationNotes ||
      basicRange ||
      midRange ||
      premiumRange ||
      pricingRisks ||
      timelineConversationNotes ||
      idealStartWindow ||
      requiredFinishDeadline ||
      possiblePhases ||
      accessDisruptionNotes
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

      <View style={styles.sectionContainer}>
        <Text style={styles.label}>Product / Material Options</Text>
        <View style={styles.conceptBlock}>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Products, finishes, fixtures, materials, or brands discussed..."
            placeholderTextColor={COLORS.dim}
            value={productMaterialNotes}
            onChangeText={setProductMaterialNotes}
          />
          <TextInput
            style={styles.input}
            multiline
            placeholder="What does the client seem drawn to?"
            placeholderTextColor={COLORS.dim}
            value={preferredOptions}
            onChangeText={setPreferredOptions}
          />
          <TextInput
            style={styles.input}
            multiline
            placeholder="Products, materials, costs, or choices to avoid..."
            placeholderTextColor={COLORS.dim}
            value={avoidConcernItems}
            onChangeText={setAvoidConcernItems}
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
            value={budgetConversationNotes}
            onChangeText={setBudgetConversationNotes}
          />
          <TextInput
            style={styles.shortInput}
            placeholder="Simple / minimum viable option range..."
            placeholderTextColor={COLORS.dim}
            value={basicRange}
            onChangeText={setBasicRange}
          />
          <TextInput
            style={styles.shortInput}
            placeholder="Balanced option range..."
            placeholderTextColor={COLORS.dim}
            value={midRange}
            onChangeText={setMidRange}
          />
          <TextInput
            style={styles.shortInput}
            placeholder="Higher-end option range..."
            placeholderTextColor={COLORS.dim}
            value={premiumRange}
            onChangeText={setPremiumRange}
          />
          <TextInput
            style={styles.input}
            multiline
            placeholder="Unknowns that could affect cost..."
            placeholderTextColor={COLORS.dim}
            value={pricingRisks}
            onChangeText={setPricingRisks}
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
            value={timelineConversationNotes}
            onChangeText={setTimelineConversationNotes}
          />
          <TextInput
            style={styles.shortInput}
            placeholder="When would they like to start?"
            placeholderTextColor={COLORS.dim}
            value={idealStartWindow}
            onChangeText={setIdealStartWindow}
          />
          <TextInput
            style={styles.shortInput}
            placeholder="Any hard deadlines?"
            placeholderTextColor={COLORS.dim}
            value={requiredFinishDeadline}
            onChangeText={setRequiredFinishDeadline}
          />
          <TextInput
            style={styles.shortInput}
            placeholder="Could this be broken into phases?"
            placeholderTextColor={COLORS.dim}
            value={possiblePhases}
            onChangeText={setPossiblePhases}
          />
          <TextInput
            style={styles.input}
            multiline
            placeholder="Access limits, working hours, living conditions, business disruption..."
            placeholderTextColor={COLORS.dim}
            value={accessDisruptionNotes}
            onChangeText={setAccessDisruptionNotes}
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
              {clientConversationNotes ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewHeading}>Client Notes</Text>
                  <Text style={styles.previewText}>{clientConversationNotes}</Text>
                </View>
              ) : null}

              {(conceptA_description || conceptA_price || conceptA_notes) ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewHeading}>Concept A</Text>
                  {conceptA_description ? <Text style={styles.previewText}>{conceptA_description}</Text> : null}
                  {conceptA_price ? <Text style={styles.previewText}>Price Range: {conceptA_price}</Text> : null}
                  {conceptA_notes ? <Text style={styles.previewText}>Notes: {conceptA_notes}</Text> : null}
                </View>
              ) : null}

              {(conceptB_description || conceptB_price || conceptB_notes) ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewHeading}>Concept B</Text>
                  {conceptB_description ? <Text style={styles.previewText}>{conceptB_description}</Text> : null}
                  {conceptB_price ? <Text style={styles.previewText}>Price Range: {conceptB_price}</Text> : null}
                  {conceptB_notes ? <Text style={styles.previewText}>Notes: {conceptB_notes}</Text> : null}
                </View>
              ) : null}

              {(conceptC_description || conceptC_price || conceptC_notes) ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewHeading}>Concept C</Text>
                  {conceptC_description ? <Text style={styles.previewText}>{conceptC_description}</Text> : null}
                  {conceptC_price ? <Text style={styles.previewText}>Price Range: {conceptC_price}</Text> : null}
                  {conceptC_notes ? <Text style={styles.previewText}>Notes: {conceptC_notes}</Text> : null}
                </View>
              ) : null}

              {(productMaterialNotes || preferredOptions || avoidConcernItems) ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewHeading}>Product / Material Options</Text>
                  {productMaterialNotes ? <Text style={styles.previewText}>{productMaterialNotes}</Text> : null}
                  {preferredOptions ? <Text style={styles.previewText}>Preferred: {preferredOptions}</Text> : null}
                  {avoidConcernItems ? <Text style={styles.previewText}>Avoid: {avoidConcernItems}</Text> : null}
                </View>
              ) : null}

              {(budgetConversationNotes || basicRange || midRange || premiumRange || pricingRisks) ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewHeading}>Budget / Pricing Strategy</Text>
                  {budgetConversationNotes ? <Text style={styles.previewText}>{budgetConversationNotes}</Text> : null}
                  {basicRange ? <Text style={styles.previewText}>Basic: {basicRange}</Text> : null}
                  {midRange ? <Text style={styles.previewText}>Mid: {midRange}</Text> : null}
                  {premiumRange ? <Text style={styles.previewText}>Premium: {premiumRange}</Text> : null}
                  {pricingRisks ? <Text style={styles.previewText}>Risks: {pricingRisks}</Text> : null}
                </View>
              ) : null}

              {(timelineConversationNotes || idealStartWindow || requiredFinishDeadline || possiblePhases || accessDisruptionNotes) ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewHeading}>Timeline / Phasing</Text>
                  {timelineConversationNotes ? <Text style={styles.previewText}>{timelineConversationNotes}</Text> : null}
                  {idealStartWindow ? <Text style={styles.previewText}>Start: {idealStartWindow}</Text> : null}
                  {requiredFinishDeadline ? <Text style={styles.previewText}>Deadline: {requiredFinishDeadline}</Text> : null}
                  {possiblePhases ? <Text style={styles.previewText}>Phases: {possiblePhases}</Text> : null}
                  {accessDisruptionNotes ? <Text style={styles.previewText}>Access/Disruption: {accessDisruptionNotes}</Text> : null}
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
