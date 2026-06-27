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
  ShieldCheck,
  Trash2,
  Download,
  Search,
  Loader2,
  UserCheck,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Input } from "@/components/ui/input";
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
import { UserFormDialog } from "./user-form-dialog";
import type { User } from "../types";
import { Eye, Pencil } from "lucide-react";
import { UserDetailsDialog } from "./user-details-dialog";
import { UserEditDialog } from "./user-edit-dialog";
import { ScopeEditorDialog } from "./scope-edit-dialog";
import { OWNER_SCOPES, useUpdateScopes } from "../hooks";

interface DataTableProps {
  users: User[];
  loading: boolean;
  onDeleteUser: (id: string) => void;
  onUpdateScopes: (id: string, scopes: string[]) => void;
}

function getAvatarFallback(user: User) {
  const name = user.full_name ?? user.username;
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase();
}

export function DataTable({
  users,
  loading,
  onDeleteUser,
  onUpdateScopes,
}: DataTableProps) {
  const { mutate: escalateScopes } = useUpdateScopes();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [scopeUser, setScopeUser] = useState<User | null>(null);
  const [detailsUser, setDetailsUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);

  const columns: ColumnDef<User>[] = [
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
            aria-label="Избери всички"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center px-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Избери ред"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      accessorKey: "username",
      header: "Потребител",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs font-medium">
                {getAvatarFallback(user)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">
                {user.full_name ?? user.username}
              </span>
              <span className="text-sm text-muted-foreground">
                @{user.username}
              </span>
              {user.email && (
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Статус",
      cell: ({ row }) => {
        const active = row.getValue("is_active") as boolean;
        return (
          <Badge
            variant="secondary"
            className={
              active
                ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
                : "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
            }
          >
            {active ? "Активен" : "Неактивен"}
          </Badge>
        );
      },
      filterFn: (row, columnId, value) => {
        if (value === "") return true;
        const active = row.getValue(columnId) as boolean;
        return value === "active" ? active : !active;
      },
    },
    {
      accessorKey: "scopes",
      header: "Права",
      cell: ({ row }) => {
        const scopes = row.getValue("scopes") as string[];
        const list = Array.isArray(scopes) ? (scopes as string[]) : [];
        if (list.length === 0)
          return <span className="text-muted-foreground text-sm">Няма</span>;
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {list.slice(0, 3).map((s) => (
              <Badge key={s} variant="outline" className="text-xs font-mono">
                {s}
              </Badge>
            ))}
            {list.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{list.length - 3}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Регистриран",
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string;
        return (
          <span className="text-sm text-muted-foreground">
            {new Date(date).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Действия",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              title="Управление на права"
              onClick={() => setScopeUser(user)}
            >
              <ShieldCheck className="size-4" />
              <span className="sr-only">Управление на права</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => setDetailsUser(user)}
            >
              <Eye className="size-4" />
              <span className="sr-only">Детайли</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => setEditUser(user)}
            >
              <Pencil className="size-4" />
              <span className="sr-only">Редактирай</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer"
                >
                  <EllipsisVertical className="size-4" />
                  <span className="sr-only">Още действия</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setScopeUser(user)}
                >
                  <ShieldCheck className="mr-2 size-4" />
                  Управление на права
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    const current = Array.isArray(user.scopes)
                      ? (user.scopes as string[])
                      : [];
                    const merged = Array.from(
                      new Set([...current, ...OWNER_SCOPES]),
                    );
                    escalateScopes({ id: user.id, scopes: merged });
                  }}
                >
                  <UserCheck className="mr-2 size-4" />
                  Ескалирай до собственик
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => onDeleteUser(user.id)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Изтрий потребител
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const statusFilter = table.getColumn("is_active")?.getFilterValue() as string;

  return (
    <div className="w-full space-y-4">
      {/* Scope editor dialog */}
      <ScopeEditorDialog
        user={scopeUser}
        onClose={() => setScopeUser(null)}
        onSave={onUpdateScopes}
      />
      <UserDetailsDialog
        user={detailsUser}
        onClose={() => setDetailsUser(null)}
        onEditClick={setEditUser}
      />
      <UserEditDialog user={editUser} onClose={() => setEditUser(null)} />

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Търсене на потребители..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(String(e.target.value))}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="cursor-pointer">
            <Download className="mr-2 size-4" />
            Експорт
          </Button>
          <UserFormDialog />
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-2 sm:grid-cols-3 sm:gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Статус</Label>
          <Select
            value={statusFilter || ""}
            onValueChange={(value) =>
              table
                .getColumn("is_active")
                ?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="cursor-pointer w-full">
              <SelectValue placeholder="Всички статуси" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всички статуси</SelectItem>
              <SelectItem value="active">Активен</SelectItem>
              <SelectItem value="inactive">Неактивен</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-start-3">
          <Label className="text-sm font-medium">Видимост на колони</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="cursor-pointer w-full">
                Колони <ChevronDown className="ml-2 size-4" />
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
                    {col.id}
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
                  Няма резултати.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium">Покажи</Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="w-20 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 text-sm text-muted-foreground hidden sm:block">
          {table.getFilteredSelectedRowModel().rows.length} от{" "}
          {table.getFilteredRowModel().rows.length} избран(и) ред(ове).
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium hidden sm:block">
            Страница{" "}
            <strong>
              {table.getState().pagination.pageIndex + 1} от{" "}
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
            Предишна
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="cursor-pointer"
          >
            Следваща
          </Button>
        </div>
      </div>
    </div>
  );
}
