
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Save, Eye, Calendar } from 'lucide-react';

interface LegalDocument {
  id: string;
  version: string;
  content: string;
  effective_date: string;
  active: boolean;
  created_at: string;
}

interface LegalDocumentEditorProps {
  document?: LegalDocument;
  type: 'terms' | 'privacy';
  onSave: (data: { version: string; content: string; effective_date: string }) => void;
  onCancel: () => void;
  loading?: boolean;
}

const LegalDocumentEditor: React.FC<LegalDocumentEditorProps> = ({
  document,
  type,
  onSave,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    version: document?.version || '',
    content: document?.content || getTemplateContent(type),
    effective_date: document?.effective_date || new Date().toISOString().split('T')[0]
  });

  const [preview, setPreview] = useState(false);

  function getTemplateContent(docType: 'terms' | 'privacy'): string {
    if (docType === 'terms') {
      return `ICUPA MALTA - TERMS AND CONDITIONS

1. ACCEPTANCE OF TERMS
By accessing and using the ICUPA Malta platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.

2. SERVICE DESCRIPTION
ICUPA Malta provides an AI-powered hospitality platform that connects guests with restaurants and bars in Malta, enabling digital ordering and payment processing.

3. USER ACCOUNTS AND RESPONSIBILITIES
- Users must provide accurate and complete information
- Users are responsible for maintaining the confidentiality of their account
- Users must comply with all applicable local, national, and international laws

4. ORDERING AND PAYMENTS
- All orders are subject to restaurant availability
- Prices are displayed in Euros and include applicable taxes
- Payment processing is handled through secure third-party providers
- Refunds are subject to individual restaurant policies

5. PRIVACY AND DATA PROTECTION
We process personal data in accordance with our Privacy Policy and applicable data protection laws, including GDPR.

6. INTELLECTUAL PROPERTY
All content, trademarks, and intellectual property on the platform remain the property of ICUPA Malta or respective third parties.

7. LIMITATION OF LIABILITY
ICUPA Malta's liability is limited to the maximum extent permitted by applicable law.

8. DISPUTE RESOLUTION
Any disputes will be resolved through the courts of Malta under Maltese law.

9. MODIFICATIONS
We reserve the right to modify these terms at any time. Users will be notified of significant changes.

10. CONTACT INFORMATION
For questions about these terms, contact us at legal@icupa.mt

Last Updated: [DATE]`;
    } else {
      return `ICUPA MALTA - PRIVACY POLICY

1. DATA CONTROLLER
ICUPA Malta (Company Registration: [NUMBER]) is the data controller responsible for your personal data.

2. DATA WE COLLECT
- Order Information: Items ordered, delivery details, payment information
- Technical Data: IP address, browser type, device information
- Usage Data: How you interact with our platform
- Communication Data: Messages sent through our AI chat system

3. HOW WE USE YOUR DATA
- Process and fulfill your orders
- Provide customer support
- Improve our AI services
- Comply with legal obligations
- Prevent fraud and ensure security

4. LEGAL BASIS FOR PROCESSING
- Contract Performance: Processing orders and payments
- Legitimate Interest: Service improvement and fraud prevention
- Legal Obligation: Tax records and compliance
- Consent: Marketing communications (where applicable)

5. DATA SHARING
We do not sell your personal data. We may share data with:
- Restaurant partners (order details only)
- Payment processors (payment information only)
- Legal authorities (when required by law)

6. YOUR RIGHTS UNDER GDPR
- Right to Access: Request a copy of your data
- Right to Rectification: Correct inaccurate data
- Right to Erasure: Request deletion of your data
- Right to Portability: Receive your data in a structured format
- Right to Restrict Processing: Limit how we use your data
- Right to Object: Object to certain types of processing

7. DATA RETENTION
- Order Data: 7 years for accounting purposes
- Session Data: Anonymized after 30 days
- AI Interaction Logs: Anonymized immediately after processing

8. DATA SECURITY
We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction.

9. INTERNATIONAL TRANSFERS
Your data is processed within the EU. Any transfers outside the EU are protected by appropriate safeguards.

10. COOKIES AND TRACKING
We use essential cookies for platform functionality. Analytics cookies require your consent.

11. CONTACT US
For privacy-related inquiries or to exercise your rights:
- Email: privacy@icupa.mt
- Address: [COMPANY ADDRESS]
- Data Protection Officer: dpo@icupa.mt

Last Updated: [DATE]`;
    }
  }

  const handleSave = () => {
    onSave({
      version: formData.version,
      content: formData.content,
      effective_date: new Date(formData.effective_date).toISOString()
    });
  };

  const wordCount = formData.content.split(/\s+/).length;
  const charCount = formData.content.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {document ? 'Edit' : 'Create'} {type === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                placeholder="e.g., 2.1, 2024.1"
              />
            </div>
            
            <div>
              <Label htmlFor="effective_date">Effective Date</Label>
              <Input
                id="effective_date"
                type="date"
                value={formData.effective_date}
                onChange={(e) => setFormData(prev => ({ ...prev, effective_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="content">Document Content</Label>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                {wordCount} words, {charCount} characters
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPreview(!preview)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {preview ? 'Edit' : 'Preview'}
              </Button>
            </div>
          </div>

          {preview ? (
            <Card>
              <CardContent className="p-6">
                <div className="prose max-w-none">
                  {formData.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter the legal document content..."
              rows={20}
              className="font-mono text-sm"
            />
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                Will be effective from: {new Date(formData.effective_date).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={loading || !formData.version || !formData.content}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Document'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegalDocumentEditor;
