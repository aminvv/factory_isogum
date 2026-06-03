// comment.model.ts
export interface CommentUser {
  firstName?: string;
  phone: string;
}

export interface CommentAdmin {
  fullName?: string;
}

export interface ProductComment {
  id: number;
  text: string;
  rating: number;
  parentId: number | null;
  accepted: boolean;
  created_at: Date;
  userId?: number | null;
  AdminId?: number | null;
  user?: CommentUser;
  admin?: CommentAdmin;
  children?: ProductComment[];
}





export interface CommentStats{
  averageRating:number
  total:number
}