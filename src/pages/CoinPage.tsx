import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"

interface Coin {
  id: number
  img_url: string
  name: string
  symbol: string
  creator_id: string
  total_supply: number
  circulating_supply: number
  current_price: number
  initial_market_cap: number
  created_at: string
}

export default function CoinPage() {
  const { symbol } = useParams<{ symbol: string }>()
  const [coin, setCoin] = useState<Coin | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCoin = async () => {
      try {
        const res = await fetch(`https://coinbrew.vercel.app/api/coins/${symbol}`)
        if (!res.ok) throw new Error("Failed to fetch coin")
        const data = await res.json()
        setCoin(data.coin) // <- fix right here
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCoin()
  }, [symbol])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <p>Loading {symbol}...</p>
      </div>
    )
  }

  if (!coin) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <p>Coin not found 😭</p>
      </div>
    )
  }

  return (
    <div className="text-white p-8">
      <h1 className="text-4xl font-bold mb-2">{coin.name}</h1>
      <p className="text-lg text-neutral-400 mb-6">${coin.symbol}</p>
      <img
        src={coin.img_url}
        alt={coin.name}
        className="w-32 h-32 rounded-xl mb-6 object-cover"
      />

      <p className="text-neutral-300">
        💰 Current Price: ${coin.current_price?.toLocaleString() ?? "N/A"}
      </p>

      <p className="text-neutral-300">
        🪙 Total Supply: {coin.total_supply?.toLocaleString() ?? "N/A"}
      </p>

      <p className="text-neutral-300">
        📈 Market Cap: ${coin.initial_market_cap?.toLocaleString() ?? "N/A"}
      </p>

      <p className="text-neutral-400 mt-2 text-sm">
        Created: {new Date(coin.created_at).toLocaleDateString()}
      </p>

      <p className="text-neutral-300 mt-2">
        👤 Creator ID: {coin.creator_id || "Unknown"}
      </p>
    </div>
  )
}
