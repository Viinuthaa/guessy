"use client"

import Link from "next/link"
import { useParams } from "next/navigation"

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
        </div>

        <aside className="trade-panel">
          <p className="eyebrow">MAKE YOUR GUESS</p>

          <h2>Where do you stand?</h2>

          <div className="balance">
            <span>Your balance</span>
            <strong>1,000 pts</strong>
          </div>

          <div className="trade-options">
            <button className="trade-option">
              <span>YES</span>
              <strong>{market.yes}%</strong>
            </button>

            <button className="trade-option">
              <span>NO</span>
              <strong>{market.no}%</strong>
            </button>
          </div>

          <p className="trade-note">
            Trading with virtual points. Your position will
            appear here once trading is enabled.
          </p>
        </aside>
      </section>
    </main>
  )
}