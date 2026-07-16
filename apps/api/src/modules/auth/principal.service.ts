import type { Principal } from '@althion/domain';
import { Injectable } from '@nestjs/common';

import { PrincipalRepository } from './principal.repository';

@Injectable()
export class PrincipalService {
  public constructor(private readonly repository: PrincipalRepository) {}

  public resolve(accessToken: string, subject: string): Promise<Principal> {
    return this.repository.resolve(accessToken, subject);
  }
}
