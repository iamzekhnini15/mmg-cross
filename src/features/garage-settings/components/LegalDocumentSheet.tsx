import { forwardRef, useMemo } from 'react';
import { Text } from 'react-native';

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';

interface LegalDocumentSheetProps {
  title: string;
  content: string;
}

export const LegalDocumentSheet = forwardRef<BottomSheet, LegalDocumentSheetProps>(
  function LegalDocumentSheet({ title, content }, ref) {
    const snapPoints = useMemo(() => ['90%'], []);

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#1A1A1B' }}
        handleIndicatorStyle={{ backgroundColor: '#6B7280' }}
      >
        <BottomSheetScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
          <Text className="text-text-primary text-lg font-bold mb-4">{title}</Text>
          <Text className="text-text-secondary text-sm leading-6">{content}</Text>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);
