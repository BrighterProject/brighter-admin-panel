"use client";

import { Navigate } from "react-router-dom";
import { BaseLayout } from "@/components/layouts/base-layout";
import { StatCards } from "./components/stat-cards";
import { DataTable } from "./components/data-table";
import { useDeleteUser, useUpdateScopes, useUsers } from "./hooks";
import { useMe } from "@/app/auth/api/hooks";
import { isAdmin } from "@/lib/scopes";

export default function UsersPage() {
  const { data: me, isLoading: meLoading } = useMe();
  const { data: users = [], isLoading } = useUsers();

  if (!meLoading && me && !isAdmin(me.scopes)) {
    return <Navigate to="/errors/forbidden" replace />;
  }
  const { mutate: deleteUser } = useDeleteUser();
  const { mutate: updateScopes } = useUpdateScopes();

  return (
    <BaseLayout
      title="Потребители"
      description="Управлявайте потребителите и техните права"
    >
      <div className="flex flex-col gap-4">
        <div className="@container/main px-4 lg:px-6">
          <StatCards users={users} loading={isLoading} />
        </div>
        <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
          <DataTable
            users={users}
            loading={isLoading}
            onDeleteUser={deleteUser}
            onUpdateScopes={(id, scopes) => updateScopes({ id, scopes })}
          />
        </div>
      </div>
    </BaseLayout>
  );
}
