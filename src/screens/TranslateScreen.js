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
  ActivityIndicator,
  Modal,
  StatusBar
  Modal,
  StatusBar
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
  const [expandedCardIndex, setExpandedCardIndex] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [expandedCardIndex, setExpandedCardIndex] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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
    setExpandedCardIndex(null);
    setModalVisible(false);
  };

  const openExpandedCard = (index) => {
    // Solo abrir si es una seña (no un espacio)
    if (translatedSigns[index] && translatedSigns[index].type === 'sign') {
      setExpandedCardIndex(index);
      setModalVisible(true);
    }
  };

  const closeExpandedCard = () => {
    setModalVisible(false);
    setExpandedCardIndex(null);
  };

  const navigateCard = (direction) => {
    if (expandedCardIndex === null) return;
    
    const signsOnly = translatedSigns
      .map((item, index) => ({ item, originalIndex: index }))
      .filter(({ item }) => item.type === 'sign');
    
    const currentSignIndex = signsOnly.findIndex(({ originalIndex }) => originalIndex === expandedCardIndex);
    
    if (direction === 'next' && currentSignIndex < signsOnly.length - 1) {
      setExpandedCardIndex(signsOnly[currentSignIndex + 1].originalIndex);
    } else if (direction === 'prev' && currentSignIndex > 0) {
      setExpandedCardIndex(signsOnly[currentSignIndex - 1].originalIndex);
    }
  };

  const getCurrentSign = () => {
    if (expandedCardIndex !== null && translatedSigns[expandedCardIndex]) {
      return translatedSigns[expandedCardIndex];
    }
    return null;
  };

  const getNavigationInfo = () => {
    if (expandedCardIndex === null) return { current: 0, total: 0, canGoPrev: false, canGoNext: false };
    
    const signsOnly = translatedSigns
      .map((item, index) => ({ item, originalIndex: index }))
      .filter(({ item }) => item.type === 'sign');
    
    const currentSignIndex = signsOnly.findIndex(({ originalIndex }) => originalIndex === expandedCardIndex);
    
    return {
      current: currentSignIndex + 1,
      total: signsOnly.length,
      canGoPrev: currentSignIndex > 0,
      canGoNext: currentSignIndex < signsOnly.length - 1
    };
  };

  const openExpandedCard = (index) => {
    // Solo abrir si es una seña (no un espacio)
    if (translatedSigns[index] && translatedSigns[index].type === 'sign') {
      setExpandedCardIndex(index);
      setModalVisible(true);
    }
  };

  const closeExpandedCard = () => {
    setModalVisible(false);
    setExpandedCardIndex(null);
  };

  const navigateCard = (direction) => {
    if (expandedCardIndex === null) return;
    
    const signsOnly = translatedSigns
      .map((item, index) => ({ item, originalIndex: index }))
      .filter(({ item }) => item.type === 'sign');
    
    const currentSignIndex = signsOnly.findIndex(({ originalIndex }) => originalIndex === expandedCardIndex);
    
    if (direction === 'next' && currentSignIndex < signsOnly.length - 1) {
      setExpandedCardIndex(signsOnly[currentSignIndex + 1].originalIndex);
    } else if (direction === 'prev' && currentSignIndex > 0) {
      setExpandedCardIndex(signsOnly[currentSignIndex - 1].originalIndex);
    }
  };

  const getCurrentSign = () => {
    if (expandedCardIndex !== null && translatedSigns[expandedCardIndex]) {
      return translatedSigns[expandedCardIndex];
    }
    return null;
  };

  const getNavigationInfo = () => {
    if (expandedCardIndex === null) return { current: 0, total: 0, canGoPrev: false, canGoNext: false };
    
    const signsOnly = translatedSigns
      .map((item, index) => ({ item, originalIndex: index }))
      .filter(({ item }) => item.type === 'sign');
    
    const currentSignIndex = signsOnly.findIndex(({ originalIndex }) => originalIndex === expandedCardIndex);
    
    return {
      current: currentSignIndex + 1,
      total: signsOnly.length,
      canGoPrev: currentSignIndex > 0,
      canGoNext: currentSignIndex < signsOnly.length - 1
    };
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
                    <TouchableOpacity 
                      key={`${element.character}-${index}`} 
                      style={styles.letterCard}
                      onPress={() => openExpandedCard(index)}
                      activeOpacity={0.7}
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

      {/* Modal para tarjeta expandida */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeExpandedCard}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={closeExpandedCard}
          >
            <View style={styles.modalContent}>
              {/* Header del Modal */}
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={closeExpandedCard}
                >
                  <Icon name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                
                <View style={styles.modalCounter}>
                  <Text style={styles.modalCounterText}>
                    {getNavigationInfo().current} de {getNavigationInfo().total}
                  </Text>
                </View>
                
                <View style={styles.headerSpacer} />
              </View>

              {/* Contenido Principal */}
              <View style={styles.modalMainContent}>
                {/* Botón Anterior */}
                {getNavigationInfo().canGoPrev && (
                  <TouchableOpacity 
                    style={[styles.navButton, styles.navButtonLeft]}
                    onPress={() => navigateCard('prev')}
                  >
                    <Icon name="chevron-back" size={28} color="#FFFFFF" />
                  </TouchableOpacity>
                )}

                {/* Botón Siguiente */}
                {getNavigationInfo().canGoNext && (
                  <TouchableOpacity 
                    style={[styles.navButton, styles.navButtonRight]}
                    onPress={() => navigateCard('next')}
                  >
                    <Icon name="chevron-forward" size={28} color="#FFFFFF" />
                  </TouchableOpacity>
                )}

                {/* Tarjeta Expandida */}
                <TouchableOpacity 
                  activeOpacity={1} 
                  style={styles.expandedCard}
                  onPress={(e) => e.stopPropagation()}
                >
                  {getCurrentSign() && (
                    <>
                      <View style={styles.expandedImageContainer}>
                        <Image
                          source={{ uri: getCurrentSign().image_url }}
                          style={styles.expandedSignImage}
                          resizeMode="contain"
                        />
                      </View>
                      
                      <View style={styles.expandedCardInfo}>
                        <Text style={styles.expandedCharacter}>
                          {getCurrentSign().character}
                        </Text>
                        <Text style={styles.expandedType}>
                          {getCurrentSign().type === 'letter' ? 'Letra' : 
                           getCurrentSign().type === 'number' ? 'Número' : 'Especial'}
                        </Text>
                        <Text style={styles.expandedDescription}>
                          {getCurrentSign().description}
                        </Text>
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
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
    
    justifyContent: 'center',
    width: 40,
  },
  spaceText: {
    fontSize: 24,
    color: theme.textSecondary,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCounter: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalCounterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalHeaderSpacer: {
    width: 44,
  },
  modalMainContent: {
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  navButtonLeft: {
    left: 24,
  },
  navButtonRight: {
    right: 24,
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  expandedCard: {
    backgroundColor: '#FFFFFF',
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
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  expandedImageContainer: {
    width: 200,
    height: 200,
    backgroundColor: '#F8F9FA',
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
    color: '#666666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  expandedDescription: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default TranslateScreen;