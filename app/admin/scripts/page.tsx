"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { withAdminAuth } from '@/lib/auth-context'
import { useScriptsStore, useCategoriesStore, Script, Category } from '@/lib/stores'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, Eye, Power, PowerOff, Copy, Download, Upload, Code, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminFilter, { FilterConfig, FilterValues } from '@/components/admin/admin-filter'

function AdminScripts() {
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

  
  // Get unique categories from scripts
  const categories = [...new Set(scripts.map(script => ((script.category as { name?: string } | undefined)?.name)).filter(Boolean))]
  
  // Filter configuration
  const filterConfig: FilterConfig = {
    searchPlaceholder: "Search by name, description, or category...",
    statusOptions: [
      { value: 'active', label: 'Active', count: scripts.filter(s => s.isActive).length },
      { value: 'inactive', label: 'Inactive', count: scripts.filter(s => !s.isActive).length }
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

  // Remove form states as they're now handled in separate pages

  // Load categories on component mount
  useEffect(() => {
    getCategories().catch(() => {})
  }, [getCategories])

  // Category options from database
  const categoryOptions = (dbCategories && dbCategories.length > 0) 
    ? dbCategories.map(cat => ({ value: cat.name, label: cat.name }))
    : []
  
  console.log('dbCategories:', dbCategories)
  console.log('categoryOptions:', categoryOptions)

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
    if (filters.category) {
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
      toast.success('Script deleted successfully')
      setIsDeleteDialogOpen(false)
      setSelectedScript(null)
    } catch (error) {
      console.error('Failed to delete script:', error)
      toast.error('Failed to delete script')
    }
  }

  const handleToggleActive = async (script: Script) => {
    try {
      await patchScript(script.id, { isActive: !script.isActive })
      toast.success(`${script.name} ${script.isActive ? 'deactivated' : 'activated'}`)
    } catch (error) {
      console.error('Failed to toggle script status:', error)
      toast.error('Failed to update script status')
    }
  }

  // Navigation functions replace the old dialog handlers

  const getStatusBadge = (script: Script) => {
    if (script.isActive) {
      return <Badge variant="default" className="bg-green-500">Active</Badge>
    }
    return <Badge variant="secondary">Inactive</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
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
              <div className="p-3 bg-gradient-to-r rounded-xl border backdrop-blur-sm from-emerald-500/20 to-blue-500/20 border-white/10">
                <Code className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">Script Management</h1>
                <p className="mt-1 text-gray-400">Manage all platform scripts and their availability</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => router.push('/admin')} 
                className="text-white bg-gradient-to-r border shadow-lg backdrop-blur-sm transition-all duration-300 from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-white/10 hover:shadow-xl hover:scale-105"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Dashboard
              </Button>
              <Button 
                onClick={handleCreateScript}
                className="text-white bg-gradient-to-r from-emerald-600 to-emerald-500 border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-emerald-500 hover:to-emerald-400 border-white/10 hover:shadow-xl hover:scale-105"
              >
                <Plus className="mr-2 w-4 h-4" />
                Create Script
              </Button>
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
        <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 bg-white/5 border-white/10 hover:bg-white/10">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
              Scripts ({filteredScripts.length} of {scripts.length})
            </h2>
            <p className="mt-1 text-gray-400">List of all available scripts on the platform</p>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="font-semibold text-gray-300">Name</TableHead>
                  <TableHead className="font-semibold text-gray-300">Category</TableHead>
                  <TableHead className="font-semibold text-gray-300">Description</TableHead>
                  <TableHead className="font-semibold text-gray-300">Price</TableHead>
                  <TableHead className="font-semibold text-gray-300">Status</TableHead>
                  <TableHead className="font-semibold text-gray-300">Created Date</TableHead>
                  <TableHead className="font-semibold text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScripts.map((script) => (
                  <TableRow key={script.id} className="transition-colors border-white/10 hover:bg-white/5">
                    <TableCell className="font-medium text-white">{script.name}</TableCell>
                    <TableCell>
                      <Badge className="text-emerald-300 bg-gradient-to-r border from-emerald-600/20 to-blue-600/20 border-emerald-400/30">
                        {((script.category as { name?: string } | undefined)?.name) || 'General'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs text-gray-300 truncate">{script.description || 'No description'}</TableCell>
                    <TableCell className="text-gray-300">${script.price || 0}</TableCell>
                    <TableCell>{getStatusBadge(script)}</TableCell>
                    <TableCell className="text-gray-300">{formatDate(script.createdAt || '')}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleToggleActive(script)}
                          size="sm"
                          className={`${script.isActive 
                            ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white' 
                            : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white'
                          } border border-white/10 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105`}
                        >
                          {script.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        </Button>
                        <Button
                          onClick={() => handleEditScript(script)}
                          size="sm"
                          className="text-white bg-gradient-to-r from-blue-600 to-blue-500 border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-blue-500 hover:to-blue-400 border-white/10 hover:shadow-xl hover:scale-105"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedScript(script)
                            setIsDeleteDialogOpen(true)
                          }}
                          size="sm"
                          className="text-white bg-gradient-to-r from-red-600 to-red-500 border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-red-500 hover:to-red-400 border-white/10 hover:shadow-xl hover:scale-105"
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
        <div className="p-4 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">
              Showing {Math.min((currentPage - 1) * limit + 1, scripts.length)}-{Math.min(currentPage * limit, scripts.length)} of {scripts.length} scripts
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

        {/* Dialogs removed - now using dedicated pages for create/edit */}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-gradient-to-br border shadow-2xl backdrop-blur-xl from-slate-900/90 to-slate-800/90 border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-semibold text-white">Delete Script</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Are you sure you want to delete script "{selectedScript?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-white bg-gradient-to-r border shadow-lg backdrop-blur-sm transition-all duration-300 from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-white/10 hover:shadow-xl hover:scale-105">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteScript} 
                className="text-white bg-gradient-to-r from-red-600 to-red-500 border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-red-500 hover:to-red-400 border-white/10 hover:shadow-xl hover:scale-105"
              >
                Delete Script
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  )
}

export default withAdminAuth(AdminScripts)

