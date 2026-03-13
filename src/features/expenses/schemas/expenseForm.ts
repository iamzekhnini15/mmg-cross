import { z } from 'zod';
import { EXPENSE_CATEGORIES, PAYMENT_STATUSES } from '@/lib/constants';

const expenseCategoryValues = Object.values(EXPENSE_CATEGORIES) as [string, ...string[]];
const paymentStatusValues = Object.values(PAYMENT_STATUSES) as [string, ...string[]];

export const expenseFormSchema = z.object({
  category: z.enum(expenseCategoryValues, {
    error: 'Catégorie requise',
  }),
  provider: z.string().optional(),
  amount_ht: z.number({ error: 'Montant HT requis' }).min(0, 'Le montant doit être positif'),
  vat_rate: z
    .number()
    .min(0, 'La TVA ne peut pas être négative')
    .max(100, 'La TVA ne peut pas dépasser 100%'),
  amount_ttc: z.number({ error: 'Montant TTC requis' }).min(0, 'Le montant doit être positif'),
  expense_date: z.string().min(1, 'Date requise'),
  payment_status: z.enum(paymentStatusValues),
  invoice_ref: z.string().optional(),
  notes: z.string().optional(),
});

export type ExpenseFormData = z.infer<typeof expenseFormSchema>;
