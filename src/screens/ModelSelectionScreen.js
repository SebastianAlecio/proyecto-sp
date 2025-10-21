import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "../context/ThemeContext";

const ModelSelectionScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const handleModelSelect = (modelNumber) => {
    navigation.navigate("CameraScreen", { modelNumber });
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
          <Icon name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seleccionar Modelo</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleContainer}>
          <Icon name="cube-outline" size={48} color={theme.primary} />
          <Text style={styles.title}>Elige un Modelo</Text>
          <Text style={styles.subtitle}>
            Selecciona el modelo de detección que deseas utilizar
          </Text>
        </View>

        <View style={styles.modelsContainer}>
          <TouchableOpacity
            style={styles.modelCard}
            onPress={() => handleModelSelect(1)}
            activeOpacity={0.7}
          >
            <View style={[styles.modelIconContainer, { backgroundColor: theme.primary + "15" }]}>
              <Icon name="analytics" size={40} color={theme.primary} />
            </View>
            <Text style={styles.modelTitle}>MODELO 1</Text>
            <Text style={styles.modelDescription}>
              Modelo base de detección de señas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modelCard}
            onPress={() => handleModelSelect(2)}
            activeOpacity={0.7}
          >
            <View style={[styles.modelIconContainer, { backgroundColor: theme.primary + "15" }]}>
              <Icon name="flash" size={40} color={theme.primary} />
            </View>
            <Text style={styles.modelTitle}>MODELO 2</Text>
            <Text style={styles.modelDescription}>
              Modelo avanzado de detección de señas
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingTop: 35,
      paddingBottom: 16,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.surface,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.text,
    },
    placeholder: {
      width: 44,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingBottom: 32,
    },
    titleContainer: {
      alignItems: "center",
      marginTop: 16,
      marginBottom: 32,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.text,
      marginTop: 16,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      paddingHorizontal: 32,
    },
    modelsContainer: {
      gap: 20,
    },
    modelCard: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 24,
      alignItems: "center",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
      borderWidth: 2,
      borderColor: theme.border,
    },
    modelIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    modelTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 8,
    },
    modelDescription: {
      fontSize: 15,
      color: theme.textSecondary,
      textAlign: "center",
      lineHeight: 21,
    },
  });

export default ModelSelectionScreen;
