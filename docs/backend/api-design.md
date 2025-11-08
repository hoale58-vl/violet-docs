# API Design

Guidelines for designing clean and maintainable REST APIs.

## Best Practices Checklist

| # | Best Practice | Reference / Example |
|:-:|--------------|---------------------|
| ⬜ | **Use nouns for resource names, not verbs** | [Resource Naming](#resource-naming) - `/users` not `/getUsers` |
| ⬜ | **Use appropriate HTTP status codes** | [HTTP Status Codes](#http-status-codes) - 200, 201, 400, 404, 500 |
| ⬜ | **Include version in API URL or headers** | [Versioning](#versioning) - `/api/v1/users` |
| ⬜ | **Implement pagination for list endpoints** | [Pagination](#pagination) - `?page=1&limit=20` |
| ⬜ | **Use consistent error response format** | [Error Response Format](#error-response-format) - Include code, message, field |
| ⬜ | **Support filtering and sorting** | [Filtering and Sorting](#filtering-and-sorting) - `?status=active&sort=-createdAt` |
| ⬜ | **Implement rate limiting** | [Rate Limiting](#rate-limiting) - Return `X-RateLimit-*` headers |
| ⬜ | **Configure CORS properly** | [CORS Headers](#cors-headers) - Allow necessary origins and methods |
| ⬜ | **Document API with OpenAPI/Swagger** | [Documentation](#documentation) - Include examples and error codes |
| ⬜ | **Use 204 No Content for successful DELETE** | [HTTP Status Codes](#http-status-codes) - No response body needed |
| ⬜ | **Support field selection** | [Filtering and Sorting](#filtering-and-sorting) - `?fields=id,name,email` |
| ⬜ | **Use consistent date format (ISO 8601)** | `"2025-10-30T10:00:00Z"` |
| ⬜ | **Return pagination metadata** | [Pagination](#pagination) - Include total, totalPages, current page |
| ⬜ | **Use HTTPS in production** | Security requirement - Encrypt all API traffic |

---

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
