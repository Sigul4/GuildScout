import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaConsumerService } from './kafka-consumer.service';
import { ReactionsService } from '../reactions/reactions.service';
import { MessageMatchesService } from '../messages-match/message-matches.service';
import { UsersService } from '../users/users.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'discord-bot',
            brokers: ['kafka:29092'],
          },
          consumer: {
            groupId: 'discord-consumer-group',
          },
        },
      },
    ]),
  ],
  providers: [
    KafkaConsumerService,
    ReactionsService,
    MessageMatchesService,
    UsersService,
  ],
})
export class KafkaModule {}
