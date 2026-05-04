// src/navigation/AppNavigator.tsx

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
} from "react-native";

import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { COLORS } from "../theme/colors";

// Screens
import DashboardScreen from "../screens/DashboardScreen";
import ProjectsScreen from "../screens/ProjectsScreen";
import TasksScreen from "../screens/TasksScreen";
import ScheduleScreen from "../screens/ScheduleScreen";
import TimeCostScreen from "../screens/TimeCostScreen";
import ScopeOfWorkScreen from "../screens/ScopeOfWorkScreen";
import LogWorkScreen from "../screens/LogWorkScreen";
import WalkthroughScreen from "../screens/WalkthroughScreen";
import PerformanceScreen from "../screens/PerformanceScreen";
import EstimateScreen from "../screens/EstimateScreen";
import ReportsScreen from "../screens/ReportsScreen";
import RichTextSpike from "../screens/RichTextSpike";

export type RootStackParamList = {
  Dashboard: undefined;
  Projects: undefined;
  Tasks: undefined;
  Schedule: undefined;
  "Time & Cost": undefined;
  "Scope of Work": undefined;
  "Log Work": undefined;
  Walkthrough: undefined;
  Performance: undefined;
  Estimate: undefined;
  Reports: undefined;
  "Rich Text Spike": undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

type DrawerContextType = {
  openDrawer: () => void;
  closeDrawer: () => void;
  isOpen: boolean;
};

export const DrawerContext = React.createContext<DrawerContextType>({
  openDrawer: () => {},
  closeDrawer: () => {},
  isOpen: false,
});

const menuItems = [
  { name: "Dashboard", icon: "⬡" },
  { name: "Projects", icon: "◈" },
  { name: "Tasks", icon: "☑" },
  { name: "Schedule", icon: "◫" },
  { name: "Time & Cost", icon: "⏱" },
  { name: "Scope of Work", icon: "☰" },
  { name: "Reports", icon: "▥" },
  { name: "Log Work", icon: "✎" },
  { name: "Walkthrough", icon: "▤" },
  { name: "Performance", icon: "↗" },
  { name: "Estimate", icon: "▤" },
  { name: "Rich Text Spike", icon: "✦" },
];

function DrawerContent({
  closeDrawer,
  activeRoute,
}: {
  closeDrawer: () => void;
  activeRoute: string;
}) {
  return (
    <View style={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <Text style={styles.logoText}>FR</Text>
        <Text style={styles.brandName}>FieldRate</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.menuScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuSection}>
          {menuItems.map((item) => {
            const isActive = activeRoute === item.name;

            return (
              <Pressable
                key={item.name}
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={() => {
                  if (navigationRef.isReady()) {
                    navigationRef.navigate(item.name as any);
                  }
                  closeDrawer();
                }}
              >
                <Text style={styles.icon}>{item.icon}</Text>
                <Text
                  style={[
                    styles.menuText,
                    isActive && styles.menuTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

export function AppNavigator() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState("Dashboard");

  const slideAnim = React.useRef(
    new Animated.Value(-DRAWER_WIDTH)
  ).current;

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, []);

  const closeDrawer = useCallback(() => {
    Animated.spring(slideAnim, {
      toValue: -DRAWER_WIDTH,
      useNativeDriver: true,
    }).start(() => setIsDrawerOpen(false));
  }, []);

  return (
    <DrawerContext.Provider
      value={{ openDrawer, closeDrawer, isOpen: isDrawerOpen }}
    >
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        <NavigationContainer
          ref={navigationRef}
          onStateChange={(state) => {
            const route = state?.routes[state.index];
            if (route?.name) setActiveRoute(route.name);
          }}
        >
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Projects" component={ProjectsScreen} />
            <Stack.Screen name="Tasks" component={TasksScreen} />
            <Stack.Screen name="Schedule" component={ScheduleScreen} />
            <Stack.Screen name="Time & Cost" component={TimeCostScreen} />
            <Stack.Screen name="Scope of Work" component={ScopeOfWorkScreen} />
            <Stack.Screen name="Log Work" component={LogWorkScreen} />
            <Stack.Screen name="Walkthrough" component={WalkthroughScreen} />
            <Stack.Screen name="Performance" component={PerformanceScreen} />
            <Stack.Screen name="Estimate" component={EstimateScreen} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
            <Stack.Screen name="Rich Text Spike" component={RichTextSpike} />
          </Stack.Navigator>
        </NavigationContainer>

        {isDrawerOpen && (
          <Pressable style={styles.overlay} onPress={closeDrawer} />
        )}

        <Animated.View
          style={[
            styles.drawer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <DrawerContent
            closeDrawer={closeDrawer}
            activeRoute={activeRoute}
          />
        </Animated.View>
      </View>
    </DrawerContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: DRAWER_WIDTH,
    height: "100%",
    backgroundColor: COLORS.surface,
    paddingTop: 60,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  drawerContent: {
    flex: 1,
    padding: 16,
  },
  drawerHeader: {
    marginBottom: 20,
  },
  logoText: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: "800",
  },
  brandName: {
    color: COLORS.text,
    fontSize: 14,
  },
  menuScrollContent: {
    paddingBottom: 60,
  },
  menuSection: {
    gap: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 10,
  },
  menuItemActive: {
    backgroundColor: COLORS.primaryDim,
  },
  menuText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  menuTextActive: {
    color: COLORS.primary,
  },
  icon: {
    color: COLORS.primary,
    fontSize: 14,
  },
});
