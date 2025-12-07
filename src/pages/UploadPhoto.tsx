import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/lib/store';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const UploadPhoto = () => {
  const navigate = useNavigate();
  const userProfile = useAppStore((state) => state.userProfile);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setFile(null);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userProfile?.userId) {
      toast.error("User not authenticated. Please complete your awakening.");
      navigate('/awakening');
      return;
    }
    if (!file) {
      toast.error("Please select a photo to upload.");
      return;
    }
    if (!title.trim()) {
      toast.error("Please provide a title for your photo.");
      return;
    }

    setUploading(true);
    const loadingToastId = toast.loading("Uploading photo and analyzing with AI...");

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userProfile.userId}/${Date.now()}.${fileExt}`;
      const filePath = `progress_photos/${fileName}`;

      // 1. Upload photo to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents') // Still using 'documents' bucket for storage
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('documents') // Still using 'documents' bucket for storage
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error("Failed to get public URL for the uploaded photo.");
      }

      const imageUrl = publicUrlData.publicUrl;

      // 2. Call Edge Function for AI analysis (Gemini)
      let bodyFatPercentage: number | null = null;
      let aiAnalysisReport: string | null = null;

      try {
        const { data: aiData, error: aiError } = await supabase.functions.invoke('gemini-image-analyzer', {
          body: { imageUrl },
        });

        if (aiError) {
          console.error("Supabase Edge Function error:", aiError);
          toast.error(`AI Analysis Error: ${aiError.message}`);
        } else if (aiData.error) {
          console.error("AI API error via proxy:", aiData.error);
          toast.error(`AI Analysis Error: ${aiData.error}`);
        } else {
          bodyFatPercentage = aiData.body_fat_percentage || null;
          aiAnalysisReport = aiData.advice || null;
          toast.success("AI analysis complete!", { id: loadingToastId });
        }
      } catch (aiCallError) {
        console.error("Error invoking gemini-image-analyzer proxy:", aiCallError);
        toast.error("Failed to connect to AI for analysis. Please ensure GEMINI_API_KEY is set in Supabase secrets.", { id: loadingToastId });
      }

      // 3. Insert document record with AI analysis results into new table
      const { error: insertError } = await supabase
        .from('sl_documents') // Changed to sl_documents
        .insert({
          user_id: userProfile.userId,
          title: title.trim(),
          file_url: imageUrl,
          description: description.trim() || null,
          category: 'Progress Photo',
          body_fat_percentage: bodyFatPercentage,
          ai_analysis_report: aiAnalysisReport,
        });

      if (insertError) {
        throw insertError;
      }

      toast.success("Photo uploaded and analyzed successfully!", { id: loadingToastId });
      setFile(null);
      setTitle('');
      setDescription('');
      setPreviewUrl(null);
      navigate('/progress-report'); // Redirect to progress report to see the analysis
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast.error(`Failed to upload photo: ${error.message}`, { id: loadingToastId });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground p-4 md:p-8">
      <div className="text-center max-w-md w-full space-y-6">
        <h1 className="text-4xl font-bold text-primary-foreground mb-6">
          <span className="text-orange-400">UPLOAD</span> PHOTO
        </h1>
        <p className="text-lg text-text-secondary mb-8">
          Document your physical transformation. AI will analyze your physique!
        </p>

        <Card className="bg-card p-6 rounded-lg shadow-lg border border-border">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-xl font-semibold text-primary-foreground text-left">Upload New Photo</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="photo" className="text-left block mb-1 text-text-secondary">Select Photo</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="bg-input border-border text-foreground file:text-primary-accent file:bg-transparent file:border-0 file:font-semibold"
                />
              </div>

              {previewUrl && (
                <div className="mt-4">
                  <Label className="text-left block mb-1 text-text-secondary">Image Preview</Label>
                  <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-md border border-border" />
                </div>
              )}
              {!previewUrl && file && (
                <div className="mt-4 flex items-center justify-center h-48 bg-muted rounded-md border border-border text-muted-foreground">
                  <ImageIcon className="h-12 w-12" />
                </div>
              )}

              <div>
                <Label htmlFor="title" className="text-left block mb-1 text-text-secondary">Title</Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Day 1 Progress, Week 4 Physique"
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-left block mb-1 text-text-secondary">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add notes about your progress..."
                  className="bg-input border-border text-foreground"
                />
              </div>

              <Button
                type="submit"
                disabled={uploading}
                className="w-full bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-background transition-colors duration-300 text-lg py-3 mt-6 relative overflow-hidden group"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    UPLOADING & ANALYZING...
                  </>
                ) : (
                  <>
                    <span className="relative z-10">UPLOAD & ANALYZE PHOTO</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Link to="/dashboard">
          <Button
            variant="outline"
            className="w-full border-border text-text-secondary hover:bg-accent hover:text-accent-foreground mt-4"
          >
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default UploadPhoto;