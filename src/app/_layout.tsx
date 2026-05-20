import { QueryProvider } from "@/core/providers/QueryProvider";
import tamaguiConfig from "@/core/styles/tamagui.config";
import { useSession } from "@/features/session/model/useSession";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { TamaguiProvider, Theme } from "tamagui";

function AuthGuard() {
  const { isAuthenticated, isLoading } = useSession();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      router.replace("/home");
    } else {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isLoading]);

  return null;
}

export default function RootLayout() {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <Theme name="light">
        <QueryProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="home" />
            <Stack.Screen name="index" />
          </Stack>
          <AuthGuard />
        </QueryProvider>
      </Theme>
    </TamaguiProvider>
  );
}