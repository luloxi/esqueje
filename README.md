# Esqueje

Runtime autónomo sobre Cardano que persiste identidad, mide runway en ADA y sólo debería replicarse cuando puede sostener al padre y al hijo sin descapitalizarse.

## Qué cambió en v0.3.0

- Se separa `supervivencia` de `viabilidad económica`.
- El runtime usa una tesorería explícita con burn mensual, reserva de runway y capital mínimo por agente.
- **NUEVO: Integración con Telegram** - Controla tu agente y recibe alertas vía Telegram.
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

Crear `.env` (ver `.env.example` para todas las opciones):

```bash
ESQUEJE_MNEMONIC="word1 word2 ... word24"
CARDANO_NETWORK=mainnet
BLOCKFROST_KEY=mainnetXXXXXXXXXXXXXXXX
CREATOR_ADDRESS=addr1...
LOG_LEVEL=info
```

### Configurar Telegram (Opcional pero recomendado)

1. Habla con [@BotFather](https://t.me/botfather) en Telegram
2. Crea un nuevo bot con `/newbot`
3. Copia el token que te da
4. Agrega a tu `.env`:

```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrSTUvwxyz
TELEGRAM_CHAT_IDS=tu_chat_id

# Alertas inteligentes (opcional)
ALERT_MIN_PROFIT_ADA=5          # Alertar si profit > 5 ADA
ALERT_CRITICAL_BALANCE_ADA=100  # Alertar si balance < 100 ADA
ALERT_DAILY_SUMMARY=true        # Resumen diario
```

Para obtener tu chat ID, habla con [@userinfobot](https://t.me/userinfobot).

**Alertas Automáticas:**
El agente envía alertas automáticas cuando:
- 🎉 Trade exitoso (>5 ADA profit)
- ⚠️ Pérdida significativa en trade
- 🚨 Balance crítico (bajo el mínimo)
- 🌱 Replicación posible o completada
- 💎 Oportunidad de arbitraje detectada
- 📊 Resumen diario (si está habilitado)

**Auto-Replicación:**
Cuando `REPLICATION_ENABLED=true`, el agente:
- Se replica automáticamente al alcanzar >1000 ADA
- Crea wallet hija, transfiere 500 ADA, genera configuración
- Notifica por Telegram en cada paso
- Respeta cooldown de 24h entre replicaciones
- Límite de 10 generaciones por defecto

**Comandos disponibles en Telegram:**
- `/start` - Mensaje de bienvenida
- `/status` - Estado del agente
- `/balance` - Balance en ADA
- `/trades` - Últimas operaciones
- `/economics` - Salud económica
- `/sleep` - Poner a dormir
- `/wake` - Despertar
- `/replicate` - Verificar si puede replicarse
- `/help` - Mostrar todos los comandos

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
