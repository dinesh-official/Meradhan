import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
function BlogPageFIlterOrSort() {
  return (
    <div className="flex justify-between items-center py-5">
      <Select>
        <SelectTrigger className="md:w-[240px] w-44 shadow-none border-1 border-gray-200">
          <SelectValue placeholder="All Articles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger className="md:w-[200px] w-44 shadow-none bg-muted border-0 border-gray-200">
          <SelectValue placeholder="Sort By : Latest" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default BlogPageFIlterOrSort;
