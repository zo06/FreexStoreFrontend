"use client"

import { useState, useEffect, useRef } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Search, X, CalendarIcon, RefreshCw, Download, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export interface FilterConfig {
  searchPlaceholder?: string
  statusOptions?: { value: string; label: string; count?: number }[]
  categoryOptions?: { value: string; label: string; count?: number }[]
  roleOptions?: { value: string; label: string; count?: number }[]
  priceRange?: { min: number; max: number }
  showDateFilter?: boolean
  showActiveFilter?: boolean
  showPriceFilter?: boolean
  customFilters?: {
    key: string
    label: string
    type: 'select' | 'input' | 'switch'
    options?: { value: string; label: string }[]
  }[]
}

export interface FilterValues {
  search: string
  status: string
  category: string
  role: string
  priceMin: number
  priceMax: number
  priceRange?: { min: number; max: number }
  dateFrom: Date | undefined
  dateTo: Date | undefined
  isActive: boolean | null
  customValues: Record<string, unknown>
}

interface AdminFilterProps {
  config: FilterConfig
  onFilterChange: (filters: FilterValues) => void
  onRefresh?: () => void
  onExport?: () => void
  totalCount?: number
  filteredCount?: number
  loading?: boolean
}

function FilterPill({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  count?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border',
        active
          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20'
      )}
    >
      {children}
      {count !== undefined && (
        <span
          className={cn(
            'px-1.5 py-0.5 rounded-md text-[10px] font-semibold',
            active ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/10 text-gray-500'
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}

function ActiveChip({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <span className="flex items-center gap-1 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/25 rounded-lg text-xs text-cyan-300">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 text-cyan-400/60 hover:text-cyan-300 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}

export function AdminFilter({
  config,
  onFilterChange,
  onRefresh,
  onExport,
  totalCount = 0,
  filteredCount = 0,
  loading = false,
}: AdminFilterProps) {
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    status: 'all',
    category: 'all',
    role: 'all',
    priceMin: config.priceRange?.min || 0,
    priceMax: config.priceRange?.max || 1000,
    dateFrom: undefined,
    dateTo: undefined,
    isActive: null,
    customValues: {},
  })

  const [isExpanded, setIsExpanded] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const [localSearch, setLocalSearch] = useState('')

  const hasAdvancedFilters = !!(
    config.statusOptions ||
    config.categoryOptions ||
    config.roleOptions ||
    config.showDateFilter ||
    config.showActiveFilter ||
    config.showPriceFilter ||
    config.customFilters?.length
  )

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateFilters({ search: localSearch })
    }, 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch])

  const updateFilters = (patch: Partial<FilterValues>) => {
    const next = { ...filters, ...patch }
    setFilters(next)
    onFilterChange(next)

    let count = 0
    if (next.search) count++
    if (next.status !== 'all') count++
    if (next.category !== 'all') count++
    if (next.role !== 'all') count++
    if (next.isActive !== null) count++
    if (next.dateFrom || next.dateTo) count++
    if (
      config.showPriceFilter &&
      (next.priceMin > (config.priceRange?.min || 0) ||
        next.priceMax < (config.priceRange?.max || 1000))
    ) count++
    setActiveFiltersCount(count)
  }

  const clearAll = () => {
    const cleared: FilterValues = {
      search: '',
      status: 'all',
      category: 'all',
      role: 'all',
      priceMin: config.priceRange?.min || 0,
      priceMax: config.priceRange?.max || 1000,
      dateFrom: undefined,
      dateTo: undefined,
      isActive: null,
      customValues: {},
    }
    setFilters(cleared)
    setLocalSearch('')
    onFilterChange(cleared)
    setActiveFiltersCount(0)
  }

  // Active chip labels
  const activeChips: { label: string; clear: () => void }[] = []
  if (filters.status !== 'all') {
    const opt = config.statusOptions?.find(o => o.value === filters.status)
    activeChips.push({ label: `Status: ${opt?.label ?? filters.status}`, clear: () => updateFilters({ status: 'all' }) })
  }
  if (filters.category !== 'all') {
    const opt = config.categoryOptions?.find(o => o.value === filters.category)
    activeChips.push({ label: `Category: ${opt?.label ?? filters.category}`, clear: () => updateFilters({ category: 'all' }) })
  }
  if (filters.role !== 'all') {
    const opt = config.roleOptions?.find(o => o.value === filters.role)
    activeChips.push({ label: `Role: ${opt?.label ?? filters.role}`, clear: () => updateFilters({ role: 'all' }) })
  }
  if (filters.isActive !== null) {
    activeChips.push({ label: `Active: ${filters.isActive ? 'Yes' : 'No'}`, clear: () => updateFilters({ isActive: null }) })
  }
  if (filters.dateFrom) {
    activeChips.push({ label: `From: ${format(filters.dateFrom, 'MMM d, yyyy')}`, clear: () => updateFilters({ dateFrom: undefined }) })
  }
  if (filters.dateTo) {
    activeChips.push({ label: `To: ${format(filters.dateTo, 'MMM d, yyyy')}`, clear: () => updateFilters({ dateTo: undefined }) })
  }

  return (
    <div className="rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10 overflow-hidden">

      {/* ── Top Row ── */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type="text"
              placeholder={config.searchPlaceholder || 'Search…'}
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation() } }}
              className="w-full pl-10 pr-9 py-2.5 bg-white/[0.06] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.09] focus:shadow-[0_0_0_3px_rgba(6,182,212,0.08)] transition-all"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => { setLocalSearch(''); updateFilters({ search: '' }) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Count pill */}
            {totalCount > 0 && (
              <div className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-sm">
                <span className="font-semibold text-cyan-400">{filteredCount}</span>
                <span className="text-gray-600">/</span>
                <span className="text-gray-400">{totalCount}</span>
              </div>
            )}

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                title="Refresh"
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              </button>
            )}

            {onExport && (
              <button
                type="button"
                onClick={onExport}
                title="Export CSV"
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {hasAdvancedFilters && (
              <button
                type="button"
                onClick={() => setIsExpanded(v => !v)}
                className={cn(
                  'flex items-center gap-1.5 h-9 px-3 rounded-xl border text-sm font-medium transition-all',
                  isExpanded
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.12)]'
                    : 'bg-white/[0.04] border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20'
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-cyan-500 text-white text-[10px] font-bold">
                    {activeFiltersCount}
                  </span>
                )}
                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', isExpanded && 'rotate-180')} />
              </button>
            )}
          </div>
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {activeChips.map((chip, i) => (
              <ActiveChip key={i} label={chip.label} onRemove={chip.clear} />
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-gray-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Advanced Panel ── */}
      {isExpanded && (
        <div className="border-t border-white/[0.06] bg-black/10 px-4 sm:px-5 py-4 sm:py-5 space-y-5">

          {/* Status pills */}
          {config.statusOptions && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                <FilterPill
                  active={filters.status === 'all'}
                  onClick={() => updateFilters({ status: 'all' })}
                >
                  All
                </FilterPill>
                {config.statusOptions.map(opt => (
                  <FilterPill
                    key={opt.value}
                    active={filters.status === opt.value}
                    onClick={() => updateFilters({ status: opt.value })}
                    count={opt.count}
                  >
                    {opt.label}
                  </FilterPill>
                ))}
              </div>
            </div>
          )}

          {/* Category pills */}
          {config.categoryOptions && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                <FilterPill
                  active={filters.category === 'all'}
                  onClick={() => updateFilters({ category: 'all' })}
                >
                  All
                </FilterPill>
                {config.categoryOptions.map(opt => (
                  <FilterPill
                    key={opt.value}
                    active={filters.category === opt.value}
                    onClick={() => updateFilters({ category: opt.value })}
                    count={opt.count}
                  >
                    {opt.label}
                  </FilterPill>
                ))}
              </div>
            </div>
          )}

          {/* Role pills */}
          {config.roleOptions && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Role</p>
              <div className="flex flex-wrap gap-2">
                <FilterPill
                  active={filters.role === 'all'}
                  onClick={() => updateFilters({ role: 'all' })}
                >
                  All
                </FilterPill>
                {config.roleOptions.map(opt => (
                  <FilterPill
                    key={opt.value}
                    active={filters.role === opt.value}
                    onClick={() => updateFilters({ role: opt.value })}
                    count={opt.count}
                  >
                    {opt.label}
                  </FilterPill>
                ))}
              </div>
            </div>
          )}

          {/* Active status pills */}
          {config.showActiveFilter && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Active Status</p>
              <div className="flex flex-wrap gap-2">
                <FilterPill active={filters.isActive === null} onClick={() => updateFilters({ isActive: null })}>All</FilterPill>
                <FilterPill active={filters.isActive === true} onClick={() => updateFilters({ isActive: true })}>Active</FilterPill>
                <FilterPill active={filters.isActive === false} onClick={() => updateFilters({ isActive: false })}>Inactive</FilterPill>
              </div>
            </div>
          )}

          {/* Date range */}
          {config.showDateFilter && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Date Range</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* From */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        'flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border text-sm text-left transition-all',
                        filters.dateFrom
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                          : 'bg-white/[0.04] border-white/10 text-gray-500 hover:text-gray-300 hover:bg-white/[0.07] hover:border-white/20'
                      )}
                    >
                      <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                      <span>{filters.dateFrom ? format(filters.dateFrom, 'MMM d, yyyy') : 'From date'}</span>
                      {filters.dateFrom && (
                        <X
                          className="w-3.5 h-3.5 ml-auto text-cyan-400/60 hover:text-cyan-300"
                          onClick={e => { e.stopPropagation(); updateFilters({ dateFrom: undefined }) }}
                        />
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-auto bg-slate-900/95 border-white/10 backdrop-blur-xl shadow-2xl">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={date => updateFilters({ dateFrom: date })}
                      initialFocus
                      className="text-white"
                    />
                  </PopoverContent>
                </Popover>

                {/* To */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        'flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border text-sm text-left transition-all',
                        filters.dateTo
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                          : 'bg-white/[0.04] border-white/10 text-gray-500 hover:text-gray-300 hover:bg-white/[0.07] hover:border-white/20'
                      )}
                    >
                      <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                      <span>{filters.dateTo ? format(filters.dateTo, 'MMM d, yyyy') : 'To date'}</span>
                      {filters.dateTo && (
                        <X
                          className="w-3.5 h-3.5 ml-auto text-cyan-400/60 hover:text-cyan-300"
                          onClick={e => { e.stopPropagation(); updateFilters({ dateTo: undefined }) }}
                        />
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-auto bg-slate-900/95 border-white/10 backdrop-blur-xl shadow-2xl">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={date => updateFilters({ dateTo: date })}
                      initialFocus
                      className="text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Price range */}
          {config.showPriceFilter && config.priceRange && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Price Range</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    min={config.priceRange.min}
                    max={config.priceRange.max}
                    value={filters.priceMin}
                    onChange={e => updateFilters({ priceMin: Number(e.target.value) })}
                    placeholder={`Min ${config.priceRange.min}`}
                    className="w-full pl-7 pr-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.07] transition-all"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    min={config.priceRange.min}
                    max={config.priceRange.max}
                    value={filters.priceMax}
                    onChange={e => updateFilters({ priceMax: Number(e.target.value) })}
                    placeholder={`Max ${config.priceRange.max}`}
                    className="w-full pl-7 pr-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.07] transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Custom filters */}
          {config.customFilters && config.customFilters.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {config.customFilters.map(cf => (
                <div key={cf.key}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">{cf.label}</p>

                  {cf.type === 'select' && cf.options && (
                    <div className="flex flex-wrap gap-2">
                      {cf.options.map(opt => (
                        <FilterPill
                          key={opt.value}
                          active={(filters.customValues[cf.key] as string) === opt.value}
                          onClick={() => updateFilters({ customValues: { ...filters.customValues, [cf.key]: opt.value } })}
                        >
                          {opt.label}
                        </FilterPill>
                      ))}
                    </div>
                  )}

                  {cf.type === 'input' && (
                    <input
                      value={(filters.customValues[cf.key] as string) || ''}
                      onChange={e => updateFilters({ customValues: { ...filters.customValues, [cf.key]: e.target.value } })}
                      placeholder={cf.label}
                      className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.07] transition-all"
                    />
                  )}

                  {cf.type === 'switch' && (
                    <button
                      type="button"
                      onClick={() => updateFilters({ customValues: { ...filters.customValues, [cf.key]: !filters.customValues[cf.key] } })}
                      className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                        filters.customValues[cf.key] ? 'bg-cyan-500' : 'bg-white/10'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          filters.customValues[cf.key] ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminFilter
