import { getChannel } from './client.js';

const fetchAllMessages = async (channelId) => {
    const channel = await getChannel(channelId);
    let allMessages = [];
    let lastId;

    while (true) {
        const options = { limit: 100 };
        if (lastId) options.before = lastId;

        const messages = await channel.messages.fetch(options);
        if (messages.size === 0) break;

        allMessages = allMessages.concat(Array.from(messages.values()));
        lastId = messages.last().id;

        if (messages.size < 100) break;
    }

    return allMessages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
};

const parseMessage = (message) => {
    const result = {
        content: null,
        attachments: [],
        timestamp: message.createdTimestamp,
        messageId: message.id
    };

    try {
        result.content = JSON.parse(message.content);
    } catch (e) {
        result.content = message.content || null;
    }

    if (message.attachments && message.attachments.size > 0) {
        message.attachments.forEach(attachment => {
            result.attachments.push({
                url: attachment.url,
                proxyURL: attachment.proxyURL,
                name: attachment.name,
                size: attachment.size,
                contentType: attachment.contentType,
                width: attachment.width,
                height: attachment.height
            });
        });
    }

    if (!result.content && result.attachments.length === 0) {
        return null;
    }

    return result;
};

export {
    fetchAllMessages,
    parseMessage
};
