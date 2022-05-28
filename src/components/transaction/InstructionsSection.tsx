import React from "react";
import { ErrorCard } from "components/common/ErrorCard";
import {
  ParsedInnerInstruction,
  ParsedInstruction,
  ParsedTransaction,
  PartiallyDecodedInstruction,
  PublicKey,
  SignatureResult,
  TransactionSignature,
} from "@mundis/sdk";
import { MemoDetailsCard } from "components/instruction/MemoDetailsCard";
import { StakeDetailsCard } from "components/instruction/stake/StakeDetailsCard";
import { SystemDetailsCard } from "components/instruction/system/SystemDetailsCard";
import { TokenDetailsCard } from "components/instruction/token/TokenDetailsCard";
import { UnknownDetailsCard } from "components/instruction/UnknownDetailsCard";
import {
  SignatureProps,
  INNER_INSTRUCTIONS_START_SLOT,
} from "pages/TransactionDetailsPage";
import { intoTransactionInstruction } from "utils/tx";
import { useFetchTransactionDetails } from "providers/transactions/parsed";
import {
  useTransactionDetails,
  useTransactionStatus,
} from "providers/transactions";
import { Cluster, useCluster } from "providers/cluster";
import { VoteDetailsCard } from "components/instruction/vote/VoteDetailsCard";
import { AssociatedTokenDetailsCard } from "components/instruction/AssociatedTokenDetailsCard";

export type InstructionDetailsProps = {
  tx: ParsedTransaction;
  ix: ParsedInstruction;
  index: number;
  result: SignatureResult;
  innerCards?: JSX.Element[];
  childIndex?: number;
};

export function InstructionsSection({ signature }: SignatureProps) {
  const status = useTransactionStatus(signature);
  const details = useTransactionDetails(signature);
  const { cluster } = useCluster();
  const fetchDetails = useFetchTransactionDetails();
  const refreshDetails = () => fetchDetails(signature);

  if (!status?.data?.info || !details?.data?.transaction) return null;

  const { transaction } = details.data.transaction;
  const { meta } = details.data.transaction;

  if (transaction.message.instructions.length === 0) {
    return <ErrorCard retry={refreshDetails} text="No instructions found" />;
  }

  const innerInstructions: {
    [index: number]: (ParsedInstruction | PartiallyDecodedInstruction)[];
  } = {};

  if (
    meta?.innerInstructions &&
    (// cluster !== Cluster.Mainnet ||
      details.data.transaction.slot >= INNER_INSTRUCTIONS_START_SLOT)
  ) {
    meta.innerInstructions.forEach((parsed: ParsedInnerInstruction) => {
      if (!innerInstructions[parsed.index]) {
        innerInstructions[parsed.index] = [];
      }

      parsed.instructions.forEach((ix) => {
        innerInstructions[parsed.index].push(ix);
      });
    });
  }

  const result = status.data.info.result;
  const instructionDetails = transaction.message.instructions.map(
    (instruction, index) => {
      let innerCards: JSX.Element[] = [];

      if (index in innerInstructions) {
        innerInstructions[index].forEach((ix, childIndex) => {
          if (typeof ix.programId === "string") {
            ix.programId = new PublicKey(ix.programId);
          }

          let res = renderInstructionCard({
            index,
            ix,
            result,
            signature,
            tx: transaction,
            childIndex,
          });

          innerCards.push(res);
        });
      }

      return renderInstructionCard({
        index,
        ix: instruction,
        result,
        signature,
        tx: transaction,
        innerCards,
      });
    }
  );

  return (
    <>
      <div className="container">
        <div className="header">
          <div className="header-body">
            <h3 className="mb-0">Instruction(s)</h3>
          </div>
        </div>
      </div>
      {instructionDetails}
    </>
  );
}

function renderInstructionCard({
  ix,
  tx,
  result,
  index,
  signature,
  innerCards,
  childIndex,
}: {
  ix: ParsedInstruction | PartiallyDecodedInstruction;
  tx: ParsedTransaction;
  result: SignatureResult;
  index: number;
  signature: TransactionSignature;
  innerCards?: JSX.Element[];
  childIndex?: number;
}) {
  const key = `${index}-${childIndex}`;

  if ("parsed" in ix) {
    const props = {
      tx,
      ix,
      result,
      index,
      innerCards,
      childIndex,
      key,
    };

    switch (ix.program) {
      case "token":
        return <TokenDetailsCard {...props} />;
      case "system":
        return <SystemDetailsCard {...props} />;
      case "stake":
        return <StakeDetailsCard {...props} />;
      case "memo":
        return <MemoDetailsCard {...props} />;
      case "associated-token-account":
        return <AssociatedTokenDetailsCard {...props} />;
      case "vote":
        return <VoteDetailsCard {...props} />;
      default:
        return <UnknownDetailsCard {...props} />;
    }
  }

  const transactionIx = intoTransactionInstruction(tx, ix);

  if (!transactionIx) {
    return (
      <ErrorCard
        key={key}
        text="Could not display this instruction, please report"
      />
    );
  }

  const props = {
    ix: transactionIx,
    result,
    index,
    signature,
    innerCards,
    childIndex,
  };

  return <UnknownDetailsCard key={key} {...props} />;
}
