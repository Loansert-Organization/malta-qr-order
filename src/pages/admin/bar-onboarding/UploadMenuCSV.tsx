import React, { useState } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/lib/api';

export default function UploadMenuCSV() {
  const [csvData, setCsvData] = useState<any[]>([]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      complete: async results => {
        const data = results.data as any[];
        setCsvData(data);
        const formatted = data.map(row => ({
          bar_id: row.bar_id,
          name: row.name,
          description: row.description,
          price: parseFloat(row.price),
          category: row.category,
          image_url: row.image_url || null
        }));
        const { error } = await supabase.from('menu_items').insert(formatted);
        if (error) window.alert('Upload failed');
        else window.alert('Upload complete');
      }
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Upload Menu (CSV)</h2>
      <input type="file" accept=".csv" onChange={handleFile} />
    </div>
  );
}
