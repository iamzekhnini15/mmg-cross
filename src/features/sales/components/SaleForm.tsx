import { Button, Card, Input, ResultModal, Select } from '@/components/ui';
import { generateInvoiceNumber, useCreateSale } from '@/features/sales/hooks/useSales';
import { saleFormSchema, type SaleFormData } from '@/features/sales/schemas/saleForm';
import {
  CIVILITY_LABELS,
  CLIENT_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  WARRANTY_LABELS,
} from '@/lib/constants';
import { generateInvoiceHtml } from '@/lib/pdf/invoiceTemplate';
import { fillInvoiceDocx } from '@/lib/pdf/fillDocxTemplate';
import { useGarageStore } from '@/stores/garageStore';
import type { Vehicle } from '@/types/database';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Platform, ScrollView, Text, View } from 'react-native';
import { useUploadDocument } from '@/features/media/hooks/useMedia';

const paymentOptions = Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const warrantyOptions = Object.entries(WARRANTY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const clientTypeOptions = Object.entries(CLIENT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const civilityOptions = Object.entries(CIVILITY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

function parseNumber(text: string): number | undefined {
  const cleaned = text.replace(/[^0-9.,-]/g, '').replace(',', '.');
  const num = Number(cleaned);
  return isNaN(num) ? undefined : num;
}

interface SaleFormProps {
  vehicle: Vehicle;
  costPrice: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SaleForm({ vehicle, costPrice, onSuccess, onCancel }: SaleFormProps) {
  const createSale = useCreateSale();
  const uploadDocument = useUploadDocument();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resultModal, setResultModal] = useState<{
    visible: boolean;
    type: 'success' | 'error';
    invoiceNumber: string;
    message: string;
  }>({ visible: false, type: 'success', invoiceNumber: '', message: '' });
  const shareDataRef = useRef<{ html: string; pdfPath: string }>({
    html: '',
    pdfPath: '',
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SaleFormData>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      client_civility: '' as SaleFormData['client_civility'],
      client_firstname: '',
      client_lastname: '',
      client_address: '',
      client_zip: '',
      client_city: '',
      client_country: 'France',
      client_phone: '',
      client_email: '',
      client_type: 'particular',
      company_name: '',
      siret: '',
      vat_number: '',
      sale_price: 0,
      payment_method: '' as SaleFormData['payment_method'],
      sale_date: new Date().toISOString().split('T')[0],
      mileage_at_sale: vehicle.mileage,
      warranty: 'none',
    },
  });

  const clientType = watch('client_type');
  const salePrice = watch('sale_price');
  const margin = salePrice ? salePrice - costPrice : 0;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setSubmitError(null);

      const invoiceNumber = await generateInvoiceNumber();

      // Generate PDF
      const html = generateInvoiceHtml({
        invoiceNumber,
        vehicle,
        sale: data,
        costPrice,
        garage: useGarageStore.getState().currentGarage,
      });

      let pdfPath = '';

      if (Platform.OS === 'web') {
        // On web, fill the Word template and upload as .docx.
        try {
          const docxBytes = fillInvoiceDocx({
            invoiceNumber,
            vehicle,
            sale: data,
            garage: useGarageStore.getState().currentGarage,
          });
          const DOCX_MIME =
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          const docxBlob = new Blob([docxBytes.buffer as ArrayBuffer], { type: DOCX_MIME });
          const blobUrl = URL.createObjectURL(docxBlob);
          await uploadDocument.mutateAsync({
            vehicleId: vehicle.id,
            uri: blobUrl,
            fileName: `${invoiceNumber}.docx`,
            mimeType: DOCX_MIME,
            fileSize: docxBlob.size,
            category: 'invoice',
          });
          URL.revokeObjectURL(blobUrl);
        } catch {
          // Non-critical: continue even if document upload fails
        }
        pdfPath = `invoices/${invoiceNumber}.docx`;
      } else {
        const result = await Print.printToFileAsync({ html });
        pdfPath = result.uri;

        // Upload invoice PDF to vehicle documents section (non-critical)
        try {
          await uploadDocument.mutateAsync({
            vehicleId: vehicle.id,
            uri: pdfPath,
            fileName: `${invoiceNumber}.pdf`,
            mimeType: 'application/pdf',
            fileSize: 0,
            category: 'invoice',
          });
        } catch {
          // Non-critical: continue even if document upload fails
        }
      }

      // Create sale record
      await createSale.mutateAsync({
        vehicle_id: vehicle.id,
        invoice_number: invoiceNumber,
        sale_date: data.sale_date,
        sale_price: data.sale_price,
        payment_method: data.payment_method,
        mileage_at_sale: data.mileage_at_sale ?? null,
        warranty: data.warranty,
        client_civility: data.client_civility ?? null,
        client_firstname: data.client_firstname,
        client_lastname: data.client_lastname,
        client_address: data.client_address ?? null,
        client_zip: data.client_zip ?? null,
        client_city: data.client_city ?? null,
        client_country: data.client_country,
        client_phone: data.client_phone ?? null,
        client_email: data.client_email || null,
        client_type: data.client_type,
        company_name: data.company_name ?? null,
        siret: data.siret ?? null,
        vat_number: data.vat_number ?? null,
        invoice_pdf_path: pdfPath,
      });

      // Store sharing data for later use
      shareDataRef.current = { html, pdfPath };

      setResultModal({
        visible: true,
        type: 'success',
        invoiceNumber,
        message: `Facture ${invoiceNumber} generee avec succes.\n${vehicle.brand} ${vehicle.model} est maintenant marque comme vendu.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la vente';
      setSubmitError(message);
      setResultModal({
        visible: true,
        type: 'error',
        invoiceNumber: '',
        message,
      });
    }
  });

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-4 py-4 pb-10"
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Résumé financier ── */}
      <Card className="mb-4">
        <Text className="text-text-primary text-lg font-semibold mb-3">Résumé financier</Text>
        <View className="flex-row gap-3">
          <View className="flex-1 bg-surface-light rounded-xl p-3">
            <Text className="text-text-muted text-xs mb-1">Coût de revient</Text>
            <Text className="text-text-primary text-base font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0,
              }).format(costPrice)}
            </Text>
          </View>
          <View className="flex-1 bg-surface-light rounded-xl p-3">
            <Text className="text-text-muted text-xs mb-1">Marge estimée</Text>
            <Text
              className={`text-base font-bold ${margin >= 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0,
                signDisplay: 'always',
              }).format(margin)}
            </Text>
          </View>
        </View>
      </Card>

      {/* ── Informations client ── */}
      <Card className="mb-4">
        <Text className="text-text-primary text-lg font-semibold mb-4">Informations client</Text>

        <Controller
          control={control}
          name="client_type"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Type de client *"
              options={clientTypeOptions}
              value={value}
              onChange={onChange}
              placeholder="Sélectionner"
              error={errors.client_type?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="client_civility"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Civilité"
              options={civilityOptions}
              value={value ?? ''}
              onChange={onChange}
              placeholder="Sélectionner"
            />
          )}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Controller
              control={control}
              name="client_firstname"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Prénom *"
                  placeholder="Jean"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.client_firstname?.message}
                  autoCapitalize="words"
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="client_lastname"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nom *"
                  placeholder="Dupont"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.client_lastname?.message}
                  autoCapitalize="words"
                />
              )}
            />
          </View>
        </View>

        {clientType === 'professional' ? (
          <>
            <Controller
              control={control}
              name="company_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Raison sociale *"
                  placeholder="Nom de l'entreprise"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.company_name?.message}
                />
              )}
            />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="siret"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="SIRET"
                      placeholder="123 456 789 00012"
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                    />
                  )}
                />
              </View>
              <View className="flex-1">
                <Controller
                  control={control}
                  name="vat_number"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="TVA Intra."
                      placeholder="FR12345678901"
                      value={value ?? ''}
                      onChangeText={(text) => onChange(text.toUpperCase())}
                      onBlur={onBlur}
                      autoCapitalize="characters"
                    />
                  )}
                />
              </View>
            </View>
          </>
        ) : null}

        <Controller
          control={control}
          name="client_address"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Adresse"
              placeholder="12 rue de la Paix"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />

        <View className="flex-row gap-3">
          <View className="w-24">
            <Controller
              control={control}
              name="client_zip"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Code postal"
                  placeholder="75001"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="client_city"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Ville"
                  placeholder="Paris"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="client_country"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Pays *"
              placeholder="France"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.client_country?.message}
              autoCapitalize="words"
            />
          )}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Controller
              control={control}
              name="client_phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Téléphone"
                  placeholder="06 12 34 56 78"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="client_email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="email@exemple.com"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.client_email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
          </View>
        </View>
      </Card>

      {/* ── Détails de la vente ── */}
      <Card className="mb-4">
        <Text className="text-text-primary text-lg font-semibold mb-4">Détails de la vente</Text>

        <Controller
          control={control}
          name="sale_price"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Prix de vente TTC *"
              placeholder="18000"
              value={value ? String(value) : ''}
              onChangeText={(text) => onChange(parseNumber(text))}
              onBlur={onBlur}
              error={errors.sale_price?.message}
              keyboardType="decimal-pad"
            />
          )}
        />

        <Controller
          control={control}
          name="payment_method"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Mode de paiement *"
              options={paymentOptions}
              value={value}
              onChange={onChange}
              placeholder="Sélectionner"
              error={errors.payment_method?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="sale_date"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Date de vente *"
              placeholder="AAAA-MM-JJ"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.sale_date?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="mileage_at_sale"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Kilométrage à la vente"
              placeholder={String(vehicle.mileage)}
              value={value !== undefined ? String(value) : ''}
              onChangeText={(text) => onChange(parseNumber(text))}
              onBlur={onBlur}
              keyboardType="numeric"
            />
          )}
        />

        <Controller
          control={control}
          name="warranty"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Garantie *"
              options={warrantyOptions}
              value={value}
              onChange={onChange}
              placeholder="Sélectionner"
              error={errors.warranty?.message}
            />
          )}
        />
      </Card>

      {submitError ? <Text className="text-red-500 text-center mb-4">{submitError}</Text> : null}

      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <Button onPress={onCancel} variant="secondary" accessibilityLabel="Annuler la vente">
            Annuler
          </Button>
        </View>
        <View className="flex-1">
          <Button
            onPress={onSubmit}
            loading={createSale.isPending}
            accessibilityLabel="Valider la vente"
          >
            Valider la vente
          </Button>
        </View>
      </View>

      <View className="h-8" />

      <ResultModal
        visible={resultModal.visible}
        type={resultModal.type}
        title={resultModal.type === 'success' ? 'Vente enregistree' : 'Erreur'}
        message={resultModal.message}
        onClose={() => {
          setResultModal((prev) => ({ ...prev, visible: false }));
          if (resultModal.type === 'success') {
            onSuccess();
          }
        }}
        actions={
          resultModal.type === 'success'
            ? [
                {
                  label: 'Partager la facture',
                  onPress: async () => {
                    try {
                      const { html: storedHtml, pdfPath } = shareDataRef.current;
                      if (Platform.OS === 'web') {
                        await Print.printAsync({ html: storedHtml });
                      } else {
                        const canShare = await Sharing.isAvailableAsync();
                        if (canShare) {
                          await Sharing.shareAsync(pdfPath, {
                            mimeType: 'application/pdf',
                            dialogTitle: `Facture ${resultModal.invoiceNumber}`,
                          });
                        }
                      }
                    } catch {
                      // Sharing not critical
                    }
                    onSuccess();
                  },
                },
                {
                  label: 'Fermer',
                  variant: 'secondary' as const,
                  onPress: onSuccess,
                },
              ]
            : [
                {
                  label: 'Reessayer',
                  onPress: () => setResultModal((prev) => ({ ...prev, visible: false })),
                },
              ]
        }
      />
    </ScrollView>
  );
}
