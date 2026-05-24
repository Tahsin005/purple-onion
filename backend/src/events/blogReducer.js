import fetch from 'node-fetch';

const reduceBlogPosts = async (messages) => {
    const posts = {};

    for (const msg of messages) {
        if (!msg) continue;

        let content = msg.content || ''; 
        let metadata = {};

        if (typeof content === 'object' && content !== null) {
            metadata = content;
            content = metadata.content || metadata.body || '';
        }

        const textAttachment = (msg.attachments || []).find(att => {
            const contentType = att.contentType || '';
            const name = (att.name || '').toLowerCase();
            return contentType.startsWith('text/') ||
                name.endsWith('.txt') ||
                name.endsWith('.md') ||
                name.endsWith('.markdown');
        });

        if (textAttachment) {
            try {
                const response = await fetch(textAttachment.url);
                const fileContent = await response.text();

                content = fileContent;

                console.log(`[Blog] Loaded content from attachment: ${textAttachment.name} (${fileContent.length} chars)`);
            } catch (error) {
                console.error(`[Blog] Failed to fetch attachment ${textAttachment.name}:`, error);
            }
        }

        const imageAttachments = (msg.attachments || []).filter(a => a.contentType?.startsWith('image/'));
        if (!content && imageAttachments.length === 0) {
            continue;
        }

        const lines = content.split('\n');
        const title = metadata.title || lines[0] || 'Untitled Post';
        const body = metadata.body || lines.slice(1).join('\n').trim();

        const slug = metadata.slug || generateSlug(title, msg.messageId);

        const images = (msg.attachments || []).filter(att =>
            att.contentType && att.contentType.startsWith('image/')
        );

        posts[slug] = {
            slug,
            title: title.trim(),
            body,
            excerpt: metadata.excerpt || generateExcerpt(body),
            images,
            tags: metadata.tags || [],
            published: metadata.published !== false, // Default to published
            createdAt: new Date(msg.timestamp).toISOString(),
            messageId: msg.messageId,
            readingTime: calculateReadingTime(body)
        };
    }

    return posts;
};

const generateSlug = (title, messageId) => {
    const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-')      // Replace spaces with hyphens
        .replace(/-+/g, '-')       // Replace multiple hyphens with single
        .substring(0, 100);        // Limit length

    return slug || `post-${messageId}`;
};

const generateExcerpt = (body) => {
    if (!body) return '';

    const plainText = body
        .replace(/[#*`_~]/g, '')
        .trim();

    return plainText.length > 160
        ? plainText.substring(0, 160) + '...'
        : plainText;
};

const calculateReadingTime = (text) => {
    if (!text) return 1;
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

export { reduceBlogPosts };
