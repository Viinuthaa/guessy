import "dotenv/config"
import express from "express"
import cors from "cors"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client.ts"

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
  const header = req.headers.authorization
  const token = header?.startsWith("Bearer ")
    ? header.slice(7)
    : null

  if (!token) {
    return res.status(401).json({
      error: "Authentication required",
    })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.userId = payload.userId
    next()
  } catch {
    return res.status(401).json({
      error: "Invalid or expired token",
    })
  }
}

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: "ok", database: "connected" })
  } catch {
    res.status(500).json({
      status: "error",
      database: "disconnected",
    })
  }
})

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required",
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      })
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return res.status(409).json({
        error: "Username already exists",
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
      },
    })

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        balance: user.balance,
      },
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: error.message,
    })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return res.status(401).json({
        error: "Invalid username or password",
      })
    }

    const valid = await bcrypt.compare(
      password,
      user.passwordHash
    )

    if (!valid) {
      return res.status(401).json({
        error: "Invalid username or password",
      })
    }

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        balance: user.balance,
      },
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: error.message,
    })
  }
})

app.get("/api/me", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        trades: {
          orderBy: { createdAt: "desc" },
          include: {
            market: true,
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      })
    }

    res.json({
      id: user.id,
      username: user.username,
      balance: user.balance,
      trades: user.trades,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: error.message,
    })
  }
})

app.get("/api/markets", async (req, res) => {
  try {
    const markets = await prisma.market.findMany({
      orderBy: { createdAt: "desc" },
    })

    res.json(markets)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: "Failed to fetch markets",
    })
  }
})

app.get("/api/markets/:id", async (req, res) => {
  try {
    const market = await prisma.market.findUnique({
      where: { id: req.params.id },
    })

    if (!market) {
      return res.status(404).json({
        error: "Market not found",
      })
    }

    res.json(market)
  } catch (error) {
    console.error(error)

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
        description,
        closesAt: new Date(closesAt),
      },
    })

    res.status(201).json(market)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: "Failed to create market",
    })
  }
})

app.post("/api/markets/:id/trades", async (req, res) => {
  try {
    const { side, amount, price, userId } = req.body

    if (!side || !amount || !price || !userId) {
      return res.status(400).json({
        error: "Trade details are required",
      })
    }

    const trade = await prisma.trade.create({
      data: {
        marketId: req.params.id,
        userId,
        side,
        amount,
        price,
      },
    })

    res.status(201).json(trade)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: "Failed to place trade",
    })
  }
})

app.listen(PORT, () => {
  console.log(`Guessy API running on http://localhost:${PORT}`)
})