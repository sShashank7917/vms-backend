export interface FaceMatchResponse {
  status: string;
  visitor?: {
    visitor_id: number;
    full_name: string;
    phone: string;
    email: string;
    nationality: string;
    company: string;
  };
  distance?: number;
  message?: string;
}
