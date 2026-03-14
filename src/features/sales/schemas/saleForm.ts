import { z } from 'zod';
import { PAYMENT_METHODS, WARRANTY_OPTIONS, CLIENT_TYPES, CIVILITIES } from '@/lib/constants';

const paymentMethodValues = Object.values(PAYMENT_METHODS) as [string, ...string[]];
const warrantyValues = Object.values(WARRANTY_OPTIONS) as [string, ...string[]];
const clientTypeValues = Object.values(CLIENT_TYPES) as [string, ...string[]];
const civilityValues = Object.values(CIVILITIES) as [string, ...string[]];

export const saleFormSchema = z
  .object({
    // Client info
    client_civility: z.enum(civilityValues).optional(),
    client_firstname: z.string().min(1, 'Le prénom est requis'),
    client_lastname: z.string().min(1, 'Le nom est requis'),
    client_address: z.string().optional(),
    client_zip: z.string().optional(),
    client_city: z.string().optional(),
    client_country: z.string().min(1, 'Le pays est requis'),
    client_phone: z.string().optional(),
    client_email: z.string().email('Email invalide').optional().or(z.literal('')),
    client_type: z.enum(clientTypeValues),

    // Professional fields
    company_name: z.string().optional(),
    siret: z.string().optional(),
    vat_number: z.string().optional(),

    // Sale details
    sale_price: z
      .number({ error: 'Le prix de vente est requis' })
      .positive('Le prix doit être positif'),
    payment_method: z.enum(paymentMethodValues, { error: 'Le mode de paiement est requis' }),
    sale_date: z.string().min(1, 'La date de vente est requise'),
    mileage_at_sale: z.number().int().nonnegative().optional(),
    warranty: z.enum(warrantyValues),
  })
  .refine(
    (data) => {
      if (data.client_type === 'professional') {
        return !!data.company_name && data.company_name.length > 0;
      }
      return true;
    },
    {
      message: 'La raison sociale est requise pour un professionnel',
      path: ['company_name'],
    },
  );

export type SaleFormData = z.infer<typeof saleFormSchema>;
