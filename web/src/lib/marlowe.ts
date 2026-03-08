// Marlowe contract generation and Runtime API calls.
// Marlowe Runtime preprod endpoint: https://preprod.marlowe-runtime.iog.io
// Marlowe Runtime mainnet endpoint: https://mainnet.marlowe-runtime.iog.io
//
// Vault contract flow:
//   1. deploy()    → creates the contract on-chain, returns contractId + unsigned tx
//   2. User signs and submits the tx (via wallet)
//   3. deposit()   → funder deposits the allocated ADA into the contract
//   4. User signs and submits the deposit tx
//   5. Agent calls claim() with the contractId to receive its allocation
//   6. If agent never claims before periodEnd, Close returns ADA to funder

export type MarloweParty = { address: string };
export type MarloweToken = { currency_symbol: string; token_name: string };

export const ADA: MarloweToken = { currency_symbol: '', token_name: '' };

// Builds a Marlowe vault contract for one agent.
// - funder deposits allocationLovelace into the contract
// - agent can "claim" (choice = 0) to receive the full allocation
// - if agent doesn't claim before periodEndPosix, Close sends ADA back to funder
export function buildVaultContract(
  funderAddress: string,
  agentAddress: string,
  allocationLovelace: number,
  depositDeadlinePosix: number, // epoch ms — deadline for funder to deposit
  periodEndPosix: number,       // epoch ms — deadline for agent to claim
) {
  const funder: MarloweParty = { address: funderAddress };
  const agent: MarloweParty = { address: agentAddress };

  return {
    when: [
      {
        case: {
          party: funder,
          deposits: allocationLovelace,
          of_token: ADA,
          into_account: funder,
        },
        then: {
          when: [
            {
              case: {
                choose_between: [{ from: 0, to: 0 }],
                for_choice: {
                  choice_name: 'claim',
                  choice_owner: agent,
                },
              },
              then: {
                pay: allocationLovelace,
                token: ADA,
                to: { party: agent },
                from_account: funder,
                then: 'close',
              },
            },
          ],
          timeout: periodEndPosix,
          timeout_continuation: 'close',
        },
      },
    ],
    timeout: depositDeadlinePosix,
    timeout_continuation: 'close',
  };
}

export interface DeployResult {
  contractId: string;
  txCborHex: string;
}

// POST /contracts — creates the contract and returns an unsigned tx for the funder to sign.
export async function deployVaultContract(
  runtimeUrl: string,
  funderAddress: string,
  agentAddress: string,
  allocationLovelace: number,
  depositDeadlinePosix: number,
  periodEndPosix: number,
): Promise<DeployResult> {
  const contract = buildVaultContract(
    funderAddress,
    agentAddress,
    allocationLovelace,
    depositDeadlinePosix,
    periodEndPosix,
  );

  const res = await fetch(`${runtimeUrl}/contracts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/vendor.iog.marlowe-runtime.contract-tx-json',
      'X-Change-Address': funderAddress,
    },
    body: JSON.stringify({
      contract,
      version: 'v1',
      roles: null,
      metadata: {},
      tags: { 'esqueje.vault': { agent: agentAddress, version: '1' } },
      minUTxODeposit: 2000000,
    }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`Marlowe Runtime: ${res.status} — ${msg}`);
  }

  const data = await res.json();
  return {
    contractId: data.contractId,
    txCborHex: data.tx.cborHex,
  };
}

// PUT /contracts/{id}/submit — submits the signed tx to the Runtime.
export async function submitContractTx(
  runtimeUrl: string,
  contractId: string,
  signedCborHex: string,
): Promise<void> {
  const res = await fetch(
    `${runtimeUrl}/contracts/${encodeURIComponent(contractId)}/submit`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'ShelleyTx BabbageEra',
        description: '',
        cborHex: signedCborHex,
      }),
    },
  );

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`Submit error: ${res.status} — ${msg}`);
  }
}

// GET /contracts/{id} — fetches contract status from the Runtime.
export async function getContractStatus(
  runtimeUrl: string,
  contractId: string,
): Promise<{ status: string; block?: string }> {
  const res = await fetch(
    `${runtimeUrl}/contracts/${encodeURIComponent(contractId)}`,
    { headers: { 'Accept': 'application/json' } },
  );
  if (!res.ok) throw new Error(`Status error: ${res.status}`);
  const data = await res.json();
  return { status: data.status, block: data.block?.blockHeaderHash };
}
