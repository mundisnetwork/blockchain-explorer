import React from "react";
import { Link } from "react-router-dom";
import { PublicKey } from "@mundis/sdk";
import { clusterPath } from "utils/url";
import { displayAddress } from "utils/tx";
import { useCluster } from "providers/cluster";
import { Copyable } from "./Copyable";

type Props = {
  pubkey: PublicKey;
  alignRight?: boolean;
  link?: boolean;
  raw?: boolean;
  truncate?: boolean;
  truncateUnknown?: boolean;
  truncateChars?: number;
  useMetadata?: boolean;
};

export function Address({
  pubkey,
  alignRight,
  link,
  raw,
  truncate,
  truncateUnknown,
  truncateChars,
  useMetadata,
}: Props) {
  const address = pubkey.toBase58();
  const { cluster } = useCluster();

  if (truncateUnknown && address === displayAddress(address, cluster)) {
    truncate = true;
  }

  let addressLabel = raw ? address : displayAddress(address, cluster);

  if (truncateChars && addressLabel === address) {
    addressLabel = addressLabel.slice(0, truncateChars) + "…";
  }

  const content = (
    <Copyable text={address} replaceText={!alignRight}>
      <span className="font-monospace">
        {link ? (
          <Link
            className={truncate ? "text-truncate address-truncate" : ""}
            to={clusterPath(`/address/${address}`)}
          >
            {addressLabel}
          </Link>
        ) : (
          <span className={truncate ? "text-truncate address-truncate" : ""}>
            {addressLabel}
          </span>
        )}
      </span>
    </Copyable>
  );

  return (
    <>
      <div
        className={`d-none d-lg-flex align-items-center ${
          alignRight ? "justify-content-end" : ""
        }`}
      >
        {content}
      </div>
      <div className="d-flex d-lg-none align-items-center">{content}</div>
    </>
  );
}
