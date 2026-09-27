"use client"

import { FormEvent, useMemo, useState } from "react"

type Market = {
  question: string
  description: string
  closes: string
  yes: number
  no: number
}

const initialMarkets: Market[] = [
  {
    question: "Will it rain tomorrow?",
    description: "A simple weather prediction.",
    yes: 64,
    no: 36,
    closes: "Tomorrow",
  },
  {
    question: "Will my roommate do the dishes?",
    description: "The eternal roommate question.",
    yes: 28,
    no: 72,
    closes: "Today",
  },
  {
    question: "Will the next lecture be cancelled?",
    description: "Predict before the announcement.",
    yes: 41,
    no: 59,
    closes: "Friday",
  },
]

export default function Home() {
  const [markets, setMarkets] = useState(initialMarkets)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("All")
  const [question, setQuestion] = useState("")
  const [description, setDescription] = useState("")
  const [closes, setCloses] = useState("")

  const filteredMarkets = useMemo(() => {
    return markets.filter((market) => {
      const matchesSearch =
        market.question
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        market.description
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchesFilter =
        filter === "All" ||
        (filter === "High confidence" && Math.max(market.yes, market.no) >= 60) ||
        (filter === "Close calls" && Math.max(market.yes, market.no) < 60)

      return matchesSearch && matchesFilter
    })
  }, [markets, search, filter])

  function createMarket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!question.trim() || !closes) {
      return
    }

    const newMarket: Market = {
      question: question.trim(),
      description: description.trim(),
      closes,
      yes: 50,
      no: 50,
    }

    setMarkets((current) => [newMarket, ...current])
    setQuestion("")
    setDescription("")
    setCloses("")
    setShowForm(false)
  }

  return (
    <main>
      <header className="navbar">
        <a className="logo" href="/">
          guessy.
        </a>

        <nav>
          <a href="#markets">Markets</a>
          <a href="#about">How it works</a>
          <button
            className="nav-button"
            onClick={() => setShowForm((current) => !current)}
          >
            Create market
          </button>
        </nav>
      </header>

      <section className="hero">
        <p className="eyebrow">PREDICTION MARKET</p>

        <h1>
          What do you think
          <br />
          <span>will happen?</span>
        </h1>

        <p className="hero-text">
          Make a guess, put your points behind it,
          and see how the crowd thinks it will play out.
        </p>

        <button
          className="primary-button"
          onClick={() => {
            setShowForm(true)
            document
              .getElementById("create")
              ?.scrollIntoView({ behavior: "smooth" })
          }}
        >
          Create a market
        </button>
      </section>

      {showForm && (
        <section className="create-section" id="create">
          <div className="section-header">
            <div>
              <p className="eyebrow">NEW MARKET</p>
              <h2>What are you predicting?</h2>
            </div>

            <button
              className="close-button"
              onClick={() => setShowForm(false)}
            >
              Close
            </button>
          </div>

          <form className="market-form" onSubmit={createMarket}>
            <label>
              Question
              <input
                type="text"
                placeholder="Will our professor cancel tomorrow's lecture?"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
              />
            </label>

            <label>
              Description
              <textarea
                placeholder="Add some context to your prediction..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>

            <label>
              Closes
              <input
                type="date"
                value={closes}
                onChange={(event) => setCloses(event.target.value)}
              />
            </label>

            <button className="primary-button" type="submit">
              Create market
            </button>
          </form>
        </section>
      )}

      <section className="markets" id="markets">
        <div className="section-header">
          <div>
            <p className="eyebrow">EXPLORE</p>
            <h2>Live markets</h2>
          </div>

          <span className="market-count">
            {filteredMarkets.length} of {markets.length}
          </span>
        </div>

        <div className="market-controls">
          <input
            className="search-input"
            type="search"
            placeholder="Search markets..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="filter-group">
            {["All", "High confidence", "Close calls"].map((option) => (
              <button
                key={option}
                className={`filter-button ${
                  filter === option ? "active" : ""
                }`}
                onClick={() => setFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="market-list">
          {filteredMarkets.length > 0 ? (
            filteredMarkets.map((market) => (
              <article className="market-card" key={market.question}>
                <div>
                  <p className="market-question">
                    {market.question}
                  </p>

                  <p className="market-description">
                    {market.description}
                  </p>

                  <p className="closing">
                    Closes {market.closes}
                  </p>
                </div>

                <div className="odds">
                  <div>
                    <span>YES</span>
                    <strong>{market.yes}%</strong>
                  </div>

                  <div>
                    <span>NO</span>
                    <strong>{market.no}%</strong>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <p>No markets found.</p>
              <span>Try a different search or filter.</span>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}