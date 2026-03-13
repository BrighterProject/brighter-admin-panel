"use client";

import { useState } from "react";
import { BaseLayout } from "@/components/layouts/base-layout";
import { StatCards } from "./components/stat-cards";
import { DataTable } from "./components/data-table";
import { PropertyImagesDialog } from "./components/property-images-dialog";
import { PropertyUnavailabilityDialog } from "./components/property-unavailability-dialog";
import { useProperties, useDeleteProperty } from "./hooks";
import type { PropertyListItem } from "./types";
import { useMe } from "@/app/auth/api/hooks";
import { isPropertyOwner } from "@/lib/scopes";

export default function PropertiesPage() {
  const { data: me } = useMe();
  const ownerOnly = me ? isPropertyOwner(me.scopes) : false;
  const propertyParams = ownerOnly && me ? { owner_id: String(me.id) } : undefined;
  console.log(propertyParams);
  const { data: properties = [], isLoading } = useProperties(propertyParams);
  const { mutate: deleteProperty } = useDeleteProperty();

  // Dialog states for direct access from page
  const [imagesProperty, setImagesProperty] = useState<PropertyListItem | null>(null);
  const [unavailabilityProperty, setUnavailabilityProperty] =
    useState<PropertyListItem | null>(null);

  return (
    <BaseLayout
      title="Обекти"
      description="Управлявайте обектите, локациите и съоръженията"
    >
      <div className="flex flex-col gap-4">
        <div className="@container/main px-4 lg:px-6">
          <StatCards properties={properties} loading={isLoading} />
        </div>
        <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
          <DataTable
            properties={properties}
            loading={isLoading}
            onDeleteProperty={deleteProperty}
            isAdmin={!ownerOnly}
          />
        </div>
      </div>

      {/* Global dialogs that can be opened from anywhere */}
      <PropertyImagesDialog
        property={imagesProperty}
        onClose={() => setImagesProperty(null)}
      />
      <PropertyUnavailabilityDialog
        property={unavailabilityProperty}
        onClose={() => setUnavailabilityProperty(null)}
      />
    </BaseLayout>
  );
}
