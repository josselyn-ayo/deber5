import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
 
const supabaseUrl     = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
 
/**
 * Adaptador que conecta el sistema de storage de Supabase Auth
 * con SecureStore de Expo (encriptado con el KeyStore de Android).
 * Cada clave se guarda como una entrada independiente encriptada.
 */
const SecureStoreAdapter = {
  getItem: (key: string): Promise<string | null> =>
    SecureStore.getItemAsync(key),
 
  setItem: (key: string, value: string): Promise<void> =>
    SecureStore.setItemAsync(key, value),
 
  removeItem: (key: string): Promise<void> =>
    SecureStore.deleteItemAsync(key),
};
 
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: Platform.OS === "web"
    ? {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      }
    : {
        storage: SecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
});
