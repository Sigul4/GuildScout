import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsNumberString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({
    description: 'User ID',
    type: 'string',
    format: 'bigint',
    example: '123456789',
  })
  @IsNotEmpty()
  @IsNumberString()
  id: bigint;

  @ApiProperty({
    description: 'Username',
    example: 'john_doe',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiPropertyOptional({
    description: 'Geographic location of the user',
    example: 'New York, USA',
  })
  @IsString()
  @IsOptional()
  geoLocation?: string;

  @ApiProperty({
    description: 'Timestamp when user was first seen',
    type: 'string',
    format: 'date-time',
    example: '2024-01-07T12:00:00Z',
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  firstSeenAt: Date;

  @ApiProperty({
    description: "Timestamp of user's last presence",
    type: 'string',
    format: 'date-time',
    example: '2024-01-07T14:30:00Z',
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  lastActiveAt: Date;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '123456789',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Username',
    example: 'john_doe',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiPropertyOptional({
    description: 'Geographic location of the user',
    example: 'New York, USA',
  })
  @IsString()
  @IsOptional()
  geoLocation?: string;

  @ApiProperty({
    description: 'Timestamp when user was first seen',
    type: 'string',
    format: 'date-time',
    example: '2024-01-07T12:00:00Z',
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  firstSeenAt: Date;

  @ApiProperty({
    description: "Timestamp of user's last presence",
    type: 'string',
    format: 'date-time',
    example: '2024-01-07T14:30:00Z',
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  lastActiveAt: Date;
}
