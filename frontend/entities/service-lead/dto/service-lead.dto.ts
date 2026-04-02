export type ServiceLeadStatus = "NEW" | "IN_PROGRESS" | "CONVERTED_TO_ORDER" | "CLOSED";

export type ServiceLeadDto = {
  id: string;
  serviceId: string;
  providerId: string;
  status: ServiceLeadStatus;
  customerUserId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  message: string | null;
  serviceTitle: string;
  createdAt: string;
  updatedAt: string;
};

export type ServiceLeadPatchDto = {
  status?: ServiceLeadStatus;
};
