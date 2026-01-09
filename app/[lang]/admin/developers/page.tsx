'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Edit, Trash2, Mail, Globe, CheckCircle, XCircle, User, BarChart3, Package, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { useDevelopersStore, Developer } from '@/lib/stores'
import { ModalPortal } from '@/components/ui/modal-portal'

export default function AdminDevelopers() {
  const t = useTranslations('admin.developers')
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
  const [showScriptsModal, setShowScriptsModal] = useState(false)
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null)
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
      toast.error(t('toast.failedToLoad'))
    })
  }, [getAll, t])

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
        toast.success(t('toast.updatedSuccess'))
      } else {
        await create(formData)
        toast.success(t('toast.createdSuccess'))
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
    if (!confirm(t('toast.deleteConfirm'))) {
      return
    }

    try {
      await remove(id)
      toast.success(t('toast.deletedSuccess'))
    } catch (error: any) {
      // Error is handled by the store
    }
  }

  const handleAddNew = () => {
    setEditingDeveloper(null)
    setFormData({ name: '', email: '', website: '', bio: '', avatarUrl: '', isActive: true })
    setShowModal(true)
  }

  const handleShowScripts = (developer: Developer) => {
    setSelectedDeveloper(developer)
    setShowScriptsModal(true)
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
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">{t('title')}</h1>
                <p className="mt-1 text-gray-400">{t('subtitle')}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push('/admin/developers/analytics')}
                className="text-white bg-gradient-to-r border shadow-lg backdrop-blur-sm transition-all duration-300 from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-white/10 hover:shadow-xl hover:scale-105"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {t('salesAnalytics')}
              </Button>
              <Button
                onClick={handleAddNew}
                className="text-white bg-gradient-to-r from-cyan-600 to-blue-500 border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-cyan-500 hover:to-blue-400 border-white/10 hover:shadow-xl hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('addDeveloper')}
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
                          {t('badges.active')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-500/20 text-gray-400">
                          <XCircle className="w-3 h-3 mr-1" />
                          {t('badges.inactive')}
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
                  <span className="font-semibold text-cyan-400">{developer.scripts?.length || 0}</span> {t('scripts')}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleShowScripts(developer)}
                    className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20"
                    title={t('viewScripts')}
                  >
                    <Package className="w-4 h-4" />
                  </Button>
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
            <h3 className="text-xl font-semibold text-white mb-2">{t('noDevelopers.title')}</h3>
            <p className="text-gray-400 mb-4">{t('noDevelopers.description')}</p>
            <Button onClick={handleAddNew} className="bg-gradient-to-r from-cyan-600 to-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              {t('addDeveloper')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Scripts Modal */}
      <ModalPortal isOpen={showScriptsModal && !!selectedDeveloper}>
        {selectedDeveloper && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border-gray-500/30">
            <CardHeader className="border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedDeveloper.avatarUrl ? (
                    <img src={selectedDeveloper.avatarUrl} alt={selectedDeveloper.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-white text-xl">{t('scriptsModal.title', { name: selectedDeveloper.name })}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {t('scriptsModal.subtitle', { count: selectedDeveloper.scripts?.length || 0 })}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowScriptsModal(false)}
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[60vh] p-6">
              {selectedDeveloper.scripts && selectedDeveloper.scripts.length > 0 ? (
                <div className="space-y-4">
                  {selectedDeveloper.scripts.map((scriptDev: any) => {
                    const script = scriptDev.script || scriptDev;
                    return (
                    <div key={script.id} className="p-4 rounded-lg border bg-gradient-to-r from-gray-800/40 to-gray-700/20 border-gray-600/20 hover:border-cyan-500/40 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                              <Package className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold">{script.name || script.title || t('scriptsModal.unnamedScript')}</h3>
                              <p className="text-sm text-gray-400">{script.category?.name || t('scriptsModal.uncategorized')}</p>
                            </div>
                          </div>
                          {script.description && (
                            <p className="text-sm text-gray-300 mb-3 line-clamp-2">{script.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-400">{t('scriptsModal.version')} <span className="text-white">{script.version || 'N/A'}</span></span>
                            <span className="text-gray-400">{t('scriptsModal.price')} <span className="text-cyan-400 font-semibold">${script.price || 0}</span></span>
                            {script.isActive ? (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {t('badges.active')}
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-500/20 text-gray-400">
                                <XCircle className="w-3 h-3 mr-1" />
                                {t('badges.inactive')}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/admin/scripts/${script.id}/edit`)}
                          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )})}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Package className="w-16 h-16 text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">{t('scriptsModal.noScripts.title')}</h3>
                  <p className="text-gray-400">{t('scriptsModal.noScripts.description')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}
      </ModalPortal>

      {/* Modal */}
      <ModalPortal isOpen={showModal}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border-gray-500/30">
            <CardHeader>
              <CardTitle className="text-white">
                {editingDeveloper ? t('form.editTitle') : t('form.addTitle')}
              </CardTitle>
              <CardDescription>
                {editingDeveloper ? t('form.editDescription') : t('form.addDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1 block">
                    {t('form.name')} <span className="text-red-400">{t('form.required')}</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder={t('form.placeholders.name')}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1 block">{t('form.email')}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder={t('form.placeholders.email')}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1 block">{t('form.website')}</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder={t('form.placeholders.website')}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1 block">{t('form.avatarUrl')}</label>
                  <input
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder={t('form.placeholders.avatarUrl')}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1 block">{t('form.bio')}</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder={t('form.placeholders.bio')}
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
                  <label htmlFor="isActive" className="text-sm text-gray-300">{t('form.active')}</label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                  >
                    {editingDeveloper ? t('form.buttons.update') : t('form.buttons.create')}
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
                    {t('form.buttons.cancel')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </ModalPortal>
      </div>
    </main>
  )
}

