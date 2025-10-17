import { KafkaClient } from '../../utils/kafka';
import { VoiceState } from 'discord.js';
import { config } from '../../config';
import {KafkaStream} from "../../types";

// Define the type for Kafka stream events


export class StreamHandler {
    private kafkaClient: KafkaClient;

    constructor() {
        this.kafkaClient = KafkaClient.getInstance();
    }

    public async handleStreamUpdate(
        oldState: VoiceState,
        newState: VoiceState,
    ): Promise<void> {
        // Return if no guild is present
        if (!newState.guild) return;

        // Check if streaming state changed
        const streamingStarted = !oldState.streaming && newState.streaming;
        const streamingStopped = oldState.streaming && !newState.streaming;

        if (!streamingStarted && !streamingStopped) return;

        const stream: KafkaStream = {
            userId: newState.member?.id || oldState.member?.id || '',
            guildId: newState.guild.id,
            channelId: newState.channelId || oldState.channelId,
            timestamp: new Date(),
            action: streamingStarted ? 'START' : 'STOP',
            memberTag: newState.member?.user.tag || oldState.member?.user.tag || null,
            channelName: newState.channel?.name || oldState.channel?.name || null,
        };

        await this.kafkaClient.sendMessage(
            config.kafka.topics.streams,
            `${stream.userId}-${Date.now()}`,
            stream,
        );
    }
}