
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TestResultsCardProps {
  testResults: any[];
}

const TestResultsCard: React.FC<TestResultsCardProps> = ({ testResults }) => {
  if (testResults.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {testResults.map((result, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{result.test}</h4>
                <span className="text-xs text-gray-500">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <pre className="text-xs text-gray-700 bg-white p-2 rounded overflow-x-auto">
                {JSON.stringify(result.result, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestResultsCard;
