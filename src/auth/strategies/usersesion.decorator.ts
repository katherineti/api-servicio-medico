import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Usersesion = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);