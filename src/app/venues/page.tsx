"use client";

import { useState } from "react";
import { BaseLayout } from "@/components/layouts/base-layout";
import { StatCards } from "./components/stat-cards";
import { DataTable } from "./components/data-table";
import { VenueImagesDialog } from "./components/venue-images-dialog";
import { VenueUnavailabilityDialog } from "./components/venue-unavailability-dialog";
import { useVenues, useDeleteVenue } from "./hooks";
import type { VenueListItem } from "./types";

export default function VenuesPage() {
  const { data: venues = [], isLoading } = useVenues();
  const { mutate: deleteVenue } = useDeleteVenue();

  // Dialog states for direct access from page
  const [imagesVenue, setImagesVenue] = useState<VenueListItem | null>(null);
  const [unavailabilityVenue, setUnavailabilityVenue] =
    useState<VenueListItem | null>(null);

  return (
    <BaseLayout
      title="Обекти"
      description="Управлявайте обектите, локациите и съоръженията"
    >
      <div className="flex flex-col gap-4">
        <div className="@container/main px-4 lg:px-6">
          <StatCards venues={venues} loading={isLoading} />
        </div>
        <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
          <DataTable
            venues={venues}
            loading={isLoading}
            onDeleteVenue={deleteVenue}
          />
        </div>
      </div>

      {/* Global dialogs that can be opened from anywhere */}
      <VenueImagesDialog
        venue={imagesVenue}
        onClose={() => setImagesVenue(null)}
      />
      <VenueUnavailabilityDialog
        venue={unavailabilityVenue}
        onClose={() => setUnavailabilityVenue(null)}
      />
    </BaseLayout>
  );
}
