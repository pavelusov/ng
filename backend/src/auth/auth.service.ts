import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import {
  type AuthMembership,
  type AuthorizedUser,
  canManageServices,
  type ServiceManagementAction,
} from './authorization';

const userAuthSelect = {
  id: true,
  email: true,
  name: true,
  image: true,
  systemRole: true,
  activeProviderId: true,
  passwordHash: true,
  providerMemberships: {
    where: { status: 'ACTIVE' as const },
    select: {
      role: true,
      status: true,
      provider: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
        },
      },
    },
  },
};

type UserAuthRow = Prisma.UserGetPayload<{ select: typeof userAuthSelect }>;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeMemberships(
    memberships: Array<{
      role: AuthMembership['role'];
      status: AuthMembership['status'];
    provider: {
        id: string;
        name: string;
        slug: string;
      type: AuthMembership['providerType'];
      };
    }>,
  ): AuthMembership[] {
    return memberships.map((membership) => ({
      providerId: membership.provider.id,
      providerName: membership.provider.name,
      providerSlug: membership.provider.slug,
      providerType: membership.provider.type,
      role: membership.role,
      status: membership.status,
    }));
  }

  private resolveActiveProviderId(
    activeProviderId: string | null,
    memberships: AuthMembership[],
  ) {
    if (
      activeProviderId &&
      memberships.some((membership) => membership.providerId === activeProviderId)
    ) {
      return activeProviderId;
    }

    return memberships[0]?.providerId ?? null;
  }

  private mapAuthorizedUser(
    user: UserAuthRow | null,
  ): AuthorizedUser | null {
    if (!user) return null;

    const memberships = this.normalizeMemberships(user.providerMemberships);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      systemRole: user.systemRole,
      activeProviderId: this.resolveActiveProviderId(
        user.activeProviderId,
        memberships,
      ),
      memberships,
    };
  }

  async getUserAuthContext(userId: string): Promise<AuthorizedUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userAuthSelect,
    });

    return this.mapAuthorizedUser(user);
  }

  async validateCredentials(emailInput: string, password: string) {
    const email = emailInput.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: userAuthSelect,
    });

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const authUser = this.mapAuthorizedUser(user);
    if (!authUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return authUser;
  }

  async signup(input: { email: string; password: string; name?: string }) {
    const email = input.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(input.password, 10);

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('user already exists');
    }

    const created = await this.prisma.user.create({
      data: {
        email,
        name: input.name?.trim() || undefined,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return created;
  }

  async getServiceManagementContext(
    userId: string,
    action: ServiceManagementAction,
  ) {
    const user = await this.getUserAuthContext(userId);
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    const context = canManageServices(user, action);
    if (!context) {
      throw new ForbiddenException('Forbidden');
    }

    return context;
  }
}
