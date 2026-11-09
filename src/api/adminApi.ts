const API_URL = "http://localhost:8080/user";

async function changeProviderRole(
  action: "add-provider" | "remove-provider",
  email: string
): Promise<void> {
  const response = await fetch(
    `${API_URL}/${action}/${encodeURIComponent(email.trim())}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Nie znaleziono użytkownika o podanym adresie email");
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error("Brak uprawnień administratora");
    }
    throw new Error("Operacja nie powiodła się");
  }
}

export function addProvider(email: string): Promise<void> {
  return changeProviderRole("add-provider", email);
}

export function removeProvider(email: string): Promise<void> {
  return changeProviderRole("remove-provider", email);
}

export function isAdmin(): boolean {
  try {
    const roles: string[] = JSON.parse(localStorage.getItem("roles") ?? "[]");
    return roles.includes("ADMIN");
  } catch {
    return false;
  }
}
