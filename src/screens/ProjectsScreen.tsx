import React, { useCallback, useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { COLORS } from "../theme/colors";
import { DrawerContext } from "../navigation/AppNavigator";
import { jobRepository } from "../data/repositories/jobRepository";
import { logRepository } from "../data/repositories/logRepository";
import type { Job } from "../types/job";
import type { WorkLog } from "../types/log";

export default function ProjectsScreen() {
  const { openDrawer } = useContext(DrawerContext);
  const navigation = useNavigation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJobName, setNewJobName] = useState("");
  const [newJobLocation, setNewJobLocation] = useState("");

  const loadData = useCallback(async () => {
    const [jobData, logData] = await Promise.all([
      jobRepository.getAll(),
      logRepository.getAll(),
    ]);
    setJobs(jobData);
    setLogs(logData);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  async function refresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function addJob() {
    if (!newJobName.trim()) {
      Alert.alert("Missing Info", "Please enter a project name.");
      return;
    }

    const newJob: Job = {
      id: Date.now().toString(),
      name: newJobName.trim(),
      location: newJobLocation.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    await jobRepository.save(newJob);
    setNewJobName("");
    setNewJobLocation("");
    setShowAddForm(false);
    await loadData();
  }

  async function deleteJob(id: string) {
    Alert.alert("Delete Project", "Are you sure you want to delete this project?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await jobRepository.remove(id);
          await loadData();
        },
      },
    ]);
  }

  function getJobStats(jobName: string) {
    const jobLogs = logs.filter((log) => log.jobName === jobName);
    const totalMH = jobLogs.reduce((sum, log) => sum + log.manHours, 0);
    return { logCount: jobLogs.length, totalMH };
  }

  // Demo projects if no jobs exist
  const displayJobs: Job[] = jobs.length > 0 ? jobs : [
    { id: "demo1", name: "Riverside Tower", location: "1847 Harbor Rd", createdAt: new Date().toISOString() },
    { id: "demo2", name: "Harbor Point", location: "500 Bayfront Dr", createdAt: new Date().toISOString() },
    { id: "demo3", name: "Summit Ridge", location: "2200 Peak Ave", createdAt: new Date().toISOString() },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.menuButton} onPress={openDrawer}>
          <View style={styles.menuIcon}>
            <View style={styles.menuLine} />
            <View style={[styles.menuLine, styles.menuLineShort]} />
            <View style={styles.menuLine} />
          </View>
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Projects</Text>
          <Text style={styles.headerSubtitle}>{displayJobs.length} active</Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Text style={styles.addButtonText}>{showAddForm ? "×" : "+"}</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Add Form */}
        {showAddForm && (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>New Project</Text>
            <TextInput
              style={styles.input}
              value={newJobName}
              onChangeText={setNewJobName}
              placeholder="Project Name"
              placeholderTextColor={COLORS.dim}
            />
            <TextInput
              style={styles.input}
              value={newJobLocation}
              onChangeText={setNewJobLocation}
              placeholder="Location (optional)"
              placeholderTextColor={COLORS.dim}
            />
            <Pressable style={styles.submitButton} onPress={addJob}>
              <Text style={styles.submitButtonText}>Create Project</Text>
            </Pressable>
          </View>
        )}

        {/* Project List */}
        {displayJobs.map((job) => {
          const stats = getJobStats(job.name);
          const isDemo = job.id.startsWith("demo");

          return (
            <Pressable
              key={job.id}
              style={styles.projectCard}
              onPress={() => {
                // Navigate to project detail
              }}
            >
              <View style={styles.projectHeader}>
                <View style={styles.statusDot} />
                <Text style={styles.projectStatus}>ACTIVE</Text>
              </View>

              <Text style={styles.projectName}>{job.name}</Text>
              {job.location && (
                <Text style={styles.projectLocation}>{job.location}</Text>
              )}

              <View style={styles.projectStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.logCount}</Text>
                  <Text style={styles.statLabel}>Logs</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.totalMH.toFixed(0)}</Text>
                  <Text style={styles.statLabel}>MH</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>—</Text>
                  <Text style={styles.statLabel}>Budget</Text>
                </View>
              </View>

              <View style={styles.projectActions}>
                <Pressable
                  style={styles.projectAction}
                  onPress={() => navigation.navigate("Time & Cost" as never)}
                >
                  <Text style={styles.projectActionText}>Time & Cost</Text>
                </Pressable>
                <Pressable
                  style={styles.projectAction}
                  onPress={() => navigation.navigate("Log Work" as never)}
                >
                  <Text style={styles.projectActionText}>Add Log</Text>
                </Pressable>
                {!isDemo && (
                  <Pressable
                    style={[styles.projectAction, styles.deleteAction]}
                    onPress={() => deleteJob(job.id)}
                  >
                    <Text style={styles.deleteActionText}>Delete</Text>
                  </Pressable>
                )}
              </View>
            </Pressable>
          );
        })}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: {
    gap: 4,
  },
  menuLine: {
    width: 18,
    height: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 1,
  },
  menuLineShort: {
    width: 12,
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: COLORS.dim,
    fontSize: 11,
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primaryDim,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: "600",
    marginTop: -2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  addForm: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 16,
  },
  formTitle: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 14,
    color: COLORS.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  submitButtonText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: "800",
  },
  projectCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 8,
  },
  projectStatus: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  projectName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  projectLocation: {
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: 16,
  },
  projectStats: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 14,
    marginBottom: 14,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    color: COLORS.dim,
    fontSize: 10,
    marginTop: 2,
  },
  projectActions: {
    flexDirection: "row",
    gap: 8,
  },
  projectAction: {
    flex: 1,
    backgroundColor: COLORS.primaryDim,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  projectActionText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  deleteAction: {
    backgroundColor: "rgba(255, 59, 59, 0.1)",
    borderColor: "rgba(255, 59, 59, 0.3)",
    flex: 0.5,
  },
  deleteActionText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: "700",
  },
});
