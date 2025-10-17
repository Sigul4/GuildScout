import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumberString,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateReactionDto {
  @ApiProperty({
    description: 'Discord message ID',
    example: '123456789',
  })
  @IsNotEmpty()
  @IsNumberString()
  messageId: bigint;

  @ApiProperty({
    description: 'Discord guild ID',
    example: '123456789',
  })
  @IsNotEmpty()
  @IsNumberString()
  guildId: bigint;

  @ApiProperty({
    description: 'Discord channel ID',
    example: '123456789',
  })
  @IsNotEmpty()
  @IsNumberString()
  channelId: bigint;

  @ApiProperty({
    description: 'Discord user ID',
    example: '123456789',
  })
  @IsNotEmpty()
  @IsNumberString()
  userId: bigint;

  @ApiProperty({
    description: 'Emoji name',
    example: '👍',
  })
  @IsString()
  @IsNotEmpty()
  emojiName: string;

  @ApiPropertyOptional({
    description: 'Custom emoji ID',
    example: '123456789',
  })
  @IsOptional()
  @IsNumberString()
  emojiId?: bigint;
}
