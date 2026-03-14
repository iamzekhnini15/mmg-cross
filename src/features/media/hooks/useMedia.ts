import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Media, MediaInsert } from '@/types/database';
import { useGarageStore } from '@/stores/garageStore';

function mediaKey(vehicleId: string) {
  return ['media', vehicleId] as const;
}

// ─── Fetch media for a vehicle ──────────────────────

export function useMedia(vehicleId: string) {
  return useQuery({
    queryKey: mediaKey(vehicleId),
    queryFn: async (): Promise<Media[]> => {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as Media[];
    },
    enabled: !!vehicleId && vehicleId !== 'undefined',
  });
}

// ─── Filtered queries ───────────────────────────────

export function usePhotos(vehicleId: string) {
  const { data, ...rest } = useMedia(vehicleId);
  return {
    ...rest,
    data: data?.filter((m) => m.type === 'photo') ?? [],
  };
}

export function useDocuments(vehicleId: string) {
  const { data, ...rest } = useMedia(vehicleId);
  return {
    ...rest,
    data: data?.filter((m) => m.type === 'document') ?? [],
  };
}

// ─── Upload photo ───────────────────────────────────

export function useUploadPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vehicleId,
      uri,
      category,
    }: {
      vehicleId: string;
      uri: string;
      category: string;
    }): Promise<Media> => {
      const garage = useGarageStore.getState().currentGarage;
      if (!garage) throw new Error('Aucun garage sélectionné');

      const fileName = `${Date.now()}.jpg`;
      const filePath = `${garage.id}/${vehicleId}/${fileName}`;

      // Fetch the image as a blob
      const response = await fetch(uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('vehicle-photos')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Create media record
      const mediaInsert: MediaInsert = {
        vehicle_id: vehicleId,
        type: 'photo',
        category,
        file_path: filePath,
        file_name: fileName,
        file_size: blob.size,
      };

      const { data, error } = await supabase
        .from('media')
        .insert(mediaInsert as unknown as Record<string, unknown>)
        .select()
        .single();

      if (error) throw error;
      return data as Media;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: mediaKey(variables.vehicleId) });
      queryClient.invalidateQueries({ queryKey: ['media', 'thumbnails'] });
    },
  });
}

// ─── Upload document ────────────────────────────────

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vehicleId,
      uri,
      fileName,
      mimeType,
      fileSize,
    }: {
      vehicleId: string;
      uri: string;
      fileName: string;
      mimeType: string;
      fileSize: number;
    }): Promise<Media> => {
      const garage = useGarageStore.getState().currentGarage;
      if (!garage) throw new Error('Aucun garage sélectionné');

      const filePath = `${garage.id}/${vehicleId}/${Date.now()}_${fileName}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('vehicle-documents')
        .upload(filePath, blob, {
          contentType: mimeType,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const mediaInsert: MediaInsert = {
        vehicle_id: vehicleId,
        type: 'document',
        category: null,
        file_path: filePath,
        file_name: fileName,
        file_size: fileSize,
      };

      const { data, error } = await supabase
        .from('media')
        .insert(mediaInsert as unknown as Record<string, unknown>)
        .select()
        .single();

      if (error) throw error;
      return data as Media;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: mediaKey(variables.vehicleId) });
    },
  });
}

// ─── Delete media ───────────────────────────────────

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ media }: { media: Media }) => {
      // Delete from storage first
      const bucket = media.type === 'photo' ? 'vehicle-photos' : 'vehicle-documents';
      const { error: storageError } = await supabase.storage.from(bucket).remove([media.file_path]);

      if (storageError) throw storageError;

      // Then delete the record
      const { error } = await supabase.from('media').delete().eq('id', media.id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: mediaKey(variables.media.vehicle_id),
      });
      queryClient.invalidateQueries({ queryKey: ['media', 'thumbnails'] });
    },
  });
}

// ─── Get signed URL for a media file ────────────────

export function useMediaUrl(media: Media | null) {
  const bucket = media?.type === 'photo' ? 'vehicle-photos' : 'vehicle-documents';

  return useQuery({
    queryKey: ['media-url', media?.id],
    queryFn: async (): Promise<string> => {
      if (!media) throw new Error('No media');

      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(media.file_path, 3600);

      if (error) throw error;
      return data.signedUrl;
    },
    enabled: !!media,
    staleTime: 30 * 60 * 1000, // URLs valid for 30 min before refetch
  });
}
