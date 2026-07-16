'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { RadarAssessmentInput } from '@althion/contracts';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { createRadarDraft, updateRadarDraft } from '@/app/app/radar/actions';
import { radarQuery, type RadarContext } from '@/lib/radar-context';

const METRICS = [
  {
    code: 'first_response_within_sla',
    denominator: 'Leads recebidos que exigiam resposta',
    help: 'Use o SLA administrativo aprovado pela clínica.',
    label: 'Respostas dentro do SLA',
    numerator: 'Respondidos dentro do SLA',
    step: 0,
  },
  {
    code: 'lead_to_appointment',
    denominator: 'Leads elegíveis para agendamento',
    help: 'Exclua duplicidades e contatos sem elegibilidade administrativa.',
    label: 'Conversão em agendamento',
    numerator: 'Leads que agendaram',
    step: 0,
  },
  {
    code: 'follow_up_within_policy',
    denominator: 'Leads que exigiam acompanhamento',
    help: 'Use somente a janela de acompanhamento aprovada.',
    label: 'Continuidade do acompanhamento',
    numerator: 'Acompanhados dentro da política',
    step: 0,
  },
  {
    code: 'bookable_slot_occupancy',
    denominator: 'Horários realmente agendáveis',
    help: 'Não conte bloqueios ou horários que não foram ofertados.',
    label: 'Ocupação da agenda',
    numerator: 'Horários ocupados',
    step: 1,
  },
  {
    code: 'appointment_attendance',
    denominator: 'Agendamentos esperados no período',
    help: 'Separe faltas de cancelamentos e reagendamentos.',
    label: 'Comparecimento',
    numerator: 'Consultas realizadas',
    step: 1,
  },
  {
    code: 'worked_opportunity_recovery',
    denominator: 'Oportunidades de recuperação trabalhadas',
    help: 'Não atribua receita; conte apenas retorno ao fluxo administrativo.',
    label: 'Recuperação',
    numerator: 'Oportunidades recuperadas',
    step: 2,
  },
  {
    code: 'administrative_return',
    denominator: 'Pessoas elegíveis para retorno administrativo',
    help: 'Não infira necessidade clínica de retorno.',
    label: 'Retenção administrativa',
    numerator: 'Pessoas que retornaram ao fluxo',
    step: 2,
  },
  {
    code: 'required_data_quality',
    denominator: 'Itens administrativos requeridos',
    help: 'Considere origem, denominadores, consistência e atualização.',
    label: 'Inteligência de dados',
    numerator: 'Itens disponíveis e consistentes',
    step: 2,
  },
] as const;

const formSchema = z
  .object({
    metrics: z.array(
      z.object({
        code: z.string(),
        denominator: z.number().int().min(0).max(1_000_000_000),
        included: z.boolean(),
        numerator: z.number().int().min(0).max(1_000_000_000),
      }),
    ),
    periodEnd: z.string().min(1, 'Informe o fim do período.'),
    periodStart: z.string().min(1, 'Informe o início do período.'),
  })
  .superRefine((input, context) => {
    if (!input.metrics.some((metric) => metric.included)) {
      context.addIssue({
        code: 'custom',
        message: 'Inclua pelo menos uma métrica.',
        path: ['metrics'],
      });
    }
    input.metrics.forEach((metric, index) => {
      if (metric.included && metric.numerator > metric.denominator) {
        context.addIssue({
          code: 'custom',
          message: 'O resultado não pode superar os eventos elegíveis.',
          path: ['metrics', index, 'numerator'],
        });
      }
    });
  });

type RadarFormValues = z.infer<typeof formSchema>;

interface RadarFormProps {
  readonly assessmentId?: string;
  readonly context: RadarContext;
  readonly initial?: RadarAssessmentInput;
  readonly periodEnd: string;
  readonly periodStart: string;
}

const steps = ['Atendimento e conversão', 'Agenda e comparecimento', 'Recuperação e dados'];

export function RadarForm({
  assessmentId,
  context,
  initial,
  periodEnd,
  periodStart,
}: RadarFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState('');
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    trigger,
  } = useForm<RadarFormValues>({
    defaultValues: {
      metrics: METRICS.map((definition) => {
        const saved = initial?.metrics.find((metric) => metric.code === definition.code);
        return {
          code: definition.code,
          denominator: saved?.denominator ?? 0,
          included: Boolean(saved) || !initial,
          numerator: saved?.numerator ?? 0,
        };
      }),
      periodEnd: initial?.periodEnd ?? periodEnd,
      periodStart: initial?.periodStart ?? periodStart,
    },
    resolver: zodResolver(formSchema),
  });
  const metricValues = useWatch({ control, name: 'metrics' });

  const next = async () => {
    const indexes = METRICS.map((metric, index) => ({ index, step: metric.step }))
      .filter((metric) => metric.step === step)
      .map((metric) => `metrics.${metric.index}` as const);
    if (await trigger(indexes)) setStep((current) => Math.min(current + 1, 2));
  };

  const submit = handleSubmit(async (values) => {
    setMessage('');
    const input: RadarAssessmentInput = {
      metrics: values.metrics
        .filter((metric) => metric.included)
        .map((metric) => ({
          code: metric.code as RadarAssessmentInput['metrics'][number]['code'],
          denominator: metric.denominator,
          numerator: metric.numerator,
          quality: 'declared',
          source: 'manual',
        })),
      periodEnd: values.periodEnd,
      periodStart: values.periodStart,
    };
    const result = assessmentId
      ? await updateRadarDraft(context.organizationId, context.clinicId, assessmentId, input)
      : await createRadarDraft(context.organizationId, context.clinicId, input);

    if (result.kind !== 'success') {
      setMessage(result.message);
      return;
    }
    router.push(`/app/radar/${result.id}?${radarQuery(context)}`);
    router.refresh();
  });

  return (
    <form className="radar-form" onSubmit={submit}>
      <nav aria-label="Etapas do diagnóstico" className="step-nav">
        {steps.map((label, index) => (
          <button
            aria-current={step === index ? 'step' : undefined}
            className={step === index ? 'active' : ''}
            key={label}
            onClick={() => setStep(index)}
            type="button"
          >
            <span>{index + 1}</span>
            {label}
          </button>
        ))}
      </nav>

      {step === 0 ? (
        <fieldset className="form-section">
          <legend>Período analisado</legend>
          <p>Use uma janela de 7 a 92 dias. Trinta dias é o padrão recomendado.</p>
          <div className="form-grid two-columns">
            <label>
              <span>Início</span>
              <input type="date" {...register('periodStart')} />
              {errors.periodStart ? (
                <small className="field-error">{errors.periodStart.message}</small>
              ) : null}
            </label>
            <label>
              <span>Fim</span>
              <input type="date" {...register('periodEnd')} />
              {errors.periodEnd ? (
                <small className="field-error">{errors.periodEnd.message}</small>
              ) : null}
            </label>
          </div>
        </fieldset>
      ) : null}

      <div className="metric-stack">
        {METRICS.map((metric, index) =>
          metric.step === step ? (
            <fieldset className="metric-card" key={metric.code}>
              <legend>{metric.label}</legend>
              <label className="metric-toggle">
                <input type="checkbox" {...register(`metrics.${index}.included`)} />
                Incluir esta dimensão
              </label>
              <input type="hidden" {...register(`metrics.${index}.code`)} />
              {metricValues[index]?.included ? (
                <>
                  <div className="form-grid two-columns">
                    <label>
                      <span>{metric.numerator}</span>
                      <input
                        inputMode="numeric"
                        min="0"
                        type="number"
                        {...register(`metrics.${index}.numerator`, { valueAsNumber: true })}
                      />
                      {errors.metrics?.[index]?.numerator ? (
                        <small className="field-error">
                          {errors.metrics[index]?.numerator?.message}
                        </small>
                      ) : null}
                    </label>
                    <label>
                      <span>{metric.denominator}</span>
                      <input
                        inputMode="numeric"
                        min="0"
                        type="number"
                        {...register(`metrics.${index}.denominator`, { valueAsNumber: true })}
                      />
                    </label>
                  </div>
                  <p className="field-help">{metric.help}</p>
                </>
              ) : (
                <p className="field-help">Esta dimensão ficará marcada como dado ausente.</p>
              )}
            </fieldset>
          ) : null,
        )}
      </div>

      <p aria-live="polite" className={message ? 'form-message error' : 'form-message'}>
        {message}
      </p>

      <div className="form-actions">
        {step > 0 ? (
          <button className="quiet-button" onClick={() => setStep(step - 1)} type="button">
            Voltar
          </button>
        ) : (
          <a className="quiet-button" href={`/app/radar?${radarQuery(context)}`}>
            Cancelar
          </a>
        )}
        {step < 2 ? (
          <button className="primary-button" onClick={next} type="button">
            Continuar
          </button>
        ) : (
          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Salvando…' : assessmentId ? 'Salvar alterações' : 'Salvar diagnóstico'}
          </button>
        )}
      </div>
    </form>
  );
}
