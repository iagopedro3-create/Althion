'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { PortalContext } from '@/lib/portal-context';
import {
  createEvaluationAction,
  flagConversationAction,
  resolveClinicalFlagAction,
} from '@/app/cockpit/quality/actions';

export function EvaluateForm({
  context,
  rubricVersion,
  criteria,
}: Readonly<{
  context: PortalContext;
  rubricVersion: string;
  criteria: readonly { id: string; name: string; description: string }[];
}>) {
  const router = useRouter();
  const [conversationId, setConversationId] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleScoreChange = (criterionId: string, val: number) => {
    setScores((prev) => ({ ...prev, [criterionId]: val }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationId.trim()) {
      setMessage('Identificador da conversa é obrigatório.');
      return;
    }

    // Check if all criteria are filled
    for (const crit of criteria) {
      if (scores[crit.id] === undefined) {
        setMessage(`Preencha a nota para "${crit.name}".`);
        return;
      }
    }

    setMessage(null);
    setPending(true);

    const payload = {
      ...context,
      conversationId,
      rubricVersion,
      scores,
      idempotencyKey: crypto.randomUUID(),
      ...(feedback ? { feedback } : {}),
    };
    const result = await createEvaluationAction(payload);

    setPending(false);
    if (!result.ok) {
      setMessage(result.error ?? 'Erro ao enviar avaliação.');
      return;
    }

    setMessage('Avaliação de qualidade registrada com sucesso.');
    setConversationId('');
    setScores({});
    setFeedback('');
    router.refresh();
  };

  return (
    <form className="portal-form" onSubmit={(e) => void submit(e)}>
      <label>
        Identificador da Conversa (CRM)
        <input
          maxLength={120}
          onChange={(e) => setConversationId(e.target.value)}
          placeholder="Ex. conv-001"
          required
          type="text"
          value={conversationId}
        />
      </label>

      <div style={{ display: 'grid', gap: '16px', margin: '16px 0' }}>
        {criteria.map((crit) => (
          <div key={crit.id} style={{ display: 'grid', gap: '4px' }}>
            <span style={{ fontWeight: '500' }}>{crit.name}</span>
            <small style={{ color: 'var(--muted)' }}>{crit.description}</small>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              {[0, 1, 2, 3, 4, 5].map((val) => (
                <button
                  className={scores[crit.id] === val ? 'primary-button' : 'quiet-button'}
                  key={val}
                  onClick={() => handleScoreChange(crit.id, val)}
                  style={{
                    minWidth: '40px',
                    padding: '6px',
                    borderRadius: '8px',
                  }}
                  type="button"
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <label>
        Comentários / Feedback (Opcional)
        <textarea
          maxLength={1000}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Comentários sobre a conformidade ou tom de voz da conversa."
          rows={3}
          value={feedback}
        />
        <small>Não inclua nomes de pacientes ou dados clínicos de saúde.</small>
      </label>

      <div className="form-footer">
        <button className="primary-button" disabled={pending} type="submit">
          {pending ? 'Salvando…' : 'Registrar Avaliação'}
        </button>
        {message ? (
          <span aria-live="polite" className="form-message">
            {message}
          </span>
        ) : null}
      </div>
    </form>
  );
}

export function FlagClinicalForm({ context }: Readonly<{ context: PortalContext }>) {
  const router = useRouter();
  const [conversationId, setConversationId] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationId.trim() || !flagReason.trim()) {
      setMessage('Preencha todos os campos obrigatórios.');
      return;
    }

    setMessage(null);
    setPending(true);

    const result = await flagConversationAction({
      ...context,
      conversationId,
      flagReason,
      idempotencyKey: crypto.randomUUID(),
    });

    setPending(false);
    if (!result.ok) {
      setMessage(result.error ?? 'Erro ao sinalizar conversa.');
      return;
    }

    setMessage('Conversa sinalizada com flag clínico de urgência.');
    setConversationId('');
    setFlagReason('');
    router.refresh();
  };

  return (
    <form className="portal-form" onSubmit={(e) => void submit(e)}>
      <label>
        Identificador da Conversa (CRM)
        <input
          maxLength={120}
          onChange={(e) => setConversationId(e.target.value)}
          placeholder="Ex. conv-002"
          required
          type="text"
          value={conversationId}
        />
      </label>
      <label>
        Justificativa / Motivo de Saúde
        <textarea
          maxLength={1000}
          onChange={(e) => setFlagReason(e.target.value)}
          placeholder="Descreva o conteúdo clínico que disparou o guardrail (ex. paciente relatou dor aguda de ouvido)."
          required
          rows={3}
          value={flagReason}
        />
      </label>

      <div className="form-footer">
        <button className="primary-button" disabled={pending} type="submit">
          {pending ? 'Sinalizando…' : 'Sinalizar Flag Clínico'}
        </button>
        {message ? (
          <span aria-live="polite" className="form-message">
            {message}
          </span>
        ) : null}
      </div>
    </form>
  );
}

export function ResolveFlagForm({
  context,
  flagId,
}: Readonly<{ context: PortalContext; flagId: string }>) {
  const router = useRouter();
  const [handoffNotes, setHandoffNotes] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoffNotes.trim()) {
      setMessage('Notas de resolução são obrigatórias.');
      return;
    }

    setMessage(null);
    setPending(true);

    const result = await resolveClinicalFlagAction({
      ...context,
      flagId,
      handoffNotes,
      idempotencyKey: crypto.randomUUID(),
    });

    setPending(false);
    if (!result.ok) {
      setMessage(result.error ?? 'Erro ao resolver.');
      return;
    }

    setMessage('Handoff clínico resolvido.');
    setHandoffNotes('');
    router.refresh();
  };

  return (
    <form
      className="portal-form"
      onSubmit={(e) => void submit(e)}
      style={{ border: 'none', padding: 0 }}
    >
      <label>
        Notas de Resolução / Handoff
        <textarea
          maxLength={1000}
          onChange={(e) => setHandoffNotes(e.target.value)}
          placeholder="Descreva a ação tomada pelo médico ou especialista (ex. paciente redirecionado ao Dr. Fulano)."
          required
          rows={2}
          value={handoffNotes}
        />
      </label>
      <div className="form-footer">
        <button className="quiet-button" disabled={pending} type="submit">
          {pending ? 'Resolvendo…' : 'Resolver Flag Clínico'}
        </button>
        {message ? (
          <span
            aria-live="polite"
            className="form-message"
            style={{ display: 'block', marginTop: '4px' }}
          >
            {message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
