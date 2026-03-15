import { useMutation } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { scanInvoice } from '../services/mindeeApi';
import type { InvoiceScanResult } from '../types/invoiceScan';

export function useInvoiceScan() {
  return useMutation({
    mutationFn: async (source: 'camera' | 'gallery'): Promise<InvoiceScanResult> => {
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              quality: 0.7,
              allowsEditing: true,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 0.7,
              allowsMultipleSelection: false,
            });

      if (result.canceled || !result.assets[0]) {
        throw new Error('CANCELLED');
      }

      return scanInvoice(result.assets[0].uri);
    },
  });
}
