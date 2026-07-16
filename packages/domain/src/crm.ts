export interface SyncPageInput {
  readonly cursor?: string;
  readonly limit: number;
  readonly updatedAfter?: string;
}

export interface Page<T> {
  readonly items: readonly T[];
  readonly nextCursor: string | null;
}

export interface SourceRecord {
  readonly externalId: string;
  readonly observedAt: string;
  readonly sourceUpdatedAt?: string;
}

export interface Contact extends SourceRecord {
  readonly displayLabel: string | null;
  readonly status: 'active' | 'inactive' | 'unknown';
}

export interface Lead extends SourceRecord {
  readonly contactExternalId: string | null;
  readonly firstResponseAt: string | null;
  readonly receivedAt: string;
  readonly status: 'new' | 'in_progress' | 'won' | 'lost' | 'unknown';
}

export interface Conversation extends SourceRecord {
  readonly contactExternalId: string | null;
  readonly lastMessageAt: string | null;
  readonly startedAt: string;
  readonly status: 'open' | 'closed' | 'unknown';
}

export interface Message extends SourceRecord {
  readonly conversationExternalId: string;
  readonly direction: 'inbound' | 'outbound' | 'unknown';
  readonly hasAttachment: boolean;
  readonly sentAt: string;
}

export interface Pipeline extends SourceRecord {
  readonly name: string;
  readonly status: 'active' | 'inactive' | 'unknown';
}

export interface Opportunity extends SourceRecord {
  readonly leadExternalId: string | null;
  readonly normalizedStatus: 'open' | 'won' | 'lost' | 'unknown';
  readonly pipelineExternalId: string | null;
  readonly stageExternalId: string | null;
}

export interface UpdateOpportunityInput {
  readonly externalId: string;
  readonly idempotencyKey: string;
  readonly normalizedStatus: Opportunity['normalizedStatus'];
}

export interface CreateTaskInput {
  readonly dueAt: string | null;
  readonly idempotencyKey: string;
  readonly opportunityExternalId: string | null;
  readonly title: string;
}

export interface CrmCapabilities {
  readonly createTask: boolean;
  readonly listContacts: boolean;
  readonly listConversations: boolean;
  readonly listLeads: boolean;
  readonly listMessages: boolean;
  readonly listOpportunities: boolean;
  readonly listPipelines: boolean;
  readonly updateOpportunity: boolean;
}

export interface CrmProvider {
  createTask(input: CreateTaskInput): Promise<void>;
  getCapabilities(): Promise<CrmCapabilities>;
  listContacts(input: SyncPageInput): Promise<Page<Contact>>;
  listConversations(input: SyncPageInput): Promise<Page<Conversation>>;
  listLeads(input: SyncPageInput): Promise<Page<Lead>>;
  listMessages(input: SyncPageInput): Promise<Page<Message>>;
  listOpportunities(input: SyncPageInput): Promise<Page<Opportunity>>;
  listPipelines(input: SyncPageInput): Promise<Page<Pipeline>>;
  updateOpportunity(input: UpdateOpportunityInput): Promise<void>;
}

export const CRM_PROVIDER_ERROR_CODES = [
  'CAPABILITY_NOT_SUPPORTED',
  'PROVIDER_NOT_CONFIGURED',
  'INVALID_CURSOR',
  'RATE_LIMITED',
  'TRANSIENT_ERROR',
  'PERMANENT_ERROR',
] as const;

export type CrmProviderErrorCode = (typeof CRM_PROVIDER_ERROR_CODES)[number];

export class CrmProviderError extends Error {
  public constructor(
    public readonly code: CrmProviderErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'CrmProviderError';
  }
}
