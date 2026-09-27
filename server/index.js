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

app.listen(PORT, () => {
  console.log(`Guessy API running on http://localhost:${PORT}`)
})