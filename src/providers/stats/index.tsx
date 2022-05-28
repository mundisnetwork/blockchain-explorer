import React from "react";
import { MundisClusterStatsProvider } from "./mundisClusterStats";

type Props = { children: React.ReactNode };
export function StatsProvider({ children }: Props) {
  return <MundisClusterStatsProvider>{children}</MundisClusterStatsProvider>;
}
