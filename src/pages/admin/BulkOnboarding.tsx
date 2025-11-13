import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function BulkOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [alumniFile, setAlumniFile] = useState<File | null>(null);
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [uploadHistory, setUploadHistory] = useState([
    {
      id: 1,
      type: "Alumni Data",
      fileName: "alumni_batch_2024.csv",
      uploadedAt: "2024-01-15",
      status: "completed",
      records: 450,
      processed: 450,
      failed: 0,
    },
    {
      id: 2,
      type: "Student IDs",
      fileName: "student_ids_2024.xlsx",
      uploadedAt: "2024-01-10",
      status: "completed",
      records: 1200,
      processed: 1200,
      failed: 0,
    },
  ]);

  const handleFileDrop = useCallback((e: React.DragEvent, type: 'alumni' | 'student') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (type === 'alumni') {
        setAlumniFile(file);
      } else {
        setStudentFile(file);
      }
      toast({
        title: "File selected",
        description: `${file.name} is ready to upload`,
      });
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'alumni' | 'student') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'alumni') {
        setAlumniFile(file);
      } else {
        setStudentFile(file);
      }
      toast({
        title: "File selected",
        description: `${file.name} is ready to upload`,
      });
    }
  };

  const handleUpload = (type: 'alumni' | 'student') => {
    const file = type === 'alumni' ? alumniFile : studentFile;
    if (!file) return;

    toast({
      title: "Upload started",
      description: `Processing ${file.name}...`,
    });

    // Simulate upload
    setTimeout(() => {
      toast({
        title: "Upload successful",
        description: `${file.name} has been processed successfully`,
      });
      if (type === 'alumni') setAlumniFile(null);
      else setStudentFile(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/admin/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bulk Data Onboarding</h1>
          <p className="text-muted-foreground">
            Upload your existing alumni data and student IDs to get started
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Alumni Data Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Alumni Data
              </CardTitle>
              <CardDescription>
                CSV/Excel file with alumni information (Name, Email, Graduation Year, Major)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onDrop={(e) => handleFileDrop(e, 'alumni')}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('alumni-file')?.click()}
              >
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                {alumniFile ? (
                  <div>
                    <p className="font-medium">{alumniFile.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(alumniFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium mb-1">Drop your file here or click to browse</p>
                    <p className="text-sm text-muted-foreground">
                      Supports CSV and Excel formats
                    </p>
                  </div>
                )}
                <input
                  id="alumni-file"
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => handleFileSelect(e, 'alumni')}
                />
              </div>
              {alumniFile && (
                <Button className="w-full mt-4" onClick={() => handleUpload('alumni')}>
                  Upload Alumni Data
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Student IDs Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Student IDs
              </CardTitle>
              <CardDescription>
                CSV/Excel file with official student ID list for validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onDrop={(e) => handleFileDrop(e, 'student')}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('student-file')?.click()}
              >
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                {studentFile ? (
                  <div>
                    <p className="font-medium">{studentFile.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(studentFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium mb-1">Drop your file here or click to browse</p>
                    <p className="text-sm text-muted-foreground">
                      Supports CSV and Excel formats
                    </p>
                  </div>
                )}
                <input
                  id="student-file"
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => handleFileSelect(e, 'student')}
                />
              </div>
              {studentFile && (
                <Button className="w-full mt-4" onClick={() => handleUpload('student')}>
                  Upload Student IDs
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upload History */}
        <Card>
          <CardHeader>
            <CardTitle>Upload History</CardTitle>
            <CardDescription>Track your previous bulk uploads</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead>Failed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadHistory.map((upload) => (
                  <TableRow key={upload.id}>
                    <TableCell className="font-medium">{upload.type}</TableCell>
                    <TableCell>{upload.fileName}</TableCell>
                    <TableCell>{upload.uploadedAt}</TableCell>
                    <TableCell>
                      <Badge variant={upload.status === 'completed' ? 'default' : 'secondary'}>
                        {upload.status === 'completed' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {upload.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{upload.records}</TableCell>
                    <TableCell className="text-green-600">{upload.processed}</TableCell>
                    <TableCell className="text-red-600">{upload.failed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
