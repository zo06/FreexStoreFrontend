'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="card-base p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-xl"
                style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}
              >
                <Users className="w-8 h-8 text-[#51a2ff]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
                <p className="mt-1 text-[#555]">{t('subtitle')}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/admin/developers/analytics')}
                className="btn-ghost flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                {t('salesAnalytics')}
              </button>
              <button
                onClick={handleAddNew}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('addDeveloper')}
              </button>
            </div>
          </div>
        </div>

        {/* Developers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {developers.map((developer) => (
            <div
              key={developer.id}
              className="card-base p-6 flex flex-col gap-4"
            >
              {/* Card Header */}
              <div className="flex items-start gap-3">
                {developer.avatarUrl ? (
                  <img src={developer.avatarUrl} alt={developer.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}
                  >
                    <User className="w-6 h-6 text-[#51a2ff]" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-white font-semibold text-lg truncate">{developer.name}</h3>
                  <div className="mt-1">
                    {developer.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/25">
                        <CheckCircle className="w-3 h-3" />
                        {t('badges.active')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#222] text-[#888] border border-[rgba(255,255,255,0.07)]">
                        <XCircle className="w-3 h-3" />
                        {t('badges.inactive')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="space-y-2 flex-1">
                {developer.email && (
                  <div className="flex items-center gap-2 text-sm text-[#888]">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{developer.email}</span>
                  </div>
                )}
                {developer.website && (
                  <div className="flex items-center gap-2 text-sm text-[#888]">
                    <Globe className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{developer.website}</span>
                  </div>
                )}
                {developer.bio && (
                  <p className="text-sm text-[#aaa] line-clamp-2">{developer.bio}</p>
                )}
              </div>

              {/* Card Footer */}
              <div
                className="pt-4 flex items-center justify-between"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="text-sm text-[#555]">
                  <span className="font-semibold text-[#51a2ff]">{developer.scripts?.length || 0}</span> {t('scripts')}
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleShowScripts(developer)}
                    title={t('viewScripts')}
                    className="p-2 rounded-lg text-[#888] hover:text-white transition-colors"
                    style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <Package className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(developer)}
                    className="p-2 rounded-lg text-[#888] hover:text-white transition-colors"
                    style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(developer.id)}
                    className="p-2 rounded-lg text-red-400 transition-colors"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {developers.length === 0 && (
          <div className="card-base p-12 flex flex-col items-center justify-center gap-4">
            <Users className="w-16 h-16 text-[#333]" />
            <h3 className="text-xl font-semibold text-white">{t('noDevelopers.title')}</h3>
            <p className="text-[#555]">{t('noDevelopers.description')}</p>
            <button onClick={handleAddNew} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t('addDeveloper')}
            </button>
          </div>
        )}

        {/* Scripts Modal */}
        <ModalPortal isOpen={showScriptsModal && !!selectedDeveloper}>
          {selectedDeveloper && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
              <div
                className="w-full max-w-4xl max-h-[80vh] overflow-hidden rounded-2xl flex flex-col"
                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {/* Modal Header */}
                <div
                  className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-center gap-3">
                    {selectedDeveloper.avatarUrl ? (
                      <img src={selectedDeveloper.avatarUrl} alt={selectedDeveloper.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}
                      >
                        <User className="w-5 h-5 text-[#51a2ff]" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-semibold text-white">{t('scriptsModal.title', { name: selectedDeveloper.name })}</h2>
                      <p className="text-sm text-[#555]">
                        {t('scriptsModal.subtitle', { count: selectedDeveloper.scripts?.length || 0 })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowScriptsModal(false)}
                    className="p-2 rounded-lg text-[#888] hover:text-white transition-colors"
                    style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Body */}
                <div className="overflow-y-auto flex-1 p-6">
                  {selectedDeveloper.scripts && selectedDeveloper.scripts.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDeveloper.scripts.map((scriptDev: any) => {
                        const script = scriptDev.script || scriptDev;
                        return (
                          <div
                            key={script.id}
                            className="p-4 rounded-xl transition-all"
                            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}
                                  >
                                    <Package className="w-5 h-5 text-[#51a2ff]" />
                                  </div>
                                  <div>
                                    <h3 className="text-white font-semibold">{script.name || script.title || t('scriptsModal.unnamedScript')}</h3>
                                    <p className="text-sm text-[#555]">{script.category?.name || t('scriptsModal.uncategorized')}</p>
                                  </div>
                                </div>
                                {script.description && (
                                  <p className="text-sm text-[#888] mb-3 line-clamp-2">{script.description}</p>
                                )}
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-[#555]">{t('scriptsModal.version')} <span className="text-white">{script.version || 'N/A'}</span></span>
                                  <span className="text-[#555]">{t('scriptsModal.price')} <span className="text-[#51a2ff] font-semibold">${script.price || 0}</span></span>
                                  {script.isActive ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/25">
                                      <CheckCircle className="w-3 h-3" />
                                      {t('badges.active')}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#222] text-[#888] border border-[rgba(255,255,255,0.07)]">
                                      <XCircle className="w-3 h-3" />
                                      {t('badges.inactive')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => router.push(`/admin/scripts/${script.id}/edit`)}
                                className="p-2 rounded-lg text-[#888] hover:text-white transition-colors ml-3"
                                style={{ background: '#222', border: '1px solid rgba(255,255,255,0.07)' }}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                      <Package className="w-16 h-16 text-[#333]" />
                      <h3 className="text-xl font-semibold text-white">{t('scriptsModal.noScripts.title')}</h3>
                      <p className="text-[#555]">{t('scriptsModal.noScripts.description')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </ModalPortal>

        {/* Add/Edit Modal */}
        <ModalPortal isOpen={showModal}>
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div
              className="w-full max-w-md rounded-2xl overflow-hidden"
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {/* Modal Header */}
              <div
                className="px-6 py-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
              >
                <h2 className="text-white font-semibold text-lg">
                  {editingDeveloper ? t('form.editTitle') : t('form.addTitle')}
                </h2>
                <p className="text-sm text-[#555] mt-0.5">
                  {editingDeveloper ? t('form.editDescription') : t('form.addDescription')}
                </p>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[#888] mb-1 block">
                      {t('form.name')} <span className="text-red-400">{t('form.required')}</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="input-base w-full"
                      placeholder={t('form.placeholders.name')}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#888] mb-1 block">{t('form.email')}</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-base w-full"
                      placeholder={t('form.placeholders.email')}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#888] mb-1 block">{t('form.website')}</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="input-base w-full"
                      placeholder={t('form.placeholders.website')}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#888] mb-1 block">{t('form.avatarUrl')}</label>
                    <input
                      type="url"
                      value={formData.avatarUrl}
                      onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                      className="input-base w-full"
                      placeholder={t('form.placeholders.avatarUrl')}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#888] mb-1 block">{t('form.bio')}</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      className="input-base w-full resize-none"
                      placeholder={t('form.placeholders.bio')}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 accent-[#51a2ff]"
                    />
                    <label htmlFor="isActive" className="text-sm text-[#888]">{t('form.active')}</label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary flex-1 disabled:opacity-50"
                    >
                      {editingDeveloper ? t('form.buttons.update') : t('form.buttons.create')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false)
                        setEditingDeveloper(null)
                        setFormData({ name: '', email: '', website: '', bio: '', avatarUrl: '', isActive: true })
                      }}
                      className="btn-ghost flex-1"
                    >
                      {t('form.buttons.cancel')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </ModalPortal>

      </div>
    </div>
  )
}
