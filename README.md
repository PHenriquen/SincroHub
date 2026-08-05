# ORBITAL COMMAND

> Unified operations, observability and automation platform.

O **Orbital Command** transforma sinais dispersos — telemetria, webhooks, eventos de software e mensagens operacionais — em incidentes priorizados, responsáveis, automações e histórico auditável.

Ele nasce da combinação de três ideias complementares:

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

O Orbital Command reúne esse fluxo em uma única central operacional.

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

- **Centro de comando único:** software, operação e equipamentos no mesmo modelo.
- **Modo simulado:** demonstração completa sem depender de hardware.
- **Incidentes explicáveis:** cada alerta registra a regra, os sinais e a linha do tempo.
- **Automação segura:** ações rastreáveis, idempotentes e com aprovação quando necessário.
- **Arquitetura orientada a eventos:** preparada para filas, workers e integrações.
- **Identidade visual própria:** experiência de central espacial sem perder a clareza empresarial.

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

- **Nome:** Orbital Command
- **Conceito:** diferentes sistemas orbitando um núcleo operacional
- **Paleta:** espaço profundo, grafite, azul e ciano
- **Tom:** preciso, confiável, técnico e futurista
- **Símbolo:** três núcleos conectados formando discretamente uma órbita

Veja [docs/PRODUCT.md](docs/PRODUCT.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) e [docs/ROADMAP.md](docs/ROADMAP.md).

## Status

**v0.2 — operational core**

A vertical slice cobre telemetria, saúde, abertura de incidente, automação de resposta e lifecycle operacional. A arquitetura segue um monólito modular registrado em ADR, e o dashboard já possui um sistema visual próprio documentado em [docs/BRAND.md](docs/BRAND.md).

## Origem e créditos

Conceitos e aprendizados foram derivados de projetos anteriores do mesmo autor:

- [SyncHub](https://github.com/PHenriquen/SyncHub)
- SVI / Interface (repositório privado)

Nenhum dos repositórios originais é alterado por este projeto.

## Licença

MIT — consulte [LICENSE](LICENSE).
