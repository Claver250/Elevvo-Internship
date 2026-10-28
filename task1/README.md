# Task 1: Web Request Inspector & Raw HTTP Server

A local HTTP server built with only Node.js's built-in `http` module (no Express or other frameworks). It serves JSON from three routes, sets strict headers, and returns proper status codes for unknown routes and unsupported methods.

## What this task covers

- HTTP lifecycle and client-server architecture
- Status codes and JSON payloads
- Native Node.js routing

## Requirements

- Node.js 18 or later (tested on Node.js v24)

No dependencies, so there is nothing to `npm install`.

## Run it

```bash
node server.js
```

The server listens on port `3000` by default. To use another port:

```bash
# Git Bash / macOS / Linux
PORT=4000 node server.js

# PowerShell
$env:PORT=4000; node server.js

# cmd
set PORT=4000 && node server.js
```

You should see: `Server is running and listening on http://localhost:<port>`

## Endpoints

| Method | Path          | Status | Description                                  |
| ------ | ------------- | ------ | -------------------------------------------- |
| GET    | `/`           | 200    | Welcome message                              |
| GET    | `/api/users`  | 200    | List of mock users                           |
| GET    | `/api/health` | 200    | Server uptime, OS platform, ISO timestamp    |
| any    | unknown path  | 404    | JSON error                                   |
| non-GET| known path    | 405    | JSON error with an `Allow: GET` header       |

All responses use `Content-Type: application/json; charset=utf-8`.

### Example responses

`GET /`

```json
{ "message": "Welcome to Raw Node.js HTTP Server!", "status": "success" }
```

`GET /api/health`

```json
{
  "status": "ok",
  "uptime": 122,
  "platform": "win32",
  "timestamp": "2026-10-28T10:09:35.138Z"
}
```

`GET /nope` (404)

```json
{
  "error": "Not Found",
  "statusCode": 404,
  "message": "The requested route '/nope' does not exist."
}
```

`POST /api/users` (405)

```json
{
  "error": "Method Not Allowed",
  "statusCode": 405,
  "message": "POST is not supported on '/api/users'."
}
```

## Test it with cURL

Use `-i` to see the status line and headers.

```bash
curl -i localhost:4000/
curl -i "localhost:4000/api/users?page=1"
curl -i localhost:4000/api/health
curl -i localhost:4000/nope
curl -i -X POST localhost:4000/api/users
```

Screenshots of these runs are in the `screenshots/` folder.

## Inspecting requests

Before building the server, I inspected real traffic using the browser DevTools Network tab and Postman, looking at request methods, request and response headers, and status codes. This showed how a client and server exchange a request and response, and why headers like `Content-Type` matter: they tell the client how to interpret the body.

## Design decisions

- **`sendJson` helper:** one function sets the status, headers (`Content-Type`, `Content-Length`) and body, so no route can forget them.
- **Route table:** routes are stored as `path -> handler`, so adding a route is one line.
- **URL parsing:** the path is read from `new URL(req.url, ...)`, so query strings like `?page=1` don't break matching.
- **404 vs 405:** an unknown path returns 404, while a known path with the wrong method returns 405 and an `Allow` header, as the HTTP spec expects.
- **Error handling:** a `try/catch` returns a JSON 500 instead of leaving the request hanging.

## Possible improvements

- Request body parsing for POST/PUT routes
- A small router module and middleware pipeline
- Structured logging and graceful shutdown
- Automated tests using Node's built-in test runner

## Project structure

```
task-1-raw-http-server/
├── server.js
├── README.md
└── screenshots/
```