import type { ServiceRecord } from "./types";

export type ServiceRecordRequestDto = Omit<ServiceRecord, "id">;

