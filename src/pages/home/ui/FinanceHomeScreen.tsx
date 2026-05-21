import type { TransactionCategory } from "@/entities/finance/model/types";
import { useFinance } from "@/features/finance/model/useFinance";
import { useSession } from "@/features/session/model/useSession";
import { LottieIllustration } from "@/shared/ui/LottieIllustration";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView } from "react-native";
import { Card, Paragraph, Text, XStack, YStack } from "tamagui";

const categoryLabels: Record<TransactionCategory, string> = {
  alimentacion: "Comida",
  transporte: "Transporte",
  servicios: "Hogar",
  educacion: "Salud",
  salario: "Ingresos",
  otros: "Otros",
};

const categoryIcons: Record<TransactionCategory, keyof typeof MaterialCommunityIcons.glyphMap> = {
  alimentacion: "silverware-fork-knife",
  transporte: "car-electric",
  servicios: "home-lightning-bolt",
  educacion: "medical-bag",
  salario: "cash-multiple",
  otros: "dots-horizontal-circle-outline",
};

const weekdayLabels = ["Lun", "Mar", "Mié", "Jue", "Vie"];

const money = (value: number) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));

const quickButton = {
  minHeight: 42,
  px: "$4",
  py: "$2",
  br: 9999,
  fontSize: 14,
  fontWeight: "700" as const,
};

const QuickAction = ({
  title,
  subtitle,
  icon,
  bg,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
  onPress: () => void;
}) => (
  <Pressable onPress={onPress} style={{ flex: 1, minWidth: 150 }}>
    <Card bg={bg} borderColor="rgba(255,255,255,0.5)" borderWidth={1} px="$4" py="$4" br="$5">
      <YStack gap="$3">
        <YStack w={42} h={42} br={16} bg="rgba(255,255,255,0.22)" ai="center" jc="center">
          <Ionicons name={icon} size={22} color="white" />
        </YStack>
        <YStack gap="$1">
          <Text color="white" fontSize={16} fontWeight="800">
            {title}
          </Text>
          <Paragraph color="rgba(255,255,255,0.85)" size="$2">
            {subtitle}
          </Paragraph>
        </YStack>
      </YStack>
    </Card>
  </Pressable>
);

const StatCard = ({ title, value, bg }: { title: string; value: string; bg: string }) => (
  <Card f={1} minWidth={104} bg={bg} borderColor="rgba(255,255,255,0.65)" borderWidth={1} p="$3" br="$5">
    <Paragraph color="rgba(255,255,255,0.8)" size="$2">
      {title}
    </Paragraph>
    <Text color="white" fontSize="$7" fontWeight="800">
      {value}
    </Text>
  </Card>
);

export const HomePage = () => {
  const { user, signOut } = useSession();
  const { transactions } = useFinance(user?.id, { search: "", category: "all", type: "all" });
  const displayName = user?.user_metadata?.full_name?.trim() || user?.email?.split("@")[0] || "";

  const summary = useMemo(() => {
    const income = transactions.filter((transaction) => transaction.type === "income").reduce((total, transaction) => total + transaction.amount, 0);
    const expense = transactions.filter((transaction) => transaction.type === "expense").reduce((total, transaction) => total + transaction.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const savingsRate = useMemo(() => {
    if (summary.income <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((summary.balance / summary.income) * 100)));
  }, [summary.balance, summary.income]);

  const recentTransactions = [...transactions].slice(0, 3);

  const weeklyBars = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay() || 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + 1);
    monday.setHours(0, 0, 0, 0);

    const dailyTotals = weekdayLabels.map((_, index) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + index);
      const dateKey = day.toISOString().slice(0, 10);
      const total = transactions
        .filter((transaction) => transaction.transaction_date === dateKey)
        .reduce((accumulator, transaction) => accumulator + Math.abs(transaction.amount), 0);

      return {
        label: weekdayLabels[index],
        value: total,
      };
    });

    const maxValue = Math.max(...dailyTotals.map((item) => item.value), 1);

    return dailyTotals.map((item) => ({
      label: item.label,
      height: Math.max(16, Math.round((item.value / maxValue) * 92)),
      active: item.value > 0,
    }));
  }, [transactions]);

  return (
    <YStack f={1} bg="#FCF9F8">
      <YStack position="absolute" top={0} left={0} right={0} h={360} bg="#F8FBFF" />
      <YStack position="absolute" top={-120} right={-80} w={260} h={260} br={130} bg="#DFF3EA" opacity={0.8} />
      <YStack position="absolute" top={180} left={-90} w={180} h={180} br={90} bg="#FCE7EA" opacity={0.5} />

      <ScrollView contentContainerStyle={{ paddingBottom: 140, paddingTop: 20 }} showsVerticalScrollIndicator={false}>
        <YStack gap="$5" px="$4" maxWidth={760} width="100%" alignSelf="center">
          <Card bg="rgba(255,255,255,0.86)" borderColor="#D8E0EC" borderWidth={1} shadowColor="#0F172A" shadowOpacity={0.06} shadowRadius={18} shadowOffset={{ width: 0, height: 8 }} elevation={3} overflow="hidden">
            <YStack px="$4" pt="$4" pb="$4" gap="$4" ai="center">
              <XStack ai="center" jc="space-between" w="100%">
                <XStack ai="center" gap="$3" f={1}>
                  <YStack w={44} h={44} br={22} bg="#A3F69C" ai="center" jc="center" borderWidth={2} borderColor="#1B6D24">
                    <MaterialCommunityIcons name="leaf" size={22} color="#1B6D24" />
                  </YStack>
                  <YStack f={1}>
                    <Text fontSize={22} fontWeight="900" color="#1B6D24">
                      EcoFinance
                    </Text>
                    <Paragraph color="#5C667A" size="$2">
                      Panel principal
                    </Paragraph>
                  </YStack>
                </XStack>

                <Pressable onPress={() => router.push("/profile-security")}>
                  <YStack w={44} h={44} br={22} bg="#EEF4FF" ai="center" jc="center">
                    <Ionicons name="person-outline" size={22} color="#004D99" />
                  </YStack>
                </Pressable>
              </XStack>

              <YStack gap="$3" ai="center">
                <LottieIllustration variant="hero" size={132} />
                <YStack ai="center" gap="$1">
                  <Text fontSize="$7" fontWeight="900" color="#1C1B1B" textAlign="center">
                    {displayName ? `Hola, ${displayName}` : "Hola"}
                  </Text>
                  <Paragraph color="#5C667A" size="$3" textAlign="center">
                    Lleva ingresos, gastos, historial y seguridad en un mismo lugar.
                  </Paragraph>
                </YStack>
                <XStack ai="center" gap="$2" flexWrap="wrap" jc="center">
                  <Card bg="#004D99" px="$3" py="$2" br={9999}>
                    <Text color="white" fontSize={12} fontWeight="800">
                      Score: 850
                    </Text>
                  </Card>
                </XStack>
              </YStack>
            </YStack>
          </Card>

          <XStack gap="$3" flexWrap="wrap">
            <QuickAction title="Transacciones" subtitle="Ir al historial" icon="swap-horizontal-outline" bg="#004D99" onPress={() => router.push("/history")} />
            <QuickAction title="Historial" subtitle="Ver movimientos guardados" icon="time-outline" bg="#1B6D24" onPress={() => router.push("/history")} />
          </XStack>

          <Card bg="$cardBackground" borderColor="$borderColor" borderWidth={1} shadowColor="#0F172A" shadowOpacity={0.08} shadowRadius={20} shadowOffset={{ width: 0, height: 10 }} elevation={4} p="$4">
            <YStack gap="$4">
              <XStack ai="center" jc="space-between">
                <YStack>
                  <Text fontSize="$6" fontWeight="900" color="$slate11">
                    Resumen financiero
                  </Text>
                  <Paragraph color="$mutedColor" size="$2">
                    Vista rápida del flujo de caja.
                  </Paragraph>
                </YStack>
              </XStack>

              <Card bg="white" borderColor="#DDEBE7" borderWidth={1} shadowColor="#0F172A" shadowOpacity={0.04} shadowRadius={14} shadowOffset={{ width: 0, height: 8 }} elevation={2} p="$4" ai="center">
                <YStack ai="center" jc="center" gap="$2">
                  <YStack w={184} h={184} br={92} ai="center" jc="center" borderWidth={14} borderColor="#EAF6F2" borderTopColor="#004D99" borderRightColor="#004D99" borderBottomColor="#D7ECE7" borderLeftColor="#D7ECE7">
                    <Text fontSize={40} fontWeight="900" color="#1C1B1B">
                      {savingsRate}%
                    </Text>
                  </YStack>
                  <YStack ai="center" gap="$1">
                    <Text fontSize="$4" fontWeight="800" color="#004D99">
                      Nivel de ahorro
                    </Text>
                    <Paragraph color="#5C667A" size="$2" textAlign="center">
                      Tu saldo disponible frente a los ingresos registrados.
                    </Paragraph>
                  </YStack>
                </YStack>
              </Card>

              <XStack gap="$3" flexWrap="wrap">
                <StatCard title="Ingresos" value={money(summary.income)} bg="#0F8E78" />
                <StatCard title="Gastos" value={money(summary.expense)} bg="#0D5E55" />
                <StatCard title="Balance" value={money(summary.balance)} bg="#F0B429" />
              </XStack>
            </YStack>
          </Card>

          <Card bg="$cardBackground" borderColor="$borderColor" borderWidth={1} shadowColor="#0F172A" shadowOpacity={0.08} shadowRadius={20} shadowOffset={{ width: 0, height: 10 }} elevation={4} p="$4">
            <YStack gap="$4">
              <XStack ai="center" jc="space-between">
                <YStack>
                  <Text fontSize="$6" fontWeight="900" color="$slate11">
                    Actividad semanal
                  </Text>
                  <Paragraph color="$mutedColor" size="$2">
                    Tus movimientos reales de la semana actual.
                  </Paragraph>
                </YStack>
              </XStack>

              <XStack ai="flex-end" jc="space-between" h={118} px="$2">
                {weeklyBars.map((bar) => (
                  <YStack key={bar.label} ai="center" gap="$2" flex={1}>
                    <YStack w={12} h={bar.height} br={9999} bg={bar.active ? "$primary" : "$borderColor"} />
                    <Text fontSize={10} color="$mutedColor">
                      {bar.label}
                    </Text>
                  </YStack>
                ))}
              </XStack>
            </YStack>
          </Card>

          <Card bg="$cardBackground" borderColor="$borderColor" borderWidth={1} shadowColor="#0F172A" shadowOpacity={0.08} shadowRadius={20} shadowOffset={{ width: 0, height: 10 }} elevation={4} p="$4">
            <YStack gap="$4">
              <XStack ai="center" jc="space-between">
                <YStack>
                  <Text fontSize="$6" fontWeight="900" color="$slate11">
                    Transacciones recientes
                  </Text>
                  <Paragraph color="$mutedColor" size="$2">
                    Vista previa de los últimos movimientos.
                  </Paragraph>
                </YStack>
              </XStack>

              <YStack gap="$3">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((item) => {
                    const isIncome = item.type === "income";
                    return (
                      <Pressable key={item.id} onPress={() => router.push("/history")}>
                        <Card bg="rgba(255,255,255,0.88)" borderColor="#E5E2E1" borderWidth={1} shadowColor="#0F172A" shadowOpacity={0.04} shadowRadius={12} shadowOffset={{ width: 0, height: 6 }} elevation={2} px="$4" py="$4">
                          <XStack ai="center" jc="space-between" gap="$3">
                            <XStack ai="center" gap="$3" f={1}>
                              <YStack w={48} h={48} br={16} bg={isIncome ? "#E8F4FF" : "#EAF7EA"} ai="center" jc="center">
                                <MaterialCommunityIcons name={categoryIcons[item.category]} size={25} color={isIncome ? "#004D99" : "#1B6D24"} />
                              </YStack>
                              <YStack f={1} gap="$1">
                                <Text fontSize={17} fontWeight="800" color="#1C1B1B" numberOfLines={1}>
                                  {item.description.split(" - ")[0]}
                                </Text>
                                <Text color="#5C667A" fontSize={13}>
                                  {formatDate(item.transaction_date)} · {categoryLabels[item.category]}
                                </Text>
                              </YStack>
                            </XStack>
                            <Text fontSize={18} fontWeight="900" color={isIncome ? "#1B6D24" : "#A10012"}>
                              {isIncome ? "+" : "-"}{money(item.amount)}
                            </Text>
                          </XStack>
                        </Card>
                      </Pressable>
                    );
                  })
                ) : (
                  <Card bg="#F6F3F2" borderColor="#E5E2E1" borderWidth={1} px="$4" py="$5" ai="center">
                    <LottieIllustration variant="loading" size={96} />
                    <Paragraph mt="$2" color="#5C667A" textAlign="center">
                      Aún no hay movimientos registrados.
                    </Paragraph>
                  </Card>
                )}
              </YStack>
            </YStack>
          </Card>

          <Card bg="$cardBackground" borderColor="$borderColor" borderWidth={1} shadowColor="#0F172A" shadowOpacity={0.08} shadowRadius={20} shadowOffset={{ width: 0, height: 10 }} elevation={4} p="$4">
            <YStack gap="$4">
              <Text fontSize="$6" fontWeight="900" color="$slate11">
                Acceso rápido
              </Text>

              <XStack gap="$3" flexWrap="wrap">
                <Pressable onPress={() => router.push("/comprobantes")} style={{ flex: 1, minWidth: 160 }}>
                  <Card bg="#004D99" px="$4" py="$4" br="$5">
                    <Text color="white" fontSize={16} fontWeight="800">
                      Comprobantes
                    </Text>
                  </Card>
                </Pressable>

                <Pressable onPress={() => router.push("/history")} style={{ flex: 1, minWidth: 160 }}>
                  <Card bg="#1B6D24" px="$4" py="$4" br="$5">
                    <Text color="white" fontSize={16} fontWeight="800">
                      Historial
                    </Text>
                  </Card>
                </Pressable>

                <Pressable onPress={() => signOut()} style={{ flex: 1, minWidth: 160 }}>
                  <Card bg="#F6FCF9" borderColor="#D6EAE2" borderWidth={1} px="$4" py="$4" br="$5">
                    <Text color="#1C1B1B" fontSize={16} fontWeight="800">
                      Cerrar sesión
                    </Text>
                  </Card>
                </Pressable>
              </XStack>
            </YStack>
          </Card>
        </YStack>
      </ScrollView>

      <Card position="absolute" left={18} right={18} bottom={18} bg="rgba(255,255,255,0.94)" borderColor="#D8E0EC" borderWidth={1} shadowColor="#0F172A" shadowOpacity={0.08} shadowRadius={18} shadowOffset={{ width: 0, height: 10 }} elevation={8} br={28} px="$4" py="$3">
        <XStack ai="center" jc="space-between">
          <Pressable onPress={() => router.replace("/home")}>
            <YStack ai="center" gap="$1">
              <YStack bg="#A3F69C" w={44} h={44} br={22} ai="center" jc="center">
                <Ionicons name="home-outline" size={22} color="#1B6D24" />
              </YStack>
              <Text color="#1B6D24" fontSize={11} fontWeight="800">
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
              <Ionicons name="person-outline" size={22} color="#727783" />
              <Text color="#727783" fontSize={11} fontWeight="700">
                Perfil
              </Text>
            </YStack>
          </Pressable>
        </XStack>
      </Card>
    </YStack>
  );
};