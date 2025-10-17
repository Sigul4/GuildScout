import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateKeywordDto {
  @ApiProperty({
    description: 'Keyword to match in messages-match',
    example: 'important',
  })
  @IsString()
  @IsNotEmpty()
  keyword: string;

  @ApiProperty({
    description: 'Discord guild ID',
    example: '123456789',
  })
  @IsNotEmpty()
  @IsNumberString()
  guildId: bigint;

  @ApiPropertyOptional({
    description: 'Whether the keyword is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
