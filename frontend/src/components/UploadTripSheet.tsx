import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadTripSheet } from '../services/api';

interface UploadResult {
  success: boolean;
  message: string;
  data?: any[];
  totalDeliveries?: number;
  error?: string;
}

const UploadTripSheet: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadTripSheet(file);
      setResult({
        success: response.success,
        message: response.message || 'Upload successful',
        data: response.data,
        totalDeliveries: response.totalDeliveries,
        error: response.error
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: 'Upload failed',
        error: error.response?.data?.error || error.message
      });
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <FileText className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Upload Trip Sheet</h1>
        </div>

        {!result ? (
          <div className="space-y-6">
            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-2">
                Drag and drop your PDF trip sheet here, or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Only PDF files are supported (max 10MB)
              </p>
              
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                Choose File
              </label>
            </div>

            {/* Selected File */}
            {file && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {file.name}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex justify-center">
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`px-8 py-3 rounded-lg font-medium ${
                  !file || uploading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {uploading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </div>
                ) : (
                  'Upload Trip Sheet'
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Upload Result */
          <div className="space-y-6">
            <div className={`p-6 rounded-lg ${
              result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center mb-4">
                {result.success ? (
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
                )}
                <h3 className={`text-lg font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.success ? 'Upload Successful!' : 'Upload Failed'}
                </h3>
              </div>
              
              <p className={`mb-4 ${
                result.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.message}
              </p>

              {result.error && (
                <p className="text-red-600 text-sm mb-4">
                  Error: {result.error}
                </p>
              )}

              {result.success && result.data && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-medium text-gray-900 mb-2">Processing Summary:</h4>
                    <p className="text-sm text-gray-600">
                      Total Deliveries: <span className="font-medium">{result.totalDeliveries}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Trip Sheets Processed: <span className="font-medium">{result.data.length}</span>
                    </p>
                  </div>

                  {result.data.map((tripData, index) => (
                    <div key={index} className="bg-white p-4 rounded border">
                      <h5 className="font-medium text-gray-900 mb-2">
                        Trip Sheet {index + 1}
                      </h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Driver:</span>
                          <span className="ml-2 font-medium">{tripData.driver.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Truck:</span>
                          <span className="ml-2 font-medium">{tripData.driver.truckNo}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Start Time:</span>
                          <span className="ml-2 font-medium">{tripData.startTime}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">End Time:</span>
                          <span className="ml-2 font-medium">{tripData.endTime}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Deliveries:</span>
                          <span className="ml-2 font-medium">{tripData.deliveries}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={resetUpload}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Upload Another
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadTripSheet;
