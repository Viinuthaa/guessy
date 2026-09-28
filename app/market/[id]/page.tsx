"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

type Market = {
  id: string
  question: string
  description: string | null
  closesAt: string
  yesPrice: number
  noPrice: number
}

export default function MarketPage() {
  const params = useParams()
  const [market, setMarket] = useState<Market | null>(null)
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(1000)
  const [side, setSide] = useState<"YES" | "NO">("YES")
  const [amount, setAmount] = useState("")
  const [position, setPosition] = useState({ YES: 0, NO: 0 })
  const [prices, setPrices] = useState({ YES: 50, NO: 50 })
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function loadMarket() {
      try {
        const response = await fetch(
          `http://localhost:4000/api/markets/${params.id}`
        )

        if (response.ok) {
          const data = await response.json()
          setMarket(data)
          setPrices({
            YES: data.yesPrice,
            NO: data.noPrice,
          })
        }
      } finally {
        setLoading(false)
      }
    }

    loadMarket()
  }, [params.id])

  async function placeTrade() {
    const points = Number(amount)

    if (!points || points <= 0) {
      setMessage("Enter a valid amount.")
      return
    }

    if (points > balance) {
      setMessage("You don't have enough points.")
      return
    }

    try {
      const response = await fetch(
        `http://localhost:4000/api/markets/${params.id}/trades`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            side,
            amount: points,
            price: prices[side],
          }),
        }
      )

      if (!response.ok) {
        throw new Error()
      }

      const priceChange = Math.min(
        8,
        Math.max(1, Math.round(points / 50))
      )

      setBalance((value) => value - points)

      setPosition((value) => ({
        ...value,
        [side]: value[side] + points,
      }))

      setPrices((value) => {
        const direction = side === "YES" ? 1 : -1
        const yes = Math.max(
          5,
          Math.min(95, value.YES + direction * priceChange)
        )

        return {
          YES: yes,
          NO: 100 - yes,
        }
      })

      setAmount("")
      setMessage(`You placed ${points} points on ${side}.`)
    } catch {
      setMessage("Couldn't place trade.")
    }
  }

  if (loading) {
    return (
      <main className="not-found">
        <p>Loading market...</p>
      </main>
    )
  }

  if (!market) {
    return (
      <main className="not-found">
        <p className="eyebrow">MARKET NOT FOUND</p>
        <h1>This market doesn't exist.</h1>
      </main>
    )
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

      <section className="market-detail">
        <div className="detail-main">
          <p className="eyebrow">LIVE MARKET</p>

          <h1>{market.question}</h1>

          {market.description && (
            <p className="detail-description">
              {market.description}
            </p>
          )}

          <p className="detail-closing">
            Closes {new Date(market.closesAt).toLocaleDateString()}
          </p>

          <div className="probability-section">
            <div className="probability-row">
              <div>
                <span>YES</span>
                <strong>{Math.round(prices.YES)}%</strong>
              </div>

              <div>
                <span>NO</span>
                <strong>{Math.round(prices.NO)}%</strong>
              </div>
            </div>

            <div className="probability-bar">
              <div style={{ width: `${prices.YES}%` }} />
            </div>
          </div>

          <div className="positions">
            <p className="eyebrow">YOUR POSITIONS</p>

            <div className="position-row">
              <span>YES</span>
              <strong>{position.YES} pts</strong>
            </div>

            <div className="position-row">
              <span>NO</span>
              <strong>{position.NO} pts</strong>
            </div>
          </div>
        </div>

        <aside className="trade-panel">
          <p className="eyebrow">MAKE YOUR GUESS</p>

          <h2>Where do you stand?</h2>

          <div className="balance">
            <span>Your balance</span>
            <strong>{balance} pts</strong>
          </div>

          <div className="trade-options">
            <button
              className={`trade-option ${
                side === "YES" ? "selected" : ""
              }`}
              onClick={() => {
                setSide("YES")
                setMessage("")
              }}
            >
              <span>YES</span>
              <strong>{Math.round(prices.YES)}%</strong>
            </button>

            <button
              className={`trade-option ${
                side === "NO" ? "selected" : ""
              }`}
              onClick={() => {
                setSide("NO")
                setMessage("")
              }}
            >
              <span>NO</span>
              <strong>{Math.round(prices.NO)}%</strong>
            </button>
          </div>

          <label className="amount-label">
            Points

            <input
              className="amount-input"
              type="number"
              min="1"
              max={balance}
              placeholder="100"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value)
                setMessage("")
              }}
            />
          </label>

          <div className="trade-summary">
            <span>Selected</span>
            <strong>{side}</strong>

            <span>Current probability</span>
            <strong>{Math.round(prices[side])}%</strong>

            <span>Amount</span>
            <strong>{amount ? `${amount} pts` : "—"}</strong>
          </div>

          <button
            className="primary-button trade-button"
            onClick={placeTrade}
          >
            Place trade
          </button>

          {message && (
            <p className="trade-message">{message}</p>
          )}

          <p className="trade-note">
            Guessy uses virtual points. No real money is involved.
          </p>
        </aside>
      </section>
    </main>
  )
}