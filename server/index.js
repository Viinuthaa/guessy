const express = require("express")
const cors = require("cors")

const app = express()
const PORT = 4000

app.use(cors())
app.use(express.json())

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

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Guessy API is running",
  })
})

app.get("/api/markets", (req, res) => {
  res.json(markets)
})

app.listen(PORT, () => {
  console.log(`Guessy API running on http://localhost:${PORT}`)
})