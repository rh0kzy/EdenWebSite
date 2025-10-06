# Contributing Guidelines

Thank you for your interest in contributing to Eden Parfum! This document provides guidelines and best practices for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## 🤝 Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. By participating, you agree to:

- Be respectful and inclusive
- Focus on constructive feedback
- Accept responsibility for mistakes
- Show empathy towards other contributors
- Help create a positive community

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Git configured
- Basic knowledge of JavaScript, HTML, CSS
- Familiarity with Express.js and Supabase (for backend contributions)

### Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/EdenWebSite.git
   cd eden-parfum
   ```
3. **Set up the development environment**:
   ```bash
   npm run install:all
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🔄 Development Workflow

### 1. Choose an Issue

- Check the [GitHub Issues](https://github.com/rh0kzy/EdenWebSite/issues) page
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to indicate you're working on it

### 2. Development Process

```bash
# Create and switch to feature branch
git checkout -b feature/add-search-functionality

# Make your changes
# ... code changes ...

# Run tests
npm test

# Commit your changes
git add .
git commit -m "feat: add advanced search functionality

- Add search by perfume notes
- Implement fuzzy matching
- Add search result highlighting"

# Push to your fork
git push origin feature/add-search-functionality
```

### 3. Create Pull Request

- Go to the original repository
- Click "New Pull Request"
- Select your feature branch
- Fill out the PR template
- Request review from maintainers

## 💻 Code Standards

### JavaScript/TypeScript

- Use ES6+ features
- Use `const` and `let` instead of `var`
- Use arrow functions when appropriate
- Use template literals for string interpolation
- Follow camelCase naming convention
- Use meaningful variable and function names

**Example:**
```javascript
// Good
const getPerfumeByReference = async (reference) => {
  const { data, error } = await supabase
    .from('perfumes')
    .select('*')
    .eq('reference', reference)
    .single();

  if (error) throw new Error(`Perfume not found: ${reference}`);
  return data;
};

// Avoid
function getperfumebyref(ref) {
  // ... code ...
}
```

### HTML

- Use semantic HTML5 elements
- Include alt text for images
- Use lowercase attribute names
- Close all tags properly
- Use meaningful IDs and classes

**Example:**
```html
<!-- Good -->
<article class="perfume-card">
  <img src="perfume.jpg" alt="Chanel No. 5 bottle" class="perfume-image">
  <h3 class="perfume-name">Chanel No. 5</h3>
  <p class="perfume-description">Iconic floral fragrance</p>
</article>

<!-- Avoid -->
<div class="card">
  <img src="perfume.jpg">
  <h3>Chanel No. 5</h3>
  <p>Description</p>
</div>
```

### CSS

- Use CSS custom properties (variables)
- Follow BEM naming convention
- Use flexbox/grid for layouts
- Include vendor prefixes when necessary
- Group related properties together

**Example:**
```css
/* Good */
.perfume-card {
  --card-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --card-radius: 8px;

  display: flex;
  flex-direction: column;
  background: white;
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
}

.perfume-card__image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: var(--card-radius) var(--card-radius) 0 0;
}

/* Avoid */
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}
```

### File Organization

- Group related files in directories
- Use consistent naming patterns
- Keep files small and focused
- Separate concerns (HTML, CSS, JS)

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run backend tests only
cd backend && npm test

# Run integration tests
cd tests && node test_api.js
```

### Writing Tests

- Write tests for new features
- Test both success and error cases
- Use descriptive test names
- Follow the existing test structure

**Example:**
```javascript
describe('Perfume API', () => {
  test('should return perfume by reference', async () => {
    const response = await request(app)
      .get('/api/perfumes/1105')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.reference).toBe('1105');
  });

  test('should return 404 for non-existent perfume', async () => {
    const response = await request(app)
      .get('/api/perfumes/9999')
      .expect(404);

    expect(response.body.success).toBe(false);
  });
});
```

### Test Coverage

- Aim for 80%+ code coverage
- Test critical user paths
- Include edge cases
- Test error handling

## 📚 Documentation

### Code Documentation

- Use JSDoc comments for functions
- Document complex logic
- Explain non-obvious decisions
- Keep comments up to date

**Example:**
```javascript
/**
 * Searches for perfumes by name, brand, or notes
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @param {number} options.limit - Maximum results (default: 20)
 * @param {string} options.brand - Filter by brand
 * @returns {Promise<Array>} Array of matching perfumes
 */
async function searchPerfumes(query, options = {}) {
  // Implementation...
}
```

### Project Documentation

- Update README.md for new features
- Add API documentation for new endpoints
- Update deployment guides
- Document breaking changes

## 🔄 Pull Request Process

### PR Template

When creating a pull request, include:

1. **Title**: Clear, descriptive title (e.g., "feat: add perfume search functionality")
2. **Description**: Detailed explanation of changes
3. **Related Issues**: Link to related GitHub issues
4. **Testing**: How to test the changes
5. **Screenshots**: For UI changes
6. **Breaking Changes**: If any

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests
2. **Code Review**: At least one maintainer reviews
3. **Feedback**: Address review comments
4. **Approval**: PR approved and merged
5. **Deployment**: Changes deployed to production

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Testing
- `chore`: Maintenance

**Examples:**
```
feat: add perfume search functionality
fix: resolve mobile navigation bug
docs: update API documentation
refactor: simplify perfume filtering logic
```

## 🐛 Issue Reporting

### Bug Reports

When reporting bugs, include:

- **Clear title** describing the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs actual behavior
- **Browser/OS** information
- **Screenshots** if applicable
- **Console errors** or logs

**Example:**
```
Title: Catalog page not loading on mobile devices

Description:
The perfume catalog page shows a blank screen on iPhone Safari.

Steps to reproduce:
1. Open https://edenparfum.netlify.app on iPhone Safari
2. Click on "Catalog" in navigation
3. Page appears blank

Expected: Catalog should display perfume grid
Actual: White screen with no content

Browser: Safari 17.0 on iOS 17.1
Console errors: None visible
```

### Feature Requests

For new features, include:

- **Clear description** of the feature
- **Use case** and benefits
- **Mockups or examples** if applicable
- **Technical considerations**

## 🎯 Contribution Areas

### Frontend Development
- UI/UX improvements
- Performance optimization
- Accessibility enhancements
- Mobile responsiveness

### Backend Development
- API endpoint creation
- Database optimization
- Security improvements
- Performance monitoring

### Database & Data
- Schema improvements
- Data migration scripts
- Seed data creation
- Query optimization

### Documentation
- API documentation
- User guides
- Code comments
- Deployment guides

### Testing
- Unit tests
- Integration tests
- E2E tests
- Performance tests

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Documentation**: Check `/docs` directory first
- **Code Examples**: Look at existing implementations

## 🙏 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in commit history
- Recognized in the community

Thank you for contributing to Eden Parfum! 🚀</content>
<parameter name="filePath">c:\Users\PC\Desktop\EdenWebSite\docs\CONTRIBUTING.md