import React from 'react';
import QRCode from 'qrcode.react';

export default function BarMenuQR({ bar_id }: { bar_id: string }) {
  const url = `https://app.icupa.com/menu/${bar_id}`;
  return (
    <div className="p-4 text-center">
      <h3 className="text-lg font-semibold mb-2">Scan QR to View Menu</h3>
      <QRCode value={url} size={180} />
      <p className="mt-2 break-all text-sm">{url}</p>
    </div>
  );
}
