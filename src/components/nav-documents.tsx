"use client";

import { useEffect, useState } from "react";
import { cacheData } from "@/lib/cacheData";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import { Link } from "react-router-dom";

async function fetchPortData(userId: string): Promise<{ totalValue: string; coinValue: string }> {
  const res = await fetch(`http://127.0.0.1:8000/api/coins/portfolio/${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch portfolio data");

  const data = await res.json();
  const { total_value, balance } = data.portfolio;
  return {
    totalValue: total_value.toFixed(2),
    coinValue: (total_value - balance).toFixed(2),
  };
}


export function NavDocuments() {
  const [portfolio, setPortfolio] = useState({ totalValue: "", coinValue: "" });

  useEffect(() => {
    const loadPortfolio = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      const result = await cacheData(`portfolio_data`, () => fetchPortData(userId), 60000);

      if (result) setPortfolio(result);
    };

    loadPortfolio();
  }, []);

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel><Link to="/portfolio">My Portfolio</Link></SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton className="flex justify-between items-center cursor-default">
            <span className="text-sm font-medium">Total Value:</span>
            <span className="text-sm font-mono outline-2 px-2 py-1 rounded-md">{portfolio.totalValue || "..."}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton className="flex justify-between items-center cursor-default">
            <span className="text-sm font-medium">Coin Value:</span>
            <span className="text-sm font-mono outline-2 px-2 py-1 rounded-md">{portfolio.coinValue || "..."}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>

        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
