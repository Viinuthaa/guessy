"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

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
  const [balance, setBalance] = useState(0)
  const [side, setSide] = useState<"YES" | "NO">("YES")
  const [amount, setAmount] = useState("")
  const [position, setPosition] = useState({ YES: 0, NO: 0 })
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("guessy_token")

      const [marketResponse, userResponse] = await Promise.all([
        fetch(`${API_URL}/api/markets/${params.id}`),
        fetch(`${API_URL}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (marketResponse.ok) {
        setMarket(await marketResponse.json())
      }

      if (userResponse.ok) {
        const user = await userResponse.json()
        setBalance(user.balance)

        const trades = user.trades.filter(
          (trade: { marketId: string }) =>
            trade.marketId === params.id
        )

        setPosition({
          YES: trades
            .filter(
              (trade: { side: string }) => trade.side === "YES"
            )
            .reduce(
              (sum: number, trade: { amount: number }) =>
                sum + trade.amount,
              0
            ),
          NO: trades
            .filter(
              (trade: { side: string }) => trade.side === "NO"
            )
            .reduce(
              (sum: number, trade: { amount: number }) =>
                sum + trade.amount,
              0
            ),
        })
      }
    }

    load()
  }, [params.id])

  async function placeTrade() {
    const points = Number(amount)
    const token = localStorage.getItem("guessy_token")

    if (!points || points <= 0) {
      setMessage("Enter a valid amount.")
      return
    }

    const response = await fetch(
      `${API_URL}/api/markets/${params.id}/trades`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ side, amount: points }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      setMessage(data.error)
      return
    }

    setBalance(data.balance)
    setMarket(current =>
      current
        ? {
            ...current,
            yesPrice: data.yesPrice,
            noPrice: data.noPrice,
          }
        : current
    )

    setPosition(current => ({
      ...current,
      [side]: current[side] + points,
    }))

    setAmount("")
    setMessage(`You placed ${points} points on ${side}.`)
  }

  if (!market) {
    return <main className="not-found">Loading market...</main>
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
            Closes{" "}
            {new Date(market.closesAt).toLocaleDateString()}
          </p>

          <div className="probability-section">
            <div className="probability-row">
              <div>
                <span>YES</span>
                <strong>
                  {Math.round(market.yesPrice)}%
                </strong>
              </div>

              <div>
                <span>NO</span>
                <strong>
                  {Math.round(market.noPrice)}%
                </strong>
              </div>
            </div>

            <div className="probability-bar">
              <div
                style={{
                  width: `${market.yesPrice}%`,
                }}
              />
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
            {(["YES", "NO"] as const).map(value => (
              <button
                key={value}
                className={`trade-option ${
                  side === value ? "selected" : ""
                }`}
                onClick={() => setSide(value)}
              >
                <span>{value}</span>

                <strong>
                  {Math.round(
                    value === "YES"
                      ? market.yesPrice
                      : market.noPrice
                  )}
                  %
                </strong>
              </button>
            ))}
          </div>

          <label className="amount-label">
            Points

            <input
              className="amount-input"
              type="number"
              value={amount}
              onChange={event =>
                setAmount(event.target.value)
              }
              placeholder="100"
            />
          </label>

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