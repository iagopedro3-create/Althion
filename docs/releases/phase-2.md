# Evidências da Fase 2 — Radar e Score

## Estado

Implementação concluída em 16 de julho de 2026. Aceite técnico condicionado à execução das migrations e do pgTAP em Docker/CI.

## Entregas

- contratos Zod e domínio puro do Score;
- fórmula `1.0.0-provisional`, pesos aprovados e suficiência de 75%;
- migration aditiva com oito tabelas, quatro RPCs, policies e triggers;
- API REST de rascunho, prévia, envio, Score, comparação e exportação;
- formulário em três etapas, histórico, resultado, evidências e recomendações;
- relatório de impressão/PDF do navegador e CSV sanitizado;
- documentação técnica, de dados, segurança e operação atualizada.

## Verificações executadas

| Comando/verificação | Resultado                                            |
| ------------------- | ---------------------------------------------------- |
| `pnpm lint`         | passou sem warnings                                  |
| `pnpm typecheck`    | passou                                               |
| `pnpm test`         | 25/25 testes passaram                                |
| `pnpm build`        | Next.js e NestJS passaram                            |
| `pnpm test:e2e`     | 2/2 testes Chromium passaram, incluindo axe no login |
| `pnpm audit --prod` | nenhuma vulnerabilidade conhecida                    |
| `pnpm peers check`  | nenhuma incompatibilidade de peer                    |
| Smoke API produção  | `live=ok`; Radar sem token retornou `401`            |
| Inspeção visual     | Score completo revisado em viewport Desktop Chrome   |

## Segurança verificada em código

- capabilities específicas de Radar, Score e exportação;
- token Supabase permanece server-side nas ações e proxies;
- Score persistido é calculado no banco a partir dos inputs, não aceito do browser;
- assessments enviados, snapshots e fórmulas publicadas são imutáveis;
- CSV neutraliza células iniciadas por `=`, `+`, `-` ou `@`;
- exportações geram auditoria sem incluir métricas brutas no log;
- operator não possui capability e a policy o exclui;
- especialistas dependem de assignment ativo;
- doctor/viewer só leem assessment concluído pelo RLS proposto;
- nenhuma service role, PII, campo clínico ou endpoint Helena foi adicionado.

## Validação de banco pendente

Os arquivos `supabase/migrations/20260716120000_radar_score.sql` e `supabase/tests/radar_score_rls.test.sql` estão versionados. A suíte nova possui 22 assertions; somada à Fundação, são 37.

Antes de merge/staging, executar:

```bash
pnpm db:start
pnpm db:reset
pnpm db:lint
pnpm test:db
pnpm db:types
pnpm check
pnpm test:e2e
```

Revisar o diff dos tipos gerados e não sobrescrever migrations já aplicadas.

## Limitações

- fórmula ainda `draft/provisional`, sem thresholds externos ou owner nominal;
- inputs exclusivamente manuais;
- E2E autenticado do Radar aguardando Supabase local/CI;
- impressão usa o mecanismo do navegador; não há PDF persistido;
- comparação automática cobre os dois snapshots mais recentes e sinaliza períodos incompatíveis;
- nenhuma integração, automação ou IA foi iniciada.
