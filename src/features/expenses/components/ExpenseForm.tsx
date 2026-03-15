import { useState } from 'react';
import { Text, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select, Card, ResultModal } from '@/components/ui';
import { useCreateExpense } from '@/features/expenses/hooks/useExpenses';
import { expenseFormSchema, type ExpenseFormData } from '@/features/expenses/schemas/expenseForm';
import { EXPENSE_CATEGORY_LABELS, PAYMENT_STATUS_LABELS, DEFAULT_VAT_RATE } from '@/lib/constants';

const categoryOptions = Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const paymentStatusOptions = Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

function parseNumber(text: string): number | undefined {
  const cleaned = text.replace(/[^0-9.,-]/g, '').replace(',', '.');
  const num = Number(cleaned);
  return isNaN(num) ? undefined : num;
}

interface ExpenseFormProps {
  vehicleId: string;
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Partial<ExpenseFormData>;
}

export function ExpenseForm({ vehicleId, onSuccess, onCancel, initialData }: ExpenseFormProps) {
  const createExpense = useCreateExpense();
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      category: '' as ExpenseFormData['category'],
      provider: '',
      amount_ht: 0,
      vat_rate: DEFAULT_VAT_RATE,
      amount_ttc: 0,
      expense_date: new Date().toISOString().split('T')[0],
      payment_status: 'pending' as ExpenseFormData['payment_status'],
      invoice_ref: '',
      notes: '',
      ...initialData,
    },
  });

  const amountHT = watch('amount_ht');
  const vatRate = watch('vat_rate');

  const handleAmountHTChange = (
    value: number | undefined,
    onChange: (v: number | undefined) => void,
  ) => {
    onChange(value);
    if (value !== undefined && vatRate !== undefined) {
      const ttc = Number((value * (1 + vatRate / 100)).toFixed(2));
      setValue('amount_ttc', ttc);
    }
  };

  const handleVatRateChange = (
    value: number | undefined,
    onChange: (v: number | undefined) => void,
  ) => {
    onChange(value);
    if (amountHT !== undefined && value !== undefined) {
      const ttc = Number((amountHT * (1 + value / 100)).toFixed(2));
      setValue('amount_ttc', ttc);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createExpense.mutateAsync({
        vehicle_id: vehicleId,
        category: data.category,
        provider: data.provider || null,
        amount_ht: data.amount_ht,
        vat_rate: data.vat_rate,
        amount_ttc: data.amount_ttc,
        expense_date: data.expense_date,
        payment_status: data.payment_status,
        invoice_ref: data.invoice_ref || null,
        notes: data.notes || null,
      });
      setResult({ type: 'success', message: 'Le frais a été ajouté avec succès.' });
    } catch (error) {
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : "Erreur lors de l'ajout du frais",
      });
    }
  });

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        <Card className="mb-4">
          <Text className="text-text-primary text-lg font-semibold mb-4">Nouveau frais</Text>

          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Catégorie *"
                options={categoryOptions}
                value={value}
                onChange={onChange}
                placeholder="Sélectionner la catégorie"
                error={errors.category?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="provider"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Fournisseur / Prestataire"
                placeholder="Nom du prestataire"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.provider?.message}
                autoCapitalize="words"
              />
            )}
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Controller
                control={control}
                name="amount_ht"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Montant HT *"
                    placeholder="0.00"
                    value={value ? String(value) : ''}
                    onChangeText={(text) => handleAmountHTChange(parseNumber(text), onChange)}
                    onBlur={onBlur}
                    error={errors.amount_ht?.message}
                    keyboardType="decimal-pad"
                  />
                )}
              />
            </View>
            <View className="w-20">
              <Controller
                control={control}
                name="vat_rate"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="TVA %"
                    placeholder="20"
                    value={value !== undefined ? String(value) : ''}
                    onChangeText={(text) => handleVatRateChange(parseNumber(text), onChange)}
                    onBlur={onBlur}
                    error={errors.vat_rate?.message}
                    keyboardType="decimal-pad"
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="amount_ttc"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Montant TTC *"
                placeholder="0.00"
                value={value ? String(value) : ''}
                onChangeText={(text) => onChange(parseNumber(text))}
                onBlur={onBlur}
                error={errors.amount_ttc?.message}
                keyboardType="decimal-pad"
              />
            )}
          />

          <Controller
            control={control}
            name="expense_date"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Date de la prestation *"
                placeholder="AAAA-MM-JJ"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.expense_date?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="payment_status"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Statut de paiement"
                options={paymentStatusOptions}
                value={value}
                onChange={onChange}
                placeholder="Sélectionner le statut"
                error={errors.payment_status?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="invoice_ref"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="N° facture fournisseur"
                placeholder="REF-001"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.invoice_ref?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Notes"
                placeholder="Détails de la prestation..."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.notes?.message}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            )}
          />
        </Card>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button onPress={onCancel} variant="secondary" accessibilityLabel="Annuler">
              Annuler
            </Button>
          </View>
          <View className="flex-1">
            <Button
              onPress={onSubmit}
              loading={createExpense.isPending}
              accessibilityLabel="Enregistrer le frais"
            >
              Enregistrer
            </Button>
          </View>
        </View>
      </ScrollView>

      <ResultModal
        visible={result !== null}
        type={result?.type ?? 'success'}
        title={result?.type === 'success' ? 'Frais enregistré' : 'Erreur'}
        message={result?.message ?? ''}
        actions={
          result?.type === 'success'
            ? [{ label: 'Fermer', onPress: onSuccess }]
            : [{ label: 'Fermer', variant: 'secondary', onPress: () => setResult(null) }]
        }
        onClose={result?.type === 'success' ? onSuccess : () => setResult(null)}
      />
    </KeyboardAvoidingView>
  );
}
