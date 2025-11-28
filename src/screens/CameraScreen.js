import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "../context/ThemeContext";
import * as ImageManipulator from "expo-image-manipulator";

const { width, height } = Dimensions.get("window");

const CameraScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { modelNumber } = route.params || { modelNumber: 1 };
  const [facing, setFacing] = useState("front");
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [detectedSign, setDetectedSign] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (permission && !permission.granted && !permission.canAskAgain) {
      Alert.alert(
        "Permisos de Cámara",
        "Necesitas habilitar los permisos de cámara en la configuración de tu dispositivo para usar esta función.",
        [
          { text: "Cancelar", onPress: () => navigation.goBack() },
          {
            text: "Configuración",
            onPress: () => {
              /* Abrir configuración */
            },
          },
        ],
      );
    }
  }, [permission]);

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const startDetection = async () => {
    if (!cameraRef.current) return;

    try {
      setIsRecording(true);
      setDetectedSign(null);

      console.log("📸 Capturando imagen...");
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
      });

      console.log("🔄 Rotando imagen 90°...");
      const rotatedPhoto = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ rotate: 90 }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );

      const formData = new FormData();
      formData.append("file", {
        uri: rotatedPhoto.uri,
        name: "hand.jpg",
        type: "image/jpeg",
      });

      console.log("📤 Enviando al servidor...");
      let port = 8000;
      if (modelNumber === 2) {
        port = 8001;
      } else if (modelNumber === 3) {
        port = 8002;
      }
      const response = await fetch(`http://10.170.184.222:${port}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const result = await response.json();
      console.log("✅ Respuesta:", result);

      if (result.error) {
        setDetectedSign("✋ Mano no detectada");
      } else {
        setDetectedSign(
          `${result.prediction} (${(result.confidence * 100).toFixed(1)}%)`,
        );
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setDetectedSign("Error en detección");
    } finally {
      setIsRecording(false);
    }
  };

  const stopDetection = () => {
    setIsRecording(false);
    setDetectedSign(null);
    console.log("🛑 Detección detenida");
  };

  const styles = createStyles(theme);

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando cámara...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Icon
            name="camera"
            size={80}
            color={theme.primary}
            style={styles.permissionIcon}
          />
          <Text style={styles.permissionTitle}>Acceso a la Cámara</Text>
          <Text style={styles.permissionText}>
            Necesitamos acceso a tu cámara para detectar las señas que realizas
            y ayudarte a practicar el lenguaje de señas.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Permitir Acceso</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detectar Señas - Modelo {modelNumber}</Text>
        <TouchableOpacity
          style={styles.flipButton}
          onPress={toggleCameraFacing}
        >
          <Icon name="camera-reverse" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing={facing} />

        <View style={styles.overlay}>
          <View style={styles.detectionFrame}>
            <View style={styles.frameCorner} />
            <View style={[styles.frameCorner, styles.frameCornerTopRight]} />
            <View style={[styles.frameCorner, styles.frameCornerBottomLeft]} />
            <View style={[styles.frameCorner, styles.frameCornerBottomRight]} />
          </View>

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
              {isRecording
                ? "🎯 Detectando seña..."
                : "✋ Coloca tu mano dentro del marco"}
            </Text>
          </View>

          {detectedSign && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>Seña detectada:</Text>
              <Text style={styles.detectedSignText}>{detectedSign}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.detectButton,
              isRecording && styles.detectButtonActive,
            ]}
            onPress={isRecording ? stopDetection : startDetection}
          >
            <Icon
              name={isRecording ? "stop" : "scan"}
              size={32}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            {isRecording
              ? "Mantén tu mano quieta mientras detectamos la seña"
              : "Presiona el botón para comenzar a detectar señas"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
    loadingText: { fontSize: 18, color: theme.textSecondary },
    permissionContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
      backgroundColor: theme.background,
    },
    permissionIcon: { marginBottom: 32 },
    permissionTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 16,
      textAlign: "center",
    },
    permissionText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
      lineHeight: 24,
      marginBottom: 32,
    },
    permissionButton: {
      backgroundColor: theme.primary,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 32,
      marginBottom: 16,
    },
    permissionButtonText: {
      color: "#FFF",
      fontSize: 16,
      fontWeight: "600",
      textAlign: "center",
    },
    cancelButton: { paddingVertical: 12, paddingHorizontal: 24 },
    cancelButtonText: {
      color: theme.textSecondary,
      fontSize: 16,
      fontWeight: "500",
      textAlign: "center",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingTop: 50,
      paddingBottom: 20,
      backgroundColor: "rgba(0,0,0,0.8)",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: { fontSize: 20, fontWeight: "600", color: "#FFF" },
    flipButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
    },
    cameraContainer: { flex: 1 },
    camera: { flex: 1 },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
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
    instructionsContainer: {
      position: "absolute",
      top: "18%",
      left: 0,
      right: 0,
      alignItems: "center",
    },
    instructionsText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FFF",
      textAlign: "center",
      backgroundColor: "rgba(0,0,0,0.6)",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    resultContainer: {
      position: "absolute",
      bottom: "35%",
      left: 0,
      right: 0,
      alignItems: "center",
    },
    resultText: {
      fontSize: 14,
      color: "#FFF",
      marginBottom: 4,
      textShadowColor: "rgba(0,0,0,0.8)",
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    detectedSignText: {
      fontSize: 24,
      fontWeight: "700",
      color: "#4CAF50",
      backgroundColor: "rgba(0,0,0,0.8)",
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 16,
      textShadowColor: "rgba(0,0,0,0.8)",
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    controlsContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "rgba(0,0,0,0.7)",
      paddingBottom: 40,
      paddingTop: 16,
    },
    controls: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 16,
    },
    detectButton: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    detectButtonActive: { backgroundColor: "#FF6B6B" },
    infoContainer: { paddingHorizontal: 24, paddingBottom: 8, paddingTop: 8 },
    infoText: {
      fontSize: 13,
      color: "#FFF",
      textAlign: "center",
      opacity: 0.8,
      lineHeight: 18,
    },
  });

export default CameraScreen;
