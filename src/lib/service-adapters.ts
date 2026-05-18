import type { NotificationChannel } from "@/lib/types";

type NotificationPayload = {
  channel: NotificationChannel;
  recipientEmail?: string;
  title: string;
  message: string;
};

export function getIntegrationStatus() {
  return {
    database: Boolean(process.env.DATABASE_URL),
    resend: Boolean(process.env.RESEND_API_KEY),
    redis: Boolean(process.env.UPSTASH_REDIS_REST_URL),
    teams: Boolean(process.env.TEAMS_WEBHOOK_URL),
    entra:
      Boolean(process.env.AUTH_MICROSOFT_ENTRA_ID_ID) &&
      Boolean(process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET),
  };
}

export async function sendNotification(payload: NotificationPayload) {
  const status = getIntegrationStatus();

  if (payload.channel === "EMAIL" && status.resend) {
    return {
      status: "READY",
      message: "Resend adapter is configured for live email delivery.",
    };
  }

  if (payload.channel === "TEAMS" && status.teams) {
    return {
      status: "READY",
      message: "Teams webhook adapter is configured for live cards.",
    };
  }

  return {
    status: "MOCKED",
    message: `${payload.channel} notification recorded in demo mode.`,
  };
}

export async function enqueueEscalation(ruleId: string) {
  if (process.env.UPSTASH_REDIS_REST_URL) {
    return {
      status: "READY",
      message: `Escalation ${ruleId} can be queued through Upstash Redis.`,
    };
  }

  return {
    status: "MOCKED",
    message: `Escalation ${ruleId} is visible in demo mode only.`,
  };
}
