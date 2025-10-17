// src/users/users.controller.ts
import { Controller, Get, Post, Body, Param, Put, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UserResponseDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const user = await this.usersService.create(createUserDto);
        return this.transformToDto(user);
    }

    @Get()
    async findAll(): Promise<UserResponseDto[]> {
        const users = await this.usersService.findAll();
        return users.map(this.transformToDto);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<UserResponseDto> {
        const user = await this.usersService.findOne(BigInt(id));
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return this.transformToDto(user);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: Partial<CreateUserDto>,
    ): Promise<UserResponseDto> {
        const user = await this.usersService.update(BigInt(id), updateUserDto);
        return this.transformToDto(user);
    }

    private transformToDto(user: any): UserResponseDto {
        return {
            id: user.id.toString(), // Convert BigInt to string
            username: user.username,
            geoLocation: user.geoLocation,
            firstSeenAt: user.firstSeenAt,
            lastActiveAt: user.lastActiveAt,
        };
    }
}