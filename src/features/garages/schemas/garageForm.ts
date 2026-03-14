import { z } from 'zod';

export const garageFormSchema = z.object({
  name: z.string().min(1, 'Le nom du garage est requis'),
  address: z.string().optional(),
  siret: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
});

export type GarageFormData = z.infer<typeof garageFormSchema>;
