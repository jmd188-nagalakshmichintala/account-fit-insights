export function getUserDisplayName(user) {
  return user?.fullName || user?.username || user?.email || "User";
}

export function getUserInitials(user) {
  const value = getUserDisplayName(user);

  const parts = String(value)
    .replace(/@.*/, "")
    .split(/[.\s_-]+/)
    .filter(Boolean);

  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
