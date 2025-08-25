# Security Policy

## Supported Versions

We take security seriously and support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in MealSnap, please help us maintain a secure environment for all users by following responsible disclosure practices.

### How to Report

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please:

1. Email security issues to: [your-security-email@domain.com]
2. Include "SECURITY" in the subject line
3. Provide a clear description of the vulnerability
4. Include steps to reproduce the issue
5. Attach any supporting materials (screenshots, logs, etc.)

### What to Include

Please provide as much information as possible:

- **Description**: A clear description of the vulnerability
- **Impact**: What could an attacker accomplish?
- **Reproduction**: Step-by-step instructions to reproduce
- **Environment**: Operating system, browser, version, etc.
- **Supporting Evidence**: Screenshots, logs, or proof of concept

### Response Timeline

- **Initial Response**: Within 48 hours of receipt
- **Status Update**: Within 7 days with our assessment
- **Resolution**: We aim to resolve critical issues within 30 days

### Security Measures

MealSnap implements several security measures:

#### Authentication & Authorization
- JWT-based authentication via Supabase Auth
- Row Level Security (RLS) on all database tables
- Mandatory authentication on all user data endpoints
- User session management and automatic logout

#### Data Protection
- All API endpoints validate user authorization
- Input validation and sanitization on all endpoints
- SQL injection protection via Supabase's built-in protections
- No sensitive data in client-side code or logs

#### Infrastructure Security
- HTTPS enforcement in production
- Environment variable management for secrets
- Database access restricted to service accounts
- Cross-Origin Resource Sharing (CORS) configuration

#### Privacy
- Minimal data collection policy
- User data isolated via database-level RLS
- Secure image storage with access controls
- No third-party tracking scripts

### Scope

This security policy applies to:

- The main MealSnap application
- API endpoints under `/server/api/`
- Database schemas and access patterns
- Authentication and authorization flows

### Out of Scope

The following are considered out of scope:

- Third-party dependencies (report to upstream maintainers)
- Social engineering attacks
- Physical access to user devices
- Attacks requiring physical access to servers

### Security Best Practices for Contributors

If you're contributing to MealSnap:

1. **Never commit secrets**: Use environment variables for API keys, database credentials, etc.
2. **Validate all inputs**: Always validate and sanitize user inputs
3. **Follow authentication patterns**: Use existing auth utilities and patterns
4. **Test security measures**: Include security considerations in testing
5. **Keep dependencies updated**: Regularly update npm packages for security fixes

### Security Checklist for Pull Requests

Before submitting code changes:

- [ ] No hardcoded secrets or credentials
- [ ] Input validation implemented where needed
- [ ] Authentication/authorization properly enforced
- [ ] No sensitive data exposed in logs or errors
- [ ] Dependencies are up to date
- [ ] Error messages don't leak sensitive information

### Hall of Fame

We maintain a hall of fame for security researchers who responsibly disclose vulnerabilities:

- *Your name could be here!*

---

Thank you for helping keep MealSnap secure for everyone!