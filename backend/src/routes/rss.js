import express from 'express';
import { Feed } from 'feed';
import { marked } from 'marked';
import { getProjection } from '../projections/state.js';

const router = express.Router();

const FEED_CONFIG = {
    title: 'Purple Onion',
    description: 'Peeling Back Software Engineering',
    id: 'https://purpleonion.vercel.app',
    link: 'https://purpleonion.vercel.app',
    language: 'en',
    favicon: 'https://purpleonion.vercel.app/purple-onion.png'
};

router.get('/rss.xml', async (req, res) => {
    try {
        const state = await getProjection();
        const posts = Object.values(state.blogPosts || {});
        
        const publishedPosts = posts
            .filter(post => post.published)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const feed = new Feed({
            title: FEED_CONFIG.title,
            description: FEED_CONFIG.description,
            id: FEED_CONFIG.id,
            link: FEED_CONFIG.link,
            language: FEED_CONFIG.language,
            image: FEED_CONFIG.favicon,
            favicon: FEED_CONFIG.favicon,
            copyright: `© ${new Date().getFullYear()} Purple Onion. All rights reserved.`,
            updated: new Date(),
            generator: 'Purple Onion RSS Generator',
            feedLinks: {
                rss2: `${FEED_CONFIG.link}/rss.xml`
            },
            author: {
                name: 'MD. Tahsin Ferdous',
                link: FEED_CONFIG.link
            }
        });

        publishedPosts.forEach(post => {
            const postUrl = `${FEED_CONFIG.link}/blog/${post.slug}`;
            
            feed.addItem({
                title: post.title,
                id: postUrl,
                link: postUrl,
                description: marked.parse(post.body || ''),
                author: [{ 
                    name: 'MD. Tahsin Ferdous',
                    link: FEED_CONFIG.link
                }],
                date: new Date(post.createdAt),
                image: post.images && post.images.length > 0 
                    ? post.images[0].proxyURL 
                    : undefined
            });
        });

        res.set('Content-Type', 'application/rss+xml');
        res.send(feed.rss2());
    } catch (error) {
        console.error('[RSS Feed] Error generating RSS feed:', error);
        res.status(500).json({ error: 'Failed to generate RSS feed' });
    }
});

export default router;
