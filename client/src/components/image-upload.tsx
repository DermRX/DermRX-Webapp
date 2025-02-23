import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface ImageUploadProps {
  onImageSelect: (base64: string) => void;
}

export function ImageUpload({ onImageSelect }: ImageUploadProps) {
  const [preview, setPreview] = useState<string>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      onImageSelect(base64.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center gap-4">
        {preview ? (
          <img 
            src={preview} 
            alt="Selected skin lesion"
            className="max-w-md rounded-lg shadow-lg" 
          />
        ) : (
          <div className="w-full h-64 border-2 border-dashed rounded-lg flex items-center justify-center">
            <Upload className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="max-w-sm"
        />
        <Button 
          variant="outline" 
          onClick={() => setPreview(undefined)}
          disabled={!preview}
        >
          Clear Selection
        </Button>
      </div>
    </Card>
  );
}
