# Eden Parfum - Premium Fragrance E-commerce Platform

A modern, full-stack e-commerce platform for premium perfumes built with Node.js, Express, Firebase Firestore, and vanilla JavaScript.

## 🏗️ Project Structure

```
eden-parfum/
├── backend/                 # Express.js API server
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── routes/            # API route definitions
│   ├── utils/             # Utility functions
│   ├── tests/             # Backend tests
│   └── logs/              # Application logs
├── frontend/               # Static website files
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript modules
│   ├── photos/            # Product images
│   └── tests/             # Frontend tests
├── database/               # Database migrations & schemas
├── config/                 # Deployment configurations
├── docs/                   # Documentation & reports
├── scripts/                # Build & deployment scripts
├── tests/                  # Integration tests
└── package.json           # Root dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Google Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rh0kzy/EdenWebSite.git
   cd eden-parfum
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Firebase Setup**
   ```bash
   # Create a Firebase project at https://console.firebase.google.com/
   # Generate a service account key and download the JSON file
   # Update backend/.env with your Firebase credentials
   ```

4. **Database Migration (if migrating from Supabase)**
   ```bash
   cd backend
   # Run migration script to transfer data from Supabase to Firebase
   node migrate-to-firebase.js
   ```

### Development

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

2. **Serve frontend (for development)**
   ```bash
   cd frontend
   npx serve . -p 3000
   ```

3. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📁 Directory Details

### Backend (`/backend`)
- **Express.js API server** with modular architecture
- **Firebase Firestore integration** for database operations
- **Comprehensive logging** and error handling
- **Health monitoring** and performance tracking

### Frontend (`/frontend`)
- **Responsive design** with modern CSS
- **Modular JavaScript** with ES6 modules
- **Image optimization** and lazy loading
- **Offline support** with service workers

### Database (`/database`)
- **Firebase Firestore collections** for brands and perfumes
- **Migration scripts** for data updates
- **Seed data** for development

### Configuration (`/config`)
- **Netlify deployment** configurations
- **Environment templates**
- **Build settings**

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests
cd backend && npm test

# Run integration tests
cd tests && node test_api.js
```

## 🚀 Deployment

### Netlify (Frontend)
```bash
# Deploy to Netlify
npm run deploy:netlify
```

### Railway/Render (Backend)
```bash
# Deploy backend to Railway
npm run deploy:backend
```

## 📚 Documentation

- [Project Structure](./docs/PROJECT_STRUCTURE.md) - Complete project organization guide
- [Development Setup](./docs/DEVELOPMENT_SETUP.md) - Step-by-step setup instructions
- [API Documentation](./docs/API.md) - Complete API reference
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment instructions
- [Contributing Guidelines](./docs/CONTRIBUTING.md) - How to contribute to the project

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js, Supabase
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: PostgreSQL (via Supabase)
- **Deployment**: Netlify, Railway/Render
- **Testing**: Jest, Supertest
- **Monitoring**: Winston logging, health checks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@edenparfum.com or join our Discord community.

---

**Built with ❤️ for fragrance enthusiasts worldwide**</content>
<parameter name="filePath">c:\Users\PC\Desktop\EdenWebSite\README.md