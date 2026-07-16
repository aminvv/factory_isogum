export interface SpotlightStat {
  value: string;
  label: string;
}

export interface SpotlightAnnotation {
  value: string;
  label: string;
  position: 'annotation--1' | 'annotation--2' | 'annotation--3';
}

export interface ProductSpotlightDetails {
  id?: number;
  tag: string;
  title: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  stats: SpotlightStat[];
  annotations: SpotlightAnnotation[];
  isActive: boolean;
}