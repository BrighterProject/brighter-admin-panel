# Connecting external calendars (iCal / ICS)

This guide explains how a property owner links a **Booking.com** or **Airbnb**
calendar to a Brighter property so the same night is never sold twice.

## How it works (read this first)

Brighter's calendar sync is **import-only**:

- We **read** reservations from the channel's iCal export and mirror them onto the
  property as read-only blocked dates. An imported reservation blocks the dates for
  new Brighter bookings automatically.
- We **never** push availability or bookings back to Booking.com / Airbnb. You keep
  managing availability and pricing on each channel exactly as you do today.
- Imported bookings are read-only inside Brighter — you cannot confirm, cancel, or
  edit them from the bookings screen. Their lifecycle (create / date change /
  cancellation) is driven entirely by the source calendar on the next sync.

A background job re-syncs every active feed roughly every 10 minutes. You can also
force an immediate sync with the **"Синхронизирай"** button.

> **One export = one property.** Connect the iCal export of a **single room / unit**
> to the matching Brighter property. If a listing on the channel represents several
> units, export and connect each unit separately.

## Where to find the section in the admin panel

1. Open **Обекти** (Properties) and edit the property you want to sync.
   - The property must be **saved first** — external calendars are only available in
     edit mode. On a brand-new, unsaved property you'll see a "save first" note.
2. Scroll to the **"Синхронизация с външен календар"** (External calendar sync)
   section of the property form.

Only property owners (scope `bookings:manage`) and admins can manage feeds, and only
for properties they own.

## Getting the iCal export URL

### Booking.com

1. Log in to the **Booking.com Extranet** for the property.
2. Go to **Rates & Availability → Calendar** (or **Sync calendars**).
3. Under **Export calendar**, copy the iCal URL for the room you want to sync. It
   looks like:

   ```
   https://admin.booking.com/hotel/hoteladmin/ical.html?t=<token>
   ```

### Airbnb

1. Log in to Airbnb and open **Menu → Listings**, then select the listing.
2. Open the **Availability** tab and find **Connect calendars → Export calendar**.
3. Copy the export link. It looks like:

   ```
   https://www.airbnb.com/calendar/ical/<listingId>.ics?s=<token>
   ```

Treat these URLs as secrets — anyone with the link can read your reservation dates.

## Adding a feed in Brighter

1. In the **"Синхронизация с външен календар"** section, pick the channel from the
   dropdown (**Booking.com** or **Airbnb**).
2. Paste the export URL into the address field. The placeholder shows the expected
   shape for the selected channel.
3. Click **"Добави календар"** (Add calendar).

Validation rules enforced on save:

- The URL must use **https**.
- The host must belong to the selected channel's domain
  (`*.booking.com` for Booking.com, `*.airbnb.com` for Airbnb). A mismatched URL —
  e.g. an Airbnb link while **Booking.com** is selected — is rejected. Pick the
  matching channel.

Once added, the feed appears in the list with a channel badge, a sync-status badge,
and the last-synced timestamp.

## Managing feeds

- **Синхронизирай** (Sync now) — fetches and reconciles the feed immediately instead
  of waiting for the next background sweep.
- **Trash icon** (Премахни календар) — removes the feed. Existing imported bookings
  are left in place; they simply stop being refreshed.

### Status badges

| Badge | Meaning |
|-------|---------|
| **Още не е синхронизиран** | Feed added but not yet synced. |
| **OK** (green) | Last sync succeeded. |
| **Грешка при сваляне** | Fetch error — the URL was unreachable, timed out, or failed a security check. Hover for detail. |
| **Грешка при обработка** | Parse error — the downloaded file was not valid iCal. |

On any error the sync **fails safe**: previously imported reservations are kept
(a date is never freed just because a fetch failed), and the feed is retried on the
next sweep.

## Troubleshooting

- **"Feed URL host is not allowed for channel '…'"** — the URL's domain doesn't match
  the selected channel. Re-check the dropdown and paste the correct export link.
- **"Feed URL must use https"** — copy the full `https://…` link; `http` links are
  rejected.
- **Грешка при сваляне right after adding** — the export link may have expired or been
  regenerated on the channel. Re-copy a fresh export URL and update the feed.
- **A channel reservation overlaps a Brighter booking** — the reservation is still
  imported (it reflects reality); the overlap is logged and counted so it can be
  reconciled manually. Cancel or move one of the two bookings on the relevant side.

## Adding more channels (for developers)

The parser and sync engine are channel-agnostic. A new channel needs only:

1. a new member in `BookingChannel` (`brighter-bookings-ms/app/models.py`);
2. a `ChannelSpec` entry (display label + host allowlist) in
   `brighter-bookings-ms/app/channels.py`;
3. a matching entry in the admin panel `CHANNELS` map in
   `channel-sync-section.tsx` (label + placeholder) and the `FeedChannel` type.

No parser, CRUD, or sync-engine changes are required.
