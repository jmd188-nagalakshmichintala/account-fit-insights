import { Users } from "lucide-react";

import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { useContacts } from "../../hooks/useContacts";
import { ContactsSkeleton } from "../../skeletons/ContactsSkeleton";
import { ContactCard } from "./ContactCard";

export function CustomerContacts({ account }) {
  const {
    data: contacts = [],
    isLoading,
    isError,
    error,
  } = useContacts(account?.id);

  return (
    <QueryBoundary
      isLoading={isLoading}
      isError={isError}
      error={error}
      skeleton={<ContactsSkeleton />}
      errorTitle="Failed to load contacts"
    >
      {contacts.length === 0 ? (
        <StatusMessage
          variant="empty"
          icon={<Users className="h-5 w-5 shrink-0" />}
          message="No contacts found for this account."
        />
      ) : (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Contacts
              </h3>
            </div>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {contacts.length}
            </span>
          </div>

          <div className="divide-y divide-border">
            {contacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        </div>
      )}
    </QueryBoundary>
  );
}
