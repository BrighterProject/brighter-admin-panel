"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { BaseLayout } from "@/components/layouts/base-layout";
import { Button } from "@/components/ui/button";
import { StatCards } from "./components/stat-cards";
import { DataTable } from "./components/data-table";
import { PropertyImagesDialog } from "./components/property-images-dialog";
import { PropertyUnavailabilityDialog } from "./components/property-unavailability-dialog";
import { useProperties, useDeleteProperty } from "./hooks";
import type { PropertyListItem } from "./types";
import { useMe } from "@/app/auth/api/hooks";
import { isPropertyOwner } from "@/lib/scopes";

export default function PropertiesPage() {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const ownerOnly = me ? isPropertyOwner(me.scopes) : false;
  const propertyParams = ownerOnly && me ? { owner_id: String(me.id) } : undefined;
  const { data: properties = [], isLoading } = useProperties(propertyParams);
  const { mutate: deleteProperty } = useDeleteProperty();

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
          <div className="flex justify-end mb-4">
            <Button onClick={() => navigate("/properties/new")}>
              <Plus className="mr-2 size-4" />
              Добави обект
            </Button>
          </div>
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
            isAdmin={!ownerOnly}
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
