import { BadgeCheck, Clock, AlertCircle, XCircle, Loader2 } from "lucide-react";
import { BaseLayout } from "@/components/layouts/base-layout";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAllSubscriptions, type OwnerSubscription } from "./hooks";

const STATUS_CONFIG: Record<
  OwnerSubscription["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }
> = {
  active: { label: "Active", variant: "default", icon: BadgeCheck },
  trialing: { label: "Trialing", variant: "outline", icon: Clock },
  past_due: { label: "Past due", variant: "destructive", icon: AlertCircle },
  cancelled: { label: "Cancelled", variant: "secondary", icon: XCircle },
  incomplete: { label: "Incomplete", variant: "secondary", icon: Clock },
};

function StatusBadge({ status }: { status: OwnerSubscription["status"] }) {
  const { label, variant, icon: Icon } = STATUS_CONFIG[status] ?? STATUS_CONFIG.incomplete;
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="size-3" />
      {label}
    </Badge>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("bg-BG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(cents: number) {
  if (cents === 0) return "По договаряне";
  return `€${(cents / 100).toFixed(2)} / мес.`;
}

export default function SubscriptionsPage() {
  const { data: subscriptions, isLoading, isError } = useAllSubscriptions();

  return (
    <BaseLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Абонаменти на собственици</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Преглед на всички активни и минали абонаменти.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Всички абонаменти</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="size-4 animate-spin" />
                Зареждане…
              </div>
            )}
            {isError && (
              <p className="text-sm text-destructive py-4">
                Грешка при зареждане на абонаментите.
              </p>
            )}
            {!isLoading && !isError && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Owner ID</TableHead>
                    <TableHead>План</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Макс. обекти</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Следващо плащане</TableHead>
                    <TableHead>Отказан на</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(subscriptions ?? []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                        Няма абонаменти.
                      </TableCell>
                    </TableRow>
                  )}
                  {(subscriptions ?? []).map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-mono text-xs">
                        {sub.owner_id.slice(0, 8)}…
                      </TableCell>
                      <TableCell className="font-medium">{sub.plan.name}</TableCell>
                      <TableCell>{formatPrice(sub.plan.price_eur_cents)}</TableCell>
                      <TableCell>
                        {sub.plan.max_listings === -1 ? "∞" : sub.plan.max_listings}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={sub.status} />
                      </TableCell>
                      <TableCell>{formatDate(sub.current_period_end)}</TableCell>
                      <TableCell>{formatDate(sub.cancelled_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  );
}
