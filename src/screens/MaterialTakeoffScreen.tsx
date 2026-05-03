// src/screens/MaterialTakeoffScreen.tsx

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";

import FieldRateScreen from "../components/fieldrate/FieldRateScreen";
import FieldRateCard from "../components/fieldrate/FieldRateCard";
import { COLORS } from "../theme/colors";

type Unit = "LF" | "SF" | "CY" | "EA" | "BOX" | "SHT";

type LineItem = {
  id: string;
  name: string;
  qty: number;
  unit: Unit;
  unitCost: number;
};

export default function MaterialTakeoffScreen() {
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", name: "2x4 Studs", qty: 120, unit: "LF", unitCost: 1.35 },
    { id: "2", name: "1/2 Plywood", qty: 24, unit: "SHT", unitCost: 28.5 },
  ]);

  const [markup, setMarkup] = useState(15);
  const [delivery, setDelivery] = useState(0);
  const [pickup, setPickup] = useState(0);

  function updateItem(id: string, patch: Partial<LineItem>) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: "",
        qty: 0,
        unit: "EA",
        unitCost: 0,
      },
    ]);
  }

  const subtotal = useMemo(() => {
    return items.reduce((sum, i) => sum + i.qty * i.unitCost, 0);
  }, [items]);

  const markupAmount = subtotal * (markup / 100);
  const total = subtotal + markupAmount + delivery + pickup;

  return (
    <FieldRateScreen title="Material Takeoff">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* SUMMARY */}
        <FieldRateCard title="Takeoff Summary">
          <View style={styles.row}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryValue}>{items.length}</Text>
              <Text style={styles.summaryLabel}>Items</Text>
            </View>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryValue}>
                ${subtotal.toFixed(0)}
              </Text>
              <Text style={styles.summaryLabel}>Subtotal</Text>
            </View>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryValue}>{markup}%</Text>
              <Text style={styles.summaryLabel}>Markup</Text>
            </View>
          </View>
        </FieldRateCard>

        {/* ADD */}
        <FieldRateCard title="Material Takeoff">
          <Pressable style={styles.addBtn} onPress={addItem}>
            <Text style={styles.addText}>+ Add Line Item</Text>
          </Pressable>
        </FieldRateCard>

        {/* ITEMS */}
        <FieldRateCard title="Materials">
          {items.map((item) => {
            const lineTotal = item.qty * item.unitCost;

            return (
              <View key={item.id} style={styles.line}>
                <TextInput
                  value={item.name}
                  onChangeText={(t) => updateItem(item.id, { name: t })}
                  placeholder="Item"
                  placeholderTextColor={COLORS.dim}
                  style={styles.input}
                />

                <View style={styles.row}>
                  <TextInput
                    value={String(item.qty)}
                    onChangeText={(t) =>
                      updateItem(item.id, { qty: Number(t) || 0 })
                    }
                    keyboardType="numeric"
                    style={[styles.input, styles.small]}
                  />

                  <TextInput
                    value={item.unit}
                    onChangeText={(t) =>
                      updateItem(item.id, { unit: t as Unit })
                    }
                    style={[styles.input, styles.small]}
                  />

                  <TextInput
                    value={String(item.unitCost)}
                    onChangeText={(t) =>
                      updateItem(item.id, { unitCost: Number(t) || 0 })
                    }
                    keyboardType="numeric"
                    style={[styles.input, styles.small]}
                  />
                </View>

                <Text style={styles.total}>
                  = ${lineTotal.toFixed(2)}
                </Text>
              </View>
            );
          })}
        </FieldRateCard>

        {/* COMING SOON */}
        <FieldRateCard title="Find Best Pricing (Coming Soon)">
          <Text style={styles.dim}>
            Compare local suppliers, delivery costs, and availability.
          </Text>
        </FieldRateCard>

        {/* TOTALS */}
        <FieldRateCard title="Totals">
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Markup %</Text>
            <TextInput
              value={String(markup)}
              onChangeText={(t) => setMarkup(Number(t) || 0)}
              style={styles.input}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Delivery Fee</Text>
            <TextInput
              value={String(delivery)}
              onChangeText={(t) => setDelivery(Number(t) || 0)}
              style={styles.input}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pickup Fee</Text>
            <TextInput
              value={String(pickup)}
              onChangeText={(t) => setPickup(Number(t) || 0)}
              style={styles.input}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Material Cost</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </FieldRateCard>
      </ScrollView>

      {/* BOTTOM ACTION */}
      <View style={styles.bottom}>
        <Pressable style={styles.primary}>
          <Text style={styles.primaryText}>Add All to Estimate</Text>
        </Pressable>
      </View>
    </FieldRateScreen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
  },

  summaryBox: {
    flex: 1,
    alignItems: "center",
  },

  summaryValue: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "800",
  },

  summaryLabel: {
    color: COLORS.dim,
    fontSize: 11,
  },

  addBtn: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },

  addText: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  line: {
    marginBottom: 12,
    gap: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    color: COLORS.text,
  },

  small: {
    flex: 1,
  },

  total: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  dim: {
    color: COLORS.dim,
  },

  inputGroup: {
    marginBottom: 10,
  },

  label: {
    color: COLORS.dim,
    fontSize: 11,
  },

  totalBox: {
    marginTop: 10,
    alignItems: "center",
  },

  totalLabel: {
    color: COLORS.text,
  },

  totalValue: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "900",
  },

  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "#000",
  },

  primary: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  primaryText: {
    color: "#000",
    fontWeight: "800",
  },
});
