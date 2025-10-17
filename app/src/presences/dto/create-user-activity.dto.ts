import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsNumberString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

enum UserStatus {
  ONLINE = 'online',
  IDLE = 'idle',
  DND = 'dnd',
  OFFLINE = 'offline',
}

enum ClientType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  WEB = 'web',
}

export class CreateUserActivityDto {
  @ApiProperty({
    description: 'User ID',
    type: 'string',
    format: 'bigint',
    example: '123456789',
  })
  @IsNotEmpty()
  @IsNumberString()
  userId: string;

  @ApiProperty({
    description: 'Guild ID',
    type: 'string',
    format: 'bigint',
    example: '987654321',
  })
  @IsNotEmpty()
  @IsNumberString()
  guildId: string;

  @ApiProperty({
    description: 'User status',
    enum: UserStatus,
    example: UserStatus.ONLINE,
  })
  @IsNotEmpty()
  @IsEnum(UserStatus)
  status: UserStatus;

  @ApiPropertyOptional({
    description: 'Client type',
    enum: ClientType,
    example: ClientType.DESKTOP,
  })
  @IsOptional()
  @IsEnum(ClientType)
  clientType?: ClientType;

  @ApiProperty({
    description: 'Last update timestamp',
    type: 'string',
    format: 'date-time',
    example: '2024-01-09T12:00:00Z',
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  updatedAt: Date;
}
