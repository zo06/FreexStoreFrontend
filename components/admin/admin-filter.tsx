"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Search, Filter, X, Calendar as CalendarIcon, RefreshCw, Download, SlidersHorizontal } from 'lucide-react'
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

export function AdminFilter({
  config,
  onFilterChange,
  onRefresh,
  onExport,
  totalCount = 0,
  filteredCount = 0,
  loading = false
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
    customValues: {}
  })

  const [isExpanded, setIsExpanded] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Debounce for search input
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [localSearchValue, setLocalSearchValue] = useState('')

  // Handle search input with debouncing
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      updateFilters({ search: localSearchValue })
    }, 500) // 500ms delay

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [localSearchValue])

  const updateFilters = (newFilters: Partial<FilterValues>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
    
    // Count active filters
    let count = 0
    if (updatedFilters.search) count++
    if (updatedFilters.status !== 'all') count++
    if (updatedFilters.category !== 'all') count++
    if (updatedFilters.role !== 'all') count++
    if (updatedFilters.isActive !== null) count++
    if (updatedFilters.dateFrom || updatedFilters.dateTo) count++
    if (config.showPriceFilter && (updatedFilters.priceMin > (config.priceRange?.min || 0) || updatedFilters.priceMax < (config.priceRange?.max || 1000))) count++
    
    setActiveFiltersCount(count)
  }

  const clearAllFilters = () => {
    const clearedFilters: FilterValues = {
      search: '',
      status: 'all',
      category: 'all',
      role: 'all',
      priceMin: config.priceRange?.min || 0,
      priceMax: config.priceRange?.max || 1000,
      dateFrom: undefined,
      dateTo: undefined,
      isActive: null,
      customValues: {}
    }
    setFilters(clearedFilters)
    setLocalSearchValue('')
    onFilterChange(clearedFilters)
    setActiveFiltersCount(0)
  }

  return (
    <Card className="mb-6 bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <CardTitle className="flex gap-2 items-center text-white">
              <Filter className="w-5 h-5" />
              Search & Filters
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-cyan-500/20 text-cyan-400">
                {activeFiltersCount} Active Filters
              </Badge>
            )}
          </div>
          <div className="flex gap-2 items-center">
            {totalCount > 0 && (
              <div className="text-sm text-gray-400">
                Showing {filteredCount} of {totalCount}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-300 hover:text-white hover:bg-white/10"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {isExpanded ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search Bar - Always Visible */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="search" className="text-gray-300">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-gray-500" />
              <Input
                id="search"
                placeholder={config.searchPlaceholder || "Search..."}
                value={localSearchValue}
                onChange={(e) => setLocalSearchValue(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:bg-white/[0.15]"
              />
            </div>
          </div>
          
          <div className="flex gap-2 items-end">
            {onRefresh && (
              <Button
                onClick={onRefresh}
                variant="outline"
                size="sm"
                disabled={loading}
                className="bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Refresh
              </Button>
            )}
            
            {onExport && (
              <Button
                onClick={onExport}
                variant="outline"
                size="sm"
                className="bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            )}
            
            {activeFiltersCount > 0 && (
              <Button
                onClick={clearAllFilters}
                variant="outline"
                size="sm"
                className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300"
              >
                <X className="w-4 h-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        {isExpanded && (
          <>
            <Separator />
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* Status Filter */}
              {config.statusOptions && (
                <div>
                  <Label className="text-gray-300">Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value: string) => updateFilters({ status: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-cyan-500/50 focus:ring-cyan-500/20">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/20 text-white">
                      <SelectItem value="all" className="focus:bg-white/10 focus:text-white">All Statuses</SelectItem>
                      {config.statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="focus:bg-white/10 focus:text-white">
                          <div className="flex justify-between items-center w-full">
                            <span>{option.label}</span>
                            {option.count !== undefined && (
                              <Badge variant="outline" className="ml-2 border-white/20">
                                {option.count}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Category Filter */}
              {config.categoryOptions && (
                <div>
                  <Label className="text-gray-300">Category</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value: string) => updateFilters({ category: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-cyan-500/50 focus:ring-cyan-500/20">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/20 text-white">
                      <SelectItem value="all" className="focus:bg-white/10 focus:text-white">All Categories</SelectItem>
                      {config.categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="focus:bg-white/10 focus:text-white">
                          <div className="flex justify-between items-center w-full">
                            <span>{option.label}</span>
                            {option.count !== undefined && (
                              <Badge variant="outline" className="ml-2 border-white/20">
                                {option.count}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Role Filter */}
              {config.roleOptions && (
                <div>
                  <Label className="text-gray-300">Role</Label>
                  <Select
                    value={filters.role}
                    onValueChange={(value: string) => updateFilters({ role: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-cyan-500/50 focus:ring-cyan-500/20">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/20 text-white">
                      <SelectItem value="all" className="focus:bg-white/10 focus:text-white">All Roles</SelectItem>
                      {config.roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="focus:bg-white/10 focus:text-white">
                          <div className="flex justify-between items-center w-full">
                            <span>{option.label}</span>
                            {option.count !== undefined && (
                              <Badge variant="outline" className="ml-2 border-white/20">
                                {option.count}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Active Status Filter */}
              {config.showActiveFilter && (
                <div>
                  <Label className="text-gray-300">Active Status</Label>
                  <Select
                    value={filters.isActive === null ? 'all' : filters.isActive.toString()}
                    onValueChange={(value: string) => 
                      updateFilters({ 
                        isActive: value === 'all' ? null : value === 'true' 
                      })
                    }
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-cyan-500/50 focus:ring-cyan-500/20">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/20 text-white">
                      <SelectItem value="all" className="focus:bg-white/10 focus:text-white">All</SelectItem>
                      <SelectItem value="true" className="focus:bg-white/10 focus:text-white">Active</SelectItem>
                      <SelectItem value="false" className="focus:bg-white/10 focus:text-white">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Date Range Filter */}
            {config.showDateFilter && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-start font-normal",
                          !filters.dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 w-4 h-4" />
                        {filters.dateFrom ? format(filters.dateFrom, "PPP") : "Select Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-auto">
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom}
                        onSelect={(date) => updateFilters({ dateFrom: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label>To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-start font-normal",
                          !filters.dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 w-4 h-4" />
                        {filters.dateTo ? format(filters.dateTo, "PPP") : "Select Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-auto">
                      <Calendar
                        mode="single"
                        selected={filters.dateTo}
                        onSelect={(date) => updateFilters({ dateTo: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            {/* Price Range Filter */}
            {config.showPriceFilter && config.priceRange && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>Minimum Price</Label>
                  <Input
                    type="number"
                    min={config.priceRange.min}
                    max={config.priceRange.max}
                    value={filters.priceMin}
                    onChange={(e) => updateFilters({ priceMin: Number(e.target.value) })}
                    placeholder={`From ${config.priceRange.min}`}
                  />
                </div>
                
                <div>
                  <Label>Maximum Price</Label>
                  <Input
                    type="number"
                    min={config.priceRange.min}
                    max={config.priceRange.max}
                    value={filters.priceMax}
                    onChange={(e) => updateFilters({ priceMax: Number(e.target.value) })}
                    placeholder={`To ${config.priceRange.max}`}
                  />
                </div>
              </div>
            )}

            {/* Custom Filters */}
            {config.customFilters && config.customFilters.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {config.customFilters.map((customFilter) => (
                  <div key={customFilter.key}>
                    <Label>{customFilter.label}</Label>
                    {customFilter.type === 'select' && customFilter.options && (
                      <Select
                        value={(filters.customValues[customFilter.key] as string | undefined) || ''}
                        onValueChange={(value: string) => 
                          updateFilters({ 
                            customValues: { 
                              ...filters.customValues, 
                              [customFilter.key]: value 
                            } 
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${customFilter.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {customFilter.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {customFilter.type === 'input' && (
                      <Input
                        value={(filters.customValues[customFilter.key] as string | undefined) || ''}
                        onChange={(e) => 
                          updateFilters({ 
                            customValues: { 
                              ...filters.customValues, 
                              [customFilter.key]: e.target.value 
                            } 
                          })
                        }
                        placeholder={customFilter.label}
                      />
                    )}
                    
                    {customFilter.type === 'switch' && (
                      <div className="flex items-center mt-2 space-x-2">
                        <Switch
                          checked={Boolean(filters.customValues[customFilter.key])}
                          onCheckedChange={(checked) => 
                            updateFilters({ 
                              customValues: { 
                                ...filters.customValues, 
                                [customFilter.key]: checked 
                              } 
                            })
                          }
                        />
                        <Label>{customFilter.label}</Label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default AdminFilter

