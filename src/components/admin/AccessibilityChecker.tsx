import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, XCircle, Zap, Eye, Keyboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccessibilityIssue {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  help: string;
  helpUrl: string;
  nodes: number;
}

const AccessibilityChecker = () => {
  const { toast } = useToast();
  const [checking, setChecking] = useState(false);
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const runAccessibilityCheck = async () => {
    setChecking(true);
    
    try {
      // In a real implementation, we would use axe-core
      // For demo purposes, we'll simulate the check
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulated results
      const mockIssues: AccessibilityIssue[] = [
        {
          id: 'color-contrast',
          impact: 'serious',
          description: 'Elements must have sufficient color contrast',
          help: 'Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast',
          nodes: 3
        },
        {
          id: 'aria-label',
          impact: 'moderate',
          description: 'Buttons must have discernible text',
          help: 'Ensures buttons have discernible text',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/button-name',
          nodes: 2
        },
        {
          id: 'landmark-navigation',
          impact: 'moderate',
          description: 'Page should have a navigation landmark',
          help: 'Ensures the page has a navigation landmark to help screen reader users navigate',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/landmark-navigation',
          nodes: 1
        }
      ];

      setIssues(mockIssues);
      setLastChecked(new Date());
      
      toast({
        title: "Accessibility Check Complete",
        description: `Found ${mockIssues.length} issues to review`,
      });
    } catch (error) {
      console.error('Error running accessibility check:', error);
      toast({
        title: "Error",
        description: "Failed to run accessibility check",
        variant: "destructive"
      });
    } finally {
      setChecking(false);
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'serious':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'moderate':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'minor':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getImpactBadge = (impact: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800',
      serious: 'bg-orange-100 text-orange-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      minor: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <Badge className={colors[impact]}>
        {impact.charAt(0).toUpperCase() + impact.slice(1)}
      </Badge>
    );
  };

  const getAccessibilityTips = () => [
    {
      icon: <Keyboard className="h-5 w-5 text-blue-600" />,
      title: "Keyboard Navigation",
      description: "Ensure all interactive elements are reachable via keyboard"
    },
    {
      icon: <Eye className="h-5 w-5 text-green-600" />,
      title: "Color Contrast",
      description: "Maintain WCAG 2.1 AA contrast ratios (4.5:1 for normal text)"
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-purple-600" />,
      title: "ARIA Labels",
      description: "Add descriptive labels to all interactive elements"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Accessibility Check Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Accessibility Checker</CardTitle>
            <Button
              onClick={runAccessibilityCheck}
              disabled={checking}
            >
              {checking ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-pulse" />
                  Checking...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Run Check
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lastChecked && (
            <p className="text-sm text-gray-600 mb-4">
              Last checked: {lastChecked.toLocaleString()}
            </p>
          )}

          {issues.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {issues.filter(i => i.impact === 'critical').length}
                  </div>
                  <p className="text-sm text-gray-600">Critical</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {issues.filter(i => i.impact === 'serious').length}
                  </div>
                  <p className="text-sm text-gray-600">Serious</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {issues.filter(i => i.impact === 'moderate').length}
                  </div>
                  <p className="text-sm text-gray-600">Moderate</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {issues.filter(i => i.impact === 'minor').length}
                  </div>
                  <p className="text-sm text-gray-600">Minor</p>
                </div>
              </div>

              <div className="space-y-3">
                {issues.map((issue) => (
                  <div key={issue.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      {getImpactIcon(issue.impact)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{issue.description}</h4>
                          {getImpactBadge(issue.impact)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{issue.help}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">
                            Affects {issue.nodes} element{issue.nodes > 1 ? 's' : ''}
                          </span>
                          <a
                            href={issue.helpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Learn more →
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">
                {lastChecked ? 'No accessibility issues found!' : 'Run a check to see accessibility issues'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getAccessibilityTips().map((tip, index) => (
              <div key={index} className="flex gap-3">
                {tip.icon}
                <div>
                  <h4 className="font-medium mb-1">{tip.title}</h4>
                  <p className="text-sm text-gray-600">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle>Keyboard Shortcuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <kbd className="px-2 py-1 text-sm font-mono bg-gray-100 rounded">Tab</kbd>
              <span className="ml-2 text-sm">Navigate forward</span>
            </div>
            <div>
              <kbd className="px-2 py-1 text-sm font-mono bg-gray-100 rounded">Shift + Tab</kbd>
              <span className="ml-2 text-sm">Navigate backward</span>
            </div>
            <div>
              <kbd className="px-2 py-1 text-sm font-mono bg-gray-100 rounded">Enter</kbd>
              <span className="ml-2 text-sm">Activate button/link</span>
            </div>
            <div>
              <kbd className="px-2 py-1 text-sm font-mono bg-gray-100 rounded">Esc</kbd>
              <span className="ml-2 text-sm">Close dialog/modal</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessibilityChecker; 