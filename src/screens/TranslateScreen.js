import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  Dimensions,
  Animated,
  Keyboard,
  Image,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { signLanguageAPI } from '../lib/supabase';

const { width } = Dimensions.get('window');

const TranslateScreen = () => {
  const { theme } = useTheme();
  const [inputText, setInputText] = useState('');
  const [translatedSigns, setTranslatedSigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scrollHintAnim] = useState(new Animated.Value(0));

  // Animación para el hint de scroll
  const startScrollHintAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scrollHintAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scrollHintAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 3 } // Se repite 3 veces y se detiene
    ).start();
  };

  const handleTranslate = async () => {
    if (inputText.trim()) {
      setIsLoading(true);
      // Ocultar el teclado
      Keyboard.dismiss();
      
      try {
        // Convertir texto a array de caracteres y espacios
        const text = inputText.toLowerCase();
        const elements = [];
        
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          
          // Si es un espacio, agregarlo como separador
          if (char === ' ') {
            elements.push({ type: 'space', character: ' ' });
            continue;
          }
          
          // Verificar si es RR o LL
          if (char === 'r' && text[i + 1] === 'r') {
            elements.push({ type: 'character', character: 'RR' });
            i++; // Saltar el siguiente 'r'
          } else if (char === 'l' && text[i + 1] === 'l') {
            elements.push({ type: 'character', character: 'LL' });
            i++; // Saltar el siguiente 'l'
          } else if (/[a-zñ0-9]/.test(char)) {
            elements.push({ type: 'character', character: char.toUpperCase() });
          }
        }
        
        // Separar caracteres de espacios
        const charactersOnly = elements
          .filter(el => el.type === 'character')
          .map(el => el.character);
        
        // Obtener las señas de la base de datos solo para los caracteres
        const signs = await signLanguageAPI.getSignsByCharacters(charactersOnly);
        
        // Crear el array final mezclando señas y espacios
        let signIndex = 0;
        const finalElements = elements.map(element => {
          if (element.type === 'space') {
            return { type: 'space', character: ' ' };
          } else {
            const sign = signs[signIndex];
            signIndex++;
            return { type: 'sign', ...sign };
          }
        });
        
        setTranslatedSigns(finalElements);
      
        // Si hay más de 3 señas, mostrar animación de hint
        if (finalElements.length > 3) {
          setTimeout(() => {
            startScrollHintAnimation();
          }, 500);
        }
      } catch (error) {
        console.error('Error translating text:', error);
        // En caso de error, mostrar mensaje al usuario
        setTranslatedSigns([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const clearText = () => {
    setInputText('');
    setTranslatedSigns([]);
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

        {/* Results Section */}
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>Lenguaje de Señas</Text>
          
          {translatedSigns.length > 0 ? (
            <View style={styles.lettersWrapper}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.lettersContainer}
                contentContainerStyle={styles.lettersContent}
              >
                {translatedSigns.map((element, index) => {
                  if (element.type === 'space') {
                    return (
                      <View key={`space-${index}`} style={styles.spaceIndicator}>
                        <Text style={styles.spaceText}>•</Text>
                      </View>
                    );
                  }
                  
                  return (
                    <View key={`${element.character}-${index}`} style={styles.letterCard}>
                      <View style={styles.letterImageContainer}>
                        <Image
                          source={{ uri: element.image_url }}
                          style={styles.signImage}
                          resizeMode="contain"
                        />
                      </View>
                      <Text style={styles.letterLabel}>{element.character}</Text>
                      <Text style={styles.signType}>
                        {element.type === 'letter' ? 'Letra' : 
                         element.type === 'number' ? 'Número' : 'Especial'}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
              
              {/* Hint de scroll - solo aparece si hay más de 3 señas */}
              {translatedSigns.length > 3 && (
                <Animated.View 
                  style={[
                    styles.scrollHint,
                    {
                      opacity: scrollHintAnim,
                      transform: [{
                        translateX: scrollHintAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -10]
                        })
                      }]
                    }
                  ]}
                >
                  <Icon name="chevron-back" size={16} color={theme.primary} />
                  <Text style={styles.scrollHintText}>Desliza para ver más</Text>
                </Animated.View>
              )}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="hand-left" size={60} color={theme.emptyStateIcon} />
              <Text style={styles.emptyStateText}>
                Escribe un mensaje para ver las señas
              </Text>
            </View>
          )}
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
  resultsSection: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },
  lettersWrapper: {
    flex: 1,
    position: 'relative',
  },
  lettersContainer: {
    flex: 1,
  },
  lettersContent: {
    paddingVertical: 8,
  },
  letterCard: {
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 100,
  },
  letterImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: theme.background,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: theme.primary,
    overflow: 'hidden',
  },
  signImage: {
    width: '100%',
    height: '100%',
  },
  letterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  signType: {
    fontSize: 10,
    fontWeight: '500',
    color: theme.textSecondary,
    textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.placeholder,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  scrollHint: {
    position: 'absolute',
    right: 16,
    top: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.scrollHintBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollHintText: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  spaceIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    paddingVertical: 10,
    width: 40,
  },
  spaceText: {
    fontSize: 24,
    color: theme.textSecondary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default TranslateScreen;