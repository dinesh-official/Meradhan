"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SearchBox({ category }: { category?: string }) {
  const [value, setValue] = useState("");

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      console.log("Search submitted:", value); // your search logic
      if (value) {
        window.location.href = `/blog${
          category ? `/category/${category}` : ""
        }?search=${value}`;
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild className="fixed right-0">
        <Button variant="secondary" className="rounded-r-none px-0">
          <Search />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-3">
            <Input
              name="name"
              placeholder="Search..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleEnter}
            />
          </div>

          <button data-dialog-close-btn className="hidden" aria-hidden="true" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
