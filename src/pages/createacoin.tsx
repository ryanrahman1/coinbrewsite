"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"

export default function Create() {
  const navigate = useNavigate()

  const [loggedIn, setLoggedIn] = useState(false)
  const [username, setUsername] = useState("")

  const [created, setCreated] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)


  const [loading, setLoading] = useState(false)

  // coin info
  const [name, setName] = useState("")
  const [symbol, setSymbol] = useState("")
  const [fileName, setFileName] = useState("")
  const [coinImage, setCoinImage] = useState<string | null>(null)
  const [imgFile, setImgFile] = useState<File | null>(null)

  // auth check
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
      setLoggedIn(true)
    } else {
      setLoggedIn(false)
      navigate("/landing", { replace: true })
    }
  }, [navigate])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      setCoinImage(URL.createObjectURL(file))
      setImgFile(file)
    }
  }

  const handleCreateCoin = async () => {
    setLoading(true)
    const endpoint = "http://127.0.0.1:8000/api/coins/create"

    const formData = new FormData()
    formData.append("name", name)
    formData.append("symbol", symbol)
    if (imgFile) formData.append("file", imgFile)

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: formData,
      })

      if (response.ok) {
        setFadeOut(true)
        setTimeout(() => {
          setCreated(true)
          setTimeout(() => navigate(`/coin/${symbol}`), 1500)
        }, 700)
      } else {
        console.error("Create failed:", await response.text())
      }
    } catch (err) {
      console.error("Request failed:", err)
    } finally {
      setLoading(false)
    }
  }

  if (created) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white bg-black animate-fadeIn">
        <h1 className="text-3xl font-bold mb-2">Coin Created Successfully!</h1>
        <p className="text-neutral-400 mb-4">Redirecting to your new coin page...</p>
        <a
          href={`/coin/${symbol}`}
          className="text-red-500 underline hover:text-red-400"
        >
          View {symbol}
        </a>
      </div>
    )
  }



  if (!loggedIn) return null

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
      className="dark"
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="dark">
        <SiteHeader />

        <div
          className={`flex flex-1 flex-col px-6 py-6 text-white transition-opacity duration-700 ${fadeOut ? "opacity-0" : "opacity-100"
            }`}
        >

          <div className="flex flex-1 flex-col px-6 py-6 text-white">
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 mx-auto">
              {/* Left: Create Coin Form */}
              <Card className="bg-[#111111] border border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Create a New Coin</CardTitle>
                  <p className="text-neutral-400 text-sm">Launch your own cryptocurrency in minutes.</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Image + Symbol */}
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex flex-col w-full">
                      <Label className="mb-1">Image</Label>
                      <Input
                        type="file"
                        className="cursor-pointer"
                        onChange={handleFileChange}
                      />
                      {fileName && (
                        <p className="text-xs text-neutral-400 mt-1">
                          {fileName}
                        </p>
                      )}
                      {coinImage && (
                        <img
                          src={coinImage}
                          alt="Preview"
                          className="mt-3 w-20 h-20 object-cover rounded-full border border-neutral-800"
                        />
                      )}
                    </div>

                    <div className="flex flex-col w-full ">
                      <Label className="mb-1">Symbol</Label>
                      <Input
                        placeholder="e.g. BTC"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                      />
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <Label className="mb-1">Name</Label>
                    <Input
                      placeholder="e.g. Bitcoin"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  {/* Fair Launch Settings */}
                  <div className="rounded-lg border border-neutral-800 bg-[#0d0d0d] p-4 text-sm text-neutral-300 leading-relaxed">
                    <h3 className="font-medium mb-2 text-white">Fair Launch Settings</h3>
                    <p className="text-neutral-400 mb-2">
                      In order to ensure a fair launch, the coin starts with the following parameters:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-neutral-300">
                      <li>Total Supply: <b>1,000,000</b></li>
                      <li>Starting Market Cap: <b>$1,000</b></li>
                      <li>Initial Price: <b>$0.001</b> per token</li>
                    </ul>
                    <p className="text-neutral-400 mt-3">
                      All participants, including the project's creators, must acquire tokens at this initial market price.
                      The value will then be determined entirely by genuine market demand and community participation.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Right: Coin Preview */}
              <Card className="bg-[#111111] border border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Coin Preview</CardTitle>
                  <p className="text-neutral-400 text-sm"></p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border border-neutral-800 bg-[#0d0d0d] p-4 text-center">
                    <div className="flex flex-col items-center">
                      {coinImage ? (
                        <img
                          src={coinImage}
                          alt="Coin preview"
                          className="w-16 h-16 object-cover rounded-full border border-neutral-700 mb-3"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500 mb-3">?</div>
                      )}
                      <p className="font-semibold text-white text-lg">
                        {name || "[Coin Name]"} ({symbol || "[Symbol]"}) - {username ? `@${username}` : "Anonymous Creator"}
                      </p>
                      <div className="mt-1 mb-1 text-3xl font-bold">$0.001</div>
                      <p className="text-neutral-400 text-sm">Market Cap: $1,000,000</p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-neutral-800 bg-[#0d0d0d] p-4">
                    <h3 className="font-medium mb-3">Cost Breakdown</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span>Coin:</span><span>$1,000</span></div>
                      <div className="flex justify-between"><span>Fee:</span><span>$100</span></div>
                      <Separator className="my-2 bg-neutral-800" />
                      <div className="flex justify-between font-semibold text-green-500">
                        <span>Total:</span><span>$1,100</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-6 text-lg cursor-pointer" onClick={handleCreateCoin} disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? "Creating..." : "Create Coin ($1,100)"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
