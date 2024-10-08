import { useState } from 'react'
import { X, Share2, Download, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import SidebarTags from './SidebarTags'

interface Tag {
  id: string;
  name: string;
  children?: Tag[];
}

interface File {
  id: number;
  src: string;
  type: 'image' | 'pdf' | 'webpage';
  title?: string;
  tags: string[];
  structuredTags: string[];
}

interface FileDetailModalProps {
  file: File;
  onClose: () => void;
  onShare: () => void;
  onDownload: (e: React.MouseEvent, file: File) => void;
  allTags: Tag[];
  onUpdateTags: (fileId: number, newTags: string[]) => void;
  onUpdateStructuredTags: (fileId: number, newTags: string[]) => void;
}

export default function FileDetailModal({ 
  file, 
  onClose, 
  onShare, 
  onDownload, 
  allTags,
  onUpdateTags,
  onUpdateStructuredTags
}: FileDetailModalProps) {
  const [newTag, setNewTag] = useState('')
  const [selectedStructuredTags, setSelectedStructuredTags] = useState<string[]>(file.structuredTags)

  const handleAddTag = () => {
    if (newTag && !file.tags.includes(newTag)) {
      const updatedTags = [...file.tags, newTag]
      onUpdateTags(file.id, updatedTags)
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = file.tags.filter(tag => tag !== tagToRemove)
    onUpdateTags(file.id, updatedTags)
  }

  const handleStructuredTagSelect = (tagId: string) => {
    setSelectedStructuredTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
    onUpdateStructuredTags(file.id, selectedStructuredTags)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex">
        <SidebarTags 
          tags={allTags} 
          onTagSelect={handleStructuredTagSelect}
          selectedTags={selectedStructuredTags}
        />
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">{file.title || 'File Details'}</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-gray-500 hover:text-gray-700">
              <X size={24} />
            </Button>
          </div>
          <div className="mb-4">
            {file.type === 'image' ? (
              <img src={file.src} alt={file.title} className="w-full h-auto rounded-lg" />
            ) : file.type === 'pdf' ? (
              <iframe src={file.src} title={file.title} className="w-full h-96 rounded-lg" />
            ) : (
              <iframe src={file.src} title={file.title} className="w-full h-96 rounded-lg" />
            )}
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">标签</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {file.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="rounded-full bg-gray-200 text-gray-800">
                  {tag}
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveTag(tag)} className="ml-1 h-4 w-4 rounded-full text-gray-500 hover:text-gray-700">
                    <X size={12} />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex">
              <Input
                type="text"
                placeholder="添加新标签"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="rounded-l-full"
              />
              <Button onClick={handleAddTag} className="rounded-r-full">
                <Plus size={16} className="mr-2" />
                添加
              </Button>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button onClick={onShare} className="rounded-full bg-blue-600 hover:bg-blue-700 text-white">
              <Share2 size={20} className="mr-2" />
              分享
            </Button>
            {(file.type === 'image' || file.type === 'pdf') && (
              <Button onClick={(e) => onDownload(e, file)} className="rounded-full bg-green-600 hover:bg-green-700 text-white">
                <Download size={20} className="mr-2" />
                下载
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}