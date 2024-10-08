import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs/promises'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadDir, { recursive: true })

    const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxTotalFileSize: 50 * 1024 * 1024, // 50MB
    })

    const [, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          if (err.code === 1009) {
            reject(new Error('File size limit exceeded. Maximum file size is 50MB.'))
          } else {
            reject(err)
          }
        } else {
          resolve([fields, files])
        }
      })
    })

    const fileArray = files.file
    if (!fileArray || fileArray.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray

    const fileName = file.originalFilename || 'unnamed_file'
    const fileUrl = `/uploads/${fileName}`

    return res.status(200).json({ 
      message: 'File uploaded successfully',
      file: {
        name: fileName,
        url: fileUrl,
        type: file.mimetype,
        size: file.size,
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    if (error instanceof Error) {
      return res.status(413).json({ error: error.message })
    } else {
      return res.status(500).json({ error: 'An unexpected error occurred during file upload' })
    }
  }
}