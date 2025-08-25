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
import { wordsAPI } from '../lib/supabase';

const { width } = Dimensions.get('window');

const TranslateScreen = () => {
  const { theme } = useTheme();
  const [inputText, setInputText] = useState('');
  const [translatedSigns, setTranslatedSigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scrollHintAnim] = useState(new Animated.Value(0));
  const [expandedCard, setExpandedCard] = useState(null);

  // Animación para saber que el usuario puede hacer scroll
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
      { iterations: 2 } // Se repite 2 veces y se detiene
    ).start();
  };

  const handleTranslate = async () => {
    if (inputText.trim()) {
      setIsLoading(true);
      // Ocultar el teclado
      Keyboard.dismiss();
      
      try {
        // Dividir el texto en palabras
        const words = inputText.toLowerCase().trim().split(/\s+/);
        const allElements = [];
        
        for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
          const word = words[wordIndex];
          
          // Agregar espacio entre palabras (excepto la primera)
          if (wordIndex > 0) {
            allElements.push({ type: 'space', character: ' ' });
          }
          
          try {
            // Intentar buscar la palabra completa en videos
            const wordVideo = await wordsAPI.getWordVideo(word);
            
            // Si existe el video, agregarlo como palabra completa
            allElements.push({
              type: 'word',
              word: wordVideo.word,
              video_url: wordVideo.video_url,
              description: wordVideo.description,
              category: wordVideo.category
            });
            
          } catch (error) {
            // Si no existe el video, deletrear letra por letra
            const elements = [];
            
            for (let i = 0; i < word.length; i++) {
              const char = word[i];
              
              // Verificar si es RR o LL
              if (char === 'r' && word[i + 1] === 'r') {
                elements.push({ type: 'character', character: 'RR' });
                i++;
              } else if (char === 'l' && word[i + 1] === 'l') {
                elements.push({ type: 'character', character: 'LL' });
                i++;
              } else if (/[a-zñ0-9]/.test(char)) {
                elements.push({ type: 'character', character: char.toUpperCase() });
              }
            }
            
            // Obtener las señas de la base de datos solo para los caracteres
            const charactersOnly = elements.map(el => el.character);
            const signs = await signLanguageAPI.getSignsByCharacters(charactersOnly);
            
            // Agregar las letras al array principal
            elements.forEach((element, index) => {
              const sign = signs[index];
              if (sign) {
                allElements.push({ type: 'sign', ...sign });
              }
            });
          }
        }
        
        setTranslatedSigns(allElements);
      
        // Si hay más de 3 señas, mostrar animación del scroll, ya que se lo maximo que aparece en pantalla
        if (allElements.length > 3) {
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
    setExpandedCard(null);
  };

  const openExpandedCard = (sign, index) => {
    if (sign && ((sign.character && sign.image_url) || (sign.word && sign.video_url))) {
      setExpandedCard({ ...sign, index });
    }
  };

  const closeExpandedCard = () => {
    setExpandedCard(null);
  };

  const navigateCard = (direction) => {
    if (!expandedCard) return;
    
    // Obtener solo las señas con sus índices originales
    const signsOnly = translatedSigns
      .map((item, index) => ({ item, originalIndex: index }))
      .filter(({ item }) => 
        item.type !== 'space' && 
        ((item.character && item.image_url) || (item.word && item.video_url))
      );
    
    const currentSignIndex = signsOnly.findIndex(({ originalIndex }) => originalIndex === expandedCard.index);
    
    if (direction === 'next' && currentSignIndex < signsOnly.length - 1) {
      const nextSign = signsOnly[currentSignIndex + 1];
      setExpandedCard({ ...nextSign.item, index: nextSign.originalIndex });
    } else if (direction === 'prev' && currentSignIndex > 0) {
      const prevSign = signsOnly[currentSignIndex - 1];
      setExpandedCard({ ...prevSign.item, index: prevSign.originalIndex });
    }
  };

  const getNavigationInfo = () => {
    if (!expandedCard) return { current: 0, total: 0, canGoPrev: false, canGoNext: false };
    
    // Obtener solo las señas
    const signsOnly = translatedSigns
      .map((item, index) => ({ item, originalIndex: index }))
      .filter(({ item }) => 
        item.type !== 'space' && 
        ((item.character && item.image_url) || (item.word && item.video_url))
      );
    
    const currentSignIndex = signsOnly.findIndex(({ originalIndex }) => originalIndex === expandedCard.index);
    
    return {
      current: currentSignIndex + 1,
      total: signsOnly.length,
      canGoPrev: currentSignIndex > 0,
      canGoNext: currentSignIndex < signsOnly.length - 1
    };
  };

  const styles = createStyles(theme);

  // Si hay una tarjeta expandida, mostrar la vista expandida
  if (expandedCard) {
    const navInfo = getNavigationInfo();
    
    return (
      <View style={styles.expandedContainer}>
        {/* Header */}
        <View style={styles.expandedHeader}>
          <View style={styles.headerSpacer} />
          
          <View style={styles.expandedCounter}>
            <Text style={styles.expandedCounterText}>
              {navInfo.current} de {navInfo.total}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.expandedCloseButton}
            onPress={closeExpandedCard}
          >
            <Icon name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Contenido Principal */}
        <View style={styles.expandedMainContent}>
          {/* Botón Anterior */}
          {navInfo.canGoPrev && (
            <TouchableOpacity 
              style={[styles.navButton, styles.navButtonLeft]}
              onPress={() => navigateCard('prev')}
            >
              <Icon name="chevron-back" size={28} color={theme.text} />
            </TouchableOpacity>
          )}

          {/* Botón Siguiente */}
          {navInfo.canGoNext && (
            <TouchableOpacity 
              style={[styles.navButton, styles.navButtonRight]}
              onPress={() => navigateCard('next')}
            >
              <Icon name="chevron-forward" size={28} color={theme.text} />
            </TouchableOpacity>
          )}

          {/* Tarjeta Expandida */}
          <View style={styles.expandedCard}>
            {expandedCard.type === 'word' ? (
              // Mostrar video para palabras completas
              <View style={styles.expandedVideoContainer}>
                <Text style={styles.expandedWordTitle}>Video no disponible en preview</Text>
                <Text style={styles.expandedVideoNote}>
                  URL: {expandedCard.video_url}
                </Text>
              </View>
            ) : (
              // Mostrar imagen para letras
              <View style={styles.expandedImageContainer}>
                <Image
                  source={{ uri: expandedCard.image_url }}
                  style={styles.expandedSignImage}
                  resizeMode="contain"
                />
              </View>
            )}
            
            <View style={styles.expandedCardInfo}>
              {expandedCard.type === 'word' ? (
                <>
                  <Text style={styles.expandedCharacter}>
                    {expandedCard.word}
                  </Text>
                  <Text style={styles.expandedType}>
                    {expandedCard.category}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.expandedCharacter}>
                    {expandedCard.character}
                  </Text>
                  <Text style={styles.expandedType}>
                    {expandedCard.type === 'letter' ? 'Letra' : 
                     expandedCard.type === 'number' ? 'Número' : 'Especial'}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }

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
                  
                  // Renderizar palabras completas
                  if (element.type === 'word') {
                    return (
                      <TouchableOpacity 
                        key={`${element.word}-${index}`} 
                        style={[styles.letterCard, styles.wordCard]}
                        onPress={() => {
                          openExpandedCard(element, index);
                        }}
                        activeOpacity={0.7}
                        accessible={true}
                        accessibilityRole="button"
                      >
                        <View style={[styles.letterImageContainer, styles.wordImageContainer]}>
                          <Icon name="play-circle" size={40} color={theme.primary} />
                        </View>
                        <Text style={styles.letterLabel}>{element.word}</Text>
                        <Text style={styles.signType}>
                          {element.category}
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                  
                  // Renderizar letras individuales
                  return (
                    <TouchableOpacity 
                      key={`${element.character}-${index}`} 
                      style={styles.letterCard}
                      onPress={() => {
                        openExpandedCard(element, index);
                      }}
                      activeOpacity={0.7}
                      accessible={true}
                      accessibilityRole="button"
                    >
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
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              
              {/* scroll solo aparece si hay más de 3 señas */}
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
    zIndex: 0,
  },
  lettersContent: {
    paddingVertical: 8,
    paddingHorizontal: 4,
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
    minHeight: 120,
    zIndex: 1,
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
    justifyContent: 'center',
    width: 40,
  },
  spaceText: {
    fontSize: 24,
    color: theme.textSecondary,
    fontWeight: 'bold',
  },
  // Expanded View Styles
  expandedContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  expandedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  expandedCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedCounter: {
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  expandedCounterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 44,
  },
  expandedMainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  navButtonLeft: {
    left: 24,
  },
  navButtonRight: {
    right: 24,
  },
  expandedCard: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  expandedImageContainer: {
    width: 200,
    height: 200,
    backgroundColor: theme.background,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: theme.primary,
    overflow: 'hidden',
  },
  expandedSignImage: {
    width: '100%',
    height: '100%',
  },
  expandedCardInfo: {
    alignItems: 'center',
  },
  expandedCharacter: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.primary,
    marginBottom: 8,
  },
  expandedType: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  expandedDescription: {
    fontSize: 16,
    color: theme.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Estilos para palabras completas
  wordCard: {
    backgroundColor: theme.primary + '10',
    borderWidth: 2,
    borderColor: theme.primary,
  },
  wordImageContainer: {
    backgroundColor: theme.primary + '20',
    borderColor: theme.primary,
  },
  expandedVideoContainer: {
    width: 200,
    height: 200,
    backgroundColor: theme.background,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: theme.primary,
  },
  expandedWordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  expandedVideoNote: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
  },
});

export default TranslateScreen;