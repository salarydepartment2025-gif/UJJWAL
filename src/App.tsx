/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Camera, Upload, FileText, CheckCircle2, AlertCircle, Download, User, Phone, CreditCard, Building2, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface FormData {
  name: string;
  fatherName: string;
  gender: string;
  maritalStatus: string;
  phone: string;
  aadhaar: string;
  uan: string;
  esic: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  nomineeName: string;
  nomineeRelationship: string;
  nomineeAadhaar: string;
  photo: string | null;
  aadhaarPhoto: string | null;
  aadhaarBackPhoto: string | null;
  panPhoto: string | null;
}

const initialData: FormData = {
  name: '',
  fatherName: '',
  gender: '',
  maritalStatus: '',
  phone: '',
  aadhaar: '',
  uan: '',
  esic: '',
  accountNumber: '',
  ifsc: '',
  bankName: '',
  nomineeName: '',
  nomineeRelationship: '',
  nomineeAadhaar: '',
  photo: null,
  aadhaarPhoto: null,
  aadhaarBackPhoto: null,
  panPhoto: null,
};

export default function App() {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>, field: 'photo' | 'aadhaarPhoto' | 'aadhaarBackPhoto' | 'panPhoto') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation check
    if (!formData.photo) {
      alert("Please capture your profile photo before submitting.");
      return;
    }
    if (!formData.aadhaarPhoto) {
      alert("Please capture a photo of your Aadhaar Card (Front).");
      return;
    }
    if (!formData.aadhaarBackPhoto) {
      alert("Please capture a photo of your Aadhaar Card (Back).");
      return;
    }
    setIsSubmitted(true);
  };

  const downloadPDF = async () => {
    if (!pdfRef.current) return;
    setIsGenerating(true);
    try {
      // Ensure the element is visible for a moment or has fixed dimensions for capture
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297
      
      // Calculate height to maintain aspect ratio
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // If the content is longer than one page, we might need to add pages, 
      // but for a KYC form, we'll try to fit it or scale it.
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      pdf.save(`KYC_Form_${formData.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setFormData(initialData);
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-black/5 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">KYC Registration</h1>
          <button 
            onClick={downloadPDF}
            disabled={isGenerating}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
          >
            <Download size={14} />
            {isGenerating ? '...' : 'Download PDF'}
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-6">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Photo Section */}
                  <div className="flex flex-col items-center space-y-3 pb-4 border-b border-black/5">
                    <label className="relative w-32 h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-100 transition-colors">
                      {formData.photo ? (
                        <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="flex flex-col items-center text-slate-400">
                          <Camera size={32} />
                          <span className="text-[10px] mt-1 font-medium uppercase tracking-wider">Take Photo</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                        onChange={handlePhotoCapture}
                      />
                    </label>
                    <p className="text-xs text-slate-500 font-medium">Passport size photo required</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pb-4 border-b border-black/5">
                    <div className="flex flex-col items-center space-y-2">
                      <label className="relative w-full aspect-[3/4] rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-100 transition-colors">
                        {formData.aadhaarPhoto ? (
                          <img src={formData.aadhaarPhoto} alt="Aadhaar Front" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="flex flex-col items-center text-slate-400">
                            <Camera size={20} />
                            <span className="text-[8px] mt-1 font-medium uppercase tracking-wider text-center">Aadhaar Front</span>
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="environment" 
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                          onChange={(e) => handlePhotoCapture(e, 'aadhaarPhoto')}
                        />
                      </label>
                      <p className="text-[9px] text-slate-500 font-medium">Front</p>
                    </div>

                    <div className="flex flex-col items-center space-y-2">
                      <label className="relative w-full aspect-[3/4] rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-100 transition-colors">
                        {formData.aadhaarBackPhoto ? (
                          <img src={formData.aadhaarBackPhoto} alt="Aadhaar Back" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="flex flex-col items-center text-slate-400">
                            <Camera size={20} />
                            <span className="text-[8px] mt-1 font-medium uppercase tracking-wider text-center">Aadhaar Back</span>
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="environment" 
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                          onChange={(e) => handlePhotoCapture(e, 'aadhaarBackPhoto')}
                        />
                      </label>
                      <p className="text-[9px] text-slate-500 font-medium">Back</p>
                    </div>

                    <div className="flex flex-col items-center space-y-2">
                      <label className="relative w-full aspect-[3/4] rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-100 transition-colors">
                        {formData.panPhoto ? (
                          <img src={formData.panPhoto} alt="PAN" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="flex flex-col items-center text-slate-400">
                            <Camera size={20} />
                            <span className="text-[8px] mt-1 font-medium uppercase tracking-wider text-center">PAN Card</span>
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="environment" 
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                          onChange={(e) => handlePhotoCapture(e, 'panPhoto')}
                        />
                      </label>
                      <p className="text-[9px] text-slate-500 font-medium">PAN Front</p>
                    </div>
                  </div>

                  {/* Personal Details */}
                  <div className="space-y-4 pt-2">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <User size={14} /> Personal Details
                    </h2>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 ml-1">Full Name</label>
                      <input
                        required
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 ml-1">Father's Name</label>
                      <input
                        required
                        type="text"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleChange}
                        placeholder="Enter father's name"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-600 ml-1">Gender</label>
                        <div className="flex flex-col gap-2">
                          {['Male', 'Female', 'Other'].map((option) => (
                            <label key={option} className="flex items-center gap-2 cursor-pointer group">
                              <input
                                type="radio"
                                name="gender"
                                value={option}
                                checked={formData.gender === option}
                                onChange={handleChange}
                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                                required
                              />
                              <span className="text-sm text-slate-700 group-hover:text-emerald-600 transition-colors">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-600 ml-1">Marital Status</label>
                        <div className="flex flex-col gap-2">
                          {['Married', 'Unmarried'].map((option) => (
                            <label key={option} className="flex items-center gap-2 cursor-pointer group">
                              <input
                                type="radio"
                                name="maritalStatus"
                                value={option}
                                checked={formData.maritalStatus === option}
                                onChange={handleChange}
                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                                required
                              />
                              <span className="text-sm text-slate-700 group-hover:text-emerald-600 transition-colors">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Identification */}
                  <div className="space-y-4 pt-4 border-t border-black/5">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <CreditCard size={14} /> Identification
                    </h2>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 ml-1">Phone (Aadhaar Linked)</label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          required
                          type="tel"
                          name="phone"
                          pattern="[0-9]{10}"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="10-digit mobile number"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 ml-1">Aadhaar Number</label>
                      <input
                        required
                        type="text"
                        name="aadhaar"
                        pattern="[0-9]{12}"
                        value={formData.aadhaar}
                        onChange={handleChange}
                        placeholder="12-digit Aadhaar number"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 ml-1">UAN Number</label>
                        <input
                          type="text"
                          name="uan"
                          value={formData.uan}
                          onChange={handleChange}
                          placeholder="UAN"
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 ml-1">ESIC Number</label>
                        <input
                          type="text"
                          name="esic"
                          value={formData.esic}
                          onChange={handleChange}
                          placeholder="ESIC"
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="space-y-4 pt-4 border-t border-black/5">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Landmark size={14} /> Bank Details
                    </h2>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 ml-1">Bank Name</label>
                      <div className="relative">
                        <Building2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          required
                          type="text"
                          name="bankName"
                          value={formData.bankName}
                          onChange={handleChange}
                          placeholder="Name of your bank"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 ml-1">Account Number</label>
                      <input
                        required
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        placeholder="Enter bank account number"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 ml-1">IFSC Code</label>
                      <input
                        required
                        type="text"
                        name="ifsc"
                        value={formData.ifsc}
                        onChange={handleChange}
                        placeholder="e.g. SBIN0001234"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm uppercase"
                      />
                    </div>
                  </div>

                  {/* Nominee Details */}
                  <div className="space-y-4 pt-4 border-t border-black/5">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <User size={14} /> Nominee Details
                    </h2>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 ml-1">Nominee Name</label>
                      <input
                        required
                        type="text"
                        name="nomineeName"
                        value={formData.nomineeName}
                        onChange={handleChange}
                        placeholder="Enter nominee's full name"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 ml-1">Relationship</label>
                      <input
                        required
                        type="text"
                        name="nomineeRelationship"
                        value={formData.nomineeRelationship}
                        onChange={handleChange}
                        placeholder="e.g. Wife, Son, Mother"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 ml-1">Nominee Aadhaar (Optional)</label>
                      <input
                        type="text"
                        name="nomineeAadhaar"
                        pattern="[0-9]{12}"
                        value={formData.nomineeAadhaar}
                        onChange={handleChange}
                        placeholder="12-digit Aadhaar number"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={downloadPDF}
                      disabled={isGenerating}
                      className="flex-1 bg-slate-100 text-slate-600 font-semibold py-4 rounded-xl hover:bg-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Download size={18} />
                      {isGenerating ? '...' : 'Download PDF'}
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] bg-emerald-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      Submit KYC Form
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-black/5 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Form Submitted!</h2>
                <p className="text-slate-500 text-sm">Your KYC details have been successfully recorded. You can now download the PDF copy.</p>
                
                <div className="pt-4 flex flex-col gap-3">
                  <button
                    onClick={downloadPDF}
                    disabled={isGenerating}
                    className="w-full bg-emerald-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>Generating PDF...</>
                    ) : (
                      <>
                        <Download size={18} />
                        Download PDF
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetForm}
                    className="w-full bg-slate-100 text-slate-600 font-semibold py-4 rounded-xl hover:bg-slate-200 active:scale-[0.98] transition-all"
                  >
                    Fill New Form
                  </button>
                </div>
              </div>

              {/* Hidden PDF Content */}
              <div className="fixed left-[-9999px] top-0">
                <div 
                  ref={pdfRef}
                  className="w-[210mm] h-[297mm] bg-white p-8 text-black font-serif overflow-hidden"
                >
                  <div className="text-center border-b-2 border-black pb-4 mb-6">
                    <h1 className="text-2xl font-bold uppercase tracking-widest">Bank Payment KYC Form</h1>
                    <p className="text-xs mt-1 font-sans text-gray-600">Employee / Labour Registration Document</p>
                  </div>

                  <div className="flex justify-between items-start gap-8 mb-6">
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-y-2 text-[11px]">
                        <div className="font-bold">Full Name:</div>
                        <div>{formData.name}</div>
                        
                        <div className="font-bold">Father's Name:</div>
                        <div>{formData.fatherName}</div>
                        
                        <div className="font-bold">Gender:</div>
                        <div>{formData.gender}</div>
                        
                        <div className="font-bold">Marital Status:</div>
                        <div>{formData.maritalStatus}</div>
                        
                        <div className="font-bold">Phone Number:</div>
                        <div>{formData.phone}</div>
                        
                        <div className="font-bold">Aadhaar Number:</div>
                        <div>{formData.aadhaar}</div>
                        
                        <div className="font-bold">UAN Number:</div>
                        <div>{formData.uan || 'N/A'}</div>
                        
                        <div className="font-bold">ESIC Number:</div>
                        <div>{formData.esic || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="w-32 h-40 border-2 border-black flex items-center justify-center overflow-hidden bg-gray-50">
                      {formData.photo ? (
                        <img src={formData.photo} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-[10px] text-gray-400">PHOTO</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-lg font-bold border-b border-black pb-1 uppercase">Bank Account Information</h2>
                    <div className="grid grid-cols-2 gap-y-2 text-[11px]">
                      <div className="font-bold">Bank Name:</div>
                      <div>{formData.bankName}</div>
                      
                      <div className="font-bold">Account Number:</div>
                      <div>{formData.accountNumber}</div>
                      
                      <div className="font-bold">IFSC Code:</div>
                      <div className="uppercase">{formData.ifsc}</div>
                    </div>
                  </div>

                  <div className="space-y-4 mt-6">
                    <h2 className="text-lg font-bold border-b border-black pb-1 uppercase">Nominee Information</h2>
                    <div className="grid grid-cols-2 gap-y-2 text-[11px]">
                      <div className="font-bold">Nominee Name:</div>
                      <div>{formData.nomineeName}</div>
                      
                      <div className="font-bold">Relationship:</div>
                      <div>{formData.nomineeRelationship}</div>
                      
                      <div className="font-bold">Nominee Aadhaar:</div>
                      <div>{formData.nomineeAadhaar || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="space-y-4 mt-6">
                    <h2 className="text-lg font-bold border-b border-black pb-1 uppercase">Document Proofs</h2>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase">Aadhaar Card (Front):</p>
                        <div className="w-full h-28 border border-black flex items-center justify-center overflow-hidden bg-gray-50">
                          {formData.aadhaarPhoto ? (
                            <img src={formData.aadhaarPhoto} alt="Aadhaar Front" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-[9px] text-gray-400">NOT PROVIDED</span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase">Aadhaar Card (Back):</p>
                        <div className="w-full h-28 border border-black flex items-center justify-center overflow-hidden bg-gray-50">
                          {formData.aadhaarBackPhoto ? (
                            <img src={formData.aadhaarBackPhoto} alt="Aadhaar Back" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-[9px] text-gray-400">NOT PROVIDED</span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase">PAN Card Copy:</p>
                        <div className="w-full h-28 border border-black flex items-center justify-center overflow-hidden bg-gray-50">
                          {formData.panPhoto ? (
                            <img src={formData.panPhoto} alt="PAN" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-[9px] text-gray-400">NOT PROVIDED</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-end">
                      <div className="text-center">
                        <div className="w-32 border-b border-black mb-1"></div>
                        <p className="text-[10px] font-bold uppercase">Date</p>
                      </div>
                      <div className="text-center">
                        <div className="w-40 border-b border-black mb-1"></div>
                        <p className="text-[10px] font-bold uppercase">Employee Signature / Thumb Impression</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 text-[10px] text-gray-400 text-center italic">
                    This is a computer-generated KYC document. Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      {!isSubmitted && (
        <div className="max-w-md mx-auto px-6 mt-8 flex items-start gap-3 text-slate-400">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            Ensure all details match your official documents. The photo should be clear and taken in good lighting.
          </p>
        </div>
      )}
    </div>
  );
}
