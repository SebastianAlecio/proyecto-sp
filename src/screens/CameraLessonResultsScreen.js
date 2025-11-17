import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "../context/ThemeContext";

const CameraLessonResultsScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { groupTitle, totalLetters, accuracy, attempts } = route.params;

  const getAccuracyColor = (acc) => {
    if (acc >= 90) return "#4CAF50";
    if (acc >= 70) return "#FF9800";
    return "#FF6B6B";
  };

  const getAccuracyMessage = (acc) => {
    if (acc >= 90) return "¡Excelente trabajo!";
    if (acc >= 70) return "¡Buen trabajo!";
    return "¡Sigue practicando!";
  };

  const styles = createStyles(theme, getAccuracyColor(accuracy));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resultados</Text>
        <Text style={styles.headerSubtitle}>{groupTitle}</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.resultCard}>
          <Icon name="trophy" size={64} color={getAccuracyColor(accuracy)} />
          <Text style={styles.accuracyText}>{accuracy}%</Text>
          <Text style={styles.accuracyLabel}>Precisión</Text>
          <Text style={styles.congratsText}>
            {getAccuracyMessage(accuracy)}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Icon name="checkmark-circle" size={32} color="#4CAF50" />
            <Text style={styles.statValue}>{totalLetters}</Text>
            <Text style={styles.statLabel}>Letras Completadas</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="hand-left" size={32} color={theme.primary} />
            <Text style={styles.statValue}>{attempts.length}</Text>
            <Text style={styles.statLabel}>Intentos Totales</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Detalles por Letra</Text>
          {attempts.map((attempt, index) => (
            <View key={index} style={styles.attemptRow}>
              <View style={styles.attemptLetter}>
                <Text style={styles.attemptLetterText}>{attempt.letter}</Text>
              </View>
              <View style={styles.attemptInfo}>
                <Text style={styles.attemptDetected}>
                  Detectado: {attempt.detected}
                </Text>
              </View>
              <Icon
                name={attempt.isCorrect ? "checkmark-circle" : "close-circle"}
                size={24}
                color={attempt.isCorrect ? "#4CAF50" : "#FF6B6B"}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="refresh" size={24} color={theme.primary} />
          <Text style={styles.retryButtonText}>Practicar Otra Vez</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate("Home", { screen: "Learn" })}
        >
          <Icon name="home" size={24} color="#FFFFFF" />
          <Text style={styles.homeButtonText}>Volver al Inicio</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme, accuracyColor) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 50,
      paddingBottom: 24,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 40,
    },
    resultCard: {
      backgroundColor: theme.surface,
      borderRadius: 24,
      padding: 40,
      alignItems: "center",
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    accuracyText: {
      fontSize: 64,
      fontWeight: "700",
      color: accuracyColor,
      marginTop: 16,
    },
    accuracyLabel: {
      fontSize: 18,
      color: theme.textSecondary,
      marginBottom: 12,
    },
    congratsText: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.text,
      textAlign: "center",
    },
    statsGrid: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    statValue: {
      fontSize: 32,
      fontWeight: "700",
      color: theme.text,
      marginTop: 8,
    },
    statLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: "center",
      marginTop: 4,
    },
    detailsCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    detailsTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 16,
    },
    attemptRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    attemptLetter: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary + "20",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    attemptLetterText: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.primary,
    },
    attemptInfo: {
      flex: 1,
    },
    attemptDetected: {
      fontSize: 14,
      color: theme.text,
    },
    footer: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 32,
      backgroundColor: theme.surface,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      gap: 12,
    },
    retryButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
      borderRadius: 16,
      paddingVertical: 16,
      borderWidth: 2,
      borderColor: theme.primary,
    },
    retryButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.primary,
      marginLeft: 8,
    },
    homeButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.primary,
      borderRadius: 16,
      paddingVertical: 16,
    },
    homeButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
      marginLeft: 8,
    },
  });

export default CameraLessonResultsScreen;
