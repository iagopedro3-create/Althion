# Fase 5 — Recovery Engine (sem execução)

## Resultado

Implementada em 17 de julho de 2026 no branch `codex/phase-5-recovery`. O Recovery identifica oportunidades administrativas por regras determinísticas versionadas sobre dados sintéticos do `MockCrmProvider`, aplica governança de consentimento, supressão e frequência, e encerra cada ação em decisão humana registrada.

**Nenhum contato é enviado.** O estado `executed` não existe no schema: ações terminam em `approved`, `rejected` ou `expired`. A feature flag `recovery.engine.v1` é global e `false` por padrão, habilitada apenas no seed sintético.

## Escopo entregue

### Domínio (`packages/domain/src/recovery`)

- política `RECOVERY_POLICY_VERSION = '1.0.0-provisional'`;
- duas regras determinísticas: `lead_no_response` (> 24 h e ≤ 30 dias sem resposta) e `attended_no_booking` (> 72 h e ≤ 60 dias após primeira resposta, sem oportunidade ganha);
- governança: consentimento deny-by-default (só `granted` é elegível), supressão ativa e frequência (máx. 1 ação aprovada/7 dias, 3/30 dias) — cada exclusão carrega razão tipada (`excluded_no_consent`, `excluded_suppressed`, `excluded_frequency`);
- cada candidato grava regra, versão, janela avaliada e evidência;
- ordenação determinística: mesmo snapshot e mesmo relógio produzem o mesmo resultado;
- máquinas de estado de oportunidade e ação, ambas terminais após decisão.

### Banco e isolamento

A migration `20260717150000_recovery.sql` adiciona `recovery_consents`, `recovery_suppressions` (uma ativa por lead, com revogação), `recovery_simulations` (contadores explicáveis), `recovery_opportunities` (unique por run+regra+lead), `recovery_actions`, e os históricos append-only de oportunidade e ação.

RPCs `security definer` com idempotência e auditoria sem payload de lead: `run_recovery_simulation`, `decide_recovery_opportunity`, `decide_recovery_action`, `create_recovery_suppression`, `revoke_recovery_suppression`, `set_recovery_consent`.

Defesa em profundidade: o `run_recovery_simulation` **revalida no banco** consentimento, supressão e frequência de cada candidato antes de persistir — uma API adulterada não consegue inserir um lead sem consentimento ou suprimido. Aprovar uma ação exige oportunidade já aprovada.

RLS: leitura para Especialista com assignment ativo, owner, manager e platform_admin; simulação apenas para Especialista/admin (`can_simulate_recovery`); doctor, viewer e operator negados em tudo.

### API

```text
GET  /api/v1/organizations/:orgId/clinics/:clinicId/recovery/queue          recovery:read
POST /api/v1/organizations/:orgId/clinics/:clinicId/recovery/simulations    recovery:simulate
POST .../recovery/opportunities/:id/decisions                               recovery:decide
POST .../recovery/actions/:id/decisions                                     recovery:decide
POST .../recovery/suppressions                                              suppression:manage
POST .../recovery/suppressions/:id/revoke                                   suppression:manage
```

A simulação lê o `MockCrmProvider` pela camada de integração existente (Helena segue bloqueada), avalia as regras no domínio e persiste via RPC. Todas as respostas identificam `provider: mock` e `executionAvailable: false`. Commands exigem `Idempotency-Key`.

Novas capabilities: `recovery:read`, `recovery:simulate`, `recovery:decide`, `suppression:read`, `suppression:manage`. `recovery:simulate` passou a integrar o conjunto interno (junto às do Cockpit) que nunca é concedido automaticamente a papéis tenant; owner e manager leem e decidem, mas não simulam.

### Web

`/cockpit/recovery` (acessível pela conta do Cockpit): simulações com contadores de exclusão, fila de oportunidades com regra/versão/evidência e decisão, ações recomendadas com decisão, e supressões com registro e revogação. Todas as telas afirmam explicitamente que nenhum contato é enviado e que o ambiente é sintético.

## Evidências

| Gate             | Resultado                                                                                                         |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| Prettier         | passou nos arquivos alterados                                                                                     |
| ESLint           | passou sem warnings                                                                                               |
| Typecheck        | passou em todos os workspaces                                                                                     |
| Unit/contract    | 76 testes verdes (19 arquivos): regras, janelas, governança, determinismo, transições, contratos e serviço da API |
| Build            | NestJS e Next.js verdes; rota `/cockpit/recovery` compilada                                                       |
| Playwright + axe | 2 testes públicos passaram em Chromium                                                                            |
| pgTAP            | 28 assertions da Fase 5 versionadas; execução bloqueada sem Docker                                                |

O teste do serviço documenta um comportamento importante: com as fixtures do mock (jan/2026) fora das janelas da política em jul/2026, a simulação retorna **zero** oportunidades — nada é inventado para preencher a fila.

## Limitações e bloqueios

1. Docker segue indisponível: as 28 assertions da Fase 5 não foram executadas (total pendente: 128 assertions das Fases 1–5). `database.types.ts` continua provisório.
2. Sem E2E autenticado nem evidência visual das telas do Recovery (depende de `db:start`/seed).
3. Apenas os cenários 1 e 2 do roadmap foram implementados. Cancelamento, falta, horário vago e paciente inativo dependem da fonte oficial de agenda, ainda indefinida.
4. Consentimento é um registro interno sintético (`recovery_consents`); a base legal real, o texto de coleta e a integração com a fonte de verdade do consentimento continuam pendentes de aprovação jurídica.
5. Janelas, limites de frequência e expiração de 14 dias são `1.0.0-provisional` e exigem calibração com owner nominal antes do piloto.
6. Frequência é avaliada sobre ações aprovadas do próprio sistema; sem histórico de contatos reais, o limite não conhece mensagens enviadas por fora da plataforma.
7. Decisão provisória: owner e manager podem decidir e gerenciar supressões. Revalidar com a operação antes do piloto.
8. Helena, Quality, Capacity e agenda permanecem bloqueados.

## Gate antes da Fase 6

- executar migrations, `db:lint` e as 128 assertions pgTAP em Docker/CI; regenerar tipos;
- E2E autenticado por papel (Especialista ativo/encerrado, owner, manager, viewer negado);
- aprovar base legal, texto de consentimento e política de retenção de leads antes de qualquer dado real;
- calibrar janelas e limites com dados de piloto e definir o owner nominal da política;
- **a Fase 6 (Helena) permanece bloqueada** até documentação oficial, sandbox, autenticação, endpoints, webhooks e rate limits reais. Nenhuma execução de contato pode ser implementada antes desse gate.
