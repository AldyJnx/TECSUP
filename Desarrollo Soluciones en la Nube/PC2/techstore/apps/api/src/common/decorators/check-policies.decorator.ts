import { SetMetadata } from '@nestjs/common';
import { IPolicyHandler } from '../guards/policies.guard';

export const CHECK_POLICIES_KEY = 'check_policies';
export const CheckPolicies = (...handlers: IPolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
