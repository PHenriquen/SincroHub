# Arquitetura

## Contexto

O sistema combina integrações de software e telemetria física sem acoplar protocolos específicos ao domínio de incidentes.

## Fluxo

1. Gateways e integrações publicam eventos.
2. A camada de ingestão valida contratos e aplica idempotência.
3. Telemetria é associada a um asset.
4. Rules Engine avalia limites, correlações e janelas.
5. Incident Management agrupa sinais relacionados.
6. Automation Workers executam ações permitidas.
7. Audit registra todas as transições.

## Módulos

- **Identity:** organização, usuário, equipe, RBAC.
- **Assets:** inventário e relacionamentos.
- **Telemetry:** séries temporais e estado recente.
- **Rules:** condições, severidade e cooldown.
- **Incidents:** lifecycle, responsável e timeline.
- **Automations:** gatilhos, ações, tentativas e aprovação.
- **Integrations:** webhooks e conectores.
- **Audit:** trilha imutável de ações críticas.

## Decisões iniciais

- Monorepo TypeScript para compartilhar contratos.
- NestJS para modularidade do backend.
- Next.js para dashboard e experiência web.
- Gateway separado para isolar serial/hardware.
- PostgreSQL como fonte de verdade.
- Redis para cache, rate limit e filas.
- Modo in-memory permitido apenas na vertical slice.

## Evolução

A v0.1 mantém telemetria e incidentes em memória para provar o fluxo. Persistência, autenticação e processamento assíncrono entram antes de integrações externas adicionais.
