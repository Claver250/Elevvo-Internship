const http = require('http');
const os = require('os');

const PORT = process.env.PORT || 4000;

const mockUsers = [
    { id: 1, name: 'Alex Johnson', role: 'Developer' },
    { id: 2, name: 'Samantha Lee', role: 'Designer' },
    { id: 3, name: 'Michael Alav', role: 'DevOps' },
];

// One place that sets headers + status + body, so no route can forget them
function sendJson(res, status, data, extraHeaders = {}) {
    const body = JSON.stringify(data);
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
        ...extraHeaders,
    });
    res.end(body);
}

// Route table: path -> function that returns the payload for GET
const routes = {
    '/': () => ({
        message: 'Welcome to Raw Node.js HTTP Server!',
        status: 'success',
    }),
    '/api/users': () => mockUsers,
    '/api/health': () => ({
        status: 'ok',
        uptime: Math.round(process.uptime()),
        platform: os.platform(),
        timestamp: new Date().toISOString(),
    }),
};

const server = http.createServer((req, res) => {
    try {
        // Strips the query string, so /api/users?page=1 still matches
        const { pathname } = new URL(req.url, 'http://localhost');
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

        const handler = routes[pathname];

        if (!handler) {
        return sendJson(res, 404, {
            error: 'Not Found',
            statusCode: 404,
            message: `The requested route '${pathname}' does not exist.`,
        });
        }

        if (req.method !== 'GET') {
        return sendJson(
            res,
            405,
            {
            error: 'Method Not Allowed',
            statusCode: 405,
            message: `${req.method} is not supported on '${pathname}'.`,
            },
            { Allow: 'GET' }
        );
        }

        sendJson(res, 200, handler());
    } catch (err) {
        console.error(err);
        sendJson(res, 500, { error: 'Internal Server Error', statusCode: 500 });
    }
});

server.listen(PORT, () => {
    console.log(`Server is running and listening on http://localhost:${PORT}`);
});