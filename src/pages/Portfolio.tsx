"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { cacheFetch } from "@/lib/idbCache"

type PortfolioCoin = {
  coin_id: number
  symbol: string
  amount: number
  current_price: number
  value: number
}

type Trade = {
  id: string
  coin_symbol: string
  amount: number
  price_per_coin: number
  timestamp: string
  trade_type: "buy" | "sell"
}

type PortfolioData = {
  balance: number
  coins: PortfolioCoin[]
  total_value: number
}

type User = {
  id: string
  access_token: string
}

export default function PortfolioPage() {
  const navigate = useNavigate()
  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState<User>()
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [trades, setTrades] = useState<Trade[]>([])
  const [username, setUsername] = useState("")
  const [loadingPortfolio, setLoadingPortfolio] = useState(true)
  const [loadingTrades, setLoadingTrades] = useState(true)

  // Retrieve username from cookie
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)userData=([^;]*)/)
    if (match) {
      try {
        const decoded = decodeURIComponent(match[1])
        const data = JSON.parse(decoded)
        if (data?.user?.username) setUsername(data.user.username)
      } catch (err) {
        console.error("Failed to parse userData cookie:", err)
      }
    }
  }, [])

  // Authenticate user
  useEffect(() => {
    const token = localStorage.getItem("access_token")
    const userId = localStorage.getItem("user_id")
    if (userId && token) {
      setUser({ id: userId, access_token: token })
      setLoggedIn(true)
    } else {
      setLoggedIn(false)
      navigate("/", { replace: true })
    }
  }, [navigate])

  // Fetch portfolio using cache
  useEffect(() => {
    if (!user) return

    async function loadPortfolio() {
      setLoadingPortfolio(true)
      try {
        const data = await cacheFetch<PortfolioData>(`portfolio-${user?.id}`, async () => {
          const res = await fetch(`https://coinbrew.vercel.app/api/coins/portfolio/${user?.id}`)
          if (!res.ok) throw new Error("Failed to fetch portfolio")
          const json = await res.json()
          return json.portfolio
        })
        setPortfolio(data)
      } catch (err) {
        console.error("Failed to load portfolio:", err)
      } finally {
        setLoadingPortfolio(false)
      }
    }

    loadPortfolio()
  }, [user])

  // Fetch recent trades using cache
  useEffect(() => {
    if (!user) return

    async function loadTrades() {
      setLoadingTrades(true)
      try {
        const data = await cacheFetch<Trade[]>(`trades-${user?.id}`, async () => {
          const res = await fetch(`https://coinbrew.vercel.app/api/coins/trades/${user?.id}?limit=10`)
          if (!res.ok) throw new Error("Failed to fetch trades")
          const json = await res.json()
          return json.trades ?? []
        })
        setTrades(data)
      } catch (err) {
        console.error("Failed to load trades:", err)
      } finally {
        setLoadingTrades(false)
      }
    }

    loadTrades()
  }, [user])

  if (!loggedIn) return null

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
      className="dark"
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="dark">
        <SiteHeader />

        <div className="flex flex-1 flex-col @container/main px-4 py-4 md:py-6 lg:pl-6 gap-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white tabular-nums">
            Your Portfolio
          </h1>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-t from-primary/5 to-card">
              <CardHeader>
                <CardDescription className="text-gray-400 text-sm">Total Value</CardDescription>
                <CardTitle className="text-white text-2xl">
                  ${portfolio?.total_value.toLocaleString() ?? "0"}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-gradient-to-t from-primary/5 to-card">
              <CardHeader>
                <CardDescription className="text-gray-400 text-sm">Cash Balance</CardDescription>
                <CardTitle className="text-white text-2xl">
                  ${portfolio?.balance.toLocaleString() ?? "0"}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-gradient-to-t from-primary/5 to-card">
              <CardHeader>
                <CardDescription className="text-gray-400 text-sm">Coins Value</CardDescription>
                <CardTitle className="text-white text-2xl">
                  ${portfolio ? (portfolio.total_value - portfolio.balance).toLocaleString() : "0"}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Holdings table */}
          <Card className="bg-[#111] border border-neutral-800">
            <CardHeader>
              <CardTitle className="text-xl text-white">Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolio?.coins.map((coin) => (
                    <TableRow key={coin.coin_id}>
                      <TableCell>{coin.symbol}</TableCell>
                      <TableCell>{coin.amount.toLocaleString()}</TableCell>
                      <TableCell>${coin.current_price.toFixed(4)}</TableCell>
                      <TableCell>${coin.value.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent trades */}
          <Card className="bg-[#111] border border-neutral-800">
            <CardHeader>
              <CardTitle className="text-xl text-white">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTrades ? (
                <p className="text-gray-400">Loading trades...</p>
              ) : trades.length === 0 ? (
                <p className="text-gray-400">No recent transactions.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Coin</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trades.map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell className={trade.trade_type === "buy" ? "text-green-400" : "text-red-400"}>
                          {trade.trade_type.toUpperCase()}
                        </TableCell>
                        <TableCell>{trade.coin_symbol}</TableCell>
                        <TableCell>{trade.amount.toLocaleString()}</TableCell>
                        <TableCell>${trade.price_per_coin.toFixed(4)}</TableCell>
                        <TableCell>{new Date(trade.timestamp).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
