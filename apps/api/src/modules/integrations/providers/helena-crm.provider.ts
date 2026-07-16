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
import { Injectable } from '@nestjs/common';

/**
 * Blocked adapter. Do not add URLs, payloads or authentication until official
 * Helena documentation and a non-production sandbox are reviewed.
 */
@Injectable()
export class HelenaCrmProvider implements CrmProvider {
  public async getCapabilities(): Promise<CrmCapabilities> {
    return this.noCapabilities();
  }

  public async listContacts(_input: SyncPageInput): Promise<Page<Contact>> {
    return this.blocked();
  }

  public async listLeads(_input: SyncPageInput): Promise<Page<Lead>> {
    return this.blocked();
  }

  public async listConversations(_input: SyncPageInput): Promise<Page<Conversation>> {
    return this.blocked();
  }

  public async listMessages(_input: SyncPageInput): Promise<Page<Message>> {
    return this.blocked();
  }

  public async listPipelines(_input: SyncPageInput): Promise<Page<Pipeline>> {
    return this.blocked();
  }

  public async listOpportunities(_input: SyncPageInput): Promise<Page<Opportunity>> {
    return this.blocked();
  }

  public async updateOpportunity(_input: UpdateOpportunityInput): Promise<void> {
    return this.blocked();
  }

  public async createTask(_input: CreateTaskInput): Promise<void> {
    return this.blocked();
  }

  private blocked(): never {
    throw new CrmProviderError(
      'PROVIDER_NOT_CONFIGURED',
      'Helena integration is blocked pending official documentation',
    );
  }

  private noCapabilities(): CrmCapabilities {
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
}
