"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { withAdminAuth } from '@/lib/auth-context'
import { useLicensesStore, useUsersStore, useScriptsStore, License, User, Script } from '@/lib/stores'
import { safeAdminApi } from '@/lib/admin-api'
import apiClient from '@/lib/api/client'
import { Plus, Trash2, CheckCircle, XCircle, RefreshCw, Download, Eye, Key, ArrowLeft, AlertTriangle, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminFilter, { FilterConfig, FilterValues } from '@/components/admin/admin-filter'
import { useTranslations } from 'next-intl'

interface PaginatedLicensesResponse {
  data: License[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

function AdminLicenses() {
  const t = useTranslations('admin.licenses')
  // Use Zustand stores for users and scripts (not for licenses anymore)
  const { patch: patchLicense } = useLicensesStore()

  const { items: users, getAll: getUsers } = useUsersStore()
  const { items: scripts, getAll: getScripts } = useScriptsStore()

  // Licenses state - fetched directly from API with pagination
  const [licenses, setLicenses] = useState<License[]>([])
  const [filteredLicenses, setFilteredLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null)
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false)
  const [isReactivateDialogOpen, setIsReactivateDialogOpen] = useState(false)
  const [isDeleteRevokedDialogOpen, setIsDeleteRevokedDialogOpen] = useState(false)
  const [deletingRevoked, setDeletingRevoked] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Filter state (for backend filtering)
  const [searchFilter, setSearchFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const router = useRouter()

  // Filter configuration
  const filterConfig: FilterConfig = {
    searchPlaceholder: t('searchPlaceholder'),
    statusOptions: [
      { value: 'active', label: t('active'), count: 0 }, // Backend will handle counts
      { value: 'expired', label: t('expired'), count: 0 },
      { value: 'revoked', label: t('revoked'), count: 0 }
    ],
    showDateFilter: true,
    showActiveFilter: false
  }

  // Fetch licenses with pagination and filters
  const fetchLicenses = async (showLoading = false) => {
    try {
      // Only show loading spinner for manual refresh, not for search/filter
      if (showLoading) {
        setLoading(true)
      }
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      })
      if (searchFilter) params.append('search', searchFilter)
      if (statusFilter) params.append('status', statusFilter)

      const token = localStorage.getItem('access_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/licenses?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result: PaginatedLicensesResponse = await response.json()
        setLicenses(result.data)
        setFilteredLicenses(result.data)
        setTotal(result.pagination.total)
        setTotalPages(result.pagination.totalPages)
      } else {
        toast.error(t('failedToFetch'))
      }
    } catch (error) {
      console.error('Failed to fetch licenses:', error)
      toast.error(t('failedToFetch'))
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  // Load all data on mount
  useEffect(() => {
    // Show loading only on initial mount
    fetchLicenses(true)
    getUsers().catch(() => {})
    getScripts().catch(() => {})
  }, [])

  // Load licenses when filters change (no loading overlay)
  useEffect(() => {
    fetchLicenses(false)
  }, [currentPage, searchFilter, statusFilter])

  const handleFilterChange = (filters: FilterValues) => {
    // Update search and status filters for backend
    setSearchFilter(filters.search || '')
    setStatusFilter(filters.status === 'all' ? '' : (filters.status || ''))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleExport = () => {
    const csvContent = [
      [
        t('exportHeaders.user'),
        t('exportHeaders.script'),
        t('exportHeaders.licenseKey'),
        t('exportHeaders.expiryDate'),
        t('exportHeaders.status'),
        t('exportHeaders.createdDate')
      ].join(','),
      ...filteredLicenses.map(license => {
        const now = new Date()
        const isExpired = license.expiresAt ? new Date(license.expiresAt) <= now : false
        const status = !license.isActive ? t('revoked') : isExpired ? t('expired') : t('active')

        return [
          getUserName(license),
          getScriptName(license),
          license.privateKey || '',
          license.expiresAt ? new Date(license.expiresAt).toLocaleDateString('ar') : t('noExpiration'),
          status,
          new Date(license.createdAt || '').toLocaleDateString('ar')
        ].join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `licenses_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const openEditDialog = (license: License) => {
    router.push(`/admin/licenses/manage?id=${license.id}`)
  }

  const handleRevokeLicense = async () => {
    if (!selectedLicense) return

    try {
      await safeAdminApi.licenses.revoke(selectedLicense.id)
      toast.success(t('licenseRevokedSuccess'))
      setIsRevokeDialogOpen(false)
      setSelectedLicense(null)
      await fetchLicenses()
    } catch (error) {
      console.error('Failed to revoke license:', error)
      toast.error(t('failedToRevoke'))
    }
  }

  const handleReactivateLicense = async () => {
    if (!selectedLicense) return
    try {
      await safeAdminApi.licenses.reactivate(selectedLicense.id)
      toast.success(t('licenseReactivatedSuccess'))
      setIsReactivateDialogOpen(false)
      setSelectedLicense(null)
      await fetchLicenses()
    } catch (error) {
      console.error('Failed to reactivate license:', error)
      toast.error(t('failedToReactivate'))
    }
  }

  const handleDeleteAllRevoked = async () => {
    setDeletingRevoked(true)
    try {
      // For pagination, we need to fetch all revoked licenses first
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/licenses?status=revoked&limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        toast.error('Failed to fetch revoked licenses')
        setIsDeleteRevokedDialogOpen(false)
        setDeletingRevoked(false)
        return
      }

      const result: PaginatedLicensesResponse = await response.json()
      const revokedLicenses = result.data

      if (revokedLicenses.length === 0) {
        toast.error('No revoked licenses to delete')
        setIsDeleteRevokedDialogOpen(false)
        setDeletingRevoked(false)
        return
      }

      // Delete each revoked license
      let successCount = 0
      let failCount = 0

      for (const license of revokedLicenses) {
        try {
          await safeAdminApi.licenses.delete(license.id)
          successCount++
        } catch (err) {
          console.error(`Failed to delete license ${license.id}:`, err)
          failCount++
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} revoked license(s)`)
      }
      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} license(s)`)
      }

      setIsDeleteRevokedDialogOpen(false)
      await fetchLicenses()
    } catch (error) {
      console.error('Failed to delete revoked licenses:', error)
      toast.error('Failed to delete revoked licenses')
    } finally {
      setDeletingRevoked(false)
    }
  }

  const getStatusBadge = (license: License) => {
    if (!license.isActive) {
      return <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-red-500/10 text-red-400 border-red-500/20">{t('revoked')}</span>
    }
    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      return <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-red-500/10 text-red-400 border-red-500/20">{t('expired')}</span>
    }
    return <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{t('active')}</span>
  }

  const getUserName = (license: License) => {
    return (license as any).user?.username || users.find(u => u.id === license.userId)?.username || t('unknownUser')
  }

  const getScriptName = (license: License) => {
    return (license as any).script?.name || scripts.find(s => s.id === license.scriptId)?.name || t('unknownScript')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return t('never');
    return new Date(dateString).toLocaleString()
  }

  // Remove old filter logic - now handled by AdminFilter component

  // Show loading spinner only on initial page load
  if (loading && licenses.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="p-4 sm:p-6 mx-auto space-y-4 sm:space-y-6 max-w-7xl">
        {/* Header */}
        <div className="card-base p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
              <div className="p-2 sm:p-3 rounded-xl" style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}>
                <Key className="w-6 h-6 sm:w-8 sm:h-8 text-[#51a2ff]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{t('title')}</h1>
                <p className="mt-1 text-xs sm:text-sm text-[#888]">{t('subtitle')}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={() => router.push('/admin')}
                className="btn-ghost flex items-center gap-2 flex-1 sm:flex-none"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{t('backToDashboard')}</span>
                <span className="sm:hidden">Back</span>
              </button>
              {statusFilter === 'revoked' || !statusFilter ? (
                <button
                  onClick={() => setIsDeleteRevokedDialogOpen(true)}
                  className="px-3 py-1.5 text-sm rounded-lg font-medium text-red-400 flex items-center gap-2 flex-1 sm:flex-none"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('deleteAllRevoked')}</span>
                  <span className="sm:hidden">Delete</span>
                </button>
              ) : null}
              <button
                onClick={() => router.push('/admin/licenses/manage')}
                className="btn-primary flex items-center gap-2 flex-1 sm:flex-none"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t('createLicense')}</span>
                <span className="sm:hidden">Create</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Component */}
        <AdminFilter
          config={filterConfig}
          onFilterChange={handleFilterChange}
          onRefresh={() => fetchLicenses(true)}
          onExport={handleExport}
          totalCount={total}
          filteredCount={filteredLicenses.length}
          loading={loading}
        />

        {/* Licenses Table */}
        <div className="card-base p-6">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              {t('licenses')} ({filteredLicenses.length} {t('of')} {total})
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#888]">{t('listDescription')}</p>
          </div>

          <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">{t('user')}</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">{t('script')}</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">{t('status')}</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap hidden md:table-cell">{t('expiryDate')}</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">{t('createdDate')}</th>
                  <th className="text-right text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider whitespace-nowrap">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredLicenses.map((license) => (
                  <tr key={license.id} className="border-b transition-colors hover:bg-[#161616]" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <td className="py-3 px-4 text-[#ccc] font-medium text-xs sm:text-sm max-w-[120px] sm:max-w-none truncate">{getUserName(license)}</td>
                    <td className="py-3 px-4 text-[#ccc] text-xs sm:text-sm max-w-[120px] sm:max-w-none truncate">{getScriptName(license)}</td>
                    <td className="py-3 px-4">{getStatusBadge(license)}</td>
                    <td className="py-3 px-4 text-[#ccc] text-xs sm:text-sm hidden md:table-cell">{formatDateTime(license.expiresAt)}</td>
                    <td className="py-3 px-4 text-[#ccc] text-xs sm:text-sm hidden lg:table-cell">{formatDate(license.createdAt || '')}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(license.privateKey || '')
                            toast.success(t('licenseKeyCopied'))
                          }}
                          title={t('copyLicenseKey')}
                          className="p-2 rounded-lg text-[#888] hover:text-white transition-colors"
                          style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                          <Key className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => openEditDialog(license)}
                          disabled={!license.isActive || !!(license.expiresAt && new Date(license.expiresAt) < new Date())}
                          title={t('editLicense')}
                          className="p-2 rounded-lg text-[#888] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        {license.isRevoked ? (
                          <button
                            onClick={() => {
                              setSelectedLicense(license)
                              setIsReactivateDialogOpen(true)
                            }}
                            title={t('reactivateLicense')}
                            className="p-2 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors"
                            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                          >
                            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedLicense(license)
                              setIsRevokeDialogOpen(true)
                            }}
                            disabled={!license.isActive || !!(license.expiresAt && new Date(license.expiresAt) < new Date())}
                            title={t('revokeLicense')}
                            className="p-2 rounded-lg text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        )}
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
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
            <p className="text-xs sm:text-sm text-[#888] text-center sm:text-left">
              {t('showing')} {Math.min((currentPage - 1) * limit + 1, total)}-{Math.min(currentPage * limit, total)} {t('of')} {total} {t('licenses')} ({t('pageOf', { current: currentPage, total: totalPages })})
            </p>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-ghost btn-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-1">{t('previous')}</span>
              </button>
              <div className="flex items-center px-2 sm:px-3 text-xs sm:text-sm text-[#888] whitespace-nowrap">
                {currentPage} / {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="btn-ghost btn-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline mr-1">{t('next')}</span>
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 rotate-180" />
              </button>
            </div>
          </div>
        </div>

        {/* Reactivate Confirmation Modal */}
        {isReactivateDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setIsReactivateDialogOpen(false)}>
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 w-full max-w-lg card-base p-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">{t('reactivateDialogTitle')}</h2>
              <p className="text-[#888] text-sm sm:text-base mb-6">
                {t('reactivateDialogDescription', {
                  user: selectedLicense ? getUserName(selectedLicense) : '',
                  script: selectedLicense ? getScriptName(selectedLicense) : ''
                })}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <button
                  onClick={() => setIsReactivateDialogOpen(false)}
                  className="btn-ghost flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleReactivateLicense}
                  className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t('confirmReactivate')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Revoke Confirmation Modal */}
        {isRevokeDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setIsRevokeDialogOpen(false)}>
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 w-full max-w-lg card-base p-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">{t('revokeDialogTitle')}</h2>
              <p className="text-[#888] text-sm sm:text-base mb-6">
                {t('revokeDialogDescription', {
                  user: selectedLicense ? getUserName(selectedLicense) : '',
                  script: selectedLicense ? getScriptName(selectedLicense) : ''
                })}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <button
                  onClick={() => setIsRevokeDialogOpen(false)}
                  className="btn-ghost flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleRevokeLicense}
                  className="px-3 py-1.5 text-sm rounded-lg font-medium text-red-400 flex items-center justify-center gap-2 w-full sm:w-auto"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  {t('confirmRevoke')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete All Revoked Licenses Confirmation Modal */}
        {isDeleteRevokedDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => !deletingRevoked && setIsDeleteRevokedDialogOpen(false)}>
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 w-full max-w-lg card-base p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h2 className="text-lg sm:text-xl font-semibold text-white">{t('deleteRevokedTitle')}</h2>
              </div>
              <div className="text-[#888] text-sm sm:text-base mb-6 space-y-2">
                <p>{t('deleteRevokedDescription1', { count: licenses.filter(l => !l.isActive).length })}</p>
                <p className="text-amber-400">{t('deleteRevokedDescription2')}</p>
                <p>{t('deleteRevokedDescription3')}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <button
                  disabled={deletingRevoked}
                  onClick={() => setIsDeleteRevokedDialogOpen(false)}
                  className="btn-ghost flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleDeleteAllRevoked}
                  disabled={deletingRevoked}
                  className="px-3 py-1.5 text-sm rounded-lg font-medium text-red-400 flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  {deletingRevoked ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {t('deleting')}
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      {t('deleteForever')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default withAdminAuth(AdminLicenses)
