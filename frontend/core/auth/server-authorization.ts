import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { defineAbilityFor, getActiveMembership, serviceSubject, type AppAction } from "@/core/auth/authorization";

type ServiceManagementAction = Extract<AppAction, "read" | "create" | "update" | "delete">;

type ServiceManagementContext = {
  actorUserId: string;
  providerId: string | null;
  isPlatformAdmin: boolean;
};

function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export async function getServiceManagementContext(action: ServiceManagementAction) {
  const session = await getServerAuthSession();
  const user = session?.user ?? null;

  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    } as const;
  }

  const ability = defineAbilityFor(user);
  const isPlatformAdmin = user.systemRole === "PLATFORM_ADMIN";

  if (isPlatformAdmin) {
    return {
      context: {
        actorUserId: user.id,
        providerId: user.activeProviderId,
        isPlatformAdmin: true,
      } satisfies ServiceManagementContext,
    } as const;
  }

  const activeMembership = getActiveMembership(user);
  if (!activeMembership) {
    return { error: forbidden("Active provider is required") } as const;
  }

  if (!ability.can(action, serviceSubject(activeMembership.providerId))) {
    return { error: forbidden() } as const;
  }

  return {
    context: {
      actorUserId: user.id,
      providerId: activeMembership.providerId,
      isPlatformAdmin: false,
    } satisfies ServiceManagementContext,
  } as const;
}
