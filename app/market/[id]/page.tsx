"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"

const markets = [
  {
    id: "rain-tomorrow",
    question: "Will it rain tomorrow?",
    description: "A simple weather prediction.",
    closes: "Tomorrow",
    yes: 64,
    no: 36,
  },
  {
    id: "roommate-dishes",
    question: "Will my roommate do the dishes?",
    description: "The eternal roommate question.",
    closes: "Today",
    yes: 28,
    no: 72,
  },
  {
    id: "lecture-cancelled",
    question: "Will the next lecture be cancelled?",
    description: "Predict before the announcement.",
    closes: "Friday",
    yes: 41,
    no: 59,
  },
]

export default function MarketPage() {
  const params = useParams()
  const market = markets.find((item) => item.id === params.id)

  const [balance, setBalance] = useState(1000)
  const [selectedSide, setSelectedSide] = useState<"YES" | "NO">("YES")
  const [amount, setAmount] = useState("")
  const [position, setPosition] = useState({
    YES: 0,
    NO: 0,
  })
  const [message, setMessage] = useState("")

  if (!market) {
    return (
      <main className="detail-page">
        <Link className="back-link" href="/">
          ← Back to markets
        </Link>

        <div className="not-found">
          <p className="eyebrow">MARKET NOT FOUND</p>
          <h1>This market doesn't exist.</h1>
        </div>
      </main>
    )
  }

  function placeTrade() {
    const points = Number(amount)

    if (!points || points <= 0) {
      setMessage("Enter a valid amount.")
      return
    }

    if (points > balance) {
      setMessage("You don't have enough points.")
      return
    }

    setBalance((current) => current - points)

    setPosition((current) => ({
      ...current,
      [selectedSide]: current[selectedSide] + points,
    }))

    setAmount("")
    setMessage(
      `You placed ${points} points on ${selectedSide}.`
    )
  }

  const selectedProbability =
    selectedSide === "YES" ? market.yes : market.no

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

          <p className="detail-description">
            {market.description}
          </p>

          <p className="detail-closing">
            Closes {market.closes}
          </p>

          <div className="probability-section">
            <div className="probability-row">
              <div>
                <span>YES</span>
                <strong>{market.yes}%</strong>
              </div>

              <div>
                <span>NO</span>
                <strong>{market.no}%</strong>
              </div>
            </div>

            <div className="probability-bar">
              <div style={{ width: `${market.yes}%` }} />
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
                selectedSide === "YES" ? "selected" : ""
              }`}
              onClick={() => {
                setSelectedSide("YES")
                setMessage("")
              }}
            >
              <span>YES</span>
              <strong>{market.yes}%</strong>
            </button>

            <button
              className={`trade-option ${
                selectedSide === "NO" ? "selected" : ""
              }`}
              onClick={() => {
                setSelectedSide("NO")
                setMessage("")
              }}
            >
              <span>NO</span>
              <strong>{market.no}%</strong>
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
            <strong>{selectedSide}</strong>

            <span>Current probability</span>
            <strong>{selectedProbability}%</strong>

            <span>Amount</span>
            <strong>
              {amount ? `${amount} pts` : "—"}
            </strong>
          </div>

          <button
            className="primary-button trade-button"
            onClick={placeTrade}
          >
            Place trade
          </button>

          {message && (
            <p className="trade-message">
              {message}
            </p>
          )}

          <p className="trade-note">
            Guessy uses virtual points. No real money is
            involved.
          </p>
        </aside>
      </section>
    </main>
  )
}