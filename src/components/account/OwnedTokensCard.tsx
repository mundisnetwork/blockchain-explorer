import React from "react";
import { PublicKey } from "@mundis/sdk";
import { FetchStatus } from "providers/cache";
import {
  useFetchAccountOwnedTokens,
  useAccountOwnedTokens,
  TokenInfoWithPubkey,
} from "providers/accounts/tokens";
import { ErrorCard } from "components/common/ErrorCard";
import { LoadingCard } from "components/common/LoadingCard";
import { Address } from "components/common/Address";
import { useQuery } from "utils/url";
import { Link } from "react-router-dom";
import { Location } from "history";
import { BigNumber } from "bignumber.js";
import { Identicon } from "components/common/Identicon";

type Display = "summary" | "detail" | null;

const SMALL_IDENTICON_WIDTH = 16;

const useQueryDisplay = (): Display => {
  const query = useQuery();
  const filter = query.get("display");
  if (filter === "summary" || filter === "detail") {
    return filter;
  } else {
    return null;
  }
};

export function OwnedTokensCard({ pubkey }: { pubkey: PublicKey }) {
  const address = pubkey.toBase58();
  const ownedTokens = useAccountOwnedTokens(address);
  const fetchAccountTokens = useFetchAccountOwnedTokens();
  const refresh = () => fetchAccountTokens(pubkey);
  const [showDropdown, setDropdown] = React.useState(false);
  const display = useQueryDisplay();

  // Fetch owned tokens
  React.useEffect(() => {
    if (!ownedTokens) refresh();
  }, [address]); // eslint-disable-line react-hooks/exhaustive-deps

  if (ownedTokens === undefined) {
    return null;
  }

  const { status } = ownedTokens;
  const tokens = ownedTokens.data?.tokens;
  const fetching = status === FetchStatus.Fetching;
  if (fetching && (tokens === undefined || tokens.length === 0)) {
    return <LoadingCard message="Loading token holdings" />;
  } else if (tokens === undefined) {
    return <ErrorCard retry={refresh} text="Failed to fetch token holdings" />;
  }

  if (tokens.length === 0) {
    return (
      <ErrorCard
        retry={refresh}
        retryText="Try Again"
        text={"No token holdings found"}
      />
    );
  }

  return (
    <>
      {showDropdown && (
        <div className="dropdown-exit" onClick={() => setDropdown(false)} />
      )}

      <div className="card">
        <div className="card-header align-items-center">
          <h3 className="card-header-title">Token Holdings</h3>
          <DisplayDropdown
            display={display}
            toggle={() => setDropdown((show) => !show)}
            show={showDropdown}
          />
        </div>
        {display === "detail" ? (
          <HoldingsDetailTable tokens={tokens} />
        ) : (
          <HoldingsSummaryTable tokens={tokens} />
        )}
      </div>
    </>
  );
}

function HoldingsDetailTable({ tokens }: { tokens: TokenInfoWithPubkey[] }) {
  const detailsList: React.ReactNode[] = [];

  tokens.forEach((tokenAccount) => {
    const address = tokenAccount.pubkey.toBase58();
    const mintAddress = tokenAccount.info.mint.toBase58();
    detailsList.push(
      <tr key={address}>
        <td>
          <Address pubkey={tokenAccount.pubkey} link truncate />
        </td>
        <td>
          <Address pubkey={tokenAccount.info.mint} link truncate />
        </td>
        <td>
          {tokenAccount.info.tokenAmount.uiAmountString}{" "}
        </td>
      </tr>
    );
  });

  return (
    <div className="table-responsive mb-0">
      <table className="table table-sm table-nowrap card-table">
        <thead>
          <tr>
            <th className="text-muted">Account Address</th>
            <th className="text-muted">Mint Address</th>
            <th className="text-muted">Balance</th>
          </tr>
        </thead>
        <tbody className="list">{detailsList}</tbody>
      </table>
    </div>
  );
}

function HoldingsSummaryTable({ tokens }: { tokens: TokenInfoWithPubkey[] }) {
  const mappedTokens = new Map<string, string>();
  for (const { info: token } of tokens) {
    const mintAddress = token.mint.toBase58();
    const totalByMint = mappedTokens.get(mintAddress);

    let amount = token.tokenAmount.uiAmountString;
    if (totalByMint !== undefined) {
      amount = new BigNumber(totalByMint)
        .plus(token.tokenAmount.uiAmountString)
        .toString();
    }

    mappedTokens.set(mintAddress, amount);
  }

  const detailsList: React.ReactNode[] = [];
  mappedTokens.forEach((totalByMint, mintAddress) => {
    detailsList.push(
      <tr key={mintAddress}>
        <td>
          <Address pubkey={new PublicKey(mintAddress)} link useMetadata />
        </td>
        <td>
          {totalByMint}
        </td>
      </tr>
    );
  });

  return (
    <div className="table-responsive mb-0">
      <table className="table table-sm table-nowrap card-table">
        <thead>
          <tr>
            <th className="text-muted">Mint Address</th>
            <th className="text-muted">Total Balance</th>
          </tr>
        </thead>
        <tbody className="list">{detailsList}</tbody>
      </table>
    </div>
  );
}

type DropdownProps = {
  display: Display;
  toggle: () => void;
  show: boolean;
};

const DisplayDropdown = ({ display, toggle, show }: DropdownProps) => {
  const buildLocation = (location: Location, display: Display) => {
    const params = new URLSearchParams(location.search);
    if (display === null) {
      params.delete("display");
    } else {
      params.set("display", display);
    }
    return {
      ...location,
      search: params.toString(),
    };
  };

  const DISPLAY_OPTIONS: Display[] = [null, "detail"];
  return (
    <div className="dropdown">
      <button
        className="btn btn-white btn-sm dropdown-toggle"
        type="button"
        onClick={toggle}
      >
        {display === "detail" ? "Detailed" : "Summary"}
      </button>
      <div className={`dropdown-menu-end dropdown-menu${show ? " show" : ""}`}>
        {DISPLAY_OPTIONS.map((displayOption) => {
          return (
            <Link
              key={displayOption || "null"}
              to={(location) => buildLocation(location, displayOption)}
              className={`dropdown-item${
                displayOption === display ? " active" : ""
              }`}
              onClick={toggle}
            >
              {displayOption === "detail" ? "Detailed" : "Summary"}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
