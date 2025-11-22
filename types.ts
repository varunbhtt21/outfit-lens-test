export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export enum ImageType {
  USER_PHOTO = 'user_photo',
  CLOTHING_PHOTO = 'clothing_photo',
  GENERATED_RESULT = 'generated_result'
}

export interface ImageModel {
  id: string;
  url: string;
  image_type: ImageType;
  file_size: number;
  width: number;
  height: number;
  created_at: string;
}

export enum GenerationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface Generation {
  id: string;
  user_id: string;
  user_photo: ImageModel;
  clothing_photo: ImageModel;
  result_image?: ImageModel;
  status: GenerationStatus;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}
