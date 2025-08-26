import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated
} from 'react-native';
import { Video } from 'expo-av';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const TranslationResultsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { translatedWords, originalText } = route.params;
  const [expandedCard, setExpandedCard] = useState(null);

  const openExpandedCard = (sign, wordIndex, signIndex) => {
    if (sign && ((sign.character && sign.image_url) || (sign.word && sign.video_url))) {
      setExpandedCard({ ...sign, wordIndex, signIndex });
    }
  };

  const closeExpandedCard = () => {
    setExpandedCard(null);
  };

  const navigateCard = (direction) => {
    if (!expandedCard) return;
    
    // Obtener todas las señas navegables
    const allSigns = [];
    translatedWords.forEach((wordData, wordIndex) => {
      wordData.signs.forEach((sign, signIndex) => {
        if (sign.type !== 'space' && 
            ((sign.character && sign.image_url) || (sign.word && sign.video_url))) {
          allSigns.push({ ...sign, wordIndex, signIndex });
        }
      });
    });
    
    const currentIndex = allSigns.findIndex(sign => 
      sign.wordIndex === expandedCard.wordIndex && 
      sign.signIndex === expandedCard.signIndex
    );
    
    if (direction === 'next' && currentIndex < allSigns.length - 1) {
      setExpandedCard(allSigns[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      setExpandedCard(allSigns[currentIndex - 1]);
    }
  };

  const getNavigationInfo = () => {
    if (!expandedCard) return { current: 0, total: 0, canGoPrev: false, canGoNext: false };
    
    const allSigns = [];
    translatedWords.forEach((wordData, wordIndex) => {
      wordData.signs.forEach((sign, signIndex) => {
        if (sign.type !== 'space' && 
            ((sign.character && sign.image_url) || (sign.word && sign.video_url))) {
          allSigns.push({ ...sign, wordIndex, signIndex });
        }
      });
    });
    
    const currentIndex = allSigns.findIndex(sign => 
      sign.wordIndex === expandedCard.wordIndex && 
      sign.signIndex === expandedCard.signIndex
    );
    
    return {
      current: currentIndex + 1,
      total: allSigns.length,
      canGoPrev: currentIndex > 0,
      canGoNext: currentIndex < allSigns.length - 1
    };
  };

  const styles = createStyles(theme);

  // Vista expandida
  if (expandedCard) {
    const navInfo = getNavigationInfo();
    
    return (
      <View style={styles.expandedContainer}>
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

        <View style={styles.expandedMainContent}>
          {navInfo.canGoPrev && (
            <TouchableOpacity 
              style={[styles.navButton, styles.navButtonLeft]}
              onPress={() => navigateCard('prev')}
            >
              <Icon name="chevron-back" size={28} color={theme.text} />
            </TouchableOpacity>
          )}

          {navInfo.canGoNext && (
            <TouchableOpacity 
              style={[styles.navButton, styles.navButtonRight]}
              onPress={() => navigateCard('next')}
            >
              <Icon name="chevron-forward" size={28} color={theme.text} />
            </TouchableOpacity>
          )}

          <View style={styles.expandedCard}>
            {expandedCard.type === 'word' ? (
              <View style={styles.expandedVideoContainer}>
                <Video
                  source={{ uri: expandedCard.video_url }}
                  style={styles.expandedVideo}
                  useNativeControls
                  resizeMode="contain"
                  isLooping={true}
                  shouldPlay={true}
                />
              </View>
            ) : (
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Traducción</Text>
          <Text style={styles.headerSubtitle}>"{originalText}"</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Results */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {translatedWords.map((wordData, wordIndex) => (
          <View key={`word-${wordIndex}`} style={styles.wordSection}>
            {/* Word Label */}
            <View style={styles.wordLabelContainer}>
              <Text style={styles.wordLabel}>{wordData.originalWord}</Text>
              <View style={styles.wordLabelLine} />
            </View>

            {/* Signs Container */}
            <View style={styles.signsContainer}>
              {wordData.hasVideo ? (
                // Mostrar video de palabra completa
                <View style={styles.videoSection}>
                  <TouchableOpacity 
                    style={styles.videoCard}
                    onPress={() => openExpandedCard(wordData.signs[0], wordIndex, 0)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.videoContainer}>
                      <Video
                        source={{ uri: wordData.signs[0].video_url }}
                        style={styles.video}
                        resizeMode="contain"
                        isLooping={true}
                        shouldPlay={false}
                      />
                      <View style={styles.videoOverlay}>
                        <Icon name="play-circle" size={48} color="rgba(255,255,255,0.9)" />
                      </View>
                    </View>
                    <View style={styles.videoInfo}>
                      <Text style={styles.videoTitle}>{wordData.signs[0].word}</Text>
                      <Text style={styles.videoCategory}>{wordData.signs[0].category}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ) : (
                // Mostrar deletreo con letras
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.lettersScroll}
                  contentContainerStyle={styles.lettersContent}
                >
                  {wordData.signs.map((sign, signIndex) => {
                    if (sign.type === 'space') {
                      return (
                        <View key={`space-${wordIndex}-${signIndex}`} style={styles.spaceIndicator}>
                          <Text style={styles.spaceText}>•</Text>
                        </View>
                      );
                    }
                    
                    return (
                      <TouchableOpacity 
                        key={`${sign.character}-${wordIndex}-${signIndex}`} 
                        style={styles.letterCard}
                        onPress={() => openExpandedCard(sign, wordIndex, signIndex)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.letterImageContainer}>
                          <Image
                            source={{ uri: sign.image_url }}
                            style={styles.signImage}
                            resizeMode="contain"
                          />
                        </View>
                        <Text style={styles.letterLabel}>{sign.character}</Text>
                        <Text style={styles.signType}>
                          {sign.type === 'letter' ? 'Letra' : 
                           sign.type === 'number' ? 'Número' : 'Especial'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    fontStyle: 'italic',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  wordSection: {
    marginBottom: 32,
  },
  wordLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  wordLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginRight: 12,
    minWidth: 80,
  },
  wordLabelLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.border,
  },
  signsContainer: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  // Video Styles
  videoSection: {
    padding: 20,
  },
  videoCard: {
    alignItems: 'center',
  },
  videoContainer: {
    width: width - 88, // Full width minus padding
    height: (width - 88) * 0.6, // 16:10 aspect ratio
    backgroundColor: theme.background,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  videoInfo: {
    alignItems: 'center',
  },
  videoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.primary,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  videoCategory: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Letters Styles
  lettersScroll: {
    paddingVertical: 20,
  },
  lettersContent: {
    paddingHorizontal: 20,
  },
  letterCard: {
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: theme.background,
    borderRadius: 12,
    padding: 12,
    minWidth: 80,
    minHeight: 100,
  },
  letterImageContainer: {
    width: 60,
    height: 60,
    backgroundColor: theme.surface,
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
  expandedVideoContainer: {
    width: 250,
    height: 200,
    backgroundColor: theme.background,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 3,
    borderColor: theme.primary,
    overflow: 'hidden',
  },
  expandedVideo: {
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
});

export default TranslationResultsScreen;

export default TranslationResultsScreen