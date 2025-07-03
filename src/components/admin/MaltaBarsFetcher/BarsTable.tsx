
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star } from 'lucide-react';
import { Bar } from './types';

interface BarsTableProps {
  bars: Bar[];
}

export const BarsTable: React.FC<BarsTableProps> = ({ bars }) => {
  const getQualityBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Malta Bars Database ({bars.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {bars.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No bars found. Click "Fetch Bars from Google Maps" to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Quality Score</TableHead>
                  <TableHead>Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bars.map((bar) => (
                  <TableRow key={bar.id}>
                    <TableCell className="font-medium">{bar.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{bar.address}</TableCell>
                    <TableCell>
                      {bar.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{bar.rating}</span>
                          {bar.review_count && (
                            <span className="text-gray-500 text-sm">({bar.review_count})</span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityBadgeColor(bar.data_quality_score || 0)}`}>
                        {bar.data_quality_score || 0}%
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {bar.created_at ? new Date(bar.created_at).toLocaleDateString() : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
