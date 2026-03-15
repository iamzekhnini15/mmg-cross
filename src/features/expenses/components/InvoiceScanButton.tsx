import { useState, useCallback } from 'react';
import { Text, View, Modal, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInvoiceScan } from '../hooks/useInvoiceScan';
import type { InvoiceScanResult } from '../types/invoiceScan';

interface InvoiceScanButtonProps {
  onScanComplete: (data: InvoiceScanResult) => void;
}

export function InvoiceScanButton({ onScanComplete }: InvoiceScanButtonProps) {
  const [sourceModalVisible, setSourceModalVisible] = useState(false);
  const invoiceScan = useInvoiceScan();

  const handleScan = useCallback(
    async (source: 'camera' | 'gallery') => {
      setSourceModalVisible(false);
      try {
        const result = await invoiceScan.mutateAsync(source);
        onScanComplete(result);
      } catch (error) {
        if (error instanceof Error && error.message === 'CANCELLED') return;
      }
    },
    [invoiceScan, onScanComplete],
  );

  return (
    <>
      <Pressable
        onPress={() => setSourceModalVisible(true)}
        disabled={invoiceScan.isPending}
        className="flex-row items-center bg-accent/10 rounded-lg px-3 py-1.5"
        accessibilityLabel="Scanner une facture"
      >
        {invoiceScan.isPending ? (
          <ActivityIndicator size="small" color="#3B82F6" />
        ) : (
          <Ionicons name="scan-outline" size={18} color="#3B82F6" />
        )}
        <Text className="text-accent text-sm font-medium ml-1.5">
          {invoiceScan.isPending ? 'Analyse...' : 'Scanner'}
        </Text>
      </Pressable>

      {invoiceScan.isError && invoiceScan.error?.message !== 'CANCELLED' ? (
        <Text className="text-red-500 text-xs mt-1">
          {invoiceScan.error?.message ?? 'Erreur lors du scan'}
        </Text>
      ) : null}

      <Modal
        visible={sourceModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSourceModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/60 justify-end"
          onPress={() => setSourceModalVisible(false)}
        >
          <Pressable className="bg-surface rounded-t-3xl" onPress={(e) => e.stopPropagation()}>
            <View className="items-center pt-3 pb-2">
              <View className="w-10 h-1 rounded-full bg-border" />
            </View>
            <Text className="text-text-primary text-lg font-semibold px-5 pb-3">
              Scanner une facture
            </Text>
            <Pressable
              className="px-5 py-3.5 border-t border-border/50 flex-row items-center gap-3"
              onPress={() => handleScan('camera')}
              accessibilityLabel="Appareil photo"
            >
              <Ionicons name="camera-outline" size={20} color="#3B82F6" />
              <Text className="text-text-primary text-base">Appareil photo</Text>
            </Pressable>
            <Pressable
              className="px-5 py-3.5 border-t border-border/50 flex-row items-center gap-3"
              onPress={() => handleScan('gallery')}
              accessibilityLabel="Galerie"
            >
              <Ionicons name="images-outline" size={20} color="#3B82F6" />
              <Text className="text-text-primary text-base">Galerie</Text>
            </Pressable>
            <Pressable
              className="px-5 py-3.5 border-t border-border/50 items-center"
              onPress={() => setSourceModalVisible(false)}
              accessibilityLabel="Annuler"
            >
              <Text className="text-text-muted text-base">Annuler</Text>
            </Pressable>
            <View className="h-8" />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
