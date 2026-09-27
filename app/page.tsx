const markets = [
  {
    question: "Will it rain tomorrow?",
    yes: 64,
    no: 36,
    closes: "Tomorrow",
  },
  {
    question: "Will my roommate do the dishes?",
    yes: 28,
    no: 72,
    closes: "Today",
  },
  {
    question: "Will the next lecture be cancelled?",
    yes: 41,
    no: 59,
    closes: "Friday",
  },
]

export default function Home() {
  return (
    <main>
      <header className="navbar">
        <a className="logo" href="/">
          guessy.
        </a>

        <nav>
          <a href="#markets">Markets</a>
          <a href="#about">How it works</a>
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

        <button className="primary-button">
          Explore markets
        </button>
      </section>

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