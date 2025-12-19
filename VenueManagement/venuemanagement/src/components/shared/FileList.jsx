'use client'

import React, { useState } from 'react'
import {
  FileText,
  Image as PhotoScan,
  Video,
  File,
  Trash,
  Download,
  Upload
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { v4 as uuidv4 } from 'uuid'
import uploadFileToS3 from '../../utils/uploadFileToS3'
 

const FileImport = ({ files: initialFiles = [], module, parentId, tenantId, onChange }) => {
  const [files, setFiles] = useState(initialFiles)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async acceptedFiles => {
      const uploaded = []

      for (const file of acceptedFiles) {
        const fileUrl = await uploadFileToS3({
          file,
          module,
          recordId: parentId,
          tenantId
        })

        uploaded.push({
          id: uuidv4(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: fileUrl
        })
      }

      const updatedFiles = [...files, ...uploaded]
      setFiles(updatedFiles)
      if (onChange) onChange(updatedFiles)
    }
  })

  const getFileIcon = fileType => {
    if (fileType.includes('pdf')) return <FileText size={24} className="text-red-500" />
    if (fileType.includes('image')) return <PhotoScan size={24} className="text-blue-500" />
    if (fileType.includes('video')) return <Video size={24} className="text-green-500" />
    return <File size={24} className="text-gray-500" />
  }

  const handleUpload = () => {
    setIsUploading(true)
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setIsUploading(false)
      }
    }, 300)
  }

  const handleRemoveFile = fileId => {
    const updated = files.filter(file => file.id !== fileId)
    setFiles(updated)
    if (onChange) onChange(updated)
  }

  const handleRemoveAllFiles = () => {
    setFiles([])
    if (onChange) onChange([])
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-6 text-center cursor-pointer mb-6"
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center">
          <Upload size={48} className="text-gray-400" />
          <p className="text-lg font-semibold mt-2">Drag and drop your files here</p>
          <p className="text-sm text-gray-500">Supported formats: PDF, Images, Videos</p>
          <button
            type="button"
            onClick={handleUpload}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
          >
            Upload Manually
          </button>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="mb-4">
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-green-500 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-center mt-1">Uploading... {uploadProgress}%</p>
        </div>
      )}

      {/* File List */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Uploaded Files ({files.length})</h2>
        {files.length > 0 && (
          <button
            onClick={handleRemoveAllFiles}
            className="text-sm text-red-600 hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {files.length === 0 ? (
        <p className="text-sm text-gray-500 text-center">No files uploaded yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {files.map(file => (
            <li key={file.id} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3 w-3/4">
                {getFileIcon(file.type)}
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.open(file.url, '_blank')}
                  title="Download"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={() => handleRemoveFile(file.id)}
                  title="Delete"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash size={20} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default FileImport
