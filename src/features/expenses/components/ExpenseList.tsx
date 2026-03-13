import { useState, useCallback } from 'react';
import { Text, View, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, LoadingSpinner } from '@/components/ui';
import { ExpenseCard } from '@/features/expenses/components/ExpenseCard';
import { ExpenseForm } from '@/features/expenses/components/ExpenseForm';
import {
  useExpensesSummary,
  useDeleteExpense,
  useUpdateExpense,
} from '@/features/expenses/hooks/useExpenses';
import { EXPENSE_CATEGORY_LABELS, type ExpenseCategory } from '@/lib/constants';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(price);
}

interface ExpenseListProps {
  vehicleId: string;
}

export function ExpenseList({ vehicleId }: ExpenseListProps) {
  const { data: expenses, isLoading, summary } = useExpensesSummary(vehicleId);
  const deleteExpense = useDeleteExpense();
  const updateExpense = useUpdateExpense();
  const [showForm, setShowForm] = useState(false);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteExpense.mutateAsync({ id, vehicleId });
      } catch {
        // Error handled by React Query
      }
    },
    [deleteExpense, vehicleId],
  );

  const handleTogglePayment = useCallback(
    async (id: string, currentStatus: string) => {
      const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
      try {
        await updateExpense.mutateAsync({
          id,
          vehicleId,
          updates: { payment_status: newStatus },
        });
      } catch {
        // Error handled by React Query
      }
    },
    [updateExpense, vehicleId],
  );

  return (
    <>
      <Card className="mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-text-primary text-lg font-semibold">Frais de préparation</Text>
          <Pressable
            onPress={() => setShowForm(true)}
            className="flex-row items-center bg-accent/10 rounded-lg px-3 py-1.5"
            accessibilityLabel="Ajouter un frais"
          >
            <Ionicons name="add-circle-outline" size={18} color="#3B82F6" />
            <Text className="text-accent text-sm font-medium ml-1.5">Ajouter</Text>
          </Pressable>
        </View>

        {/* Summary */}
        {expenses && expenses.length > 0 ? (
          <View className="bg-surface-light rounded-xl p-3 mb-3">
            <View className="flex-row justify-between mb-2">
              <Text className="text-text-muted text-sm">Total TTC</Text>
              <Text className="text-text-primary text-base font-bold">
                {formatPrice(summary.totalTTC)}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-text-muted text-sm">Total HT</Text>
              <Text className="text-text-secondary text-sm">{formatPrice(summary.totalHT)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-text-muted text-sm">
                {summary.countPaid} payé(s) · {summary.countPending} en attente
              </Text>
            </View>
            {Object.keys(summary.byCategory).length > 1 ? (
              <View className="mt-3 pt-3 border-t border-border/50">
                {Object.entries(summary.byCategory).map(([cat, amount]) => (
                  <View key={cat} className="flex-row justify-between py-1">
                    <Text className="text-text-muted text-xs">
                      {EXPENSE_CATEGORY_LABELS[cat as ExpenseCategory] ?? cat}
                    </Text>
                    <Text className="text-text-secondary text-xs">{formatPrice(amount)}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {isLoading ? (
          <LoadingSpinner />
        ) : !expenses || expenses.length === 0 ? (
          <View className="items-center py-8">
            <Ionicons name="receipt-outline" size={40} color="#6B7280" />
            <Text className="text-text-muted text-sm mt-2">Aucun frais enregistré</Text>
          </View>
        ) : null}
      </Card>

      {/* Expense cards */}
      {expenses?.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          onDelete={handleDelete}
          onTogglePayment={handleTogglePayment}
        />
      ))}

      {/* Add expense modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowForm(false)}
      >
        <View className="flex-1 bg-background">
          <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
            <Text className="text-text-primary text-xl font-bold">Ajouter un frais</Text>
            <Pressable
              onPress={() => setShowForm(false)}
              className="p-2"
              accessibilityLabel="Fermer"
            >
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </Pressable>
          </View>
          <ExpenseForm
            vehicleId={vehicleId}
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </View>
      </Modal>
    </>
  );
}
