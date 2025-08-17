import { ref } from 'vue'

export function useStorage() {
  const supabase = useSupabaseClient()
  const bucketName = process.env.SUPABASE_MEAL_IMAGES_BUCKET || 'meal-images'
  const uploading = ref(false)
  const error = ref<string | null>(null)

  const uploadImage = async (file: File, path: string) => {
    uploading.value = true
    error.value = null

    try {
      // Check if file already exists and remove it
      const { data: existingFiles } = await supabase.storage
        .from(bucketName)
        .list(path.split('/').slice(0, -1).join('/'))

      const fileName = path.split('/').pop()
      if (existingFiles?.some((f) => f.name === fileName)) {
        await supabase.storage.from(bucketName).remove([path])
      }

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        error.value = uploadError.message
        return { error: error.value, data: null }
      }

      return { error: null, data: path }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Upload failed'
      return { error: error.value, data: null }
    } finally {
      uploading.value = false
    }
  }

  const uploadMealImage = async (
    file: File,
    userId: string,
    mealId?: string
  ) => {
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = mealId
      ? `${mealId}-${timestamp}.${fileExtension}`
      : `meal-${timestamp}.${fileExtension}`
    const path = `${userId}/${fileName}`

    return await uploadImage(file, path)
  }

  const getImageUrl = (path: string) => {
    try {
      const { data } = supabase.storage.from(bucketName).getPublicUrl(path)

      if (!data) {
        error.value = 'Failed to retrieve public URL'
        return null
      }
      return data.publicUrl || null
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to get image URL'
      return null
    }
  }

  const deleteImage = async (path: string) => {
    error.value = null
    try {
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove([path])
      if (deleteError) error.value = deleteError.message
      return { error: error.value }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to delete image'
      return { error: error.value }
    }
  }

  const deleteMealImage = async (imageUrl: string) => {
    if (!imageUrl) return { error: null }

    try {
      // Extract path from URL
      const url = new URL(imageUrl)
      const pathSegments = url.pathname.split('/')
      const path = pathSegments
        .slice(pathSegments.indexOf(bucketName) + 1)
        .join('/')

      return await deleteImage(path)
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to parse image URL'
      return { error: error.value }
    }
  }

  const compressImage = (
    file: File,
    maxWidth: number = 800,
    quality: number = 0.8
  ): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              resolve(file) // Fallback to original
            }
          },
          'image/jpeg',
          quality
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }

  return {
    // State
    uploading: readonly(uploading),
    error: readonly(error),

    // Generic methods
    uploadImage,
    getImageUrl,
    deleteImage,

    // Meal-specific methods
    uploadMealImage,
    deleteMealImage,
    compressImage,
  }
}
