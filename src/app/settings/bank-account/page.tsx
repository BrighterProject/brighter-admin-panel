"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Landmark, Pencil } from "lucide-react";
import { BaseLayout } from "@/components/layouts/base-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyBankAccount, useUpsertBankAccount } from "./hooks";

export default function BankAccountSettings() {
  const { data: account, isLoading } = useMyBankAccount();
  const upsert = useUpsertBankAccount();

  const [editing, setEditing] = useState(false);
  const [iban, setIban] = useState("");
  const [bic, setBic] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function openEdit() {
    setIban(account?.iban ?? "");
    setBic(account?.bic ?? "");
    setBankName(account?.bank_name ?? "");
    setAccountHolder(account?.account_holder ?? "");
    setError(null);
    setSaved(false);
    setEditing(true);
  }

  useEffect(() => {
    if (!isLoading && !account && !editing) setEditing(true);
  }, [isLoading, account, editing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const ibanClean = iban.trim().replace(/\s/g, "");
    if (!ibanClean || !accountHolder.trim()) {
      setError("IBAN and account holder name are required.");
      return;
    }
    try {
      await upsert.mutateAsync({
        iban: ibanClean,
        bic: bic.trim() || null,
        bank_name: bankName.trim() || null,
        account_holder: accountHolder.trim(),
      });
      setSaved(true);
      setEditing(false);
    } catch {
      setError("Failed to save. Please check the details and try again.");
    }
  }

  return (
    <BaseLayout
      title="Bank Account"
      description="Bank account used for direct transfer bookings"
    >
      <div className="space-y-6 px-4 lg:px-6 max-w-2xl">
        {isLoading ? (
          <Card>
            <CardContent className="space-y-4 py-6">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </CardContent>
          </Card>
        ) : !editing ? (
          /* ── Saved account view ────────────────────────────── */
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-emerald-500" />
                  Bank account saved
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={openEdit}
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
              </div>
              <CardDescription>
                Guests who choose bank transfer will send money to this account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid gap-1">
                <p className="text-muted-foreground">Account holder</p>
                <p className="font-medium">{account?.account_holder}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-muted-foreground">IBAN</p>
                <p className="font-mono">{account?.iban}</p>
              </div>
              {account?.bic && (
                <div className="grid gap-1">
                  <p className="text-muted-foreground">BIC / SWIFT</p>
                  <p className="font-mono">{account.bic}</p>
                </div>
              )}
              {account?.bank_name && (
                <div className="grid gap-1">
                  <p className="text-muted-foreground">Bank</p>
                  <p>{account.bank_name}</p>
                </div>
              )}
              {saved && (
                <p className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                  <CheckCircle2 className="size-3.5" />
                  Saved successfully.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          /* ── Edit / add form ───────────────────────────────── */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="size-5" />
                {account ? "Edit bank account" : "Add bank account"}
              </CardTitle>
              <CardDescription>
                {account
                  ? "Update your bank details. Guests will see the new IBAN from the next booking onwards."
                  : "Add your bank account so guests can pay you via bank transfer. Once saved, you can enable bank transfers on any of your properties."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="iban">IBAN *</Label>
                    <Input
                      id="iban"
                      value={iban}
                      onChange={(e) => setIban(e.target.value)}
                      placeholder="BG80BNBG96611020345678"
                      maxLength={34}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bic">BIC / SWIFT</Label>
                    <Input
                      id="bic"
                      value={bic}
                      onChange={(e) => setBic(e.target.value)}
                      placeholder="BNBGBGSD"
                      maxLength={11}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="account-holder">Account holder name *</Label>
                    <Input
                      id="account-holder"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="Ivan Petrov"
                      maxLength={200}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bank-name">Bank name</Label>
                    <Input
                      id="bank-name"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="DSK Bank"
                      maxLength={100}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <div className="flex gap-2">
                  <Button type="submit" disabled={upsert.isPending}>
                    {upsert.isPending ? "Saving…" : "Save bank account"}
                  </Button>
                  {account && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </BaseLayout>
  );
}
