import { requireAuth } from '~/server/utils/auth'
import { blockDemoUserWrite } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import { defineWrappedEventHandler } from '~/server/utils/api-error'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Map MIME type to a canonical extension (derived from validated MIME, not user filename)
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export default defineWrappedEventHandler(async (event) => {
  const user = requireAuth(event)
  const requestedUserId = getRouterParam(event, 'id')

  if (user.id !== requestedUserId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Can only update your own avatar',
    })
  }

  blockDemoUserWrite(event)

  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  }

  const fileData = formData.find((item) => item.name === 'avatar')
  if (!fileData || !fileData.data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Avatar file not found',
    })
  }

  if (!fileData.type || !ALLOWED_TYPES.includes(fileData.type)) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
    })
  }

  if (fileData.data.length > MAX_FILE_SIZE) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File too large. Maximum size is 5MB.',
    })
  }

  const supabase = getSupabaseClient()

  // Derive extension from validated MIME type — never trust the user-supplied filename
  const fileExt = MIME_TO_EXT[fileData.type] ?? 'jpg'
  const fileName = `${user.id}-${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('user-avatars')
    .upload(filePath, fileData.data, {
      contentType: fileData.type,
      upsert: true,
    })

  if (uploadError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload avatar',
    })
  }

  const { data: publicUrlData } = supabase.storage
    .from('user-avatars')
    .getPublicUrl(filePath)

  const avatarUrl = publicUrlData.publicUrl

  const { error: updateError } = await supabase
    .from('users')
    .update({
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single()

  if (updateError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update user profile with new avatar',
    })
  }

  return {
    success: true,
    data: { avatar_url: avatarUrl },
    message: 'Avatar uploaded successfully',
  }
})
