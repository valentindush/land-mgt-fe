interface CloudinaryUploadResponse {
  success: boolean
  url?: string
  error?: string
}

export async function uploadToCloudinary(
  file: File,
  folder: string = 'land-management'
): Promise<CloudinaryUploadResponse> {
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY
    const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Missing Cloudinary configuration')
    }

    // Generate timestamp for signature
    const timestamp = Math.round(new Date().getTime() / 1000)

    // Create signature
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`
    const signature = await generateSignature(paramsToSign, apiSecret)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    formData.append('timestamp', timestamp.toString())
    formData.append('api_key', apiKey)
    formData.append('signature', signature)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message)
    }

    return {
      success: true,
      url: data.secure_url,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Upload failed',
    }
  }
}

// Simple signature generation for client-side (not recommended for production)
async function generateSignature(paramsToSign: string, apiSecret: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(paramsToSign + apiSecret)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

export async function uploadDocumentToCloudinary(
  file: File,
  userId: string,
  documentType: 'supporting' | 'contract'
): Promise<CloudinaryUploadResponse> {
  const folder = `land-management/${documentType}-documents/${userId}`
  return uploadToCloudinary(file, folder)
}
