import type {
    TransactionCategory,
    TransactionInput,
    TransactionRecord,
    TransactionType,
} from "@/entities/finance/model/types";
import { useFinance } from "@/features/finance/model/useFinance";
import { useSession } from "@/features/session/model/useSession";
import { Input } from "@/shared/ui/Input";
import { LottieIllustration } from "@/shared/ui/LottieIllustration";
import { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import {
    Button,
    Card,
    Paragraph,
    Separator,
    Text,
    XStack,
    YStack
} from "tamagui";

const categories: { label: string; value: TransactionCategory | "all" }[] = [
  { label: "Todas", value: "all" },
  { label: "Alimentación", value: "alimentacion" },
  { label: "Transporte", value: "transporte" },
  { label: "Servicios", value: "servicios" },
  { label: "Educación", value: "educacion" },
  { label: "Salario", value: "salario" },
  { label: "Otros", value: "otros" },
];

const types: { label: string; value: TransactionType | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Ingreso", value: "income" },
  { label: "Gasto", value: "expense" },
];

const typeLabels: Record<TransactionType, string> = {
  income: "Ingreso",
  expense: "Gasto",
};

const categoryLabels: Record<TransactionCategory, string> = {
  alimentacion: "Alimentación",
  transporte: "Transporte",
  servicios: "Servicios",
  educacion: "Educación",
  salario: "Salario",
  otros: "Otros",
};

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

const initialDate = () => new Date().toISOString().slice(0, 10);

const initialFormState = (): TransactionInput => ({
  description: "",
  amount: 0,
  category: "alimentacion",
  type: "expense",
  transaction_date: initialDate(),
});

const money = (value: number) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

const formatDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

interface FormState extends TransactionInput {
  amountText: string;
}

const createFormState = (): FormState => {
  const base = initialFormState();
  return {
    ...base,
    amountText: "",
  };
};

const transactionToForm = (transaction: TransactionRecord): FormState => ({
  description: transaction.description,
  amount: transaction.amount,
  amountText: String(transaction.amount),
  category: transaction.category,
  type: transaction.type,
  transaction_date: transaction.transaction_date,
});

export const HomePage = () => {
  const { user, signOut } = useSession();
  const [form, setForm] = useState<FormState>(createFormState);
  const [editingTransaction, setEditingTransaction] = useState<TransactionRecord | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | "all">("all");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const { transactions, isTransactionsLoading, createTransaction, updateTransaction, deleteTransaction, changePassword } =
    useFinance(user?.id, {
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

  const resetTransactionForm = () => {
    setForm(createFormState());
    setEditingTransaction(null);
  };

  const validateTransactionForm = () => {
    if (!form.description.trim()) {
      Alert.alert("Campo requerido", "Agrega una descripción.");
      return false;
    }

    if (!form.amountText || Number.isNaN(Number(form.amountText)) || Number(form.amountText) <= 0) {
      Alert.alert("Monto inválido", "Ingresa un monto mayor a cero.");
      return false;
    }

    if (!form.transaction_date.trim()) {
      Alert.alert("Campo requerido", "Selecciona una fecha.");
      return false;
    }

    return true;
  };

  const submitTransaction = async () => {
    if (!validateTransactionForm()) return;

    const payload: TransactionInput = {
      description: form.description.trim(),
      amount: Number(form.amountText),
      category: form.category,
      type: form.type,
      transaction_date: form.transaction_date,
    };

    try {
      if (editingTransaction) {
        await updateTransaction.mutateAsync({
          transactionId: editingTransaction.id,
          input: payload,
        });
      } else {
        await createTransaction.mutateAsync(payload);
      }

      setFeedback(editingTransaction ? "Transacción actualizada con éxito." : "Transacción registrada con éxito.");
      setTimeout(() => setFeedback(null), 1800);
      resetTransactionForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar la transacción.";
      Alert.alert("Error", message);
    }
  };

  const handleEdit = (transaction: TransactionRecord) => {
    setEditingTransaction(transaction);
    setForm(transactionToForm(transaction));
  };

  const handleDelete = (transaction: TransactionRecord) => {
    Alert.alert(
      "Eliminar transacción",
      `¿Quieres eliminar "${transaction.description}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTransaction.mutateAsync(transaction.id);
              if (editingTransaction?.id === transaction.id) {
                resetTransactionForm();
              }
            } catch (error) {
              const message = error instanceof Error ? error.message : "No se pudo eliminar la transacción.";
              Alert.alert("Error", message);
            }
          },
        },
      ]
    );
  };

  const validatePasswordForm = () => {
    if (!password || !passwordConfirm) {
      Alert.alert("Campo requerido", "Completa la nueva contraseña y su confirmación.");
      return false;
    }

    if (password.length < 8) {
      Alert.alert("Contraseña débil", "La nueva contraseña debe tener al menos 8 caracteres.");
      return false;
    }

    if (password !== passwordConfirm) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return false;
    }

    return true;
  };

  const submitPasswordChange = async () => {
    if (!validatePasswordForm()) return;

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

  const renderTransaction = ({ item }: { item: TransactionRecord }) => {
    const isIncome = item.type === "income";

    return (
      <Card
        bg="$cardBackground"
        borderColor="$borderColor"
        borderWidth={1}
        shadowColor="#0F172A"
        shadowOpacity={0.06}
        shadowRadius={16}
        shadowOffset={{ width: 0, height: 8 }}
        elevation={3}
        p="$4"
        mb="$3"
        br="$5"
      >
        <XStack jc="space-between" ai="center" gap="$3">
          <YStack f={1} gap="$2">
            <XStack ai="center" gap="$2">
              <YStack
                w={12}
                h={12}
                br={9999}
                bg={isIncome ? "#DCFCE7" : "#FEE2E2"}
              />
              <Text fontSize="$5" fontWeight="700" color="$color">
                {item.description}
              </Text>
            </XStack>
            <Paragraph color="$mutedColor" size="$2">
              {categoryLabels[item.category]} · {formatDate(item.transaction_date)}
            </Paragraph>
          </YStack>

          <YStack ai="flex-end" gap="$2">
            <Text fontSize="$5" fontWeight="800" color={isIncome ? "#15803D" : "#B91C1C"}>
              {isIncome ? "+" : "-"}{money(item.amount)}
            </Text>
            <Text fontSize="$2" color="$mutedColor">
              {typeLabels[item.type]}
            </Text>
          </YStack>
        </XStack>

        <Separator my="$3" borderColor="$borderColor" />

        <XStack gap="$2" flexWrap="wrap">
          <Button
            {...pillButtonProps}
            bg="$surfaceMuted"
            color="$slate11"
            onPress={() => handleEdit(item)}
          >
            Editar
          </Button>
          <Button
            {...pillButtonProps}
            bg="#FEE2E2"
            color="$rose10"
            onPress={() => handleDelete(item)}
          >
            Eliminar
          </Button>
        </XStack>
      </Card>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F3F6FC" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} keyboardShouldPersistTaps="handled">
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
        >
          <YStack bg="$primary" p="$6" gap="$3" ai="center">
            <LottieIllustration variant="hero" size={148} />
            <YStack ai="center" gap="$1">
              <Text color="white" fontSize="$7" fontWeight="800">
                Finanzas Inteligentes
              </Text>
              <Paragraph color="#DDE8FF" size="$3" ta="center">
                Controla ingresos, gastos y seguridad desde un solo panel.
              </Paragraph>
            </YStack>
          </YStack>

          <YStack p="$4" gap="$4">
            <XStack flexWrap="wrap" gap="$3">
              <Card f={1} minWidth={120} bg="#ECFDF5" borderColor="#A7F3D0" borderWidth={1} p="$3" br="$5">
                <Paragraph color="#166534" size="$2">
                  Ingresos
                </Paragraph>
                <Text fontSize="$6" fontWeight="800" color="#15803D">
                  {money(summary.income)}
                </Text>
              </Card>
              <Card f={1} minWidth={120} bg="#FFF1F2" borderColor="#FDA4AF" borderWidth={1} p="$3" br="$5">
                <Paragraph color="#991B1B" size="$2">
                  Gastos
                </Paragraph>
                <Text fontSize="$6" fontWeight="800" color="#B91C1C">
                  {money(summary.expense)}
                </Text>
              </Card>
              <Card f={1} minWidth={120} bg="$soft" borderColor="$borderColor" borderWidth={1} p="$3" br="$5">
                <Paragraph color="$mutedColor" size="$2">
                  Balance
                </Paragraph>
                <Text fontSize="$6" fontWeight="800" color="$color">
                  {money(summary.balance)}
                </Text>
              </Card>
            </XStack>

            <YStack gap="$2">
              <Text fontSize="$4" fontWeight="700" color="$color">
                Usuario
              </Text>
              <Paragraph color="$mutedColor">{user?.email}</Paragraph>
            </YStack>
          </YStack>
        </Card>

        <Card
          bg="$cardBackground"
          borderColor="$borderColor"
          borderWidth={1}
          shadowColor="#0F172A"
          shadowOpacity={0.06}
          shadowRadius={16}
          shadowOffset={{ width: 0, height: 8 }}
          elevation={3}
          p="$4"
        >
          <YStack gap="$4">
            <XStack jc="space-between" ai="center">
              <Text fontSize="$6" fontWeight="800">
                {editingTransaction ? "Editar transacción" : "Nueva transacción"}
              </Text>
              {editingTransaction ? (
                <Button chromeless px="$0" py="$0" fontSize={14} fontWeight="700" color="$secondary" onPress={resetTransactionForm}>
                  Cancelar edición
                </Button>
              ) : null}
            </XStack>

            {feedback ? (
              <Card bg="#ECFDF5" p="$3" borderColor="$success" borderWidth={1}>
                <XStack ai="center" gap="$3">
                  <LottieIllustration variant="success" size={58} loop={false} />
                  <Paragraph color="#065F46" fontWeight="700" f={1}>
                    {feedback}
                  </Paragraph>
                </XStack>
              </Card>
            ) : null}

            <YStack gap="$3">
              <Input
                label="Descripción"
                value={form.description}
                onChangeText={(value) => setForm((current) => ({ ...current, description: value }))}
                placeholder="Ej. Supermercado"
              />

              <XStack gap="$3" flexWrap="wrap">
                <YStack f={1} minWidth={140}>
                  <Input
                    label="Monto"
                    value={form.amountText}
                    onChangeText={(value) => setForm((current) => ({ ...current, amountText: value }))}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                  />
                </YStack>

                <YStack f={1} minWidth={140}>
                  <Input
                    label="Fecha"
                    value={form.transaction_date}
                    onChangeText={(value) => setForm((current) => ({ ...current, transaction_date: value }))}
                    placeholder="YYYY-MM-DD"
                  />
                </YStack>
              </XStack>

              <YStack gap="$2">
                <Text color="$mutedColor">Categoría</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <XStack gap="$2">
                    {categories
                      .filter((item) => item.value !== "all")
                      .map((item) => (
                        <Button
                          key={item.value}
                            {...pillButtonProps}
                            bg={form.category === item.value ? "$primary" : "$surfaceMuted"}
                            color={form.category === item.value ? "white" : "$slate11"}
                          onPress={() => setForm((current) => ({ ...current, category: item.value as TransactionCategory }))}
                        >
                          {item.label}
                        </Button>
                      ))}
                  </XStack>
                </ScrollView>
              </YStack>

              <YStack gap="$2">
                <Text color="$mutedColor">Tipo</Text>
                <XStack gap="$2" flexWrap="wrap">
                  {types.filter((item) => item.value !== "all").map((item) => (
                    <Button
                      key={item.value}
                      {...pillButtonProps}
                      bg={form.type === item.value ? "$primary" : "$surfaceMuted"}
                      color={form.type === item.value ? "white" : "$slate11"}
                      onPress={() => setForm((current) => ({ ...current, type: item.value as TransactionType }))}
                    >
                      {item.label}
                    </Button>
                  ))}
                </XStack>
              </YStack>

              <Button
                {...primaryButtonProps}
                bg="$primary"
                color="white"
                disabled={createTransaction.isPending || updateTransaction.isPending}
                onPress={submitTransaction}
              >
                {editingTransaction
                  ? updateTransaction.isPending
                    ? "Actualizando..."
                    : "Guardar cambios"
                  : createTransaction.isPending
                    ? "Guardando..."
                    : "Registrar transacción"}
              </Button>
            </YStack>
          </YStack>
        </Card>

        <Card
          bg="$cardBackground"
          borderColor="$borderColor"
          borderWidth={1}
          shadowColor="#0F172A"
          shadowOpacity={0.06}
          shadowRadius={16}
          shadowOffset={{ width: 0, height: 8 }}
          elevation={3}
          p="$4"
        >
          <YStack gap="$4">
            <Text fontSize="$6" fontWeight="800">
              Historial de transacciones
            </Text>

            <Input
              label="Buscar por descripción"
              value={search}
              onChangeText={setSearch}
              placeholder="Escribe para filtrar"
            />

            <YStack gap="$2">
              <Text color="$mutedColor">Filtrar por categoría</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack gap="$2">
                  {categories.map((item) => (
                    <Button
                      key={item.value}
                      {...pillButtonProps}
                      bg={categoryFilter === item.value ? "$primary" : "$surfaceMuted"}
                      color={categoryFilter === item.value ? "white" : "$slate11"}
                      onPress={() => setCategoryFilter(item.value)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </XStack>
              </ScrollView>
            </YStack>

            <XStack gap="$2" flexWrap="wrap">
              {types.map((item) => (
                <Button
                  key={item.value}
                  {...pillButtonProps}
                  bg={typeFilter === item.value ? "$primary" : "$surfaceMuted"}
                  color={typeFilter === item.value ? "white" : "$slate11"}
                  onPress={() => setTypeFilter(item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </XStack>

            {isTransactionsLoading ? (
              <Card bg="$surfaceMuted" borderColor="$borderColor" borderWidth={1} p="$4" ai="center">
                <LottieIllustration variant="loading" size={110} />
                <Paragraph color="$mutedColor" mt="$2">
                  Cargando tus movimientos financieros...
                </Paragraph>
              </Card>
            ) : null}

            <YStack gap="$3">
              {transactions.length > 0 ? (
                transactions.map((item) => (
                  <YStack key={item.id}>{renderTransaction({ item })}</YStack>
                ))
              ) : (
                <Card bg="$soft" borderColor="$borderColor" borderWidth={1} p="$4">
                  <Paragraph color="$mutedColor">
                    No hay transacciones para los filtros actuales.
                  </Paragraph>
                </Card>
              )}
            </YStack>
          </YStack>
        </Card>

        <Card
          bg="$cardBackground"
          borderColor="$borderColor"
          borderWidth={1}
          shadowColor="#0F172A"
          shadowOpacity={0.06}
          shadowRadius={16}
          shadowOffset={{ width: 0, height: 8 }}
          elevation={3}
          p="$4"
        >
          <YStack gap="$4">
            <Text fontSize="$6" fontWeight="800">
              Perfil y seguridad
            </Text>

            <YStack gap="$3">
              <Input
                label="Nueva contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Mínimo 8 caracteres"
              />

              <Input
                label="Confirmar contraseña"
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                secureTextEntry
                placeholder="Repite la nueva contraseña"
              />

              <Button
                {...primaryButtonProps}
                bg="$secondary"
                color="white"
                disabled={changePassword.isPending}
                onPress={submitPasswordChange}
              >
                {changePassword.isPending ? "Actualizando..." : "Cambiar contraseña"}
              </Button>

              <Button {...pillButtonProps} bg="$surfaceMuted" color="$slate11" onPress={() => signOut()}>
                Cerrar sesión
              </Button>
            </YStack>
          </YStack>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};