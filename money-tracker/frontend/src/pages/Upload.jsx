import React from 'react';
import TopNav from '../components/Layout/TopNav';
import UploadZone from '../components/Upload/UploadZone';
import Client from '../api/client';


const Upload = () => {
  const handleUploadSuccess = async (file, provider) => {
    return await Client.uploadPDF(file, provider);
  };

  return (
    <div className="min-h-full bg-primary-bg">
      <TopNav 
        title="Upload Statement"
        meta="Upload your transaction statement PDF (PhonePe, Google Pay, Paytm, Others)"
      />
      
      <div className="px-6 lg:px-10 py-6 flex justify-center">
        <UploadZone onUploadSuccess={handleUploadSuccess} />
      </div>
    </div>
  );
};

export default Upload;
