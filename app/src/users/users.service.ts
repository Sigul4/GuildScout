import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findOne(id: bigint): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        messageMatches: true,
        reactions: true,
      },
    });
  }

  async update(id: bigint, data: Partial<CreateUserDto>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
