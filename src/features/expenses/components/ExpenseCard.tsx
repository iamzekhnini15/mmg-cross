import { useState } from 'react';
import { Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, ConfirmModal } from '@/components/ui';
import type { Expense } from '@/types/database';
import {
  EXPENSE_CATEGORY_LABELS,
  PAYMENT_STATUS_LABELS,
  type ExpenseCategory,
  type PaymentStatus,
} from '@/lib/constants';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(price);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  bodywork: 'color-palette-outline',
  mechanic: 'build-outline',
  technical_control: 'clipboard-outline',
  cleaning: 'sparkles-outline',
  administrative: 'document-text-outline',
  other: 'ellipsis-horizontal-circle-outline',
};

interface ExpenseCardProps {
  expense: Expense;
  onDelete: (id: string) => void;
  onTogglePayment: (id: string, currentStatus: string) => void;
}

export function ExpenseCard({ expense, onDelete, onTogglePayment }: ExpenseCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const categoryLabel =
    EXPENSE_CATEGORY_LABELS[expense.category as ExpenseCategory] ?? expense.category;
  const paymentLabel =
    PAYMENT_STATUS_LABELS[expense.payment_status as PaymentStatus] ?? expense.payment_status;
  const isPaid = expense.payment_status === 'paid';
  const icon = CATEGORY_ICONS[expense.category] ?? 'ellipsis-horizontal-circle-outline';

  return (
    <Card className="mb-3">
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-xl bg-surface-light items-center justify-center mr-3">
            <Ionicons name={icon} size={20} color="#9CA3AF" />
          </View>
          <View className="flex-1">
            <Text className="text-text-primary text-base font-semibold">{categoryLabel}</Text>
            {expense.provider ? (
              <Text className="text-text-muted text-sm mt-0.5">{expense.provider}</Text>
            ) : null}
            <Text className="text-text-muted text-xs mt-1">{formatDate(expense.expense_date)}</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-text-primary text-base font-bold">
            {formatPrice(expense.amount_ttc)}
          </Text>
          <Text className="text-text-muted text-xs mt-0.5">
            HT: {formatPrice(expense.amount_ht)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border/50">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => onTogglePayment(expense.id, expense.payment_status)}
            accessibilityLabel={`Marquer comme ${isPaid ? 'à payer' : 'payé'}`}
          >
            <Badge variant={isPaid ? 'success' : 'warning'} size="sm">
              {paymentLabel}
            </Badge>
          </Pressable>
          {expense.invoice_ref ? (
            <Badge variant="info" size="sm">
              {expense.invoice_ref}
            </Badge>
          ) : null}
        </View>
        <Pressable
          onPress={() => setShowDeleteConfirm(true)}
          className="p-2"
          accessibilityLabel="Supprimer ce frais"
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </Pressable>
      </View>

      {expense.notes ? (
        <Text className="text-text-muted text-xs mt-2 italic">{expense.notes}</Text>
      ) : null}

      <ConfirmModal
        visible={showDeleteConfirm}
        title="Supprimer ce frais"
        message={`${categoryLabel} - ${formatPrice(expense.amount_ttc)}`}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDelete(expense.id);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </Card>
  );
}
