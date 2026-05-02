import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import FieldRateCard from "../components/fieldrate/FieldRateCard";
import FieldRateScreen from "../components/fieldrate/FieldRateScreen";
import { activeProjectRepository } from "../data/repositories/activeProjectRepository";
import { projectRepository } from "../data/repositories/projectRepository";
import { COLORS } from "../theme/colors";
import type { Project } from "../types/project";

export default function ProjectHistoryScreen() {
  const [projects, setProjects] = useState<Project[]>([]);

  const loadProjects = useCallback(async () => {
    const savedProjects = await projectRepository.getAll();
    setProjects(savedProjects);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [loadProjects])
  );

  async function openProject(projectId: string) {
    await activeProjectRepository.set(projectId);
    await loadProjects();
  }

  async function deleteProject(projectId: string) {
    await projectRepository.remove(projectId);
    await activeProjectRepository.clear();
    await loadProjects();
  }

  async function restoreSnapshot(projectId: string, snapshotIndex: number) {
    await projectRepository.restore(projectId, snapshotIndex);
    await activeProjectRepository.set(projectId);
    await loadProjects();
  }

  return (
    <FieldRateScreen
      title="Project History"
      subtitle="Open saved scopes, review project versions, and restore earlier estimates."
    >
      <FieldRateCard title="Saved Projects">
        {projects.length === 0 ? (
          <Text style={styles.emptyText}>No saved projects yet.</Text>
        ) : (
          projects.map((project) => (
            <View key={project.id} style={styles.project}>
              <Pressable onPress={() => openProject(project.id)}>
                <Text style={styles.projectName}>{project.name}</Text>
                <Text style={styles.metaText}>{project.scope.length} scope lines</Text>
                <Text style={styles.metaText}>
                  {project.snapshots?.length || 0} saved versions
                </Text>
              </Pressable>

              <Pressable onPress={() => deleteProject(project.id)}>
                <Text style={styles.deleteText}>Delete Project</Text>
              </Pressable>

              {project.snapshots?.length ? (
                <View style={styles.snapshotList}>
                  {project.snapshots.map((snapshot, index) => (
                    <Pressable
                      key={`${project.id}-${snapshot.timestamp}-${index}`}
                      onPress={() => restoreSnapshot(project.id, index)}
                    >
                      <Text style={styles.restoreText}>
                        Restore {new Date(snapshot.timestamp).toLocaleString()}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>
          ))
        )}
      </FieldRateCard>
    </FieldRateScreen>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    color: COLORS.muted,
    lineHeight: 20,
  },
  project: {
    borderWidth: 1,
    borderColor: "rgba(0, 242, 255, 0.18)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
  projectName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  metaText: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  snapshotList: {
    marginTop: 6,
    gap: 6,
  },
  deleteText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 8,
  },
  restoreText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
  },
});
