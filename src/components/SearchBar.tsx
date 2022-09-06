import React from "react";
import bs58 from "bs58";
import { useHistory, useLocation } from "react-router-dom";
import Select, { InputActionMeta, ActionMeta, ValueType } from "react-select";
import StateManager from "react-select";
import {
  PROGRAM_NAME_BY_ID,
  SPECIAL_IDS,
  SYSVAR_IDS,
  programLabel,
} from "utils/tx";
import { Cluster, useCluster } from "providers/cluster";

export function SearchBar() {
  const [search, setSearch] = React.useState("");
  const selectRef = React.useRef<StateManager<any> | null>(null);
  const history = useHistory();
  const location = useLocation();
  const { cluster, clusterInfo } = useCluster();

  const onChange = (
    { pathname }: ValueType<any, false>,
    meta: ActionMeta<any>
  ) => {
    if (meta.action === "select-option") {
      history.push({ ...location, pathname });
      setSearch("");
    }
  };

  const onInputChange = (value: string, { action }: InputActionMeta) => {
    if (action === "input-change") setSearch(value);
  };

  const resetValue = "" as any;
  return (
    <div className="container main-title mb-5">
      <div className="row align-items-center justify-content-center">
        <h1 className="col text-center">
          MUNDIS <strong>BLOCKCHAIN EXPLORER</strong>
        </h1>
      </div>
      <div className="row align-items-center justify-content-center">
        <div className="col-8">
          <Select
            ref={(ref) => (selectRef.current = ref)}
            options={buildOptions(
              search,
              cluster,
              clusterInfo?.epochInfo.epoch
            )}
            noOptionsMessage={() => "No Results"}
            placeholder="Search for blocks, accounts, transactions and programs"
            value={resetValue}
            inputValue={search}
            blurInputOnSelect
            onMenuClose={() => selectRef.current?.blur()}
            onChange={onChange}
            styles={{
              /* work around for https://github.com/JedWatson/react-select/issues/3857 */
              placeholder: (style) => ({ ...style, pointerEvents: "none" }),
              input: (style) => ({ ...style, width: "100%" }),
            }}
            onInputChange={onInputChange}
            components={{ DropdownIndicator }}
            classNamePrefix="search-bar"
          />
        </div>
      </div>
    </div>
  );
}

function buildProgramOptions(search: string, cluster: Cluster) {
  const matchedPrograms = Object.entries(PROGRAM_NAME_BY_ID).filter(
    ([address]) => {
      const name = programLabel(address, cluster);
      if (!name) return false;
      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        address.includes(search)
      );
    }
  );

  if (matchedPrograms.length > 0) {
    return {
      label: "Programs",
      options: matchedPrograms.map(([id, name]) => ({
        label: name,
        value: [name, id],
        pathname: "/address/" + id,
      })),
    };
  }
}

function buildSysvarOptions(search: string) {
  const matchedSysvars = Object.entries(SYSVAR_IDS).filter(
    ([address, name]) => {
      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        address.includes(search)
      );
    }
  );

  if (matchedSysvars.length > 0) {
    return {
      label: "Sysvars",
      options: matchedSysvars.map(([id, name]) => ({
        label: name,
        value: [name, id],
        pathname: "/address/" + id,
      })),
    };
  }
}

function buildSpecialOptions(search: string) {
  const matchedSpecialIds = Object.entries(SPECIAL_IDS).filter(
    ([address, name]) => {
      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        address.includes(search)
      );
    }
  );

  if (matchedSpecialIds.length > 0) {
    return {
      label: "Accounts",
      options: matchedSpecialIds.map(([id, name]) => ({
        label: name,
        value: [name, id],
        pathname: "/address/" + id,
      })),
    };
  }
}

function buildOptions(
  rawSearch: string,
  cluster: Cluster,
  currentEpoch?: number
) {
  const search = rawSearch.trim();
  if (search.length === 0) return [];

  const options = [];

  const programOptions = buildProgramOptions(search, cluster);
  if (programOptions) {
    options.push(programOptions);
  }

  const sysvarOptions = buildSysvarOptions(search);
  if (sysvarOptions) {
    options.push(sysvarOptions);
  }

  const specialOptions = buildSpecialOptions(search);
  if (specialOptions) {
    options.push(specialOptions);
  }

  if (!isNaN(Number(search))) {
    options.push({
      label: "Block",
      options: [
        {
          label: `Slot #${search}`,
          value: [search],
          pathname: `/block/${search}`,
        },
      ],
    });

    if (currentEpoch !== undefined && Number(search) <= currentEpoch + 1) {
      options.push({
        label: "Epoch",
        options: [
          {
            label: `Epoch #${search}`,
            value: [search],
            pathname: `/epoch/${search}`,
          },
        ],
      });
    }
  }

  // Prefer nice suggestions over raw suggestions
  if (options.length > 0) return options;

  try {
    const decoded = bs58.decode(search);
    if (decoded.length === 32) {
      options.push({
        label: "Account",
        options: [
          {
            label: search,
            value: [search],
            pathname: "/address/" + search,
          },
        ],
      });
    } else if (decoded.length === 64) {
      options.push({
        label: "Transaction",
        options: [
          {
            label: search,
            value: [search],
            pathname: "/tx/" + search,
          },
        ],
      });
    }
  } catch (err) {}
  return options;
}

function DropdownIndicator() {
  return (
    <div className="search-indicator">
      <span className="fe fe-search"></span>
    </div>
  );
}
