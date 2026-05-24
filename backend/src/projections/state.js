import { fetchAllMessages, parseMessage } from '../discord/fetchMessages.js';
import { reduceBlogPosts } from '../events/blogReducer.js';

const getProjection = async () => {
    console.log('[Projection] Rebuilding state...');

    // fetch blog posts from BLOG channel
    const blogMessages = await fetchAllMessages(process.env.BLOG)
        .then(msgs => msgs.map(parseMessage).filter(Boolean));

    const state = {
        blogPosts: await reduceBlogPosts(blogMessages),
        lastUpdated: new Date().toISOString()
    };

    console.log('[Projection] State rebuilt successfully.');
    return state;
};

export { getProjection };
