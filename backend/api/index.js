import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { login, bot } from '../src/discord/client.js';
import blogRoutes from '../src/routes/blogs.js';
import rssRoutes from '../src/routes/rss.js';
import { getProjection } from '../src/projections/state.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/state', async (req, res) => {
    try {
        const state = await getProjection();
        res.json(state);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to rebuild state' });
    }
});

app.use('/posts', blogRoutes);
app.use('/', rssRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Ensure Discord bot is logged in before handling requests
let botReady = false;

login().then(() => {
    botReady = true;
    console.log('Discord bot is ready');
}).catch(err => {
    console.error('Failed to login to Discord:', err);
});

// Middleware to check if bot is ready
app.use((req, res, next) => {
    if (!botReady && req.path !== '/health') {
        return res.status(503).json({ error: 'Service initializing, please try again' });
    }
    next();
});

export default app;
