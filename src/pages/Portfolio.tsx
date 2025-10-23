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
import { type User } from "@/lib/types/User"
import { userFromCache } from "@/lib/userFromCache"

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

export default function PortfolioPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [trades, setTrades] = useState<Trade[]>([])
  const [loadingPortfolio, setLoadingPortfolio] = useState(true)
  const [loadingTrades, setLoadingTrades] = useState(true)

  // 🧠 Load user from cache
  useEffect(() => {
    (async () => {
      const cachedUser = await userFromCache()
      if (cachedUser) {
        setUser(cachedUser)
      } else {
        console.warn("⚠️ No cached user found, logging out...")
        localStorage.removeItem("coinbrew_user_logged_in")
        navigate("/")
      }
    })()
  }, [navigate])

  // 📊 Load portfolio + trades (backend returns combined)
  useEffect(() => {
    if (!user) return

    async function loadPortfolio() {
      setLoadingPortfolio(true)
      setLoadingTrades(true)
      try {
        const data = await cacheFetch<any>(`portfolio-${user?.id}`, async () => {
          const res = await fetch(`http://127.0.0.1:8000/api/v2/user/${user?.id}/profile`, {
            credentials: "include",
          })
          if (!res.ok) throw new Error(`Failed to fetch portfolio: ${res.status}`)
          return res.json()
        })

        console.log("📦 API data:", data)

        // Re-map backend response shape into our local type
        const mappedPortfolio: PortfolioData = {
          balance: data.user?.balance ?? 0,
          total_value: data.portfolio?.total_value ?? 0,
          coins: Array.isArray(data.portfolio?.wallets)
            ? data.portfolio.wallets.map((w: any) => ({
                coin_id: w.coin_id ?? 0,
                symbol: w.symbol ?? "N/A",
                amount: Number(w.amount ?? 0),
                current_price: Number(w.current_price ?? 0),
                value: Number(w.value ?? 0),
              }))
            : [],
        }

        setPortfolio(mappedPortfolio)
        setTrades(Array.isArray(data.recent_trades) ? data.recent_trades : [])
      } catch (err) {
        console.error("❌ Failed to load portfolio data:", err)
      } finally {
        setLoadingPortfolio(false)
        setLoadingTrades(false)
      }
    }

    loadPortfolio()
  }, [user])

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-300">
        Loading profile...
      </div>
    )
  }

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
            {user.username}’s Portfolio
          </h1>

          {/* 💰 Summary cards */}
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
                  $
                  {portfolio
                    ? (portfolio.total_value - portfolio.balance).toLocaleString()
                    : "0"}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* 📈 Holdings Table */}
          <Card className="bg-[#111] border border-neutral-800">
            <CardHeader>
              <CardTitle className="text-xl text-white">Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPortfolio ? (
                <p className="text-gray-400">Loading portfolio...</p>
              ) : portfolio?.coins.length ? (
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
                    {portfolio.coins.map((coin) => (
                      <TableRow key={coin.coin_id}>
                        <TableCell>{coin.symbol}</TableCell>
                        <TableCell>{coin.amount.toLocaleString()}</TableCell>
                        <TableCell>${coin.current_price.toFixed(4)}</TableCell>
                        <TableCell>${coin.value.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-400">No holdings yet.</p>
              )}
            </CardContent>
          </Card>

          {/* 🕒 Recent Trades */}
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
                        <TableCell
                          className={
                            trade.trade_type === "buy" ? "text-green-400" : "text-red-400"
                          }
                        >
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
