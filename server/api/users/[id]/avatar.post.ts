import { requireAuth } from '~/server/utils/auth'
import { blockDemoUserWrite } from '~/server/utils/demo'
import { getSupabaseClient } from '~/server/utils/supabase'
import { defineWrappedEventHandler } from '~/server/utils/api-error'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * Detect image MIME type from magic bytes in the file buffer.
 * Returns the detected MIME type string, or null if unrecognised.
 */
function detectMimeType(buf: Buffer): string | null {
  // JPEG: FF D8 FF
  if (
    buf.length >= 3 &&
    buf[0] === 0xff &&
    buf[1] === 0xd8 &&
    buf[2] === 0xff
  ) {
    return 'image/jpeg'
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return 'image/png'
  }
  // WebP: RIFF????WEBP  (bytes 0-3 = 52 49 46 46, bytes 8-11 = 57 45 42 50)
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return 'image/webp'
  }
  return null
}

// Map MIME type to a canonical extension (derived from validated MIME, not user filename)
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
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

  // Size check (5MB cap) — must come before MIME check to avoid processing huge buffers
  if (fileData.data.length > MAX_FILE_SIZE) {
    throw createError({
      statusCode: 413,
      statusMessage: 'File too large. Maximum allowed size is 5 MB.',
    })
  }

  // Magic-byte MIME check — do NOT trust the Content-Type header from the client
  const detectedMime = detectMimeType(fileData.data)
  if (!detectedMime) {
    throw createError({
      statusCode: 415,
      statusMessage:
        'Unsupported media type. Only JPEG, PNG, and WebP files are allowed.',
    })
  }

  const supabase = getSupabaseClient()

  // Derive extension from validated MIME type — never trust the user-supplied filename
  const fileExt = MIME_TO_EXT[detectedMime] ?? 'jpg'
  const fileName = `${user.id}-${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('user-avatars')
    .upload(filePath, fileData.data, {
      contentType: detectedMime,
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
