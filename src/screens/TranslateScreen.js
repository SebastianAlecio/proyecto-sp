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
  Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../utils/constants';

const { width } = Dimensions.get('window');

const TranslateScreen = () => {
  const [inputText, setInputText] = useState('');
  const [translatedLetters, setTranslatedLetters] = useState([]);
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

  const handleTranslate = () => {
    if (inputText.trim()) {
      // Convertir texto a array de letras (sin espacios por ahora)
      const letters = inputText.toLowerCase().replace(/[^a-z]/g, '').split('');
      setTranslatedLetters(letters);
      
      // Si hay más de 3 letras, mostrar animación de hint
      if (letters.length > 3) {
        setTimeout(() => {
          startScrollHintAnimation();
        }, 500); // Pequeño delay para que el usuario vea primero las letras
      }
    }
  };

  const clearText = () => {
    setInputText('');
    setTranslatedLetters([]);
  };

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
              placeholderTextColor="#A0A0A0"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={100}
            />
            {inputText.length > 0 && (
              <TouchableOpacity style={styles.clearButton} onPress={clearText}>
                <Icon name="close-circle" size={20} color="#A0A0A0" />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={[styles.translateButton, !inputText.trim() && styles.translateButtonDisabled]}
            onPress={handleTranslate}
            disabled={!inputText.trim()}
          >
            <Icon name="language" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.translateButtonText}>Traducir</Text>
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>Lenguaje de Señas</Text>
          
          {translatedLetters.length > 0 ? (
            <View style={styles.lettersWrapper}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.lettersContainer}
                contentContainerStyle={styles.lettersContent}
              >
                {translatedLetters.map((letter, index) => (
                  <View key={index} style={styles.letterCard}>
                    <View style={styles.letterImagePlaceholder}>
                      <Text style={styles.letterText}>{letter.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.letterLabel}>{letter.toUpperCase()}</Text>
                  </View>
                ))}
              </ScrollView>
              
              {/* Hint de scroll - solo aparece si hay más de 3 letras */}
              {translatedLetters.length > 3 && (
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
                  <Icon name="chevron-back" size={16} color={COLORS.primary} />
                  <Text style={styles.scrollHintText}>Desliza para ver más</Text>
                </Animated.View>
              )}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="hand-left" size={60} color="#E0E0E0" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    color: '#1A1A1A',
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 2,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
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
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  translateButtonDisabled: {
    backgroundColor: '#D0D0D0',
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
    color: '#1A1A1A',
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
    backgroundColor: '#FFFFFF',
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
  },
  letterImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  letterText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  letterLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#A0A0A0',
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default TranslateScreen;