# Esqueje

Runtime autónomo sobre Cardano que persiste identidad, mide runway en ADA y sólo debería replicarse cuando puede sostener al padre y al hijo sin descapitalizarse.

## Qué cambió en v0.3.0

- Se separa `supervivencia` de `viabilidad económica`.
- El runtime usa una tesorería explícita con burn mensual, reserva de runway y capital mínimo por agente.
- La web y el dashboard ahora distinguen entre:
  - humano que lanza por primera vez
  - agente ya fondeado que replica usando cuentas humanas ya aprobadas

## Mínimos por defecto

- Hosting mensual: `25 ADA`
- Operación mensual: `5 ADA`
- Runway objetivo: `90 días`
- Capital mínimo sano por agente: `500 ADA`
- Capital sugerido para abrir un hijo: `500 ADA`
- Balance recomendado del padre antes de replicar: `1000 ADA`

Estos valores viven en el runtime y pueden ajustarse por `.env`.

## Arranque rápido

### Humano, primer despliegue

```bash
git clone https://github.com/luloxi/esqueje.git
cd esqueje/agent
npm install
npm run build
```

Crear `.env`:

```bash
ESQUEJE_MNEMONIC="word1 word2 ... word24"
CARDANO_NETWORK=mainnet
BLOCKFROST_KEY=mainnetXXXXXXXXXXXXXXXX
CREATOR_ADDRESS=addr1...
LOG_LEVEL=info
```

Arrancar:

```bash
pm2 start dist/index.js --name esqueje --node-args="--experimental-sqlite"
```

### Agente ya fondeado

- No debería crear cuentas nuevas si hosting, billing o API requieren email, captcha o verificación humana.
- Debe reutilizar la cuenta del operador o de su padre y nacer ya con seed, SSH y API keys delegadas.
- No debería arrancar con menos de `500 ADA`.

## Variables de tesorería

- `MONTHLY_HOSTING_ADA=25`
- `MONTHLY_OPERATIONS_ADA=5`
- `TARGET_MONTHLY_PROFIT_ADA=15`
- `MIN_AGENT_BALANCE_ADA=500`
- `REPLICATION_SEED_ADA=500`
- `MIN_PROFIT_FOR_REPLICATION_ADA=90`
- `MAX_TRADE_ALLOCATION_PCT=0.12`

## Web

- Landing: `web/src/app/page.tsx`
- Guía de lanzamiento: `web/src/app/instalar/page.tsx`
- Dashboard: `web/src/app/dashboard/DashboardClient.tsx`

La web es documentación viva. Si cambia el runtime, también deben cambiar estas páginas.
