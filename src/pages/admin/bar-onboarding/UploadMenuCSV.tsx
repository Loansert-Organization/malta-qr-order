import React, { useState } from 'react'
import Papa from 'papaparse'
import { supabase } from '@/integrations/supabase/client'

export default function UploadMenuCSV() {
  const [barId, setBarId] = useState('')
  const [csvFile, setCsvFile] = useState<File | null>(null)

  const handleUpload = () => {
    if (!csvFile || !barId) return alert('Missing file or bar ID')

    Papa.parse(csvFile, {
      header: true,
      complete: async (results) => {
        const items = (results.data as any[]).map(row => ({
          bar_id: barId,
          name: row.name,
          description: row.description,
          price: parseFloat(row.price),
          category: row.category,
          subcategory: row.subcategory,
          image_url: row.image_url || null
        }))
        const { error } = await supabase.from('menu_items').insert(items)
        if (error) alert('Error: ' + error.message)
        else alert('Upload Complete ✅')
      }
    })
  }

  return (
    <div>
      <h2>CSV Menu Upload</h2>
      <input type="text" placeholder="Bar ID" onChange={e => setBarId(e.target.value)} />
      <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload}>Upload Menu</button>
    </div>
  )
}
