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

const CameraPracticeMenuScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const letterGroups = [
    {
      id: "group_1",
      title: "Grupo 1",
      subtitle: "A - B - C - D - E - F - G - H - I",
      letters: ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
      color: "#007AFF",
      icon: "play-circle",
    },
    {
      id: "group_2",
      title: "Grupo 2",
      subtitle: "J - K - L - M - N - O - P - Q - R",
      letters: ["J", "K", "L", "M", "N", "O", "P", "Q", "R"],
      color: "#FF6B6B",
      icon: "play-circle",
    },
    {
      id: "group_3",
      title: "Grupo 3",
      subtitle: "S - T - U - V - W - X - Y - Z - Ñ",
      letters: ["S", "T", "U", "V", "W", "X", "Y", "Z", "Ñ"],
      color: "#4CAF50",
      icon: "play-circle",
    },
  ];

  const startPractice = (group) => {
    navigation.navigate("CameraLesson", {
      groupTitle: group.title,
      letters: group.letters,
    });
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Práctica con Cámara</Text>
          <Text style={styles.headerSubtitle}>
            Practica señas con detección en tiempo real
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.infoCard}>
          <Icon name="information-circle" size={24} color={theme.primary} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>¿Cómo funciona?</Text>
            <Text style={styles.infoText}>
              Selecciona un grupo de letras para practicar. Te mostraremos cada
              letra y tendrás que hacer la seña frente a la cámara. El modelo
              detectará tu seña y podrás confirmar si es correcta.
            </Text>
          </View>
        </View>

        <View style={styles.groupsContainer}>
          {letterGroups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={styles.groupCard}
              onPress={() => startPractice(group)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.groupIconContainer,
                  { backgroundColor: group.color + "20" },
                ]}
              >
                <Icon name={group.icon} size={32} color={group.color} />
              </View>
              <View style={styles.groupContent}>
                <Text style={styles.groupTitle}>{group.title}</Text>
                <Text style={styles.groupSubtitle}>{group.subtitle}</Text>
                <View style={styles.letterCountContainer}>
                  <Icon name="hand-left" size={16} color={theme.textSecondary} />
                  <Text style={styles.letterCount}>
                    {group.letters.length} letras
                  </Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Consejos</Text>
          <View style={styles.tipItem}>
            <Icon name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>
              Asegúrate de tener buena iluminación
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>
              Mantén tu mano dentro del marco
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>
              Sostén la seña por unos segundos
            </Text>
          </View>
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
      paddingHorizontal: 24,
      paddingTop: 50,
      paddingBottom: 24,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.background,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    headerTextContainer: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 40,
    },
    infoCard: {
      flexDirection: "row",
      backgroundColor: theme.primary + "10",
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.primary + "30",
    },
    infoTextContainer: {
      flex: 1,
      marginLeft: 12,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 4,
    },
    infoText: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    groupsContainer: {
      gap: 16,
      marginBottom: 24,
    },
    groupCard: {
      flexDirection: "row",
      alignItems: "center",
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
    groupIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    groupContent: {
      flex: 1,
    },
    groupTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 4,
    },
    groupSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 8,
    },
    letterCountContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    letterCount: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: "500",
    },
    tipsCard: {
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
    tipsTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 16,
    },
    tipItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    tipText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginLeft: 12,
      flex: 1,
    },
  });

export default CameraPracticeMenuScreen;
