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
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const propertyParams = {
    ...(ownerOnly && me ? { owner_id: String(me.id) } : {}),
    page: pageIndex + 1,
    page_size: pageSize,
  };
  const { data, isLoading } = useProperties(propertyParams);
  const properties = data?.items ?? [];
  const total = data?.total ?? 0;
  const { data: subscription } = useMySubscription();
  const { mutate: deleteProperty } = useDeleteProperty();

  const maxListings = subscription?.plan.max_listings ?? -1;
  const atQuota = ownerOnly && maxListings !== -1 && total >= maxListings;
  const addDisabledReason = atQuota
    ? `Достигнахте лимита на вашия план (${total}/${maxListings} обекта)`
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
            total={total}
            pageIndex={pageIndex}
            pageSize={pageSize}
            onPaginationChange={(nextPageIndex, nextPageSize) => {
              setPageIndex(nextPageSize !== pageSize ? 0 : nextPageIndex);
              setPageSize(nextPageSize);
            }}
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
