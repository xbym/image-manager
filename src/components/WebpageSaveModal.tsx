import { useState } from 'react'
import { X, Save, AlertTriangle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface WebpageSaveModalProps {
  onClose: () => void;
  onSave: (data: { url: string; title: string; tags: string[] }) => void;
}

export default function WebpageSaveModal({ onClose, onSave }: WebpageSaveModalProps) {
  const [url, setUrl] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = async () => {
    if (url) {
      setIsSaving(true)
      setError(null)
      try {
        const response = await fetch('/api/save-webpage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url, tags }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to save webpage')
        }

        onSave({ url: data.url, title: data.title, tags: data.tags })
        onClose()
      } catch (error) {
        console.error('Save error:', error)
        setError(error instanceof Error ? error.message : 'An unknown error occurred')
      } finally {
        setIsSaving(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">保存网页链接</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-gray-500 hover:text-gray-700">
            <X size={24} />
          </Button>
        </div>
        <Input
          type="url"
          placeholder="输入网页 URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mb-4 border-gray-300"
        />
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
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button 
          onClick={handleSave} 
          className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white" 
          disabled={!url || isSaving}
        >
          {isSaving ? (
            <>
              <Save className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            '保存网页链接'
          )}
        </Button>
      </div>
    </div>
  )
}