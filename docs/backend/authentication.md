# Authentication & Authorization

Complete guide to implementing secure authentication and authorization in modern applications.

## Best Practices Checklist

| # | Best Practice | Reference / Details |
|:-:|--------------|---------------------|
| ⬜ | **Use HTTPS/TLS for all authentication endpoints** | Encrypt credentials in transit |
| ⬜ | **Never store passwords in plain text** | [Password Hashing](#password-hashing) - Use bcrypt, Argon2, or scrypt |
| ⬜ | **Implement rate limiting on auth endpoints** | [Security](#rate-limiting) - Prevent brute force attacks |
| ⬜ | **Validate and sanitize all inputs** | Prevent injection attacks |
| ⬜ | **Implement Multi-Factor Authentication (MFA)** | [MFA](#multi-factor-authentication-mfa) - Add second factor |
| ⬜ | **Use role-based access control (RBAC)** | [RBAC](#role-based-access-control-rbac) - Organize permissions |
| ⬜ | **Log authentication attempts** | Monitor for suspicious activity |
| ⬜ | **Validate tokens on every request** | Don't trust client-side validation |
| ⬜ | **Implement proper password policies** | [Password Policies](#password-policies) - Length, complexity, expiration |
| ⬜ | **Use separate access and refresh tokens** | [Token Types](#access-vs-refresh-tokens) - Different lifespans |
| ⬜ | **Store tokens securely** | Never in localStorage for sensitive apps |
| ⬜ | **Implement CORS properly** | Restrict origins for API access |
| ⬜ | **Audit and review permissions regularly** | Remove unused access |

---

## Authentication vs Authorization

```mermaid
flowchart LR
    User[User] -->|Credentials| Auth[Authentication<br/>Who are you?]
    Auth -->|Verified Identity| Authz[Authorization<br/>What can you do?]
    Authz -->|Permissions| Resource[Access Resource]

    style Auth fill:#e1f5ff,stroke:#0288d1,stroke-width:3px
    style Authz fill:#e8f5e9,stroke:#388e3c,stroke-width:3px
    style Resource fill:#fff4e1,stroke:#f57c00,stroke-width:2px
```

| Concept | Question | Example |
|---------|----------|---------|
| **Authentication** | Who are you? | Login with email/password, verify identity |
| **Authorization** | What can you do? | Admin can delete users, regular users cannot |

---

## Authentication Methods

### 1. Session-Based Authentication

**How it works:**

1. User submits credentials
2. Server validates and creates session
3. Session ID stored in cookie
4. Client sends cookie with each request

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant SessionStore

    Client->>Server: POST /login (credentials)
    Server->>Server: Validate credentials
    Server->>SessionStore: Create session
    SessionStore-->>Server: Session ID
    Server->>Client: Set-Cookie: sessionId=xyz
    Client->>Server: GET /api/profile (Cookie: sessionId=xyz)
    Server->>SessionStore: Validate session
    SessionStore-->>Server: Session data
    Server->>Client: Profile data
```

**Implementation:**

```javascript
// Express.js with express-session
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,      // HTTPS only
    httpOnly: true,    // Not accessible via JavaScript
    sameSite: 'strict', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000  // 24 hours
  }
}));

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.session.userId = user.id;
  res.json({ message: 'Logged in successfully' });
});

// Protected route
app.get('/profile', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ userId: req.session.userId });
});
```

**Pros:**

- ✅ Server controls sessions (can invalidate)
- ✅ Less data sent with each request
- ✅ Works well with server-side rendering

**Cons:**

- ❌ Not scalable (requires shared session store)
- ❌ CSRF attacks if not protected
- ❌ Doesn't work well with mobile apps

---

### 2. JWT (JSON Web Tokens)

**How it works:**

1. User submits credentials
2. Server validates and creates JWT
3. Client stores JWT (localStorage, sessionStorage, memory)
4. Client sends JWT in Authorization header

```mermaid
sequenceDiagram
    participant Client
    participant Server

    Client->>Server: POST /login (credentials)
    Server->>Server: Validate credentials
    Server->>Server: Generate JWT
    Server->>Client: { token: "eyJhbGc..." }
    Client->>Client: Store token
    Client->>Server: GET /api/profile<br/>Authorization: Bearer eyJhbGc...
    Server->>Server: Verify JWT signature
    Server->>Client: Profile data
```

**JWT Structure:**

```
Header.Payload.Signature
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

Header:  { "alg": "HS256", "typ": "JWT" }
Payload: { "sub": "1234567890", "name": "John Doe", "iat": 1516239022, "exp": 1516242622 }
Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

**Implementation:**

```javascript
const jwt = require('jsonwebtoken');

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token, refreshToken });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Protected route
app.get('/profile', authenticateToken, (req, res) => {
  res.json({ userId: req.user.userId, email: req.user.email });
});
```

**Pros:**

- ✅ Stateless (no server-side storage)
- ✅ Works well with microservices
- ✅ Good for mobile apps and SPAs
- ✅ Can include claims (roles, permissions)

**Cons:**

- ❌ Cannot revoke tokens (until expiration)
- ❌ Larger payload than session ID
- ❌ XSS vulnerable if stored in localStorage

---

### 3. OAuth 2.0

**Use cases:**

- Third-party login (Login with Google, GitHub, Facebook)
- API access delegation
- Single Sign-On (SSO)

**Flow Types:**

| Flow | Use Case | Security |
|------|----------|----------|
| **Authorization Code** | Web apps (server-side) | ⭐⭐⭐ Most secure |
| **Authorization Code + PKCE** | Mobile apps, SPAs | ⭐⭐⭐ Secure |
| **Implicit** | ⚠️ Deprecated | ⭐ Less secure |
| **Client Credentials** | Machine-to-machine | ⭐⭐ Secure |
| **Resource Owner Password** | Trusted first-party apps | ⭐⭐ Use sparingly |

**Authorization Code Flow:**

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant AuthServer
    participant ResourceServer

    User->>Client: Click "Login with Google"
    Client->>AuthServer: Redirect to /authorize
    AuthServer->>User: Show login page
    User->>AuthServer: Enter credentials
    AuthServer->>Client: Redirect with authorization code
    Client->>AuthServer: Exchange code for token
    AuthServer->>Client: Access token + Refresh token
    Client->>ResourceServer: Request with access token
    ResourceServer->>Client: Protected resource
```

**Implementation (Express.js with Passport.js):**

```javascript
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    // Find or create user
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName
      });
    }
    return done(null, user);
  }
));

// Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);
```

---

### 4. API Keys

**Use cases:**

- Public APIs
- Machine-to-machine authentication
- Simple service authentication

**Implementation:**

```javascript
// Generate API key
const crypto = require('crypto');
const apiKey = crypto.randomBytes(32).toString('hex');

// Store hashed version
const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
await ApiKey.create({ key: hashedKey, userId: user.id });

// Middleware
const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
  const keyRecord = await ApiKey.findOne({ key: hashedKey });

  if (!keyRecord) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  req.userId = keyRecord.userId;
  next();
};
```

**Pros:**

- ✅ Simple to implement
- ✅ Good for internal services
- ✅ Easy to rotate

**Cons:**

- ❌ Less secure than OAuth
- ❌ No fine-grained permissions
- ❌ Hard to manage at scale

---

## Authorization Methods

### Role-Based Access Control (RBAC)

Users assigned to roles, roles have permissions.

```javascript
// Define roles and permissions
const roles = {
  admin: ['user:read', 'user:write', 'user:delete', 'post:read', 'post:write', 'post:delete'],
  editor: ['post:read', 'post:write', 'user:read'],
  user: ['post:read', 'user:read:own']
};

// Authorization middleware
const authorize = (...permissions) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const userPermissions = roles[userRole] || [];

    const hasPermission = permissions.every(p => userPermissions.includes(p));

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Usage
app.delete('/users/:id', authenticateToken, authorize('user:delete'), (req, res) => {
  // Delete user
});
```

---

### Attribute-Based Access Control (ABAC)

Permissions based on attributes (user, resource, environment).

```javascript
const canAccess = (user, resource, action) => {
  // Owner can edit their own posts
  if (action === 'edit' && resource.authorId === user.id) {
    return true;
  }

  // Admin can edit any post
  if (user.role === 'admin') {
    return true;
  }

  // Published posts are readable by anyone
  if (action === 'read' && resource.status === 'published') {
    return true;
  }

  return false;
};

// Usage
app.put('/posts/:id', authenticateToken, async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!canAccess(req.user, post, 'edit')) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Update post
});
```

---

## Third-Party Services

### Identity Providers (IDPs)

| Service | Best For | Pricing | Features |
|---------|----------|---------|----------|
| **Auth0** | Enterprise, startups | Free tier, then $23/month | Social login, MFA, SSO, customizable |
| **Firebase Auth** | Mobile apps, quick setup | Free tier, pay-as-you-go | Google integration, anonymous auth |
| **AWS Cognito** | AWS ecosystem | Free tier (50k MAU), then $0.0055/MAU | User pools, identity pools, federation |
| **Okta** | Enterprise SSO | Contact sales | SAML, OIDC, MFA, enterprise features |
| **Supabase Auth** | Open-source alternative | Free tier, $25/month pro | Row-level security, magic links |
| **Clerk** | Modern web apps | Free tier, $25/month | Pre-built UI, webhooks, organizations |
| **Azure AD B2C** | Microsoft ecosystem | Pay-as-you-go | Social login, custom policies |

**Recommendation:** Auth0 for most use cases, Firebase Auth for mobile, AWS Cognito for AWS-heavy

---

### Social Login Providers

| Provider | OAuth Version | Use Case |
|----------|---------------|----------|
| **Google** | OAuth 2.0 | Widest adoption |
| **GitHub** | OAuth 2.0 | Developer tools |
| **Facebook** | OAuth 2.0 | Social apps |
| **Apple** | OAuth 2.0 | iOS apps (required) |
| **Microsoft** | OAuth 2.0 | Enterprise apps |
| **Twitter** | OAuth 1.0a / 2.0 | Social media integration |

---

## Password Security

### Password Hashing

```javascript
const bcrypt = require('bcrypt');
const argon2 = require('argon2');

// bcrypt (recommended, widely supported)
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Argon2 (most secure, winner of Password Hashing Competition)
const hashPasswordArgon2 = async (password) => {
  return await argon2.hash(password);
};

const verifyPasswordArgon2 = async (password, hash) => {
  return await argon2.verify(hash, password);
};
```

| Algorithm | Security | Speed | Recommendation |
|-----------|----------|-------|----------------|
| **Argon2** | ⭐⭐⭐⭐⭐ | Medium | Best choice |
| **bcrypt** | ⭐⭐⭐⭐ | Slow | Industry standard |
| **scrypt** | ⭐⭐⭐⭐ | Slow | Good alternative |
| **PBKDF2** | ⭐⭐⭐ | Fast | Minimum acceptable |
| **SHA-256** | ⭐ | Very fast | ❌ Never use alone |
| **MD5** | ❌ | Very fast | ❌ Never use |

---

### Password Policies

```javascript
const validatePassword = (password) => {
  const errors = [];

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain number');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain special character');
  }

  // Check against common passwords
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common');
  }

  return errors;
};
```

---

## Multi-Factor Authentication (MFA)

### Time-based One-Time Password (TOTP)

```javascript
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Generate secret
app.post('/mfa/setup', authenticateToken, async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: `MyApp (${req.user.email})`,
    issuer: 'MyApp'
  });

  // Save secret to user
  await User.updateOne(
    { _id: req.user.userId },
    { mfaSecret: secret.base32 }
  );

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  res.json({ secret: secret.base32, qrCode: qrCodeUrl });
});

// Verify TOTP
app.post('/mfa/verify', authenticateToken, async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user.userId);

  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: 'base32',
    token: token,
    window: 2  // Allow 2 time steps (±60 seconds)
  });

  if (!verified) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  res.json({ message: 'MFA verified' });
});
```

### SMS/Email OTP

```javascript
const crypto = require('crypto');

// Generate and send OTP
app.post('/mfa/send-otp', authenticateToken, async (req, res) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await User.updateOne(
    { _id: req.user.userId },
    { otp: await bcrypt.hash(otp, 10), otpExpiresAt: expiresAt }
  );

  // Send OTP via SMS or email
  await sendSMS(user.phone, `Your OTP is: ${otp}`);

  res.json({ message: 'OTP sent' });
});

// Verify OTP
app.post('/mfa/verify-otp', authenticateToken, async (req, res) => {
  const { otp } = req.body;
  const user = await User.findById(req.user.userId);

  if (new Date() > user.otpExpiresAt) {
    return res.status(401).json({ error: 'OTP expired' });
  }

  const valid = await bcrypt.compare(otp, user.otp);

  if (!valid) {
    return res.status(401).json({ error: 'Invalid OTP' });
  }

  res.json({ message: 'OTP verified' });
});
```

---

## Token Management

### Access vs Refresh Tokens

| Token Type | Lifespan | Storage | Purpose |
|------------|----------|---------|---------|
| **Access Token** | 15-60 minutes | Memory, sessionStorage | API access |
| **Refresh Token** | 7-90 days | HttpOnly cookie, secure storage | Get new access tokens |

### Refresh Token Flow

```mermaid
sequenceDiagram
    participant Client
    participant Server

    Client->>Server: Login (credentials)
    Server->>Client: Access token (15min) + Refresh token (7d)
    Client->>Server: API call with access token
    Server->>Client: Success
    Note over Client: Access token expires
    Client->>Server: Refresh token request
    Server->>Server: Validate refresh token
    Server->>Client: New access token + New refresh token
    Client->>Server: API call with new access token
    Server->>Client: Success
```

**Implementation:**

```javascript
// Refresh token endpoint
app.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Check if refresh token is in database (for rotation)
    const storedToken = await RefreshToken.findOne({
      userId: payload.userId,
      token: refreshToken
    });

    if (!storedToken) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Generate new tokens
    const newAccessToken = jwt.sign(
      { userId: payload.userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { userId: payload.userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Store new refresh token, invalidate old one
    await RefreshToken.deleteOne({ token: refreshToken });
    await RefreshToken.create({ userId: payload.userId, token: newRefreshToken });

    res.json({ token: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});
```

---

## Security Best Practices

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,  // 5 requests per window
  message: 'Too many login attempts, please try again later'
});

app.post('/login', authLimiter, async (req, res) => {
  // Login logic
});
```

## Tags

`authentication`, `authorization`, `security`, `oauth`, `jwt`, `sessions`, `passwords`, `mfa`

---

*Last updated: 2025-11-02*
