import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUser } from '../types';
import { CHECK_POLICIES_KEY } from '../decorators/check-policies.decorator';

export interface PolicyContext {
  user: AuthenticatedUser;
  resource?: unknown;
  action: string;
}

export interface IPolicyHandler {
  handle(context: PolicyContext): boolean | Promise<boolean>;
}

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers = this.reflector.get<IPolicyHandler[]>(
      CHECK_POLICIES_KEY,
      context.getHandler(),
    );

    if (!policyHandlers || policyHandlers.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    for (const handler of policyHandlers) {
      const allowed = await handler.handle({ user, action: 'check' });
      if (!allowed) {
        throw new ForbiddenException('Insufficient permissions for this action');
      }
    }
    return true;
  }
}
