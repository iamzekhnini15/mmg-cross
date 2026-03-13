import { z } from 'zod';
import { VEHICLE_STATUSES, FUEL_TYPES, TRANSMISSION_TYPES, SELLER_TYPES } from '@/lib/constants';

const fuelTypeValues = Object.values(FUEL_TYPES) as [string, ...string[]];
const transmissionValues = Object.values(TRANSMISSION_TYPES) as [string, ...string[]];
const sellerTypeValues = Object.values(SELLER_TYPES) as [string, ...string[]];
const statusValues = Object.values(VEHICLE_STATUSES) as [string, ...string[]];

export const vehicleFormSchema = z.object({
  brand: z.string().min(1, 'La marque est requise'),
  model: z.string().min(1, 'Le modèle est requis'),
  version: z.string(),
  year: z
    .number({ error: "L'année doit être un nombre" })
    .int("L'année doit être un entier")
    .min(1900, "L'année doit être supérieure à 1900")
    .max(new Date().getFullYear() + 1, "L'année ne peut pas être dans le futur"),
  mileage: z
    .number({ error: 'Le kilométrage doit être un nombre' })
    .int('Le kilométrage doit être un entier')
    .min(0, 'Le kilométrage ne peut pas être négatif'),
  vin: z.string().refine((val) => val === '' || val.length === 17, {
    message: 'Le VIN doit contenir exactement 17 caractères',
  }),
  license_plate: z.string(),
  fuel_type: z.enum(fuelTypeValues, {
    error: 'Le type de carburant est requis',
  }),
  transmission: z.enum(transmissionValues, {
    error: 'Le type de boîte est requis',
  }),
  color: z.string(),
  doors: z
    .number({ error: 'Le nombre de portes doit être un nombre' })
    .int()
    .min(2, 'Minimum 2 portes')
    .max(5, 'Maximum 5 portes')
    .optional(),
  purchase_price: z
    .number({ error: "Le prix d'achat doit être un nombre" })
    .positive("Le prix d'achat doit être positif"),
  purchase_date: z.string().min(1, "La date d'achat est requise"),
  seller_type: z.enum(sellerTypeValues, {
    error: 'Le type de vendeur est requis',
  }),
  seller_name: z.string(),
  seller_phone: z.string(),
  notes: z.string(),
  status: z.enum(statusValues).optional(),
});

export type VehicleFormData = z.infer<typeof vehicleFormSchema>;
