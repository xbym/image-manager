import { useState } from 'react'
import { X, Upload, FileIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface UploadModalProps {
  onClose: () => void;
  onUpload: (data: { fileName: string; fileType: string; tags: string[] }) => void;
}

export default function UploadModal({ onClose, onUpload }: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleUpload = async () => {
    if (selectedFile) {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', selectedFile)
      tags.forEach(tag => formData.append('tags', tag))

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Upload failed')
        }

        const data = await response.json()
        onUpload({ fileName: data.fileName, fileType: data.fileType, tags: data.tags })
        onClose()
      } catch (error) {
        console.error('Upload error:', error)
        alert(error instanceof Error ? error.message : 'Upload failed. Please try again.')
      } finally {
        setIsUploading(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">上传文件</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-gray-500 hover:text-gray-700">
            <X size={24} />
          </Button>
        </div>
        <Input type="file" onChange={handleFileChange} className="mb-4 border-gray-300" accept="image/*,.pdf" />
        <div className="flex mb-2">
          <Input
            type="text"
            placeholder="添加标签"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="rounded-l-full border-gray-300"
          />
          <Button onClick={handleAddTag} className="rounded-r-full bg-blue-600 hover:bg-blue-700 text-white">添加</Button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map(tag => (
            <Badge key={tag} variant="secondary" className="rounded-full bg-gray-200 text-gray-800">
              {tag}
              <Button variant="ghost" size="icon" onClick={() => handleRemoveTag(tag)} className="ml-1 h-4 w-4 rounded-full text-gray-500 hover:text-gray-700">
                <X size={12} />
              </Button>
            </Badge>
          ))}
        </div>
        <Button 
          onClick={handleUpload} 
          className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white" 
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-spin" />
              上传中...
            </>
          ) : (
            '上传'
          )}
        </Button>
      </div>
    </div>
  )
}