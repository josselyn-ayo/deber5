import { useAuth } from "@/features/auth/model/useAuth";
import { Input } from "@/shared/ui/Input";
import { LottieIllustration } from "@/shared/ui/LottieIllustration";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import {
    Button,
    Card,
    Paragraph,
    Separator,
    Spinner,
    Text,
    XStack,
    YStack
} from "tamagui";

type Mode = "login" | "register";

interface LoginScreenProps {
  initialMode?: Mode;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPolicy = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
const pillButtonProps = {
  minHeight: 38,
  px: "$4",
  py: "$2",
  br: 24,
  fontSize: 14,
  fontWeight: "700" as const,
  lineHeight: 18,
};

const primaryButtonProps = {
  minHeight: 48,
  px: "$5",
  py: "$3",
  br: 24,
  fontSize: 16,
  fontWeight: "700" as const,
  lineHeight: 20,
};

export const LoginScreen = ({ initialMode = "login" }: LoginScreenProps) => {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successVisible, setSuccessVisible] = useState(false);

  const { error, loading, clearError, signIn, signUp, resetPassword, signInWithGoogle } = useAuth();

  const hasError = validationError || error;

  const ctaText = useMemo(
    () => (mode === "login" ? "Iniciar sesion" : "Crear cuenta"),
    [mode]
  );

  const clearMessages = () => {
    setValidationError(null);
    setNotice(null);
    setSuccessVisible(false);
    clearError();
  };

  const validate = () => {
    if (!emailRegex.test(email.trim())) {
      setValidationError("Ingresa un correo electronico valido.");
      return false;
    }

    if (!password) {
      setValidationError("La contrasena es obligatoria.");
      return false;
    }

    if (mode === "register") {
      if (!passwordPolicy.test(password)) {
        setValidationError(
          "Usa minimo 8 caracteres, una mayuscula y un caracter especial."
        );
        return false;
      }

      if (password !== confirmPassword) {
        setValidationError("Las contrasenas no coinciden.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    clearMessages();
    if (!validate()) return;

    try {
      if (mode === "login") {
        await signIn({ email, password });
        setNotice("Inicio de sesión exitoso.");
        setSuccessVisible(true);
        await new Promise((resolve) => setTimeout(resolve, 700));
        return;
      }

      await signUp({ email, password });
      setNotice("Registro exitoso. Revisa tu correo para confirmar la cuenta.");
      setSuccessVisible(true);
      setConfirmPassword("");
      setMode("login");
    } catch {
      // El hook ya guarda el mensaje en estado; solo evitamos el rechazo sin capturar.
    }
  };

  const handleForgotPassword = async () => {
    clearMessages();

    if (!emailRegex.test(email.trim())) {
      setValidationError("Escribe un correo valido para recuperar tu cuenta.");
      return;
    }

    try {
      await resetPassword(email);
      setNotice("Te enviamos un correo de recuperacion.");
    } catch {
      // El hook expone el error en pantalla.
    }
  };

  const handleGoogle = async () => {
    clearMessages();
    try {
      await signInWithGoogle();
    } catch {
      // El hook expone el error en pantalla.
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <YStack f={1} bg="$soft" jc="center" p="$4">
          <Card
            bg="$cardBackground"
            borderColor="$borderColor"
            borderWidth={1}
            shadowColor="#0F172A"
            shadowOpacity={0.06}
            shadowRadius={16}
            shadowOffset={{ width: 0, height: 8 }}
            elevation={3}
            overflow="hidden"
            animation="quick"
          >
            <YStack bg="$primary" p="$6" gap="$3" ai="center">
              <LottieIllustration variant="hero" size={170} />
              <YStack ai="center" gap="$1">
                <Text color="white" fontSize="$8" fontWeight="800">
                  {mode === "login" ? "Bienvenido" : "Crea tu cuenta"}
                </Text>
                <Paragraph color="#DDE8FF" fontSize="$3" ta="center">
                  Accede con email y contraseña o entra con Google en un toque.
                </Paragraph>
              </YStack>
            </YStack>

            <YStack p="$5" gap="$4">
              <XStack gap="$2" bg="$soft" p="$1" br="$true">
                <Button
                  flex={1}
                  {...pillButtonProps}
                  bg={mode === "login" ? "$primary" : "$surfaceMuted"}
                  onPress={() => {
                    clearMessages();
                    setMode("login");
                  }}
                >
                  <Text color={mode === "login" ? "white" : "$slate11"} fontSize={14} fontWeight="700" lineHeight={18}>
                    Login
                  </Text>
                </Button>
                <Button
                  flex={1}
                  {...pillButtonProps}
                  bg={mode === "register" ? "$secondary" : "$surfaceMuted"}
                  onPress={() => {
                    clearMessages();
                    setMode("register");
                  }}
                >
                  <Text color={mode === "register" ? "white" : "$slate11"} fontSize={14} fontWeight="700" lineHeight={18}>
                    Registro
                  </Text>
                </Button>
              </XStack>

              <YStack gap="$3">
                <Input
                  label="Correo electronico"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="tu@correo.com"
                />

                <Input
                  label="Contrasena"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Ingresa tu contrasena"
                  rightAccessory={
                    <Button chromeless px="$0" py="$0" onPress={() => setShowPassword((prev) => !prev)}>
                      {showPassword ? "Ocultar" : "Mostrar"}
                    </Button>
                  }
                />

                {mode === "register" ? (
                  <YStack>
                    <Input
                      label="Confirmar contrasena"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      placeholder="Repite tu contrasena"
                      rightAccessory={
                        <Button chromeless px="$0" py="$0" onPress={() => setShowConfirmPassword((prev) => !prev)}>
                          {showConfirmPassword ? "Ocultar" : "Mostrar"}
                        </Button>
                      }
                    />
                    <Paragraph mt="$2" color="$mutedColor" size="$2">
                      Minimo 8 caracteres, una mayuscula y un caracter especial.
                    </Paragraph>
                  </YStack>
                ) : null}

                {mode === "login" ? (
                  <XStack jc="flex-end">
                    <Button chromeless px="$0" py="$0" onPress={handleForgotPassword}>
                      <Text color="$secondary" fontSize={12} fontWeight="700" lineHeight={16}>
                        ¿Olvidaste tu contrasena?
                      </Text>
                    </Button>
                  </XStack>
                ) : null}
              </YStack>

              {hasError ? (
                <Card bg="#FEE2E2" p="$3" borderColor="$danger" borderWidth={1}>
                  <Text color="$danger" fontWeight="700">
                    {hasError}
                  </Text>
                </Card>
              ) : null}

              {successVisible ? (
                <Card bg="#ECFDF5" p="$3" borderColor="$success" borderWidth={1}>
                  <XStack ai="center" gap="$3">
                    <LottieIllustration variant="success" size={64} loop={false} />
                    <YStack f={1} gap="$1">
                      <Text color="$success" fontWeight="800">
                        Éxito
                      </Text>
                      <Paragraph color="$mutedColor" size="$2">
                        {notice}
                      </Paragraph>
                    </YStack>
                  </XStack>
                </Card>
              ) : null}

              {!successVisible && notice ? (
                <Card bg="#E0F2FE" p="$3" borderColor="#38BDF8" borderWidth={1}>
                  <Text color="#0C4A6E" fontWeight="700">
                    {notice}
                  </Text>
                </Card>
              ) : null}

              <Button
                {...primaryButtonProps}
                bg="$primary"
                icon={loading.any ? () => <Spinner color="white" /> : undefined}
                disabled={loading.any}
                onPress={handleSubmit}
              >
                <Text color="white" fontSize={16} fontWeight="700" lineHeight={20}>
                  {ctaText}
                </Text>
              </Button>

              <XStack ai="center" gap="$3">
                <Separator flex={1} borderColor="$borderColor" />
                <Text color="$mutedColor">o</Text>
                <Separator flex={1} borderColor="$borderColor" />
              </XStack>

              <Button
                {...primaryButtonProps}
                bg="$secondary"
                icon={loading.google ? () => <Spinner color="white" /> : undefined}
                disabled={loading.any}
                onPress={handleGoogle}
              >
                <Text color="white" fontSize={16} fontWeight="700" lineHeight={20}>
                  Continuar con Google
                </Text>
              </Button>

              <XStack jc="center" gap="$2">
                <Paragraph color="$mutedColor">
                  {mode === "login" ? "¿Aun no tienes cuenta?" : "¿Ya tienes cuenta?"}
                </Paragraph>
                <Button
                  chromeless
                  p="$0"
                  fontSize={14}
                  fontWeight="700"
                  lineHeight={18}
                  color="$secondary"
                  onPress={() => {
                    clearMessages();
                    setMode(mode === "login" ? "register" : "login");
                  }}
                >
                  {mode === "login" ? "Registrate" : "Inicia sesion"}
                </Button>
              </XStack>

              {mode === "register" ? (
                <Button chromeless p="$0" onPress={() => router.replace("/(auth)/login")}>
                  Volver a login clasico
                </Button>
              ) : null}
            </YStack>
          </Card>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export const LoginPage = () => <LoginScreen initialMode="login" />;

export const RegisterPage = () => <LoginScreen initialMode="register" />;