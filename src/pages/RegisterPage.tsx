import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { register } from "../api/authApi";
import "../styles/RegisterPage.css";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    try {
      await register({
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
      });

      setMessage("Account created. You can now sign in.");
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed");
      }
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Create account</h1>
        <p>Register a new account.</p>

        <form onSubmit={handleSubmit}>
          <label>
            First name
            <input
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
            />
          </label>

          <label>
            Last name
            <input
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
            />
          </label>

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
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
          </label>

          <button type="submit">Create account</button>
        </form>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <p>
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;