'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileText, CheckCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { useApplyStore } from '@/store/useApplyStore';

export default function UploadDocumentsPage() {
  const router = useRouter();
  const { personalDetails, documents, setDocuments } = useApplyStore();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!personalDetails) {
      router.replace('/apply/personal-details');
    } else {
      setChecking(false);
    }
  }, [personalDetails, router]);

  const handleFile = useCallback(async (file: File) => {
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      toast.error('Invalid file type. Please upload a PDF, JPG, or PNG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit.');
      return;
    }

    setLocalFile(file);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('salarySlip', file);

    try {
      const { data } = await api.post('/borrower/upload-salary-slip', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDocuments({
        salarySlipUrl: data.fileUrl,
        salarySlipOriginalName: data.fileName,
      });
      toast.success('File uploaded successfully!');
    } catch (error: any) {
      setLocalFile(null);
      toast.error(error.response?.data?.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  }, [setDocuments]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  if (checking) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-1">Upload Documents</h3>
        <p className="text-slate-500 text-sm">Please upload your latest salary slip or income proof.</p>
      </div>

      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400'
        }`}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
        onDrop={handleDrop}
      >
        {!documents ? (
          <>
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              disabled={isUploading}
            />
            {isUploading ? (
              <div className="flex flex-col items-center justify-center py-6">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                <p className="text-sm font-medium text-slate-600">Uploading document...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 pointer-events-none">
                <UploadCloud className="w-12 h-12 text-slate-400 mb-4" />
                <p className="text-sm font-medium text-slate-900 mb-1">Drag and drop your file here</p>
                <p className="text-xs text-slate-500 mb-4">or click to browse</p>
                <p className="text-xs text-slate-400">Supported formats: PDF, JPG, PNG (Max 5MB)</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                {documents.salarySlipOriginalName.endsWith('.pdf') ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-slate-900 truncate max-w-[200px] sm:max-w-[300px]">
                  {documents.salarySlipOriginalName}
                </p>
                <div className="flex items-center gap-1 text-xs text-emerald-600 mt-0.5">
                  <CheckCircle className="w-3 h-3" />
                  <span>Uploaded successfully</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setDocuments(null)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 px-3 py-1.5"
            >
              Change file
            </button>
          </div>
        )}
      </div>

      <div className="pt-4 flex gap-4">
        <button
          type="button"
          onClick={() => router.push('/apply/personal-details')}
          className="w-1/3 py-3 px-4 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => router.push('/apply/loan-config')}
          disabled={!documents}
          className="w-2/3 flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
