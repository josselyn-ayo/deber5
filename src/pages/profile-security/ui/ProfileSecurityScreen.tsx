import { useFinance } from "@/features/finance/model/useFinance";
import { useSession } from "@/features/session/model/useSession";
import { expenseService } from "@/shared/api/expenseService";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, TextInput } from "react-native";
import { Button, Card, Paragraph, Text, XStack, YStack } from "tamagui";

const fieldStyle = {
  backgroundColor: "#F6FCF9",
  borderColor: "#D6EAE2",
  borderWidth: 1,
  borderRadius: 18,
  paddingHorizontal: 16,
  paddingVertical: 14,
  fontSize: 16,
  color: "#1C1B1B",
} as const;

const primaryButtonProps = {
  minHeight: 52,
  br: 24,
  fontSize: 16,
  fontWeight: "800" as const,
};

const topActionProps = {
  minHeight: 42,
  px: "$3",
  py: "$2",
  br: 9999,
  fontSize: 13,
  fontWeight: "800" as const,
};

export const ProfileSecurityScreen = () => {
  const { user, signOut } = useSession();
  const { changePassword } = useFinance(user?.id, { search: "", category: "all", type: "all" });

  const initialName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "";
  const initialAvatar = user?.user_metadata?.avatar_url ?? null;
  const initialPhone = user?.user_metadata?.phone ?? "";

  const [fullName, setFullName] = useState(initialName);
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(initialPhone);
  const [avatarUri, setAvatarUri] = useState<string | null>(initialAvatar);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    setFullName(initialName);
    setEmail(user?.email ?? "");
    setPhone(initialPhone);
    setAvatarUri(initialAvatar);
  }, [initialAvatar, initialName, initialPhone, user?.email]);

  const initials = useMemo(() => {
    const source = fullName.trim() || user?.email?.split("@")[0] || "U";
    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [fullName, user?.email]);

  const pickAvatar = async (mode: "camera" | "library") => {
    try {
      if (mode === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert("Permiso requerido", "Activa la cámara para tomar tu foto de perfil.");
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.9,
        });

        if (!result.canceled && result.assets.length > 0) {
          setAvatarUri(result.assets[0].uri);
        }
        return;
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permiso requerido", "Activa la galería para subir una foto de perfil.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo abrir la cámara o la galería.";
      Alert.alert("Error", message);
    }
  };

  const saveProfile = async () => {
    if (!user) {
      Alert.alert("Sesión requerida", "Debes iniciar sesión para guardar el perfil.");
      return;
    }

    if (!fullName.trim()) {
      Alert.alert("Campo requerido", "Escribe tu nombre completo.");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Campo requerido", "Escribe un correo válido.");
      return;
    }

    try {
      setSavingProfile(true);
      await expenseService.updateProfile({
        email,
        fullName,
        phone,
        avatarUrl: avatarUri,
      });
      Alert.alert("Listo", "Tu perfil fue actualizado.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo actualizar el perfil.";
      Alert.alert("Error", message);
    } finally {
      setSavingProfile(false);
    }
  };

  const submitPasswordChange = async () => {
    if (!password || !passwordConfirm) {
      Alert.alert("Campo requerido", "Completa la nueva contraseña y su confirmación.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Contraseña débil", "La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    try {
      await changePassword.mutateAsync(password);
      setPassword("");
      setPasswordConfirm("");
      Alert.alert("Listo", "Tu contraseña fue actualizada correctamente.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo actualizar la contraseña.";
      Alert.alert("Error", message);
    }
  };

  return (
    <YStack f={1} bg="#FCF9F8">
      <YStack position="absolute" top={-100} right={-70} w={240} h={240} br={120} bg="#DFF3EA" opacity={0.8} />
      <YStack position="absolute" top={180} left={-80} w={200} h={200} br={100} bg="#E8F1FF" opacity={0.55} />

      <ScrollView contentContainerStyle={{ paddingBottom: 220, paddingTop: 20 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <YStack gap="$5" px="$4" maxWidth={760} width="100%" alignSelf="center">
          <Card bg="rgba(255,255,255,0.86)" borderColor="#D8E0EC" borderWidth={1} shadowColor="#0F172A" shadowOpacity={0.06} shadowRadius={18} shadowOffset={{ width: 0, height: 8 }} elevation={3} overflow="hidden">
            <YStack px="$4" pt="$4" pb="$4" gap="$4" ai="center">
              <XStack ai="center" jc="space-between" w="100%">
                <Pressable onPress={() => router.back()}>
                  <YStack w={42} h={42} br={21} bg="#EEF4FF" ai="center" jc="center">
                    <Ionicons name="arrow-back" size={22} color="#004D99" />
                  </YStack>
                </Pressable>

                <Button {...topActionProps} bg="#F1F9F7" borderWidth={1} borderColor="#D7ECE6">
                  <Text color="#1B6D24" fontSize={13} fontWeight="800">
                    Perfil editable
                  </Text>
                </Button>
              </XStack>

              <YStack ai="center" gap="$3">
                <YStack position="relative">
                  <YStack w={132} h={132} br={66} bg="#EAF7EA" borderWidth={4} borderColor="white" shadowColor="#0F172A" shadowOpacity={0.12} shadowRadius={14} shadowOffset={{ width: 0, height: 8 }} elevation={4} overflow="hidden" ai="center" jc="center">
                    {avatarUri ? (
                      <Image source={{ uri: avatarUri }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                    ) : (
                      <Text color="#1B6D24" fontSize={42} fontWeight="900">
                        {initials || "U"}
                      </Text>
                    )}
                  </YStack>

                  <Pressable onPress={() => pickAvatar("camera")} style={{ position: "absolute", right: 2, bottom: 2 }}>
                    <YStack w={40} h={40} br={20} bg="#1B6D24" ai="center" jc="center" borderWidth={3} borderColor="white">
                      <Ionicons name="camera" size={18} color="white" />
                    </YStack>
                  </Pressable>
                </YStack>

                <YStack ai="center" gap="$1">
                  <Text fontSize={26} fontWeight="900" color="#1C1B1B" textAlign="center">
                    {fullName || "Mi perfil"}
                  </Text>
                  <Paragraph color="#5C667A" size="$2" textAlign="center">
                    Edita tus datos, cambia tu foto y actualiza tu contraseña.
                  </Paragraph>
                </YStack>

                <XStack gap="$2" flexWrap="wrap" jc="center">
                  <Button {...topActionProps} bg="#004D99" onPress={() => pickAvatar("library") }>
                    <Text color="white" fontSize={13} fontWeight="800">
                      Subir foto
                    </Text>
                  </Button>
                  <Button {...topActionProps} bg="#1B6D24" onPress={() => pickAvatar("camera") }>
                    <Text color="white" fontSize={13} fontWeight="800">
                      Tomar foto
                    </Text>
                  </Button>
                </XStack>
              </YStack>
            </YStack>
          </Card>

          <Card bg="$cardBackground" borderColor="$borderColor" borderWidth={1} shadowColor="#0F172A" shadowOpacity={0.08} shadowRadius={20} shadowOffset={{ width: 0, height: 10 }} elevation={4} p="$4" mb="$6">
            <YStack gap="$4">
              <XStack ai="center" gap="$3">
                <YStack w={42} h={42} br={21} bg="#DFF3EA" ai="center" jc="center">
                  <Ionicons name="person-outline" size={22} color="#1B6D24" />
                </YStack>
                <Text fontSize="$6" fontWeight="900" color="$slate11">
                  Información personal
                </Text>
              </XStack>

              <YStack gap="$3">
                <YStack gap="$2">
                  <Text color="$mutedColor" fontSize={12} fontWeight="800" textTransform="uppercase">
                    Nombre completo
                  </Text>
                  <TextInput value={fullName} onChangeText={setFullName} placeholder="Tu nombre" placeholderTextColor="#94A3B8" style={fieldStyle} />
                </YStack>

                <YStack gap="$2">
                  <Text color="$mutedColor" fontSize={12} fontWeight="800" textTransform="uppercase">
                    Correo electrónico
                  </Text>
                  <TextInput value={email} onChangeText={setEmail} placeholder="correo@ejemplo.com" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#94A3B8" style={fieldStyle} />
                </YStack>

                <YStack gap="$2">
                  <Text color="$mutedColor" fontSize={12} fontWeight="800" textTransform="uppercase">
                    Teléfono
                  </Text>
                  <TextInput value={phone} onChangeText={setPhone} placeholder="+34 612 345 678" keyboardType="phone-pad" placeholderTextColor="#94A3B8" style={fieldStyle} />
                </YStack>

                <Button bg="#004D99" minHeight={52} br={24} onPress={saveProfile} disabled={savingProfile}>
                  <Text color="white" fontSize={16} fontWeight="800">
                    {savingProfile ? "Guardando..." : "Guardar perfil"}
                  </Text>
                </Button>
              </YStack>
            </YStack>
          </Card>

          <Card bg="$cardBackground" borderColor="$borderColor" borderWidth={1} shadowColor="#0F172A" shadowOpacity={0.08} shadowRadius={20} shadowOffset={{ width: 0, height: 10 }} elevation={4} p="$4">
            <YStack gap="$4">
              <XStack ai="center" gap="$3">
                <YStack w={42} h={42} br={21} bg="#E8F4FF" ai="center" jc="center">
                  <Ionicons name="shield-checkmark-outline" size={22} color="#004D99" />
                </YStack>
                <Text fontSize="$6" fontWeight="900" color="$slate11">
                  Seguridad
                </Text>
              </XStack>

              <YStack gap="$3">
                <YStack gap="$2">
                  <Text color="$mutedColor" fontSize={12} fontWeight="800" textTransform="uppercase">
                    Nueva contraseña
                  </Text>
                  <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Mínimo 8 caracteres" placeholderTextColor="#94A3B8" style={fieldStyle} />
                </YStack>

                <YStack gap="$2">
                  <Text color="$mutedColor" fontSize={12} fontWeight="800" textTransform="uppercase">
                    Confirmar contraseña
                  </Text>
                  <TextInput value={passwordConfirm} onChangeText={setPasswordConfirm} secureTextEntry placeholder="Repite la contraseña" placeholderTextColor="#94A3B8" style={fieldStyle} />
                </YStack>

                <Button bg="#1B6D24" minHeight={52} br={24} onPress={submitPasswordChange}>
                  <Text color="white" fontSize={16} fontWeight="800">
                    Cambiar contraseña
                  </Text>
                </Button>

                <Button bg="#F6FCF9" borderWidth={1} borderColor="#D6EAE2" minHeight={52} br={24} onPress={() => signOut()}>
                  <Text color="#1C1B1B" fontSize={16} fontWeight="800">
                    Cerrar sesión
                  </Text>
                </Button>
              </YStack>
            </YStack>
          </Card>
        </YStack>
      </ScrollView>

      <Card position="absolute" left={18} right={18} bottom={18} bg="rgba(255,255,255,0.94)" borderColor="#D8E0EC" borderWidth={1} shadowColor="#0F172A" shadowOpacity={0.08} shadowRadius={18} shadowOffset={{ width: 0, height: 10 }} elevation={8} br={28} px="$4" py="$3">
        <XStack ai="center" jc="space-between">
          <Pressable onPress={() => router.push("/home")}>
            <YStack ai="center" gap="$1">
              <Ionicons name="home-outline" size={22} color="#727783" />
              <Text color="#727783" fontSize={11} fontWeight="700">
                Inicio
              </Text>
            </YStack>
          </Pressable>

          <Pressable onPress={() => router.push("/history")}>
            <YStack ai="center" gap="$1">
              <Ionicons name="time-outline" size={22} color="#727783" />
              <Text color="#727783" fontSize={11} fontWeight="700">
                Historial
              </Text>
            </YStack>
          </Pressable>

          <Pressable onPress={() => router.push("/comprobantes")}>
            <YStack ai="center" gap="$1">
              <Ionicons name="swap-horizontal-outline" size={22} color="#727783" />
              <Text color="#727783" fontSize={11} fontWeight="700">
                Transacción
              </Text>
            </YStack>
          </Pressable>

          <Pressable onPress={() => router.push("/profile-security")}>
            <YStack ai="center" gap="$1">
              <YStack bg="#A3F69C" w={44} h={44} br={22} ai="center" jc="center">
                <Ionicons name="person-outline" size={22} color="#1B6D24" />
              </YStack>
              <Text color="#1B6D24" fontSize={11} fontWeight="800">
                Perfil
              </Text>
            </YStack>
          </Pressable>
        </XStack>
      </Card>
    </YStack>
  );
};