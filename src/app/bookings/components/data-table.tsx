"use client";

import { useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  EllipsisVertical,
  Trash2,
  Loader2,
  Eye,
  Activity,
  Calendar,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { BookingDetailsDialog } from "./booking-details-dialog";
import { BookingStatusDialog } from "./booking-status-dialog";
import type { Booking, BookingStatus } from "../types";
import { useDeleteBooking } from "../hooks";

const statusColors: Record<BookingStatus, string> = {
  pending:
    "text-yellow-700 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20",
  confirmed: "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20",
  completed:
    "text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/20",
  cancelled: "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/20",
  no_show:
    "text-orange-700 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20",
};

const TERMINAL: BookingStatus[] = ["completed", "cancelled", "no_show"];

function fmt(dt: string) {
  return new Date(dt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface DataTableProps {
  bookings: Booking[];
  loading: boolean;
}

export function DataTable({ bookings, loading }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [detailsBooking, setDetailsBooking] = useState<Booking | null>(null);
  const [statusBooking, setStatusBooking] = useState<Booking | null>(null);

  const { mutate: deleteBooking } = useDeleteBooking();

  const columns: ColumnDef<Booking>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center px-2">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center px-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      accessorKey: "venue_id",
      header: "Venue ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.getValue<string>("venue_id").slice(0, 8)}…
        </span>
      ),
    },
    {
      accessorKey: "user_id",
      header: "Customer ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.getValue<string>("user_id").slice(0, 8)}…
        </span>
      ),
    },
    {
      accessorKey: "start_datetime",
      header: "Start",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm">
          <Calendar className="size-3.5 text-muted-foreground" />
          {fmt(row.getValue("start_datetime"))}
        </div>
      ),
    },
    {
      accessorKey: "end_datetime",
      header: "End",
      cell: ({ row }) => (
        <span className="text-sm">{fmt(row.getValue("end_datetime"))}</span>
      ),
    },
    {
      accessorKey: "total_price",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.getValue("total_price")} {row.original.currency}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as BookingStatus;
        return (
          <Badge
            variant="secondary"
            className={`capitalize ${statusColors[status]}`}
          >
            {status.replace("_", " ")}
          </Badge>
        );
      },
      filterFn: (row, columnId, value) => {
        if (value === "" || value === "all") return true;
        return row.getValue(columnId) === value;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const booking = row.original;
        const isTerminal = TERMINAL.includes(booking.status);
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              title="View details"
              onClick={() => setDetailsBooking(booking)}
            >
              <Eye className="size-4" />
              <span className="sr-only">View details</span>
            </Button>
            {!isTerminal && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer"
                title="Change status"
                onClick={() => setStatusBooking(booking)}
              >
                <Activity className="size-4" />
                <span className="sr-only">Change status</span>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer"
                >
                  <EllipsisVertical className="size-4" />
                  <span className="sr-only">More actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setDetailsBooking(booking)}
                >
                  <Eye className="mr-2 size-4" />
                  View Details
                </DropdownMenuItem>
                {!isTerminal && (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => setStatusBooking(booking)}
                  >
                    <Activity className="mr-2 size-4" />
                    Change Status
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => deleteBooking(booking.id)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: bookings,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  const statusFilter = table.getColumn("status")?.getFilterValue() as string;

  return (
    <div className="w-full space-y-4">
      {/* Dialogs */}
      <BookingDetailsDialog
        booking={detailsBooking}
        onClose={() => setDetailsBooking(null)}
      />
      <BookingStatusDialog
        booking={statusBooking}
        onClose={() => setStatusBooking(null)}
      />

      {/* Filters */}
      <div className="grid gap-2 sm:grid-cols-3 sm:gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Status</Label>
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) =>
              table.getColumn("status")?.setFilterValue(value)
            }
          >
            <SelectTrigger className="cursor-pointer w-full">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no_show">No-show</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 flex items-end justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="cursor-pointer">
                Columns <ChevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize"
                    checked={col.getIsVisible()}
                    onCheckedChange={(value) => col.toggleVisibility(!!value)}
                  >
                    {col.id.replace("_", " ")}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <Loader2 className="size-5 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium">Show</Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="w-20 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 text-sm text-muted-foreground hidden sm:block">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium hidden sm:block">
            Page{" "}
            <strong>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </strong>
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="cursor-pointer"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="cursor-pointer"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
