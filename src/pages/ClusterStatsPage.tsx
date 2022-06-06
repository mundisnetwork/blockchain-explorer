import React from "react";
import { TableCardBody } from "components/common/TableCardBody";
import { Slot } from "components/common/Slot";
import {
  ClusterStatsStatus,
  useDashboardInfo,
  usePerformanceInfo,
  useStatsProvider,
} from "providers/stats/mundisClusterStats";
import { abbreviatedNumber, lamportsToMundis, slotsToHumanString } from "utils";
import { ClusterStatus, useCluster } from "providers/cluster";
import { TpsCard } from "components/TpsCard";
import { displayTimestampWithoutDate, displayTimestampUtc } from "utils/date";
import { Status, useFetchSupply, useSupply } from "providers/supply";
import { ErrorCard } from "components/common/ErrorCard";
import { LoadingCard } from "components/common/LoadingCard";
import { useVoteAccounts } from "providers/accounts/vote-accounts";
import { CoingeckoStatus, useCoinGecko } from "utils/coingecko";
import { Epoch } from "components/common/Epoch";

const CLUSTER_STATS_TIMEOUT = 5000;

export function ClusterStatsPage() {
  return (
    <div className="container mt-4">
      <StakingComponent />
      <div className="card">
        <StatsCardBody />
      </div>
      {/*<TpsCard />*/}
    </div>
  );
}

function StakingComponent() {
  const { status } = useCluster();
  const supply = useSupply();
  const fetchSupply = useFetchSupply();
  const { fetchVoteAccounts, voteAccounts } = useVoteAccounts();

  function fetchData() {
    fetchSupply();
    fetchVoteAccounts();
  }

  React.useEffect(() => {
    if (status === ClusterStatus.Connected) {
      fetchData();
    }
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const delinquentStake = React.useMemo(() => {
    if (voteAccounts) {
      return voteAccounts.delinquent.reduce(
        (prev, current) => prev + current.activatedStake,
        0
      );
    } else {
      return 0;
    }
  }, [voteAccounts]);

  const activeStake = React.useMemo(() => {
    if (voteAccounts && delinquentStake >= 0) {
      return (
        voteAccounts.current.reduce(
          (prev, current) => prev + current.activatedStake,
          0
        ) + delinquentStake
      );
    }
  }, [voteAccounts, delinquentStake]);

  if (supply === Status.Disconnected) {
    // we'll return here to prevent flicker
    return null;
  }

  if (supply === Status.Idle || supply === Status.Connecting) {
    return <LoadingCard message="Loading supply data" />;
  } else if (typeof supply === "string") {
    return <ErrorCard text={supply} retry={fetchData} />;
  }

  const circulatingPercentage = (
    (supply.circulating / supply.total) *
    100
  ).toFixed(1);

  let delinquentStakePercentage = "0";
  if (delinquentStake && activeStake) {
    delinquentStakePercentage = ((delinquentStake / activeStake) * 100).toFixed(
      1
    );
  }

  return (
    <div className="row staking-card">
      <div className="col-12 col-lg-4 col-xl">
        <div className="card">
          <div className="card-body">
            <div className="row no-gutters">
              <div className="col-6">
                <h4 className="card-header-title">Active Stake</h4>
              </div>
              <div className="col-6">
                {activeStake && (
                  <h1>
                    <em>{displayLamports(activeStake)}</em> /{" "}
                    <small>{displayLamports(supply.total)}</small>
                  </h1>
                )}

                {delinquentStakePercentage && (
                  <h5>
                    Delinquent stake: <em>{delinquentStakePercentage}%</em>
                  </h5>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 col-lg-4 col-xl">
        <div className="card">
          <div className="card-body">
            <div className="row no-gutters">
              <div className="col-6">
                <h4 className="card-header-title">Circulating Supply</h4>
              </div>
              <div className="col-6">
                <h1>
                  <em>{displayLamports(supply.circulating)}</em> /{" "}
                  <small>{displayLamports(supply.total)}</small>
                </h1>
                <h5>
                  <em>{circulatingPercentage}%</em> is circulating
                </h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function displayLamports(value: number) {
  return abbreviatedNumber(lamportsToMundis(value));
}

function StatsCardBody() {
  const dashboardInfo = useDashboardInfo();
  const performanceInfo = usePerformanceInfo();
  const { setActive } = useStatsProvider();
  const { cluster } = useCluster();

  React.useEffect(() => {
    setActive(true);
    return () => setActive(false);
  }, [setActive, cluster]);

  if (
    performanceInfo.status !== ClusterStatsStatus.Ready ||
    dashboardInfo.status !== ClusterStatsStatus.Ready
  ) {
    const error =
      performanceInfo.status === ClusterStatsStatus.Error ||
      dashboardInfo.status === ClusterStatsStatus.Error;
    return <StatsNotReady error={error} />;
  }

  const { avgSlotTime_1h, avgSlotTime_1min, epochInfo, blockTime } =
    dashboardInfo;
  const hourlySlotTime = Math.round(1000 * avgSlotTime_1h);
  const averageSlotTime = Math.round(1000 * avgSlotTime_1min);
  const { slotIndex, slotsInEpoch } = epochInfo;
  const epochProgress = ((100 * slotIndex) / slotsInEpoch).toFixed(1) + "%";
  const epochTimeRemaining = slotsToHumanString(
    slotsInEpoch - slotIndex,
    hourlySlotTime
  );
  const { blockHeight, absoluteSlot } = epochInfo;

  return (
    <div className="card-body status-card">
      <h4 className="card-header-title">Live Cluster Stats</h4>
      {blockTime && (
        <h5 className="mt-2">
          Cluster time: {displayTimestampUtc(blockTime, true)}
        </h5>
      )}

      <div className="row mt-4">
        <div className="col-4">
          <h4>Epoch</h4>
          <Epoch epoch={epochInfo.epoch} link />
          <p className="my-0">
            <span>{epochProgress}</span> complete
          </p>
          <p className="my-0">
            <span>~{epochTimeRemaining}</span> remaining
          </p>
        </div>
        <div className="col-4">
          <h4>Slot</h4>
          <Slot slot={absoluteSlot} link />
          <p className="my-0">
            Slot time (1min average): <span>{averageSlotTime}ms</span>
          </p>
          <p className="my-0">
            Slot time (1hr average): <span>{hourlySlotTime}ms</span>
          </p>
        </div>
        <div className="col-4">
          <h4>Block height</h4>
          {blockHeight !== undefined && <Slot slot={blockHeight} />}
        </div>
      </div>
    </div>
  );
}

export function StatsNotReady({ error }: { error: boolean }) {
  const { setTimedOut, retry, active } = useStatsProvider();
  const { cluster } = useCluster();

  React.useEffect(() => {
    let timedOut = 0;
    if (!error) {
      timedOut = setTimeout(setTimedOut, CLUSTER_STATS_TIMEOUT);
    }
    return () => {
      if (timedOut) {
        clearTimeout(timedOut);
      }
    };
  }, [setTimedOut, cluster, error]);

  if (error || !active) {
    return (
      <div className="card-body text-center">
        There was a problem loading cluster stats.{" "}
        <button
          className="btn btn-white btn-sm"
          onClick={() => {
            retry();
          }}
        >
          <span className="fe fe-refresh-cw me-2"></span>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="card-body text-center">
      <span className="spinner-grow spinner-grow-sm me-2"></span>
      Loading
    </div>
  );
}
