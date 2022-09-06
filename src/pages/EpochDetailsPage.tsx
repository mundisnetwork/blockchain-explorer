import React from "react";

import { ErrorCard } from "components/common/ErrorCard";
import { ClusterStatus, useCluster } from "providers/cluster";
import { LoadingCard } from "components/common/LoadingCard";
import { TableCardBody } from "components/common/TableCardBody";
import { Epoch } from "components/common/Epoch";
import { Slot } from "components/common/Slot";
import { useEpoch, useFetchEpoch } from "providers/epoch";
import { displayTimestampUtc } from "utils/date";
import { FetchStatus } from "providers/cache";
import { useHistory } from "react-router-dom";

type Props = { epoch: string };
export function EpochDetailsPage({ epoch }: Props) {
  let history = useHistory();
  let output;
  if (isNaN(Number(epoch))) {
    output = <ErrorCard text={`Epoch ${epoch} is not valid`} />;
  } else {
    output = <EpochOverviewCard epoch={Number(epoch)} />;
  }

  return (
    <div className="container">
      <div className="header">
        <div className="header-body d-flex align-items-center">
          <button className="backButton btn btn-sm btn-white" onClick={() => history.goBack()}>Back</button>
          <h2 className="header-title ml-3">Epoch Details</h2>
          <div className="icon block ml-5 mt-0 mb-0"></div>
        </div>
      </div>
      {output}
    </div>
  );
}

type OverviewProps = { epoch: number };
function EpochOverviewCard({ epoch }: OverviewProps) {
  const { status, clusterInfo } = useCluster();

  const epochState = useEpoch(epoch);
  const fetchEpoch = useFetchEpoch();

  // Fetch extra epoch info on load
  React.useEffect(() => {
    if (!clusterInfo) return;
    const { epochInfo, epochSchedule } = clusterInfo;
    const currentEpoch = epochInfo.epoch;
    if (
      epoch <= currentEpoch &&
      !epochState &&
      status === ClusterStatus.Connected
    )
      fetchEpoch(epoch, currentEpoch, epochSchedule);
  }, [epoch, epochState, clusterInfo, status, fetchEpoch]);

  if (!clusterInfo) {
    return <LoadingCard message="Connecting to cluster" />;
  }

  const { epochInfo, epochSchedule } = clusterInfo;
  const currentEpoch = epochInfo.epoch;
  if (epoch > currentEpoch) {
    return <ErrorCard text={`Epoch ${epoch} hasn't started yet`} />;
  } else if (!epochState?.data) {
    if (epochState?.status === FetchStatus.FetchFailed) {
      return <ErrorCard text={`Failed to fetch details for epoch ${epoch}`} />;
    }
    return <LoadingCard message="Loading epoch" />;
  }

  const firstSlot = epochSchedule.getFirstSlotInEpoch(epoch);
  const lastSlot = epochSchedule.getLastSlotInEpoch(epoch);

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3 className="card-header-title mb-0 d-flex align-items-center">
            Overview
          </h3>
        </div>
        <TableCardBody>
          <tr>
            <td className="w-100">Epoch</td>
            <td className="text-lg-end font-monospace">
              <Epoch epoch={epoch} />
            </td>
          </tr>
          {epoch > 0 && (
            <tr>
              <td className="w-100">Previous Epoch</td>
              <td className="text-lg-end font-monospace">
                <Epoch epoch={epoch - 1} link />
              </td>
            </tr>
          )}
          <tr>
            <td className="w-100">Next Epoch</td>
            <td className="text-lg-end font-monospace">
              {currentEpoch > epoch ? (
                <Epoch epoch={epoch + 1} link />
              ) : (
                <span className="text-muted">Epoch in progress</span>
              )}
            </td>
          </tr>
          <tr>
            <td className="w-100">First Slot</td>
            <td className="text-lg-end font-monospace">
              <Slot slot={firstSlot} />
            </td>
          </tr>
          <tr>
            <td className="w-100">Last Slot</td>
            <td className="text-lg-end font-monospace">
              <Slot slot={lastSlot} />
            </td>
          </tr>
          {epochState.data.firstTimestamp && (
            <tr>
              <td className="w-100">First Block Timestamp</td>
              <td className="text-lg-end">
                <span className="font-monospace">
                  {displayTimestampUtc(
                    epochState.data.firstTimestamp * 1000,
                    true
                  )}
                </span>
              </td>
            </tr>
          )}
          <tr>
            <td className="w-100">First Block</td>
            <td className="text-lg-end font-monospace">
              <Slot slot={epochState.data.firstBlock} link />
            </td>
          </tr>
          <tr>
            <td className="w-100">Last Block</td>
            <td className="text-lg-end font-monospace">
              {epochState.data.lastBlock !== undefined ? (
                <Slot slot={epochState.data.lastBlock} link />
              ) : (
                <span className="text-muted">Epoch in progress</span>
              )}
            </td>
          </tr>
          {epochState.data.lastTimestamp && (
            <tr>
              <td className="w-100">Last Block Timestamp</td>
              <td className="text-lg-end">
                <span className="font-monospace">
                  {displayTimestampUtc(
                    epochState.data.lastTimestamp * 1000,
                    true
                  )}
                </span>
              </td>
            </tr>
          )}
        </TableCardBody>
      </div>
    </>
  );
}
