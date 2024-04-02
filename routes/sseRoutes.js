import { Router } from "express";

const sseRoutes = Router();
const sseConnections = new Set();

sseRoutes.get('/', async (req, res) => {
    console.log(`WE HAVE HIT THE SSE ROUTES`);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseConnections.add(res);

    req.on('close', () => {
        sseConnections.delete(res);
    });
});

function sendSSEUpdate(data) {
    for (const connection of sseConnections) {
        connection.write(`data: ${JSON.stringify(data)}\n\n`);
    }
}

export default sseRoutes;
export { sendSSEUpdate };
