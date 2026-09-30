import "dotenv/config"
import express from "express"
import cors from "cors"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client.ts"
import { marketPrices } from "./pricing.js"

const app = express()
const PORT = 4000
const JWT_SECRET = process.env.JWT_SECRET

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

app.use(cors())
app.use(express.json())

function authenticate(req, res, next) {
  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null

  if (!token) {
    return res.status(401).json({ error: "Authentication required" })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.userId = payload.userId
    next()
  } catch {
    res.status(401).json({ error: "Invalid or expired token" })
  }
}

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: "ok", database: "connected" })
  } catch {
    res.status(500).json({ status: "error", database: "disconnected" })
  }
})

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password || password.length < 6) {
      return res.status(400).json({ error: "Invalid username or password" })
    }

    if (await prisma.user.findUnique({ where: { username } })) {
      return res.status(409).json({ error: "Username already exists" })
    }

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash: await bcrypt.hash(password, 10),
      },
    })

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    })

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        balance: user.balance,
      },
    })
  } catch {
    res.status(500).json({ error: "Failed to create account" })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await prisma.user.findUnique({ where: { username } })

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid username or password" })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    })

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        balance: user.balance,
      },
    })
  } catch {
    res.status(500).json({ error: "Failed to log in" })
  }
})

app.get("/api/me", authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: {
      trades: {
        orderBy: { createdAt: "desc" },
        include: { market: true },
      },
    },
  })

  if (!user) {
    return res.status(404).json({ error: "User not found" })
  }

  res.json({
    id: user.id,
    username: user.username,
    balance: user.balance,
    trades: user.trades,
  })
})

app.get("/api/markets", async (req, res) => {
  const markets = await prisma.market.findMany({
    orderBy: { createdAt: "desc" },
  })

  res.json(markets)
})

app.get("/api/markets/:id", async (req, res) => {
  const market = await prisma.market.findUnique({
    where: { id: req.params.id },
  })

  if (!market) {
    return res.status(404).json({ error: "Market not found" })
  }

  res.json(market)
})

app.post("/api/markets", async (req, res) => {
  try {
    const { question, description, closesAt } = req.body

    const market = await prisma.market.create({
      data: {
        question,
        description,
        closesAt: new Date(closesAt),
      },
    })

    res.status(201).json(market)
  } catch {
    res.status(400).json({ error: "Failed to create market" })
  }
})

app.post("/api/markets/:id/trades", authenticate, async (req, res) => {
  try {
    const side = req.body.side
    const amount = Number(req.body.amount)

    if (!["YES", "NO"].includes(side) || amount <= 0) {
      return res.status(400).json({ error: "Invalid trade" })
    }

    const result = await prisma.$transaction(async tx => {
      const user = await tx.user.findUnique({
        where: { id: req.userId },
      })

      const market = await tx.market.findUnique({
        where: { id: req.params.id },
        include: { trades: true },
      })

      if (!user || !market) throw new Error("Trade unavailable")
      if (user.balance < amount) throw new Error("Insufficient balance")

      const yesShares = market.trades
        .filter(trade => trade.side === "YES")
        .reduce((sum, trade) => sum + trade.amount, 0)

      const noShares = market.trades
        .filter(trade => trade.side === "NO")
        .reduce((sum, trade) => sum + trade.amount, 0)

      const nextYes = yesShares + (side === "YES" ? amount : 0)
      const nextNo = noShares + (side === "NO" ? amount : 0)
      const prices = marketPrices(nextYes, nextNo)

      const trade = await tx.trade.create({
        data: {
          marketId: market.id,
          userId: user.id,
          side,
          amount,
          price: side === "YES" ? prices.yesPrice : prices.noPrice,
        },
      })

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { balance: { decrement: amount } },
      })

      await tx.market.update({
        where: { id: market.id },
        data: prices,
      })

      return {
        trade,
        balance: updatedUser.balance,
        ...prices,
      }
    })

    res.status(201).json(result)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`Guessy API running on http://localhost:${PORT}`)
})