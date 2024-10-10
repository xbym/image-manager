import { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ShareModalProps {
  file: {
    id: number;
    src: string;
    type: 'image' | 'pdf' | 'webpage';
    title?: string;
  };
  onClose: () => void;
}

export default function ShareModal({ file, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 更新 shareUrl 生成方式
  const shareUrl = `${window.location.origin}/api/file/${file.id}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Failed to copy link. Please try again.')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: file.title || 'Shared File',
          text: `Check out this ${file.type}!`,
          url: shareUrl
        })
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          setError('Failed to share. Please try copying the link instead.')
        }
      }
    } else {
      setError('Web Share API is not supported in your browser. Please use the copy link option.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">分享 {file.title || file.type}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-gray-500 hover:text-gray-700">
            <X size={24} />
          </Button>
        </div>
        <div className="mb-4">
          <Input
            value={shareUrl}
            readOnly
            className="pr-20"
          />
          <Button
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={handleCopy}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? '已复制' : '复制'}
          </Button>
        </div>
        <Button onClick={handleShare} className="w-full mb-4">
          使用系统分享
        </Button>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}