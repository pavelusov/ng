import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { AddProviderManagerDto } from './dto/add-provider-manager.dto';
import { AuthService } from '../auth/auth.service';

const providerSelect = {
  id: true,
  name: true,
  slug: true,
  type: true,
  ownerUserId: true,
  createdAt: true,
  updatedAt: true,
} as const;

const providerMemberSelect = {
  id: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
    },
  },
} as const;

@Injectable()
export class ProvidersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  private async getActiveMembership(userId: string, providerId: string) {
    const membership = await this.prisma.providerMember.findUnique({
      where: {
        providerId_userId: {
          providerId,
          userId,
        },
      },
      select: {
        id: true,
        role: true,
        status: true,
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw new ForbiddenException('Provider access denied');
    }

    return membership;
  }

  private async ensureProviderOwner(userId: string, providerId: string) {
    const membership = await this.getActiveMembership(userId, providerId);

    if (membership.role !== 'OWNER') {
      throw new ForbiddenException('Only provider owner can manage members');
    }

    return membership;
  }

  async createProvider(userId: string, body: CreateProviderDto) {
    const name = body.name.trim();
    const slug = body.slug.trim().toLowerCase();

    const existingBySlug = await this.prisma.provider.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existingBySlug) {
      throw new ConflictException('Provider slug already exists');
    }

    if (body.type === 'SELF_EMPLOYED') {
      const existingSelfEmployed = await this.prisma.provider.findFirst({
        where: {
          type: 'SELF_EMPLOYED',
          ownerUserId: userId,
        },
        select: { id: true },
      });

      if (existingSelfEmployed) {
        throw new ConflictException(
          'User already owns a self-employed provider profile',
        );
      }
    }

    const provider = await this.prisma.$transaction(async (tx) => {
      const createdProvider = await tx.provider.create({
        data: {
          name,
          slug,
          type: body.type,
          ownerUserId: userId,
        },
        select: providerSelect,
      });

      await tx.providerMember.create({
        data: {
          providerId: createdProvider.id,
          userId,
          role: 'OWNER',
          status: 'ACTIVE',
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          activeProviderId: createdProvider.id,
        },
      });

      return createdProvider;
    });

    const authContext = await this.authService.getUserAuthContext(userId);

    return {
      provider,
      authContext,
    };
  }

  async getMyProviders(userId: string) {
    return this.prisma.providerMember.findMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        role: true,
        status: true,
        provider: {
          select: providerSelect,
        },
      },
    });
  }

  async activateProvider(userId: string, providerId: string) {
    await this.getActiveMembership(userId, providerId);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        activeProviderId: providerId,
      },
    });

    return this.authService.getUserAuthContext(userId);
  }

  async getProviderMembers(userId: string, providerId: string) {
    await this.getActiveMembership(userId, providerId);

    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        members: {
          orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
          select: providerMemberSelect,
        },
      },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return provider;
  }

  async addProviderManager(
    actorUserId: string,
    providerId: string,
    body: AddProviderManagerDto,
  ) {
    await this.ensureProviderOwner(actorUserId, providerId);

    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId },
      select: {
        id: true,
        type: true,
      },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    if (provider.type === 'SELF_EMPLOYED') {
      throw new ConflictException(
        'Self-employed provider cannot have managers',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User with this email was not found');
    }

    if (user.id === actorUserId) {
      throw new ConflictException('Owner already has access to this provider');
    }

    const existingMembership = await this.prisma.providerMember.findUnique({
      where: {
        providerId_userId: {
          providerId,
          userId: user.id,
        },
      },
      select: {
        role: true,
        status: true,
      },
    });

    if (existingMembership?.role === 'OWNER') {
      throw new ConflictException('User is already owner of this provider');
    }

    const membership = await this.prisma.providerMember.upsert({
      where: {
        providerId_userId: {
          providerId,
          userId: user.id,
        },
      },
      update: {
        role: 'MANAGER',
        status: 'ACTIVE',
      },
      create: {
        providerId,
        userId: user.id,
        role: 'MANAGER',
        status: 'ACTIVE',
      },
      select: providerMemberSelect,
    });

    return membership;
  }
}
