import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header";
import { SectionCards } from "@/components/section-cards";

type Coin = {
  created_at: string;
  id: number;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage: number;
  circulating_supply: number;
};

type User = {
  id: string;
  access_token: string;
}

export default function Home() {
  const navigate = useNavigate();

  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<User>();
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState("");


  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      return "Good morning";
    } else if (currentHour < 18) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)userData=([^;]*)/);
    if (match) {
      try {
        const decoded = decodeURIComponent(match[1]);
        const data = JSON.parse(decoded);
        if (data?.user?.username) {
          setUsername(data.user.username);
        }
      } catch (err) {
        console.error("Failed to parse userData cookie:", err);
      }
    }
  }, []);


  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userId = localStorage.getItem("user_id");

    if (userId && token) {
      const userFull: User = {
        id: userId,
        access_token: token,
      };
      setUser(userFull);
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!loggedIn) return;

    const fetchCoins = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://coinbrew.vercel.app/api/coins/all", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ min_price: 0 }),
        });

        if (!res.ok) throw new Error("Failed to fetch coins");

        const data = await res.json();
        setCoins(data.coins);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, [loggedIn]);


  //fetch user profile, store in cookie temporarily (1 hour)
  useEffect(() => {
    if (!loggedIn) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`https://coinbrew.vercel.app/api/coins/user/${user?.id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Failed to fetch user profile");

        const data = await res.json();

        //set cookie
        document.cookie = `userData=${JSON.stringify(data)}; max-age=${60 * 60}; path=/`;
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, [loggedIn, user]);
  if (!loggedIn) return null;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
      className={"dark"}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="dark">
        <SiteHeader />


        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 md:gap-6 py-4 md:py-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white tabular-nums !pl-6">
              {getGreeting()}, {username}
            </h1>
            <h3 className="text-lg text-muted-foreground pl-6">
              Here's the market for today - {formatDate(new Date().toISOString())}
            </h3>

            <SectionCards />
          </div>
        </div>

      </SidebarInset>




    </SidebarProvider>


  );
}
