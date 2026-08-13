"use client";

import React, { useState, useRef } from "react";
import { bulkUploadStudents, BulkUploadResult } from "@/lib/services/students";
import { downloadCSVTemplate, parseCSVToStudents } from "@/lib/utils/csv-template";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  Download, 
  FileText, 
  AlertCircle, 
  CheckCircle2,
  Users,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface BulkUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    downloadCSVTemplate();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setErrorMsg('Please select a CSV file');
        return;
      }
      setSelectedFile(file);
      setErrorMsg(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select a CSV file first');
      return;
    }

    setUploading(true);
    setErrorMsg(null);

    try {
      // Read and parse CSV file
      const fileContent = await selectedFile.text();
      const parsedStudents = parseCSVToStudents(fileContent);

      if (parsedStudents.length === 0) {
        setErrorMsg('No valid student records found in CSV file');
        return;
      }

      // Upload students
      const result = await bulkUploadStudents(parsedStudents);
      setUploadResult(result);

      if (result.success) {
        onSuccess();
      }

    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Failed to process CSV file');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setErrorMsg(null);
    onOpenChange(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            Bulk Upload Students
          </DialogTitle>
          <DialogDescription className="text-sm">
            Upload multiple students at once using a CSV file. Download the template, fill in student details, and upload.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Step 1: Download Template */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Step 1: Download CSV Template
                  </h4>
                  <p className="text-xs text-slate-500">
                    Get the properly formatted CSV template with sample data and required columns.
                  </p>
                </div>
                <Button 
                  onClick={handleDownloadTemplate}
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Upload File */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Upload className="h-4 w-4 text-emerald-600" />
                  Step 2: Upload Completed CSV File
                </h4>
                
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6">
                  {!selectedFile ? (
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Select CSV File
                      </p>
                      <p className="text-xs text-slate-500 mb-3">
                        Choose the CSV file with student data
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,text/csv"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="csv-upload"
                      />
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline" 
                        size="sm"
                      >
                        Choose File
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleRemoveFile}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-slate-500 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {errorMsg && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm font-medium">
                {errorMsg}
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {uploadResult.success ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    )}
                    <h4 className="font-semibold text-sm">
                      Upload {uploadResult.success ? 'Completed' : 'Completed with Errors'}
                    </h4>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {uploadResult.totalProcessed}
                      </p>
                      <p className="text-xs text-slate-500">Total Processed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-emerald-600">
                        {uploadResult.successCount}
                      </p>
                      <p className="text-xs text-slate-500">Successful</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-600">
                        {uploadResult.failedCount}
                      </p>
                      <p className="text-xs text-slate-500">Failed</p>
                    </div>
                  </div>

                  {uploadResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Errors:
                      </p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {uploadResult.errors.slice(0, 5).map((error, index) => (
                          <div key={index} className="text-xs bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2">
                            <span className="font-semibold">Row {error.row}:</span> {error.error}
                            <br />
                            <span className="text-slate-500">Email: {error.email}</span>
                          </div>
                        ))}
                        {uploadResult.errors.length > 5 && (
                          <p className="text-xs text-slate-500 text-center">
                            ... and {uploadResult.errors.length - 5} more errors
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            {uploadResult ? 'Close' : 'Cancel'}
          </Button>
          {!uploadResult && (
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload Students'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};