import type { TransactionCategory, TransactionRecord, TransactionType } from "@/entities/finance/model/types";
import { useFinance } from "@/features/finance/model/useFinance";
import { useSession } from "@/features/session/model/useSession";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, TextInput } from "react-native";
import { Button, Card, Paragraph, Text, XStack, YStack } from "tamagui";

type DraftState = {
  name: string;
  amount: string;
  note: string;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
};

const categoryOptions: { label: string; value: TransactionCategory }[] = [
  { label: "Comida", value: "alimentacion" },
  { label: "Transporte", value: "transporte" },
  { label: "Hogar", value: "servicios" },
  { label: "Salud", value: "educacion" },
  { label: "Otros", value: "otros" },
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

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));

const initialDraft = (): DraftState => ({
  name: "",
  amount: "",
  note: "",
  type: "expense",
  category: "alimentacion",
  date: new Date().toISOString().slice(0, 10),
});

const formButtonProps = {
  minHeight: 54,
  br: 18,
  fontSize: 16,
  fontWeight: "800" as const,
};

const typeButtonProps = {
  minHeight: 48,
  px: "$5",
  py: "$3",
  br: 9999,
  fontSize: 14,
  fontWeight: "800" as const,
};

export const PhotoEvidenceScreen = () => {
  const { user } = useSession();
  const { transactions, createTransaction, updateTransaction, deleteTransaction, isTransactionsLoading } = useFinance(user?.id, {
    search: "",
    category: "all",
    type: "all",
  });

  const [draft, setDraft] = useState<DraftState>(initialDraft);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((left, right) => right.transaction_date.localeCompare(left.transaction_date) || right.created_at.localeCompare(left.created_at));
  }, [transactions]);

  const summary = useMemo(() => {
    const total = transactions.reduce((accumulator, entry) => accumulator + Number(entry.amount || 0), 0);
    return {
      total,
      count: transactions.length,
    };
  }, [transactions]);

  const clearDraft = () => {
    setEditingId(null);
    setDraft(initialDraft());
  };

  const saveTransaction = async () => {
    const isEditing = Boolean(editingId);

    if (!user?.id) {
      Alert.alert("Sesión requerida", "Inicia sesión para guardar transacciones.");
      return;
    }

    if (!draft.name.trim()) {
      Alert.alert("Campo requerido", "Escribe un nombre para la transacción.");
      return;
    }

    if (!draft.amount.trim() || Number.isNaN(Number(draft.amount)) || Number(draft.amount) <= 0) {
      Alert.alert("Monto inválido", "Ingresa un monto válido mayor a cero.");
      return;
    }

    const description = draft.note.trim() ? `${draft.name.trim()} - ${draft.note.trim()}` : draft.name.trim();

    try {
      const payload = {
        description,
        amount: Number(draft.amount),
        category: draft.category,
        type: draft.type,
        transaction_date: draft.date,
      };

      if (editingId) {
        await updateTransaction.mutateAsync({ transactionId: editingId, input: payload });
      } else {
        await createTransaction.mutateAsync(payload);
      }

      clearDraft();
      Alert.alert(isEditing ? "Actualizado" : "Guardado", "La transacción quedó registrada y aparecerá en home e historial.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar la transacción.";
      Alert.alert("Error", message);
    }
  };

  const editTransaction = (transaction: TransactionRecord) => {
    const [name, ...noteParts] = transaction.description.split(" - ");
    setEditingId(transaction.id);
    setDraft({
      name: name.trim(),
      amount: String(transaction.amount),
      note: noteParts.join(" - ").trim(),
      type: transaction.type,
      category: transaction.category,
      date: transaction.transaction_date,
    });
  };

  const removeTransaction = (transactionId: string) => {
    Alert.alert("Eliminar transacción", "¿Quieres borrar esta transacción?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => deleteTransaction.mutate(transactionId) },
    ]);
  };

  return (
    <YStack f={1} bg="#FCF9F8">
      <YStack position="absolute" top={-90} right={-80} w={240} h={240} br={120} bg="#DFF3EA" opacity={0.85} />
      <YStack position="absolute" top={220} left={-90} w={180} h={180} br={90} bg="#E8F1FF" opacity={0.65} />

      <ScrollView contentContainerStyle={{ paddingTop: 20, paddingBottom: 140 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <YStack gap="$4" px="$4" maxWidth={760} width="100%" alignSelf="center">
          <Card bg="rgba(255,255,255,0.9)" borderColor="#D8E0EC" borderWidth={1} shadowColor="#0F172A" shadowOpacity={0.06} shadowRadius={18} shadowOffset={{ width: 0, height: 8 }} elevation={3} overflow="hidden">
            <YStack px="$4" pt="$4" pb="$4" gap="$4">
              <XStack ai="center" jc="space-between">
                <XStack ai="center" gap="$3" f={1}>
                  <Button chromeless px="$0" py="$0" onPress={() => router.back()}>
                    <YStack w={44} h={44} br={22} bg="#EEF4FF" ai="center" jc="center">
                      <Ionicons name="arrow-back" size={22} color="#004D99" />
                    </YStack>
                  </Button>
                  <YStack f={1}>
                    <Text fontSize={22} fontWeight="900" color="#1C1B1B">
                      Nueva Transacción
                    </Text>
                    <Paragraph color="#5C667A" size="$2">
                      Se guarda directamente en home e historial.
                    </Paragraph>
                  </YStack>
                </XStack>

                <YStack w={44} h={44} br={22} bg="#A3F69C" ai="center" jc="center" borderWidth={2} borderColor="#1B6D24">
                  <MaterialCommunityIcons name="cash-multiple" size={22} color="#1B6D24" />
                </YStack>
              </XStack>

              <XStack bg="#E5E2E1" p="$1" br={9999}>
                <Button
                  {...typeButtonProps}
                  f={1}
                  bg={draft.type === "expense" ? "$secondary" : "transparent"}
                  color="white"
                  onPress={() => setDraft((current) => ({ ...current, type: "expense" }))}
                >
                  Gasto
                </Button>
                <Button
                  {...typeButtonProps}
                  f={1}
                  bg={draft.type === "income" ? "$primary" : "transparent"}
                  color="white"
                  onPress={() => setDraft((current) => ({ ...current, type: "income" }))}
                >
                  Ingreso
                </Button>
              </XStack>

              <YStack gap="$3">
                <YStack gap="$2">
                  <Text color="#727783" fontSize={12} fontWeight="800" textTransform="uppercase">
                    Categoría
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <XStack gap="$2" pr="$2">
                      {categoryOptions.map((item) => {
                        const isActive = draft.category === item.value;
                        return (
                          <Button
                            key={item.value}
                            minHeight={40}
                            px="$4"
                            br={9999}
                            bg={isActive ? (draft.type === "income" ? "$primary" : "$secondary") : "$surface-container-high"}
                            color="white"
                            fontWeight="800"
                            onPress={() => setDraft((current) => ({ ...current, category: item.value }))}
                          >
                            {item.label}
                          </Button>
                        );
                      })}
                    </XStack>
                  </ScrollView>
                </YStack>

                <YStack gap="$2">
                  <Text color="#727783" fontSize={12} fontWeight="800" textTransform="uppercase">
                    Fecha
                  </Text>
                  <TextInput
                    value={draft.date}
                    onChangeText={(value) => setDraft((current) => ({ ...current, date: value }))}
                    placeholder="AAAA-MM-DD"
                    placeholderTextColor="#94A3B8"
                    style={{
                      width: "100%",
                      minHeight: 56,
                      borderWidth: 1,
                      borderColor: "#D6EAE2",
                      borderRadius: 18,
                      backgroundColor: "#F6FCF9",
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 16,
                      color: "#1C1B1B",
                    }}
                  />
                </YStack>
              </YStack>

              <YStack gap="$3" ai="center">
                <YStack ai="center" gap="$1">
                  <Text fontSize={13} fontWeight="800" color="#727783" textTransform="uppercase">
                    Monto
                  </Text>
                  <Text fontSize={42} fontWeight="900" color={draft.type === "income" ? "$primary" : "$secondary"}>
                    $
                  </Text>
                </YStack>

                <YStack w="100%" ai="center">
                  <TextInput
                    value={draft.amount}
                    onChangeText={(value) => setDraft((current) => ({ ...current, amount: value }))}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    placeholderTextColor="#B8BDC7"
                    style={{
                      width: "100%",
                      textAlign: "center",
                      fontSize: 34,
                      lineHeight: 40,
                      fontWeight: "700",
                      color: draft.type === "income" ? "#004D99" : "#1B6D24",
                      paddingVertical: 4,
                    }}
                  />
                </YStack>
              </YStack>

              <YStack gap="$3">
                <YStack gap="$2">
                  <Text color="#727783" fontSize={12} fontWeight="800" textTransform="uppercase">
                    Nombre
                  </Text>
                  <TextInput
                    value={draft.name}
                    onChangeText={(value) => setDraft((current) => ({ ...current, name: value }))}
                    placeholder="Supermercado, recibo, factura..."
                    placeholderTextColor="#94A3B8"
                    style={{
                      width: "100%",
                      minHeight: 56,
                      borderWidth: 1,
                      borderColor: "#D6EAE2",
                      borderRadius: 18,
                      backgroundColor: "#F6FCF9",
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 16,
                      color: "#1C1B1B",
                    }}
                  />
                </YStack>

                <YStack gap="$2">
                  <Text color="#727783" fontSize={12} fontWeight="800" textTransform="uppercase">
                    Nota
                  </Text>
                  <TextInput
                    value={draft.note}
                    onChangeText={(value) => setDraft((current) => ({ ...current, note: value }))}
                    placeholder="Detalle opcional"
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    style={{
                      width: "100%",
                      minHeight: 100,
                      borderWidth: 1,
                      borderColor: "#D6EAE2",
                      borderRadius: 18,
                      backgroundColor: "#F6FCF9",
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 16,
                      color: "#1C1B1B",
                    }}
                  />
                </YStack>

                <XStack gap="$2" flexWrap="wrap">
                  <Button {...formButtonProps} f={1} bg="#004D99" onPress={saveTransaction}>
                    <Text color="white" fontSize={16} fontWeight="800">
                      Guardar comprobante
                    </Text>
                  </Button>
                  <Button {...formButtonProps} f={1} bg="#1B6D24" onPress={clearDraft}>
                    <Text color="white" fontSize={16} fontWeight="800">
                      Limpiar
                    </Text>
                  </Button>
                </XStack>
              </YStack>
            </YStack>
          </Card>

          <Card bg="rgba(255,255,255,0.84)" borderColor="#D8E0EC" borderWidth={1} shadowColor="#0F172A" shadowOpacity={0.05} shadowRadius={16} shadowOffset={{ width: 0, height: 8 }} elevation={2} px="$4" py="$4">
            <XStack ai="center" jc="space-between" mb="$3">
              <YStack>
                <Text fontSize={22} fontWeight="900" color="#1C1B1B">
                  Transacciones guardadas
                </Text>
                <Paragraph color="#5C667A" size="$2">
                  Estas son las mismas que verás en home e historial.
                </Paragraph>
              </YStack>
            </XStack>

            <YStack gap="$3">
              {isTransactionsLoading ? (
                <Card bg="#F6F3F2" borderColor="#E5E2E1" borderWidth={1} px="$4" py="$5" ai="center">
                  <Text fontSize={16} fontWeight="800" color="#1C1B1B" textAlign="center">
                    Cargando transacciones...
                  </Text>
                </Card>
              ) : sortedTransactions.length === 0 ? (
                <Card bg="#F6F3F2" borderColor="#E5E2E1" borderWidth={1} px="$4" py="$5" ai="center">
                  <Text fontSize={16} fontWeight="800" color="#1C1B1B" textAlign="center">
                    Todavía no hay transacciones guardadas.
                  </Text>
                  <Paragraph color="#5C667A" size="$2" textAlign="center" mt="$1">
                    Completa el formulario para registrar la primera.
                  </Paragraph>
                </Card>
              ) : (
                sortedTransactions.map((transaction) => {
                  const isIncome = transaction.type === "income";
                  const note = transaction.description.includes(" - ") ? transaction.description.split(" - ").slice(1).join(" - ") : "";

                  return (
                    <Card key={transaction.id} bg="white" borderColor="#E5E2E1" borderWidth={1} overflow="hidden">
                      <XStack gap="$3" p="$3" ai="flex-start">
                        <YStack w={56} h={56} br={16} bg={isIncome ? "#E8F4FF" : "#EAF7EA"} ai="center" jc="center">
                          <MaterialCommunityIcons name={categoryIcons[transaction.category]} size={24} color={isIncome ? "#004D99" : "#1B6D24"} />
                        </YStack>

                        <YStack f={1} gap="$2">
                          <XStack ai="center" jc="space-between" gap="$2">
                            <YStack f={1} gap="$1">
                              <Text fontSize={17} fontWeight="900" color="#1C1B1B" numberOfLines={1}>
                                {transaction.description.split(" - ")[0]}
                              </Text>
                              <Text color="#5C667A" fontSize={12}>
                                {categoryLabels[transaction.category]} · {formatDate(transaction.transaction_date)} · {isIncome ? "Ingreso" : "Gasto"}
                              </Text>
                            </YStack>

                            <Text fontSize={18} fontWeight="900" color={isIncome ? "#004D99" : "#1B6D24"}>
                              {money(transaction.amount)}
                            </Text>
                          </XStack>

                          {note ? (
                            <Paragraph color="#5C667A" size="$2" numberOfLines={2}>
                              {note}
                            </Paragraph>
                          ) : null}

                          <XStack gap="$2" flexWrap="wrap">
                            <Card bg={isIncome ? "#E8F4FF" : "#EAF7EA"} px="$2" py="$1" br={9999}>
                              <Text color={isIncome ? "#004D99" : "#1B6D24"} fontSize={11} fontWeight="800">
                                {transaction.type === "income" ? "Ingreso" : "Gasto"}
                              </Text>
                            </Card>
                            <Button chromeless px="$0" py="$0" onPress={() => editTransaction(transaction)}>
                              <Text color="#004D99" fontSize={12} fontWeight="700">
                                Editar
                              </Text>
                            </Button>
                            <Button chromeless px="$0" py="$0" onPress={() => removeTransaction(transaction.id)}>
                              <Text color="#A10012" fontSize={12} fontWeight="700">
                                Eliminar
                              </Text>
                            </Button>
                          </XStack>
                        </YStack>
                      </XStack>
                    </Card>
                  );
                })
              )}
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

          <Pressable onPress={() => router.replace("/comprobantes")}>
            <YStack ai="center" gap="$1">
              <YStack bg="#A3F69C" w={44} h={44} br={22} ai="center" jc="center">
                <Ionicons name="swap-horizontal-outline" size={22} color="#1B6D24" />
              </YStack>
              <Text color="#1B6D24" fontSize={11} fontWeight="800">
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