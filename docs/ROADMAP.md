# Roadmap

## v0.1 — Foundation

- [x] identidade e proposta do produto;
- [x] monorepo TypeScript;
- [x] contratos compartilhados;
- [x] API de telemetria;
- [x] cálculo inicial de saúde;
- [x] incidente crítico automático;
- [x] simulador sem hardware;
- [x] dashboard inicial;
- [x] validar instalação e build em ambiente Node 22;
- [ ] adicionar testes do health score.

## v0.2 — Operational Core

- [ ] PostgreSQL + Prisma;
- [ ] assets, regras, incidentes e timeline persistentes;
- [ ] autenticação e organizações;
- [ ] assumir, resolver e reabrir incidentes;
- [ ] atualizações por SSE ou WebSocket;
- [ ] Docker Compose para a aplicação completa.

## v0.3 — Integration Network

- [ ] webhooks assinados;
- [ ] health checks de serviços;
- [ ] integração GitHub;
- [ ] deduplicação e retries;
- [ ] rule builder;
- [ ] notificações configuráveis.

## v0.4 — Industrial Gateway

- [ ] adaptador serial reaproveitando aprendizados do SVI;
- [ ] detecção automática de Arduino;
- [ ] temperatura, vibração, corrente e produção;
- [ ] buffer offline e reenvio;
- [ ] firmware de referência para ESP32/Arduino.

## v0.5 — Automation & Intelligence

- [ ] workers e filas;
- [ ] aprovações para ações sensíveis;
- [ ] playbooks operacionais;
- [ ] correlação de sinais;
- [ ] sugestões de causa e resolução assistidas por IA;
- [ ] métricas MTTR, MTBF e disponibilidade.
