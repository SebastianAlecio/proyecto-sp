import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getInfinitiveForm, normalizeWord } from '../utils/verbConjugations';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const signLanguageAPI = {
  // Get all letters
  async getAllLetters() {
    const { data, error } = await supabase
      .from('letters')
      .select('*')
      .eq('type', 'letter')
      .order('character');
    
    if (error) throw error;
    return data;
  },

  // Get all numbers
  async getAllNumbers() {
    const { data, error } = await supabase
      .from('letters')
      .select('*')
      .eq('type', 'number')
      .order('character');
    
    if (error) throw error;
    return data;
  },

  // Get special characters (RR, LL)
  async getSpecialCharacters() {
    const { data, error } = await supabase
      .from('letters')
      .select('*')
      .eq('type', 'special')
      .order('character');
    
    if (error) throw error;
    return data;
  },

  // Get sign by character
  async getSignByCharacter(character) {
    const { data, error } = await supabase
      .from('letters')
      .select('*')
      .eq('character', character.toUpperCase())
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get multiple signs by characters (for translating words)
  async getSignsByCharacters(characters) {
    const upperCaseChars = characters.map(char => char.toUpperCase());
    
    const { data, error } = await supabase
      .from('letters')
      .select('*')
      .in('character', upperCaseChars);
    
    if (error) throw error;
    
    // Return in the same order as requested
    return upperCaseChars.map(char => 
      data.find(item => item.character === char)
    ).filter(Boolean);
  },

  // Get all signs (letters, numbers, and special)
  async getAllSigns() {
    const { data, error } = await supabase
      .from('letters')
      .select('*')
      .order('type', { ascending: true })
      .order('character', { ascending: true });
    
    if (error) throw error;
    return data;
  },

};

// Words API for complete sign language words
export const wordsAPI = {
  // Check if a word exists in the database
  async checkWordExists(word) {
    // Primero intentar con la palabra original
    const { data, error } = await supabase
      .from('words')
      .select('word')
      .ilike('word', word.toLowerCase())
      .single();
    
    if (!error && data) {
      return true;
    }
    
    // Si no se encuentra, intentar con la forma infinitiva
    const infinitiveForm = getInfinitiveForm(word);
    if (infinitiveForm !== word.toLowerCase()) {
      const { data: infinitiveData, error: infinitiveError } = await supabase
        .from('words')
        .select('word')
        .ilike('word', infinitiveForm)
        .single();
      
      if (!infinitiveError && infinitiveData) {
        return true;
      }
    }
    
    return false;
  },

  // Get word video by word
  async getWordVideo(word) {
    // Primero intentar con la palabra original
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .ilike('word', word.toLowerCase())
      .single();
    
    if (!error && data) {
      return data;
    }
    
    // Si no se encuentra, intentar con la forma infinitiva (para verbos conjugados)
    const infinitiveForm = getInfinitiveForm(word);
    if (infinitiveForm !== word.toLowerCase()) {
      const { data: infinitiveData, error: infinitiveError } = await supabase
        .from('words')
        .select('*')
        .ilike('word', infinitiveForm)
        .single();
      
      if (!infinitiveError && infinitiveData) {
        return infinitiveData;
      }
    }
    
    // Si no se encuentra de ninguna manera, lanzar el error original
    throw error;
  },

  // Get words by category
  async getWordsByCategory(category) {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .ilike('category', category)
      .order('word');
    
    if (error) throw error;
    return data;
  },

  // Get all words
  async getAllWords() {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .order('category')
      .order('word');
    
    if (error) throw error;
    return data;
  },

  // Get all categories
  async getAllCategories() {
    const { data, error } = await supabase
      .from('words')
      .select('category')
      .order('category');
    
    if (error) throw error;
    return [...new Set(data.map(item => item.category))];
  },
};