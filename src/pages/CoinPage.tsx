import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { cacheFetch, refreshCache } from "@/lib/idbCache";

interface Coin {
  id: number;
  img_url: string;
  name: string;
  symbol: string;
  creator_id: string;
  total_supply: number;
  circulating_supply: number;
  current_price: number;
  initial_market_cap: number;
  created_at: string;
}

interface HistoryPoint {
  timestamp: string;
  price: number;
}

export default function CoinPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const [coin, setCoin] = useState<Coin | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("24h");
  const [buyModal, setBuyModal] = useState(false);
  const [sellModal, setSellModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    async function loadCoinData() {
      setLoading(true);
      try {
        // fetch coin info
        const coinData = await cacheFetch(`coin-${symbol}`, async () => {
          const res = await fetch(`https://coinbrew.vercel.app/api/coins/${symbol}`);
          if (!res.ok) throw new Error("Failed to fetch coin");
          return res.json();
        });
        setCoin(coinData.coin);

        // try fetch history
        try {
          const histRes = await fetch(
            `https://coinbrew.vercel.app/api/coins/${symbol}/history?time_range=${timeRange}`
          );

          if (histRes.ok) {
            const histData = await histRes.json();
            if (Array.isArray(histData.history) && histData.history.length > 0) {
              setHistory(histData.history);
            } else {
              setHistory([]);
            }
          } else {
            setHistory([]);
          }
        } catch (err) {
          console.warn("No history data found:", err);
          setHistory([]);
        }
      } catch (err) {
        console.error("Error loading coin data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCoinData();
  }, [symbol, timeRange]);

  const handleTrade = async (type: "buy" | "sell") => {
    if (!coin) return;
    const userId = localStorage.getItem("user_id");
    if (!userId) return alert("Please log in first.");

    const endpoint =
      type === "buy"
        ? "https://coinbrew.vercel.app/api/trade/buy"
        : "https://coinbrew.vercel.app/api/trade/sell";

    const body = {
      user_id: parseInt(userId),
      coin_symbol: coin.symbol,
      amount: parseFloat(amount),
      price_per_coin: parseFloat(price),
    };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Trade failed");

      await refreshCache([
        () => fetch(`https://coinbrew.vercel.app/api/coins/${symbol}`),
      ]);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Trade failed. Try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <p>Loading {symbol}...</p>
      </div>
    );
  }

  if (!coin) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <p>Coin not found 😭</p>
      </div>
    );
  }

  return (
    <SidebarProvider className="dark">
      <AppSidebar variant="inset" />
      <SidebarInset className="dark">
        <SiteHeader />
        <div className="flex flex-1 flex-col md:flex-row gap-8 p-8 text-white">
          {/* Left Side — Chart */}
          <div className="flex-1 bg-neutral-900 rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{coin.name}</h2>
              <div className="flex gap-2">
                {["12h", "24h", "1w", "max"].map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? "default" : "ghost"}
                    onClick={() => setTimeRange(range)}
                    className="text-sm"
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>

            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="timestamp" tick={{ fill: "#9ca3af" }} />
                  <YAxis tick={{ fill: "#9ca3af" }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111",
                      border: "1px solid #333",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#82ca9d"
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-neutral-400">
                No history available
              </div>
            )}
          </div>

          {/* Right Side — Info */}
          <div className="w-full md:w-1/3 flex flex-col bg-neutral-900 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4 mb-6">
              <img
                src={coin.img_url}
                alt={coin.name}
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div>
                <h1 className="text-3xl font-bold">{coin.name}</h1>
                <p className="text-neutral-400">${coin.symbol}</p>
              </div>
            </div>

            <div className="space-y-2 text-neutral-300">
              <p>💰 <b>Current Price:</b> ${coin.current_price?.toFixed(8) ?? "N/A"}</p>
              <p>📈 <b>Market Cap:</b> ${coin.initial_market_cap?.toLocaleString() ?? "N/A"}</p>
              <p>🪙 <b>Total Supply:</b> {coin.total_supply?.toLocaleString() ?? "N/A"}</p>
              <p>🌀 <b>Circulating:</b> {coin.circulating_supply?.toLocaleString() ?? "N/A"}</p>
              <p>👤 <b>Creator:</b> {coin.creator_id || "Unknown"}</p>
              <p>📅 <b>Created:</b> {new Date(coin.created_at).toLocaleDateString()}</p>
            </div>

            <div className="flex gap-4 mt-8">
              {/* BUY MODAL */}
              <Dialog open={buyModal} onOpenChange={setBuyModal}>
                <DialogTrigger asChild>
                  <Button className="w-full">Buy</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Buy {coin.symbol}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <Label>Price per Coin</Label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button onClick={() => handleTrade("buy")}>Confirm Buy</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* SELL MODAL */}
              <Dialog open={sellModal} onOpenChange={setSellModal}>
                <DialogTrigger asChild>
                  <Button className="w-full">Sell</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sell {coin.symbol}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <Label>Price per Coin</Label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button onClick={() => handleTrade("sell")}>Confirm Sell</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
