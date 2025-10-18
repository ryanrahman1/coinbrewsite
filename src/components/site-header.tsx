import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useLocation } from "react-router-dom"
import { CircleUserRound } from "lucide-react"

export function SiteHeader() {
  const location = useLocation();

  // lil map to make nice names from paths
  const getPageTitle = (path: string) => {
    switch (path) {
      case "/":
        return "Home";
      case "/portfolio":
        return "Portfolio";
      case "/settings":
        return "Settings";
      case "/coins":
        return "Coins";
      case "/profile":
        return "Profile";
      default:
        return path.replace("/", "").replace(/^\w/, (c) => c.toUpperCase()) || "Home";
    }
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) text-white">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 text-white" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{pageTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <span onClick={() => console.log("clicked")}>
              <CircleUserRound className="!h-6 !w-6 text-white" />
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
