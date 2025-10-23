"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Coin {
  id: number
  img_url: string
  name: string
  symbol: string
  creator_id: string
  current_price: number
  total_supply: number
}

export function PortfolioCards() {
  const [coins, setCoins] = useState<(Coin & { username?: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setLoading(true)
        const coinRes = await fetch("http://127.0.0.1:8000/api/coins/all", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_by: "market_cap", limit: 3 }),
        })
        const coinData = await coinRes.json()
        const coins = coinData.coins

        const coinsWithUsers = await Promise.all(
          coins.map(async (coin: Coin) => {
            try {
              const userRes = await fetch(`http://127.0.0.1:8000/api/coins/user/${coin.creator_id}`)
              const userData = await userRes.json()
              const username = userData.user.username
              return { ...coin, username }
            } catch {
              return { ...coin, username: "unknown" }
            }
          })
        )

        setCoins(coinsWithUsers)
      } catch (err) {
        console.error("Failed to fetch coins:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCoins()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="animate-spin h-12 w-12 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-3">
      {coins.map((coin, idx) => (
        <Card key={idx} className="@container/card">
          <CardHeader>
            <CardDescription>
              <div className="flex items-center gap-2">
                <img src={coin.img_url} alt={coin.symbol} className="w-8 h-8 rounded-full" />
                <span>
                  {coin.name} - @{coin.username}
                </span>
              </div>
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              ${coin.current_price.toFixed(4)}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">
              Total Supply: {coin.total_supply.toLocaleString()}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
