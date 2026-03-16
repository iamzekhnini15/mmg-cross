import { useCallback, useState } from 'react';
import { Text, View, Pressable, Linking, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { Card, ConfirmModal, LoadingSpinner } from '@/components/ui';
import {
  useDocuments,
  useUploadDocument,
  useDeleteMedia,
  useMediaUrl,
} from '@/features/media/hooks/useMedia';
import type { Media } from '@/types/database';

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function DocumentRow({ media, onDelete }: { media: Media; onDelete: () => void }) {
  const { data: url } = useMediaUrl(media);

  const handleOpen = async () => {
    if (!url) return;
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(url);
      } else {
        await Linking.openURL(url);
      }
    }
  };

  const isWord = media.file_name?.endsWith('.docx') || media.file_name?.endsWith('.doc');
  const iconBg = isWord ? 'bg-blue-500/10' : 'bg-red-500/10';
  const iconColor = isWord ? '#3B82F6' : '#EF4444';

  return (
    <Pressable
      onPress={handleOpen}
      className="flex-row items-center py-3 border-b border-border/50"
      accessibilityLabel={`Document ${media.file_name}`}
    >
      <View className={`w-10 h-10 rounded-xl ${iconBg} items-center justify-center mr-3`}>
        <Ionicons name="document-text" size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-text-primary text-sm font-medium" numberOfLines={1}>
          {media.file_name}
        </Text>
        <Text className="text-text-muted text-xs mt-0.5">
          {formatFileSize(media.file_size)} · {formatDate(media.created_at)}
        </Text>
      </View>
      <Pressable onPress={onDelete} className="p-2 ml-2" accessibilityLabel="Supprimer ce document">
        <Ionicons name="trash-outline" size={18} color="#EF4444" />
      </Pressable>
    </Pressable>
  );
}

interface DocumentListProps {
  vehicleId: string;
}

export function DocumentList({ vehicleId }: DocumentListProps) {
  const { data: documents, isLoading } = useDocuments(vehicleId);
  const uploadDocument = useUploadDocument();
  const deleteMedia = useDeleteMedia();
  const [deleteTarget, setDeleteTarget] = useState<Media | null>(null);

  const handlePickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      await uploadDocument.mutateAsync({
        vehicleId,
        uri: asset.uri,
        fileName: asset.name,
        mimeType: asset.mimeType ?? 'application/pdf',
        fileSize: asset.size ?? 0,
      });
    } catch {
      // Error handled by mutation
    }
  }, [vehicleId, uploadDocument]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMedia.mutateAsync({ media: deleteTarget });
    } catch {
      // Error handled by mutation
    }
    setDeleteTarget(null);
  }, [deleteTarget, deleteMedia]);

  return (
    <Card className="mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-text-primary text-lg font-semibold">Documents</Text>
        <Pressable
          onPress={handlePickDocument}
          className="flex-row items-center bg-accent/10 rounded-lg px-3 py-1.5"
          accessibilityLabel="Ajouter un document"
        >
          <Ionicons name="document-attach-outline" size={18} color="#3B82F6" />
          <Text className="text-accent text-sm font-medium ml-1.5">Ajouter</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : documents.length === 0 ? (
        <View className="items-center py-8">
          <Ionicons name="folder-open-outline" size={40} color="#6B7280" />
          <Text className="text-text-muted text-sm mt-2">Aucun document</Text>
        </View>
      ) : (
        documents.map((doc) => (
          <DocumentRow key={doc.id} media={doc} onDelete={() => setDeleteTarget(doc)} />
        ))
      )}

      {uploadDocument.isPending ? (
        <View className="flex-row items-center justify-center py-3">
          <LoadingSpinner />
          <Text className="text-text-muted text-sm ml-2">Upload en cours...</Text>
        </View>
      ) : null}

      <ConfirmModal
        visible={deleteTarget !== null}
        title="Supprimer ce document"
        message={deleteTarget?.file_name ?? ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Card>
  );
}
