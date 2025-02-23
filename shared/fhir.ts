export interface FHIRPatient {
  resourceType: "Patient";
  id: string;
  name: Array<{
    given: string[];
    family: string;
  }>;
  birthDate?: string;
}

export interface FHIRDocumentReference {
  resourceType: "DocumentReference";
  id: string;
  content: Array<{
    attachment: {
      contentType: string;
      url: string;
      title?: string;
    };
  }>;
}

export interface SmartContext {
  patient: FHIRPatient;
  documents: FHIRDocumentReference[];
}
