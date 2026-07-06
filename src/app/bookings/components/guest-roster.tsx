import { useGuestIdentities } from "../hooks";
import type { GuestIdentity } from "../types";

const genderLabels: Record<string, string> = {
  male: "мъж",
  female: "жена",
  other: "друго",
};

const documentTypeLabels: Record<string, string> = {
  id_card: "лична карта",
  passport: "паспорт",
};

function GuestField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs text-right font-mono break-all">{value}</span>
    </div>
  );
}

function GuestCard({ guest, index }: { guest: GuestIdentity; index: number }) {
  const fullName = [guest.first_name, guest.middle_name, guest.last_name]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="rounded-md border p-3 space-y-1">
      <p className="text-sm font-medium">
        {index + 1}. {fullName}
      </p>
      {guest.date_of_birth && (
        <GuestField label="Дата на раждане" value={guest.date_of_birth} />
      )}
      {guest.gender && (
        <GuestField
          label="Пол"
          value={genderLabels[guest.gender] ?? guest.gender}
        />
      )}
      {guest.citizenship && (
        <GuestField label="Гражданство" value={guest.citizenship} />
      )}
      {guest.document_type && (
        <GuestField
          label="Документ"
          value={documentTypeLabels[guest.document_type] ?? guest.document_type}
        />
      )}
      {guest.document_number && (
        <GuestField label="№ на документ" value={guest.document_number} />
      )}
      {guest.document_issuing_country && (
        <GuestField
          label="Издаден от"
          value={guest.document_issuing_country}
        />
      )}
      {guest.pin_egn && <GuestField label="ЕГН" value={guest.pin_egn} />}
    </div>
  );
}

export function GuestRoster({ bookingId }: { bookingId: string }) {
  const { data, isLoading, isError } = useGuestIdentities(bookingId);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Гости (данни за регистрация)</p>
      {isLoading && (
        <p className="text-sm text-muted-foreground">Зареждане…</p>
      )}
      {isError && (
        <p className="text-sm text-muted-foreground">
          Данните за гостите не могат да бъдат заредени.
        </p>
      )}
      {!isLoading && !isError && (!data || data.length === 0) && (
        <p className="text-sm text-muted-foreground">
          Все още няма попълнени данни за гости.
        </p>
      )}
      {data && data.length > 0 && (
        <div className="space-y-2">
          {data.map((guest, index) => (
            <GuestCard key={guest.id} guest={guest} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
