"use client"

import { useState } from 'react'
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
    onFilterChange(clearedFilters)
    setActiveFiltersCount(0)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <CardTitle className="flex gap-2 items-center">
              <Filter className="w-5 h-5" />
              Search & Filters
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} Active Filters
              </Badge>
            )}
          </div>
          <div className="flex gap-2 items-center">
            {totalCount > 0 && (
              <div className="text-sm text-muted-foreground">
                Showing {filteredCount} of {totalCount}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
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
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                placeholder={config.searchPlaceholder || "Search..."}
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="pl-10"
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
                  <Label>Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value: string) => updateFilters({ status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {config.statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex justify-between items-center w-full">
                            <span>{option.label}</span>
                            {option.count !== undefined && (
                              <Badge variant="outline" className="ml-2">
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
                  <Label>Category</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value: string) => updateFilters({ category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {config.categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex justify-between items-center w-full">
                            <span>{option.label}</span>
                            {option.count !== undefined && (
                              <Badge variant="outline" className="ml-2">
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
                  <Label>Role</Label>
                  <Select
                    value={filters.role}
                    onValueChange={(value: string) => updateFilters({ role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {config.roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex justify-between items-center w-full">
                            <span>{option.label}</span>
                            {option.count !== undefined && (
                              <Badge variant="outline" className="ml-2">
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
                  <Label>Active Status</Label>
                  <Select
                    value={filters.isActive === null ? 'all' : filters.isActive.toString()}
                    onValueChange={(value: string) => 
                      updateFilters({ 
                        isActive: value === 'all' ? null : value === 'true' 
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
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
                          "w-full justify-start text-left font-normal",
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
                          "w-full justify-start text-left font-normal",
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

