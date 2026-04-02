import 'reflect-metadata';
import { Expose, instanceToPlain, plainToInstance, Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
  validateSync,
  type ValidationError,
} from 'class-validator';

export type ServiceLeadStatus = 'NEW' | 'IN_PROGRESS' | 'CONVERTED_TO_ORDER' | 'CLOSED';

function normalizeStatus(value: unknown): ServiceLeadStatus {
  if (value === 'IN_PROGRESS') return 'IN_PROGRESS';
  if (value === 'CONVERTED_TO_ORDER') return 'CONVERTED_TO_ORDER';
  if (value === 'CLOSED') return 'CLOSED';
  return 'NEW';
}

export class ServiceLeadDto {
  @Expose()
  @IsString()
  id!: string;

  @Expose()
  @IsString()
  serviceId!: string;

  @Expose()
  @IsString()
  providerId!: string;

  @Expose()
  @Transform(({ value }) => normalizeStatus(value), { toClassOnly: true })
  @IsEnum(['NEW', 'IN_PROGRESS', 'CONVERTED_TO_ORDER', 'CLOSED'])
  status!: ServiceLeadStatus;

  @Expose()
  @IsOptional()
  @IsString()
  customerUserId!: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  customerName!: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  customerEmail!: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  customerPhone!: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  message!: string | null;

  @Expose()
  @IsString()
  serviceTitle!: string;

  @Expose()
  @IsString()
  createdAt!: string;

  @Expose()
  @IsString()
  updatedAt!: string;
}

export type ServiceLeadDbRow = {
  id: string;
  serviceId: string;
  providerId: string;
  status: ServiceLeadStatus;
  customerUserId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  message: string | null;
  service: {
    title: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

export function serviceLeadDbRowToDtoPlain(row: ServiceLeadDbRow): ServiceLeadDto {
  const inst = plainToInstance(
    ServiceLeadDto,
    {
      ...row,
      serviceTitle: row.service.title,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    },
    {
      excludeExtraneousValues: true,
      enableImplicitConversion: false,
    },
  );
  return instanceToPlain(inst) as ServiceLeadDto;
}

export class ServiceLeadPatchDto {
  @Expose()
  @IsOptional()
  @Transform(({ value }) => normalizeStatus(value), { toClassOnly: true })
  @IsEnum(['NEW', 'IN_PROGRESS', 'CONVERTED_TO_ORDER', 'CLOSED'])
  status?: ServiceLeadStatus;
}

function trimOrNull(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export class ServiceLeadCreateDto {
  @Expose()
  @Transform(({ value }) => trimOrNull(value), { toClassOnly: true })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  customerName?: string | null;

  @Expose()
  @Transform(({ value }) => trimOrNull(value), { toClassOnly: true })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsEmail()
  customerEmail?: string | null;

  @Expose()
  @Transform(({ value }) => trimOrNull(value), { toClassOnly: true })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  customerPhone?: string | null;

  @Expose()
  @Transform(({ value }) => trimOrNull(value), { toClassOnly: true })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  @MinLength(3)
  message?: string | null;
}

export function parseServiceLeadCreateDto(body: unknown): { data?: ServiceLeadCreateDto; issues?: unknown } {
  const inst = plainToInstance(ServiceLeadCreateDto, body, {
    excludeExtraneousValues: true,
    enableImplicitConversion: false,
  });
  const errors = validateSync(inst, { whitelist: true, forbidNonWhitelisted: true });
  if (errors.length) return { issues: validationErrorsToIssues(errors) };
  return { data: inst };
}

export function parseServiceLeadPatchDto(body: unknown): { data?: ServiceLeadPatchDto; issues?: unknown } {
  const inst = plainToInstance(ServiceLeadPatchDto, body, {
    excludeExtraneousValues: true,
    enableImplicitConversion: false,
  });
  const errors = validateSync(inst, { whitelist: true, forbidNonWhitelisted: true, skipMissingProperties: true });
  if (errors.length) return { issues: validationErrorsToIssues(errors) };
  return { data: inst };
}

function validationErrorsToIssues(errors: ValidationError[]) {
  const out: Array<{ path: string[]; message: string }> = [];

  function walk(err: ValidationError, prefix: string[] = []) {
    const path = [...prefix, err.property];
    if (err.constraints) {
      for (const msg of Object.values(err.constraints)) {
        out.push({ path, message: msg });
      }
    }
    if (err.children?.length) {
      for (const child of err.children) walk(child, path);
    }
  }

  for (const error of errors) walk(error);
  return out;
}
