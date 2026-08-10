# SINCROHUB

> **Sistema Integrado de Operações e Monitoramento**

O **SincroHub** sincroniza sinais dispersos - telemetria, webhooks, eventos de software e mensagens operacionais - em um hub único de monitoramento, incidentes, responsáveis, automações e histórico auditável.

O projeto reúne aprendizados de três frentes anteriores:

- **SyncHub:** integrações, rastreabilidade e automações;
- **SVI:** telemetria industrial, sensores, Arduino e simulação;
- **Nexus Ops:** observabilidade, incidentes, métricas e resposta operacional.

Os projetos de origem permanecem independentes. Este repositório possui arquitetura, domínio e evolução próprios.

## O problema

Equipes normalmente descobrem problemas em ferramentas diferentes, recebem alertas sem contexto e perdem tempo até entender:

- o que aconteceu;
- qual o impacto;
- quem deve agir;
- quais dados ajudam no diagnóstico;
- se o problema já ocorreu antes;
- quais ações podem ser automatizadas.

O **SincroHub** reúne e sincroniza esse fluxo em uma única operação monitorada e rastreável.

## Fluxo principal

```text
Fonte -> Ingestão -> Normalização -> Regra -> Incidente -> Responsável -> Automação -> Auditoria
```

Exemplos de fontes:

- sensores de temperatura, vibração, corrente e produção;
- Arduino/ESP32 por gateway serial;
- webhooks de GitHub e aplicações;
- métricas e health checks;
- integrações futuras com e-mail, mensageria e ferramentas corporativas.

## Diferenciais

- **Hub operacional único:** software, serviços, processos e equipamentos no mesmo modelo.
- **Sincronização de contexto:** telemetria e eventos convergem para uma visão operacional única.
- **Modo simulado:** demonstração completa sem depender de hardware.
- **Incidentes explicáveis:** cada alerta registra a regra, os sinais e a linha do tempo.
- **Automação segura:** ações rastreáveis, idempotentes e com aprovação quando necessário.
- **Arquitetura orientada a eventos:** preparada para filas, workers e integrações.

## Arquitetura inicial

```text
apps/
  api/          API NestJS e módulos de domínio
  web/          dashboard Next.js
  gateway/      ponte serial/HTTP para Arduino e sensores
packages/
  contracts/    contratos e tipos compartilhados
docs/           produto, arquitetura e decisões técnicas
```

Tecnologias planejadas:

- TypeScript, Next.js e NestJS;
- PostgreSQL e Prisma;
- Redis e filas para processamento assíncrono;
- WebSocket/SSE para atualizações em tempo real;
- Docker Compose;
- OpenTelemetry, logs estruturados e métricas;
- testes unitários, integração, E2E e CI.

## Domínios do produto

| Domínio | Responsabilidade |
|---|---|
| Telemetry | Receber, validar e armazenar sinais |
| Assets | Representar serviços, máquinas e componentes |
| Rules | Avaliar limiares, correlações e janelas |
| Incidents | Prioridade, estado, responsável e timeline |
| Automations | Executar respostas configuráveis e auditáveis |
| Integrations | Webhooks, APIs e conectores |
| Identity | Organizações, equipes, papéis e permissões |
| Audit | Registrar decisões e mudanças críticas |

## Primeiro marco: vertical slice

A primeira entrega deve demonstrar um fluxo completo:

1. gateway gera ou recebe temperatura, vibração e corrente;
2. API normaliza a telemetria;
3. regra calcula o índice de saúde do ativo;
4. condição crítica abre um incidente automaticamente;
5. dashboard atualiza em tempo real;
6. usuário assume e resolve o incidente;
7. timeline preserva todo o histórico.

O índice inicial segue a ideia validada no SVI:

```text
Saúde = temperatura (30%) + vibração (40%) + corrente (30%)
```

Os componentes serão normalizados antes do cálculo; os pesos poderão ser configurados posteriormente.

## Identidade

- **Nome:** SincroHub
- **Nome completo:** Sistema Integrado de Operações e Monitoramento
- **Conceito:** sincronizar dados, ativos, sistemas e respostas em um hub operacional único
- **Tom:** técnico, industrial, preciso e apresentável
- **Direção visual:** interface operacional escura, legível e orientada a estado, telemetria e incidentes

Veja [docs/PRODUCT.md](docs/PRODUCT.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) e [docs/ROADMAP.md](docs/ROADMAP.md).

## Status

**v0.1 - foundation**

A base do monorepo, os contratos do domínio e o simulador de telemetria estão em construção. O objetivo imediato é entregar a vertical slice executável antes de expandir integrações.

## Origem e créditos

Conceitos e aprendizados foram derivados de projetos anteriores do mesmo autor:

- [SyncHub](https://github.com/PHenriquen/SyncHub)
- SVI / Interface (repositório privado)

Nenhum dos repositórios originais é alterado por este projeto.

## Licença

MIT - consulte [LICENSE](LICENSE).
