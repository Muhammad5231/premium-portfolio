export interface IAdmin {
  _id?: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "superadmin" | "admin";
  createdAt?: string | Date;
}

export interface ISocialLink {
  platform: string;
  url: string;
  icon?: string;
}

export interface IProfile {
  _id?: string;
  name: string;
  headline: string;
  subheadline: string;
  bio: string;
  personalStatement: string;
  whatIDo: string[];
  howIWork: string[];
  whatIValue: string[];
  avatarUrl?: string;
  location: string;
  availability: {
    status: "available" | "limited" | "unavailable";
    message: string;
  };
  email: string;
  resumeUrl?: string;
  socialLinks: ISocialLink[];
  currentYear: number;
}

export interface IProject {
  _id?: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  tags: string[];
  year: number | string;
  client?: string;
  role: string;
  featured: boolean;
  status: "published" | "draft" | "archived";
  thumbnail: string;
  heroMedia?: string;
  gallery: string[];
  videoUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  challenge?: string;
  approach?: string;
  solution?: string;
  results?: string;
  technologies: string[];
  order: number;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IExperience {
  _id?: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  responsibilities: string[];
  technologies: string[];
  website?: string;
  logo?: string;
  order: number;
  visible: boolean;
}

export interface ICapabilityItem {
  title: string;
  description?: string;
  tags?: string[];
}

export interface ICapability {
  _id?: string;
  category: string;
  subtitle?: string;
  items: ICapabilityItem[];
  order: number;
  visible: boolean;
}

export interface ITestimonial {
  _id?: string;
  person: string;
  role: string;
  company: string;
  quote: string;
  image?: string;
  companyLogo?: string;
  order: number;
  visible: boolean;
}

export interface IMessage {
  _id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "archived";
  ipAddress?: string;
  createdAt?: string | Date;
}

export interface IMedia {
  _id?: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  createdAt?: string | Date;
}

export interface INavigationItem {
  _id?: string;
  label: string;
  url: string;
  order: number;
  visible: boolean;
  isExternal: boolean;
}

export interface ISiteSettings {
  _id?: string;
  siteName: string;
  logoText?: string;
  contactEmail: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  ogImage?: string;
  footerStatement: string;
  copyrightText: string;
  maintenanceMode: boolean;
  analyticsId?: string;
}

export interface IGalleryItem {
  _id?: string;
  title: string;
  slug: string;
  description?: string;
  image: string;
  category: string;
  tags?: string[];
  featured: boolean;
  published: boolean;
  order: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IUser {
  _id?: string;
  name: string;
  username?: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  bio?: string;
  status: "active" | "suspended";
  notificationPreferences?: {
    emailNotifications?: boolean;
    commentReplies?: boolean;
    adminMessages?: boolean;
  };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IBlogCategory {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order: number;
  visible: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IBlogPost {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: {
    name: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  status: "published" | "draft" | "archived" | "scheduled";
  featured: boolean;
  readingTime: number;
  publishedAt?: string | Date;
  scheduledAt?: string | Date;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  order: number;
  views?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IComment {
  _id?: string;
  userId: any; // IUser or ObjectId
  postId: any; // IBlogPost or ObjectId
  parentId?: any; // IComment or ObjectId or null
  content: string;
  status: "pending" | "approved" | "rejected" | "deleted";
  isAdminReply?: boolean;
  adminAuthorName?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IConversation {
  _id?: string;
  user: any; // IUser or ObjectId
  subject: string;
  status: "OPEN" | "CLOSED" | "ARCHIVED";
  lastMessageAt: Date;
  unreadByUser: boolean;
  unreadByAdmin: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IConversationMessage {
  _id?: string;
  conversationId: any;
  senderId: any;
  senderRole: "user" | "admin";
  content: string;
  read: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface INotification {
  _id?: string;
  recipientId: any;
  recipientRole: "user" | "admin";
  type:
    | "COMMENT_REPLY"
    | "COMMENT_APPROVED"
    | "COMMENT_REJECTED"
    | "MESSAGE_RECEIVED"
    | "ADMIN_MESSAGE"
    | "SYSTEM";
  title: string;
  message: string;
  read: boolean;
  readAt?: Date | null;
  link?: string;
  relatedPostId?: any;
  relatedCommentId?: any;
  relatedConversationId?: any;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}



