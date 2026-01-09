"use client"
import { useState, useEffect } from 'react'
import { Script } from '@/lib/types/api.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { AnimatedSelect } from '@/components/ui/animated-select'
import { Textarea } from '@/components/ui/textarea'
import { FileUpload } from '@/components/ui/file-upload'
import { ImageUpload } from '@/components/ui/image-upload'
import { safeAdminApi } from '@/lib/admin-api'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Upload, Copy, RefreshCw, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

// UUID generation function
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface ScriptFormData {
  name: string
  description: string
  category?: string
  developerIds: string[]
  price: number
  scriptUUID: string
  isActive: boolean
  popular: boolean
  new: boolean
  trialAvailable: boolean
  licenseType: 'forever' | 'date'
  fileType: string
  version: string
  imageUrl: string
  imageUrls: string[]
  youtubeUrl: string
  downloadUrl: string
  features: string[]
  requirements: string
  discordRoleId: string
  // SEO Fields
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  slug: string
}

interface ScriptFormProps {
  mode: 'create' | 'edit'
  script?: Script
  categories?: any[]
  developers?: any[]
  onSuccess?: () => void
  onCancel?: () => void
}

export function ScriptForm({ mode, script, categories: initialCategories, developers: initialDevelopers, onSuccess, onCancel }: ScriptFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<ScriptFormData>({
    name: script?.name || '',
    description: script?.description || '',
    category: ((script?.category as { id?: string } | undefined)?.id) || undefined,
    developerIds: (script as any)?.developers?.map((d: any) => d.id) || [],
    price: script?.price || 0,
    scriptUUID: (script as any)?.scriptUUID || '',
    isActive: script?.isActive ?? true,
    popular: script?.popular ?? false,
    new: script?.new ?? false,
    trialAvailable: (script as any)?.trialAvailable ?? false,
    licenseType: script?.licenseType || 'date',
    fileType: 'rar',
    version: script?.version || '1.0.0',
    imageUrl: script?.imageUrl || '',
    imageUrls: (() => {
      const urls = script?.imageUrls as string[] | string | undefined;
      if (Array.isArray(urls)) return urls;
      if (typeof urls === 'string' && urls) {
        return urls.startsWith('[') ? JSON.parse(urls) : urls.split(',').map((u: string) => u.trim()).filter(Boolean);
      }
      return [];
    })(),
    youtubeUrl: script?.youtubeUrl || '',
    downloadUrl: script?.downloadUrl || '',
    features: script?.features ? script.features.split(',').map(f => f.trim()) : [''],
    requirements: script?.requirements || '',
    discordRoleId: (script as any)?.discordRoleId || '',
    // SEO Fields
    seoTitle: (script as any)?.seoTitle || '',
    seoDescription: (script as any)?.seoDescription || '',
    seoKeywords: (script as any)?.seoKeywords || '',
    slug: (script as any)?.slug || ''
  })
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dbCategories, setDbCategories] = useState<any[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [developers, setDevelopers] = useState<any[]>([])
  const [developersLoading, setDevelopersLoading] = useState(true)
  
  // Update form data when script prop changes (for edit mode)
  useEffect(() => {
    if (script && mode === 'edit') {
      setFormData({
        name: script.name || '',
        description: script.description || '',
        category: ((script.category as { id?: string } | undefined)?.id) || (script as any).categoryId || undefined,
        developerIds: (script as any)?.developers?.map((d: any) => d.id) || [],
        price: script.price || 0,
        scriptUUID: (script as any)?.scriptUUID || '',
        isActive: script.isActive ?? true,
        popular: script.popular ?? false,
        new: script.new ?? false,
        trialAvailable: (script as any)?.trialAvailable ?? false,
        licenseType: script.licenseType || 'forever',
        fileType: (script as any)?.fileType || 'rar',
        version: script.version || '1.0.0',
        imageUrl: script.imageUrl || '',
        imageUrls: (() => {
          const urls = script.imageUrls as string[] | string | undefined;
          if (Array.isArray(urls)) return urls;
          if (typeof urls === 'string' && urls) {
            return urls.startsWith('[') ? JSON.parse(urls) : urls.split(',').map((u: string) => u.trim()).filter(Boolean);
          }
          return [];
        })(),
        youtubeUrl: script.youtubeUrl || '',
        downloadUrl: script.downloadUrl || '',
        features: script.features ? script.features.split(',').map(f => f.trim()) : [''],
        requirements: script.requirements || '',
        discordRoleId: (script as any)?.discordRoleId || '',
        // SEO Fields
        seoTitle: (script as any)?.seoTitle || '',
        seoDescription: (script as any)?.seoDescription || '',
        seoKeywords: (script as any)?.seoKeywords || '',
        slug: (script as any)?.slug || ''
      })
    }
  }, [script, mode])

  // Load categories and developers on component mount (only if not provided)
  useEffect(() => {
    // If categories are provided, use them instead of fetching
    if (initialCategories) {
      setDbCategories(initialCategories)
      setCategoriesLoading(false)
    } else {
      const loadCategories = async () => {
        try {
          setCategoriesLoading(true)
          const categories = await safeAdminApi.categories.getActive()
          setDbCategories(categories || [])
        } catch (error) {
          console.error('Failed to load categories:', error)
          setDbCategories([])
        } finally {
          setCategoriesLoading(false)
        }
      }
      loadCategories()
    }
    
    // If developers are provided, use them instead of fetching
    if (initialDevelopers) {
      setDevelopers(initialDevelopers)
      setDevelopersLoading(false)
    } else {
      const loadDevelopers = async () => {
        try {
          setDevelopersLoading(true)
          const token = localStorage.getItem('access_token')
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/developers/active`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            const result = await response.json()
            setDevelopers(result.data || [])
          }
        } catch (error) {
          console.error('Failed to load developers:', error)
          setDevelopers([])
        } finally {
          setDevelopersLoading(false)
        }
      }
      loadDevelopers()
    }
  }, [initialCategories, initialDevelopers])

  // Category options from database
  const categoryOptions = (dbCategories && dbCategories.length > 0) 
    ? dbCategories.map(cat => ({ value: cat.id, label: cat.name }))
    : []

  const developerOptions = (developers && developers.length > 0) 
    ? developers.map(developer => ({ value: developer.id, label: developer.name }))
    : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Script name is required')
      return
    }

    if (mode === 'create' && !selectedFile) {
      toast.error('Please select a script file')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Validate price is a valid number and not negative
      const basePrice = Number(formData.price)
      if (isNaN(basePrice) || basePrice < 0) {
        toast.error('Price must be a valid number greater than or equal to 0')
        return
      }

      // Upload RAR file to Cloudinary first if selected
      let downloadUrl = formData.downloadUrl
      if (selectedFile) {
        toast.loading('Uploading script file to Cloudinary...', { id: 'upload-rar' })
        try {
          const uploadResult = await safeAdminApi.scripts.uploadRarDirect(selectedFile)
          downloadUrl = uploadResult.downloadUrl
          toast.success('Script file uploaded successfully!', { id: 'upload-rar' })
        } catch (error) {
          console.error('Failed to upload RAR file:', error)
          toast.error('Failed to upload script file', { id: 'upload-rar' })
          setIsSubmitting(false)
          return
        }
      }

      // Prepare script data as JSON object with downloadUrl included
      const scriptData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category || 'General',
        developerIds: formData.developerIds || [],
        price: basePrice,
        isActive: formData.isActive,
        popular: formData.popular,
        new: formData.new,
        trialAvailable: formData.trialAvailable,
        fileType: 'rar' as const,
        version: formData.version || '1.0.0',
        features: formData.features.filter(f => f.trim()).join(', '),
        requirements: formData.requirements || '',
        licenseType: formData.licenseType,
        youtubeUrl: formData.youtubeUrl.trim(),
        scriptUUID: formData.scriptUUID || null,
        discordRoleId: formData.discordRoleId || null,
        downloadUrl: downloadUrl || undefined,
        // SEO Fields
        seoTitle: formData.seoTitle.trim() || formData.name.trim(),
        seoDescription: formData.seoDescription.trim() || formData.description.trim(),
        seoKeywords: formData.seoKeywords.trim(),
        slug: formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        // Include existing imageUrl only if no new image is selected
        ...(formData.imageUrl && !selectedImage ? { imageUrl: formData.imageUrl } : {})
      }

      let result
      if (mode === 'create') {
        result = await safeAdminApi.scripts.create(scriptData)
        
        // Upload the main image after creating the script
        if (selectedImage) {
          try {
            await safeAdminApi.scripts.uploadImage(result.id, selectedImage)
          } catch (error) {
            console.error('Failed to upload image:', error)
            toast.error('Script created but image upload failed')
          }
        }
        
        // Upload multiple images after creating the script
        if (selectedImages && selectedImages.length > 0) {
          try {
            await safeAdminApi.scripts.uploadImages(result.id, selectedImages)
          } catch (error) {
            console.error('Failed to upload images:', error)
            toast.error('Script created but some images upload failed')
          }
        }
        
        toast.success('Script created successfully')
      } else if (mode === 'edit' && script) {
        result = await safeAdminApi.scripts.update(script.id, scriptData)
        
        // Upload the main image if a new one is selected
        if (selectedImage) {
          try {
            await safeAdminApi.scripts.uploadImage(script.id, selectedImage)
          } catch (error) {
            console.error('Failed to upload image:', error)
            toast.error('Script updated but image upload failed')
          }
        }
        
        // Upload multiple images if new ones are selected
        if (selectedImages && selectedImages.length > 0) {
          try {
            await safeAdminApi.scripts.uploadImages(script.id, selectedImages)
          } catch (error) {
            console.error('Failed to upload images:', error)
            toast.error('Script updated but some images upload failed')
          }
        }
        
        toast.success('Script updated successfully')
      }
      
      onSuccess?.()
      router.push('/admin/scripts')
    } catch (error) {
      console.error(`Failed to ${mode} script:`, error)
      toast.error(`Failed to ${mode} script`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.push('/admin/scripts')
    }
  }

  const handleGenerateUUID = () => {
    const newUUID = generateUUID();
    setFormData({ ...formData, scriptUUID: newUUID });
    toast.success('Script UUID generated!');
  };

  const handleCopyUUID = () => {
    if (formData.scriptUUID) {
      navigator.clipboard.writeText(formData.scriptUUID);
      toast.success('Script UUID copied to clipboard!');
    } else {
      toast.error('No UUID to copy. Generate one first!');
    }
  };

  const handleAutoGenerateSEO = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a script name first');
      return;
    }

    // Generate slug from name
    const generatedSlug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Generate SEO title (max 60 chars)
    const generatedTitle = formData.name.length > 60 
      ? formData.name.substring(0, 57) + '...'
      : formData.name;

    // Generate SEO description from script description (max 160 chars)
    let generatedDescription = formData.description.trim();
    if (generatedDescription.length > 160) {
      generatedDescription = generatedDescription.substring(0, 157) + '...';
    } else if (!generatedDescription) {
      generatedDescription = `${formData.name} - Premium FiveM NUI Script. High-quality, optimized, and easy to use.`;
      if (generatedDescription.length > 160) {
        generatedDescription = generatedDescription.substring(0, 157) + '...';
      }
    }

    // Generate keywords from name and category
    const categoryName = dbCategories.find(cat => cat.id === formData.category)?.name || '';
    const keywords = [
      'fivem',
      'script',
      'nui',
      formData.name.toLowerCase(),
      categoryName.toLowerCase(),
      'custom',
      'premium'
    ].filter(Boolean).join(', ');

    setFormData({
      ...formData,
      slug: generatedSlug,
      seoTitle: generatedTitle,
      seoDescription: generatedDescription,
      seoKeywords: keywords
    });

    toast.success('SEO data auto-generated successfully!');
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br via-cyan-900 from-slate-900 to-slate-900">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-8 space-x-4">
          <Button
            onClick={handleCancel}
            className="text-white bg-gradient-to-r border shadow-lg backdrop-blur-sm transition-all duration-300 from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-white/10 hover:shadow-xl hover:scale-105"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Scripts
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {mode === 'create' ? 'Create New Script' : 'Edit Script'}
            </h1>
            <p className="mt-1 text-gray-400">
              {mode === 'create' 
                ? 'Add a new script to the platform with its details and configuration.'
                : 'Update the script details and configuration.'
              }
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-8 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="name" className="text-white">Script Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter script name"
                  className="mt-1 text-white bg-white/10 border-white/20 placeholder:text-gray-400"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category" className="text-white">Category</Label>
                <div className="mt-1">
                  <AnimatedSelect
                    options={categoryOptions}
                    value={formData.category}
                    onChange={(value) => setFormData({ ...formData, category: value })}
                    placeholder="Select category"
                    isDisabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="price" className="text-white">{formData.licenseType === 'forever' ? 'Price Forever (USD) *' : 'Price per Month (USD) *'}</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="mt-1 text-white bg-white/10 border-white/20 placeholder:text-gray-400"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="licenseType" className="text-white">License Type</Label>
                <div className="mt-1">
                  <AnimatedSelect
                    options={[
                      { value: 'forever', label: 'Forever License' },
                      { value: 'date', label: 'Time-based License' }
                    ]}
                    value={formData.licenseType}
                    onChange={(value) => setFormData({ ...formData, licenseType: value as 'forever' | 'date' })}
                    placeholder="Select license type"
                    isDisabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter script description"
                rows={4}
                className="mt-1 text-white bg-white/10 border-white/20 placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="version" className="text-white">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="1.0.0"
                  className="mt-1 text-white bg-white/10 border-white/20 placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <Label htmlFor="scriptUUID" className="text-white">Script UUID (Validation)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="scriptUUID"
                    value={formData.scriptUUID}
                    onChange={(e) => setFormData({ ...formData, scriptUUID: e.target.value })}
                    placeholder="Click generate to create UUID"
                    className="text-white bg-white/10 border-white/20 placeholder:text-gray-400"
                    readOnly
                  />
                  <Button
                    type="button"
                    onClick={handleGenerateUUID}
                    className="px-3 text-white bg-gradient-to-r border shadow-lg backdrop-blur-sm transition-all duration-300 from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 border-white/10 hover:shadow-xl hover:scale-105"
                    title="Generate UUID"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCopyUUID}
                    className="px-3 text-white bg-gradient-to-r border shadow-lg backdrop-blur-sm transition-all duration-300 from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 border-white/10 hover:shadow-xl hover:scale-105"
                    title="Copy UUID"
                    disabled={!formData.scriptUUID}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Generate a unique UUID for script validation
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label className="text-white">Developers (Multiple)</Label>
                <div className="mt-1 space-y-2">
                  {developersLoading ? (
                    <p className="text-gray-400 text-sm">Loading developers...</p>
                  ) : (
                    <>
                      {formData.developerIds.map((devId) => {
                        const dev = developers.find(d => d.id === devId);
                        return (
                          <div key={devId} className="flex justify-between items-center p-2 rounded-lg bg-white/10">
                            <span className="text-white">{dev?.name || 'Unknown'}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  developerIds: formData.developerIds.filter(id => id !== devId)
                                });
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                      <AnimatedSelect
                        options={developerOptions.filter(opt => !formData.developerIds.includes(opt.value))}
                        value=""
                        onChange={(value) => {
                          if (value && !formData.developerIds.includes(value)) {
                            setFormData({ ...formData, developerIds: [...formData.developerIds, value] });
                          }
                        }}
                        placeholder="Add developer..."
                        isDisabled={isSubmitting || developersLoading}
                      />
                    </>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-400">Assign multiple developers to this script</p>
              </div>

              <div>
                <Label htmlFor="discordRoleId" className="text-white">Discord Role ID (for paid users)</Label>
                <Input
                  id="discordRoleId"
                  value={formData.discordRoleId}
                  onChange={(e) => setFormData({ ...formData, discordRoleId: e.target.value })}
                  placeholder="Enter Discord Role ID (e.g., 1234567890123456789)"
                  className="mt-1 text-white bg-white/10 border-white/20 placeholder:text-gray-400"
                  disabled={isSubmitting}
                />
                <p className="mt-1 text-xs text-gray-400">
                  Paste the Discord Role ID here. Users who purchase this script will receive this role.
                  <br />
                  To get Role ID: Discord Server Settings → Roles → Right-click role → Copy Role ID
                </p>
              </div>
            </div>

            <div>
              <Label className="text-white">Features</Label>
              <div className="mt-1 space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...formData.features];
                        newFeatures[index] = e.target.value;
                        setFormData({ ...formData, features: newFeatures });
                      }}
                      placeholder="Enter feature..."
                      className="text-white bg-white/10 border-white/20 placeholder:text-gray-400"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newFeatures = formData.features.filter((_, i) => i !== index);
                        setFormData({ ...formData, features: newFeatures });
                      }}
                      disabled={formData.features.length === 1}
                      className="text-white bg-white/10 border-white/20 hover:bg-white/20"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData({ ...formData, features: [...formData.features, ''] });
                  }}
                  className="text-white bg-white/10 border-white/20 hover:bg-white/20"
                >
                  Add Feature
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="requirements" className="text-white">Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="List the system requirements (one per line)"
                rows={3}
                className="mt-1 text-white bg-white/10 border-white/20 placeholder:text-gray-400"
              />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="scriptFile" className="text-white">
                  Script File (WinRAR Archive) {mode === 'create' ? '*' : ''}
                </Label>
                <div className="mt-1">
                  <FileUpload
                    onFileSelect={setSelectedFile}
                    currentFile={selectedFile}
                    acceptedFileTypes={['.rar']}
                    maxFileSize={100}
                    disabled={isSubmitting}
                  />
                </div>
                {mode === 'edit' && formData.downloadUrl && !selectedFile && (
                  <div className="mt-2 p-2 rounded-lg bg-green-900/30 border border-green-500/30">
                    <p className="text-sm text-green-400 flex items-center">
                      <span className="mr-2">✓</span>
                      Current file uploaded ({(script as any)?.fileType || 'rar'} format)
                    </p>
                  </div>
                )}
                <p className="mt-1 text-sm text-gray-400">
                  Upload a WinRAR archive (.rar) containing your script files
                  {mode === 'edit' && ' (leave empty to keep current file)'}
                </p>
              </div>

              <div>
                <Label className="text-white">Script Image</Label>
                <div className="mt-1">
                  <ImageUpload
                    onImageSelect={setSelectedImage}
                    currentImage={selectedImage || formData.imageUrl}
                    maxFileSize={2}
                    disabled={isSubmitting}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-400">
                  Upload a thumbnail image for your script
                </p>
              </div>
            </div>

            {/* Script Images and YouTube URL */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label className="text-white">Script Images</Label>
                <div className="mt-1">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) {
                        setSelectedImages(Array.from(e.target.files));
                      }
                    }}
                    className="px-3 py-2 w-full text-white rounded-md border bg-white/10 border-white/20 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    disabled={isSubmitting}
                  />
                </div>
                {/* Show existing images in edit mode */}
                {mode === 'edit' && formData.imageUrls && formData.imageUrls.length > 0 && selectedImages.length === 0 && (
                  <div className="mt-2">
                    <p className="mb-2 text-sm text-gray-400">
                      Current images: {formData.imageUrls.length} image(s)
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {formData.imageUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Current ${index + 1}`}
                            className="object-cover w-full h-16 rounded border border-white/20"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-yellow-400">
                      Upload new images to replace existing ones
                    </p>
                  </div>
                )}
                {selectedImages.length > 0 && (
                  <div className="mt-2">
                    <p className="mb-2 text-sm text-gray-400">
                      Selected: {selectedImages.length} image(s)
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="object-cover w-full h-16 rounded border border-white/20"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = selectedImages.filter((_, i) => i !== index);
                              setSelectedImages(newImages);
                            }}
                            className="flex absolute -top-1 -right-1 justify-center items-center w-5 h-5 text-xs text-white bg-red-600 rounded-full hover:bg-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p className="mt-1 text-sm text-gray-400">
                  Upload multiple images to showcase your script
                </p>
              </div>

              <div>
                <Label htmlFor="youtubeUrl" className="text-white">YouTube Video URL</Label>
                <Input
                  id="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="mt-1 text-white bg-white/10 border-white/20 placeholder:text-gray-400"
                />
                <p className="mt-1 text-sm text-gray-400">
                  Add a YouTube video demonstration of your script
                </p>
              </div>
            </div>

            {/* SEO Settings Section */}
            <div className="pt-6 border-t border-white/10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    SEO Settings
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Optimize your script for search engines and improve discoverability
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleAutoGenerateSEO}
                  className="text-white bg-gradient-to-r from-purple-600 to-pink-600 border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-purple-500 hover:to-pink-500 border-white/10 hover:shadow-xl hover:scale-105"
                  disabled={!formData.name.trim() || isSubmitting}
                >
                  <Star className="mr-2 w-4 h-4" />
                  Auto-Generate SEO
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="slug" className="text-white">URL Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-') })}
                    placeholder="my-awesome-script"
                    className="mt-1 text-white bg-white/10 border-white/20 placeholder:text-gray-400"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    URL-friendly version of the script name. Leave empty to auto-generate from script name.
                    <br />
                    Preview: <span className="text-cyan-400">/scripts/{formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}</span>
                  </p>
                </div>

                <div>
                  <Label htmlFor="seoTitle" className="text-white">
                    SEO Title
                    <span className="ml-2 text-xs text-gray-400">
                      ({formData.seoTitle.length}/60 characters)
                    </span>
                  </Label>
                  <Input
                    id="seoTitle"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    placeholder="Enter SEO title (leave empty to use script name)"
                    maxLength={60}
                    className="mt-1 text-white bg-white/10 border-white/20 placeholder:text-gray-400"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Recommended: 50-60 characters. This appears in search engine results.
                  </p>
                </div>

                <div>
                  <Label htmlFor="seoDescription" className="text-white">
                    SEO Meta Description
                    <span className="ml-2 text-xs text-gray-400">
                      ({formData.seoDescription.length}/160 characters)
                    </span>
                  </Label>
                  <Textarea
                    id="seoDescription"
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    placeholder="Enter SEO description (leave empty to use script description)"
                    rows={3}
                    maxLength={160}
                    className="mt-1 text-white bg-white/10 border-white/20 placeholder:text-gray-400"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Recommended: 150-160 characters. This appears as the snippet in search results.
                  </p>
                </div>

                <div>
                  <Label htmlFor="seoKeywords" className="text-white">SEO Keywords</Label>
                  <Input
                    id="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                    placeholder="fivem, script, nui, hud, menu (comma-separated)"
                    className="mt-1 text-white bg-white/10 border-white/20 placeholder:text-gray-400"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Enter relevant keywords separated by commas. Example: fivem, nui script, custom hud, roleplay
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="flex items-center space-x-3">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive" className="text-white">
                  Active (script will be available to users)
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Switch
                  id="popular"
                  checked={formData.popular}
                  onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
                />
                <Label htmlFor="popular" className="text-white">
                  Popular (featured script)
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Switch
                  id="new"
                  checked={formData.new}
                  onCheckedChange={(checked) => setFormData({ ...formData, new: checked })}
                />
                <Label htmlFor="new" className="text-white">
                  New (recently added script)
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  id="trialAvailable"
                  checked={formData.trialAvailable}
                  onCheckedChange={(checked) => setFormData({ ...formData, trialAvailable: checked })}
                />
                <Label htmlFor="trialAvailable" className="text-white">
                  Available for Free Trial
                </Label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end pt-6 space-x-4 border-t border-white/10">
              <Button
                type="button"
                onClick={handleCancel}
                className="text-white bg-gradient-to-r border shadow-lg backdrop-blur-sm transition-all duration-300 from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-white/10 hover:shadow-xl hover:scale-105"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-white bg-gradient-to-r from-blue-600 to-blue-500 border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-blue-500 hover:to-blue-400 border-white/10 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Upload className="mr-2 w-4 h-4 animate-spin" />
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 w-4 h-4" />
                    {mode === 'create' ? 'Create Script' : 'Update Script'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

