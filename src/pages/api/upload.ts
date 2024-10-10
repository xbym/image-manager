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
  console.log('Upload request received');

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm({
      maxFileSize: 200 * 1024 * 1024, // 200MB max file size
    });

    console.log('Parsing form data...');
    const [fields, files]: [Fields, Files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Form parsing error:', err);
          reject(err);
        }
        resolve([fields, files]);
      });
    });

    console.log('Form data parsed');

    const uploadedFile = files.file;
    if (!uploadedFile) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file: File = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;

    if (!file.filepath) {
      console.log('File path is missing');
      return res.status(400).json({ message: 'File path is missing' });
    }

    console.log('File received:', file.originalFilename);

    const fileExtension = file.originalFilename ? file.originalFilename.split('.').pop()?.toLowerCase() : '';
    if (!fileExtension || !['jpg', 'jpeg', 'png', 'pdf'].includes(fileExtension)) {
      console.log('Invalid file type');
      return res.status(400).json({ message: 'Invalid file type. Only JPG, PNG, and PDF files are allowed.' });
    }

    const fileName = `${uuidv4()}.${fileExtension}`;
    const fileType = fileExtension === 'pdf' ? 'pdf' : 'image';

    console.log('Connecting to MongoDB...');
    const client = await clientPromise;
    const db = client.db('your_database_name');

    console.log('Creating GridFS bucket...');
    const bucket = new GridFSBucket(db);

    console.log('Starting file upload to GridFS...');
    const uploadStream = bucket.openUploadStream(fileName, {
      metadata: {
        fileType,
        tags: Array.isArray(fields.tags) ? fields.tags : [fields.tags],
      }
    });

    await new Promise<void>((resolve, reject) => {
      const readStream = fs.createReadStream(file.filepath);
      readStream.pipe(uploadStream)
        .on('error', (error) => {
          console.error('Stream error:', error);
          reject(error);
        })
        .on('finish', () => {
          console.log('File upload completed');
          resolve();
        });
    });

    const fileId = uploadStream.id;

    console.log('Upload successful');
    return res.status(200).json({ 
      message: 'File uploaded successfully',
      fileName,
      fileType,
      fileId: fileId.toString(),
      tags: fields.tags
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
}