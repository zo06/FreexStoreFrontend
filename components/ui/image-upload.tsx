'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void
  maxFileSize?: number // in MB
  className?: string
  disabled?: boolean
  currentImage?: File | string | null
}

export function ImageUpload({
  onImageSelect,
  maxFileSize = 2,
  className,
  disabled = false,
  currentImage
}: ImageUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  React.useEffect(() => {
    if (currentImage) {
      if (typeof currentImage === 'string') {
        setPreviewUrl(currentImage)
      } else if (currentImage instanceof File) {
        const url = URL.createObjectURL(currentImage)
        setPreviewUrl(url)
        return () => URL.revokeObjectURL(url)
      }
    } else {
      setPreviewUrl(null)
    }
  }, [currentImage])

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setErrorMessage(`Image is too large. Maximum size is ${maxFileSize}MB.`)
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setErrorMessage('Invalid file type. Only PNG, JPG, JPEG, and WebP images are allowed.')
      } else {
        setErrorMessage('Image upload failed. Please try again.')
      }
      setUploadStatus('error')
      return
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      onImageSelect(file)
      setUploadStatus('success')
      setErrorMessage('')
      
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }, [onImageSelect, maxFileSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp']
    },
    maxSize: maxFileSize * 1024 * 1024,
    multiple: false,
    disabled
  })

  const removeImage = () => {
    onImageSelect(null)
    setUploadStatus('idle')
    setErrorMessage('')
    setPreviewUrl(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn('w-full', className)}>
      {!previewUrl ? (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200',
            'bg-slate-800/50 border-slate-600 hover:border-slate-500 hover:bg-slate-800/70',
            isDragActive && 'border-blue-400 bg-blue-400/10',
            disabled && 'opacity-50 cursor-not-allowed',
            uploadStatus === 'error' && 'border-red-400 bg-red-400/10'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-3">
            <div className={cn(
              'p-3 rounded-full',
              isDragActive ? 'bg-blue-400/20' : 'bg-slate-700/50'
            )}>
              <Upload className={cn(
                'w-6 h-6',
                isDragActive ? 'text-blue-400' : 'text-gray-400'
              )} />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                or click to browse images
              </p>
            </div>
            <div className="text-xs text-gray-500">
              <p>Supported formats: PNG, JPG, JPEG, WebP</p>
              <p>Maximum file size: {maxFileSize}MB</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-600 bg-slate-800/50">
          <div className="relative">
            <img
              src={previewUrl.startsWith('blob:') || previewUrl.startsWith('http') ? previewUrl : `${process.env.NEXT_PUBLIC_BACKEND_URL}${previewUrl}`}
              alt="Image Upload Preview - Selected File for Upload | FreexStore Admin Panel"
              className="object-cover w-full h-48"
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 rounded-full transition-colors bg-black/50 hover:bg-black/70"
              disabled={disabled}
            >
              <X className="w-4 h-4 text-white" />
            </button>
            {uploadStatus === 'success' && (
              <div className="absolute top-2 left-2 p-1 rounded-full bg-green-500/80">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          {currentImage instanceof File && (
            <div className="p-3 border-t border-slate-600">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-white">{currentImage.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(currentImage.size)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {uploadStatus === 'error' && errorMessage && (
        <div className="flex items-center mt-2 space-x-2 text-sm text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  )
}

