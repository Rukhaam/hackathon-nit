import { useState } from "react";
import { X, UploadCloud, FileText, CheckCircle2 } from "lucide-react";
import { useToast } from "../../hooks/toastHook";
import { providerService } from "../../api/providerApi";

export default function UploadDocsModal({ isOpen, onClose, onSuccess }) {
  const { showSuccess, showError, showLoading, dismissToast } = useToast();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        showError("Please upload a PDF file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showError("File is too large. Maximum size is 5MB.");
        return;
      }
      setSelectedFile(file);
      setUploadSuccess(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const loadingId = showLoading("Uploading securely...");

    // 🌟 Prepare FormData
    const formData = new FormData();
    formData.append("document", selectedFile); // "document" must match uploadDocument.single('document') in backend

    try {
      const data = await providerService.uploadDocs(formData);
      setUploadSuccess(true);
      showSuccess(data.message);
      
      // Delay closing slightly so user sees the success checkmark
      setTimeout(() => {
        onSuccess(data.status); // Updates parent component
        onClose();
        // Reset state for next time
        setSelectedFile(null);
        setUploadSuccess(false);
      }, 1500);

    } catch (error) {
      console.error(error);
      showError(error.response?.data?.message || "Failed to upload file.");
    } finally {
      dismissToast(loadingId);
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={!isUploading ? onClose : undefined}
      ></div>

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-fade-in-up">
        <button 
          onClick={onClose}
          disabled={isUploading}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6 mt-2">
          <h2 className="text-2xl font-bold text-gray-900">Verify Identity</h2>
          <p className="text-sm text-gray-500 mt-2">
            Upload a single PDF containing your CV and Aadhaar Card. Max size: 5MB.
          </p>
        </div>

        <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${uploadSuccess ? "border-green-400 bg-green-50" : selectedFile ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-gray-50"}`}>
          <input 
            type="file" 
            accept="application/pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading || uploadSuccess}
          />
          
          {uploadSuccess ? (
            <div className="flex flex-col items-center justify-center text-green-600">
              <CheckCircle2 size={40} className="mb-3" />
              <p className="font-bold">Uploaded Successfully!</p>
            </div>
          ) : selectedFile ? (
            <div className="flex flex-col items-center justify-center text-blue-600">
              <FileText size={40} className="mb-3" />
              <p className="font-bold text-sm truncate max-w-[250px]">{selectedFile.name}</p>
              <p className="text-xs opacity-70 mt-1">Ready to upload</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500">
              <UploadCloud size={40} className="mb-3" />
              <p className="font-bold text-sm text-gray-700">Click or drag PDF here</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleFileUpload}
          disabled={isUploading || !selectedFile || uploadSuccess}
          className="mt-6 w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors flex justify-center items-center disabled:opacity-50 shadow-md hover:shadow-lg"
        >
          {isUploading ? "Uploading..." : "Securely Upload Documents"}
        </button>
      </div>
    </div>
  );
}