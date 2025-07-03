# Autonomous Audit AI Agent - Malta

A production-ready, autonomous AI-powered audit platform for statutory auditing in Malta, compliant with ISA, ISQM 1, and Companies Act Cap 386.

## 🚀 Features

- **AI-Powered Auditing**: OpenAI GPT-4o integration with 128k context
- **Mobile-First PWA**: Offline-capable progressive web app
- **Malta Compliance**: Built for Malta statutory audit requirements
- **Real-time Collaboration**: Multi-user engagement management
- **Evidence Management**: Automated document analysis and extraction
- **Risk Assessment**: AI-driven risk identification and scoring
- **Quality Control**: ISQM 1 compliance monitoring

## 🏗️ Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend**: Firebase Auth & Firestore, Cloud Functions (TypeScript 5), Google Cloud Storage
- **AI**: OpenAI GPT-4o via Agents SDK (Vision, Function-Calling, File-Search, Web-Search)
- **Vector Database**: Pinecone (namespace = engagementId)
- **CI/CD**: GitHub → Cloud Build → dev / review / prod

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase CLI
- Git

## 🛠️ Setup

1. **Clone and Navigate**
   ```bash
   cd audit
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase, OpenAI, and Pinecone credentials
   ```

4. **Firebase Setup**
   ```bash
   firebase login
   firebase init
   # Select Firestore, Functions, Hosting, Storage
   ```

5. **Development Server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Firebase Setup

1. Create a new Firebase project
2. Enable Authentication (Email/Password + SAML)
3. Enable Firestore Database
4. Enable Cloud Storage
5. Enable Cloud Functions
6. Copy configuration to `.env`

### Firestore Security Rules

The platform uses row-level security based on user roles and engagement access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /engagements/{engagementId} {
      allow read, write: if request.auth != null && 
        hasEngagementAccess(resource.data, request.auth.uid);
    }
    // Additional rules in /firestore.rules
  }
}
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_*` | Firebase configuration |
| `VITE_OPENAI_API_KEY` | OpenAI API key for GPT-4o |
| `VITE_PINECONE_*` | Pinecone vector database config |

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### End-to-End Tests
```bash
npm run test:e2e
```

### Visual Regression Tests
```bash
npm run test:visual
```

## 📊 Data Seeding

```bash
npm run seed
```

This creates sample data including:
- Demo engagements
- Sample audit tasks
- Risk assessments
- Quality control templates

## 🚀 Deployment

### Development Environment
```bash
npm run deploy:dev
```

### Production Environment
```bash
npm run build
npm run deploy:prod
```

### Cloud Build Pipeline

The project uses automated deployment via Cloud Build:
- **dev**: Deploys on push to `develop` branch
- **review**: Deploys on pull request
- **prod**: Deploys on push to `main` branch

## 🔐 Security

- **Authentication**: Firebase Auth with SAML (Azure AD) integration
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Row-level security in Firestore
- **File Security**: Signed URLs with SHA-256 hashing
- **Audit Logging**: All actions logged to BigQuery for ISQM 1 compliance

## 📱 PWA Features

- **Offline Support**: Core functionality works offline
- **App-like Experience**: Installable on mobile and desktop
- **Push Notifications**: Task assignments and due dates
- **Background Sync**: Data synchronization when online

## 🎨 Design System

### Colors
- **Primary**: #002b5c (Navy)
- **Accent**: #d4af37 (Maltese Gold)
- **Typography**: Inter font, 1rem base, minimum 14px

### Components
- Rounded corners: 2xl
- Shadow: lg
- Animations: < 250ms
- Accessible color contrast ratios

## 📊 Performance Targets

- **Lighthouse PWA Score**: ≥ 90 on mobile
- **Load Time**: < 3 seconds on 3G
- **Bundle Size**: < 500KB gzipped
- **API Response**: < 200ms average

## 🏢 Compliance

### ISA (International Standards on Auditing)
- ISA 300: Planning an Audit
- ISA 315: Risk Assessment
- ISA 330: Audit Procedures
- ISA 500: Audit Evidence
- ISA 700: Audit Report

### ISQM 1 (International Standard on Quality Management)
- Quality objectives and risks
- Engagement performance monitoring
- Review and evaluation procedures

### Malta Companies Act Cap 386
- Statutory audit requirements
- Financial reporting standards
- Director responsibilities

## 📁 Project Structure

```
audit/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Main application pages
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and configurations
│   ├── services/      # API and Firebase services
│   ├── types/         # TypeScript type definitions
│   └── styles/        # Global styles and Tailwind
├── functions/         # Firebase Cloud Functions
├── public/           # Static assets
└── cypress/          # E2E tests
```

## 🤝 Development Workflow

1. **Feature Branch**: Create feature branch from `develop`
2. **Development**: Code with TypeScript strict mode
3. **Testing**: Add unit and E2E tests
4. **Review**: Create pull request to `develop`
5. **QA**: Test in development environment
6. **Release**: Merge to `main` for production

## 📈 Monitoring

- **Error Tracking**: Firebase Crashlytics
- **Performance**: Firebase Performance Monitoring
- **Analytics**: Firebase Analytics
- **Logs**: Cloud Logging with structured logging

## 🆘 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs`

## 📄 License

This project is proprietary software for audit firms in Malta. All rights reserved.

---

**Built with ❤️ for Malta's audit professionals**