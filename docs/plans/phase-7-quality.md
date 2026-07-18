# Plano detalhado da Fase 7 — Quality Engine (Avaliação Assistida e Guardrail Clínico)

## Estado e gate

Planejamento em 17 de julho de 2026, sob a autorização de avanço contínuo. Os gates de banco das Fases 1–5 (Docker/CI, 128 assertions pgTAP) seguem pendentes; a Fase 7 adota o mesmo regime de execução incremental: código, testes de domínio/API e build verdes localmente, validação PostgreSQL/pgTAP em Docker adiada e documentada.

Feature flag: `quality.engine.v1`, global-off, habilitada apenas em ambiente de teste ou seed sintético.

## Objetivo e fronteira dura

Entregar o motor de qualidade em **modo assistido (assisted mode)** e o **guardrail clínico (clinical guardrail)**. O motor permite avaliar conversas administrativas (provenientes do CRM) por meio de rubricas estruturadas e versionadas, enquanto o guardrail monitora o conteúdo das interações para sinalizar suspeitas de conteúdo clínico e forçar o encaminhamento imediato para intervenção humana (handoff), garantindo que a IA nunca interprete dados clínicos (em total conformidade com os limites do domínio e os não objetivos do produto).

Fronteiras invioláveis nesta fase:

- **Nenhuma interpretação clínica por IA:** a plataforma sinaliza que há conteúdo clínico (por meio de heurísticas/palavras-chave administrativas no domínio) e cria um log de redirecionamento, mas não gera resposta de saúde, diagnóstico ou triagem médica.
- **Isolamento de dados clínicos:** conversas marcadas como potencialmente clínicas possuem RLS restrito a médicos (`doctor`) e administradores (`platform_admin` ou `relationship_specialist` com assignment ativo), impedindo que outros papéis vejam dados de saúde sensíveis.
- **Revisão humana obrigatória:** avaliações de qualidade de conversa são preenchidas por humanos (Especialista ou Admin) com base em critérios fechados, sem notas arbitrárias e sem geração automática de feedback clínico.

## Política de qualidade e rubricas v1

`QUALITY_POLICY_VERSION = '1.0.0-provisional'`

### Rubricas estruturadas

As rubricas de avaliação administrativa possuem critérios específicos com pontuação de 0 a 5. A rubrica padrão v1 contém:

1. **Tempo de Resposta (`response_time`):** agilidade no atendimento à solicitação do lead/paciente.
2. **Tom e Empatia (`tone_empathy`):** cortesia, profissionalismo e respeito à linguagem da marca.
3. **Identificação de Oportunidade (`opportunity_id`):** habilidade em mapear a necessidade do lead (ex. agendamento, reagendamento).
4. **Conformidade de Roteiro (`compliance`):** uso de termos administrativos corretos e respeito a limites regulatórios.
5. **Sanidade Operacional (`operational_sanity`):** ausência de promessas sem lastro ou desvios do escopo operacional.

O cálculo do Score de Qualidade (`Quality Score`) de uma avaliação é a média ponderada (ou aritmética simples nesta fase) dos critérios preenchidos, gerando um valor de 0 a 100.

### Guardrail Clínico e Handoff

Sempre que a API registrar ou avaliar mensagens contendo marcadores clínicos (ex. "sintoma", "dor", "receita", "remédio", "consulta com o doutor sobre a mancha", etc.):

1. A conversa é sinalizada com `potentially_clinical = true`.
2. Um registro em `quality_clinical_flags` é criado com status `pending`.
3. Qualquer ação automatizada daquele lead/contato no Recovery Engine é pausada (integração de governança no banco).
4. O caso é disponibilizado em uma fila de **Handoff Humano** para que um profissional médico (`doctor`) ou o Especialista realize a resolução.

## Modelo de dados

Tabelas com FK composta para `clinics(organization_id, id)` e RLS deny-by-default.

- `quality_rubrics`:
  - `version` (text, primary key) - formato semver (ex. `1.0.0-provisional`).
  - `title` (text).
  - `description` (text).
  - `criteria` (jsonb) - array de `{ id: string, name: string, description: string, max_score: number }`.
  - `is_active` (boolean) - apenas uma versão ativa por vez no sistema.
  - `created_at` (timestamp), `created_by` (uuid -> profiles).
- `quality_evaluations`:
  - `id` (uuid, primary key).
  - `organization_id` (uuid), `clinic_id` (uuid) - FK composta para clinics.
  - `conversation_id` (text) - ID de referência externa da conversa no CRM.
  - `evaluator_id` (uuid -> profiles).
  - `rubric_version` (text -> quality_rubrics).
  - `scores` (jsonb) - mapa de ID do critério para pontuação (inteiro de 0 a 5).
  - `total_score` (numeric) - score consolidado de 0 a 100.
  - `feedback` (text) - comentários adicionais da avaliação (sem dados clínicos).
  - `created_at` (timestamp), `updated_at` (timestamp).
  - Unique constraint: `(organization_id, clinic_id, conversation_id, rubric_version)` - impede duplicar avaliações da mesma conversa com a mesma rubrica.
- `quality_clinical_flags`:
  - `id` (uuid, primary key).
  - `organization_id` (uuid), `clinic_id` (uuid) - FK composta.
  - `conversation_id` (text).
  - `flagged_at` (timestamp).
  - `flagged_by_profile_id` (uuid -> profiles) - nulo se detectado automaticamente pelo sistema.
  - `flag_reason` (text) - justificativa ou fragmento de texto que ativou o guardrail.
  - `status` (text) - `pending | transferred | resolved`.
  - `resolved_at` (timestamp), `resolved_by_profile_id` (uuid -> profiles).
  - `handoff_notes` (text).

### Históricos append-only:

- `quality_evaluation_history` e `quality_clinical_flag_history` para auditoria total de transições.

### RPCs transacionais (`security definer`):

- `create_quality_evaluation`: insere a avaliação, calcula a nota no banco e registra histórico de auditoria.
- `flag_clinical_conversation`: sinaliza uma conversa como potencialmente clínica e registra o flag de guardrail.
- `resolve_clinical_flag`: resolve o handoff clínico com notas de resolução humana.

## Permissões (Capabilities)

Novas capabilities:

- `quality:read` (visualizar relatórios e notas de qualidade).
- `quality:evaluate` (realizar avaliações assistidas e cadastrar notas).
- `quality:flag` (sinalizar manualmente uma conversa como clínica).
- `quality:resolve` (resolver handoffs clínicos e arquivar flags).

### Matriz de Papéis:

| Perfil                                  | Ler Qualidade | Avaliar | Sinalizar Clínico | Resolver Handoff |
| :-------------------------------------- | :-----------: | :-----: | :---------------: | :--------------: |
| `platform_admin`                        |       ✔       |    ✔    |         ✔         |        ✔         |
| `relationship_specialist` (ativo)       |       ✔       |    ✔    |         ✔         |        ✔         |
| `clinic_manager` / `organization_owner` |       ✔       |    —    |         —         |        —         |
| `doctor`                                |       ✔       |    —    |         ✔         |        ✔         |
| `operator` / `viewer`                   |       —       |    —    |         —         |        —         |

_Nota sobre privacidade:_ O papel `doctor` possui permissão para sinalizar e resolver handoffs clínicos de sua clínica, sendo o único papel tenant com acesso completo ao conteúdo das conversas marcadas como clínicas. `clinic_manager` e `organization_owner` enxergam apenas as notas consolidadas de qualidade (médias), mas não o conteúdo clínico detalhado e não resolvido dos flags de saúde.

## Rotas e API

### Web:

- `/cockpit/quality`: Fila de conversas para avaliação e lista de avaliações realizadas (Especialista).
- `/cockpit/quality/rubricas`: Visualização das rubricas de avaliação ativas.
- `/app/quality`: Dashboard de qualidade para o cliente (Owner/Manager), exibindo a evolução da nota média da clínica e distribuição por critério.
- `/app/quality/clinical-flags`: Tela de controle para profissionais médicos (`doctor`) visualizarem e resolverem pendências de redirecionamento clínico.

### API:

```text
GET  /api/v1/organizations/:orgId/clinics/:clinicId/quality/rubrics               quality:read
POST /api/v1/organizations/:orgId/clinics/:clinicId/quality/rubrics               score_formula:manage (Admin)
GET  /api/v1/organizations/:orgId/clinics/:clinicId/quality/evaluations           quality:read
POST /api/v1/organizations/:orgId/clinics/:clinicId/quality/evaluations           quality:evaluate
GET  /api/v1/organizations/:orgId/clinics/:clinicId/quality/clinical-flags        quality:read
POST /api/v1/organizations/:orgId/clinics/:clinicId/quality/clinical-flags        quality:flag
POST /api/v1/organizations/:orgId/clinics/:clinicId/quality/clinical-flags/:id/resolve  quality:resolve
```

## Estrutura de arquivos sugerida

- **Plano e Relatório:**
  - [docs/plans/phase-7-quality.md](file:///C:/Users/iagop/OneDrive/Documentos/Althion/docs/plans/phase-7-quality.md)
  - `docs/releases/phase-7.md`
- **Domínio:**
  - `packages/domain/src/quality/types.ts` (interfaces de rubricas, critérios e avaliações)
  - `packages/domain/src/quality/rubrics.ts` (regras e rubrica canônica)
  - `packages/domain/src/quality/guardrails.ts` (lógica de detecção de texto clínico)
  - `packages/domain/src/quality/index.ts`
  - `packages/domain/src/quality/quality.test.ts`
- **Contratos:**
  - `packages/contracts/src/quality.ts` + teste
- **Banco de Dados:**
  - `supabase/migrations/20260717180000_quality.sql` (tabelas, RPCs, RLS)
  - `supabase/tests/quality_rls.test.sql` (testes pgTAP)
- **API backend:**
  - `apps/api/src/modules/quality/*` (module, controllers, services, repositories)
- **Frontend web:**
  - `apps/web/src/app/cockpit/quality/page.tsx`
  - `apps/web/src/app/app/quality/page.tsx`
  - `apps/web/src/app/app/quality/clinical-flags/page.tsx`

## Riscos e mitigações

| Risco                                           | Mitigação                                                                                                                                                                                                               |
| :---------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vazamento de dados clínicos sensíveis**       | RLS proíbe que operadores, viewers e gerentes gerais vejam os registros de flags clínicos não resolvidos; visualização restrita a médicos (`doctor`) e Especialistas Althion.                                           |
| **Detecção automática falhar (falso negativo)** | Guardrail automático no domínio é apenas uma camada preventiva de velocidade; a API e a UI permitem que o Especialista ou o próprio operador sinalizem manualmente um flag clínico (`quality:flag`) a qualquer momento. |
| **Duplicidade de avaliações**                   | Unique constraint no banco combinando `(clinic_id, conversation_id, rubric_version)` garante que uma conversa só seja avaliada uma vez por versão da rubrica.                                                           |
| **Avaliação arbitrária humana**                 | Critérios fechados com pontuação de 0 a 5 com validação rigorosa de Zod no backend e no domínio, bloqueando notas decisais ou fora do range.                                                                            |

## Estratégia de testes

- **Domínio:**
  - Testar a rubrica e o cálculo de score total (médias normais e ponderadas).
  - Testar o guardrail clínico com frases que devem e que não devem ativar o sinalizador (heurísticas de linguagem).
- **Banco de Dados (pgTAP):**
  - Provar que `relationship_specialist` consegue avaliar e flagar.
  - Provar que `doctor` consegue visualizar e resolver flags clínicos.
  - Provar que `clinic_manager` consegue ver notas de qualidade consolidada, mas é negado em flags de conversas clínicas sensíveis.
  - Provar isolamento multi-tenant completo (Tenant A não lê avaliações do Tenant B).
- **API:**
  - Testar controllers de criação de avaliações, retorno de rubricas e criação/resolução de flags com mocks de autenticação JWT/JWKS.
- **Web/E2E:**
  - Validar a renderização da fila de qualidade no cockpit, a digitação do formulário de avaliação humana e a tela de resoluções de pendência médica (Doctor).

## Critérios de aceite

- Nenhuma funcionalidade tenta diagnosticar ou responder clinicamente a uma conversa;
- O guardrail clínico bloqueia fluxos automáticos do Recovery Engine e dispara uma sinalização de handoff humano;
- O cálculo do Score de Qualidade é determinado apenas no domínio e persistido via RPC auditada;
- RLS e permissões impedem vazamento de dados clínicos a papéis administrativos não autorizados;
- `pnpm lint`, `pnpm typecheck`, `pnpm test` e `pnpm build` passam sem erros.
