"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BaseLayout } from "@/components/layouts/base-layout";
import { StatCards } from "./components/stat-cards";
import { DataTable } from "./components/data-table";
import { PropertyImagesDialog } from "./components/property-images-dialog";
import { PropertyUnavailabilityDialog } from "./components/property-unavailability-dialog";
import { useProperties, useDeleteProperty } from "./hooks";
import type { PropertyListItem } from "./types";
import { useMe } from "@/app/auth/api/hooks";
import { isPropertyOwner } from "@/lib/scopes";
import { useMySubscription } from "@/app/settings/subscriptions/hooks";

export default function PropertiesPage() {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const ownerOnly = me ? isPropertyOwner(me.scopes) : false;
  const propertyParams = ownerOnly && me ? { owner_id: String(me.id) } : undefined;
  const { data: properties = [], isLoading } = useProperties(propertyParams);
  const { data: subscription } = useMySubscription();
  const { mutate: deleteProperty } = useDeleteProperty();

  const maxListings = subscription?.plan.max_listings ?? -1;
  const atQuota = ownerOnly && maxListings !== -1 && properties.length >= maxListings;
  const addDisabledReason = atQuota
    ? `Достигнахте лимита на вашия план (${properties.length}/${maxListings} обекта)`
    : undefined;

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
            onEditProperty={(property) =>
              navigate(`/properties/${property.id}/edit`)
            }
            onAddProperty={() => navigate("/properties/new")}
            isAdmin={!ownerOnly}
            addDisabledReason={addDisabledReason}
          />
        </div>
      </div>

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
