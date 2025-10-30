# RESTful API Design Best Practices

Guidelines for designing clean and maintainable REST APIs.

## Resource Naming

Use nouns, not verbs:

```
✅ Good
GET    /users
GET    /users/123
POST   /users
PUT    /users/123
DELETE /users/123

❌ Bad
GET    /getUsers
POST   /createUser
PUT    /updateUser/123
```

## HTTP Status Codes

Use appropriate status codes:

| Code | Meaning | Use Case |
|------|---------|----------|
| 200  | OK | Successful GET, PUT, PATCH |
| 201  | Created | Successful POST |
| 204  | No Content | Successful DELETE |
| 400  | Bad Request | Invalid request data |
| 401  | Unauthorized | Missing/invalid auth |
| 403  | Forbidden | Valid auth but no permission |
| 404  | Not Found | Resource doesn't exist |
| 500  | Internal Server Error | Server error |

## Request/Response Examples

### Create User
```http
POST /api/v1/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

Response:
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "123",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2025-10-30T10:00:00Z"
}
```

### Pagination

```http
GET /api/v1/users?page=1&limit=20
```

Response:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_EMAIL",
    "message": "The email address is invalid",
    "field": "email"
  }
}
```

## Versioning

Include version in URL:
```
/api/v1/users
/api/v2/users
```

Or in headers:
```http
Accept: application/vnd.myapi.v1+json
```

## Filtering and Sorting

```
GET /api/v1/users?status=active&sort=-createdAt&fields=id,name,email
```

- `status=active` - Filter by status
- `sort=-createdAt` - Sort by createdAt descending (- prefix)
- `fields=id,name,email` - Return only specified fields

## Authentication

Use Bearer tokens in Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Rate Limiting

Include rate limit info in headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1635724800
```

## CORS Headers

```javascript
// Express.js example
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
```

## Documentation

Always document your API:
- Use OpenAPI/Swagger
- Include request/response examples
- Document error codes
- Provide authentication details

## Tags

`api`, `rest`, `backend`, `design`, `best-practices`

---

*Last updated: 2025-10-30*
