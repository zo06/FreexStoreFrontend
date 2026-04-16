"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { withAdminAuth } from '@/lib/auth-context'
import { useScriptsStore, useCategoriesStore, Script, Category } from '@/lib/stores'
import { safeAdminApi } from '@/lib/admin-api'
import { Plus, Edit, Trash2, Power, PowerOff, Code, ArrowLeft, RefreshCw, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminFilter, { FilterConfig, FilterValues } from '@/components/admin/admin-filter'
import { useTranslations } from 'next-intl'

function AdminScripts() {
  const t = useTranslations('admin.scripts')
  // Use Zustand stores
  const {
    items: scripts,
    loading,
    error,
    getAll: getScripts,
    remove: removeScript,
    patch: patchScript
  } = useScriptsStore()

  const {
    items: dbCategories,
    loading: categoriesLoading,
    getAll: getCategories
  } = useCategoriesStore()

  const [filteredScripts, setFilteredScripts] = useState<Script[]>([])
  const [selectedScript, setSelectedScript] = useState<Script | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit] = useState(10)
  const router = useRouter()

  // Upgrade dialog state
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)
  const [upgradeScript, setUpgradeScript] = useState<Script | null>(null)
  const [upgradeVersion, setUpgradeVersion] = useState('')
  const [upgradeFile, setUpgradeFile] = useState<File | null>(null)
  const [upgradeLoading, setUpgradeLoading] = useState(false)


  // Get unique categories from scripts
  const categories = [...new Set(scripts.map(script => ((script.category as { name?: string } | undefined)?.name)).filter(Boolean))]

  // Filter configuration
  const filterConfig: FilterConfig = {
    searchPlaceholder: t('searchPlaceholder'),
    statusOptions: [
      { value: 'active', label: t('statusOptions.active'), count: scripts.filter(s => s.isActive).length },
      { value: 'inactive', label: t('statusOptions.inactive'), count: scripts.filter(s => !s.isActive).length }
    ],
    categoryOptions: categories
      .filter((cat): cat is string => typeof cat === 'string')
      .map(cat => ({
        value: cat,
        label: cat,
        count: scripts.filter(s => (((s.category as { name?: string } | undefined)?.name) === cat)).length
      })),
    showDateFilter: true,
    showActiveFilter: true,
    showPriceFilter: true,
    priceRange: { min: 0, max: Math.max(...scripts.map(s => s.price || 0), 1000) }
  }

  // Load categories on component mount
  useEffect(() => {
    getCategories().catch(() => {})
  }, [getCategories])

  // Category options from database
  const categoryOptions = (dbCategories && dbCategories.length > 0)
    ? dbCategories.map(cat => ({ value: cat.name, label: cat.name }))
    : []


  // Expiration duration options
  const expirationOptions = [
    { value: 'never', label: 'No Expiration' },
    { value: '1', label: '1 Month' },
    { value: '2', label: '2 Months' },
    { value: '3', label: '3 Months' },
    { value: '6', label: '6 Months' },
    { value: '12', label: '1 Year' }
  ]

  // File type is constant for WinRAR
  const fileType = 'rar'

  // Load scripts on mount
  useEffect(() => {
    getScripts().catch(() => {})
  }, [getScripts])

  // Update filtered scripts when scripts change
  useEffect(() => {
    setFilteredScripts(scripts)
    setTotalPages(Math.ceil(scripts.length / limit))
  }, [scripts, limit])

  const handleFilterChange = (filters: FilterValues) => {
    let filtered = [...scripts]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(script =>
        script.name.toLowerCase().includes(searchLower) ||
        script.description?.toLowerCase().includes(searchLower) ||
        (((script.category as { name?: string } | undefined)?.name) || '').toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (filters.status) {
      if (filters.status === 'active') {
        filtered = filtered.filter(script => script.isActive)
      } else if (filters.status === 'inactive') {
        filtered = filtered.filter(script => !script.isActive)
      }
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(script => ((script.category as { name?: string } | undefined)?.name) === filters.category)
    }

    // Price filter
    if (filters.priceRange) {
      filtered = filtered.filter(script => {
        const price = script.price || 0
        return price >= filters.priceRange!.min && price <= filters.priceRange!.max
      })
    }

    // Date filter
    if (filters.dateFrom) {
      filtered = filtered.filter(script => {
        const scriptDate = new Date(script.createdAt || script.updatedAt || '')
        return scriptDate >= filters.dateFrom!
      })
    }
    if (filters.dateTo) {
      filtered = filtered.filter(script => {
        const scriptDate = new Date(script.createdAt || script.updatedAt || '')
        return scriptDate <= filters.dateTo!
      })
    }

    setFilteredScripts(filtered)
  }

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Description', 'Category', 'Price', 'Status', 'Created Date'].join(','),
      ...filteredScripts.map(script => [
        script.name,
        script.description || '',
        ((script.category as { name?: string } | undefined)?.name) || '',
        script.price || 0,
        script.isActive ? 'Active' : 'Inactive',
        new Date(script.createdAt || '').toLocaleDateString('ar')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `scripts_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handleCreateScript = () => {
    router.push('/admin/scripts/create')
  }

  const handleEditScript = (script: Script) => {
    router.push(`/admin/scripts/${script.id}/edit`)
  }

  const handleDeleteScript = async () => {
    if (!selectedScript) return

    try {
      await removeScript(selectedScript.id)
      toast.success(t('toast.deletedSuccess'))
      setIsDeleteDialogOpen(false)
      setSelectedScript(null)
    } catch (error) {
      console.error('Failed to delete script:', error)
      toast.error(t('toast.failedToDelete'))
    }
  }

  const handleOpenUpgrade = (script: Script) => {
    setUpgradeScript(script)
    setUpgradeVersion((script as any).version || '')
    setUpgradeFile(null)
    setIsUpgradeDialogOpen(true)
  }

  const handleUpgrade = async () => {
    if (!upgradeScript) return
    if (!upgradeVersion.trim()) {
      toast.error('Please enter a version number')
      return
    }
    if (!upgradeFile) {
      toast.error('Please select a file to upload')
      return
    }
    setUpgradeLoading(true)
    try {
      await safeAdminApi.scripts.upgradeScript(upgradeScript.id, upgradeFile, upgradeVersion.trim())
      toast.success(`${upgradeScript.name} upgraded to v${upgradeVersion.trim()}`)
      setIsUpgradeDialogOpen(false)
      setUpgradeScript(null)
      setUpgradeFile(null)
      setUpgradeVersion('')
      await getScripts()
    } catch (error) {
      console.error('Upgrade failed:', error)
      toast.error('Upgrade failed — please try again')
    } finally {
      setUpgradeLoading(false)
    }
  }

  const handleToggleActive = async (script: Script) => {
    try {
      await safeAdminApi.scripts.toggleActive(script.id)
      toast.success(script.isActive ? t('toast.deactivatedSuccess', { name: script.name }) : t('toast.activatedSuccess', { name: script.name }))
      await getScripts()
    } catch (error) {
      console.error('Failed to toggle script status:', error)
      toast.error(t('toast.failedToUpdateStatus'))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="p-6 mx-auto space-y-6 max-w-7xl">
        {/* Header */}
        <div className="card-base p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}>
                <Code className="w-8 h-8 text-[#51a2ff]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
                <p className="mt-1 text-[#888]">{t('subtitle')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/admin')}
                className="btn-ghost flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('backToDashboard')}
              </button>
              <button
                onClick={handleCreateScript}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('createScript')}
              </button>
            </div>
          </div>
        </div>

        {/* Filter Component */}
        <AdminFilter
          config={filterConfig}
          onFilterChange={handleFilterChange}
          onRefresh={() => getScripts()}
          onExport={handleExport}
          totalCount={scripts.length}
          filteredCount={filteredScripts.length}
          loading={loading}
        />

        {/* Scripts Table */}
        <div className="card-base p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">
              {t('table.title', { count: filteredScripts.length, total: scripts.length })}
            </h2>
            <p className="mt-1 text-[#888]">{t('table.description')}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider">{t('table.name')}</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider">{t('table.category')}</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider">{t('table.description')}</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider">{t('table.price')}</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider">Discount</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider">{t('table.status')}</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider">{t('table.createdDate')}</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider">{t('table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredScripts.map((script) => (
                  <tr key={script.id} className="border-b transition-colors hover:bg-[#161616]" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <td className="py-3 px-4 text-white font-medium">{script.name}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(81,162,255,0.1)', color: '#51a2ff', border: '1px solid rgba(81,162,255,0.2)' }}>
                        {((script.category as { name?: string } | undefined)?.name) || t('table.general')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#888] max-w-xs truncate">{script.description || t('table.noDescription')}</td>
                    <td className="py-3 px-4 text-[#888]">${script.price || 0}</td>
                    <td className="py-3 px-4">
                      {(script as any).discountPercentage > 0 ? (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          -{(script as any).discountPercentage}%
                        </span>
                      ) : (
                        <span className="text-[#555] text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {script.isActive ? (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          {t('badges.active')}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-red-500/10 text-red-400 border-red-500/20">
                          {t('badges.inactive')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#888]">{formatDate(script.createdAt || '')}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {script.isActive ? (
                          <button
                            onClick={() => handleToggleActive(script)}
                            className="p-2 rounded-lg text-amber-400 hover:text-amber-300 transition-colors"
                            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}
                            title={t('statusOptions.inactive')}
                          >
                            <PowerOff className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleActive(script)}
                            className="p-2 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors"
                            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}
                            title={t('statusOptions.active')}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEditScript(script)}
                          className="p-2 rounded-lg text-[#888] hover:text-white transition-colors"
                          style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                          title={t('table.actions')}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenUpgrade(script)}
                          className="p-2 rounded-lg text-[#888] hover:text-white transition-colors"
                          style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                          title="Upgrade"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedScript(script)
                            setIsDeleteDialogOpen(true)
                          }}
                          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                          className="px-3 py-1.5 text-sm rounded-lg font-medium text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="card-base p-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-[#888]">
              {t('pagination.showing', {
                from: Math.min((currentPage - 1) * limit + 1, scripts.length),
                to: Math.min(currentPage * limit, scripts.length),
                total: scripts.length
              })}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-ghost flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('pagination.previous')}
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn-ghost flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('pagination.next')}
              </button>
            </div>
          </div>
        </div>

        {/* Upgrade Dialog */}
        {isUpgradeDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <div className="card-base p-6 w-full max-w-md space-y-5">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-[#51a2ff]" />
                <h3 className="text-white font-semibold text-lg">Upgrade Script</h3>
              </div>
              {upgradeScript && (
                <p className="text-sm text-[#888]">
                  {upgradeScript.name}
                  {(upgradeScript as any).version && (
                    <span className="ml-2 text-[#51a2ff]">v{(upgradeScript as any).version}</span>
                  )}
                </p>
              )}
              {/* version input and file upload */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#ccc]">New Version</label>
                  <input placeholder="e.g. 1.0.4" value={upgradeVersion} onChange={(e) => setUpgradeVersion(e.target.value)} className="input-base w-full" disabled={upgradeLoading} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#ccc]">Update File</label>
                  <label className={`flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed cursor-pointer transition-all ${upgradeFile ? 'border-[#51a2ff]/50 bg-[#51a2ff]/5' : 'border-[rgba(255,255,255,0.1)] bg-[#1a1a1a] hover:border-[#51a2ff]/40'} ${upgradeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input type="file" className="hidden" accept=".zip,.rar,.7z,.tar,.gz" disabled={upgradeLoading} onChange={(e) => setUpgradeFile(e.target.files?.[0] ?? null)} />
                    {upgradeFile ? (
                      <div className="flex flex-col items-center gap-1 px-4 text-center">
                        <RefreshCw className="w-5 h-5 text-[#51a2ff]" />
                        <span className="text-sm font-medium text-[#51a2ff] truncate max-w-[260px]">{upgradeFile.name}</span>
                        <span className="text-xs text-[#555]">{(upgradeFile.size/1024/1024).toFixed(2)} MB</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-[#555]">
                        <Upload className="w-6 h-6" />
                        <span className="text-sm">Click to select file</span>
                        <span className="text-xs">.zip · .rar · .7z</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsUpgradeDialogOpen(false)} disabled={upgradeLoading} className="btn-ghost flex-1">Cancel</button>
                <button onClick={handleUpgrade} disabled={upgradeLoading || !upgradeFile || !upgradeVersion.trim()} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                  {upgradeLoading ? <><RefreshCw className="w-4 h-4 animate-spin" />Upgrading...</> : <><RefreshCw className="w-4 h-4" />Upgrade</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {isDeleteDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <div className="card-base p-6 w-full max-w-sm space-y-5">
              <div>
                <h3 className="text-white font-semibold text-lg">{t('deleteDialog.title')}</h3>
                <p className="mt-2 text-sm text-[#888]">
                  {t('deleteDialog.description', { name: selectedScript?.name || '' })}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="btn-ghost flex-1"
                >
                  {t('deleteDialog.cancel')}
                </button>
                <button
                  onClick={handleDeleteScript}
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                  className="flex-1 px-3 py-1.5 text-sm rounded-lg font-medium text-red-400 transition-colors"
                >
                  {t('deleteDialog.confirm')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default withAdminAuth(AdminScripts)
