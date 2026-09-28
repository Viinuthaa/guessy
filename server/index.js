import "dotenv/config"
import express from "express"
import cors from "cors"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client.ts"

const app = express()
const PORT = 4000

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
  adapter,
})

app.use(cors())
app.use(express.json())

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`

    res.json({
      status: "ok",
      database: "connected",
    })
  } catch {
    res.status(500).json({
      status: "error",
      database: "disconnected",
    })
  }
})

app.get("/api/markets", async (req, res) => {
  try {
    const markets = await prisma.market.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    res.json(markets)
  } catch {
    res.status(500).json({
      error: "Failed to fetch markets",
    })
  }
})

app.get("/api/markets/:id", async (req, res) => {
  try {
    const market = await prisma.market.findUnique({
      where: {
        id: req.params.id,
      },
    })

    if (!market) {
      return res.status(404).json({
        error: "Market not found",
      })
    }

    res.json(market)
  } catch {
    res.status(500).json({
      error: "Failed to fetch market",
    })
  }
})

app.post("/api/markets", async (req, res) => {
  try {
    const { question, description, closesAt } = req.body

    if (!question || !closesAt) {
      return res.status(400).json({
        error: "Question and closing date are required",
      })
    }

    const market = await prisma.market.create({
      data: {
        question,
        description: description || null,
        closesAt: new Date(closesAt),
      },
    })

    res.status(201).json(market)
  } catch {
    res.status(500).json({
      error: "Failed to create market",
    })
  }
})

app.post("/api/markets/:id/trades", async (req, res) => {
  try {
    const { side, amount, price } = req.body

    if (!["YES", "NO"].includes(side)) {
      return res.status(400).json({
        error: "Side must be YES or NO",
      })
    }

    if (!amount || amount <= 0 || !price) {
      return res.status(400).json({
        error: "Valid amount and price are required",
      })
    }

    const market = await prisma.market.findUnique({
      where: {
        id: req.params.id,
      },
    })

    if (!market) {
      return res.status(404).json({
        error: "Market not found",
      })
    }

    const trade = await prisma.trade.create({
      data: {
        marketId: market.id,
        side,
        amount: Number(amount),
        price: Number(price),
      },
    })

    res.status(201).json(trade)
  } catch {
    res.status(500).json({
      error: "Failed to record trade",
    })
  }
})

app.listen(PORT, () => {
  console.log(`Guessy API running on http://localhost:${PORT}`)
})