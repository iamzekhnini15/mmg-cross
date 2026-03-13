import { useState, useCallback } from 'react';
import { Text, View, Modal, Pressable, Alert, Image, FlatList, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Card, LoadingSpinner } from '@/components/ui';
import {
  usePhotos,
  useUploadPhoto,
  useDeleteMedia,
  useMediaUrl,
} from '@/features/media/hooks/useMedia';
import { MEDIA_CATEGORY_LABELS } from '@/lib/constants';
import type { Media } from '@/types/database';

const SCREEN_WIDTH = Dimensions.get('window').width;

const categoryOptions = Object.entries(MEDIA_CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

interface PhotoGalleryProps {
  vehicleId: string;
}

function PhotoThumbnail({
  media,
  onPress,
  onDelete,
}: {
  media: Media;
  onPress: () => void;
  onDelete: () => void;
}) {
  const { data: url } = useMediaUrl(media);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onDelete}
      className="m-1 rounded-xl overflow-hidden"
      accessibilityLabel={`Photo ${media.category ?? ''}`}
    >
      {url ? (
        <Image source={{ uri: url }} className="w-28 h-28" resizeMode="cover" />
      ) : (
        <View className="w-28 h-28 bg-surface-light items-center justify-center">
          <Ionicons name="image-outline" size={24} color="#6B7280" />
        </View>
      )}
    </Pressable>
  );
}

function FullScreenViewer({
  photos,
  initialIndex,
  visible,
  onClose,
}: {
  photos: Media[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black">
        <Pressable
          onPress={onClose}
          className="absolute top-12 right-4 z-10 p-2"
          accessibilityLabel="Fermer"
        >
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </Pressable>
        <FlatList
          data={photos}
          horizontal
          pagingEnabled
          initialScrollIndex={initialIndex}
          getItemLayout={(_data, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FullScreenImage media={item} />}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </Modal>
  );
}

function FullScreenImage({ media }: { media: Media }) {
  const { data: url } = useMediaUrl(media);

  if (!url) {
    return (
      <View style={{ width: SCREEN_WIDTH }} className="flex-1 items-center justify-center">
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={{ width: SCREEN_WIDTH }} className="flex-1 items-center justify-center">
      <Image
        source={{ uri: url }}
        style={{ width: SCREEN_WIDTH, height: '100%' }}
        resizeMode="contain"
      />
    </View>
  );
}

export function PhotoGallery({ vehicleId }: PhotoGalleryProps) {
  const { data: photos, isLoading } = usePhotos(vehicleId);
  const uploadPhoto = useUploadPhoto();
  const deleteMedia = useDeleteMedia();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [pendingUri, setPendingUri] = useState<string | null>(null);

  const pickImage = useCallback(async (source: 'camera' | 'gallery') => {
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

    if (!result.canceled && result.assets[0]) {
      setPendingUri(result.assets[0].uri);
      setCategoryModalVisible(true);
    }
  }, []);

  const handleCategorySelect = useCallback(
    async (category: string) => {
      setCategoryModalVisible(false);
      if (!pendingUri) return;

      try {
        await uploadPhoto.mutateAsync({
          vehicleId,
          uri: pendingUri,
          category,
        });
        setPendingUri(null);
      } catch (error) {
        Alert.alert('Erreur', error instanceof Error ? error.message : "Erreur lors de l'upload");
      }
    },
    [pendingUri, vehicleId, uploadPhoto],
  );

  const handleDelete = useCallback(
    (media: Media) => {
      Alert.alert('Supprimer cette photo', 'Cette action est irréversible.', [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMedia.mutateAsync({ media });
            } catch (error) {
              Alert.alert(
                'Erreur',
                error instanceof Error ? error.message : 'Impossible de supprimer',
              );
            }
          },
        },
      ]);
    },
    [deleteMedia],
  );

  const handleAddPhoto = () => {
    Alert.alert('Ajouter une photo', 'Choisissez la source', [
      { text: 'Appareil photo', onPress: () => pickImage('camera') },
      { text: 'Galerie', onPress: () => pickImage('gallery') },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  return (
    <Card className="mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-text-primary text-lg font-semibold">Photos</Text>
        <Pressable
          onPress={handleAddPhoto}
          className="flex-row items-center bg-accent/10 rounded-lg px-3 py-1.5"
          accessibilityLabel="Ajouter une photo"
        >
          <Ionicons name="camera-outline" size={18} color="#3B82F6" />
          <Text className="text-accent text-sm font-medium ml-1.5">Ajouter</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : photos.length === 0 ? (
        <View className="items-center py-8">
          <Ionicons name="images-outline" size={40} color="#6B7280" />
          <Text className="text-text-muted text-sm mt-2">Aucune photo</Text>
        </View>
      ) : (
        <View className="flex-row flex-wrap">
          {photos.map((photo, index) => (
            <PhotoThumbnail
              key={photo.id}
              media={photo}
              onPress={() => setSelectedPhotoIndex(index)}
              onDelete={() => handleDelete(photo)}
            />
          ))}
        </View>
      )}

      {uploadPhoto.isPending ? (
        <View className="flex-row items-center justify-center py-3">
          <LoadingSpinner />
          <Text className="text-text-muted text-sm ml-2">Upload en cours...</Text>
        </View>
      ) : null}

      {/* Full screen viewer */}
      {selectedPhotoIndex !== null ? (
        <FullScreenViewer
          photos={photos}
          initialIndex={selectedPhotoIndex}
          visible
          onClose={() => setSelectedPhotoIndex(null)}
        />
      ) : null}

      {/* Category selection modal */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/60 justify-end"
          onPress={() => setCategoryModalVisible(false)}
        >
          <Pressable className="bg-surface rounded-t-3xl" onPress={(e) => e.stopPropagation()}>
            <View className="items-center pt-3 pb-2">
              <View className="w-10 h-1 rounded-full bg-border" />
            </View>
            <Text className="text-text-primary text-lg font-semibold px-5 pb-3">
              Catégorie de la photo
            </Text>
            {categoryOptions.map((opt) => (
              <Pressable
                key={opt.value}
                className="px-5 py-3.5 border-t border-border/50"
                onPress={() => handleCategorySelect(opt.value)}
                accessibilityLabel={opt.label}
              >
                <Text className="text-text-primary text-base">{opt.label}</Text>
              </Pressable>
            ))}
            <View className="h-8" />
          </Pressable>
        </Pressable>
      </Modal>
    </Card>
  );
}
