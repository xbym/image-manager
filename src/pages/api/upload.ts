import { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, Fields, Files, File } from 'formidable'
import { v4 as uuidv4 } from 'uuid'
import clientPromise from '../../lib/mongodb'
import fs from 'fs'
import { GridFSBucket } from 'mongodb'

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
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const form = new IncomingForm({
      maxFileSize: 200 * 1024 * 1024, // 200MB max file size
    })
    const [fields, files]: [Fields, Files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        resolve([fields, files])
      })
    })

    const uploadedFile = files.file
    if (!uploadedFile) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const file: File = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile

    if (!file.filepath) {
      return res.status(400).json({ message: 'File path is missing' })
    }

    const fileExtension = file.originalFilename ? file.originalFilename.split('.').pop()?.toLowerCase() : ''
    if (!fileExtension || !['jpg', 'jpeg', 'png', 'pdf'].includes(fileExtension)) {
      return res.status(400).json({ message: 'Invalid file type. Only JPG, PNG, and PDF files are allowed.' })
    }

    const fileName = `${uuidv4()}.${fileExtension}`
    const fileType = fileExtension === 'pdf' ? 'pdf' : 'image'

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('your_database_name')

    // Use GridFS for all files
    const bucket = new GridFSBucket(db)
    const uploadStream = bucket.openUploadStream(fileName, {
      metadata: {
        fileType,
        tags: Array.isArray(fields.tags) ? fields.tags : [fields.tags],
      }
    })

    await new Promise<void>((resolve, reject) => {
      const readStream = fs.createReadStream(file.filepath)
      readStream.pipe(uploadStream)
        .on('error', reject)
        .on('finish', resolve)
    })

    const fileId = uploadStream.id

    return res.status(200).json({ 
      message: 'File uploaded successfully',
      fileName,
      fileType,
      fileId: fileId.toString(),
      tags: fields.tags
    })
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message })
  }
}