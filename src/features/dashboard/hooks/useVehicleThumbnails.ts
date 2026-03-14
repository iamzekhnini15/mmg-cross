import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useVehicleThumbnails() {
  return useQuery({
    queryKey: ['media', 'thumbnails'],
    queryFn: async (): Promise<Map<string, string>> => {
      const { data: photos, error } = await supabase
        .from('media')
        .select('vehicle_id, file_path')
        .eq('type', 'photo')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Keep only the first photo per vehicle
      const firstPhotos = new Map<string, string>();
      for (const photo of photos ?? []) {
        if (!firstPhotos.has(photo.vehicle_id)) {
          firstPhotos.set(photo.vehicle_id, photo.file_path);
        }
      }

      const paths = Array.from(firstPhotos.values());
      if (paths.length === 0) return new Map<string, string>();

      // Batch sign URLs (1h validity)
      const { data: signedUrls, error: signError } = await supabase.storage
        .from('vehicle-photos')
        .createSignedUrls(paths, 3600);

      if (signError) throw signError;

      const pathToUrl = new Map((signedUrls ?? []).map((s) => [s.path, s.signedUrl]));
      const result = new Map<string, string>();
      for (const [vehicleId, path] of firstPhotos) {
        const url = pathToUrl.get(path);
        if (url) result.set(vehicleId, url);
      }

      return result;
    },
    staleTime: 25 * 60 * 1000, // Refetch before 1h signed URL expiry
  });
}
