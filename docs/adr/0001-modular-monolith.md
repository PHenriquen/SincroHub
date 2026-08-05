# ADR 0001 — Monólito modular orientado a domínio

**Status:** aceito

## Contexto

O Orbital Command reúne telemetria, incidentes, integrações e automações. Separar tudo em microsserviços agora aumentaria custo operacional sem usuários ou carga que justifiquem a complexidade.

## Decisão

Começar como monólito modular NestJS. Cada domínio possui contratos e serviços próprios; gateways e workers continuam processos separados. As dependências apontam para dentro do domínio e a comunicação entre módulos ocorre por interfaces/eventos.

## Consequências

- desenvolvimento e testes locais simples;
- transações e observabilidade centralizadas;
- limites explícitos permitem extrair um worker ou serviço quando métricas reais exigirem;
- acesso direto entre módulos deve ser evitado fora das APIs exportadas.
