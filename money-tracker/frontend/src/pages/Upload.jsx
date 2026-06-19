import React, { useState } from 'react';
import TopNav from '../components/Layout/TopNav';
import UploadZone from '../components/Upload/UploadZone';
import Client from '../api/client';


const Upload = () => {
  const [provider, setProvider] = useState('');

  const handleUploadSuccess = async (file) => {
    return await Client.uploadPDF(file, provider);
  };

  return (
    <div className="min-h-full bg-primary-bg">
      <TopNav 
        title="Upload Statement"
        meta="Upload your transaction statement PDF (PhonePe, Google Pay, Paytm, Others)"
      />
      
      <div className="px-6 lg:px-10 py-6 flex flex-col items-center justify-center">
        <div className="max-w-3xl w-full mb-8">
          <label className="block text-text-secondary text-sm font-medium mb-3 text-center sm:text-left">
            Select Statement Provider
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'phonepe', name: 'PhonePe' },
              { id: 'gpay', name: 'Google Pay' },
              { id: 'paytm', name: 'Paytm' },
              { id: 'others', name: 'Others' }
            ].map((p) => {
              const isSelected = provider === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id)}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 text-center ${
                    isSelected
                      ? 'bg-accent border-accent text-white shadow-[0_0_15px_rgba(124,58,237,0.25)]'
                      : 'bg-[#0c0c14] border-white/10 text-text-secondary hover:text-text-primary hover:border-white/20'
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        <UploadZone provider={provider} onUploadSuccess={handleUploadSuccess} />
      </div>
    </div>
  );
};

export default Upload;
