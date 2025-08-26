import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { signLanguageAPI } from '../lib/supabase';
import { wordsAPI } from '../lib/supabase';
import { getInfinitiveForm } from '../utils/verbConjugations';

const TranslateScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTranslate = async () => {
    if (inputText.trim()) {
      setIsLoading(true);
      // Ocultar el teclado
      Keyboard.dismiss();
      
      try {
        // Dividir el texto en palabras
        const words = inputText.toLowerCase().trim().split(/\s+/);
        const translatedWords = [];
        
        for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
          const word = words[wordIndex];
          
          console.log(`🔍 Procesando palabra: "${word}"`);
          
          // Primero verificar si existe la palabra original (manteniendo tildes)
          let wordExists = false;
          try {
            wordExists = await wordsAPI.checkWordExists(word);
            console.log(`📝 Palabra "${word}" existe en DB:`, wordExists);
          } catch (error) {
            console.log(`❌ Error buscando "${word}":`, error.message);
          }
          
          if (wordExists) {
            // Si existe, obtener el video (manteniendo tildes)
            try {
              const wordVideo = await wordsAPI.getWordVideo(word);
              console.log(`🎥 Video encontrado para "${word}":`, wordVideo.word);
            
              translatedWords.push({
                originalWord: word,
                hasVideo: true,
                signs: [{
                  type: 'word',
                  word: wordVideo.word,
                  video_url: wordVideo.video_url,
                  description: wordVideo.description,
                  category: wordVideo.category
                }]
              });
            } catch (error) {
              console.log(`❌ Error obteniendo video para "${word}":`, error.message);
              // Si hay error, deletrear (aquí sí normalizamos para deletreo)
              const wordSigns = await getSpelledWord(word);
              translatedWords.push({
                originalWord: word,
                hasVideo: false,
                signs: wordSigns
              });
            }
          } else {
            // Si no existe, verificar si es una conjugación (normalizar solo para buscar)
            const infinitiveForm = getInfinitiveForm(word);
            console.log(`🔄 Forma infinitiva de "${word}": "${infinitiveForm}"`);
            
            if (infinitiveForm !== word.toLowerCase()) {
              // Es una conjugación, verificar si existe el infinitivo (manteniendo tildes del infinitivo)
              let infinitiveExists = false;
              try {
                infinitiveExists = await wordsAPI.checkWordExists(infinitiveForm);
                console.log(`📝 Infinitivo "${infinitiveForm}" existe en DB:`, infinitiveExists);
              } catch (error) {
                console.log(`❌ Error buscando infinitivo "${infinitiveForm}":`, error.message);
              }
              
              if (infinitiveExists) {
                try {
                  const wordVideo = await wordsAPI.getWordVideo(infinitiveForm);
                  console.log(`🎥 Video encontrado para infinitivo "${infinitiveForm}":`, wordVideo.word);
                
                  translatedWords.push({
                    originalWord: word,
                    hasVideo: true,
                    signs: [{
                      type: 'word',
                      word: wordVideo.word,
                      video_url: wordVideo.video_url,
                      description: wordVideo.description,
                      category: wordVideo.category
                    }]
                  });
                } catch (error) {
                  console.log(`❌ Error obteniendo video para infinitivo "${infinitiveForm}":`, error.message);
                  // Si hay error, deletrear (aquí sí normalizamos)
                  const wordSigns = await getSpelledWord(word);
                  translatedWords.push({
                    originalWord: word,
                    hasVideo: false,
                    signs: wordSigns
                  });
                }
              } else {
                // No existe ni la palabra ni su infinitivo, deletrear (aquí sí normalizamos)
                console.log(`📝 Deletreando "${word}" - no encontrado en DB`);
                const wordSigns = await getSpelledWord(word);
                translatedWords.push({
                  originalWord: word,
                  hasVideo: false,
                  signs: wordSigns
                });
              }
            } else {
              // No es una conjugación conocida, deletrear (aquí sí normalizamos)
              console.log(`📝 Deletreando "${word}" - no es conjugación conocida`);
              const wordSigns = await getSpelledWord(word);
              translatedWords.push({
                originalWord: word,
                hasVideo: false,
                signs: wordSigns
              });
            }
          }
        }
        
        // Navegar a la pantalla de resultados
        navigation.navigate('TranslationResults', {
          translatedWords,
          originalText: inputText.trim()
        });
        
      } catch (error) {
        console.error('Error translating text:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Función auxiliar para deletrear palabras
  const getSpelledWord = async (word) => {
    console.log(`🔤 Deletreando palabra: "${word}"`);
    const elements = [];
    
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      // Normalizar caracteres con tildes para deletreo
      const normalizedChar = char.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      console.log(`🔤 Caracter "${char}" → normalizado "${normalizedChar}"`);
      
      // Verificar si es RR o LL
      if (normalizedChar === 'r' && word[i + 1] === 'r') {
        elements.push({ type: 'character', character: 'RR' });
        i++;
      } else if (normalizedChar === 'l' && word[i + 1] === 'l') {
        elements.push({ type: 'character', character: 'LL' });
        i++;
      } else if (/[a-zñ0-9]/.test(normalizedChar)) {
        elements.push({ type: 'character', character: normalizedChar.toUpperCase() });
      }
    }
    
    // Obtener las señas de la base de datos solo para los caracteres
    const charactersOnly = elements.map(el => el.character);
    const signs = await signLanguageAPI.getSignsByCharacters(charactersOnly);
    
    // Crear array de señas para esta palabra
    const wordSigns = [];
    elements.forEach((element, index) => {
      const sign = signs[index];
      if (sign) {
        wordSigns.push({ type: 'sign', ...sign });
      }
    });
    
    return wordSigns;
  };

  const clearText = () => {
    setInputText('');
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Traductor</Text>
        <Text style={styles.headerSubtitle}>Texto a Lenguaje de Señas</Text>
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
              (!inputText.trim() || isLoading) && styles.translateButtonDisabled
            ]}
            onPress={handleTranslate}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" style={styles.buttonIcon} />
            ) : (
              <Icon name="language" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            )}
            <Text style={styles.translateButtonText}>
              {isLoading ? 'Traduciendo...' : 'Traducir'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Icon name="information-circle" size={24} color={theme.primary} />
            <Text style={styles.infoText}>
              Escribe una palabra o frase y presiona "Traducir" para ver su representación en lenguaje de señas.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme) => StyleSheet.create({
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
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    fontWeight: '400',
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
    position: 'relative',
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: theme.inputBackground,
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    color: theme.text,
    minHeight: 120,
    textAlignVertical: 'top',
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
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  translateButton: {
    backgroundColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  infoCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
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