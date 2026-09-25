import { Mail, MapPin, Phone } from "lucide-react";

import { isBlankish } from "../../utils/accountProductFit.utils";
import {
  getAvatarGradient,
  getInitials,
} from "../../utils/productFitFormatting.utils";

/** Returns "—" for JS null/undefined and for the string "null" from the API. */
function display(value) {
  return isBlankish(value) ? "—" : value;
}

function formatLocation(city, state) {
  const parts = [city, state].filter((v) => !isBlankish(v));
  return parts.length > 0 ? parts.join(", ") : "—";
}

function ContactField({ icon: Icon, children }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 text-xs">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate">{children}</span>
    </div>
  );
}

export function ContactCard({ contact }) {
  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarGradient(contact.name)} text-xs font-bold text-white`}
        >
          {getInitials(contact.name)}
        </div>
        <p className="min-w-0 truncate text-sm">
          <span className="font-semibold text-foreground">
            {display(contact.name)}
          </span>
          {!isBlankish(contact.title) && (
            <span className="text-muted-foreground">
              {" "}
              &middot; {contact.title}
            </span>
          )}
        </p>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 pl-12">
        <ContactField icon={Mail}>
          {!isBlankish(contact.email) ? (
            <a
              href={`mailto:${contact.email}`}
              className="text-dark-blue transition-colors hover:underline"
            >
              {contact.email}
            </a>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </ContactField>

        <ContactField icon={MapPin}>
          <span className="text-foreground">
            {formatLocation(contact.mailing_city, contact.mailing_state)}
          </span>
        </ContactField>

        <ContactField icon={Phone}>
          <span className="text-foreground">{display(contact.phone)}</span>
        </ContactField>
      </div>
    </div>
  );
}
