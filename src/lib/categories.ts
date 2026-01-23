import {
    Cpu,
    HardDrive,
    Laptop,
    Monitor,
    Keyboard,
    Mouse,
    Gamepad2,
    MemoryStick,
    CircuitBoard,
    Tv,
    Shirt,
    WashingMachine,
    Car,
    Home,
    Smartphone,
    Briefcase,
    Palette,
    History,
    Luggage,
    Baby,
    Dices,
    Coffee,
    Music,
    Watch,
    Book,
    Sun,
    Settings,
    Dog,
    Hammer,
    Sparkles,
    Trash2,
    Footprints,
    MoreHorizontal,
    Armchair,
    Key,
    type LucideIcon,
} from 'lucide-react';

export interface Category {
    id: string;
    name: string;
    icon: LucideIcon;
    color: string;
    subCategories?: SubCategory[];
}

export interface SubCategory {
    id: string;
    name: string;
    parentId: string;
}

export const MARKETPLACE_CATEGORIES: Category[] = [
    {
        id: 'vestuario-feminino',
        name: 'Vestuário Feminino',
        icon: Shirt,
        color: 'bg-pink-500/10 text-pink-500 hover:bg-pink-500 hover:text-white',
    },
    {
        id: 'vestuario-masculino',
        name: 'Vestuário Masculino',
        icon: Shirt,
        color: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white',
    },
    {
        id: 'electronics',
        name: 'Eletrónicos',
        icon: Smartphone,
        color: 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white',
    },
    {
        id: 'hardware',
        name: 'Hardware & PC',
        icon: Cpu,
        color: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white',
    },
    {
        id: 'imoveis',
        name: 'Imóveis',
        icon: Home,
        color: 'bg-green-600/10 text-green-600 hover:bg-green-600 hover:text-white',
    },
    {
        id: 'veiculos',
        name: 'Veículos',
        icon: Car,
        color: 'bg-slate-700/10 text-slate-700 hover:bg-slate-700 hover:text-white',
    },
    {
        id: 'arrendamento',
        name: 'Arrendamento',
        icon: Key,
        color: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white',
    },
    {
        id: 'mobiliario',
        name: 'Mobiliário',
        icon: Armchair,
        color: 'bg-amber-700/10 text-amber-700 hover:bg-amber-700 hover:text-white',
    },
    {
        id: 'artes-artesanato',
        name: 'Artes e Artesanato',
        icon: Palette,
        color: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white',
    },
    {
        id: 'colecionaveis',
        name: 'Colecionáveis',
        icon: History,
        color: 'bg-yellow-600/10 text-yellow-600 hover:bg-yellow-600 hover:text-white',
    },
    {
        id: 'bagagem-malas',
        name: 'Bagagem e Malas',
        icon: Luggage,
        color: 'bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500 hover:text-white',
    },
    {
        id: 'bebe',
        name: 'Bebé',
        icon: Baby,
        color: 'bg-sky-400/10 text-sky-400 hover:bg-sky-400 hover:text-white',
    },
    {
        id: 'brinquedos-jogos',
        name: 'Brinquedos e Jogos',
        icon: Dices,
        color: 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white',
    },
    {
        id: 'casa-cozinha',
        name: 'Casa e Cozinha',
        icon: Coffee,
        color: 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white',
    },
    {
        id: 'instrumentos-musicais',
        name: 'Instrumentos Musicais',
        icon: Music,
        color: 'bg-violet-600/10 text-violet-600 hover:bg-violet-600 hover:text-white',
    },
    {
        id: 'joias-relogios',
        name: 'Jóias e Relógios',
        icon: Watch,
        color: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white',
    },
    {
        id: 'livros-filmes-musica',
        name: 'Livros, Filmes e Música',
        icon: Book,
        color: 'bg-cyan-600/10 text-cyan-600 hover:bg-cyan-600 hover:text-white',
    },
    {
        id: 'patio-jardim',
        name: 'Pátio e Jardim',
        icon: Sun,
        color: 'bg-lime-600/10 text-lime-600 hover:bg-lime-600 hover:text-white',
    },
    {
        id: 'pecas-automoveis',
        name: 'Peças para Automóveis',
        icon: Settings,
        color: 'bg-zinc-700/10 text-zinc-700 hover:bg-zinc-700 hover:text-white',
    },
    {
        id: 'produtos-animais',
        name: 'Produtos para Animais',
        icon: Dog,
        color: 'bg-orange-600/10 text-orange-600 hover:bg-orange-600 hover:text-white',
    },
    {
        id: 'remodelacao-casa',
        name: 'Remodelação de Casa',
        icon: Hammer,
        color: 'bg-amber-600/10 text-amber-600 hover:bg-amber-600 hover:text-white',
    },
    {
        id: 'saude-beleza',
        name: 'Saúde e Beleza',
        icon: Sparkles,
        color: 'bg-pink-400/10 text-pink-400 hover:bg-pink-400 hover:text-white',
    },
    {
        id: 'venda-garagem',
        name: 'Venda de Garagem',
        icon: Trash2,
        color: 'bg-neutral-500/10 text-neutral-500 hover:bg-neutral-500 hover:text-white',
    },
    {
        id: 'infantil',
        name: 'Criança e Bebé',
        icon: Footprints,
        color: 'bg-indigo-400/10 text-indigo-400 hover:bg-indigo-400 hover:text-white',
    },
    {
        id: 'diversos',
        name: 'Diversos',
        icon: MoreHorizontal,
        color: 'bg-gray-500/10 text-gray-500 hover:bg-gray-500 hover:text-white',
    },
];

export const getCategoryById = (id: string): Category | undefined => {
    return MARKETPLACE_CATEGORIES.find((cat) => cat.id === id);
};

export const getSubCategoryById = (id: string): SubCategory | undefined => {
    for (const category of MARKETPLACE_CATEGORIES) {
        const sub = category.subCategories?.find((s) => s.id === id);
        if (sub) return sub;
    }
    return undefined;
};

export const getCategoryNameMap = (): Record<string, string> => {
    return MARKETPLACE_CATEGORIES.reduce(
        (acc, cat) => {
            acc[cat.id] = cat.name;
            return acc;
        },
        {} as Record<string, string>
    );
};
