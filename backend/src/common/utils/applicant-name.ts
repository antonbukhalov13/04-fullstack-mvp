export function resolveDisplayName(
  user: { name: string | null; phone: string },
  application?: { firstName: string | null; lastName: string | null; companyName: string | null } | null,
): string | null {
  if (user.name) return user.name;
  if (application) {
    if (application.companyName) return application.companyName;
    const fullName = [application.firstName, application.lastName].filter(Boolean).join(' ');
    if (fullName) return fullName;
  }
  return null;
}
