"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { withAdminAuth } from '@/lib/auth-context'
import { useLicensesStore, useUsersStore, useScriptsStore, License, User, Script } from '@/lib/stores'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

import { Plus, Trash2, CheckCircle, XCircle, RefreshCw, Download, Eye, Key, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminFilter, { FilterConfig, FilterValues } from '@/components/admin/admin-filter'

function AdminLicenses() {
  // Use Zustand stores
  const { 
    items: licenses, 
    loading, 
    error,
    getAll: getLicenses,
    patch: patchLicense 
  } = useLicensesStore()

  const { items: users, getAll: getUsers } = useUsersStore()
  const { items: scripts, getAll: getScripts } = useScriptsStore()

  const [filteredLicenses, setFilteredLicenses] = useState<License[]>([])
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null)
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit] = useState(10)
  const router = useRouter()

  // Filter configuration
  const filterConfig: FilterConfig = {
    searchPlaceholder: "Search by user, script, or license key...",
    statusOptions: [
      { value: 'active', label: 'Active', count: licenses.filter(l => l.isActive && (l.expiresAt ? new Date(l.expiresAt) > new Date() : true)).length },
      { value: 'expired', label: 'Expired', count: licenses.filter(l => l.expiresAt && new Date(l.expiresAt) <= new Date()).length },
      { value: 'revoked', label: 'Revoked', count: licenses.filter(l => !l.isActive).length }
    ],
    showDateFilter: true,
    showActiveFilter: false
  }



  // Load all data on mount
  useEffect(() => {
    getLicenses().catch(() => {})
    getUsers().catch(() => {})
    getScripts().catch(() => {})
  }, [getLicenses, getUsers, getScripts])

  // Update filtered licenses when licenses change
  useEffect(() => {
    setFilteredLicenses(licenses)
    setTotalPages(Math.ceil(licenses.length / limit))
  }, [licenses, limit])

  const handleFilterChange = (filters: FilterValues) => {
    let filtered = [...licenses]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(license => {
        const user = users.find(u => u.id === license.userId)
        const script = scripts.find(s => s.id === license.scriptId)
        return (
          license.privateKey?.toLowerCase().includes(searchLower) ||
          user?.username?.toLowerCase().includes(searchLower) ||
          user?.email?.toLowerCase().includes(searchLower) ||
          script?.name?.toLowerCase().includes(searchLower)
        )
      })
    }

    // Status filter
    if (filters.status) {
      const now = new Date()
      if (filters.status === 'active') {
        filtered = filtered.filter(license => license.isActive && license.expiresAt && new Date(license.expiresAt) > now)
      } else if (filters.status === 'expired') {
        filtered = filtered.filter(license => license.expiresAt && new Date(license.expiresAt) <= now)
      } else if (filters.status === 'revoked') {
        filtered = filtered.filter(license => !license.isActive)
      }
    }

    // Date filter
    if (filters.dateFrom) {
      filtered = filtered.filter(license => {
        const licenseDate = new Date(license.createdAt || license.updatedAt || '')
        return licenseDate >= filters.dateFrom!
      })
    }
    if (filters.dateTo) {
      filtered = filtered.filter(license => {
        const licenseDate = new Date(license.createdAt || license.updatedAt || '')
        return licenseDate <= filters.dateTo!
      })
    }

    setFilteredLicenses(filtered)
  }

  const handleExport = () => {
    const csvContent = [
      ['User', 'Script', 'License Key', 'Expiry Date', 'Status', 'Created Date'].join(','),
      ...filteredLicenses.map(license => {
        const user = users.find(u => u.id === license.userId)
        const script = scripts.find(s => s.id === license.scriptId)
        const now = new Date()
        const isExpired = license.expiresAt ? new Date(license.expiresAt) <= now : false
        const status = !license.isActive ? 'Revoked' : isExpired ? 'Expired' : 'Active'
        
        return [
          user?.username || 'Unknown',
          script?.name || 'Unknown',
          license.privateKey || '',
          license.expiresAt ? new Date(license.expiresAt).toLocaleDateString('ar') : 'No Expiration',
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
      toast.success('License revoked successfully')
      setIsRevokeDialogOpen(false)
      setSelectedLicense(null)
      await getLicenses()
    } catch (error) {
      console.error('Failed to revoke license:', error)
      toast.error('Failed to revoke license')
    }
  }

  const getStatusBadge = (license: License) => {
    if (!license.isActive) {
      return <Badge variant="destructive">Revoked</Badge>
    }
    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>
    }
    return <Badge variant="default" className="bg-green-500">Active</Badge>
  }

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user?.username || 'Unknown User'
  }

  const getScriptName = (scriptId: string) => {
    const script = scripts.find(s => s.id === scriptId) // Use strict equality
    return script?.name || 'Unknown Script'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString()
  }

  // Remove old filter logic - now handled by AdminFilter component

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="p-8 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
          <div className="mx-auto w-16 h-16 rounded-full border-4 animate-spin border-blue-500/30 border-t-blue-500"></div>
          <p className="mt-4 font-medium text-center text-white/80">Loading licenses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>      
      <div className="relative z-10 p-6 mx-auto space-y-6 max-w-7xl">
        {/* Header */}
        <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                <Key className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">License Management</h1>
                <p className="text-gray-400">Manage all script licenses and their validity</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => router.push('/admin')}
                className="text-white bg-gradient-to-r border shadow-lg backdrop-blur-sm transition-all duration-300 from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-white/10 hover:shadow-xl hover:scale-105"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Dashboard
              </Button>
              <Button 
                onClick={() => router.push('/admin/licenses/manage')}
                className="text-white bg-gradient-to-r from-blue-600 to-blue-500 border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-blue-500 hover:to-blue-400 border-white/10 hover:shadow-xl hover:scale-105"
              >
                <Plus className="mr-2 w-4 h-4" />
                Create License
            </Button>
            </div>
          </div>
        </div>

        {/* Filter Component */}
        <AdminFilter
          config={filterConfig}
          onFilterChange={handleFilterChange}
          onRefresh={() => getLicenses()}
          onExport={handleExport}
          totalCount={licenses.length}
          filteredCount={filteredLicenses.length}
          loading={loading}
        />

        {/* Licenses Table */}
        <div className="overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Licenses ({filteredLicenses.length} of {licenses.length})</h2>
            <p className="mt-1 text-gray-400">List of all script licenses on the platform</p>
          </div>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="font-semibold text-gray-300">User</TableHead>
                <TableHead className="font-semibold text-gray-300">Script</TableHead>
                <TableHead className="font-semibold text-gray-300">Status</TableHead>
                <TableHead className="font-semibold text-gray-300">Expiry Date</TableHead>
                <TableHead className="font-semibold text-gray-300">Created Date</TableHead>
                <TableHead className="font-semibold text-gray-300">Actions</TableHead>
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
                          toast.success('License key copied to clipboard')
                        }}
                        size="sm"
                        title="Copy License Key"
                        className="text-white bg-gradient-to-r from-green-600 to-green-500 border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-green-500 hover:to-green-400 border-white/10 hover:shadow-xl hover:scale-105"
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => openEditDialog(license)}
                        size="sm"
                        disabled={!license.isActive || !!(license.expiresAt && new Date(license.expiresAt) < new Date())}
                        title="Edit License"
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
                        title="Revoke License"
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
              Showing {Math.min((currentPage - 1) * limit + 1, licenses.length)}-{Math.min(currentPage * limit, licenses.length)} of {licenses.length} licenses
            </p>
            <div className="flex space-x-2">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                size="sm"
                className="text-white bg-gradient-to-r border shadow-lg backdrop-blur-sm transition-all duration-300 from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 disabled:from-slate-800 disabled:to-slate-700 border-white/10 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                size="sm"
                className="text-white bg-gradient-to-r border shadow-lg backdrop-blur-sm transition-all duration-300 from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 disabled:from-slate-800 disabled:to-slate-700 border-white/10 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Next
              </Button>
            </div>
          </div>
        </div>



        {/* Revoke Confirmation Dialog */}
        <AlertDialog open={isRevokeDialogOpen} onOpenChange={setIsRevokeDialogOpen}>
          <AlertDialogContent className="text-white border backdrop-blur-xl bg-slate-900/95 border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Revoke License</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Are you sure you want to revoke the license for "{getUserName(selectedLicense?.userId || '')}" to access "{getScriptName(selectedLicense?.scriptId || '')}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-white bg-gradient-to-r border backdrop-blur-sm from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-white/10">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleRevokeLicense} 
                className="text-white bg-gradient-to-r from-red-600 to-red-500 border backdrop-blur-sm hover:from-red-500 hover:to-red-400 border-white/10"
              >
                Revoke License
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
    </div>
  )
}

export default withAdminAuth(AdminLicenses)
