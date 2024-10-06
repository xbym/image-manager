'use client'

import { useState } from 'react'
import { Search, Upload, Image as ImageIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import UploadModal from '@/components/UploadModal'

interface Image {
  id: number;
  src: string;
  tags: string[];
}

export default function ImageManager() {
  const [images, setImages] = useState<Image[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  const allTags = Array.from(new Set(images.flatMap(img => img.tags)))

  const filteredImages = images.filter(img => 
    (searchTerm === '' || img.tags.some(tag => tag.includes(searchTerm))) &&
    (selectedTags.length === 0 || selectedTags.every(tag => img.tags.includes(tag)))
  )

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleUpload = ({ fileName, tags }: { fileName: string; tags: string[] }) => {
    const newImage: Image = {
      id: images.length + 1,
      src: `/uploads/${fileName}`,
      tags: tags
    }
    setImages([...images, newImage])
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">个人图片管理</h1>
        
        <div className="flex items-center mb-6 space-x-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="搜索标签..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-full border-gray-300"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsUploadModalOpen(true)}>
            <Upload className="mr-2" size={20} />
            上传图片
          </Button>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">标签筛选：</h2>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Badge 
                key={tag} 
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className={`cursor-pointer rounded-full ${
                  selectedTags.includes(tag) 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map(img => (
            <div key={img.id} className="relative group">
              <img src={img.src} alt="" className="w-full h-48 object-cover rounded-lg" />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <ImageIcon size={24} className="mx-auto mb-2" />
                  <div className="flex flex-wrap justify-center gap-1">
                    {img.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="rounded-full text-xs bg-white text-gray-800">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isUploadModalOpen && (
          <UploadModal
            onClose={() => setIsUploadModalOpen(false)}
            onUpload={handleUpload}
          />
        )}
      </div>
    </div>
  )
}