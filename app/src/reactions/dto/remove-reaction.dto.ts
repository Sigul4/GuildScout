import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class RemoveReactionDto {
  @ApiProperty({
    description: 'Discord message ID',
    example: '123456789',
  })
  @IsNotEmpty()
  @IsNumberString()
  messageId: bigint;

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
}
