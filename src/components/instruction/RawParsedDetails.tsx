import React from "react";
import { ParsedInstruction } from "@mundis/sdk";

export function RawParsedDetails({
  ix,
  children,
}: {
  ix: ParsedInstruction;
  children?: React.ReactNode;
}) {
  return (
    <>
      {children}

      <tr>
        <td>
          Instruction Data <span className="text-muted">(JSON)</span>
        </td>
        <td className="text-lg-end">
          <pre className="d-inline-block text-start json-wrap">
            {JSON.stringify(ix.parsed, null, 2)}
          </pre>
        </td>
      </tr>
    </>
  );
}
