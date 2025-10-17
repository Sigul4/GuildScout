import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/common';

export class ErrorResponseDto {
  @ApiProperty({
    example: 'Internal Server Error',
    description: 'The name of the error',
  })
  name: string;

  @ApiProperty({
    example: 'Error: Internal Server Error',
    description: 'The stack trace of the error (ONLY IN DEV MODE)',
  })
  stack?: string;
}

export function createResponseShapeDto<T>(classRef: Type<T>) {
  class ResponseShapeWrapper {
    @ApiProperty({
      type: classRef,
    })
    body: T;

    @ApiProperty({
      example: 200,
      description: 'The status code of the response',
    })
    statusCode: number;

    @ApiProperty({
      example: '2021-01-01T00:00:00.000Z',
    })
    timestamp: Date | string;

    @ApiProperty({
      example: '/api/account',
    })
    path: string;

    @ApiProperty({
      type: ErrorResponseDto,
    })
    error: ErrorResponseDto;

    @ApiProperty({
      example: 'Account created successfully',
    })
    message: string;

    @ApiProperty({
      example: true,
    })
    success: boolean;
  }

  return ResponseShapeWrapper;
}
