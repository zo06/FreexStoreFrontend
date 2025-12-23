'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  acceptedFileTypes?: string[]
  maxFileSize?: number // in MB
  className?: string
  disabled?: boolean
  currentFile?: File | null
}

export function FileUpload({
  onFileSelect,
  acceptedFileTypes = ['.zip', '.rar', '.exe', '.tar', '.gz'],
  maxFileSize = 100,
  className,
  disabled = false,
  currentFile
}: FileUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setErrorMessage(`File is too large. Maximum size is ${maxFileSize}MB.`)
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setErrorMessage(`Invalid file type. Accepted types: ${acceptedFileTypes.join(', ')}`)
      } else {
        setErrorMessage('File upload failed. Please try again.')
      }
      setUploadStatus('error')
      return
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      onFileSelect(file)
      setUploadStatus('success')
      setErrorMessage('')
    }
  }, [onFileSelect, acceptedFileTypes, maxFileSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/vnd.rar': ['.rar'],
      'application/octet-stream': ['.exe'],
      'application/x-tar': ['.tar'],
      'application/gzip': ['.gz']
    },
    maxSize: maxFileSize * 1024 * 1024,
    multiple: false,
    disabled
  })

  const removeFile = () => {
    onFileSelect(null)
    setUploadStatus('idle')
    setErrorMessage('')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase()
    return <File className="w-8 h-8 text-blue-400" />
  }

  return (
    <div className={cn('w-full', className)}>
      {!currentFile ? (
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
                {isDragActive ? 'Drop the file here' : 'Drag & drop a script file here'}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                or click to browse files
              </p>
            </div>
            <div className="text-xs text-gray-500">
              <p>Supported formats: {acceptedFileTypes.join(', ')}</p>
              <p>Maximum file size: {maxFileSize}MB</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg border border-slate-600 bg-slate-800/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {getFileIcon(currentFile.name)}
              <div>
                <p className="text-sm font-medium text-white">{currentFile.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(currentFile.size)}</p>
              </div>
              {uploadStatus === 'success' && (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
            </div>
            <button
              onClick={removeFile}
              className="p-1 rounded transition-colors hover:bg-slate-700"
              disabled={disabled}
            >
              <X className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          </div>
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

