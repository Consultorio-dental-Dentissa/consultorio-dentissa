import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { resolvePagination } from 'src/infrastructure/common/dto/pagination.dto';
import { FaqRepository } from './repositories/faq.repository';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditEntity } from '../audit/audit.constants';
import { CreateFaqDto, GetFaqDto, UpdateFaqDto } from './dto/faq.dto';

@Injectable()
export class FaqService {
  constructor(
    private faqRepository: FaqRepository,
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  /** Publico: solo activas y solo los campos necesarios; ignora el filtro de estado. */
  async getPublic(filters: GetFaqDto) {
    const { page, limit } = resolvePagination(filters);
    const { items, total } = await this.faqRepository.getAll(filters, {
      onlyActive: true,
      publicFields: true,
    });

    return { items, total, page, limit };
  }

  async getAdmin(filters: GetFaqDto) {
    const { page, limit } = resolvePagination(filters);
    const { items, total } = await this.faqRepository.getAll(filters, {
      onlyActive: false,
      publicFields: false,
    });

    return { items, total, page, limit };
  }

  async getById(id: number) {
    const faq = await this.faqRepository.getById(id);
    if (!faq) throw new NotFoundException('La pregunta frecuente no existe');

    return faq;
  }

  async create(dto: CreateFaqDto, actorId: number) {
    return await this.prisma.$transaction(async (tx) => {
      const faq = await this.faqRepository.create(
        {
          question: dto.question.trim(),
          response: dto.response.trim(),
          status: dto.status,
        },
        tx,
      );

      await this.auditService.log(
        {
          userId: actorId,
          action: AuditAction.FAQ_CREATED,
          entity: AuditEntity.FAQ,
          entityId: faq.id,
          after: { question: faq.question, status: faq.status },
        },
        tx,
      );

      return faq;
    });
  }

  async update(id: number, dto: UpdateFaqDto, actorId: number) {
    if (dto.question === undefined && dto.response === undefined) {
      throw new BadRequestException('Envía al menos un campo para actualizar');
    }

    return await this.prisma.$transaction(async (tx) => {
      await this.faqRepository.lockById(id, tx);
      const current = await this.faqRepository.getById(id, tx);
      if (!current)
        throw new NotFoundException('La pregunta frecuente no existe');

      const question = dto.question?.trim();
      const response = dto.response?.trim();
      const data: { question?: string; response?: string } = {};
      if (question !== undefined && question !== current.question) {
        data.question = question;
      }
      if (response !== undefined && response !== current.response) {
        data.response = response;
      }
      if (Object.keys(data).length === 0) return current;

      const faq = await this.faqRepository.update(id, data, tx);

      // El texto de la FAQ es contenido publico: no es dato sensible.
      const before: Record<string, unknown> = {};
      const after: Record<string, unknown> = {};
      for (const key of Object.keys(data) as (keyof typeof data)[]) {
        before[key] = current[key];
        after[key] = faq[key];
      }

      await this.auditService.log(
        {
          userId: actorId,
          action: AuditAction.FAQ_UPDATED,
          entity: AuditEntity.FAQ,
          entityId: id,
          before,
          after,
        },
        tx,
      );

      return faq;
    });
  }

  async updateStatus(id: number, status: boolean, actorId: number) {
    return await this.prisma.$transaction(async (tx) => {
      await this.faqRepository.lockById(id, tx);
      const current = await this.faqRepository.getById(id, tx);
      if (!current)
        throw new NotFoundException('La pregunta frecuente no existe');
      if (current.status === status) return current;

      const faq = await this.faqRepository.update(id, { status }, tx);

      await this.auditService.log(
        {
          userId: actorId,
          action: AuditAction.FAQ_STATUS_CHANGED,
          entity: AuditEntity.FAQ,
          entityId: id,
          before: { status: current.status },
          after: { status: faq.status },
        },
        tx,
      );

      return faq;
    });
  }

  async remove(id: number, actorId: number) {
    return await this.prisma.$transaction(async (tx) => {
      await this.faqRepository.lockById(id, tx);
      const current = await this.faqRepository.getById(id, tx);
      if (!current)
        throw new NotFoundException('La pregunta frecuente no existe');

      await this.faqRepository.delete(id, tx);

      await this.auditService.log(
        {
          userId: actorId,
          action: AuditAction.FAQ_DELETED,
          entity: AuditEntity.FAQ,
          entityId: id,
          before: { question: current.question, status: current.status },
        },
        tx,
      );

      return { id, deleted: true };
    });
  }
}
