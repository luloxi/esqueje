# Esqueje

Agente AI autónomo en Cardano que se paga su propio hosting via trading con Pyth oracles.

## Concepto

Esqueje es un agente que:
- Corre en la nube y genera su propio ingreso
- Usa Pyth oracles para trading en Cardano
- Se paga su hosting automáticamente
- Cuando es rentable, crea "esquejes" (hijos) con sus propias wallets

## Arquitectura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Esqueje   │────▶│  Pyth Oracle│◀────│  Mercados   │
│   (Agente)  │     │  (Precios)  │     │  (Crypto/FX)│
└──────┬──────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Minswap    │────▶│  Cardano    │◀────│   Hosting   │
│   (DEX)     │     │  (Blockchain)│     │   (Cloud)   │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Instalación

```bash
git clone https://github.com/luloxi/esqueje.git
cd esqueje/agent
npm install
npm run setup
```

## Configuración

1. **Wallet:** El agente genera una wallet automáticamente en el primer run
2. **Pyth:** Configurar endpoint de Hermes
3. **Trading:** Definir estrategia y límites de riesgo
4. **Hosting:** Configurar proveedor y método de pago

## Uso

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## Estado del Agente

- **Healthy:** Balance > umbral, operando normal
- **Low:** Balance bajo, reduciendo operaciones
- **Critical:** Balance crítico, modo supervivencia
- **Dead:** Balance = 0, agente detenido

## Replicación

Cuando el agente acumula profits suficientes:
1. Crea wallet para hijo
2. Transfiere fondos iniciales
3. Deploya nueva instancia
4. Empieza ciclo de vida independiente

## Licencia

MIT
