import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '~/server/utils/auth'
import { blockDemoUserWrite } from '~/server/utils/demo'

export default defineEventHandler(async (event) => {
  try {
    // Validate authentication
    const user = requireAuth(event)
    const requestedUserId = getRouterParam(event, 'id')

    // Ensure user can only update their own avatar
    if (user.id !== requestedUserId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: Can only update your own avatar',
      })
    }

    // Block demo users from uploading avatars
    blockDemoUserWrite(event)

    // Parse form data
    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file uploaded',
      })
    }

    const fileData = formData.find((item) => item.name === 'avatar')
    if (!fileData || !fileData.data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Avatar file not found',
      })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!fileData.type || !allowedTypes.includes(fileData.type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
      })
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (fileData.data.length > maxSize) {
      throw createError({
        statusCode: 400,
        statusMessage: 'File too large. Maximum size is 5MB.',
      })
    }

    // Create Supabase client
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Generate unique filename
    const fileExt = fileData.filename?.split('.').pop() || 'jpg'
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(filePath, fileData.data, {
        contentType: fileData.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Storage error:', uploadError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to upload avatar',
      })
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(filePath)

    const avatarUrl = publicUrlData.publicUrl

    // Update user profile with new avatar URL
    const { data: userData, error: updateError } = await supabase
      .from('users')
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Database error:', updateError)
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
  } catch (error: unknown) {
    console.error('Error uploading avatar:', error)

    if ((error as { statusCode?: number })?.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})