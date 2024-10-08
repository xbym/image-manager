import { useState } from 'react'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Tag {
  id: string;
  name: string;
  children?: Tag[];
}

interface SidebarTagsProps {
  tags: Tag[];
  onTagSelect: (tagId: string) => void;
  selectedTags: string[];
}

export default function SidebarTags({ tags, onTagSelect, selectedTags }: SidebarTagsProps) {
  const [expandedTags, setExpandedTags] = useState<string[]>([])
  const [newTagName, setNewTagName] = useState('')

  const toggleExpand = (tagId: string) => {
    setExpandedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  const renderTag = (tag: Tag, depth = 0) => (
    <div key={tag.id} className="mb-1">
      <div className="flex items-center">
        {tag.children && tag.children.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-6 w-6"
            onClick={() => toggleExpand(tag.id)}
          >
            {expandedTags.includes(tag.id) ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </Button>
        )}
        <Button
          variant={selectedTags.includes(tag.id) ? "secondary" : "ghost"}
          size="sm"
          className={`h-6 ${depth > 0 ? 'ml-4' : ''}`}
          onClick={() => onTagSelect(tag.id)}
        >
          {tag.name}
        </Button>
      </div>
      {expandedTags.includes(tag.id) && tag.children && (
        <div className="ml-4">
          {tag.children.map(childTag => renderTag(childTag, depth + 1))}
        </div>
      )}
    </div>
  )

  const addNewTag = () => {
    // 这里应该调用一个函数来添加新标签到数据库或状态
    console.log('Adding new tag:', newTagName)
    setNewTagName('')
  }

  return (
    <div className="w-64 bg-gray-100 p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">分类标签</h2>
      {tags.map(tag => renderTag(tag))}
      <div className="mt-4">
        <Input
          type="text"
          placeholder="新标签名称"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          className="mb-2"
        />
        <Button onClick={addNewTag} className="w-full">
          <Plus size={16} className="mr-2" />
          添加新标签
        </Button>
      </div>
    </div>
  )
}