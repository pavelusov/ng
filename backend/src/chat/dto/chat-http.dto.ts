import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class ChatEnsureBodyDto {
  @IsUUID()
  serviceLeadId!: string;
}

export class ChatPostMessageBodyDto {
  @IsString()
  @MinLength(1)
  body!: string;

  @IsUUID()
  clientMessageId!: string;

  @IsOptional()
  @IsUUID()
  replyToMessageId?: string;
}
