import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  ActivityIndicator,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "../context/ThemeContext";
import { signLanguageAPI } from "../lib/supabase";
import { wordsAPI } from "../lib/supabase";
import { getInfinitiveForm } from "../utils/verbConjugations";

const TranslateScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTranslate = async () => {
    if (inputText.trim()) {
      setIsLoading(true);
      // Ocultar el teclado
      Keyboard.dismiss();

      try {
        // Corregir tildes usando IA antes de procesar
        let textToProcess = inputText.trim();
        try {
          const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `Corrige ÚNICAMENTE las tildes (acentos ortográficos) en el siguiente texto en español. NO cambies nada más. Responde SOLO con el texto corregido, sin explicaciones:\n\n"${textToProcess}"`
                  }]
                }],
                generationConfig: {
                  temperature: 0.3,
                  maxOutputTokens: 200,
                },
              }),
            }
          );

          if (geminiResponse.ok) {
            const geminiData = await geminiResponse.json();
            const correctedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (correctedText) {
              textToProcess = correctedText.replace(/^"|"$/g, '');
              console.log("Texto original:", inputText.trim());
              console.log("Texto corregido:", textToProcess);
            }
          } else {
            const errorText = await geminiResponse.text();
            console.error("Error de Gemini:", geminiResponse.status, errorText);
            console.warn("No se pudo corregir tildes, usando texto original");
          }
        } catch (accentError) {
          console.error("Error completo corrigiendo tildes:", accentError);
          console.warn("Error corrigiendo tildes, usando texto original:", accentError);
        }

        // Limpiar el texto de puntuación y dividir en palabras
        const cleanText = textToProcess
          .toLowerCase()
          .trim()
          .replace(/[.,;:!?¿¡]/g, "");
        const words = cleanText.split(/\s+/);
        const translatedWords = [];

        let wordIndex = 0;
        while (wordIndex < words.length) {
          // PRIORIDAD 1: Intentar frases de 3 palabras PRIMERO
          if (wordIndex + 2 < words.length) {
            const threeWordPhrase = `${words[wordIndex]} ${words[wordIndex + 1]} ${words[wordIndex + 2]}`;
            try {
              const phraseVideo = await wordsAPI.getWordVideo(threeWordPhrase);
              translatedWords.push({
                originalWord: threeWordPhrase,
                hasVideo: true,
                signs: [
                  {
                    type: "word",
                    word: phraseVideo.word,
                    video_url: phraseVideo.video_url,
                    description: phraseVideo.description,
                    category: phraseVideo.category,
                  },
                ],
              });
              wordIndex += 3; // Saltar las 3 palabras procesadas
              continue;
            } catch (error) {
              // Si no existe como frase de 3 palabras, continuar
            }
          }

          // PRIORIDAD 2: Intentar frases de 2 palabras
          if (wordIndex + 1 < words.length) {
            const twoWordPhrase = `${words[wordIndex]} ${words[wordIndex + 1]}`;
            try {
              const phraseVideo = await wordsAPI.getWordVideo(twoWordPhrase);
              translatedWords.push({
                originalWord: twoWordPhrase,
                hasVideo: true,
                signs: [
                  {
                    type: "word",
                    word: phraseVideo.word,
                    video_url: phraseVideo.video_url,
                    description: phraseVideo.description,
                    category: phraseVideo.category,
                  },
                ],
              });
              wordIndex += 2; // Saltar las 2 palabras procesadas
              continue;
            } catch (error) {
              // Si no existe como frase de 2 palabras, continuar
            }
          }

          // PRIORIDAD 3: Procesar palabra individual
          const word = words[wordIndex];

          // Buscar palabra original en base de datos
          try {
            const wordVideo = await wordsAPI.getWordVideo(word);
            translatedWords.push({
              originalWord: word,
              hasVideo: true,
              signs: [
                {
                  type: "word",
                  word: wordVideo.word,
                  video_url: wordVideo.video_url,
                  description: wordVideo.description,
                  category: wordVideo.category,
                },
              ],
            });
          } catch (error) {
            // Si no existe la palabra, verificar si es una conjugación
            const infinitiveForm = getInfinitiveForm(word);

            if (infinitiveForm !== word.toLowerCase()) {
              // Es una conjugación, buscar el infinitivo
              try {
                const wordVideo = await wordsAPI.getWordVideo(infinitiveForm);
                translatedWords.push({
                  originalWord: word,
                  hasVideo: true,
                  signs: [
                    {
                      type: "word",
                      word: wordVideo.word,
                      video_url: wordVideo.video_url,
                      description: wordVideo.description,
                      category: wordVideo.category,
                    },
                  ],
                });
              } catch (error) {
                // No existe el infinitivo, deletrear
                const wordSigns = await getSpelledWord(word);
                translatedWords.push({
                  originalWord: word,
                  hasVideo: false,
                  signs: wordSigns,
                });
              }
            } else {
              // No es una conjugación, deletrear
              const wordSigns = await getSpelledWord(word);
              translatedWords.push({
                originalWord: word,
                hasVideo: false,
                signs: wordSigns,
              });
            }
          }

          wordIndex++; // Avanzar a la siguiente palabra
        }

        // Navegar a la pantalla de resultados
        navigation.navigate("TranslationResults", {
          translatedWords,
          originalText: inputText.trim(),
        });
      } catch (error) {
        console.error("Error translating text:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Función auxiliar para deletrear palabras
  const getSpelledWord = async (word) => {
    const elements = [];

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const normalizedChar = char
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      // Verificar si es RR o LL
      if (normalizedChar === "r" && word[i + 1] === "r") {
        elements.push({ type: "character", character: "RR" });
        i++;
      } else if (normalizedChar === "l" && word[i + 1] === "l") {
        elements.push({ type: "character", character: "LL" });
        i++;
      } else if (/[a-zñ0-9]/.test(normalizedChar)) {
        elements.push({
          type: "character",
          character: normalizedChar.toUpperCase(),
        });
      }
    }

    // Obtener las señas de la base de datos solo para los caracteres
    const charactersOnly = elements.map((el) => el.character);
    const signs = await signLanguageAPI.getSignsByCharacters(charactersOnly);

    // Crear array de señas para esta palabra
    const wordSigns = [];
    elements.forEach((element, index) => {
      const sign = signs[index];
      if (sign) {
        wordSigns.push({ type: "sign", ...sign });
      }
    });

    return wordSigns;
  };

  const clearText = () => {
    setInputText("");
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Traductor</Text>
          <Text style={styles.headerSubtitle}>Texto a Lenguaje de Señas</Text>
        </View>
        <Image
          source={require("../../assets/icon_bg.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        {/* Input Section */}
        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Escribe aquí tu mensaje..."
              placeholderTextColor={theme.placeholder}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={100}
            />
            {inputText.length > 0 && (
              <TouchableOpacity style={styles.clearButton} onPress={clearText}>
                <Icon name="close-circle" size={20} color={theme.clearButton} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.translateButton,
              (!inputText.trim() || isLoading) &&
                styles.translateButtonDisabled,
            ]}
            onPress={handleTranslate}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
            ) : (
              <Icon
                name="language"
                size={20}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
            )}
            <Text style={styles.translateButtonText}>
              {isLoading ? "Traduciendo..." : "Traducir"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Icon name="information-circle" size={24} color={theme.primary} />
            <Text style={styles.infoText}>
              Escribe una palabra o frase y presiona "Traducir" para ver su
              representación en lenguaje de señas.
            </Text>
          </View>
        </View>
      </View>
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
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingTop: 50,
      paddingBottom: 24,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    logo: {
      width: 220,
      height: 70,
      position: "relative",
      left: 30,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      fontWeight: "400",
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 24,
    },
    inputSection: {
      marginBottom: 32,
    },
    inputContainer: {
      position: "relative",
      marginBottom: 16,
    },
    textInput: {
      backgroundColor: theme.inputBackground,
      borderRadius: 16,
      padding: 20,
      fontSize: 16,
      color: theme.text,
      minHeight: 120,
      textAlignVertical: "top",
      borderWidth: 2,
      borderColor: theme.border,
      shadowColor: theme.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    clearButton: {
      position: "absolute",
      top: 16,
      right: 16,
      padding: 4,
    },
    translateButton: {
      backgroundColor: theme.primary,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 24,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    translateButtonDisabled: {
      backgroundColor: theme.placeholder,
      shadowOpacity: 0,
      elevation: 0,
    },
    buttonIcon: {
      marginRight: 8,
    },
    translateButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    infoSection: {
      flex: 1,
      justifyContent: "center",
    },
    infoCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 24,
      flexDirection: "row",
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
    infoText: {
      flex: 1,
      fontSize: 16,
      color: theme.textSecondary,
      lineHeight: 24,
      marginLeft: 16,
    },
  });

export default TranslateScreen;
