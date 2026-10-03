"use client"

import Link from "next/link"
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

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [creating, setCreating] = useState(false)
  const [question, setQuestion] = useState("")
  const [description, setDescription] = useState("")
  const [closesAt, setClosesAt] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)

  async function loadMarkets() {
    try {
      const response = await fetch(`${API_URL}/api/markets`)
      const data = await response.json()
      setMarkets(data)
    } catch {
      setMessage("Couldn't load markets.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMarkets()
  }, [])

  async function createMarket() {
    if (!question.trim() || !closesAt) {
      setMessage("Add a question and closing date.")
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/markets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
          description: description.trim(),
          closesAt: new Date(closesAt).toISOString(),
        }),
      })

      if (!response.ok) throw new Error()

      const market = await response.json()

      setMarkets(current => [market, ...current])
      setQuestion("")
      setDescription("")
      setClosesAt("")
      setCreating(false)
      setMessage("")
    } catch {
      setMessage("Couldn't create market.")
    }
  }

  const filteredMarkets = markets.filter(market => {
    const matchesSearch = market.question
      .toLowerCase()
      .includes(search.toLowerCase())

    if (filter === "high") {
      return matchesSearch && Math.max(market.yesPrice, market.noPrice) >= 65
    }

    if (filter === "close") {
      return (
        matchesSearch &&
        Math.abs(market.yesPrice - market.noPrice) <= 20
      )
    }

    return matchesSearch
  })

  return (
    <>
      <nav className="navbar">
        <Link className="logo" href="/">
          guessy.
        </Link>

        <nav>
          <a href="#markets">Markets</a>
          <a href="#markets">How it works</a>
        </nav>

        <button
          className="nav-button"
          onClick={() => {
            setCreating(value => !value)
            setMessage("")
          }}
        >
          Create market
        </button>
      </nav>

      <section className="hero">
        <p className="eyebrow">PREDICT THE OUTCOME</p>

        <h1>
          Make a guess.
          <br />
          Put your points
          <br />
          behind it.
        </h1>

        <p className="hero-text">
          Guessy is a prediction market for the questions you
          actually care about.
        </p>
      </section>

      {creating && (
        <section className="create-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">NEW MARKET</p>
              <h2>Create a market</h2>
            </div>

            <button
              className="close-button"
              onClick={() => setCreating(false)}
            >
              Close
            </button>
          </div>

          <div className="market-form">
            <label>
              Question
              <input
                value={question}
                onChange={event => setQuestion(event.target.value)}
                placeholder="Will it rain tomorrow?"
              />
            </label>

            <label>
              Description
              <textarea
                value={description}
                onChange={event => setDescription(event.target.value)}
                placeholder="Add some context..."
              />
            </label>

            <label>
              Closing date
              <input
                type="datetime-local"
                value={closesAt}
                onChange={event => setClosesAt(event.target.value)}
              />
            </label>

            <button className="primary-button" onClick={createMarket}>
              Create market
            </button>
          </div>
        </section>
      )}

      <section className="markets" id="markets">
        <div className="section-header">
          <div>
            <p className="eyebrow">LIVE MARKETS</p>
            <h2>What are people guessing?</h2>
          </div>

          <span className="market-count">
            {markets.length} markets
          </span>
        </div>

        <div className="market-controls">
          <input
            className="search-input"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search markets"
          />

          <div className="filter-group">
            {[
              ["all", "All"],
              ["high", "High confidence"],
              ["close", "Close calls"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={`filter-button ${
                  filter === value ? "active" : ""
                }`}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading markets...</p>
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="empty-state">
            <p>No markets found.</p>
            <span>Try creating one.</span>
          </div>
        ) : (
          <div className="market-list">
            {filteredMarkets.map(market => (
              <Link
                className="market-card"
                href={`/market/${market.id}`}
                key={market.id}
              >
                <div>
                  <h3 className="market-question">
                    {market.question}
                  </h3>

                  {market.description && (
                    <p className="market-description">
                      {market.description}
                    </p>
                  )}

                  <p className="closing">
                    Closes{" "}
                    {new Date(market.closesAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="odds">
                  <div>
                    <span>YES</span>
                    <strong>{Math.round(market.yesPrice)}%</strong>
                  </div>

                  <div>
                    <span>NO</span>
                    <strong>{Math.round(market.noPrice)}%</strong>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {message && <p className="trade-message">{message}</p>}
      </section>
    </>
  )
}