import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "../context/ThemeContext";
import { signLanguageAPI } from "../lib/supabase";

const { width } = Dimensions.get("window");

const CameraLessonScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { groupTitle, letters } = route.params;
  const [permission, requestPermission] = useCameraPermissions();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempts, setAttempts] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [detectedLetter, setDetectedLetter] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentSignData, setCurrentSignData] = useState(null);
  const [isLoadingSign, setIsLoadingSign] = useState(false);
  const cameraRef = useRef(null);

  const currentLetter = letters[currentIndex];
  const progress = ((currentIndex + 1) / letters.length) * 100;

  useEffect(() => {
    loadSignImage();
  }, [currentIndex]);

  const loadSignImage = async () => {
    try {
      setIsLoadingSign(true);
      const signData = await signLanguageAPI.getSignByCharacter(currentLetter);
      setCurrentSignData(signData);
    } catch (error) {
      console.error("Error cargando imagen de seña:", error);
      setCurrentSignData(null);
    } finally {
      setIsLoadingSign(false);
    }
  };

  const openCamera = () => {
    if (!permission?.granted) {
      requestPermission();
      return;
    }
    setShowCamera(true);
    setDetectedLetter(null);
  };

  const detectSign = async () => {
    if (!cameraRef.current) return;

    try {
      setIsDetecting(true);

      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
      });

      const formData = new FormData();
      formData.append("file", {
        uri: photo.uri,
        name: "hand.jpg",
        type: "image/jpeg",
      });

      const response = await fetch(`http://192.168.1.28:8000/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const result = await response.json();

      if (result.error) {
        setDetectedLetter("❌ Mano no detectada");
      } else {
        setDetectedLetter(result.prediction);
      }
    } catch (error) {
      console.error("Error detectando seña:", error);
      Alert.alert("Error", "No se pudo detectar la seña. Intenta de nuevo.");
    } finally {
      setIsDetecting(false);
    }
  };

  const confirmCorrect = () => {
    const newAttempt = {
      letter: currentLetter,
      detected: detectedLetter,
      isCorrect: true,
      attempts: 1,
    };
    setAttempts([...attempts, newAttempt]);
    setShowCamera(false);
    setDetectedLetter(null);

    if (currentIndex < letters.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      showResults();
    }
  };

  const retryDetection = () => {
    setDetectedLetter(null);
  };

  const showResults = () => {
    const totalAttempts = attempts.length + 1;
    const correctAttempts = attempts.filter((a) => a.isCorrect).length + 1;
    const accuracy = ((correctAttempts / totalAttempts) * 100).toFixed(0);

    navigation.replace("CameraLessonResults", {
      groupTitle,
      totalLetters: letters.length,
      accuracy,
      attempts: [...attempts, {
        letter: currentLetter,
        detected: detectedLetter,
        isCorrect: true,
        attempts: 1,
      }],
    });
  };

  const styles = createStyles(theme);

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>{groupTitle}</Text>
          <Text style={styles.headerSubtitle}>
            Letra {currentIndex + 1} de {letters.length}
          </Text>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>Haz la seña de:</Text>
          <View style={styles.letterContainer}>
            <Text style={styles.letterText}>{currentLetter}</Text>
          </View>

          {isLoadingSign ? (
            <View style={styles.imageLoadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={styles.loadingImageText}>Cargando imagen...</Text>
            </View>
          ) : currentSignData?.image_url ? (
            <View style={styles.signImageContainer}>
              <Text style={styles.signImageTitle}>Así se hace:</Text>
              <Image
                source={{ uri: currentSignData.image_url }}
                style={styles.signImage}
                resizeMode="contain"
              />
            </View>
          ) : null}

          <Text style={styles.instructionSubtitle}>
            Presiona el botón para abrir la cámara
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cameraButton}
          onPress={openCamera}
          activeOpacity={0.8}
        >
          <Icon name="camera" size={32} color="#FFFFFF" />
          <Text style={styles.cameraButtonText}>Abrir Cámara</Text>
        </TouchableOpacity>
      </ScrollView>

      {detectedLetter && !showCamera && (
        <View style={styles.resultOverlay}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Detectamos:</Text>
            <Text style={styles.resultLetter}>{detectedLetter}</Text>
            <View style={styles.resultButtons}>
              <TouchableOpacity
                style={styles.correctButton}
                onPress={confirmCorrect}
              >
                <Icon name="checkmark-circle" size={24} color="#FFFFFF" />
                <Text style={styles.correctButtonText}>Es Correcta</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => setShowCamera(true)}
              >
                <Icon name="refresh" size={24} color={theme.primary} />
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <Modal
        visible={showCamera}
        animationType="slide"
        onRequestClose={() => setShowCamera(false)}
      >
        <SafeAreaView style={styles.cameraModal}>
          <View style={styles.cameraHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCamera(false)}
            >
              <Icon name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.cameraHeaderText}>
              Haz la seña: {currentLetter}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.cameraContainer}>
            <CameraView ref={cameraRef} style={styles.camera} facing="front">
              <View style={styles.cameraOverlay}>
                <View style={styles.detectionFrame}>
                  <View style={styles.frameCorner} />
                  <View style={[styles.frameCorner, styles.frameCornerTopRight]} />
                  <View style={[styles.frameCorner, styles.frameCornerBottomLeft]} />
                  <View style={[styles.frameCorner, styles.frameCornerBottomRight]} />
                </View>

                {detectedLetter && (
                  <View style={styles.detectedOverlay}>
                    <Text style={styles.detectedText}>Detectado:</Text>
                    <Text style={styles.detectedLetterText}>{detectedLetter}</Text>
                  </View>
                )}
              </View>
            </CameraView>
          </View>

          <View style={styles.cameraControls}>
            {!detectedLetter ? (
              <TouchableOpacity
                style={[styles.detectButton, isDetecting && styles.detectButtonDisabled]}
                onPress={detectSign}
                disabled={isDetecting}
              >
                {isDetecting ? (
                  <Text style={styles.detectButtonText}>Detectando...</Text>
                ) : (
                  <>
                    <Icon name="scan" size={24} color="#FFFFFF" />
                    <Text style={styles.detectButtonText}>Detectar Seña</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.confirmControls}>
                <TouchableOpacity
                  style={styles.confirmCorrectButton}
                  onPress={() => {
                    confirmCorrect();
                  }}
                >
                  <Icon name="checkmark-circle" size={24} color="#FFFFFF" />
                  <Text style={styles.confirmCorrectButtonText}>Correcto</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmRetryButton}
                  onPress={retryDetection}
                >
                  <Icon name="refresh" size={24} color="#FFFFFF" />
                  <Text style={styles.confirmRetryButtonText}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      fontSize: 16,
      color: theme.textSecondary,
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
      fontSize: 20,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    progressBarContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 16,
      backgroundColor: theme.surface,
    },
    progressBar: {
      flex: 1,
      height: 8,
      backgroundColor: theme.border,
      borderRadius: 4,
      marginRight: 12,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: theme.primary,
      borderRadius: 4,
    },
    progressText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
      minWidth: 45,
      textAlign: "right",
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 24,
      paddingTop: 40,
      paddingBottom: 40,
      alignItems: "center",
    },
    instructionCard: {
      width: "100%",
      backgroundColor: theme.surface,
      borderRadius: 24,
      padding: 32,
      alignItems: "center",
      marginBottom: 32,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    instructionTitle: {
      fontSize: 18,
      color: theme.textSecondary,
      marginBottom: 16,
    },
    letterContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 16,
      shadowColor: theme.primary,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    letterText: {
      fontSize: 64,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    instructionSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: "center",
    },
    imageLoadingContainer: {
      paddingVertical: 24,
      alignItems: "center",
    },
    loadingImageText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 12,
    },
    signImageContainer: {
      width: "100%",
      marginVertical: 16,
      alignItems: "center",
    },
    signImageTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 12,
    },
    signImage: {
      width: width * 0.6,
      height: width * 0.6,
      borderRadius: 16,
      backgroundColor: theme.background,
    },
    cameraButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.primary,
      borderRadius: 16,
      paddingVertical: 20,
      paddingHorizontal: 40,
      shadowColor: theme.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    cameraButtonText: {
      fontSize: 18,
      fontWeight: "600",
      color: "#FFFFFF",
      marginLeft: 12,
    },
    resultOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: -4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    resultCard: {
      width: "100%",
      alignItems: "center",
    },
    resultTitle: {
      fontSize: 16,
      color: theme.textSecondary,
      marginBottom: 12,
    },
    resultLetter: {
      fontSize: 48,
      fontWeight: "700",
      color: theme.primary,
      marginBottom: 24,
    },
    resultButtons: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
    },
    correctButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#4CAF50",
      borderRadius: 12,
      paddingVertical: 16,
    },
    correctButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
      marginLeft: 8,
    },
    retryButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
      borderRadius: 12,
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
    cameraModal: {
      flex: 1,
      backgroundColor: "#000",
    },
    cameraHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingTop: 50,
      paddingBottom: 20,
      backgroundColor: "rgba(0,0,0,0.8)",
    },
    closeButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
    },
    cameraHeaderText: {
      fontSize: 18,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    placeholder: {
      width: 44,
    },
    cameraContainer: {
      flex: 1,
    },
    camera: {
      flex: 1,
    },
    cameraOverlay: {
      flex: 1,
      backgroundColor: "transparent",
    },
    detectionFrame: {
      position: "absolute",
      top: "25%",
      left: "15%",
      right: "15%",
      bottom: "35%",
      borderWidth: 2,
      borderColor: "transparent",
    },
    frameCorner: {
      position: "absolute",
      width: 30,
      height: 30,
      borderColor: "#FFF",
      top: -2,
      left: -2,
      borderTopWidth: 4,
      borderLeftWidth: 4,
    },
    frameCornerTopRight: {
      left: undefined,
      right: -2,
      borderLeftWidth: 0,
      borderRightWidth: 4,
    },
    frameCornerBottomLeft: {
      top: undefined,
      bottom: -2,
      borderTopWidth: 0,
      borderBottomWidth: 4,
    },
    frameCornerBottomRight: {
      top: undefined,
      left: undefined,
      right: -2,
      bottom: -2,
      borderTopWidth: 0,
      borderLeftWidth: 0,
      borderRightWidth: 4,
      borderBottomWidth: 4,
    },
    detectedOverlay: {
      position: "absolute",
      bottom: "30%",
      left: 0,
      right: 0,
      alignItems: "center",
    },
    detectedText: {
      fontSize: 16,
      color: "#FFF",
      marginBottom: 8,
      backgroundColor: "rgba(0,0,0,0.6)",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    detectedLetterText: {
      fontSize: 48,
      fontWeight: "700",
      color: "#4CAF50",
      backgroundColor: "rgba(0,0,0,0.8)",
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 16,
    },
    cameraControls: {
      backgroundColor: "rgba(0,0,0,0.8)",
      paddingHorizontal: 24,
      paddingVertical: 24,
      paddingBottom: 40,
    },
    detectButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.primary,
      borderRadius: 16,
      paddingVertical: 20,
    },
    detectButtonDisabled: {
      opacity: 0.6,
    },
    detectButtonText: {
      fontSize: 18,
      fontWeight: "600",
      color: "#FFFFFF",
      marginLeft: 8,
    },
    confirmControls: {
      flexDirection: "row",
      gap: 12,
    },
    confirmCorrectButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#4CAF50",
      borderRadius: 16,
      paddingVertical: 20,
    },
    confirmCorrectButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
      marginLeft: 8,
    },
    confirmRetryButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FF6B6B",
      borderRadius: 16,
      paddingVertical: 20,
    },
    confirmRetryButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
      marginLeft: 8,
    },
  });

export default CameraLessonScreen;
