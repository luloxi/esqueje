import type { TreasurySnapshot } from './economics.js';
import type { TradeSignal } from './trading.js';

export interface RevenueOpportunity {
  id: string;
  label: string;
  expectedReturnPct: number;
  capitalRequiredAda: number;
  risk: 'low' | 'medium' | 'high';
  action: 'trade' | 'provide-service' | 'hold-cash';
  reason: string;
}

export class OpportunityEngine {
  selectBest(
    treasury: TreasurySnapshot,
    signal: TradeSignal
  ): RevenueOpportunity {
    const safeServiceFloor: RevenueOpportunity = {
      id: 'service-floor',
      label: 'Microservicio pagado en ADA',
      expectedReturnPct: 0.02,
      capitalRequiredAda: 0,
      risk: 'low',
      action: 'provide-service',
      reason: 'Prioriza flujo de caja no especulativo para pagar hosting',
    };

    if (treasury.runwayDays < 45) {
      return safeServiceFloor;
    }

    if (signal.action === 'hold' || signal.confidence < 0.6) {
      return {
        id: 'hold-cash',
        label: 'Mantener tesorería líquida',
        expectedReturnPct: 0,
        capitalRequiredAda: 0,
        risk: 'low',
        action: 'hold-cash',
        reason: signal.reason,
      };
    }

    return {
      id: 'pyth-momentum',
      label: `Trading ${signal.action.toUpperCase()} con Pyth`,
      expectedReturnPct: signal.expectedEdgePct ?? 0,
      capitalRequiredAda: Math.min(treasury.spendableAda, signal.suggestedCapitalAda ?? 10),
      risk: signal.confidence > 0.8 ? 'medium' : 'high',
      action: 'trade',
      reason: signal.reason,
    };
  }
}
