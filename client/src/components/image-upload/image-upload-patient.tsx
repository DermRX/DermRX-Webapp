import { useState, useRef, useEffect, useContext } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Upload, ImagePlus } from "lucide-react";
import { mockPatientImages } from "@/lib/mock";
import { fetchImage } from "@/services/api";
import { AppContext } from "@/context/AppContext";
import { Skeleton } from "../ui/skeleton";

interface ImageUploadProps {
    onImageSelect: (base64: string) => void;
}

export function ImageUploadPatient({ onImageSelect }: ImageUploadProps) {
    const appContext = useContext(AppContext);
    const [preview, setPreview] = useState<string>();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [patient, setPatient] = useState<r4.Patient | undefined>(undefined);
    const [documents, setDocuments] = useState<r4.DocumentReference[]>([]);
    const [imageMap, setImageMap] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
  
    useEffect(() => {
      const loadImages = async () => {
          setIsLoadingImage(true);
          const newImageMap: Record<string, string> = {};
          // Loop through documents sequentially or in parallel:
          await Promise.all(
              documents.map(async (doc) => {
                  if(!doc.id) return;
                  const imageUrl = doc.content?.[0]?.attachment?.url;
                  if (!imageUrl) return;
                  try {
                      const blobUrl = await fetchImage(imageUrl);
                      newImageMap[doc.id] = blobUrl;
                  } catch (error) {
                      console.error(`Error fetching image for doc ${doc.id}:`, error);
                  }
              })
          );
          setIsLoadingImage(false);
          setImageMap(newImageMap);
      };
  
      if (documents.length > 0) {
          loadImages();
      }
  }, [documents]);
  
  useEffect(() => {
      const load = async () => {
          if (!appContext.accessToken || !appContext.fhirClient) return;
          setIsLoading(true);
  
          try {
              const patientId = appContext.patientFhirId;
              const patients = await appContext.fhirClient.request(`Patient?_id=${patientId}`, { flat: true });
              setPatient(patients[0] ?? null);
  
              const docs = await appContext.fhirClient.request(`DocumentReference?patient=${patientId}`, { flat: true });
              setDocuments(docs);
          } catch (error) {
              console.error("Error fetching data:", error);
          } finally {
              setIsLoading(false);
          }
      };
      load();
  }, [appContext]);

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

    const handleImageSelect = (imageBlobUrl: string) => {
        fetch(imageBlobUrl)
            .then((res) => res.blob())
            .then((blob) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result as string;
                    setPreview(base64);
                    onImageSelect(base64.split(",")[1]);
                };
                reader.readAsDataURL(blob);
            })
            .catch((error) => console.error("Error converting image to base64:", error));
    };

    return (
        <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
                <Card
                    className="p-6 border-dashed text-center cursor-pointer transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Upload className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">Upload Image</p>
                            <p className="text-sm text-muted-foreground">
                                Click to browse
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <ImagePlus className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">Select Sample</p>
                            <p className="text-sm text-muted-foreground">
                                Choose from example images
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            <ScrollArea className="w-full whitespace-nowrap rounded-lg border">
                <div className="flex w-max space-x-4 p-4">
                {documents.map((doc) => {
                        if(!doc.content?.[0]?.attachment?.contentType.includes('image')) return;

                        const imageBlobUrl = imageMap[doc.id!];
                        return (
                            <Card
                                key={doc.id}
                                className="w-[200px] flex-none cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-primary"
                                onClick={() => imageBlobUrl && handleImageSelect(imageBlobUrl)}
                            >
                                <div className="aspect-square flex items-center justify-center">
                                    {isLoadingImage ? (
                                        <div className="flex flex-col space-y-3 items-center">
                                            <Skeleton className="h-[100px] w-[150px] rounded-xl" />
                                            <div className="space-y-2 w-full text-center">
                                                <Skeleton className="h-4 w-3/4 mx-auto" />
                                                <Skeleton className="h-4 w-1/2 mx-auto" />
                                            </div>
                                        </div>
                                    ) : (
                                        <img
                                            src={imageBlobUrl}
                                            alt="Scan"
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="p-2 text-center text-sm text-muted-foreground">
                                    Scan
                                </div>
                            </Card>
                        );
                    })}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
