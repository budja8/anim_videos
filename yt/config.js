import { generateRandomViews, generateRandomDate } from './utils.js';

export const GRADIENTS = [
    'linear-gradient(135deg, #a78bfa, #f472b6)', // Violet to Pink
    'linear-gradient(135deg, #fbcfe8, #fecaca)', // Light Pink to Coral
    'linear-gradient(135deg, #818cf8, #c084fc)', // Indigo to Purple
    'linear-gradient(135deg, #a7f3d0, #fde047)', // Emerald to Yellow
    'linear-gradient(135deg, #fcd34d, #f97316)', // Amber to Orange
    'linear-gradient(135deg, #93c5fd, #c084fc)', // Sky to Purple
    'linear-gradient(135deg, #a5f3fc, #818cf8)', // Cyan to Indigo
    'linear-gradient(135deg, #fda4af, #f43f5e)'  // Rose to Deep Rose
];

export const getDefaultCards = () => [
    {
        id: 'placeholder-1',
        title: 'Prueba la longitud del título de tu vídeo de YouTube agregándolo arriba para ver cuándo se corta',
        channelName: 'Nombre del Canal',
        views: generateRandomViews(),
        date: generateRandomDate(),
        thumbnailImage: null,
        thumbnailGradient: GRADIENTS[0],
        avatarImage: null,
        avatarGradient: GRADIENTS[0],
        isPlaceholder: true
    },
    {
        id: 'placeholder-2',
        title: 'Agrega varios títulos de vídeo, uno tras otro, para ver cómo se ven juntos',
        channelName: 'Nombre del Canal',
        views: generateRandomViews(),
        date: generateRandomDate(),
        thumbnailImage: null,
        thumbnailGradient: GRADIENTS[1],
        avatarImage: null,
        avatarGradient: GRADIENTS[1],
        isPlaceholder: true
    },
    {
        id: 'placeholder-3',
        title: 'Asegúrate de que tus palabras clave y el gancho estén al principio de tus títulos',
        channelName: 'Nombre del Canal',
        views: generateRandomViews(),
        date: generateRandomDate(),
        thumbnailImage: null,
        thumbnailGradient: GRADIENTS[2],
        avatarImage: null,
        avatarGradient: GRADIENTS[2],
        isPlaceholder: true
    }
];
