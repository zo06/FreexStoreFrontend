"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { withAdminAuth } from '@/lib/auth-context'
import { useUsersStore, User } from '@/lib/stores'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Edit, Trash2, Shield, UserX, UserCheck, Eye, Users, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminFilter, { FilterConfig, FilterValues } from '@/components/admin/admin-filter'
import AdminUserInfoModal from '@/components/admin-user-info-modal'

function AdminUsers() {
  const t = useTranslations('admin.users')
  // Use Zustand store
  const { 
    items: users, 
    loading, 
    error,
    getAll,
    remove,
    patch 
  } = useUsersStore()

  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [showUserInfoModal, setShowUserInfoModal] = useState(false)
  const [selectedUserForInfo, setSelectedUserForInfo] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit] = useState(10)
  const router = useRouter()

  // Filter configuration
  const filterConfig: FilterConfig = {
    searchPlaceholder: t('searchPlaceholder'),
    statusOptions: [
      { value: 'active', label: t('statusOptions.active'), count: users.filter(u => u.isActive).length },
      { value: 'inactive', label: t('statusOptions.inactive'), count: users.filter(u => !u.isActive).length }
    ],
    roleOptions: [
      { value: 'admin', label: t('roleOptions.admin'), count: users.filter(u => u.isAdmin).length },
      { value: 'user', label: t('roleOptions.user'), count: users.filter(u => !u.isAdmin).length }
    ],
    showDateFilter: true,
    showActiveFilter: true
  }

  // Load users on mount
  useEffect(() => {
    getAll().catch(() => {});
  }, [getAll])

  // Update filtered users when users change
  useEffect(() => {
    setFilteredUsers(users)
    setTotalPages(Math.ceil(users.length / limit))
  }, [users, limit])

  const handleFilterChange = (filters: FilterValues) => {
    let filtered = [...users]

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(filters.search.toLowerCase()) ||
        (user.discordUsername && user.discordUsername.toLowerCase().includes(filters.search.toLowerCase()))
      )
    }

    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'active') {
        filtered = filtered.filter(user => user.isActive)
      } else if (filters.status === 'inactive') {
        filtered = filtered.filter(user => !user.isActive)
      }
    }

    // Role filter
    if (filters.role !== 'all') {
      if (filters.role === 'admin') {
        filtered = filtered.filter(user => user.isAdmin)
      } else if (filters.role === 'user') {
        filtered = filtered.filter(user => !user.isAdmin)
      }
    }

    // Active status filter
    if (filters.isActive !== null) {
      filtered = filtered.filter(user => user.isActive === filters.isActive)
    }

    // Date filter
    if (filters.dateFrom) {
      filtered = filtered.filter(user => 
        user.createdAt && new Date(user.createdAt) >= filters.dateFrom!
      )
    }
    if (filters.dateTo) {
      filtered = filtered.filter(user => 
        user.createdAt && new Date(user.createdAt) <= filters.dateTo!
      )
    }

    setFilteredUsers(filtered)
  }

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      `${t('csvHeaders.username')},${t('csvHeaders.discordUsername')},${t('csvHeaders.role')},${t('csvHeaders.status')},${t('csvHeaders.joinDate')},${t('csvHeaders.lastLogin')},${t('csvHeaders.lastIp')}\n` +
      filteredUsers.map(user =>
        `${user.username},${user.discordUsername || t('csvValues.na')},${user.isAdmin ? t('csvValues.admin') : t('csvValues.user')},${user.isActive ? t('csvValues.active') : t('csvValues.inactive')},${formatDate(user.createdAt || '')},${user.lastLoginAt ? formatDate(user.lastLoginAt) : t('csvValues.never')},${(user as any).lastLoginIp || t('csvValues.na')}`
      ).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", t('exportFilename'))
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleToggleAdmin = async (user: User) => {
    try {
      await patch(user.id, { isAdmin: !user.isAdmin })
      toast.success(t('toast.adminStatusUpdated', { username: user.username }))
    } catch (error) {
      console.error('Failed to toggle admin status:', error)
      toast.error(t('toast.failedToUpdateAdminStatus'))
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      await remove(selectedUser.id)
      toast.success(t('toast.userDeletedSuccess', { username: selectedUser.username }))
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error(t('toast.failedToDeleteUser'))
    }
  }

  const getStatusBadge = (user: User) => {
    if (!user.isActive) {
      return <Badge variant="destructive">{t('badges.inactive')}</Badge>
    }
    if (user.isAdmin) {
      return <Badge variant="default" className="bg-cyan-500">{t('badges.admin')}</Badge>
    }
    return <Badge variant="outline">{t('badges.user')}</Badge>
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
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">{t('title')}</h1>
                <p className="mt-1 text-gray-400">{t('subtitle')}</p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/admin')}
              className="text-white bg-gradient-to-r border shadow-lg backdrop-blur-sm transition-all duration-300 from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-white/10 hover:shadow-xl hover:scale-105"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              {t('backToDashboard')}
            </Button>
          </div>
        </div>

      {/* Admin Filter Component */}
      <AdminFilter
        config={filterConfig}
        onFilterChange={handleFilterChange}
        onRefresh={() => getAll()}
        onExport={handleExport}
        totalCount={users.length}
        filteredCount={filteredUsers.length}
        loading={loading}
      />

        {/* Users Table */}
        <div className="p-6 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 bg-white/5 border-white/10 hover:bg-white/10">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
              {t('table.users', { count: filteredUsers.length, total: users.length })}
            </h2>
            <p className="mt-1 text-gray-400">{t('table.listDescription')}</p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="font-semibold text-gray-300">{t('table.user')}</TableHead>
                  <TableHead className="font-semibold text-gray-300">{t('table.discord')}</TableHead>
                  <TableHead className="font-semibold text-gray-300">{t('table.role')}</TableHead>
                  <TableHead className="font-semibold text-gray-300">{t('table.joinDate')}</TableHead>
                  <TableHead className="font-semibold text-gray-300">{t('table.lastLogin')}</TableHead>
                  <TableHead className="font-semibold text-gray-300">{t('table.lastIp')}</TableHead>
                  <TableHead className="font-semibold text-gray-300">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="transition-colors border-white/10 hover:bg-white/5">
                    <TableCell className="font-medium text-white">{user.username}</TableCell>
                    <TableCell className="text-gray-300">{user.discordUsername || t('table.na')}</TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell className="text-gray-300">{user.createdAt ? formatDate(user.createdAt) : t('table.na')}</TableCell>
                    <TableCell className="text-gray-300">{user.lastLoginAt ? formatDate(user.lastLoginAt) : t('table.neverLoggedIn')}</TableCell>
                    <TableCell className="font-mono text-gray-300 text-sm">{(user as any).lastLoginIp || t('table.na')}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => {
                            setSelectedUserForInfo(user)
                            setShowUserInfoModal(true)
                          }}
                          size="sm"
                          className="text-white bg-gradient-to-r from-blue-600 to-blue-500 border shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-blue-500 hover:to-blue-400 border-white/10 hover:shadow-xl hover:scale-105"
                          title={t('table.viewUserDetails')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleToggleAdmin(user)}
                          size="sm"
                          className={`${user.isAdmin 
                            ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white' 
                            : 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white'
                          } border border-white/10 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105`}
                        >
                          <Shield className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedUser(user)
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
              {t('pagination.showing', {
                from: Math.min((currentPage - 1) * limit + 1, users.length),
                to: Math.min(currentPage * limit, users.length),
                total: users.length
              })}
            </p>
            <div className="flex space-x-2">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                size="sm"
                className="text-white bg-gradient-to-r border shadow-lg backdrop-blur-sm transition-all duration-300 from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 disabled:from-slate-800 disabled:to-slate-700 border-white/10 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {t('pagination.previous')}
              </Button>
              <Button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                size="sm"
                className="text-white bg-gradient-to-r border shadow-lg backdrop-blur-sm transition-all duration-300 from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 disabled:from-slate-800 disabled:to-slate-700 border-white/10 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {t('pagination.next')}
              </Button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="text-white border backdrop-blur-xl bg-slate-900/90 border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">{t('deleteDialog.title')}</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                {t('deleteDialog.description', { username: selectedUser?.username || '' })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-white bg-gradient-to-r border from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-white/10">
                {t('deleteDialog.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                className="text-white bg-gradient-to-r from-red-600 to-red-500 border hover:from-red-500 hover:to-red-400 border-white/10"
              >
                {t('deleteDialog.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* User Info Modal */}
        {selectedUserForInfo && (
          <AdminUserInfoModal
            isOpen={showUserInfoModal}
            onClose={() => {
              setShowUserInfoModal(false)
              setSelectedUserForInfo(null)
            }}
            userId={selectedUserForInfo.id}
            userName={selectedUserForInfo.username}
          />
        )}
      </div>
    </main>
  )
}

export default withAdminAuth(AdminUsers)
