import type { TransactionCategory, TransactionRecord, TransactionType } from "@/entities/finance/model/types";
import { useFinance } from "@/features/finance/model/useFinance";
import { useSession } from "@/features/session/model/useSession";
import { LottieIllustration } from "@/shared/ui/LottieIllustration";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, TextInput } from "react-native";
import { Button, Card, Paragraph, Separator, Text, XStack, YStack } from "tamagui";

const categories: { label: string; value: TransactionCategory | "all" }[] = [
  { label: "Todo", value: "all" },
  { label: "Comida", value: "alimentacion" },
  { label: "Transporte", value: "transporte" },
  { label: "Hogar", value: "servicios" },
  { label: "Salud", value: "educacion" },
];

const typeFilters: { label: string; value: TransactionType | "all" }[] = [
  { label: "Todo", value: "all" },
  { label: "Ingresos", value: "income" },
  { label: "Gastos", value: "expense" },
];

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

const money = (value: number) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

const formatDateLabel = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("es-EC", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(date);
};

const groupKey = (value: string) => value;

const sortByDate = (a: TransactionRecord, b: TransactionRecord) => {
  if (a.transaction_date !== b.transaction_date) {
    return b.transaction_date.localeCompare(a.transaction_date);
  }

  return b.created_at.localeCompare(a.created_at);
};

const chipBaseProps = {
  minHeight: 38,
  px: "$4",
  py: "$2",
  br: 9999,
  fontSize: 14,
  fontWeight: "700" as const,
};

const StatPill = ({ label, value, accent }: { label: string; value: string; accent: string }) => (
  <Card bg={accent} px="$3" py="$2" br={9999} borderWidth={1} borderColor="rgba(255,255,255,0.45)">
    <YStack>
      <Text color="white" fontSize={11} fontWeight="700" textTransform="uppercase">
        {label}
      </Text>
      <Text color="white" fontSize={15} fontWeight="900">
        {value}
      </Text>
    </YStack>
  </Card>
);

export const TransactionHistoryScreen = () => {
  const { user } = useSession();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | "all">("all");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");

  const { transactions, isTransactionsLoading } = useFinance(user?.id, {
    search,
    category: categoryFilter,
    type: typeFilter,
  });

  const summary = useMemo(() => {
    const income = transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((accumulator, transaction) => accumulator + transaction.amount, 0);
    const expense = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((accumulator, transaction) => accumulator + transaction.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [transactions]);

  const groupedTransactions = useMemo(() => {
    const sorted = [...transactions].sort(sortByDate);
    return sorted.reduce<Record<string, TransactionRecord[]>>((accumulator, transaction) => {
      const key = groupKey(transaction.transaction_date);
      if (!accumulator[key]) {
        accumulator[key] = [];
      }
      accumulator[key].push(transaction);
      return accumulator;
    }, {});
  }, [transactions]);

  const dateGroups = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

  const openTransaction = (transaction: TransactionRecord) => {
    Alert.alert(
      transaction.description,
      `${categoryLabels[transaction.category]} · ${formatDateLabel(transaction.transaction_date)}\n${money(transaction.amount)}`,
      [{ text: "Cerrar", style: "cancel" }]
    );
  };

  return (
    <YStack f={1} bg="#FCF9F8">
      <YStack position="absolute" top={0} left={0} right={0} h={360} bg="#F8FBFF" />
      <YStack position="absolute" top={-120} right={-80} w={260} h={260} br={130} bg="#DFF3EA" opacity={0.8} />
      <YStack position="absolute" top={180} left={-90} w={180} h={180} br={90} bg="#FCE7EA" opacity={0.5} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <YStack gap="$5" px="$4" maxWidth={760} width="100%" alignSelf="center">
          <Card bg="rgba(255,255,255,0.84)" borderColor="#D8E0EC" borderWidth={1} shadowColor="#0F172A" shadowOpacity={0.05} shadowRadius={18} shadowOffset={{ width: 0, height: 8 }} elevation={3} overflow="hidden">
            <YStack px="$4" pt="$4" pb="$5" gap="$4">
              <XStack ai="center" jc="space-between">
                <XStack ai="center" gap="$3" f={1}>
                  <YStack w={44} h={44} br={22} bg="#A3F69C" ai="center" jc="center" borderWidth={2} borderColor="#1B6D24">
                    <MaterialCommunityIcons name="leaf" size={22} color="#1B6D24" />
                  </YStack>
                  <YStack>
                    <Text fontSize={22} fontWeight="900" color="#1B6D24">
                      EcoFinance
                    </Text>
                    <Paragraph color="#5C667A" size="$2">
                      Historial de transacciones
                    </Paragraph>
                  </YStack>
                </XStack>

                <Button chromeless px="$0" py="$0" onPress={() => Alert.alert("Notificaciones", "Sin notificaciones nuevas.")}> 
                  <YStack w={42} h={42} br={21} bg="#EEF4FF" ai="center" jc="center">
                    <Ionicons name="notifications-outline" size={22} color="#004D99" />
                  </YStack>
                </Button>
              </XStack>

              <YStack gap="$3">
                <Card bg="rgba(255,255,255,0.9)" borderColor="#C9D7E8" borderWidth={1} br={18} px="$3" py="$2">
                  <XStack ai="center" gap="$2">
                    <Ionicons name="search" size={18} color="#727783" />
                    <TextInput
                      value={search}
                      onChangeText={setSearch}
                      placeholder="Buscar por descripción..."
                      style={{
                        flex: 1,
                        fontSize: 16,
                        color: "#1C1B1B",
                        paddingVertical: 8,
                        paddingHorizontal: 0,
                      }}
                      placeholderTextColor="#727783"
                    />
                    <YStack bg="#DFF3EA" w={36} h={36} br={12} ai="center" jc="center">
                      <Ionicons name="options-outline" size={18} color="#1B6D24" />
                    </YStack>
                  </XStack>
                </Card>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 8 }}>
                  {categories.map((item) => (
                    <Button
                      key={item.value}
                      {...chipBaseProps}
                      bg={categoryFilter === item.value ? "$primary" : "$surface-container-high"}
                      color={categoryFilter === item.value ? "white" : "$on-surface-variant"}
                      onPress={() => setCategoryFilter(item.value)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </ScrollView>
              </YStack>

              <XStack gap="$3" flexWrap="wrap">
                <StatPill label="Ingresos" value={money(summary.income)} accent="#004D99" />
                <StatPill label="Gastos" value={money(summary.expense)} accent="#1B6D24" />
                <StatPill label="Balance" value={money(summary.balance)} accent="#A10012" />
              </XStack>
            </YStack>
          </Card>

          <Card bg="rgba(255,255,255,0.8)" borderColor="#D8E0EC" borderWidth={1} shadowColor="#0F172A" shadowOpacity={0.05} shadowRadius={16} shadowOffset={{ width: 0, height: 8 }} elevation={2} px="$4" py="$4">
            <XStack ai="center" jc="space-between" mb="$3">
              <YStack>
                <Text fontSize={24} fontWeight="800" color="#1C1B1B">
                  Transacciones Recientes
                </Text>
                <Paragraph color="#5C667A" size="$2">
                  {transactions.length} movimientos filtrados
                </Paragraph>
              </YStack>
            </XStack>

            <XStack gap="$2" flexWrap="wrap" mb="$3">
              {typeFilters.map((item) => (
                <Button
                  key={item.value}
                  {...chipBaseProps}
                  bg={typeFilter === item.value ? "$secondary" : "$surface-container-high"}
                  color={typeFilter === item.value ? "white" : "$on-surface-variant"}
                  onPress={() => setTypeFilter(item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </XStack>

            <Separator borderColor="#E5E2E1" />

            <YStack gap="$4" pt="$4">
              {isTransactionsLoading ? (
                <Card bg="#F6F3F2" borderColor="#E5E2E1" borderWidth={1} px="$4" py="$5" ai="center">
                  <LottieIllustration variant="loading" size={120} />
                  <Paragraph mt="$2" color="#5C667A">
                    Cargando historial...
                  </Paragraph>
                </Card>
              ) : null}

              {!isTransactionsLoading && dateGroups.length === 0 ? (
                <Card bg="#F6F3F2" borderColor="#E5E2E1" borderWidth={1} px="$4" py="$5" ai="center">
                  <LottieIllustration variant="hero" size={132} />
                  <Text mt="$2" fontSize={18} fontWeight="800" color="#1C1B1B" textAlign="center">
                    No hay transacciones con esos filtros.
                  </Text>
                  <Paragraph color="#5C667A" size="$2" textAlign="center">
                    Ajusta la búsqueda o prueba otros filtros.
                  </Paragraph>
                </Card>
              ) : null}

              {dateGroups.map((date) => (
                <YStack key={date} gap="$3">
                  <Text color="#727783" fontSize={13} fontWeight="700" textTransform="uppercase" letterSpacing={1.5} px="$1">
                    {formatDateLabel(date)}
                  </Text>

                  <YStack gap="$3">
                    {groupedTransactions[date].map((transaction) => {
                      const isIncome = transaction.type === "income";
                      const iconName = categoryIcons[transaction.category];

                      return (
                        <Pressable key={transaction.id} onPress={() => openTransaction(transaction)}>
                          <Card bg="rgba(255,255,255,0.86)" borderColor="#E5E2E1" borderWidth={1} shadowColor="#0F172A" shadowOpacity={0.04} shadowRadius={12} shadowOffset={{ width: 0, height: 6 }} elevation={2} px="$4" py="$4">
                            <XStack ai="center" jc="space-between" gap="$3">
                              <XStack ai="center" gap="$3" f={1}>
                                <YStack w={48} h={48} br={16} bg={isIncome ? "#E8F4FF" : "#EAF7EA"} ai="center" jc="center">
                                  <MaterialCommunityIcons name={iconName} size={25} color={isIncome ? "#004D99" : "#1B6D24"} />
                                </YStack>
                                <YStack f={1} gap="$1">
                                  <Text fontSize={17} fontWeight="800" color="#1C1B1B">
                                    {transaction.description}
                                  </Text>
                                  <Text color="#5C667A" fontSize={13}>
                                    {transaction.transaction_date} · {categoryLabels[transaction.category]}
                                  </Text>
                                </YStack>
                              </XStack>

                              <YStack ai="flex-end" gap="$2">
                                <Text fontSize={20} fontWeight="900" color={isIncome ? "#1B6D24" : "#A10012"}>
                                  {isIncome ? "+" : "-"}{money(transaction.amount)}
                                </Text>
                                <XStack ai="center" gap="$2">
                                  <Button chromeless px="$0" py="$0" onPress={() => Alert.alert("Acciones", "Editar/eliminar se puede conectar desde aquí.") }>
                                    <Ionicons name="ellipsis-horizontal" size={20} color="#727783" />
                                  </Button>
                                </XStack>
                              </YStack>
                            </XStack>
                          </Card>
                        </Pressable>
                      );
                    })}
                  </YStack>
                </YStack>
              ))}
            </YStack>
          </Card>
        </YStack>
      </ScrollView>

      <Card position="absolute" left={18} right={18} bottom={18} bg="rgba(255,255,255,0.92)" borderColor="#D8E0EC" borderWidth={1} shadowColor="#0F172A" shadowOpacity={0.08} shadowRadius={18} shadowOffset={{ width: 0, height: 10 }} elevation={8} br={28} px="$4" py="$3">
        <XStack ai="center" jc="space-between">
          <Pressable onPress={() => router.push("/home")}>
            <YStack ai="center" gap="$1">
              <Ionicons name="home-outline" size={22} color="#727783" />
              <Text color="#727783" fontSize={11} fontWeight="700">
                Inicio
              </Text>
            </YStack>
          </Pressable>

          <Pressable onPress={() => router.replace("/history")}>
            <YStack ai="center" gap="$1">
              <YStack bg="#A3F69C" w={44} h={44} br={22} ai="center" jc="center">
                <Ionicons name="time-outline" size={22} color="#1B6D24" />
              </YStack>
              <Text color="#1B6D24" fontSize={11} fontWeight="800">
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

          <Pressable onPress={() => router.push("/home")}>
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