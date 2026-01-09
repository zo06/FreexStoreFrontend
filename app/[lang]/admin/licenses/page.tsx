"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { withAdminAuth } from '@/lib/auth-context'
import { useLicensesStore, useUsersStore, useScriptsStore, License, User, Script } from '@/lib/stores'
import { safeAdminApi } from '@/lib/admin-api'
import apiClient from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

import { Plus, Trash2, CheckCircle, XCircle, RefreshCw, Download, Eye, Key, ArrowLeft, AlertTriangle } from 'lucide-react'
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
  const fetchLicenses = async () => {
    try {
      setLoading(true)
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
      setLoading(false)
    }
  }

  // Load all data on mount
  useEffect(() => {
    fetchLicenses()
    getUsers().catch(() => {})
    getScripts().catch(() => {})
  }, [currentPage, searchFilter, statusFilter])

  const handleFilterChange = (filters: FilterValues) => {
    // Update search and status filters for backend
    setSearchFilter(filters.search || '')
    setStatusFilter(filters.status || '')
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
        const user = users.find(u => u.id === license.userId)
        const script = scripts.find(s => s.id === license.scriptId)
        const now = new Date()
        const isExpired = license.expiresAt ? new Date(license.expiresAt) <= now : false
        const status = !license.isActive ? t('revoked') : isExpired ? t('expired') : t('active')

        return [
          user?.username || t('unknown'),
          script?.name || t('unknown'),
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
      return <Badge variant="destructive">{t('revoked')}</Badge>
    }
    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      return <Badge variant="destructive">{t('expired')}</Badge>
    }
    return <Badge variant="default" className="bg-green-500">{t('active')}</Badge>
  }

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user?.username || t('unknownUser')
  }

  const getScriptName = (scriptId: string) => {
    const script = scripts.find(s => s.id === scriptId) // Use strict equality
    return script?.name || t('unknownScript')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return t('never');
    return new Date(dateString).toLocaleString()
  }

  // Remove old filter logic - now handled by AdminFilter component

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
<div className="absolute inset-0">
  <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1.5\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
</div>
  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r via-transparent blur-3xl from-cyan-500/10 to-blue-500/10"></div>      
      <div className="relative z-10 p-6 mx-auto space-y-6 max-w-7xl">
        {/* Header */}
        <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r rounded-xl border backdrop-blur-sm from-blue-500/20 to-cyan-500/20 border-white/10">
                <Key className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">{t('title')}</h1>
                <p className="mt-1 text-gray-400">{t('subtitle')}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push('/admin')}
                className="text-white bg-gradient-to-r border shadow-lg backdrop-blur-sm transition-all duration-300 from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-white/10 hover:shadow-xl hover:scale-105"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                {t('backToDashboard')}
              </Button>
              {statusFilter === 'revoked' || !statusFilter ? (
                <Button
                  onClick={() => setIsDeleteRevokedDialogOpen(true)}
                  className="text-white bg-gradient-to-r from-red-600 to-red-500 border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-red-500 hover:to-red-400 border-white/10 hover:shadow-xl hover:scale-105"
                >
                  <Trash2 className="mr-2 w-4 h-4" />
                  {t('deleteAllRevoked')}
                </Button>
              ) : null}
              <Button
                onClick={() => router.push('/admin/licenses/manage')}
                className="text-white bg-gradient-to-r from-blue-600 to-blue-500 border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-blue-500 hover:to-blue-400 border-white/10 hover:shadow-xl hover:scale-105"
              >
                <Plus className="mr-2 w-4 h-4" />
                {t('createLicense')}
            </Button>
            </div>
          </div>
        </div>

        {/* Filter Component */}
        <AdminFilter
          config={filterConfig}
          onFilterChange={handleFilterChange}
          onRefresh={fetchLicenses}
          onExport={handleExport}
          totalCount={total}
          filteredCount={filteredLicenses.length}
          loading={loading}
        />

        {/* Licenses Table */}
        <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 bg-white/5 border-white/10 hover:bg-white/10">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
              {t('licenses')} ({filteredLicenses.length} {t('of')} {total})
            </h2>
            <p className="mt-1 text-gray-400">{t('listDescription')}</p>
          </div>

          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="font-semibold text-gray-300">{t('user')}</TableHead>
                <TableHead className="font-semibold text-gray-300">{t('script')}</TableHead>
                <TableHead className="font-semibold text-gray-300">{t('status')}</TableHead>
                <TableHead className="font-semibold text-gray-300">{t('expiryDate')}</TableHead>
                <TableHead className="font-semibold text-gray-300">{t('createdDate')}</TableHead>
                <TableHead className="font-semibold text-gray-300">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLicenses.map((license) => (
                <TableRow key={license.id} className="transition-colors border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium text-white">{getUserName(license.userId)}</TableCell>
                  <TableCell className="text-gray-300">{getScriptName(license.scriptId)}</TableCell>
                  <TableCell>{getStatusBadge(license)}</TableCell>
                  <TableCell className="text-gray-300">{formatDateTime(license.expiresAt)}</TableCell>
                  <TableCell className="text-gray-300">{formatDate(license.createdAt || '')}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(license.privateKey || '')
                          toast.success(t('licenseKeyCopied'))
                        }}
                        size="sm"
                        title={t('copyLicenseKey')}
                        className="text-white bg-gradient-to-r from-green-600 to-green-500 border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-green-500 hover:to-green-400 border-white/10 hover:shadow-xl hover:scale-105"
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => openEditDialog(license)}
                        size="sm"
                        disabled={!license.isActive || !!(license.expiresAt && new Date(license.expiresAt) < new Date())}
                        title={t('editLicense')}
                        className="text-white bg-gradient-to-r from-blue-600 to-blue-500 border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-blue-500 hover:to-blue-400 disabled:from-slate-800 disabled:to-slate-700 border-white/10 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedLicense(license)
                          setIsRevokeDialogOpen(true)
                        }}
                        size="sm"
                        disabled={!license.isActive || !!(license.expiresAt && new Date(license.expiresAt) < new Date())}
                        title={t('revokeLicense')}
                        className="text-white bg-gradient-to-r from-red-600 to-red-500 border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-red-500 hover:to-red-400 disabled:from-slate-800 disabled:to-slate-700 border-white/10 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>

        {/* Pagination */}
        <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">
              {t('showing')} {Math.min((currentPage - 1) * limit + 1, total)}-{Math.min(currentPage * limit, total)} {t('of')} {total} {t('licenses')} ({t('pageOf', { current: currentPage, total: totalPages })})
            </p>
            <div className="flex space-x-2">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                size="sm"
                className="text-white bg-gradient-to-r border shadow-lg backdrop-blur-sm transition-all duration-300 from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 disabled:from-slate-800 disabled:to-slate-700 border-white/10 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {t('previous')}
              </Button>
              <div className="flex items-center px-3 text-sm text-gray-400">
                {t('pageOf', { current: currentPage, total: totalPages })}
              </div>
              <Button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                size="sm"
                className="text-white bg-gradient-to-r border shadow-lg backdrop-blur-sm transition-all duration-300 from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 disabled:from-slate-800 disabled:to-slate-700 border-white/10 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {t('next')}
              </Button>
            </div>
          </div>
        </div>



        {/* Revoke Confirmation Dialog */}
        <AlertDialog open={isRevokeDialogOpen} onOpenChange={setIsRevokeDialogOpen}>
          <AlertDialogContent className="text-white border backdrop-blur-xl bg-slate-900/95 border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">{t('revokeDialogTitle')}</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                {t('revokeDialogDescription', {
                  user: getUserName(selectedLicense?.userId || ''),
                  script: getScriptName(selectedLicense?.scriptId || '')
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-white bg-gradient-to-r border backdrop-blur-sm from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-white/10">{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRevokeLicense}
                className="text-white bg-gradient-to-r from-red-600 to-red-500 border backdrop-blur-sm hover:from-red-500 hover:to-red-400 border-white/10"
              >
                {t('confirmRevoke')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete All Revoked Licenses Confirmation Dialog */}
        <AlertDialog open={isDeleteRevokedDialogOpen} onOpenChange={setIsDeleteRevokedDialogOpen}>
          <AlertDialogContent className="text-white border backdrop-blur-xl bg-slate-900/95 border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-white">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                {t('deleteRevokedTitle')}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                <div className="space-y-2">
                  <p>{t('deleteRevokedDescription1', { count: licenses.filter(l => !l.isActive).length })}</p>
                  <p className="text-yellow-400">{t('deleteRevokedDescription2')}</p>
                  <p>{t('deleteRevokedDescription3')}</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={deletingRevoked}
                className="text-white bg-gradient-to-r border backdrop-blur-sm from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-white/10"
              >
                {t('cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAllRevoked}
                disabled={deletingRevoked}
                className="text-white bg-gradient-to-r from-red-600 to-red-500 border backdrop-blur-sm hover:from-red-500 hover:to-red-400 border-white/10"
              >
                {deletingRevoked ? (
                  <>
                    <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                    {t('deleting')}
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 w-4 h-4" />
                    {t('deleteForever')}
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  )
}

export default withAdminAuth(AdminLicenses)
