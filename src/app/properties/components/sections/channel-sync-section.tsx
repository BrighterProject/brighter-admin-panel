import { useState } from "react";
import { Loader2, RefreshCw, Trash2, Plus, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useCalendarFeeds,
  useCreateCalendarFeed,
  useDeleteCalendarFeed,
  useSyncCalendarFeed,
} from "../../hooks";
import type { CalendarFeed, FeedSyncStatus } from "../../types";

interface ChannelSyncSectionProps {
  /** Existing property id — feeds require a saved property (edit mode only). */
  propertyId?: string;
}

const STATUS_LABEL: Record<FeedSyncStatus, string> = {
  ok: "OK",
  fetch_error: "Грешка при сваляне",
  parse_error: "Грешка при обработка",
};

function StatusBadge({ feed }: { feed: CalendarFeed }) {
  if (feed.last_status === null) {
    return (
      <Badge variant="outline" className="text-xs">
        Още не е синхронизиран
      </Badge>
    );
  }
  const ok = feed.last_status === "ok";
  return (
    <Badge
      variant={ok ? "outline" : "destructive"}
      className={ok ? "border-green-500 text-green-600 text-xs" : "text-xs"}
      title={feed.last_error ?? undefined}
    >
      {STATUS_LABEL[feed.last_status]}
    </Badge>
  );
}

function formatSyncedAt(iso: string | null): string {
  if (!iso) return "никога";
  return new Date(iso).toLocaleString("bg-BG", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
  ) {
    const detail = (error as { response?: { data?: { detail?: unknown } } }).response?.data
      ?.detail;
    if (typeof detail === "string") return detail;
  }
  return "Възникна грешка. Опитайте отново.";
}

export function ChannelSyncSection({ propertyId }: ChannelSyncSectionProps) {
  const [url, setUrl] = useState("");
  const feedsQuery = useCalendarFeeds(propertyId);
  const createFeed = useCreateCalendarFeed();
  const deleteFeed = useDeleteCalendarFeed(propertyId ?? "");
  const syncFeed = useSyncCalendarFeed(propertyId ?? "");

  const handleAdd = async () => {
    if (!propertyId || !url.trim()) return;
    try {
      await createFeed.mutateAsync({ property_id: propertyId, url: url.trim() });
      setUrl("");
      toast.success("Календарът е добавен");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleSync = async (feedId: string) => {
    try {
      await syncFeed.mutateAsync(feedId);
      toast.success("Синхронизацията завърши");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (feedId: string) => {
    try {
      await deleteFeed.mutateAsync(feedId);
      toast.success("Календарът е премахнат");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <section id="section-channel-sync" className="space-y-4 scroll-mt-20">
      <div>
        <h3 className="text-base font-semibold">Синхронизация с външен календар</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Импортирайте резервации от Booking.com, за да не се продава един и същ период два
          пъти.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-amber-300/60 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700/40 dark:bg-amber-950/30 dark:text-amber-200">
        <Info className="size-4 shrink-0 mt-0.5" />
        <span>
          Само импорт: наличността в Booking.com продължава да се управлява ръчно от вас.
          Свържете iCal експорта на <strong>една стая</strong> с този обект.
        </span>
      </div>

      {!propertyId ? (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          Запазете обекта, за да добавите външни календари.
        </p>
      ) : (
        <>
          {feedsQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Зареждане…
            </div>
          ) : feedsQuery.data && feedsQuery.data.length > 0 ? (
            <ul className="space-y-2">
              {feedsQuery.data.map((feed) => (
                <li
                  key={feed.id}
                  className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm font-medium" title={feed.url}>
                      {feed.url}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge feed={feed} />
                      <span className="text-xs text-muted-foreground">
                        Последно: {formatSyncedAt(feed.last_synced_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={syncFeed.isPending}
                      onClick={() => handleSync(feed.id)}
                    >
                      {syncFeed.isPending && syncFeed.variables === feed.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <RefreshCw className="size-4" />
                      )}
                      <span className="ml-1.5">Синхронизирай</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      disabled={deleteFeed.isPending}
                      onClick={() => handleDelete(feed.id)}
                      aria-label="Премахни календар"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Няма добавени календари.</p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="url"
              inputMode="url"
              placeholder="https://admin.booking.com/hotel/…/ical.html?t=…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button
              type="button"
              onClick={handleAdd}
              disabled={createFeed.isPending || !url.trim()}
              className="shrink-0"
            >
              {createFeed.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              <span className="ml-1.5">Добави календар</span>
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
