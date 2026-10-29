import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { login } from "../api/authApi";
import "../styles/RegisterPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    try {
      const response = await login({
        email: email,
        password: password,
      });

      localStorage.setItem("token", response.token);
      localStorage.setItem("email", response.email);

      setMessage("Zalogowano pomyślnie.");

      console.log("JWT token:", response.token);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Logowanie nie powiodło się");
      }
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Logowanie</h1>
        <p>Zaloguj się na swoje konto.</p>

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Hasło
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button type="submit">Zaloguj się</button>
        </form>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <p>
          Nie masz konta? <Link to="/signup">Załóż je</Link>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;