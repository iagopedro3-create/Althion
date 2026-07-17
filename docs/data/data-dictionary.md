# Dicionário de dados inicial

## Status

Baseline lógico de toda a plataforma. Fundação, Radar e Score possuem schema executável em `supabase/migrations`; as demais tabelas serão confirmadas no plano da fase correspondente. `id uuid`, `created_at timestamptz` e `updated_at timestamptz` são padrão e foram omitidos das listas abaixo para reduzir repetição.

## Campos padrão tenant-owned

| Campo             | Tipo lógico          | Regra                                                  |
| ----------------- | -------------------- | ------------------------------------------------------ |
| `organization_id` | uuid                 | Obrigatório e imutável; FK para `organizations`        |
| `deleted_at`      | timestamptz nullable | Apenas para entidades editáveis que exigem soft delete |
| `created_by`      | uuid nullable        | Perfil ator quando aplicável                           |
| `updated_by`      | uuid nullable        | Perfil ator quando aplicável                           |

## Fundação e acesso

| Tabela                     | Campos mínimos específicos                                                                 | Constraints principais                                   |
| -------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `organizations`            | `name`, `slug`, `status`, `timezone`, `retention_policy_version`                           | slug único; status controlado                            |
| `clinics`                  | `organization_id`, `name`, `status`, `timezone`                                            | unique tenant/name ativo; FK tenant composta             |
| `units`                    | `organization_id`, `clinic_id`, `name`, `timezone`, `status`                               | unidade e clínica no mesmo tenant                        |
| `profiles`                 | `auth_user_id`, `display_name`, `locale`, `status`                                         | `auth_user_id` único; sem papel tenant no perfil         |
| `memberships`              | `organization_id`, `profile_id`, `role`, `status`, `starts_at`, `expires_at`, `revoked_at` | uma membership ativa por perfil/tenant; papel controlado |
| `membership_scopes`        | `organization_id`, `membership_id`, `clinic_id?`, `unit_id?`                               | escopo pertence ao tenant; combinação única              |
| `platform_roles`           | `profile_id`, `role`, `status`, `granted_by`, `granted_at`, `revoked_at`                   | alteração somente administrativa e auditada              |
| `professionals`            | `organization_id`, `display_name`, `status`, `specialty_label?`                            | sem registro ou informação clínica de paciente           |
| `professional_units`       | `organization_id`, `professional_id`, `unit_id`, `status`                                  | unique vínculo ativo; FKs tenant compostas               |
| `services`                 | `organization_id`, `name`, `default_duration_minutes?`, `status`                           | duração positiva; sem protocolo clínico                  |
| `relationship_specialists` | `profile_id`, `status`, `capacity_limit?`                                                  | um registro por perfil                                   |
| `relationship_assignments` | `organization_id`, `clinic_id?`, `specialist_id`, `starts_at`, `ends_at`, `status`         | assignment ativo e tenant coerente                       |
| `feature_flags`            | `key`, `description`, `default_enabled`, `rollout_type`                                    | key global única                                         |
| `feature_flag_overrides`   | `organization_id`, `feature_flag_id`, `enabled`, `expires_at?`, `reason`                   | unique flag/tenant; auditado                             |

Papéis tenant iniciais: `organization_owner`, `clinic_manager`, `doctor`, `operator`, `viewer`. `relationship_specialist` deriva de assignment. `platform_admin` deriva de `platform_roles`.

## Dados operacionais

| Tabela                   | Campos mínimos específicos                                                                                                                                                         | Observações de privacidade/integridade                     |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `contacts`               | `organization_id`, `display_label?`, `status`, `source_system`, `source_observed_at`                                                                                               | identidade mínima; telefone/e-mail não copiados por padrão |
| `external_contacts`      | `organization_id`, `contact_id`, `integration_id`, `external_id`, `source_updated_at?`, `synced_at`, `mapping_version`, `source_payload_hash?`                                     | unique tenant/integration/external ID                      |
| `leads`                  | `organization_id`, `contact_id?`, `integration_id`, `external_id`, `status`, `origin?`, `received_at`, `first_response_at?`, `source_updated_at?`                                  | sem texto livre clínico                                    |
| `lead_status_history`    | `organization_id`, `lead_id`, `from_status?`, `to_status`, `reason_code?`, `changed_at`, `source_system`                                                                           | append-only                                                |
| `external_conversations` | `organization_id`, `integration_id`, `external_id`, `contact_id?`, `started_at`, `last_message_at?`, `status`, `assigned_external_actor_id?`                                       | metadata, não transcript                                   |
| `external_messages`      | `organization_id`, `integration_id`, `external_id`, `conversation_id`, `direction`, `sent_at`, `sender_kind`, `has_attachment`, `response_latency_ms?`, `classification_status?`   | sem body, OCR, anexo ou token                              |
| `opportunities`          | `organization_id`, `integration_id`, `external_id`, `lead_id?`, `pipeline_external_id?`, `stage_external_id?`, `normalized_status`, `opened_at`, `closed_at?`, `loss_reason_code?` | estado externo + normalização versionada                   |
| `appointments`           | `organization_id`, `external_id?`, `integration_id?`, `contact_id?`, `unit_id`, `professional_id?`, `service_id?`, `starts_at`, `ends_at`, `status`, `source_system`               | bloqueada até source of truth; sem motivo clínico          |
| `appointment_history`    | `organization_id`, `appointment_id`, `from_status?`, `to_status`, `reason_code?`, `changed_at`, `source_system`                                                                    | append-only; motivo administrativo controlado              |
| `waiting_list`           | `organization_id`, `contact_id`, `unit_id?`, `professional_id?`, `service_id?`, `eligible_from?`, `eligible_until?`, `status`, `priority`                                          | sem texto livre/motivo clínico                             |

## Integrações

| Tabela               | Campos mínimos específicos                                                                                                                                                                    | Constraints/segurança                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `integrations`       | `organization_id`, `provider`, `status`, `capabilities`, `external_account_id?`, `last_success_at?`, `last_error_code?`, `config_reference?`                                                  | segredo fora do banco ou apenas referência ao cofre    |
| `integration_events` | `organization_id`, `integration_id`, `external_event_id`, `event_type`, `received_at`, `occurred_at?`, `payload_hash`, `schema_version?`, `status`, `error_code?`                             | unique evento; payload bruto não persistido por padrão |
| `sync_jobs`          | `organization_id`, `integration_id`, `resource_type`, `mode`, `status`, `cursor_reference?`, `started_at?`, `finished_at?`, `attempt_count`, `records_seen`, `records_changed`, `error_code?` | checkpoint sem token; execução idempotente             |

## Radar e Score

| Tabela                             | Campos mínimos específicos                                                                                                                             | Constraints/explicação                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `radar_assessments`                | `organization_id`, `clinic_id`, `unit_id?`, `period_start`, `period_end`, `status`, `questionnaire_version`, `created_by`, `submitted_at?`             | 7–92 dias; rascunho editável e enviado imutável             |
| `radar_metric_inputs`              | `organization_id`, `clinic_id`, `assessment_id`, `metric_code`, `numerator`, `denominator`, `source`, `quality`, `observation?`                        | razão agregada; numerador não supera denominador            |
| `radar_recommendations`            | `organization_id`, `clinic_id`, `assessment_id`, `score_id`, `rule_code`, `rule_version`, `priority`, `title`, `rationale`                             | regra determinística e snapshot imutável                    |
| `althion_score_formulas`           | `version`, `status`, `minimum_coverage`, `mandatory_dimensions`, `definition_hash`, `published_at?`                                                    | global; draft ou publicação imutável                        |
| `althion_score_formula_components` | `formula_id`, `metric_code`, `dimension`, `label`, `weight`, `transformation`                                                                          | uma métrica/dimensão por fórmula; soma validada ao publicar |
| `althion_scores`                   | `organization_id`, `clinic_id`, `assessment_id`, `formula_id`, `status`, `score_value?`, `coverage`, `input_hash`, `calculated_at`                     | nota 0–100 ou nula se insuficiente                          |
| `althion_score_components`         | `organization_id`, `score_id`, `metric_code`, `dimension`, `status`, `score_value?`, `weight`, `contribution?`, `explanation`                          | snapshot dos pesos e valores usados                         |
| `althion_score_evidence`           | `organization_id`, `score_id`, `component_id`, `metric_input_id?`, `numerator?`, `denominator?`, `normalized_value?`, `reason_code?`, `transformation` | lineage sem conteúdo sensível                               |

Dimensões iniciais: `speed`, `conversion`, `continuity`, `occupancy`, `attendance`, `recovery`, `retention`, `data_intelligence`.

## Recovery Engine

| Tabela                   | Campos mínimos específicos                                                                                                                                                                 | Constraints/segurança                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `recovery_rules`         | `organization_id`, `name`, `rule_type`, `status`, `current_version_id?`                                                                                                                    | identidade editável; versão ativa explícita                      |
| `recovery_rule_versions` | `organization_id`, `rule_id`, `version`, `conditions`, `action_policy`, `frequency_policy`, `approval_policy`, `created_by`                                                                | imutável; JSON validado por schema/version                       |
| `recovery_runs`          | `organization_id`, `rule_version_id`, `mode`, `status`, `window_start`, `window_end`, `idempotency_key`, `started_at`, `finished_at?`, `counts`                                            | mode `simulation` ou `execution`; key única                      |
| `recovery_opportunities` | `organization_id`, `run_id`, `rule_version_id`, `contact_id?`, `lead_id?`, `appointment_id?`, `type`, `priority`, `detected_at`, `eligible_until?`, `status`, `evidence_snapshot`          | fingerprint único impede duplicação ativa                        |
| `recovery_actions`       | `organization_id`, `opportunity_id`, `action_type`, `status`, `approval_status`, `approved_by?`, `scheduled_at?`, `executed_at?`, `outcome_code?`, `idempotency_key`, `consent_record_id?` | supressão/frequência verificadas imediatamente antes da execução |

## Quality e Capacity

| Tabela                     | Campos mínimos específicos                                                                                                                                                                                     | Observações                                       |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `quality_criteria`         | `organization_id?`, `code`, `version`, `name`, `weight`, `rubric`, `status`                                                                                                                                    | global ou override tenant; versionado             |
| `quality_reviews`          | `organization_id`, `conversation_id`, `mode`, `status`, `model_reference?`, `prompt_version?`, `automatic_score?`, `human_score?`, `reviewed_by?`, `clinical_content_flag`, `handoff_required`, `reviewed_at?` | não armazena transcript; revisão humana explícita |
| `quality_review_scores`    | `organization_id`, `review_id`, `criterion_id`, `score`, `finding_code?`, `explanation_redacted?`                                                                                                              | sem reproduzir conteúdo clínico                   |
| `capacity_snapshots`       | `organization_id`, `clinic_id`, `unit_id?`, `professional_id?`, `period_start`, `period_end`, `available_slots`, `booked_slots`, `blocked_slots`, `occupancy_rate?`, `source_system`, `data_quality_status`    | agregados; definição de slot versionada           |
| `capacity_recommendations` | `organization_id`, `snapshot_id`, `type`, `priority`, `target_window`, `rationale`, `status`, `approved_by?`                                                                                                   | começa recomendação, sem execução irrestrita      |

## Operação e governança

| Tabela                            | Campos mínimos específicos                                                                                                                                                                    | Observações                                                      |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `requests`                        | `organization_id`, `clinic_id`, `requester_profile_id`, `assignee_profile_id?`, `category`, `subject`, `details`, `status`, `priority`, `acknowledged_at?`, `resolved_at?`, `closed_at?`      | 5–160/10–1000 chars; aviso contra PII/dado clínico; sem anexo    |
| `request_status_history`          | `organization_id`, `clinic_id`, `request_id`, `from_status?`, `to_status`, `reason_code?`, `changed_by_profile_id`, `changed_at`                                                              | append-only; motivo em código controlado                         |
| `improvement_plans`               | `organization_id`, `clinic_id`, `version`, `title`, `status`, `source_score_id?`, `period_start?`, `period_end?`, `created_by_profile_id`, timestamps de ativação/conclusão/arquivo           | versão monotônica; um plano ativo por clínica                    |
| `improvement_plan_status_history` | `organization_id`, `clinic_id`, `improvement_plan_id`, `from_status?`, `to_status`, `reason_code?`, `changed_by_profile_id`, `changed_at`                                                     | append-only                                                      |
| `tasks`                           | `organization_id`, `clinic_id`, `improvement_plan_id`, `radar_recommendation_id?`, `title`, `status`, `priority`, `assignee_profile_id?`, `due_at?`, `completed_at?`, `created_by_profile_id` | somente ação administrativa; assignee precisa acessar a clínica  |
| `task_status_history`             | `organization_id`, `clinic_id`, `task_id`, `from_status?`, `to_status`, `reason_code?`, `changed_by_profile_id`, `changed_at`                                                                 | append-only; cancelada não entra no progresso                    |
| `notifications`                   | `organization_id`, `recipient_profile_id`, `type`, `title`, `read_at?`, `source_type`, `source_id`                                                                                            | sem corpo sensível; link autorizado no acesso                    |
| `analytics_events`                | `organization_id`, `event_name`, `occurred_at`, `actor_kind?`, `clinic_id?`, `properties`, `schema_version`, `source_system`                                                                  | allowlist de propriedades; sem PII livre                         |
| `reports`                         | `organization_id`, `type`, `period_start`, `period_end`, `status`, `definition_version`, `generated_at?`, `storage_path?`, `expires_at?`, `checksum?`                                         | arquivo privado e URL assinada curta                             |
| `audit_logs`                      | `organization_id?`, `actor_profile_id?`, `actor_type`, `action`, `resource_type`, `resource_id?`, `occurred_at`, `request_id?`, `ip_hash?`, `result`, `metadata_redacted`                     | append-only; organization nullable só para ação global           |
| `incidents`                       | `organization_id?`, `type`, `severity`, `status`, `detected_at`, `acknowledged_at?`, `resolved_at?`, `owner_profile_id?`, `summary`, `root_cause_code?`                                       | detalhes sensíveis em sistema restrito aprovado                  |
| `consent_records`                 | `organization_id`, `contact_id`, `purpose`, `channel?`, `status`, `captured_at`, `expires_at?`, `source_system`, `evidence_reference?`, `withdrawn_at?`                                       | consentimento só quando for base aplicável; evidência minimizada |
| `suppression_lists`               | `organization_id`, `contact_id?`, `identifier_hash?`, `channel?`, `purpose?`, `reason_code`, `starts_at`, `ends_at?`, `source_system`                                                         | hash permite bloqueio sem reter canal em claro quando viável     |
| `outbox_events`                   | `organization_id`, `aggregate_type`, `aggregate_id`, `event_type`, `payload_minimized`, `status`, `available_at`, `published_at?`, `attempt_count`                                            | criado na mesma transação do fato                                |
| `idempotency_records`             | `organization_id`, `scope`, `key_hash`, `request_hash?`, `status`, `response_reference?`, `expires_at`                                                                                        | unique tenant/scope/key; chave em hash                           |

## Campos explicitamente proibidos

- diagnóstico, hipótese ou CID;
- prescrição, medicamento ou dose;
- resultado/interpretação de exame;
- nota, evolução ou prontuário clínico;
- avaliação de urgência;
- plano/tratamento clínico;
- corpo integral de mensagem ou arquivo espontâneo por padrão;
- token, senha, secret, chave privada ou assinatura de webhook em logs/tabelas comuns.

## Questões para fechar antes das migrations correspondentes

- taxonomias oficiais de status e motivos;
- fonte de agenda e disponibilidade;
- granularidade de escopo do operador e filas Helena;
- política de PII mínima para busca e deduplicação de contatos;
- retenção e base legal por entidade;
- owner nominal e thresholds de calibração da fórmula oficial do Score;
- definição operacional de slot, ocupação, recuperação e comparecimento.

## Fase 4 — Cockpit (17/07/2026)

- `relationship_assignments.complexity`: complexidade operacional da conta para capacidade (pesos: low 1, standard 2, high 3; política provisória).
- `account_incidents`: incidente operacional interno da conta (invisível a papéis do cliente). `severity` significa impacto operacional, nunca urgência clínica. `subject`/`details` limitados e proibidos de conter dados de pacientes; nunca entram em logs/auditoria.
- `account_incident_status_history`: trilha append-only de transições de incidente com `reason_code` opcional.
- `account_meetings`: registro declarativo de reunião do Especialista com a conta; `summary` opcional (5–500) sem conteúdo clínico.
- `account_meeting_status_history`: trilha append-only de transições de reunião.
- Flag `cockpit.specialist.v1`: habilita o Cockpit; global, sem override por organização.

## Fase 5 — Recovery (17/07/2026)

- `recovery_consents.state`: consentimento interno do lead sintético para contato administrativo. Deny-by-default: sem registro `granted`, o lead nunca vira oportunidade. Base legal e texto de coleta reais pendentes de aprovação jurídica.
- `recovery_suppressions.reason`: `opt_out` (pedido de não contato), `complaint`, `manual_review`, `other`. Supressão ativa exclui o lead de novas oportunidades imediatamente.
- `recovery_simulations.*`: contadores explicáveis de uma execução de regras; `provider` é sempre `mock` nesta fase.
- `recovery_opportunities.evidence`: valores e timestamps usados pela regra (sem PII real); `rule_version` fixa a política aplicada.
- `recovery_actions.action_type`: ação **recomendada** (`contact_lead`, `offer_booking`). Aprovar registra a decisão; nenhum envio ocorre.
- Flag `recovery.engine.v1`: habilita o Recovery; global, sem override por organização.
