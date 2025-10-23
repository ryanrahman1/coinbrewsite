import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { SectionCards } from "@/components/section-cards";
import { cacheFetch } from "@/lib/idbCache"; // ✅ need this, not just getCache
import { userFromCache } from "@/lib/userFromCache";
import { type User } from "@/lib/types/User";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Good morning";
    if (currentHour < 18) return "Good afternoon";
    return "Good evening";
  };

  // 🧠 Try loading from cache first
  useEffect(() => {
    (async () => {
      try {
        const cachedUser = await userFromCache();
        if (cachedUser) {
          setUser(cachedUser);
        } else {
          console.warn("No cached user found, logging out...");
          localStorage.removeItem("coinbrew_user_logged_in");
          navigate("/");
        }
      } catch (err) {
        console.error("Error reading cached user:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  // 🔁 Once we have user or if cache empty, refetch and recache from /me
  useEffect(() => {
    if (loading) return; // wait until first cache check done

    async function fetchAndCacheUser() {
      try {
        console.log("Fetching user /me...");
        const res = await fetch("http://127.0.0.1:8000/api/v2/user/me", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          console.warn("Failed to fetch user profile:", res.status);
          if (res.status === 401) {
            localStorage.removeItem("coinbrew_user_logged_in");
            navigate("/");
          }
          return;
        }

        const profile: User = await res.json();

        // cacheFetch ensures caching logic is consistent
        await cacheFetch(`user-profile-${profile.id}`, async () => profile);

        // set both React state and base user cache (for other pages)
        setUser(profile);

        console.log("✅ User profile updated + cached:", profile.username);
      } catch (err) {
        console.error("Error fetching user /me:", err);
      }
    }

    fetchAndCacheUser();
  }, [loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-300">
        Loading profile...
      </div>
    );
  }

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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 md:gap-6 py-4 md:py-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white pl-6">
              {getGreeting()}, {user.username || "Guest"}
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
