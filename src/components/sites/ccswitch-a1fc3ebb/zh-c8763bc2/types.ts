export interface UsagePart {
  t: string;
  strong?: boolean;
  green?: boolean;
}

export interface Provider {
  name: string;
  url: string;
  active?: boolean;
  accent: string;
  timeAgo?: string;
  usage?: UsagePart[];
}

export interface AppState {
  name: string;
  short: string;
  color: string;
  providers: Provider[];
}

export interface FeatureItem {
  title: string;
  description: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initial: string;
  color: string;
}
