import { ref } from 'vue'

export function useStorage() {
  const supabase = useSupabaseClient()
  const bucketName = process.env.SUPABASE_MEAL_IMAGES_BUCKET || 'meal-images'
  const uploading = ref(false)
  const error = ref<string | null>(null)

  const uploadImage = async (file: File, path: string) => {
    uploading.value = true
    error.value = null
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(path, file)
    if (uploadError) error.value = uploadError.message
    uploading.value = false
    return { error: error.value }
  }

  const getImageUrl = (path: string) => {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(path)
    if (!data) {
      error.value = 'Failed to retrieve public URL'
      return null
    }
    return data?.publicUrl || null
  }

  const deleteImage = async (path: string) => {
    error.value = null
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([path])
    if (deleteError) error.value = deleteError.message
    return { error: error.value }
  }

  return {
    uploading,
    error,
    uploadImage,
    getImageUrl,
    deleteImage,
  }
}
