'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

export function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [10, 20, 50],
  itemLabel = 'مورد',
  className,
}: PaginationBarProps) {
  if (totalItems === 0) {
    return null;
  }

  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);

  const startItem = (safeCurrentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(safeCurrentPage * itemsPerPage, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];

    if (safeTotalPages <= 7) {
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (safeCurrentPage > 3) {
        pages.push('ellipsis');
      }

      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(safeTotalPages - 1, safeCurrentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (safeCurrentPage < safeTotalPages - 2) {
        pages.push('ellipsis');
      }

      pages.push(safeTotalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border select-none text-xs text-muted-foreground',
        className
      )}
      dir="rtl"
    >
      {/* Right / Left Info: Items range & Items per page dropdown */}
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        {/* Items range counter (Strictly English numbers) */}
        <div className="text-foreground font-medium">
          نمایش{' '}
          <span className="font-bold text-cyan-600 dark:text-cyan-400">
            {startItem}
          </span>{' '}
          الی{' '}
          <span className="font-bold text-cyan-600 dark:text-cyan-400">
            {endItem}
          </span>{' '}
          از{' '}
          <span className="font-bold text-foreground">{totalItems}</span>{' '}
          {itemLabel}
        </div>

        {/* Page size dropdown */}
        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5">
            <span>تعداد در صفحه:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="h-8 px-2 rounded-lg bg-background border border-border text-xs font-bold text-foreground focus:outline-none focus:border-cyan-500 cursor-pointer shadow-xs"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page navigation controls */}
      <div className="flex items-center gap-1 self-center sm:self-auto">
        {/* First Page Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={safeCurrentPage === 1}
          className="h-8 w-8 rounded-lg border-border bg-background hover:bg-muted text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          title="صفحه اول"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>

        {/* Previous Page Button (In RTL, ChevronRight points to the previous page) */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1}
          className="h-8 w-8 rounded-lg border-border bg-background hover:bg-muted text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          title="صفحه قبلی"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Mobile Page Indicator (Small screens) */}
        <div className="sm:hidden px-3 py-1 text-xs font-bold text-foreground">
          {safeCurrentPage} / {safeTotalPages}
        </div>

        {/* Desktop Numbered Page Buttons (Medium and large screens) */}
        <div className="hidden sm:flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-8 flex items-center justify-center text-muted-foreground select-none"
                >
                  ...
                </span>
              );
            }

            const isCurrent = p === safeCurrentPage;

            return (
              <Button
                key={p}
                variant={isCurrent ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(p)}
                className={cn(
                  'h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold transition-all',
                  isCurrent
                    ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 border-cyan-500 shadow-md shadow-cyan-500/20'
                    : 'border-border bg-background hover:bg-muted text-foreground'
                )}
              >
                {p}
              </Button>
            );
          })}
        </div>

        {/* Next Page Button (In RTL, ChevronLeft points to the next page) */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage === safeTotalPages}
          className="h-8 w-8 rounded-lg border-border bg-background hover:bg-muted text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          title="صفحه بعدی"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Last Page Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(safeTotalPages)}
          disabled={safeCurrentPage === safeTotalPages}
          className="h-8 w-8 rounded-lg border-border bg-background hover:bg-muted text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          title="صفحه آخر"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
