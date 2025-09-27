import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Dimensions
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { wordsAPI } from '../lib/supabase';

const { width } = Dimensions.get('window');

const DatasetCategoryScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { category, categoryName, categoryColor } = route.params;
  const [words, setWords] = useState([]);
  const [filteredWords, setFilteredWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedWord, setExpandedWord] = useState(null);

  // Crear video players para todas las palabras
  const videoPlayers = {};
  words.forEach(word => {
    if (word.video_url) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      videoPlayers[word.id] = useVideoPlayer(word.video_url, player => {
        player.loop = true;
        player.play();
      });
    }
  });

  useEffect(() => {
    loadCategoryWords();
  }, []);

  useEffect(() => {
    filterWords();
  }, [searchQuery, words]);

  const loadCategoryWords = async () => {
    try {
      setIsLoading(true);
      const categoryWords = await wordsAPI.getWordsByCategory(category);
      setWords(categoryWords);
    } catch (error) {
      console.error('Error loading category words:', error);
      setWords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterWords = () => {
    if (!searchQuery.trim()) {
      setFilteredWords(words);
    } else {
      const filtered = words.filter(word =>
        word.word.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredWords(filtered);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const toggleWordExpansion = (wordId) => {
    setExpandedWord(expandedWord === wordId ? null : wordId);
  };

  const styles = createStyles(theme, categoryColor);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{categoryName}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={categoryColor} />
          <Text style={styles.loadingText}>Cargando palabras...</Text>
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
          <Icon name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{categoryName}</Text>
          <Text style={styles.headerSubtitle}>
            {filteredWords.length} palabra{filteredWords.length !== 1 ? 's' : ''} disponible{filteredWords.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color={theme.placeholder} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar palabras..."
            placeholderTextColor={theme.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <Icon name="close-circle" size={20} color={theme.placeholder} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Words List */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {filteredWords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="search" size={64} color={theme.placeholder} />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No se encontraron palabras' : 'No hay palabras disponibles'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery 
                ? `No hay palabras que coincidan con "${searchQuery}"`
                : 'Esta categoría aún no tiene palabras agregadas'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.wordsContainer}>
            {filteredWords.map((word) => (
              <TouchableOpacity
                key={word.id}
                style={[
                  styles.wordCard,
                  expandedWord === word.id && styles.wordCardExpanded
                ]}
                onPress={() => toggleWordExpansion(word.id)}
                activeOpacity={0.7}
              >
                {/* Word Header */}
                <View style={styles.wordHeader}>
                  <View style={styles.wordInfo}>
                    <Text style={styles.wordTitle}>{word.word}</Text>
                    <Text style={styles.wordDescription}>{word.description}</Text>
                  </View>
                  <Icon 
                    name={expandedWord === word.id ? "chevron-up" : "chevron-down"} 
                    size={24} 
                    color={theme.textSecondary} 
                  />
                </View>

                {/* Expanded Content */}
                {expandedWord === word.id && (
                  <View style={styles.expandedContent}>
                    <View style={styles.videoContainer}>
                      <VideoView
                        style={styles.video}
                        player={videoPlayers[word.id]}
                        allowsFullscreen
                        allowsPictureInPicture
                      />
                    </View>
                    
                    <View style={styles.wordDetails}>
                      <View style={styles.detailRow}>
                        <Icon name="bookmark" size={16} color={categoryColor} />
                        <Text style={styles.detailText}>Categoría: {categoryName}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Icon name="videocam" size={16} color={categoryColor} />
                        <Text style={styles.detailText}>Video disponible</Text>
                      </View>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme, categoryColor) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
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
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: theme.border,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 32,
  },
  wordsContainer: {
    gap: 12,
  },
  wordCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  wordCardExpanded: {
    borderWidth: 2,
    borderColor: categoryColor + '40',
  },
  wordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordInfo: {
    flex: 1,
  },
  wordTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  wordDescription: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  expandedContent: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  videoContainer: {
    width: '100%',
    height: 200,
    backgroundColor: theme.background,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  wordDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: theme.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default DatasetCategoryScreen;