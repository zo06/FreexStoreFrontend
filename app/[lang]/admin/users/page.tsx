"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { withAdminAuth } from '@/lib/auth-context'
import { User } from '@/lib/stores'
import { safeAdminApi } from '@/lib/admin-api'
import { Trash2, Shield, Eye, Users, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminFilter, { FilterConfig, FilterValues } from '@/components/admin/admin-filter'
import AdminUserInfoModal from '@/components/admin-user-info-modal'

const PAGE_LIMIT = 20

function AdminUsers() {
  const t = useTranslations('admin.users')
  const router = useRouter()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [filterValues, setFilterValues] = useState<FilterValues>({
    search: '',
    status: 'all',
    category: 'all',
    role: 'all',
    priceMin: 0,
    priceMax: 1000,
    isActive: null,
    dateFrom: undefined,
    dateTo: undefined,
    customValues: {},
  })

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [showUserInfoModal, setShowUserInfoModal] = useState(false)
  const [selectedUserForInfo, setSelectedUserForInfo] = useState<User | null>(null)

  const fetchUsers = useCallback(async (page: number, filters: FilterValues) => {
    setLoading(true)
    try {
      const result = await safeAdminApi.users.getAll({
        page,
        limit: PAGE_LIMIT,
        search: filters.search || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        role: filters.role !== 'all' ? filters.role : undefined,
      })
      if (result) {
        setUsers(result.data.map((u: any) => ({ ...u, isAdmin: u.role === 'admin' })))
        setTotal(result.total)
        setTotalPages(result.totalPages)
      }
    } catch {
      // errors handled by safeAdminApi
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers(currentPage, filterValues)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filterValues.search, filterValues.status, filterValues.role, fetchUsers])

  // Date and isActive filters applied client-side on the current page
  const displayedUsers = users.filter(user => {
    if (filterValues.isActive !== null && user.isActive !== filterValues.isActive) return false
    if (filterValues.dateFrom && user.createdAt && new Date(user.createdAt) < filterValues.dateFrom) return false
    if (filterValues.dateTo && user.createdAt && new Date(user.createdAt) > filterValues.dateTo) return false
    return true
  })

  const filterConfig: FilterConfig = {
    searchPlaceholder: t('searchPlaceholder'),
    statusOptions: [
      { value: 'active', label: t('statusOptions.active'), count: users.filter(u => u.isActive).length },
      { value: 'inactive', label: t('statusOptions.inactive'), count: users.filter(u => !u.isActive).length },
    ],
    roleOptions: [
      { value: 'admin', label: t('roleOptions.admin'), count: users.filter(u => u.isAdmin).length },
      { value: 'user', label: t('roleOptions.user'), count: users.filter(u => !u.isAdmin).length },
    ],
    showDateFilter: true,
    showActiveFilter: true,
  }

  const handleFilterChange = (filters: FilterValues) => {
    setFilterValues(filters)
    setCurrentPage(1)
  }

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      `${t('csvHeaders.username')},${t('csvHeaders.discordUsername')},${t('csvHeaders.role')},${t('csvHeaders.status')},${t('csvHeaders.joinDate')},${t('csvHeaders.lastLogin')},${t('csvHeaders.lastIp')}\n` +
      displayedUsers.map(user =>
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
      await safeAdminApi.users.toggleAdmin(user.id)
      setUsers(prev => prev.map(u =>
        u.id === user.id ? { ...u, isAdmin: !u.isAdmin, role: u.isAdmin ? 'user' : 'admin' } : u
      ))
      toast.success(t('toast.adminStatusUpdated', { username: user.username }))
    } catch {
      toast.error(t('toast.failedToUpdateAdminStatus'))
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    try {
      await safeAdminApi.users.delete(selectedUser.id)
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id))
      setTotal(prev => prev - 1)
      toast.success(t('toast.userDeletedSuccess', { username: selectedUser.username }))
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
    } catch {
      toast.error(t('toast.failedToDeleteUser'))
    }
  }

  const getStatusBadge = (user: User) => {
    if (!user.isActive) return (
      <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-red-500/10 text-red-400 border-red-500/20">
        {t('badges.inactive')}
      </span>
    )
    if (user.isAdmin) return (
      <span className="badge-blue text-xs">
        {t('badges.admin')}
      </span>
    )
    return (
      <span
        className="text-xs px-2 py-0.5 rounded-full font-medium border"
        style={{ background: 'rgba(255,255,255,0.05)', color: '#888', borderColor: 'rgba(255,255,255,0.1)' }}
      >
        {t('badges.user')}
      </span>
    )
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()

  if (loading && users.length === 0) {
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div
                className="p-3 rounded-xl"
                style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}
              >
                <Users className="w-6 h-6 text-[#51a2ff]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
                <p className="mt-1 text-sm text-[#888]">{t('subtitle')}</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="btn-ghost btn-sm flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t('backToDashboard')}</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>
        </div>

        {/* Admin Filter Component */}
        <AdminFilter
          config={filterConfig}
          onFilterChange={handleFilterChange}
          onRefresh={() => fetchUsers(currentPage, filterValues)}
          onExport={handleExport}
          totalCount={total}
          filteredCount={displayedUsers.length}
          loading={loading}
        />

        {/* Users Table */}
        <div className="card-base p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">
              {t('table.users', { count: displayedUsers.length, total })}
            </h2>
            <p className="mt-1 text-sm text-[#888]">{t('table.listDescription')}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider">{t('table.user')}</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider">{t('table.discord')}</th>
                  <th className="text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider">{t('table.role')}</th>
                  <th className="hidden md:table-cell text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider">{t('table.joinDate')}</th>
                  <th className="hidden sm:table-cell text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider">{t('table.lastLogin')}</th>
                  <th className="hidden lg:table-cell text-left text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider">{t('table.lastIp')}</th>
                  <th className="text-right text-[#555] font-medium py-3 px-4 text-xs uppercase tracking-wider">{t('table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {displayedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b transition-colors hover:bg-[#161616]"
                    style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                  >
                    <td className="py-3 px-4 text-white font-medium">{user.username}</td>
                    <td className="py-3 px-4 text-[#888]">{user.discordUsername || t('table.na')}</td>
                    <td className="py-3 px-4">{getStatusBadge(user)}</td>
                    <td className="hidden md:table-cell py-3 px-4 text-[#888]">{user.createdAt ? formatDate(user.createdAt) : t('table.na')}</td>
                    <td className="hidden sm:table-cell py-3 px-4 text-[#888]">{user.lastLoginAt ? formatDate(user.lastLoginAt) : t('table.neverLoggedIn')}</td>
                    <td className="hidden lg:table-cell py-3 px-4 font-mono text-[#888] text-xs">{(user as any).lastLoginIp || t('table.na')}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setSelectedUserForInfo(user); setShowUserInfoModal(true) }}
                          className="p-2 rounded-lg text-[#888] hover:text-white transition-colors"
                          style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
                          title={t('table.viewUserDetails')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleAdmin(user)}
                          className="p-2 rounded-lg transition-colors"
                          style={
                            user.isAdmin
                              ? { background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)', color: '#51a2ff' }
                              : { background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)', color: '#888' }
                          }
                          title={user.isAdmin ? t('badges.admin') : t('badges.user')}
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedUser(user); setIsDeleteDialogOpen(true) }}
                          className="p-2 rounded-lg text-red-400 transition-colors"
                          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {displayedUsers.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="text-center text-[#555] py-10">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="card-base p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-sm text-[#888] text-center sm:text-left">
              {t('pagination.showing', {
                from: total === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1,
                to: Math.min(currentPage * PAGE_LIMIT, total),
                total,
              })}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
                className="btn-ghost btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t('pagination.previous')}
              </button>
              <span className="text-xs text-[#555] px-1">{currentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || loading}
                className="btn-ghost btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t('pagination.next')}
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {isDeleteDialogOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
          >
            <div className="card-base p-6 w-full max-w-md space-y-4">
              <h3 className="text-white font-semibold text-lg">{t('deleteDialog.title')}</h3>
              <p className="text-[#888] text-sm">
                {t('deleteDialog.description', { username: selectedUser?.username || '' })}
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="btn-ghost flex-1"
                >
                  {t('deleteDialog.cancel')}
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="flex-1 py-2 px-4 rounded-lg text-sm font-medium text-red-400"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  {t('deleteDialog.confirm')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Info Modal */}
        {selectedUserForInfo && (
          <AdminUserInfoModal
            isOpen={showUserInfoModal}
            onClose={() => { setShowUserInfoModal(false); setSelectedUserForInfo(null) }}
            userId={selectedUserForInfo.id}
            userName={selectedUserForInfo.username}
          />
        )}
      </div>
    </main>
  )
}

export default withAdminAuth(AdminUsers)
