import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import * as Sentry from "@sentry/react";
import "./scss/theme.scss";
import App from "./App";
import { ClusterProvider } from "./providers/cluster";
import { RichListProvider } from "./providers/richList";
import { SupplyProvider } from "./providers/supply";
import { TransactionsProvider } from "./providers/transactions";
import { AccountsProvider } from "./providers/accounts";
import { BlockProvider } from "./providers/block";
import { EpochProvider } from "./providers/epoch";
import { StatsProvider } from "providers/stats";
import { MintsProvider } from "providers/mints";

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: "https://a8fb1f1a642c466f93d6108b8734f07b@o1265337.ingest.sentry.io/6449279",
  });
}

ReactDOM.render(
  <Router>
    <ClusterProvider>
      <StatsProvider>
        <SupplyProvider>
          <RichListProvider>
            <AccountsProvider>
              <BlockProvider>
                <EpochProvider>
                  <MintsProvider>
                    <TransactionsProvider>
                      <App />
                    </TransactionsProvider>
                  </MintsProvider>
                </EpochProvider>
              </BlockProvider>
            </AccountsProvider>
          </RichListProvider>
        </SupplyProvider>
      </StatsProvider>
    </ClusterProvider>
  </Router>,
  document.getElementById("root")
);

