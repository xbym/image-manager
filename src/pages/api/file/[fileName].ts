import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../../lib/mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { fileName } = req.query

  try {
    const client = await clientPromise
    const db = client.db('your_database_name')

    const file = await db.collection('files').findOne({ fileName })

    if (!file) {
      return res.status(404).json({ message: 'File not found' })
    }

    const buffer = Buffer.from(file.content, 'base64')

    const isDownload = req.query.download === 'true'

    res.setHeader('Content-Type', file.fileType === 'pdf' ? 'application/pdf' : 'image/jpeg')
    if (isDownload) {
      res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`)
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${file.fileName}"`)
    }
    res.send(buffer)
  } catch (error) {
    console.error('File retrieval error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}