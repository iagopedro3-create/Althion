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
  type SyncPageInput,
  type UpdateOpportunityInput,
} from '@althion/domain';

export class FutureCrmProvider implements CrmProvider {
  public async getCapabilities(): Promise<CrmCapabilities> {
    return {
      createTask: false,
      listContacts: false,
      listConversations: false,
      listLeads: false,
      listMessages: false,
      listOpportunities: false,
      listPipelines: false,
      updateOpportunity: false,
    };
  }

  public async listContacts(_input: SyncPageInput): Promise<Page<Contact>> {
    return this.unsupported();
  }

  public async listLeads(_input: SyncPageInput): Promise<Page<Lead>> {
    return this.unsupported();
  }

  public async listConversations(_input: SyncPageInput): Promise<Page<Conversation>> {
    return this.unsupported();
  }

  public async listMessages(_input: SyncPageInput): Promise<Page<Message>> {
    return this.unsupported();
  }

  public async listPipelines(_input: SyncPageInput): Promise<Page<Pipeline>> {
    return this.unsupported();
  }

  public async listOpportunities(_input: SyncPageInput): Promise<Page<Opportunity>> {
    return this.unsupported();
  }

  public async updateOpportunity(_input: UpdateOpportunityInput): Promise<void> {
    return this.unsupported();
  }

  public async createTask(_input: CreateTaskInput): Promise<void> {
    return this.unsupported();
  }

  private unsupported(): never {
    throw new CrmProviderError(
      'CAPABILITY_NOT_SUPPORTED',
      'No future CRM provider has been configured',
    );
  }
}
