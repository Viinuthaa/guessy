"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export default function AuthPage() {
  const router = useRouter()
  const [login, setLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")

  async function submit() {
    if (!username.trim() || !password) {
      setMessage("Enter your username and password.")
      return
    }

    const endpoint = login ? "login" : "register"

    try {
      const response = await fetch(
        `${API_URL}/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || "Something went wrong.")
        return
      }

      localStorage.setItem("guessy_token", data.token)
      localStorage.setItem(
        "guessy_user",
        JSON.stringify(data.user)
      )

      router.push("/")
    } catch {
      setMessage("Couldn't connect to Guessy.")
    }
  }

  return (
    <main className="detail-page">
      <header className="detail-navbar">
        <Link className="logo" href="/">
          guessy.
        </Link>

        <Link className="back-link" href="/">
          ← Back to markets
        </Link>
      </header>

      <section className="auth-page">
        <p className="eyebrow">
          {login ? "WELCOME BACK" : "JOIN GUESSY"}
        </p>

        <h1>{login ? "Log in." : "Create an account."}</h1>

        <div className="auth-form">
          <label>
            Username
            <input
              value={username}
              onChange={event => setUsername(event.target.value)}
              placeholder="yourusername"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="At least 6 characters"
            />
          </label>

          <button className="primary-button" onClick={submit}>
            {login ? "Log in" : "Create account"}
          </button>

          {message && (
            <p className="trade-message">{message}</p>
          )}
        </div>

        <button
          className="auth-switch"
          onClick={() => {
            setLogin(value => !value)
            setMessage("")
          }}
        >
          {login
            ? "Don't have an account? Create one"
            : "Already have an account? Log in"}
        </button>
      </section>
    </main>
  )
}