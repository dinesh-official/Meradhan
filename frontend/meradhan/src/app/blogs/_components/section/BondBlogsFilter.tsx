import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import React from 'react'

const BondBlogsFilter = () => {
  return (
     <div className="mb-4 flex items-center justify-between gap-3">
      {/* Left: Category */}
      <Select>
        <SelectTrigger className="w-48 rounded-md">
          <SelectValue placeholder="All Articles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Articles</SelectItem>
          <SelectItem value="bonds">Bonds News</SelectItem>
          <SelectItem value="markets">Markets</SelectItem>
          <SelectItem value="policy">Policy</SelectItem>
        </SelectContent>
      </Select>

      {/* Right: Sort By */}
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline text-sm text-muted-foreground">
          Sort By :
        </span>
        <Select>
          <SelectTrigger className="w-44 rounded-md bg-blue-50 text-blue-700 border-0">
            <SelectValue placeholder="Latest" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="popular">Most Viewed</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default BondBlogsFilter