import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, writeBatch, doc } from 'firebase/firestore';

// Firebase configuration (use environment variables in production)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample data
const sampleUsers = [
  {
    uid: 'partner-1',
    email: 'partner@auditfirm.mt',
    displayName: 'Maria Borg',
    role: 'AuditPartner',
    firm: 'Malta Audit Partners Ltd',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uid: 'manager-1',
    email: 'manager@auditfirm.mt',
    displayName: 'John Camilleri',
    role: 'EngagementManager',
    firm: 'Malta Audit Partners Ltd',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uid: 'senior-1',
    email: 'senior@auditfirm.mt',
    displayName: 'Sarah Mifsud',
    role: 'AuditSenior',
    firm: 'Malta Audit Partners Ltd',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const sampleEngagements = [
  {
    id: 'eng-1',
    name: 'ABC Manufacturing Ltd',
    clientId: 'client-1',
    yearEnd: new Date('2024-12-31'),
    partnerUid: 'partner-1',
    managerUid: 'manager-1',
    status: 'planning',
    materiality: 25000,
    riskAssessment: 'medium',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'eng-2',
    name: 'Malta Hotels Group',
    clientId: 'client-2',
    yearEnd: new Date('2024-12-31'),
    partnerUid: 'partner-1',
    managerUid: 'manager-1',
    status: 'fieldwork',
    materiality: 150000,
    riskAssessment: 'high',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-15'),
  },
  {
    id: 'eng-3',
    name: 'Mediterranean Shipping Co.',
    clientId: 'client-3',
    yearEnd: new Date('2024-12-31'),
    partnerUid: 'partner-1',
    managerUid: 'manager-1',
    status: 'review',
    materiality: 500000,
    riskAssessment: 'high',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-03-01'),
  },
];

const sampleTasks = [
  {
    engagementId: 'eng-1',
    phase: 'planning',
    title: 'Risk Assessment - Revenue Recognition',
    description: 'Perform risk assessment for revenue recognition in accordance with ISA 315',
    assigneeUid: 'senior-1',
    status: 'todo',
    priority: 'high',
    dueDate: new Date('2024-02-15'),
    procedureSteps: [
      'Review revenue recognition policy',
      'Identify key controls',
      'Assess risk of material misstatement',
    ],
    aiStatus: 'pending',
    attachments: [],
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    engagementId: 'eng-1',
    phase: 'planning',
    title: 'Materiality Calculation',
    description: 'Calculate performance materiality and clearly trivial threshold',
    assigneeUid: 'manager-1',
    status: 'in-progress',
    priority: 'medium',
    dueDate: new Date('2024-02-10'),
    procedureSteps: [
      'Obtain prior year financial statements',
      'Calculate overall materiality',
      'Determine performance materiality',
    ],
    aiStatus: 'completed',
    attachments: [],
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const sampleRisks = [
  {
    engagementId: 'eng-1',
    area: 'Revenue Recognition',
    description: 'Risk of material misstatement in revenue recognition due to complex contract terms',
    likelihood: 3,
    impact: 4,
    severity: 'medium',
    controls: ['Monthly revenue reconciliations', 'Contract review process'],
    mitigationPlan: 'Perform detailed substantive testing of revenue transactions',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    engagementId: 'eng-2',
    area: 'Inventory Valuation',
    description: 'Risk of inventory obsolescence in hospitality industry',
    likelihood: 4,
    impact: 4,
    severity: 'high',
    controls: ['Monthly inventory counts', 'Obsolescence review'],
    mitigationPlan: 'Detailed testing of inventory aging and valuation',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function seedData() {
  console.log('🌱 Starting data seeding...');

  try {
    const batch = writeBatch(db);

    // Seed users
    console.log('👤 Seeding users...');
    for (const user of sampleUsers) {
      const userRef = doc(db, 'users', user.uid);
      batch.set(userRef, user);
    }

    // Seed engagements
    console.log('📂 Seeding engagements...');
    for (const engagement of sampleEngagements) {
      const engagementRef = doc(db, 'engagements', engagement.id);
      batch.set(engagementRef, engagement);
    }

    // Commit the batch
    await batch.commit();

    // Seed tasks (using addDoc for auto-generated IDs)
    console.log('📋 Seeding tasks...');
    for (const task of sampleTasks) {
      await addDoc(collection(db, 'tasks'), task);
    }

    // Seed risks
    console.log('⚠️ Seeding risks...');
    for (const risk of sampleRisks) {
      await addDoc(collection(db, 'risks'), risk);
    }

    console.log('✅ Data seeding completed successfully!');
    console.log(`
    Sample data created:
    - ${sampleUsers.length} users
    - ${sampleEngagements.length} engagements  
    - ${sampleTasks.length} tasks
    - ${sampleRisks.length} risks
    
    You can now login with:
    - Email: partner@auditfirm.mt
    - Password: (set during first login)
    `);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seeding script
seedData();