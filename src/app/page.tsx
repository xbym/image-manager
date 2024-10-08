'use client'

import { useState } from 'react'
import { Search, Upload, Image as ImageIcon, FileText, Globe, Share2, Download } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import UploadModal from '@/components/UploadModal'
import FileDetailModal from '@/components/FileDetailModal'
import WebpageSaveModal from '@/components/WebpageSaveModal'
import ShareModal from '@/components/ShareModal'
import Image from 'next/image'

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

// 示例结构化标签数据
const structuredTags: Tag[] = [
  {
    id: '1',
    name: '工作',
    children: [
      { id: '1-1', name: '项目A' },
      { id: '1-2', name: '项目B' },
    ]
  },
  {
    id: '2',
    name: '个人',
    children: [
      { id: '2-1', name: '旅行' },
      { id: '2-2', name: '学习' },
    ]
  },
]

export default function FileManager() {
  const [files, setFiles] = useState<File[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isWebpageSaveModalOpen, setIsWebpageSaveModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [shareFile, setShareFile] = useState<File | null>(null)

  const allTags = Array.from(new Set(files.flatMap(file => file.tags)))

  const filteredFiles = files.filter(file => 
    (searchTerm === '' || file.tags.some(tag => tag.includes(searchTerm))) &&
    (selectedTags.length === 0 || selectedTags.every(tag => file.tags.includes(tag)))
  )

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleUpload = ({ fileName, fileType, tags }: { fileName: string; fileType: string; tags: string[] }) => {
    const newFile: File = {
      id: files.length + 1,
      src: `/uploads/${fileName}`,
      type: fileType as 'image' | 'pdf',
      tags: tags,
      structuredTags: []
    }
    setFiles([...files, newFile])
  }

  const handleWebpageSave = ({ url, title, tags }: { url: string; title: string; tags: string[] }) => {
    const newFile: File = {
      id: files.length + 1,
      src: url,
      type: 'webpage',
      title,
      tags: tags,
      structuredTags: []
    }
    setFiles([...files, newFile])
  }

  const handleFileClick = (file: File) => {
    setSelectedFile(file)
  }

  const handleShare = (e: React.MouseEvent, file: File) => {
    e.stopPropagation()
    setShareFile(file)
  }

  const handleDownload = (e: React.MouseEvent, file: File) => {
    e.stopPropagation()
    if (file.type === 'image' || file.type === 'pdf') {
      const link = document.createElement('a')
      link.href = file.src
      link.download = file.title || `file.${file.type}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleUpdateTags = (fileId: number, newTags: string[]) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === fileId ? { ...file, tags: newTags } : file
      )
    )
  }

  const handleUpdateStructuredTags = (fileId: number, newTags: string[]) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === fileId ? { ...file, structuredTags: newTags } : file
      )
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">文件管理</h1>
        
        <div className="flex items-center mb-6  space-x-4">
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
            上传文件
          </Button>
          <Button className="rounded-full bg-green-600 hover:bg-green-700 text-white" onClick={() => setIsWebpageSaveModalOpen(true)}>
            <Globe className="mr-2" size={20} />
            保存网页链接
          </Button>
        </div>

        {allTags.length > 0 && (
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
        )}

        {filteredFiles.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFiles.map(file => (
              <div key={file.id} className="relative group cursor-pointer" onClick={() => handleFileClick(file)}>
                {file.type === 'image' ? (
                  <Image src={file.src} alt="" width={300} height={192} className="w-full h-48 object-cover rounded-lg" />
                ) : file.type === 'pdf' ? (
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <FileText size={48} className="text-gray-400" />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Globe size={48} className="text-blue-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex flex-col items-center justify-center">
                  <div className="text-white text-center mb-4">
                    {file.type === 'image' ? <ImageIcon size={24} className="mx-auto mb-2" /> : 
                     file.type === 'pdf' ? <FileText size={24} className="mx-auto mb-2" /> :
                     <Globe size={24} className="mx-auto mb-2" />}
                    <p className="font-semibold mb-2">{file.title || 'Untitled'}</p>
                    <div className="flex flex-wrap justify-center gap-1">
                      {file.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="rounded-full text-xs bg-white text-gray-800">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="rounded-full"
                      onClick={(e) => handleShare(e, file)}
                    >
                      <Share2 size={16} className="mr-1" />
                      分享
                    </Button>
                    {(file.type === 'image' || file.type === 'pdf') && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-full"
                        onClick={(e) => handleDownload(e, file)}
                      >
                        <Download size={16} className="mr-1" />
                        下载
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-xl text-gray-500">还没有上传任何文件或保存任何网页链接。点击&quot;上传文件&quot;或&quot;保存网页链接&quot;按钮开始添加内容。</p>
          </div>
        )}

        {isUploadModalOpen && (
          <UploadModal
            onClose={() => setIsUploadModalOpen(false)}
            onUpload={handleUpload}
          />
        )}

        {isWebpageSaveModalOpen && (
          <WebpageSaveModal
            onClose={() => setIsWebpageSaveModalOpen(false)}
            onSave={handleWebpageSave}
          />
        )}

        {selectedFile && (
          <FileDetailModal
            file={selectedFile}
            onClose={() => setSelectedFile(null)}
            onShare={() => {
              setShareFile(selectedFile)
              setSelectedFile(null)
            }}
            onDownload={handleDownload}
            allTags={structuredTags}
            onUpdateTags={handleUpdateTags}
            onUpdateStructuredTags={handleUpdateStructuredTags}
          />
        )}

        {shareFile && (
          <ShareModal
            file={shareFile}
            onClose={() => setShareFile(null)}
          />
        )}
      </div>
    </div>
  )
}