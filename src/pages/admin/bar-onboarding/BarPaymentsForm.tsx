import React, { useState } from 'react';
import { supabase } from '@/lib/api';

export default function BarPaymentsForm({ bar_id }: { bar_id: string }) {
  const [momoCode, setMomoCode] = useState('');
  const [revolutLink, setRevolutLink] = useState('');

  const save = async () => {
    const { error } = await supabase
      .from('bars')
      .update({ momo_code: momoCode, revolut_link: revolutLink, onboarding_status: 'complete' })
      .eq('id', bar_id);
    if (error) window.alert('Failed to save');
    else window.alert('Saved ✅');
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">MoMo & Revolut Setup</h3>
      <input
        className="border p-2 mb-2 w-full"
        value={momoCode}
        onChange={e => setMomoCode(e.target.value)}
        placeholder="MoMo Code *182*1*XXX#"
      />
      <input
        className="border p-2 mb-2 w-full"
        value={revolutLink}
        onChange={e => setRevolutLink(e.target.value)}
        placeholder="Revolut Payment URL"
      />
      <button className="bg-blue-600 text-white p-2 rounded" onClick={save}>
        Save
      </button>
    </div>
  );
}
