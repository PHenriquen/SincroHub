# SINCROHUB

> **Sistema Integrado de Operações e Monitoramento**

O **SincroHub** sincroniza sinais dispersos — telemetria, webhooks, eventos de software e mensagens operacionais — em um hub único de monitoramento, incidentes, responsáveis, automações e histórico auditável.

O projeto reúne aprendizados de três frentes anteriores:

- **SyncHub:** integrações, rastreabilidade e automações;
- **SVI:** telemetria industrial, sensores, Arduino e simulação;
- **Nexus Ops:** observabilidade, incidentes, métricas e resposta operacional.

Os projetos de origem permanecem independentes. Este repositório possui arquitetura, domínio e evolução próprios.

## Problema

Equipes normalmente descobrem problemas em ferramentas diferentes, recebem alertas sem contexto e perdem tempo até entender o que aconteceu, qual o impacto, quem deve agir, quais dados ajudam no diagnóstico e quais respostas podem ser automatizadas.

O SincroHub centraliza esse fluxo e adiciona uma camada técnica de **backend, streaming de dados, observabilidade, analytics/ML e infraestrutura cloud**.

## Fluxo principal

```text
Fonte -> Ingestão -> Normalização -> Stream/Fila -> Agregação -> Regra/ML
                                                            |
                                                            v
                                                     Incidente -> Ação
                                                            |
                                                            v
                                                   Auditoria/Histórico
```

Exemplos de fontes:

- sensores de temperatura, vibração, corrente e produção;
- Arduino/ESP32 por gateway serial;
- webhooks de GitHub e aplicações;
- métricas e health checks;
- integrações futuras com e-mail, mensageria e ferramentas corporativas.

## Arquitetura

```text
apps/
  api/          NestJS, domínio, ingestão, data pipeline e analytics
  web/          dashboard Next.js
  gateway/      ponte serial/HTTP para Arduino e sensores
packages/
  contracts/    contratos e tipos compartilhados
infra/
  terraform/    fundação AWS como Infrastructure as Code
docs/           produto, arquitetura, decisões técnicas e cloud/data/ML
```

### Tecnologias

- **Frontend:** Next.js + TypeScript;
- **Backend:** NestJS + TypeScript;
- **Dados operacionais:** PostgreSQL + Prisma;
- **Processamento assíncrono:** Redis/filas como evolução arquitetural;
- **Tempo real:** WebSocket/SSE;
- **Containers:** Docker Compose;
- **Observabilidade:** OpenTelemetry, logs estruturados e métricas;
- **Data Engineering:** agregação temporal e pipeline de telemetria;
- **ML/analytics:** detector de anomalias treinável e explicável;
- **Cloud:** Terraform + AWS foundation;
- **Qualidade:** testes unitários, integração, E2E e CI.

## Data Engineering

`apps/api/src/data/window-aggregator.ts` implementa uma primeira primitive executável de processamento de telemetria. Ela agrupa eventos por ativo e janela de tempo e produz médias/máximas para análise posterior.

A arquitetura permite evoluir de processamento local para Redis Streams, Kafka, SQS/Kinesis ou outra infraestrutura distribuída sem mudar o contrato central do domínio.

## Machine Learning / Anomaly Detection

`apps/api/src/analytics/anomaly-detector.ts` adiciona um modelo estatístico pequeno e treinável. A partir de telemetria considerada saudável, ele aprende baseline de temperatura, vibração e corrente e calcula um score ponderado de anomalia.

```text
baseline saudável -> treino -> modelo -> nova telemetria -> score -> possível incidente
```

O objetivo é ter um baseline transparente e testável antes de experimentar modelos mais pesados.

## Cloud / AWS

`infra/terraform/` adiciona Infrastructure as Code real para uma fundação AWS com:

- ECR para imagens da API e web;
- image scanning;
- S3 criptografado para arquivo de telemetria;
- bloqueio de acesso público;
- lifecycle de armazenamento histórico;
- CloudWatch para logs da API e workers.

Terraform **não é aplicado automaticamente**. Executar `terraform apply` pode criar recursos cobrados pela AWS. O desenho completo está em [`docs/CLOUD_DATA_ML.md`](docs/CLOUD_DATA_ML.md).

## Domínios do produto

| Domínio | Responsabilidade |
|---|---|
| Telemetry | Receber, validar e armazenar sinais |
| Data Pipeline | Agregar, transformar e preparar séries temporais |
| Analytics | Baselines, scores e detecção de anomalia |
| Assets | Representar serviços, máquinas e componentes |
| Rules | Avaliar limiares, correlações e janelas |
| Incidents | Prioridade, estado, responsável e timeline |
| Automations | Executar respostas configuráveis e auditáveis |
| Integrations | Webhooks, APIs e conectores |
| Identity | Organizações, equipes, papéis e permissões |
| Audit | Registrar decisões e mudanças críticas |

## Vertical slice

A primeira entrega deve demonstrar um fluxo completo:

1. gateway gera ou recebe temperatura, vibração e corrente;
2. API normaliza a telemetria;
3. pipeline agrega sinais por janela;
4. regra calcula o índice de saúde do ativo;
5. detector treinável pode gerar um score de anomalia;
6. condição crítica abre um incidente automaticamente;
7. dashboard atualiza em tempo real;
8. usuário assume e resolve o incidente;
9. timeline preserva todo o histórico.

O índice inicial mantém a ideia validada no SVI:

```text
Saúde = temperatura (30%) + vibração (40%) + corrente (30%)
```

Os componentes são normalizados antes do cálculo; pesos poderão ser configurados posteriormente.

## Diferenciais de engenharia

- **Full-stack real:** dashboard, API e gateway;
- **arquitetura orientada a eventos:** preparada para filas e workers;
- **dados:** telemetria temporal, agregação e histórico;
- **analytics/ML:** modelo treinável conectado ao domínio operacional;
- **cloud:** infraestrutura declarativa em Terraform;
- **observabilidade:** métricas, logs e tracing como parte do produto;
- **integração físico-digital:** sensores e software no mesmo fluxo.

## Identidade

- **Nome:** SincroHub
- **Nome completo:** Sistema Integrado de Operações e Monitoramento
- **Conceito:** sincronizar dados, ativos, sistemas e respostas em um hub operacional único
- **Tom:** técnico, industrial, preciso e apresentável
- **Direção visual:** interface operacional escura, legível e orientada a estado, telemetria e incidentes

Veja [`docs/PRODUCT.md`](docs/PRODUCT.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/ROADMAP.md`](docs/ROADMAP.md) e [`docs/CLOUD_DATA_ML.md`](docs/CLOUD_DATA_ML.md).

## Status

**v0.1 — foundation expandida**

A base do monorepo, contratos do domínio e simulador continuam em construção. Cloud, data engineering e analytics foram adicionados como fundações incrementais; o objetivo imediato segue sendo uma vertical slice executável antes de expandir infraestrutura de produção.

## Licença

MIT — consulte [LICENSE](LICENSE).
