type LoginRequest = {
  email: string;
  password: string;
};

type RegisterRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type LoginResponse = {
  accessToken: string;
  email: string;
  roles: string[];
  tokenType: string;
};


const API_URL = "http://localhost:8080/auth";

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Nieprawidłowy email lub hasło");
  }

  const result: LoginResponse = await response.json();

  localStorage.setItem("accessToken", result.accessToken);
  localStorage.setItem("email", result.email);
  localStorage.setItem("roles", JSON.stringify(result.roles));

  return result;
}

export async function register(data: RegisterRequest): Promise<void> {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Rejestracja nie powiodła się");
  }
}




export async function logout(): Promise<void> {
  try {
    await fetch(`${API_URL}/signout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("email");
    localStorage.removeItem("roles");
  }
}