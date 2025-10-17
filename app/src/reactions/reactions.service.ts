import { Reaction } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { RemoveReactionDto } from './dto/remove-reaction.dto';

@Injectable()
export class ReactionsService {
  constructor(private prisma: PrismaService) {}

  async createReaction(data: CreateReactionDto): Promise<Reaction> {
    return this.prisma.reaction.create({
      data: {
        ...data,
        addedAt: new Date(),
      },
    });
  }

  async removeReaction(data: RemoveReactionDto): Promise<Reaction> {
    return this.prisma.reaction
      .updateMany({
        where: {
          ...data,
          removedAt: null,
        },
        data: {
          removedAt: new Date(),
        },
      })
      .then(() =>
        this.prisma.reaction.findFirst({
          where: {
            ...data,
          },
          orderBy: {
            addedAt: 'desc',
          },
        }),
      );
  }
}
