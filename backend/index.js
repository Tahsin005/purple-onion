import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { login, bot } from './src/discord/client.js';
import blogRoutes from './src/routes/blogs.js';
import rssRoutes from './src/routes/rss.js';
import { getProjection } from './src/projections/state.js';

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

const PORT = 3001;

login().then(() => {
    app.listen(PORT, () => {
        console.log(`Backend is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to login to Discord:', err);
    process.exit(1);
});