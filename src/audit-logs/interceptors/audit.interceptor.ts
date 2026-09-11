// src/audit-logs/interceptors/audit.interceptor.ts
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AUDITABLE_KEY } from '../decorators/auditable.decorator';
import { AuditLogsService } from '../audit-logs.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(
        private readonly reflector: Reflector,
        private readonly auditLogsService: AuditLogsService,
        private readonly prismaService: PrismaService,
    ) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const entityName = this.reflector.get<string>(AUDITABLE_KEY, context.getHandler());

        if (!entityName) {
            return next.handle();
        }

        const request = context.switchToHttp().getRequest();
        const userId = request.user?.userId;
        // Proteção extra: sem usuário autenticado, não loga (mesmo com @Auditable presente)
        if (!userId) {
            return next.handle();
        }

        const method = request.method; // POST, PATCH, DELETE
        const params = request.params;
        const modelKey = entityName.charAt(0).toLowerCase() + entityName.slice(1);

        let dadosAnteriores: any = null;

        // Para UPDATE/DELETE, busca o registro ANTES de deixar seguir pro handler
        if ((method === 'PATCH' || method === 'PUT' || method === 'DELETE') && params?.id) {
            try {
                dadosAnteriores = await (this.prismaService as any)[modelKey].findUnique({
                    where: { id: params.id },
                });
            } catch {
                dadosAnteriores = null;
            }
        }

        return next.handle().pipe(
            tap(async (response) => {
                let acao: 'CREATE' | 'UPDATE' | 'DELETE';
                if (method === 'POST') acao = 'CREATE';
                else if (method === 'PATCH' || method === 'PUT') acao = 'UPDATE';
                else if (method === 'DELETE') acao = 'DELETE';
                else return; // GET não audita

                const entidadeId = response?.id ?? params?.id;
                if (!entidadeId) return;

                const dadosNovos = acao === 'DELETE' ? null : response;

                await this.auditLogsService.create({
                    userId,
                    action: acao,
                    entity: entityName,
                    entityId: String(entidadeId),
                    previousData: dadosAnteriores ?? undefined,
                    newData: dadosNovos ?? undefined,
                } as any);
            }),
        );
    }
}