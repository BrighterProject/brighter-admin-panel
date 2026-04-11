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
  Download,
  Search,
  Loader2,
  MapPin,
  Building2,
  Star,
  Users,
  Activity,
  Settings2,
  Image as ImageIcon,
  CalendarX,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { PropertyFormDialog } from "./property-form-dialog";
import { PropertyDetailsDialog } from "./property-details-dialog";
import { PropertyEditDialog } from "./property-edit-dialog";
import { PropertyStatusDialog } from "./property-status-dialog";
import { PropertyImagesDialog } from "./property-images-dialog";
import { PropertyUnavailabilityDialog } from "./property-unavailability-dialog";
import type { PropertyListItem, PropertyStatus } from "../types";
import { Eye, Pencil } from "lucide-react";

interface DataTableProps {
  properties: PropertyListItem[];
  loading: boolean;
  onDeleteProperty: (id: string) => void;
  onEditProperty?: (property: PropertyListItem) => void;
  isAdmin: boolean;
}

const statusColors: Record<PropertyStatus, string> = {
  active: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20",
  inactive: "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20",
  maintenance:
    "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20",
  pending_approval:
    "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20",
};

const statusLabels: Record<PropertyStatus, string> = {
  active: "Активен",
  inactive: "Неактивен",
  maintenance: "Профилактика",
  pending_approval: "Чака одобрение",
};

const statusTooltips: Record<PropertyStatus, string> = {
  active: "Обектът е публикуван и приема резервации.",
  inactive: "Обектът е деактивиран и не се показва на клиентите.",
  maintenance:
    "Обектът е временно затворен за профилактика. Не приема нови резервации.",
  pending_approval:
    "Обектът чака одобрение от администратор, преди да бъде публикуван и достъпен за резервации.",
};

const sportTypeLabels: Record<string, string> = {
  football: "Футбол",
  basketball: "Баскетбол",
  tennis: "Тенис",
  volleyball: "Волейбол",
  swimming: "Плуване",
  gym: "Фитнес",
  padel: "Падел",
  other: "Друго",
};

const sportTypeIcons: Record<string, string> = {
  football: "⚽",
  basketball: "🏀",
  tennis: "🎾",
  volleyball: "🏐",
  swimming: "🏊",
  gym: "💪",
  padel: "🎾",
  other: "🏃",
};

export function DataTable({
  properties,
  loading,
  onDeleteProperty,
  onEditProperty,
  isAdmin,
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusProperty, setStatusProperty] = useState<PropertyListItem | null>(null);
  const [detailsProperty, setDetailsProperty] = useState<PropertyListItem | null>(null);
  const [editProperty, setEditProperty] = useState<PropertyListItem | null>(null);
  const [imagesProperty, setImagesProperty] = useState<PropertyListItem | null>(null);
  const [unavailabilityProperty, setUnavailabilityProperty] =
    useState<PropertyListItem | null>(null);

  const columns: ColumnDef<PropertyListItem>[] = [
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
      id: "name",
      header: "Обект",
      cell: ({ row }) => {
        const property = row.original;
        const name =
          property.translations.find((t) => t.locale === "bg")?.name ??
          property.id;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
              {property.thumbnail ? (
                <img
                  src={property.thumbnail}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 className="size-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-medium truncate">{name}</span>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3" />
                <span className="truncate">{property.city}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => {
        const status = row.getValue("status") as PropertyStatus;
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className={`capitalize cursor-help ${statusColors[status]}`}
              >
                {statusLabels[status]}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-56">
              {statusTooltips[status]}
            </TooltipContent>
          </Tooltip>
        );
      },
      filterFn: (row, columnId, value) => {
        if (value === "" || value === "all") return true;
        const status = row.getValue(columnId) as PropertyStatus;
        return status === value;
      },
    },
    {
      accessorKey: "property_type",
      header: "Тип обект",
      cell: ({ row }) => {
        const propertyType = row.getValue("property_type") as string;
        const labels: Record<string, string> = {
          apartment: "Апартамент",
          house: "Къща",
          villa: "Вила",
          hotel: "Хотел",
          hostel: "Хостел",
          guesthouse: "Гостилница",
          room: "Стая",
          other: "Друго",
        };
        return (
          <Badge variant="outline" className="text-xs capitalize">
            {labels[propertyType] ?? propertyType}
          </Badge>
        );
      },
    },
    {
      accessorKey: "price_per_night",
      header: "Цена",
      cell: ({ row }) => {
        const price = row.getValue("price_per_night") as string;
        const currency = row.original.currency;
        return (
          <span className="font-medium">
            {price} {currency}/нощ
          </span>
        );
      },
    },
    {
      accessorKey: "max_guests",
      header: "Макс. гости",
      cell: ({ row }) => {
        const maxGuests = row.getValue("max_guests") as number;
        return (
          <div className="flex items-center gap-1">
            <Users className="size-4 text-muted-foreground" />
            <span>{maxGuests}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "bedrooms",
      header: "Спални",
      cell: ({ row }) => {
        const bedrooms = row.getValue("bedrooms") as number;
        return <span>{bedrooms}</span>;
      },
    },
    {
      accessorKey: "rating",
      header: "Рейтинг",
      cell: ({ row }) => {
        const rating = row.getValue("rating") as string;
        const totalReviews = row.original.total_reviews;
        return (
          <div className="flex items-center gap-1">
            <Star className="size-4 text-amber-500 fill-amber-500" />
            <span className="font-medium">{rating}</span>
            <span className="text-xs text-muted-foreground">
              ({totalReviews})
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Действия",
      cell: ({ row }) => {
        const property = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              title="Управление на снимки"
              onClick={() => setImagesProperty(property)}
            >
              <ImageIcon className="size-4" />
              <span className="sr-only">Управление на снимки</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              title="Управление на заетост"
              onClick={() => setUnavailabilityProperty(property)}
            >
              <CalendarX className="size-4" />
              <span className="sr-only">Управление на заетост</span>
            </Button>
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer"
                title="Промяна на статус"
                onClick={() => setStatusProperty(property)}
              >
                <Activity className="size-4" />
                <span className="sr-only">Промяна на статус</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => setDetailsProperty(property)}
            >
              <Eye className="size-4" />
              <span className="sr-only">Виж детайли</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() =>
                onEditProperty ? onEditProperty(property) : setEditProperty(property)
              }
            >
              <Pencil className="size-4" />
              <span className="sr-only">Редактирай обект</span>
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
                  onClick={() => setImagesProperty(property)}
                >
                  <ImageIcon className="mr-2 size-4" />
                  Управление на снимки
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setUnavailabilityProperty(property)}
                >
                  <CalendarX className="mr-2 size-4" />
                  Управление на заетост
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => setStatusProperty(property)}
                  >
                    <Activity className="mr-2 size-4" />
                    Промяна на статус
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    onEditProperty ? onEditProperty(property) : setEditProperty(property)
                  }
                >
                  <Settings2 className="mr-2 size-4" />
                  Редактиране на детайли
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => onDeleteProperty(property.id)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Изтрий обекта
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: properties,
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

  const statusFilter = table.getColumn("status")?.getFilterValue() as string;
  const typeFilter = table.getColumn("property_type")?.getFilterValue() as string;

  return (
    <div className="w-full space-y-4">
      {/* Диалози */}
      <PropertyStatusDialog
        property={statusProperty}
        onClose={() => setStatusProperty(null)}
      />
      <PropertyDetailsDialog
        property={detailsProperty}
        onClose={() => setDetailsProperty(null)}
        onEditClick={setEditProperty}
      />
      <PropertyEditDialog property={editProperty} onClose={() => setEditProperty(null)} />
      <PropertyImagesDialog
        property={imagesProperty}
        onClose={() => setImagesProperty(null)}
      />
      <PropertyUnavailabilityDialog
        property={unavailabilityProperty}
        onClose={() => setUnavailabilityProperty(null)}
      />

      {/* Лента с инструменти */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Търси обекти..."
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
          <PropertyFormDialog />
        </div>
      </div>

      {/* Филтри */}
      <div className="grid gap-2 sm:grid-cols-3 sm:gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Статус</Label>
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) =>
              table.getColumn("status")?.setFilterValue(value)
            }
          >
            <SelectTrigger className="cursor-pointer w-full">
              <SelectValue placeholder="Всички статуси" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всички статуси</SelectItem>
              <SelectItem value="active">Активни</SelectItem>
              <SelectItem value="inactive">Неактивни</SelectItem>
              <SelectItem value="maintenance">Профилактика</SelectItem>
              <SelectItem value="pending_approval">Чакащи одобрение</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Тип обект</Label>
          <Select
            value={typeFilter || "all"}
            onValueChange={(value) =>
              table.getColumn("property_type")?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="cursor-pointer w-full">
              <SelectValue placeholder="Всички типове" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всички типове</SelectItem>
              <SelectItem value="apartment">Апартамент</SelectItem>
              <SelectItem value="house">Къща</SelectItem>
              <SelectItem value="villa">Вила</SelectItem>
              <SelectItem value="hotel">Хотел</SelectItem>
              <SelectItem value="hostel">Хостел</SelectItem>
              <SelectItem value="guesthouse">Гостилница</SelectItem>
              <SelectItem value="room">Стая</SelectItem>
              <SelectItem value="other">Друго</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Видимост на колоните</Label>
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
                    {col.id === "name"
                      ? "Обект"
                      : col.id === "status"
                        ? "Статус"
                        : col.id === "property_type"
                          ? "Тип обект"
                          : col.id === "price_per_night"
                            ? "Цена"
                            : col.id === "max_guests"
                              ? "Макс. гости"
                              : col.id === "bedrooms"
                                ? "Спални"
                                : col.id === "rating"
                                  ? "Рейтинг"
                                  : col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Таблица */}
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
                  Няма намерени резултати.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Списък със страници (Pagination) */}
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
          Избрани са {table.getFilteredSelectedRowModel().rows.length} от{" "}
          {table.getFilteredRowModel().rows.length} реда.
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
