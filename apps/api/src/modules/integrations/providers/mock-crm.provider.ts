import {
  CrmProviderError,
  type Contact,
  type Conversation,
  type CreateTaskInput,
  type CrmCapabilities,
  type CrmProvider,
  type Lead,
  type Message,
  type Opportunity,
  type Page,
  type Pipeline,
  type SourceRecord,
  type SyncPageInput,
  type UpdateOpportunityInput,
} from '@althion/domain';
import { Injectable } from '@nestjs/common';

const FIXTURE_TIME = '2026-01-15T12:00:00.000Z';

@Injectable()
export class MockCrmProvider implements CrmProvider {
  private readonly completedCommands = new Set<string>();

  private readonly contacts: readonly Contact[] = [
    {
      displayLabel: 'Contato sintético 001',
      externalId: 'mock-contact-001',
      observedAt: FIXTURE_TIME,
      sourceUpdatedAt: FIXTURE_TIME,
      status: 'active',
    },
    {
      displayLabel: 'Contato sintético 002',
      externalId: 'mock-contact-002',
      observedAt: FIXTURE_TIME,
      sourceUpdatedAt: FIXTURE_TIME,
      status: 'active',
    },
  ];

  private readonly leads: readonly Lead[] = [
    {
      contactExternalId: 'mock-contact-001',
      externalId: 'mock-lead-unanswered',
      firstResponseAt: null,
      observedAt: FIXTURE_TIME,
      receivedAt: '2026-01-15T10:00:00.000Z',
      sourceUpdatedAt: FIXTURE_TIME,
      status: 'new',
    },
    {
      contactExternalId: 'mock-contact-002',
      externalId: 'mock-lead-in-progress',
      firstResponseAt: '2026-01-15T10:04:00.000Z',
      observedAt: FIXTURE_TIME,
      receivedAt: '2026-01-15T10:02:00.000Z',
      sourceUpdatedAt: FIXTURE_TIME,
      status: 'in_progress',
    },
  ];

  private readonly conversations: readonly Conversation[] = [
    {
      contactExternalId: 'mock-contact-001',
      externalId: 'mock-conversation-001',
      lastMessageAt: '2026-01-15T10:00:00.000Z',
      observedAt: FIXTURE_TIME,
      sourceUpdatedAt: FIXTURE_TIME,
      startedAt: '2026-01-15T10:00:00.000Z',
      status: 'open',
    },
  ];

  private readonly messages: readonly Message[] = [
    {
      conversationExternalId: 'mock-conversation-001',
      direction: 'inbound',
      externalId: 'mock-message-001',
      hasAttachment: false,
      observedAt: FIXTURE_TIME,
      sentAt: '2026-01-15T10:00:00.000Z',
      sourceUpdatedAt: FIXTURE_TIME,
    },
  ];

  private readonly pipelines: readonly Pipeline[] = [
    {
      externalId: 'mock-pipeline-001',
      name: 'Pipeline sintético',
      observedAt: FIXTURE_TIME,
      sourceUpdatedAt: FIXTURE_TIME,
      status: 'active',
    },
  ];

  private readonly opportunities: Opportunity[] = [
    {
      externalId: 'mock-opportunity-001',
      leadExternalId: 'mock-lead-in-progress',
      normalizedStatus: 'open',
      observedAt: FIXTURE_TIME,
      pipelineExternalId: 'mock-pipeline-001',
      sourceUpdatedAt: FIXTURE_TIME,
      stageExternalId: 'mock-stage-open',
    },
  ];

  public async getCapabilities(): Promise<CrmCapabilities> {
    return {
      createTask: true,
      listContacts: true,
      listConversations: true,
      listLeads: true,
      listMessages: true,
      listOpportunities: true,
      listPipelines: true,
      updateOpportunity: true,
    };
  }

  public async listContacts(input: SyncPageInput): Promise<Page<Contact>> {
    return this.page(this.contacts, input);
  }

  public async listLeads(input: SyncPageInput): Promise<Page<Lead>> {
    return this.page(this.leads, input);
  }

  public async listConversations(input: SyncPageInput): Promise<Page<Conversation>> {
    return this.page(this.conversations, input);
  }

  public async listMessages(input: SyncPageInput): Promise<Page<Message>> {
    return this.page(this.messages, input);
  }

  public async listPipelines(input: SyncPageInput): Promise<Page<Pipeline>> {
    return this.page(this.pipelines, input);
  }

  public async listOpportunities(input: SyncPageInput): Promise<Page<Opportunity>> {
    return this.page(this.opportunities, input);
  }

  public async updateOpportunity(input: UpdateOpportunityInput): Promise<void> {
    if (this.completedCommands.has(input.idempotencyKey)) return;

    const opportunityIndex = this.opportunities.findIndex(
      (item) => item.externalId === input.externalId,
    );
    const opportunity = this.opportunities[opportunityIndex];
    if (!opportunity) {
      throw new CrmProviderError('PERMANENT_ERROR', 'Mock opportunity was not found');
    }

    this.opportunities[opportunityIndex] = {
      ...opportunity,
      normalizedStatus: input.normalizedStatus,
    };
    this.completedCommands.add(input.idempotencyKey);
  }

  public async createTask(input: CreateTaskInput): Promise<void> {
    if (this.completedCommands.has(input.idempotencyKey)) return;
    this.completedCommands.add(input.idempotencyKey);
  }

  private async page<T extends SourceRecord>(
    records: readonly T[],
    input: SyncPageInput,
  ): Promise<Page<T>> {
    if (!Number.isInteger(input.limit) || input.limit < 1 || input.limit > 100) {
      throw new CrmProviderError('PERMANENT_ERROR', 'Page limit must be between 1 and 100');
    }

    const offset = input.cursor ? Number(input.cursor) : 0;
    if (!Number.isInteger(offset) || offset < 0) {
      throw new CrmProviderError('INVALID_CURSOR', 'The mock cursor is invalid');
    }

    const filtered = input.updatedAfter
      ? records.filter(
          (record) =>
            new Date(record.sourceUpdatedAt ?? record.observedAt).getTime() >
            new Date(input.updatedAfter ?? '').getTime(),
        )
      : records;
    const items = filtered.slice(offset, offset + input.limit);
    const nextOffset = offset + items.length;

    return {
      items,
      nextCursor: nextOffset < filtered.length ? String(nextOffset) : null,
    };
  }
}
