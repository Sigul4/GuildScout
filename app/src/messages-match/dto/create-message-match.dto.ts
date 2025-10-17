import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMessageMatchDto {
  @ApiProperty({
    description: 'Discord message ID',
    example: '123456789',
  })
  @IsNotEmpty()
  @IsNumberString()
  messageId: bigint;

  @ApiProperty({
    description: 'Discord channel ID',
    example: '123456789',
  })
  @IsNotEmpty()
  @IsNumberString()
  channelId: bigint;

  @ApiProperty({
    description: 'Discord guild ID',
    example: '123456789',
  })
  @IsNotEmpty()
  @IsNumberString()
  guildId: bigint;

  @ApiProperty({
    description: 'Message author ID',
    example: '123456789',
  })
  @IsNotEmpty()
  @IsNumberString()
  authorId: bigint;

  @ApiProperty({
    description: 'Keyword ID that triggered the match',
    example: '1',
  })
  @IsNotEmpty()
  @IsNumberString()
  keywordId: bigint;

  @ApiPropertyOptional({
    description: 'Context before the keyword match',
    example: 'This is the text before the',
  })
  @IsOptional()
  @IsString()
  preContext?: string;

  @ApiPropertyOptional({
    description: 'Context after the keyword match',
    example: 'matched word and the following text',
  })
  @IsOptional()
  @IsString()
  postContext?: string;
}
