"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useMe } from "@/app/auth/api/hooks"
import { isPropertyOwner } from "@/lib/scopes"
import { OwnerStatusBanner } from "@/app/dashboard/components/owner-status-banner"

interface BaseLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export function BaseLayout({ children, title, description }: BaseLayoutProps) {
  const { data: me } = useMe();
  const showBanner = me ? isPropertyOwner(me.scopes) || me.scopes.length === 0 : false;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
          "--header-height": "calc(var(--spacing) * 14)",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {showBanner && me && (
                <div className="px-4 lg:px-6">
                  <OwnerStatusBanner scopes={me.scopes} stripeConnected={false} />
                </div>
              )}
              {title && (
                <div className="px-4 lg:px-6">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    {description && (
                      <p className="text-muted-foreground">{description}</p>
                    )}
                  </div>
                </div>
              )}
              {children}
            </div>
          </div>
        </div>
        <SiteFooter />
      </SidebarInset>
    </SidebarProvider>
  )
}
