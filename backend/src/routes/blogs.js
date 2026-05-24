import express from 'express';
import { getProjection } from '../projections/state.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const state = await getProjection();
        const posts = Object.values(state.blogPosts || {});

        const publishedPosts = posts.filter(post => post.published);

        publishedPosts.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        res.json(publishedPosts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
});

router.get('/:slug', async (req, res) => {
    const { slug } = req.params;

    try {
        const state = await getProjection();
        const post = state.blogPosts?.[slug];

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (!post.published) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch blog post' });
    }
});

export default router;
