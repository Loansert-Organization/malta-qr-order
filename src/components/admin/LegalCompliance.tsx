
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Shield, Scale, CheckCircle } from 'lucide-react';

interface LegalDocument {
  id: string;
  version: string;
  content: string;
  effective_date: string;
  active: boolean;
  created_at: string;
}

interface LegalComplianceProps {
  termsConditions: LegalDocument[];
  privacyPolicies: LegalDocument[];
  onCreateDocument: (data: { type: 'terms' | 'privacy'; version: string; content: string }) => void;
  onActivateDocument: (id: string, type: 'terms' | 'privacy') => void;
  loading: boolean;
}

const LegalCompliance: React.FC<LegalComplianceProps> = ({
  termsConditions,
  privacyPolicies,
  onCreateDocument,
  onActivateDocument,
  loading
}) => {
  const [newDocument, setNewDocument] = useState({
    type: 'terms' as 'terms' | 'privacy',
    version: '',
    content: ''
  });

  const handleCreateDocument = () => {
    if (!newDocument.version || !newDocument.content) return;
    onCreateDocument(newDocument);
    setNewDocument({ type: 'terms', version: '', content: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Legal & Compliance Management
        </h2>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Create New Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Legal Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="doc-type">Document Type</Label>
                <Select
                  value={newDocument.type}
                  onValueChange={(value) => 
                    setNewDocument(prev => ({ ...prev, type: value as 'terms' | 'privacy' }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="terms">Terms & Conditions</SelectItem>
                    <SelectItem value="privacy">Privacy Policy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="doc-version">Version</Label>
                <Input
                  id="doc-version"
                  value={newDocument.version}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="e.g., 2.0, 2024.1"
                />
              </div>

              <div>
                <Label htmlFor="doc-content">Content</Label>
                <Textarea
                  id="doc-content"
                  value={newDocument.content}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter the legal document content..."
                  rows={10}
                />
              </div>

              <Button 
                onClick={handleCreateDocument} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Creating...' : 'Create Document'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Terms & Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Terms & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {termsConditions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No terms created yet</p>
              ) : (
                termsConditions.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Version {doc.version}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(doc.effective_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={doc.active ? "default" : "secondary"}>
                        {doc.active ? "Active" : "Draft"}
                      </Badge>
                      {!doc.active && (
                        <Button
                          size="sm"
                          onClick={() => onActivateDocument(doc.id, 'terms')}
                        >
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Privacy Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {privacyPolicies.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No policies created yet</p>
              ) : (
                privacyPolicies.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Version {doc.version}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(doc.effective_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={doc.active ? "default" : "secondary"}>
                        {doc.active ? "Active" : "Draft"}
                      </Badge>
                      {!doc.active && (
                        <Button
                          size="sm"
                          onClick={() => onActivateDocument(doc.id, 'privacy')}
                        >
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GDPR Compliance Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            GDPR Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Cookie Consent Implemented</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Data Processing Logging</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Right to Deletion</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Data Portability</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Privacy by Design</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Anonymous Processing</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegalCompliance;
