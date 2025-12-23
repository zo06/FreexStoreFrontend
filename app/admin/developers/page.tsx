'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Edit, Trash2, Mail, Globe, CheckCircle, XCircle, User, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useDevelopersStore, Developer } from '@/lib/stores'

export default function AdminDevelopers() {
  const router = useRouter()
  
  // Use Zustand store
  const { 
    items: developers, 
    loading, 
    submitting,
    error,
    getAll,
    create,
    update,
    remove,
    clearError 
  } = useDevelopersStore()
  
  const [showModal, setShowModal] = useState(false)
  const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    bio: '',
    avatarUrl: '',
    isActive: true
  })

  // Load developers on mount
  useEffect(() => {
    getAll().catch((err) => {
      toast.error('Failed to load developers')
    })
  }, [getAll])

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingDeveloper) {
        await update(editingDeveloper.id, formData)
        toast.success('Developer updated successfully')
      } else {
        await create(formData)
        toast.success('Developer created successfully')
      }
      
      setShowModal(false)
      setEditingDeveloper(null)
      setFormData({ name: '', email: '', website: '', bio: '', avatarUrl: '', isActive: true })
    } catch (error: any) {
      // Error is handled by the store and shown via useEffect
    }
  }

  const handleEdit = (developer: Developer) => {
    setEditingDeveloper(developer)
    setFormData({
      name: developer.name,
      email: developer.email || '',
      website: developer.website || '',
      bio: developer.bio || '',
      avatarUrl: developer.avatarUrl || '',
      isActive: developer.isActive
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this developer?')) {
      return
    }

    try {
      await remove(id)
      toast.success('Developer deleted successfully')
    } catch (error: any) {
      // Error is handled by the store
    }
  }

  const handleAddNew = () => {
    setEditingDeveloper(null)
    setFormData({ name: '', email: '', website: '', bio: '', avatarUrl: '', isActive: true })
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br via-cyan-900 from-slate-900 to-slate-900">
        <div className="w-32 h-32 rounded-full border-b-2 border-cyan-400 animate-spin"></div>
      </div>
    )
  }

  return (
    <main className="overflow-hidden relative min-h-screen bg-gradient-to-br via-cyan-900 from-slate-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r via-transparent blur-3xl from-cyan-500/10 to-blue-500/10"></div>
      
      <div className="relative z-10 p-6 mx-auto space-y-6 max-w-7xl">
        {/* Header */}
        <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r rounded-xl border backdrop-blur-sm from-cyan-500/20 to-blue-500/20 border-white/10">
                <Users className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">Developers Management</h1>
                <p className="mt-1 text-gray-400">Manage script developers and their information</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push('/admin/developers/analytics')}
                className="text-white bg-gradient-to-r border shadow-lg backdrop-blur-sm transition-all duration-300 from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-white/10 hover:shadow-xl hover:scale-105"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Sales Analytics
              </Button>
              <Button
                onClick={handleAddNew}
                className="text-white bg-gradient-to-r from-cyan-600 to-blue-500 border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-cyan-500 hover:to-blue-400 border-white/10 hover:shadow-xl hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Developer
              </Button>
            </div>
          </div>
        </div>

      {/* Developers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {developers.map((developer) => (
          <Card key={developer.id} className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 border-gray-500/20 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {developer.avatarUrl ? (
                    <img src={developer.avatarUrl} alt={developer.name} className="w-12 h-12 rounded-full" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-white text-lg">{developer.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {developer.isActive ? (
                        <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-500/20 text-gray-400">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {developer.email && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{developer.email}</span>
                </div>
              )}
              {developer.website && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Globe className="w-4 h-4" />
                  <span className="truncate">{developer.website}</span>
                </div>
              )}
              {developer.bio && (
                <p className="text-sm text-gray-300 line-clamp-2">{developer.bio}</p>
              )}
              <div className="pt-3 flex items-center justify-between border-t border-gray-700">
                <div className="text-sm text-gray-400">
                  <span className="font-semibold text-cyan-400">{developer.scripts?.length || 0}</span> Scripts
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(developer)}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(developer.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {developers.length === 0 && (
        <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 border-gray-500/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Developers Yet</h3>
            <p className="text-gray-400 mb-4">Get started by adding your first developer</p>
            <Button onClick={handleAddNew} className="bg-gradient-to-r from-cyan-600 to-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Developer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border-gray-500/30">
            <CardHeader>
              <CardTitle className="text-white">
                {editingDeveloper ? 'Edit Developer' : 'Add Developer'}
              </CardTitle>
              <CardDescription>
                {editingDeveloper ? 'Update developer information' : 'Create a new developer profile'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1 block">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Developer name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder="developer@example.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1 block">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1 block">Avatar URL</label>
                  <input
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1 block">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Developer bio..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-300">Active</label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                  >
                    {editingDeveloper ? 'Update' : 'Create'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false)
                      setEditingDeveloper(null)
                      setFormData({ name: '', email: '', website: '', bio: '', avatarUrl: '', isActive: true })
                    }}
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </main>
  )
}

