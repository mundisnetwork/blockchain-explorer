import React from "react";

import { ErrorCard } from "components/common/ErrorCard";
import { BlockOverviewCard } from "components/block/BlockOverviewCard";
import { useHistory } from "react-router-dom";


// IE11 doesn't support Number.MAX_SAFE_INTEGER
const MAX_SAFE_INTEGER = 9007199254740991;


type Props = { slot: string; tab?: string };

export function BlockDetailsPage({ slot, tab }: Props) {
  let history = useHistory();
  const slotNumber = Number(slot);
  let output = <ErrorCard text={`Block ${slot} is not valid`} />;

  if (
    !isNaN(slotNumber) &&
    slotNumber < MAX_SAFE_INTEGER &&
    slotNumber % 1 === 0
  ) {
    output = <BlockOverviewCard slot={slotNumber} tab={tab} />;
  }

  return (

    <div className="container">.
        <div className="header-body d-flex align-items-center">
            <button className="backButton btn btn-sm btn-white" onClick={() => history.goBack()}>Back</button>
            <h2 className="header-title ml-3">Block Details</h2>
            <div className="icon block ml-5 mt-0 mb-0"></div>
        </div>
      {output}
    </div>
  );
}
