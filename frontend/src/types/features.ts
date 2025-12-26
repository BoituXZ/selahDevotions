import type { LucideIcon } from "lucide-react";

export type FeatureColor = "emerald" | "amber" | "orange";
export type FeatureLayout = "content-left" | "content-right";

export interface FeatureColorScheme {
    bg: string;
    text: string;
    border: string;
}

export interface Feature {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    color: FeatureColor;
    backgroundImage: string;
    layout: FeatureLayout;
}
