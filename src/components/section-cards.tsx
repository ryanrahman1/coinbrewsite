"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cacheFetch } from "@/lib/idbCache"

interface Coin {
  id: number
  img_url: string
  name: string
  symbol: string
  creator_id: string
  current_price: number
  total_supply: number
}

export function SectionCards() {
  const [coins, setCoins] = useState<(Coin & { username?: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCoins() {
      setLoading(true)
      try {
        // get top 3 coins
        const coinList = await cacheFetch<Coin[]>("top-coins", async () => {
          const res = await fetch("http://127.0.0.1:8000/api/v2/coins?limit=3", {
            credentials: "include",
          })
          if (!res.ok) throw new Error("Failed to fetch coins")
          return await res.json()
        })

        // fetch usernames for each creator
        const coinsWithUsers = await Promise.all(
          coinList.map(async (coin) => {
            try {
              const res = await fetch(`http://127.0.0.1:8000/api/v2/user/${coin.creator_id}/username`, {
                credentials: "include",
              })
              const data = await res.json()
              return { ...coin, username: data.username }
            } catch {
              return { ...coin, username: "unknown" }
            }
          })
        )

        setCoins(coinsWithUsers)
      } catch (err) {
        console.error("Failed to load coins:", err)
      } finally {
        setLoading(false)
      }
    }

    loadCoins()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="animate-spin h-12 w-12 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-3">
      {coins.map((coin, idx) => (
        <Card key={idx} className="@container/card">
          <CardHeader>
            <CardDescription>
              <div className="flex items-center gap-2">
                <img
                  src={coin.img_url}
                  alt={coin.symbol}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm">
                  {coin.name} — @{coin.username}
                </span>
              </div>
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              ${coin.current_price.toFixed(6)}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm text-muted-foreground">
            Total Supply: {coin.total_supply.toLocaleString()}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
