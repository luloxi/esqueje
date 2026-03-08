# Ethskills Summary - Para Esqueje (Cardano/AVAX)

## Skills Disponibles en ethskills.com

### Core Skills

| Skill | Descripción | Compatible AVAX | Prioridad |
|-------|-------------|-----------------|-----------|
| **Ship** | Guía end-to-end de idea a producción | ✅ Sí | Alta |
| **Why Ethereum** | Por qué Ethereum, upgrades, tradeoffs | ⚠️ Adaptar a Cardano | Media |
| **Gas & Costs** | Precios gas, costos reales | ✅ Sí (AVAX más barato) | Alta |
| **Wallets** | Crear wallets, firmar tx, multisig | ✅ Sí | Alta |
| **Layer 2s** | L2s, bridging, deployment | ⚠️ Adaptar a Cardano L2s | Media |
| **Standards** | ERC-20, ERC-721, ERC-1155, ERC-8004 | ✅ Sí (EVM compatible) | Alta |
| **Tools** | Frameworks, librerías, RPCs | ✅ Sí | Alta |
| **Money Legos** | DeFi composability (Uniswap, Aave) | ✅ Sí | Alta |
| **Orchestration** | Sistema de build en 3 fases | ✅ Sí | Media |
| **Contract Addresses** | Direcciones verificadas | ✅ Sí | Alta |
| **Concepts** | Mental models onchain | ✅ Universal | Alta |
| **Security** | Patrones seguridad Solidity | ✅ Sí | Crítica |
| **Testing** | Foundry, fuzz, fork testing | ✅ Sí | Alta |
| **Indexing** | Leer datos onchain (The Graph, Dune) | ✅ Sí | Media |
| **Frontend UX** | Reglas UX para dApps | ✅ Sí | Alta |
| **Frontend Playbook** | Pipeline producción | ✅ Sí | Alta |
| **QA** | Checklist pre-shipping | ✅ Sí | Alta |
| **AuditDeep** | Sistema de auditoría EVM | ✅ Sí | Media |

---

## Adaptación para Esqueje (Cardano)

### Diferencias Clave Cardano vs Ethereum

| Aspecto | Ethereum | Cardano |
|---------|----------|---------|
| Smart Contracts | Solidity | Plutus (Haskell) / Aiken |
| Wallet Model | EOA | UTXO-based |
| Gas | ETH | ADA |
| DeFi | Uniswap, Aave | Minswap, Liqwid |
| Standards | ERC-20/721/1155 | CIP-25/68 |

### Skills Prioritarias para Esqueje

1. **Wallets** - Crear wallet Cardano, firmar transacciones
2. **Standards** - CIP-25 (NFTs), CIP-68 (tokens)
3. **Tools** - Aiken, MeshJS, Blockfrost
4. **Money Legos** - Minswap (DEX), Liqwid (lending)
5. **Security** - Patrones Aiken, validación UTXO
6. **Gas & Costs** - Fees ADA, comparación con ETH

---

## Recursos para Fetch

```bash
# Core skills (más útiles para Esqueje)
curl -s https://ethskills.com/wallets/SKILL.md
curl -s https://ethskills.com/standards/SKILL.md
curl -s https://ethskills.com/tools/SKILL.md
curl -s https://ethskills.com/security/SKILL.md
curl -s https://ethskills.com/gas/SKILL.md
```

---

## Notas de Adaptación

### Wallet Cardano (vs Ethereum)
- Usar @meshsdk/core en lugar de ethers.js
- UTXO model en lugar de account model
- Staking nativo de ADA

### DeFi Cardano
- **DEX:** Minswap, WingRiders, SundaeSwap
- **Lending:** Liqwid, Aada
- **Stablecoins:** DJED, iUSD

### Oráculos
- **Pyth:** Ya integrado en Esqueje
- **Chainlink:** En desarrollo para Cardano
- **Charli3:** Oráculo nativo Cardano

### Testing
- Aiken test framework (similar a Foundry)
- Emulador Cardano para tests locales

---

## Próximos Pasos

1. Fetch skills prioritarias de ethskills
2. Adaptar conceptos a Cardano/Aiken
3. Crear skill específica "cardano-building" para Esqueje
4. Documentar diferencias EVM vs Cardano

---

*Resumen creado para proyecto Esqueje - Agente autónomo Cardano*
