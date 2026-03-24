export interface OnboardingData {
    id: string;
    title: string;
    description: string;
    icon: 'shield' | 'chart' | 'smile';
    color: string;
}

export const ONBOARDING_DATA: OnboardingData[] = [
    {
        id: '1',
        title: 'Make Confident Decisions',
        description: 'Know exactly how a purchase will impact your financial stability before you commit.',
        icon: 'shield',
        color: 'green',
    },
    {
        id: '2',
        title: 'See Your Future',
        description: 'Visualize recovery time, savings impact, and monthly flexibility in seconds.',
        icon: 'chart',
        color: 'blue',
    },
    {
        id: '3',
        title: 'No Regrets, No Stress',
        description: 'Understand if a purchase is Safe, Tight, or Risky—without judgment or pressure.',
        icon: 'smile',
        color: 'orange',
    },
];
