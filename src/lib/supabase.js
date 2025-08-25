import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
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