import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface FileDetailModalProps {
  file: {
    id: number;
    src: string;
    type: 'image' | 'pdf';
    tags: string[];
  };
  onClose: () => void;
}

export default function FileDetailModal({ file, onClose }: FileDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">文件详情</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-gray-500 hover:text-gray-700">
            <X size={24} />
          </Button>
        </div>
        <div className="mb-4">
          {file.type === 'image' ? (
            <img src={file.src} alt="Uploaded image" className="w-full h-auto max-h-[60vh] object-contain" />
          ) : (
            <iframe src={file.src} className="w-full h-[60vh]" title="PDF viewer"></iframe>
          )}
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">标签：</h3>
          <div className="flex flex-wrap gap-2">
            {file.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="rounded-full bg-gray-200 text-gray-800">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">文件 ID: {file.id}</span>
          <Button onClick={() => window.open(file.src, '_blank')} className="bg-blue-600 hover:bg-blue-700 text-white">
            在新标签页中打开
          </Button>
        </div>
      </div>
    </div>
  )
}