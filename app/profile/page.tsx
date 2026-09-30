"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

type User = {
  username: string
  balance: number
  trades: {
    id: string
    side: string
    amount: number
    price: number
    createdAt: string
    market: {
      question: string
    }
  }[]
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("guessy_token")

    fetch("http://localhost:4000/api/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then(setUser)
  }, [])

  if (!user) return <main className="not-found">Loading...</main>

  return (
    <main className="detail-page">
      <header className="detail-navbar">
        <Link className="logo" href="/">guessy.</Link>
        <Link className="back-link" href="/">← Markets</Link>
      </header>

      <section className="auth-page">
        <p className="eyebrow">YOUR PORTFOLIO</p>
        <h1>{user.username}.</h1>

        <div className="positions">
          <div className="position-row">
            <span>Balance</span>
            <strong>{user.balance} pts</strong>
          </div>

          <div className="position-row">
            <span>Total trades</span>
            <strong>{user.trades.length}</strong>
          </div>
        </div>

        <p className="eyebrow">RECENT TRADES</p>

        {user.trades.length === 0 ? (
          <p>No trades yet.</p>
        ) : (
          user.trades.map(trade => (
            <div className="position-row" key={trade.id}>
              <span>{trade.market.question}</span>
              <strong>{trade.side} · {trade.amount} pts</strong>
            </div>
          ))
        )}
      </section>
    </main>
  )
}