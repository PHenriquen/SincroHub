# SincroHub

SincroHub é um projeto de monitoramento operacional que junta telemetria, incidentes e ações em um mesmo fluxo.

A ideia nasceu depois de trabalhar em projetos separados de integração e monitoramento industrial. Em vez de criar mais um dashboard que só exibe gráficos, quero que o sistema consiga acompanhar o caminho completo de um sinal: **receber o dado, entender o estado, abrir um incidente quando necessário e registrar o que foi feito depois.**

> Estado atual: `v0.1`. A base do monorepo existe, mas o projeto ainda está sendo fechado como uma vertical slice antes de crescer em infraestrutura.

## Fluxo principal

```text
fonte de dados
     ↓
gateway / ingestão
     ↓
normalização
     ↓
telemetria e agregação
     ↓
regra / análise
     ↓
incidente
     ↓
ação + histórico
```

Um exemplo simples é uma máquina enviando temperatura, vibração e corrente. O gateway entrega as leituras para a API, o backend mantém o histórico e calcula o estado do ativo. Quando uma condição crítica aparece, a ideia é abrir um incidente que possa ser acompanhado e resolvido pelo dashboard.

## O que já está no repositório

- API em NestJS/TypeScript;
- dashboard em Next.js;
- gateway separado para entrada serial/HTTP;
- contratos compartilhados entre as aplicações;
- PostgreSQL + Prisma na base de dados;
- agregação de telemetria por janela de tempo;
- detector estatístico de anomalias como experimento local;
- Docker Compose para o ambiente de desenvolvimento;
- uma fundação de Terraform/AWS mantida separada do fluxo local.

A parte de cloud e o detector de anomalias não são tratados como requisitos para o sistema funcionar. Quero primeiro deixar o caminho local de telemetria → incidente bem resolvido.

## Estrutura

```text
apps/
├── api/          # backend, telemetria, incidentes e análise
├── gateway/      # entrada serial/HTTP
└── web/          # dashboard

packages/
└── contracts/    # tipos e contratos compartilhados

infra/
└── terraform/    # experimentos de infraestrutura AWS

docs/             # notas de arquitetura e produto
```

## Pontos do código

Algumas partes que representam melhor a direção atual:

- `apps/api/src/data/window-aggregator.ts` — agrupa leituras por ativo e janela;
- `apps/api/src/analytics/anomaly-detector.ts` — baseline estatístico simples e treinável;
- `apps/gateway/` — fronteira entre fonte física/simulada e API;
- `packages/contracts/` — dados compartilhados sem duplicar tipos entre aplicações.

## Stack

| Parte | Tecnologia |
|---|---|
| Web | Next.js + TypeScript |
| API | NestJS + TypeScript |
| Banco | PostgreSQL + Prisma |
| Gateway | TypeScript |
| Tempo real | WebSocket / SSE |
| Ambiente local | Docker Compose |
| Observabilidade | OpenTelemetry |
| Infra experimental | Terraform / AWS |

## Rodando localmente

Requisitos:

- Node.js 22+
- npm 10+
- Docker, caso queira subir os serviços auxiliares pelo Compose

```bash
npm install
npm run check
npm run build
```

Durante o desenvolvimento também é possível iniciar cada workspace separadamente:

```bash
npm run dev:api
npm run dev:web
npm run dev:gateway
```

## Próximo passo

O foco imediato é uma única demonstração completa e pequena:

1. gerar/receber telemetria;
2. salvar e agregar as leituras;
3. calcular o estado do ativo;
4. abrir um incidente quando uma regra for atingida;
5. atualizar o dashboard;
6. assumir e resolver o incidente;
7. preservar a timeline.

Se esse fluxo estiver bom, aí faz sentido evoluir filas, workers, cloud e análises mais sofisticadas.

## Sobre o nome

`SyncHub` é um projeto anterior focado em sincronização de desenvolvimento/GitHub. **SincroHub é outro projeto**, voltado a operações e monitoramento. Algumas ideias de integração vieram do projeto antigo, mas os dois repositórios têm objetivos diferentes.

## Documentação

Mais detalhes ficam em [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) e [`docs/PRODUCT.md`](docs/PRODUCT.md).

## Licença

MIT — consulte [LICENSE](LICENSE).
