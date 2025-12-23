'use client';

import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';

interface IconPickerProps {
  selectedIcon?: string;
  onIconSelect: (iconName: string) => void;
  onClose: () => void;
  categoryId?: string;
}





import { safeAdminApi } from '@/lib/admin-api';

export default function IconPicker({ selectedIcon, onIconSelect, onClose, categoryId }: IconPickerProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => {
        setUploadSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploadSuccess('');
    setIsUploading(true);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file');
      setIsUploading(false);
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image must be less than 2MB');
      setIsUploading(false);
      return;
    }

    // Create image to check dimensions
    const img = new window.Image();
    img.onload = async () => {
      try {
        // If categoryId is provided, upload to server
        if (categoryId) {
          const response = await safeAdminApi.categories.uploadIcon(categoryId, file);
          console.log(response)
          if (response) {
            setUploadedImage(response.iconUrl);
            setUploadSuccess('Image uploaded successfully!');
            onIconSelect(response.iconUrl);
          }
        } else {
          // Fallback to data URL for preview
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setUploadedImage(dataUrl);
            onIconSelect(dataUrl);
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        console.error('Upload failed:', error);
        setUploadError('Upload failed. Please try again.');
      } finally {
        setIsUploading(false);
      }
    };
    img.onerror = () => {
      setUploadError('Invalid image file');
      setIsUploading(false);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleUseUploadedImage = () => {
    if (uploadedImage) {
      onIconSelect(uploadedImage);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Upload Custom Icon</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>





        {(
          <div className="space-y-4">
            {uploadSuccess && (
              <div className="p-4 bg-green-500/20 border-2 border-green-500/50 rounded-lg text-green-300 text-base font-semibold shadow-lg animate-pulse">
                ✅ {uploadSuccess}
              </div>
            )}
            
              {!categoryId && (
              <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-300 text-sm">
                Please save the category first, then edit it to upload a custom icon.
              </div>
            )}
            
            {uploadError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {uploadError}
              </div>
            )}

            {uploadedImage && (
              <div className="text-center">
                <div className="mb-3 text-white font-medium">Uploaded Image Preview:</div>
                <img
                  src={uploadedImage.startsWith('/') ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${uploadedImage}` : uploadedImage}
                  alt="Uploaded icon"
                  className="mx-auto mb-3 w-32 h-32 object-contain rounded-lg border border-white/10"
                />
                <button
                  onClick={handleUseUploadedImage}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Use This Image
                </button>
              </div>
            )}
            
            <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageUpload}
                className="hidden"
                id="icon-upload"
                disabled={isUploading || !categoryId}
              />
              <label
                htmlFor="icon-upload"
                className={`cursor-pointer block ${
                  !categoryId ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="mx-auto mb-3 w-12 h-12 text-gray-400" />
                <div className="text-white font-medium mb-1">
                  Upload Custom Icon
                </div>
                <div className="text-gray-400 text-sm">
                  {!categoryId 
                    ? 'Save category first to upload icon' 
                    : isUploading 
                      ? 'Uploading...' 
                      : 'Click to upload an image (PNG, JPG, JPEG, WebP)'
                  }
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  Maximum file size: 2MB
                </div>
              </label>
            </div>


          </div>
        )}


      </div>
    </div>
  );
}
