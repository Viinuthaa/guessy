"use client"

import { FormEvent, useState } from "react"

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
  const [question, setQuestion] = useState("")
  const [description, setDescription] = useState("")
  const [closes, setCloses] = useState("")

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
            <p className="eyebrow">RIGHT NOW</p>
            <h2>Live markets</h2>
          </div>

          <span className="market-count">
            {markets.length} markets
          </span>
        </div>

        <div className="market-list">
          {markets.map((market) => (
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
          ))}
        </div>
      </section>
    </main>
  )
}