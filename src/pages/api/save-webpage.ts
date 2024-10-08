import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'
import { JSDOM } from 'jsdom'
import https from 'https'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { url, tags } = req.body

    if (!url) {
      return res.status(400).json({ message: 'URL is required' })
    }

    // Create a custom HTTPS agent that ignores SSL certificate errors
    const agent = new https.Agent({
      rejectUnauthorized: false
    })

    // Fetch only the headers and a small part of the body to get the title
    const response = await fetch(url, { 
      agent,
      method: 'GET',
      headers: { 'Range': 'bytes=0-1023' } // Fetch only the first 1KB
    })

    let title = 'Untitled'
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('text/html')) {
      const html = await response.text()
      const dom = new JSDOM(html)
      title = dom.window.document.title || 'Untitled'
    }

    // Here you would typically save the metadata to a database
    // For this example, we'll just return the data
    return res.status(200).json({
      message: 'Webpage saved successfully',
      url,
      title,
      tags
    })
  } catch (error) {
    console.error('Save webpage error:', error)
    let errorMessage = 'Failed to save webpage'
    if (error instanceof Error) {
      if (error.message.includes('CERT_HAS_EXPIRED')) {
        errorMessage = 'The website\'s security certificate has expired. We saved the URL, but please be cautious when viewing it.'
      } else {
        errorMessage = error.message
      }
    }
    return res.status(500).json({ message: errorMessage })
  }
}