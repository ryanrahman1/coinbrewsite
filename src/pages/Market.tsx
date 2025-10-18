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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type Coin = {
  id: number
  img_url: string
  name: string
  symbol: string
  current_price: number
  circulating_supply: number
  created_at: string
}

type User = {
  id: string
  access_token: string
}

export default function MarketPage() {
  const navigate = useNavigate()
  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState<User>()
  const [allCoins, setAllCoins] = useState<Coin[]>([])
  const [coins, setCoins] = useState<Coin[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [username, setUsername] = useState("")

  // Filters state
  const [limit, setLimit] = useState(10)
  const [minPrice, setMinPrice] = useState<number | "">("")
  const [maxPrice, setMaxPrice] = useState<number | "">("")
  const [sortBy, setSortBy] = useState<"name" | "current_price" | "created_at" | "">("")

  // Auth & username
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

  // Unified fetch function
  const fetchCoins = async (
    newLimit: number = limit,
    newMin: number | "" = minPrice,
    newMax: number | "" = maxPrice,
    newSort: string = sortBy
  ) => {
    if (!user) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("limit", newLimit.toString())
      if (newMin !== "") params.append("min_price", newMin.toString())
      if (newMax !== "") params.append("max_price", newMax.toString())
      if (newSort !== "") params.append("sort_by", newSort)
      const res = await fetch(`https://coinbrew.vercel.app/api/coins/all?${params.toString()}`, {
        method: "POST",
      })
      const data = await res.json()
      setAllCoins(data.coins)
      setCoins(data.coins)
    } catch (err) {
      console.error("Failed to fetch coins:", err)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchCoins()
    return () => {
      setAllCoins([])
      setCoins([])
    }
  }, [user])

  // Client-side search filtering
  useEffect(() => {
    if (search.trim() === "") setCoins(allCoins)
    else {
      const s = search.toLowerCase()
      setCoins(
        allCoins.filter(
          (c) => c.name.toLowerCase().includes(s) || c.symbol.toLowerCase().includes(s)
        )
      )
    }
  }, [search, allCoins])

  // Remove a single filter
  const removeFilter = (filter: string) => {
    let newLimit = limit
    let newMin = minPrice
    let newMax = maxPrice
    let newSort = sortBy

    switch (filter) {
      case "limit":
        newLimit = 10
        setLimit(newLimit)
        break
      case "minPrice":
        newMin = ""
        setMinPrice("")
        break
      case "maxPrice":
        newMax = ""
        setMaxPrice("")
        break
      case "sortBy":
        newSort = ""
        setSortBy("")
        break
    }

    fetchCoins(newLimit, newMin, newMax, newSort)
  }

  // Reset all filters
  const resetFilters = () => {
    setLimit(10)
    setMinPrice("")
    setMaxPrice("")
    setSortBy("")
    fetchCoins(10, "", "", "")
  }

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
          <h1 className="text-4xl md:text-5xl font-bold text-white tabular-nums">Market</h1>

          {/* Search + Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <Input
              placeholder="Search coins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button className="mt-2 md:mt-0">Filters</Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4 dark">
                <div className="space-y-2">
                  <div>
                    <Label>Limit</Label>
                    <Input
                      type="number"
                      min={1}
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                    />
                  </div>
                  <Separator />
                  <div>
                    <Label className="mb-2">Min Price</Label>
                    <Input
                      type="number"
                      min={0}
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label className="mb-2">Max Price</Label>
                    <Input
                      type="number"
                      min={0}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                  </div>
                  <Separator />
                  <div>
                    <Label className="mb-2">Sort By</Label>
                    <select
                      className="w-full rounded-md bg-muted text-white p-2 border border-white/10"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                    >
                      <option value="">None</option>
                      <option value="name">Name</option>
                      <option value="current_price">Price</option>
                      <option value="created_at">Created</option>
                    </select>
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Button onClick={() => fetchCoins()} className="flex-1">Apply</Button>
                    <Button onClick={resetFilters} variant="outline" className="flex-1">Reset</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Active filters pills */}
          <div className="flex flex-wrap gap-2 mt-2">
            {limit !== 10 && (
              <div className="bg-gray-700 text-white px-2 py-1 rounded flex items-center gap-1">
                Limit: {limit}
                <button onClick={() => removeFilter("limit")} className="ml-1 font-bold">×</button>
              </div>
            )}
            {minPrice !== "" && (
              <div className="bg-gray-700 text-white px-2 py-1 rounded flex items-center gap-1">
                Min: ${minPrice}
                <button onClick={() => removeFilter("minPrice")} className="ml-1 font-bold">×</button>
              </div>
            )}
            {maxPrice !== "" && (
              <div className="bg-gray-700 text-white px-2 py-1 rounded flex items-center gap-1">
                Max: ${maxPrice}
                <button onClick={() => removeFilter("maxPrice")} className="ml-1 font-bold">×</button>
              </div>
            )}
            {sortBy !== "" && (
              <div className="bg-gray-700 text-white px-2 py-1 rounded flex items-center gap-1">
                Sort: {sortBy}
                <button onClick={() => removeFilter("sortBy")} className="ml-1 font-bold">×</button>
              </div>
            )}
          </div>

          {/* Coins table */}
          <Card className="bg-[#111] border border-neutral-800">
            <CardHeader>
              <CardTitle className="text-xl text-white">All Coins</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-400">Loading coins...</p>
              ) : coins.length === 0 ? (
                <p className="text-gray-400">No coins found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Coin</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Circulating Supply</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coins.map((coin) => (
                      <TableRow key={coin.id}>
                        <TableCell className="flex items-center gap-2">
                          <img
                            src={coin.img_url}
                            alt={coin.name}
                            className="w-6 h-6 object-cover rounded-full"
                          />
                          {coin.name}
                        </TableCell>
                        <TableCell>{coin.symbol}</TableCell>
                        <TableCell>${coin.current_price.toFixed(4)}</TableCell>
                        <TableCell>{coin.circulating_supply.toLocaleString()}</TableCell>
                        <TableCell>{new Date(coin.created_at).toLocaleDateString()}</TableCell>
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
