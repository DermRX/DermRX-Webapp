import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
  import { Card, CardContent } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import { Progress } from "@/components/ui/progress";
  import { AlertCircle, AlertTriangle, CheckCircle, PieChart, Map, Calendar, ChevronRight, ZoomIn } from "lucide-react";
  import { LesionTracking } from "./lesion-tracking";
  import { ScheduleAppointment } from "./schedule-appointment";
  import type { DetectedLesion } from "@shared/schema";
  import { useState } from "react";
  
  interface LesionModalProps {
    lesion: DetectedLesion | null;
    imageUrl: string;
    onClose: () => void;
  }
  
  function formatLesionType(type: string): string {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
  
  function getRiskLevel(lesion: DetectedLesion): {
    level: 'high' | 'medium' | 'low';
    color: string;
    bgColor: string;
    icon: JSX.Element;
    description: string;
  } {
    if (lesion.classification === "melanoma" && lesion.confidence > 0.7) {
      return {
        level: 'high',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: <AlertCircle className="w-6 h-6 text-red-600" />,
        description: 'Immediate medical attention recommended'
      };
    } else if (["basal_cell_carcinoma", "squamous_cell_carcinoma"].includes(lesion.classification)) {
      return {
        level: 'medium',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
        description: 'Medical evaluation recommended'
      };
    }
    return {
      level: 'low',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
      description: 'Regular monitoring advised'
    };
  }
  
  export function LesionModal({ lesion, imageUrl, onClose }: LesionModalProps) {
    const [activeTab, setActiveTab] = useState("analysis");
    const [showFullImage, setShowFullImage] = useState(false);
    
    if (!lesion) return null;
  
    const risk = getRiskLevel(lesion);
    
    // Sort predictions by score in descending order
    const sortedPredictions = lesion.predictions ? 
      [...lesion.predictions].sort((a, b) => b.score - a.score) : 
      [];
      
    const maxScore = sortedPredictions.length > 0 ? Math.max(...sortedPredictions.map(p => p.score)) : 1;
    
    // Color mapping for categories
    const getCategoryColor = (label: string) => {
      if (label === 'melanoma') return { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-100' };
      if (label === 'basal_cell_carcinoma') return { bg: 'bg-amber-500', text: 'text-amber-700', light: 'bg-amber-100' };
      if (label === 'squamous_cell_carcinoma') return { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-100' };
      if (label === 'benign_keratosis-like_lesions') return { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-100' };
      if (label === 'dermatofibroma') return { bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-100' };
      if (label === 'melanocytic_Nevi') return { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-100' };
      return { bg: 'bg-gray-500', text: 'text-gray-700', light: 'bg-gray-100' };
    };
    
    // Function to generate cropped image URL (this would typically be done server-side)
    const getCroppedImageUrl = () => {
      // In a real implementation, you would have a server endpoint that returns the cropped image
      // For this example, we'll pretend we have a function that can crop the image client-side
      return imageUrl; // Placeholder - in reality this would be a different URL for the cropped image
    };
    
    return (
      <Dialog open={!!lesion} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-xl">
          <div className="flex flex-col md:flex-row h-full">
            {/* Left Panel - Image and Basic Info */}
            <div className="md:w-1/3 bg-gray-50 p-6 flex flex-col">
              <div className="relative">
                <div className="aspect-square rounded-lg overflow-hidden mb-4 shadow-md bg-white">
                  {/* Display cropped image of the lesion */}
                  <img 
                    src={getCroppedImageUrl()} 
                    alt="Lesion close-up" 
                    className="w-full h-full object-cover"
                    style={{
                      objectPosition: `${lesion.boundingBox.x * 100}% ${lesion.boundingBox.y * 100}%`
                    }}
                  />
                </div>
                
                {/* Toggle button to show/hide full image with context */}
                <button 
                  onClick={() => setShowFullImage(!showFullImage)}
                  className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                  aria-label="Toggle full image view"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                
                {/* Full image with bounding box overlay */}
                {showFullImage && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={() => setShowFullImage(false)}>
                    <div className="relative max-w-2xl max-h-[80vh] p-4" onClick={e => e.stopPropagation()}>
                      <img src={imageUrl} alt="Full skin image" className="max-w-full max-h-full object-contain" />
                      {/* Overlay showing the bounding box */}
                      <div className="absolute inset-0">
                        <div 
                          className="absolute border-2 border-red-500" 
                          style={{
                            left: `${lesion.boundingBox.x * 100}%`,
                            top: `${lesion.boundingBox.y * 100}%`,
                            width: `${lesion.boundingBox.width * 100}%`,
                            height: `${lesion.boundingBox.height * 100}%`
                          }}
                        />
                      </div>
                      <button 
                        className="absolute top-2 right-2 bg-white rounded-full p-2"
                        onClick={() => setShowFullImage(false)}
                      >
                        <span className="sr-only">Close</span>
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {risk.icon}
                  <h2 className="text-xl font-semibold">{formatLesionType(lesion.classification)}</h2>
                </div>
                <Badge className={`${risk.bgColor} ${risk.color} font-medium uppercase`}>
                  {risk.level} Risk
                </Badge>
                <p className="text-sm mt-2 text-gray-600">{risk.description}</p>
              </div>
              
              <div className="mt-auto">
                <div className="text-sm text-gray-500 mb-1">Identified on</div>
                <div className="text-sm font-medium">
                  {lesion.tracking?.lastChecked ? new Date(lesion.tracking.lastChecked).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
            </div>
            
            {/* Right Panel - Detailed Information */}
            <div className="md:w-2/3 p-6 border-t md:border-t-0 md:border-l border-gray-200">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="analysis" className="flex items-center gap-1">
                    <PieChart className="w-4 h-4" />
                    <span>Analysis</span>
                  </TabsTrigger>
                  <TabsTrigger value="tracking" className="flex items-center gap-1">
                    <Map className="w-4 h-4" />
                    <span>Tracking</span>
                  </TabsTrigger>
                  <TabsTrigger value="appointments" className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Appointments</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="analysis" className="space-y-6">
                  {/* Classification Confidence */}
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-4">Classification Confidence</h3>
                      <div className="space-y-4">
                        {sortedPredictions.map((prediction, index) => {
                          const colors = getCategoryColor(prediction.label);
                          const isHighest = index === 0;
                          return (
                            <div key={prediction.label} className={`p-3 rounded-lg transition-all ${isHighest ? colors.light : 'hover:bg-gray-50'}`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`font-medium ${isHighest ? colors.text : 'text-gray-700'}`}>
                                  {formatLesionType(prediction.label)}
                                </span>
                                <span className={`text-sm font-bold ${isHighest ? colors.text : 'text-gray-600'}`}>
                                  {(prediction.score * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${colors.bg} transition-all duration-500 ease-out`} 
                                  style={{ width: `${(prediction.score / maxScore) * 100}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Location Info */}
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-4">Location Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="text-sm text-gray-500">Position</div>
                          <div className="flex gap-3">
                            <div className="bg-gray-100 rounded-md px-3 py-2 text-center">
                              <div className="text-xs text-gray-500">X</div>
                              <div className="font-medium">{Math.round(lesion.boundingBox.x * 100)}%</div>
                            </div>
                            <div className="bg-gray-100 rounded-md px-3 py-2 text-center">
                              <div className="text-xs text-gray-500">Y</div>
                              <div className="font-medium">{Math.round(lesion.boundingBox.y * 100)}%</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-gray-500">Size</div>
                          <div className="flex gap-3">
                            <div className="bg-gray-100 rounded-md px-3 py-2 text-center">
                              <div className="text-xs text-gray-500">W</div>
                              <div className="font-medium">{Math.round(lesion.boundingBox.width * 100)}%</div>
                            </div>
                            <div className="bg-gray-100 rounded-md px-3 py-2 text-center">
                              <div className="text-xs text-gray-500">H</div>
                              <div className="font-medium">{Math.round(lesion.boundingBox.height * 100)}%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="tracking">
                  <Card>
                    <CardContent className="pt-6">
                      <LesionTracking lesion={lesion} imageUrl={imageUrl}/>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="appointments">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-4">Schedule Follow-up</h3>
                      <ScheduleAppointment
                        lesionId={lesion.id}
                        classification={lesion.classification}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }