import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, Fields, Files, File } from 'formidable'
import path from 'path'
import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Received upload request')

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method)
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const uploadDir = path.join(process.cwd(), 'public/uploads')
    await fs.mkdir(uploadDir, { recursive: true })
    console.log('Upload directory:', uploadDir)

    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
      multiples: false,
    })

    console.log('Parsing form data...')
    const [fields, files] = await new Promise<[Fields, Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Form parsing error:', err)
          reject(err)
        }
        console.log('Form parsed successfully')
        console.log('Fields:', fields)
        console.log('Files:', files)
        resolve([fields, files])
      })
    })

    const imageFile = files.image
    if (!imageFile) {
      console.log('No file uploaded')
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const file = Array.isArray(imageFile) ? imageFile[0] : imageFile
    if (!file.filepath) {
      console.log('File path is missing')
      return res.status(400).json({ message: 'File path is missing' })
    }

    console.log('File received:', file.originalFilename)

    const fileName = `${uuidv4()}${path.extname(file.originalFilename || '')}`
    const newPath = path.join(uploadDir, fileName)

    console.log('Renaming file to:', newPath)
    await fs.rename(file.filepath, newPath)

    const tags = fields.tags ? (Array.isArray(fields.tags) ? fields.tags : [fields.tags]) : []
    console.log('Tags:', tags)

    console.log('Upload successful')
    return res.status(200).json({ 
      message: 'File uploaded successfully',
      fileName,
      tags
    })
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message })
  }
}