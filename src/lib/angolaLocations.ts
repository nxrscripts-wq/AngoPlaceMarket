export interface Province {
    id: string;
    name: string;
    municipalities: Municipality[];
}

export interface Municipality {
    id: string;
    name: string;
    provinceId: string;
}

export const ANGOLA_PROVINCES: Province[] = [
    {
        id: 'bengo',
        name: 'Bengo',
        municipalities: [
            { id: 'ambriz', name: 'Ambriz', provinceId: 'bengo' },
            { id: 'bula-atumba', name: 'Bula Atumba', provinceId: 'bengo' },
            { id: 'dande', name: 'Dande', provinceId: 'bengo' },
            { id: 'dembos', name: 'Dembos', provinceId: 'bengo' },
            { id: 'nambuangongo', name: 'Nambuangongo', provinceId: 'bengo' },
            { id: 'pango-aluquem', name: 'Pango Aluquém', provinceId: 'bengo' },
        ],
    },
    {
        id: 'benguela',
        name: 'Benguela',
        municipalities: [
            { id: 'benguela-city', name: 'Benguela', provinceId: 'benguela' },
            { id: 'balombo', name: 'Balombo', provinceId: 'benguela' },
            { id: 'baia-farta', name: 'Baía Farta', provinceId: 'benguela' },
            { id: 'bocoio', name: 'Bocoio', provinceId: 'benguela' },
            { id: 'caimbambo', name: 'Caimbambo', provinceId: 'benguela' },
            { id: 'catumbela', name: 'Catumbela', provinceId: 'benguela' },
            { id: 'chongoroi', name: 'Chongoroi', provinceId: 'benguela' },
            { id: 'cubal', name: 'Cubal', provinceId: 'benguela' },
            { id: 'ganda', name: 'Ganda', provinceId: 'benguela' },
            { id: 'lobito', name: 'Lobito', provinceId: 'benguela' },
        ],
    },
    {
        id: 'bie',
        name: 'Bié',
        municipalities: [
            { id: 'andulo', name: 'Andulo', provinceId: 'bie' },
            { id: 'camacupa', name: 'Camacupa', provinceId: 'bie' },
            { id: 'catabola', name: 'Catabola', provinceId: 'bie' },
            { id: 'chinguar', name: 'Chinguar', provinceId: 'bie' },
            { id: 'chitembo', name: 'Chitembo', provinceId: 'bie' },
            { id: 'cuemba', name: 'Cuemba', provinceId: 'bie' },
            { id: 'cunhinga', name: 'Cunhinga', provinceId: 'bie' },
            { id: 'cuito', name: 'Cuíto', provinceId: 'bie' },
            { id: 'nharea', name: 'Nharea', provinceId: 'bie' },
        ],
    },
    {
        id: 'cabinda',
        name: 'Cabinda',
        municipalities: [
            { id: 'belize', name: 'Belize', provinceId: 'cabinda' },
            { id: 'buco-zau', name: 'Buco-Zau', provinceId: 'cabinda' },
            { id: 'cabinda-city', name: 'Cabinda', provinceId: 'cabinda' },
            { id: 'cacongo', name: 'Cacongo', provinceId: 'cabinda' },
        ],
    },
    {
        id: 'cuando-cubango',
        name: 'Cuando Cubango',
        municipalities: [
            { id: 'calai', name: 'Calai', provinceId: 'cuando-cubango' },
            { id: 'cuangar', name: 'Cuangar', provinceId: 'cuando-cubango' },
            { id: 'cuchi', name: 'Cuchi', provinceId: 'cuando-cubango' },
            { id: 'cuito-cuanavale', name: 'Cuito Cuanavale', provinceId: 'cuando-cubango' },
            { id: 'dirico', name: 'Dirico', provinceId: 'cuando-cubango' },
            { id: 'mavinga', name: 'Mavinga', provinceId: 'cuando-cubango' },
            { id: 'menongue', name: 'Menongue', provinceId: 'cuando-cubango' },
            { id: 'nancova', name: 'Nancova', provinceId: 'cuando-cubango' },
            { id: 'rivungo', name: 'Rivungo', provinceId: 'cuando-cubango' },
        ],
    },
    {
        id: 'cuanza-norte',
        name: 'Cuanza Norte',
        municipalities: [
            { id: 'ambaca', name: 'Ambaca', provinceId: 'cuanza-norte' },
            { id: 'banga', name: 'Banga', provinceId: 'cuanza-norte' },
            { id: 'bolongongo', name: 'Bolongongo', provinceId: 'cuanza-norte' },
            { id: 'cambambe', name: 'Cambambe', provinceId: 'cuanza-norte' },
            { id: 'cazengo', name: 'Cazengo', provinceId: 'cuanza-norte' },
            { id: 'golungo-alto', name: 'Golungo Alto', provinceId: 'cuanza-norte' },
            { id: 'gonguembo', name: 'Gonguembo', provinceId: 'cuanza-norte' },
            { id: 'lucala', name: 'Lucala', provinceId: 'cuanza-norte' },
            { id: 'quiculungo', name: 'Quiculungo', provinceId: 'cuanza-norte' },
            { id: 'samba-caju', name: 'Samba Cajú', provinceId: 'cuanza-norte' },
        ],
    },
    {
        id: 'cuanza-sul',
        name: 'Cuanza Sul',
        municipalities: [
            { id: 'amboim', name: 'Amboim', provinceId: 'cuanza-sul' },
            { id: 'cassongue', name: 'Cassongue', provinceId: 'cuanza-sul' },
            { id: 'cela', name: 'Cela', provinceId: 'cuanza-sul' },
            { id: 'conda', name: 'Conda', provinceId: 'cuanza-sul' },
            { id: 'ebo', name: 'Ebo', provinceId: 'cuanza-sul' },
            { id: 'libolo', name: 'Libolo', provinceId: 'cuanza-sul' },
            { id: 'mussende', name: 'Mussende', provinceId: 'cuanza-sul' },
            { id: 'porto-amboim', name: 'Porto Amboim', provinceId: 'cuanza-sul' },
            { id: 'quibala', name: 'Quibala', provinceId: 'cuanza-sul' },
            { id: 'quilenda', name: 'Quilenda', provinceId: 'cuanza-sul' },
            { id: 'seles', name: 'Seles', provinceId: 'cuanza-sul' },
            { id: 'sumbe', name: 'Sumbe', provinceId: 'cuanza-sul' },
        ],
    },
    {
        id: 'cunene',
        name: 'Cunene',
        municipalities: [
            { id: 'cahama', name: 'Cahama', provinceId: 'cunene' },
            { id: 'cuanhama', name: 'Cuanhama', provinceId: 'cunene' },
            { id: 'curoca', name: 'Curoca', provinceId: 'cunene' },
            { id: 'cuvelai', name: 'Cuvelai', provinceId: 'cunene' },
            { id: 'namacunde', name: 'Namacunde', provinceId: 'cunene' },
            { id: 'ombadja', name: 'Ombadja', provinceId: 'cunene' },
        ],
    },
    {
        id: 'huambo',
        name: 'Huambo',
        municipalities: [
            { id: 'bailundo', name: 'Bailundo', provinceId: 'huambo' },
            { id: 'caala', name: 'Caála', provinceId: 'huambo' },
            { id: 'cachiungo', name: 'Cachiungo', provinceId: 'huambo' },
            { id: 'chinjenje', name: 'Chinjenje', provinceId: 'huambo' },
            { id: 'ecunha', name: 'Ecunha', provinceId: 'huambo' },
            { id: 'huambo-city', name: 'Huambo', provinceId: 'huambo' },
            { id: 'londuimbali', name: 'Londuimbali', provinceId: 'huambo' },
            { id: 'longonjo', name: 'Longonjo', provinceId: 'huambo' },
            { id: 'mungo', name: 'Mungo', provinceId: 'huambo' },
            { id: 'tchicala-tcholoanga', name: 'Tchicala-Tcholoanga', provinceId: 'huambo' },
            { id: 'ucuma', name: 'Ucuma', provinceId: 'huambo' },
        ],
    },
    {
        id: 'huila',
        name: 'Huíla',
        municipalities: [
            { id: 'caconda', name: 'Caconda', provinceId: 'huila' },
            { id: 'cacula', name: 'Cacula', provinceId: 'huila' },
            { id: 'caluquembe', name: 'Caluquembe', provinceId: 'huila' },
            { id: 'chiange', name: 'Chiange', provinceId: 'huila' },
            { id: 'chibia', name: 'Chibia', provinceId: 'huila' },
            { id: 'chicomba', name: 'Chicomba', provinceId: 'huila' },
            { id: 'chipindo', name: 'Chipindo', provinceId: 'huila' },
            { id: 'cuvango', name: 'Cuvango', provinceId: 'huila' },
            { id: 'gambos', name: 'Gambos', provinceId: 'huila' },
            { id: 'humpata', name: 'Humpata', provinceId: 'huila' },
            { id: 'jamba', name: 'Jamba', provinceId: 'huila' },
            { id: 'lubango', name: 'Lubango', provinceId: 'huila' },
            { id: 'matala', name: 'Matala', provinceId: 'huila' },
            { id: 'quilengues', name: 'Quilengues', provinceId: 'huila' },
        ],
    },
    {
        id: 'luanda',
        name: 'Luanda',
        municipalities: [
            { id: 'belas', name: 'Belas', provinceId: 'luanda' },
            { id: 'cacuaco', name: 'Cacuaco', provinceId: 'luanda' },
            { id: 'cazenga', name: 'Cazenga', provinceId: 'luanda' },
            { id: 'ícolo-e-bengo', name: 'Ícolo e Bengo', provinceId: 'luanda' },
            { id: 'kilamba-kiaxi', name: 'Kilamba Kiaxi', provinceId: 'luanda' },
            { id: 'luanda-city', name: 'Luanda', provinceId: 'luanda' },
            { id: 'quicama', name: 'Quiçama', provinceId: 'luanda' },
            { id: 'talatona', name: 'Talatona', provinceId: 'luanda' },
            { id: 'viana', name: 'Viana', provinceId: 'luanda' },
        ],
    },
    {
        id: 'lunda-norte',
        name: 'Lunda Norte',
        municipalities: [
            { id: 'cambulo', name: 'Cambulo', provinceId: 'lunda-norte' },
            { id: 'capenda-camulemba', name: 'Capenda-Camulemba', provinceId: 'lunda-norte' },
            { id: 'caungula', name: 'Caungula', provinceId: 'lunda-norte' },
            { id: 'chitato', name: 'Chitato', provinceId: 'lunda-norte' },
            { id: 'cuango', name: 'Cuango', provinceId: 'lunda-norte' },
            { id: 'cuilo', name: 'Cuílo', provinceId: 'lunda-norte' },
            { id: 'lubalo', name: 'Lubalo', provinceId: 'lunda-norte' },
            { id: 'lucapa', name: 'Lucapa', provinceId: 'lunda-norte' },
            { id: 'xá-muteba', name: 'Xá-Muteba', provinceId: 'lunda-norte' },
        ],
    },
    {
        id: 'lunda-sul',
        name: 'Lunda Sul',
        municipalities: [
            { id: 'cacolo', name: 'Cacolo', provinceId: 'lunda-sul' },
            { id: 'dala', name: 'Dala', provinceId: 'lunda-sul' },
            { id: 'muconda', name: 'Muconda', provinceId: 'lunda-sul' },
            { id: 'saurimo', name: 'Saurimo', provinceId: 'lunda-sul' },
        ],
    },
    {
        id: 'malanje',
        name: 'Malanje',
        municipalities: [
            { id: 'cacuso', name: 'Cacuso', provinceId: 'malanje' },
            { id: 'calandula', name: 'Calandula', provinceId: 'malanje' },
            { id: 'cambundi-catembo', name: 'Cambundi-Catembo', provinceId: 'malanje' },
            { id: 'cangandala', name: 'Cangandala', provinceId: 'malanje' },
            { id: 'caombo', name: 'Caombo', provinceId: 'malanje' },
            { id: 'cuaba-nzoji', name: 'Cuaba Nzoji', provinceId: 'malanje' },
            { id: 'cunda-dia-baze', name: 'Cunda-Dia-Baze', provinceId: 'malanje' },
            { id: 'luquembo', name: 'Luquembo', provinceId: 'malanje' },
            { id: 'malanje-city', name: 'Malanje', provinceId: 'malanje' },
            { id: 'marimba', name: 'Marimba', provinceId: 'malanje' },
            { id: 'massango', name: 'Massango', provinceId: 'malanje' },
            { id: 'mucari', name: 'Mucari', provinceId: 'malanje' },
            { id: 'quela', name: 'Quela', provinceId: 'malanje' },
            { id: 'quirima', name: 'Quirima', provinceId: 'malanje' },
        ],
    },
    {
        id: 'moxico',
        name: 'Moxico',
        municipalities: [
            { id: 'alto-zambeze', name: 'Alto Zambeze', provinceId: 'moxico' },
            { id: 'bundas', name: 'Bundas', provinceId: 'moxico' },
            { id: 'camanongue', name: 'Camanongue', provinceId: 'moxico' },
            { id: 'cameia', name: 'Cameia', provinceId: 'moxico' },
            { id: 'leua', name: 'Léua', provinceId: 'moxico' },
            { id: 'luacano', name: 'Luacano', provinceId: 'moxico' },
            { id: 'luau', name: 'Luau', provinceId: 'moxico' },
            { id: 'luchazes', name: 'Luchazes', provinceId: 'moxico' },
            { id: 'luena', name: 'Luena', provinceId: 'moxico' },
        ],
    },
    {
        id: 'namibe',
        name: 'Namibe',
        municipalities: [
            { id: 'bibala', name: 'Bibala', provinceId: 'namibe' },
            { id: 'camucuio', name: 'Camucuio', provinceId: 'namibe' },
            { id: 'namibe-city', name: 'Namibe', provinceId: 'namibe' },
            { id: 'tombua', name: 'Tômbua', provinceId: 'namibe' },
            { id: 'virei', name: 'Virei', provinceId: 'namibe' },
        ],
    },
    {
        id: 'uige',
        name: 'Uíge',
        municipalities: [
            { id: 'alto-cauale', name: 'Alto Cauale', provinceId: 'uige' },
            { id: 'ambuila', name: 'Ambuíla', provinceId: 'uige' },
            { id: 'bembe', name: 'Bembe', provinceId: 'uige' },
            { id: 'buengas', name: 'Buengas', provinceId: 'uige' },
            { id: 'bungo', name: 'Bungo', provinceId: 'uige' },
            { id: 'damba', name: 'Damba', provinceId: 'uige' },
            { id: 'macocola', name: 'Macocola', provinceId: 'uige' },
            { id: 'milunga', name: 'Milunga', provinceId: 'uige' },
            { id: 'mucaba', name: 'Mucaba', provinceId: 'uige' },
            { id: 'negage', name: 'Negage', provinceId: 'uige' },
            { id: 'puri', name: 'Puri', provinceId: 'uige' },
            { id: 'quitexe', name: 'Quitexe', provinceId: 'uige' },
            { id: 'sanza-pombo', name: 'Sanza Pombo', provinceId: 'uige' },
            { id: 'songo', name: 'Songo', provinceId: 'uige' },
            { id: 'uige-city', name: 'Uíge', provinceId: 'uige' },
            { id: 'zombo', name: 'Zombo', provinceId: 'uige' },
        ],
    },
    {
        id: 'zaire',
        name: 'Zaire',
        municipalities: [
            { id: 'cuimba', name: 'Cuimba', provinceId: 'zaire' },
            { id: 'mbanza-congo', name: 'M\'Banza Congo', provinceId: 'zaire' },
            { id: 'noqui', name: 'Nóqui', provinceId: 'zaire' },
            { id: 'nzeto', name: 'N\'Zeto', provinceId: 'zaire' },
            { id: 'soyo', name: 'Soyo', provinceId: 'zaire' },
            { id: 'tomboco', name: 'Tomboco', provinceId: 'zaire' },
        ],
    },
];

export const getProvinceById = (id: string): Province | undefined => {
    return ANGOLA_PROVINCES.find((p) => p.id === id);
};

export const getMunicipalitiesByProvince = (provinceId: string): Municipality[] => {
    const province = getProvinceById(provinceId);
    return province?.municipalities || [];
};
