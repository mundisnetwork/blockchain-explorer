import bs58 from "bs58";
import {
  SystemProgram,
  StakeProgram,
  VOTE_PROGRAM_ID,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_REWARDS_PUBKEY,
  SYSVAR_STAKE_HISTORY_PUBKEY,
  ParsedTransaction,
  TransactionInstruction,
  Transaction,
  PartiallyDecodedInstruction,
  ParsedInstruction,
  Secp256k1Program,
} from "@mundis/sdk";
import { Cluster } from "providers/cluster";

export type ProgramName =
  typeof PROGRAM_NAME_BY_ID[keyof typeof PROGRAM_NAME_BY_ID];

export enum PROGRAM_NAMES {
  // native built-ins
  ADDRESS_MAP = "Address Map Program",
  CONFIG = "Config Program",
  STAKE = "Stake Program",
  SYSTEM = "System Program",
  VOTE = "Vote Program",
  SECP256K1 = "Secp256k1 Program",
  ASSOCIATED_TOKEN = "Associated Token Program",
  FEATURE_PROPOSAL = "Feature Proposal Program",
  MEMO = "Memo Program",
  TOKEN = "Token Program",
}

const ALL_CLUSTERS = [
  Cluster.Custom,
  Cluster.Devnet,
  // Cluster.Testnet,
  // Cluster.Mainnet,
];

export const PROGRAM_DEPLOYMENTS = {
  // native built-ins
  [PROGRAM_NAMES.ADDRESS_MAP]: ALL_CLUSTERS,
  [PROGRAM_NAMES.CONFIG]: ALL_CLUSTERS,
  [PROGRAM_NAMES.STAKE]: ALL_CLUSTERS,
  [PROGRAM_NAMES.SYSTEM]: ALL_CLUSTERS,
  [PROGRAM_NAMES.VOTE]: ALL_CLUSTERS,
  [PROGRAM_NAMES.SECP256K1]: ALL_CLUSTERS,
  [PROGRAM_NAMES.ASSOCIATED_TOKEN]: ALL_CLUSTERS,
  [PROGRAM_NAMES.FEATURE_PROPOSAL]: ALL_CLUSTERS,
  [PROGRAM_NAMES.MEMO]: ALL_CLUSTERS,
  [PROGRAM_NAMES.TOKEN]: ALL_CLUSTERS,
} as const;

export const PROGRAM_NAME_BY_ID = {
  // native built-ins
  Config1111111111111111111111111111111111111: PROGRAM_NAMES.CONFIG,
  [StakeProgram.programId.toBase58()]: PROGRAM_NAMES.STAKE,
  [SystemProgram.programId.toBase58()]: PROGRAM_NAMES.SYSTEM,
  [VOTE_PROGRAM_ID.toBase58()]: PROGRAM_NAMES.VOTE,
  [Secp256k1Program.programId.toBase58()]: PROGRAM_NAMES.SECP256K1,
  TokenAccount1111111111111111111111111111111: PROGRAM_NAMES.ASSOCIATED_TOKEN,
  Feat1YXHhH6t1juaWF74WLcfv4XoNocjXA6sPWHNgAse: PROGRAM_NAMES.FEATURE_PROPOSAL,
  Memo111111111111111111111111111111111111111: PROGRAM_NAMES.MEMO,
  Token11111111111111111111111111111111111111: PROGRAM_NAMES.TOKEN,
} as const;

export type LoaderName = typeof LOADER_IDS[keyof typeof LOADER_IDS];

export const LOADER_IDS = {
  NativeLoader1111111111111111111111111111111: "Native Loader",
} as const;

export const SPECIAL_IDS: { [key: string]: string } = {
  "1nc1nerator11111111111111111111111111111111": "Incinerator",
  Sysvar1111111111111111111111111111111111111: "SYSVAR",
};

export const SYSVAR_IDS = {
  [SYSVAR_CLOCK_PUBKEY.toBase58()]: "Sysvar: Clock",
  SysvarEpochSchedu1e111111111111111111111111: "Sysvar: Epoch Schedule",
  SysvarFees111111111111111111111111111111111: "Sysvar: Fees",
  SysvarRecentB1ockHashes11111111111111111111: "Sysvar: Recent Blockhashes",
  [SYSVAR_RENT_PUBKEY.toBase58()]: "Sysvar: Rent",
  [SYSVAR_REWARDS_PUBKEY.toBase58()]: "Sysvar: Rewards",
  SysvarS1otHashes111111111111111111111111111: "Sysvar: Slot Hashes",
  SysvarS1otHistory11111111111111111111111111: "Sysvar: Slot History",
  [SYSVAR_STAKE_HISTORY_PUBKEY.toBase58()]: "Sysvar: Stake History",
  Sysvar1nstructions1111111111111111111111111: "Sysvar: Instructions",
};

export function programLabel(
  address: string,
  cluster: Cluster
): string | undefined {
  const programName = PROGRAM_NAME_BY_ID[address];
  if (programName && PROGRAM_DEPLOYMENTS[programName].includes(cluster)) {
    return programName;
  }

  // @ts-ignore
  return LOADER_IDS[address];
}

export function tokenLabel(
  address: string,
): string | undefined {
  return `Unknown token`;
}

export function addressLabel(
  address: string,
  cluster: Cluster,
): string | undefined {
  return (
    programLabel(address, cluster) ||
    SYSVAR_IDS[address] ||
    SPECIAL_IDS[address] ||
    tokenLabel(address)
  );
}

export function displayAddress(
  address: string,
  cluster: Cluster,
): string {
  return addressLabel(address, cluster) || address;
}

export function intoTransactionInstruction(
  tx: ParsedTransaction,
  instruction: ParsedInstruction | PartiallyDecodedInstruction
): TransactionInstruction | undefined {
  const message = tx.message;
  if ("parsed" in instruction) return;

  const keys = [];
  for (const account of instruction.accounts) {
    const accountKey = message.accountKeys.find(({ pubkey }) =>
      pubkey.equals(account)
    );
    if (!accountKey) return;
    keys.push({
      pubkey: accountKey.pubkey,
      isSigner: accountKey.signer,
      isWritable: accountKey.writable,
    });
  }

  return new TransactionInstruction({
    data: bs58.decode(instruction.data),
    keys: keys,
    programId: instruction.programId,
  });
}

export function intoParsedTransaction(tx: Transaction): ParsedTransaction {
  const message = tx.compileMessage();
  return {
    signatures: tx.signatures.map((value) =>
      bs58.encode(value.signature as any)
    ),
    message: {
      accountKeys: message.accountKeys.map((key, index) => ({
        pubkey: key,
        signer: tx.signatures.some(({ publicKey }) => publicKey.equals(key)),
        writable: message.isAccountWritable(index),
      })),
      instructions: message.instructions.map((ix) => ({
        programId: message.accountKeys[ix.programIdIndex],
        accounts: ix.accounts.map((index) => message.accountKeys[index]),
        data: ix.data,
      })),
      recentBlockhash: message.recentBlockhash,
    },
  };
}
