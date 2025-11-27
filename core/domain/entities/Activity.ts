export interface Activity {
    id: string;
    type: 'payment' | 'reminder' | 'help';
    icon: string;
    title: string;
    description: string;
    time: string;
}
