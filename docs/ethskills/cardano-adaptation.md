# Ethskills Adaptado para Esqueje (Cardano)

## Resumen de Skills Aprendidas

### 1. Wallets (ethskills.com/wallets)

**Conceptos clave:**
- **EIP-7702:** EOAs pueden delegar a smart contracts temporalmente
- **Safe Multisig:** Patrón 1-of-2 (agente + humano)
- **Seguridad:** NUNCA commitear keys a Git

**Adaptación Cardano:**
- Usar @meshsdk/core en lugar de ethers.js
- Wallet UTXO-based (no account-based)
- Staking nativo de ADA

**Guardrails para Esqueje:**
1. Wallet dedicada con fondos limitados
2. Nunca extraer private key sin permiso humano
3. Testear en testnet primero
4. Implementar spending limits

---

### 2. Security (ethskills.com/security)

**Vulnerabilidades críticas:**

#### Token Decimals
```solidity
// Ethereum: USDC tiene 6 decimales, no 18
uint256 oneToken = 10 ** IERC20Metadata(token).decimals();
```

**Cardano:** Los tokens nativos no tienen decimales estándar. Verificar CIP-68.

#### Reentrancy
```solidity
// Pattern: Checks → Effects → Interactions (CEI)
// Usar ReentrancyGuard de OpenZeppelin
```

**Cardano:** Modelo UTXO es inherentemente más seguro contra reentrancy.

#### Oracle Manipulation
```solidity
// NUNCA usar DEX spot prices
// Usar Chainlink o TWAP
```

**Esqueje:** Ya usa Pyth, que es seguro.

#### Vault Inflation Attack
**Mitigación:** Virtual offset en ERC-4626

**Cardano:** Aún no hay estándar similar, diseñar con cuidado.

---

### 3. Gas & Costs (ethskills.com/gas)

**Ethereum actual (Early 2026):**
- Base fee: ~0.1-0.5 gwei (muy barato)
- ETH transfer: ~$0.004
- ERC-20 transfer: ~$0.013
- Uniswap swap: ~$0.036

**Cardano comparación:**
- ADA transfer: ~0.17 ADA (~$0.08)
- Token transfer: ~0.2-0.5 ADA
- Smart contract: ~0.3-2 ADA dependiendo de complejidad

**Ventaja Cardano:** Fees predecibles, no hay gas auctions.

---

## Adaptaciones para Esqueje

### Wallet Cardano
```typescript
// Usar MeshJS
import { AppWallet } from '@meshsdk/core';

const wallet = new AppWallet({
  networkId: 1, // mainnet
  fetcher: blockfrostProvider,
  submitter: blockfrostProvider,
});
```

### Seguridad Específica
1. **Validación UTXO:** Verificar inputs/outputs
2. **Datum:** Datos adjuntos a transacciones
3. **Redeemer:** Datos para consumir UTXOs
4. **Plutus scripts:** Validación on-chain

### Costos Cardano
- **Min UTXO:** ~1 ADA mínimo por UTXO
- **Tx fee:** ~0.17 ADA base
- **Script fee:** Depende de memoria y pasos

---

## Checklist Pre-Deploy (Adaptado)

- [ ] **Access control** — funciones admin restringidas
- [ ] **Pausable** — considerar timelock o multisig
- [ ] **Reentrancy** — CEI pattern (menos crítico en Cardano)
- [ ] **Token handling** — verificar políticas de minting
- [ ] **Oracle safety** — Pyth con staleness checks ✓
- [ ] **Input validation** — zero address, bounds
- [ ] **Events** — emitir eventos para tracking
- [ ] **Test edge cases** — fuzz testing con Aiken
- [ ] **Verify on explorer** — Cardanoscan o Cexplorer

---

## Próximos Pasos

1. Implementar wallet MeshJS en Esqueje
2. Agregar reentrancy guards (aunque UTXO es más seguro)
3. Testing con Aiken
4. Documentar diferencias EVM vs Cardano

---

*Skills aprendidas: Wallets, Security, Gas | Adaptación para Cardano/Esqueje*
