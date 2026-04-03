import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { InternalAuthService } from '../auth/internal-auth.service';
import { ChatGateway } from './chat.gateway';

const SNIPPET_LEN = 160;

export type ChatMessageDto = {
  id: string;
  conversationId: string;
  senderUserId: string;
  senderName: string | null;
  body: string;
  clientMessageId: string;
  createdAt: string;
  repliedTo?: {
    id: string;
    senderUserId: string;
    senderName: string | null;
    bodySnippet: string;
  };
};

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly internalAuth: InternalAuthService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly gateway: ChatGateway,
  ) {}

  getRequiredActorUserId(request: Request) {
    return this.internalAuth.getUserIdFromRequest(request);
  }

  private async loadUserChatActor(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        systemRole: true,
        providerMemberships: {
          where: { status: 'ACTIVE' },
          select: { providerId: true },
        },
      },
    });
    if (!user) {
      throw new ForbiddenException('Forbidden');
    }
    return user;
  }

  private assertLeadChatEligible(lead: { customerUserId: string | null }) {
    if (!lead.customerUserId) {
      throw new ForbiddenException('Chat is available only for leads linked to a customer account');
    }
  }

  private async assertCanAccessLead(
    userId: string,
    lead: { id: string; customerUserId: string | null; providerId: string },
    systemRole: string,
    activeMemberProviderIds: string[],
  ) {
    if (systemRole === 'PLATFORM_ADMIN') {
      throw new ForbiddenException('Platform admin cannot access customer-provider chats');
    }

    if (lead.customerUserId === userId) {
      return;
    }

    if (activeMemberProviderIds.includes(lead.providerId)) {
      return;
    }

    throw new ForbiddenException('Forbidden');
  }

  async assertConversationAccess(userId: string, conversationId: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        serviceLeadId: true,
        providerId: true,
        customerUserId: true,
      },
    });

    if (!conv) {
      throw new NotFoundException('Conversation not found');
    }

    const user = await this.loadUserChatActor(userId);
    const memberIds = user.providerMemberships.map((m) => m.providerId);

    await this.assertCanAccessLead(
      userId,
      {
        id: conv.serviceLeadId,
        customerUserId: conv.customerUserId,
        providerId: conv.providerId,
      },
      user.systemRole,
      memberIds,
    );
  }

  private async getLeadForChat(serviceLeadId: string) {
    const lead = await this.prisma.serviceLead.findUnique({
      where: { id: serviceLeadId },
      select: {
        id: true,
        customerUserId: true,
        providerId: true,
      },
    });
    if (!lead) {
      throw new NotFoundException('Service lead not found');
    }
    return lead;
  }

  async ensureConversation(actorUserId: string, serviceLeadId: string) {
    const lead = await this.getLeadForChat(serviceLeadId);
    this.assertLeadChatEligible(lead);

    const user = await this.loadUserChatActor(actorUserId);
    const memberIds = user.providerMemberships.map((m) => m.providerId);
    await this.assertCanAccessLead(actorUserId, lead, user.systemRole, memberIds);

    const conversation = await this.prisma.conversation.upsert({
      where: { serviceLeadId: lead.id },
      create: {
        id: randomUUID(),
        serviceLeadId: lead.id,
        providerId: lead.providerId,
        customerUserId: lead.customerUserId!,
      },
      update: {},
      select: { id: true },
    });

    return { conversationId: conversation.id, messages: [] as ChatMessageDto[] };
  }

  private mapMessageRow(
    row: Prisma.MessageGetPayload<{
      include: {
        sender: { select: { id: true; name: true } };
        replyTo: {
          select: {
            id: true;
            senderUserId: true;
            body: true;
            sender: { select: { name: true } };
          };
        };
      };
    }>,
  ): ChatMessageDto {
    const dto: ChatMessageDto = {
      id: row.id,
      conversationId: row.conversationId,
      senderUserId: row.senderUserId,
      senderName: row.sender.name ?? null,
      body: row.body,
      clientMessageId: row.clientMessageId,
      createdAt: row.createdAt.toISOString(),
    };

    if (row.replyTo) {
      dto.repliedTo = {
        id: row.replyTo.id,
        senderUserId: row.replyTo.senderUserId,
        senderName: row.replyTo.sender?.name ?? null,
        bodySnippet:
          row.replyTo.body.length > SNIPPET_LEN
            ? `${row.replyTo.body.slice(0, SNIPPET_LEN)}…`
            : row.replyTo.body,
      };
    }

    return dto;
  }

  private messageInclude = {
    sender: { select: { id: true, name: true } },
    replyTo: {
      select: {
        id: true,
        senderUserId: true,
        body: true,
        sender: { select: { name: true } },
      },
    },
  } satisfies Prisma.MessageInclude;

  async listMessages(
    actorUserId: string,
    conversationId: string,
    query: { before?: string; after?: string; limit?: number },
  ): Promise<ChatMessageDto[]> {
    await this.assertConversationAccess(actorUserId, conversationId);

    const limit = Math.min(Math.max(query.limit ?? 50, 1), 100);
    const where: Prisma.MessageWhereInput = { conversationId };

    if (query.before && query.after) {
      throw new BadRequestException('Use either before or after cursor, not both');
    }

    if (query.before) {
      const anchor = await this.prisma.message.findFirst({
        where: { id: query.before, conversationId },
        select: { createdAt: true },
      });
      if (!anchor) {
        throw new BadRequestException('Invalid before cursor');
      }
      where.createdAt = { lt: anchor.createdAt };
    } else if (query.after) {
      const anchor = await this.prisma.message.findFirst({
        where: { id: query.after, conversationId },
        select: { createdAt: true },
      });
      if (!anchor) {
        throw new BadRequestException('Invalid after cursor');
      }
      where.createdAt = { gt: anchor.createdAt };
    }

    const rows = await this.prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: this.messageInclude,
    });

    return rows.reverse().map((r) => this.mapMessageRow(r));
  }

  async markRead(actorUserId: string, conversationId: string) {
    await this.assertConversationAccess(actorUserId, conversationId);

    const now = new Date();
    await this.prisma.conversationReadState.upsert({
      where: {
        conversationId_userId: { conversationId, userId: actorUserId },
      },
      create: {
        conversationId,
        userId: actorUserId,
        lastReadAt: now,
      },
      update: { lastReadAt: now },
    });

    return { ok: true as const, lastReadAt: now.toISOString() };
  }

  private async getParticipantUserIds(conversationId: string): Promise<string[]> {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        customerUserId: true,
        providerId: true,
      },
    });
    if (!conv) {
      return [];
    }

    const members = await this.prisma.providerMember.findMany({
      where: { providerId: conv.providerId, status: 'ACTIVE' },
      select: { userId: true },
    });

    const ids = new Set<string>([conv.customerUserId, ...members.map((m) => m.userId)]);
    return [...ids];
  }

  async createMessage(
    actorUserId: string,
    conversationId: string,
    input: { body: string; clientMessageId: string; replyToMessageId?: string | null },
  ): Promise<{ message: ChatMessageDto; alreadyExisted: boolean }> {
    await this.assertConversationAccess(actorUserId, conversationId);

    const body = input.body.trim();
    if (!body) {
      throw new BadRequestException('Message body is required');
    }

    if (input.replyToMessageId) {
      const parent = await this.prisma.message.findFirst({
        where: { id: input.replyToMessageId, conversationId },
        select: { id: true },
      });
      if (!parent) {
        throw new BadRequestException('replyToMessageId must reference a message in this conversation');
      }
    }

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        const msg = await tx.message.create({
          data: {
            id: randomUUID(),
            conversationId,
            senderUserId: actorUserId,
            clientMessageId: input.clientMessageId,
            body,
            replyToMessageId: input.replyToMessageId ?? undefined,
          },
          include: this.messageInclude,
        });

        await tx.conversation.update({
          where: { id: conversationId },
          data: { lastMessageAt: msg.createdAt },
        });

        return msg;
      });

      const dto = this.mapMessageRow(created);

      this.gateway.emitMessageCreated(conversationId, dto);

      const participants = await this.getParticipantUserIds(conversationId);
      const convRow = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { serviceLeadId: true },
      });

      const fullHint = {
        conversationId,
        serviceLeadId: convRow!.serviceLeadId,
        lastMessageAt: created.createdAt.toISOString(),
        senderUserId: actorUserId,
        bodySnippet: body.length > SNIPPET_LEN ? `${body.slice(0, SNIPPET_LEN)}…` : body,
      };

      for (const uid of participants) {
        if (uid !== actorUserId) {
          this.gateway.emitUnreadHint(uid, fullHint);
        }
      }

      return { message: dto, alreadyExisted: false };
    } catch (error) {
      const isUniqueViolation =
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'P2002';
      if (isUniqueViolation) {
        const existing = await this.prisma.message.findFirst({
          where: {
            conversationId,
            senderUserId: actorUserId,
            clientMessageId: input.clientMessageId,
          },
          include: this.messageInclude,
        });
        if (!existing) {
          throw error;
        }
        return { message: this.mapMessageRow(existing), alreadyExisted: true };
      }
      throw error;
    }
  }

  async getUnreadByLeadIds(actorUserId: string, leadIds: string[]): Promise<Record<string, number>> {
    const user = await this.loadUserChatActor(actorUserId);
    const memberIds = user.providerMemberships.map((m) => m.providerId);

    const result: Record<string, number> = {};
    for (const leadId of leadIds) {
      const lead = await this.getLeadForChat(leadId);
      try {
        await this.assertCanAccessLead(actorUserId, lead, user.systemRole, memberIds);
      } catch {
        result[leadId] = 0;
        continue;
      }

      if (!lead.customerUserId) {
        result[leadId] = 0;
        continue;
      }

      const conv = await this.prisma.conversation.findUnique({
        where: { serviceLeadId: leadId },
        select: { id: true },
      });
      if (!conv) {
        result[leadId] = 0;
        continue;
      }

      const read = await this.prisma.conversationReadState.findUnique({
        where: {
          conversationId_userId: { conversationId: conv.id, userId: actorUserId },
        },
        select: { lastReadAt: true },
      });

      const since = read?.lastReadAt ?? new Date(0);

      const count = await this.prisma.message.count({
        where: {
          conversationId: conv.id,
          senderUserId: { not: actorUserId },
          createdAt: { gt: since },
        },
      });

      result[leadId] = count;
    }

    return result;
  }
}
