import { supabase } from "@/shared/api/supabase";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

type AuthAction = "login" | "register" | "forgot" | "google" | null;

interface AuthPayload {
  email: string;
  password: string;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const mapAuthError = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return "No se pudo completar la autenticacion. Intentalo de nuevo.";
};

const getPublicAppUrl = () => process.env.EXPO_PUBLIC_APP_URL?.trim() ?? "";

const getRedirect = (path: string) => {
  const appUrl = getPublicAppUrl();
  if (appUrl) return `${appUrl}${path}`;
  return undefined;
};

const parseTokensFromUrl = (url: string) => {
  const hash = url.includes("#") ? (url.split("#")[1] ?? "") : "";
  const query = url.includes("?") ? (url.split("?")[1]?.split("#")[0] ?? "") : "";
  const merged = [query, hash].filter(Boolean).join("&");
  const params = new URLSearchParams(merged);

  return {
    accessToken: params.get("access_token") ?? "",
    refreshToken: params.get("refresh_token") ?? "",
  };
};

export const useAuth = () => {
  const [loadingAction, setLoadingAction] = useState<AuthAction>(null);
  const [error, setError] = useState<string | null>(null);

  const setAction = (action: AuthAction) => {
    setError(null);
    setLoadingAction(action);
  };

  const clearState = () => {
    setLoadingAction(null);
  };

  const signIn = useCallback(async ({ email, password }: AuthPayload) => {
    setAction("login");
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizeEmail(email),
        password,
      });
      if (authError) throw authError;
      return data;
    } catch (err) {
      setError(mapAuthError(err));
      throw err;
    } finally {
      clearState();
    }
  }, []);

  const signUp = useCallback(async ({ email, password }: AuthPayload) => {
    setAction("register");
    try {
      const emailRedirectTo = getRedirect("/confirm-email");
      const { data, error: authError } = await supabase.auth.signUp({
        email: normalizeEmail(email),
        password,
        options: emailRedirectTo ? { emailRedirectTo } : undefined,
      });
      if (authError) throw authError;
      return data;
    } catch (err) {
      setError(mapAuthError(err));
      throw err;
    } finally {
      clearState();
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setAction("forgot");
    try {
      const redirectTo = getRedirect("/reset-password");
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        normalizeEmail(email),
        redirectTo ? { redirectTo } : undefined
      );
      if (authError) throw authError;
    } catch (err) {
      setError(mapAuthError(err));
      throw err;
    } finally {
      clearState();
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAction("google");
    try {
      // Generar redirectUri usando el esquema de la app (definido en app.json)
      const redirectUrl = makeRedirectUri({ scheme: "authesfot" });

      if (!redirectUrl) {
        throw new Error("No se pudo generar la URL de retorno para Google OAuth.");
      }

      console.log("REGISTRA ESTA URL EN SUPABASE:", redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) {
        Alert.alert("Error", error.message ?? "No se pudo iniciar Google OAuth");
        return;
      }

      if (!data.url) {
        throw new Error("No se pudo iniciar el flujo de Google OAuth.");
      }

      if (Platform.OS === "web") {
        window.location.href = data.url;
        return data;
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (result.type !== "success" || !result.url) {
        throw new Error("Inicio de sesion con Google cancelado.");
      }

      const { accessToken, refreshToken } = parseTokensFromUrl(result.url);

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) throw sessionError;
      }

      return data;
    } catch (err) {
      setError(mapAuthError(err));
      throw err;
    } finally {
      clearState();
    }
  }, []);

  const loading = useMemo(
    () => ({
      any: loadingAction !== null,
      login: loadingAction === "login",
      register: loadingAction === "register",
      forgot: loadingAction === "forgot",
      google: loadingAction === "google",
    }),
    [loadingAction]
  );

  return {
    error,
    loading,
    clearError: () => setError(null),
    signIn,
    signUp,
    resetPassword,
    signInWithGoogle,
  };
};