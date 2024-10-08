import { useState } from 'react'
import { X, Upload } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface UploadModalProps {
  onClose: () => void;
  onUpload: (data: { fileName: string; fileType: string; tags: string[] }) => void;
}

export default function UploadModal({ onClose, onUpload }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [tags, setTags] = useState<string>('')
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('tags', tags)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        onUpload({
          fileName: data.fileName,
          fileType: file.type.startsWith('image/') ? 'image' : 'pdf',
          tags: tags.split(',').map(tag => tag.trim()),
        })
        onClose()
      } else {
        console.error('Upload failed')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">上传文件</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-6 w-6" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">选择文件</label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              required
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">标签（用逗号分隔）</label>
            <Input
              id="tags"
              value={tags}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTags(e.target.value)}
              placeholder="输入标签，用逗号分隔"
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={!file || uploading} className="w-full">
            {uploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                上传中...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                上传
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}