// Datos de departamentos, provincias y distritos de Perú
// Fuente: INEI - Instituto Nacional de Estadística e Informática

export const DEPARTAMENTOS = [
  'AMAZONAS',
  'ANCASH',
  'APURIMAC',
  'AREQUIPA',
  'AYACUCHO',
  'CAJAMARCA',
  'CALLAO',
  'CUSCO',
  'HUANCAVELICA',
  'HUANUCO',
  'ICA',
  'JUNIN',
  'LA LIBERTAD',
  'LAMBAYEQUE',
  'LIMA',
  'LORETO',
  'MADRE DE DIOS',
  'MOQUEGUA',
  'PASCO',
  'PIURA',
  'PUNO',
  'SAN MARTIN',
  'TACNA',
  'TUMBES',
  'UCAYALI'
];

export const PROVINCIAS = {
  AMAZONAS: ['CHACHAPOYAS', 'BAGUA', 'BONGARA', 'CONDORCANQUI', 'LUYA', 'RODRIGUEZ DE MENDOZA', 'UTCUBAMBA'],
  ANCASH: [
    'HUARAZ',
    'AIJA',
    'ANTONIO RAYMONDI',
    'ASUNCION',
    'BOLOGNESI',
    'CARHUAZ',
    'CARLOS FERMIN FITZCARRALD',
    'CASMA',
    'CORONGO',
    'HUARI',
    'HUARMEY',
    'HUAYLAS',
    'MARISCAL LUZURIAGA',
    'OCROS',
    'PALLASCA',
    'POMABAMBA',
    'RECUAY',
    'SANTA',
    'SIHUAS',
    'YUNGAY'
  ],
  APURIMAC: ['ABANCAY', 'ANDAHUAYLAS', 'ANTABAMBA', 'AYMARAES', 'COTABAMBAS', 'CHINCHEROS', 'GRAU'],
  AREQUIPA: ['AREQUIPA', 'CAMANA', 'CARAVELI', 'CASTILLA', 'CAYLLOMA', 'CONDESUYOS', 'ISLAY', 'LA UNION'],
  AYACUCHO: [
    'HUAMANGA',
    'CANGALLO',
    'HUANCA SANCOS',
    'HUANTA',
    'LA MAR',
    'LUCANAS',
    'PARINACOCHAS',
    'PAUCAR DEL SARA SARA',
    'SUCRE',
    'VICTOR FAJARDO',
    'VILCAS HUAMAN'
  ],
  CAJAMARCA: [
    'CAJAMARCA',
    'CAJABAMBA',
    'CELENDIN',
    'CHOTA',
    'CONTUMAZA',
    'CUTERVO',
    'HUALGAYOC',
    'JAEN',
    'SAN IGNACIO',
    'SAN MARCOS',
    'SAN MIGUEL',
    'SAN PABLO',
    'SANTA CRUZ'
  ],
  CALLAO: ['CALLAO'],
  CUSCO: [
    'CUSCO',
    'ACOMAYO',
    'ANTA',
    'CALCA',
    'CANAS',
    'CANCHIS',
    'CHUMBIVILCAS',
    'ESPINAR',
    'LA CONVENCION',
    'PARURO',
    'PAUCARTAMBO',
    'QUISPICANCHI',
    'URUBAMBA'
  ],
  HUANCAVELICA: ['HUANCAVELICA', 'ACOBAMBA', 'ANGARAES', 'CASTROVIRREYNA', 'CHURCAMPA', 'HUAYTARA', 'TAYACAJA'],
  HUANUCO: [
    'HUANUCO',
    'AMBO',
    'DOS DE MAYO',
    'HUACAYBAMBA',
    'HUAMALIES',
    'LEONCIO PRADO',
    'MARAÑON',
    'PACHITEA',
    'PUERTO INCA',
    'LAURICOCHA',
    'YAROWILCA'
  ],
  ICA: ['ICA', 'CHINCHA', 'NAZCA', 'PALPA', 'PISCO'],
  JUNIN: ['HUANCAYO', 'CONCEPCION', 'CHANCHAMAYO', 'JAUJA', 'JUNIN', 'SATIPO', 'TARMA', 'YAULI', 'CHUPACA'],
  'LA LIBERTAD': [
    'TRUJILLO',
    'ASCOPE',
    'BOLIVAR',
    'CHEPEN',
    'JULCAN',
    'OTUZCO',
    'PACASMAYO',
    'PATAZ',
    'SANCHEZ CARRION',
    'SANTIAGO DE CHUCO',
    'GRAN CHIMU',
    'VIRU'
  ],
  LAMBAYEQUE: ['CHICLAYO', 'FERREÑAFE', 'LAMBAYEQUE'],
  LIMA: ['LIMA', 'BARRANCA', 'CAJATAMBO', 'CANTA', 'CAÑETE', 'HUARAL', 'HUAROCHIRI', 'HUAURA', 'OYON', 'YAUYOS'],
  LORETO: ['MAYNAS', 'ALTO AMAZONAS', 'LORETO', 'MARISCAL RAMON CASTILLA', 'REQUENA', 'UCAYALI', 'DATEM DEL MARAÑON', 'PUTUMAYO'],
  'MADRE DE DIOS': ['TAMBOPATA', 'MANU', 'TAHUAMANU'],
  MOQUEGUA: ['MARISCAL NIETO', 'GENERAL SANCHEZ CERRO', 'ILO'],
  PASCO: ['PASCO', 'DANIEL ALCIDES CARRION', 'OXAPAMPA'],
  PIURA: ['PIURA', 'AYABACA', 'HUANCABAMBA', 'MORROPON', 'PAITA', 'SULLANA', 'TALARA', 'SECHURA'],
  PUNO: [
    'PUNO',
    'AZANGARO',
    'CARABAYA',
    'CHUCUITO',
    'EL COLLAO',
    'HUANCANE',
    'LAMPA',
    'MELGAR',
    'MOHO',
    'SAN ANTONIO DE PUTINA',
    'SAN ROMAN',
    'SANDIA',
    'YUNGUYO'
  ],
  'SAN MARTIN': [
    'MOYOBAMBA',
    'BELLAVISTA',
    'EL DORADO',
    'HUALLAGA',
    'LAMAS',
    'MARISCAL CACERES',
    'PICOTA',
    'RIOJA',
    'SAN MARTIN',
    'TOCACHE'
  ],
  TACNA: ['TACNA', 'CANDARAVE', 'JORGE BASADRE', 'TARATA'],
  TUMBES: ['TUMBES', 'CONTRALMIRANTE VILLAR', 'ZARUMILLA'],
  UCAYALI: ['CORONEL PORTILLO', 'ATALAYA', 'PADRE ABAD', 'PURUS']
};

// Distritos principales de Lima (los más usados para envíos)
export const DISTRITOS_LIMA = {
  LIMA: [
    'LIMA',
    'ANCON',
    'ATE',
    'BARRANCO',
    'BREÑA',
    'CARABAYLLO',
    'CHACLACAYO',
    'CHORRILLOS',
    'CIENEGUILLA',
    'COMAS',
    'EL AGUSTINO',
    'INDEPENDENCIA',
    'JESUS MARIA',
    'LA MOLINA',
    'LA VICTORIA',
    'LINCE',
    'LOS OLIVOS',
    'LURIGANCHO',
    'LURIN',
    'MAGDALENA DEL MAR',
    'MIRAFLORES',
    'PACHACAMAC',
    'PUCUSANA',
    'PUEBLO LIBRE',
    'PUENTE PIEDRA',
    'PUNTA HERMOSA',
    'PUNTA NEGRA',
    'RIMAC',
    'SAN BARTOLO',
    'SAN BORJA',
    'SAN ISIDRO',
    'SAN JUAN DE LURIGANCHO',
    'SAN JUAN DE MIRAFLORES',
    'SAN LUIS',
    'SAN MARTIN DE PORRES',
    'SAN MIGUEL',
    'SANTA ANITA',
    'SANTA MARIA DEL MAR',
    'SANTA ROSA',
    'SANTIAGO DE SURCO',
    'SURQUILLO',
    'VILLA EL SALVADOR',
    'VILLA MARIA DEL TRIUNFO'
  ],
  CALLAO: ['CALLAO', 'BELLAVISTA', 'CARMEN DE LA LEGUA REYNOSO', 'LA PERLA', 'LA PUNTA', 'VENTANILLA', 'MI PERU']
};

// Distritos de otras provincias importantes
export const DISTRITOS = {
  ...DISTRITOS_LIMA,
  AREQUIPA: {
    AREQUIPA: [
      'AREQUIPA',
      'ALTO SELVA ALEGRE',
      'CAYMA',
      'CERRO COLORADO',
      'CHARACATO',
      'CHIGUATA',
      'JACOBO HUNTER',
      'JOSE LUIS BUSTAMANTE Y RIVERO',
      'LA JOYA',
      'MARIANO MELGAR',
      'MIRAFLORES',
      'MOLLEBAYA',
      'PAUCARPATA',
      'POCSI',
      'POLOBAYA',
      'QUEQUEÑA',
      'SABANDIA',
      'SACHACA',
      'SAN JUAN DE SIGUAS',
      'SAN JUAN DE TARUCANI',
      'SANTA ISABEL DE SIGUAS',
      'SANTA RITA DE SIGUAS',
      'SOCABAYA',
      'TIABAYA',
      'UCHUMAYO',
      'VITOR',
      'YANAHUARA',
      'YARABAMBA',
      'YURA'
    ]
  },
  'LA LIBERTAD': {
    TRUJILLO: [
      'TRUJILLO',
      'EL PORVENIR',
      'FLORENCIA DE MORA',
      'HUANCHACO',
      'LA ESPERANZA',
      'LAREDO',
      'MOCHE',
      'POROTO',
      'SALAVERRY',
      'SIMBAL',
      'VICTOR LARCO HERRERA'
    ]
  },
  LAMBAYEQUE: {
    CHICLAYO: [
      'CHICLAYO',
      'CHONGOYAPE',
      'ETEN',
      'ETEN PUERTO',
      'JOSE LEONARDO ORTIZ',
      'LA VICTORIA',
      'LAGUNAS',
      'MONSEFU',
      'NUEVA ARICA',
      'OYOTUN',
      'PICSI',
      'PIMENTEL',
      'REQUE',
      'SANTA ROSA',
      'SAÑA',
      'CAYALTI',
      'PATAPO',
      'POMALCA',
      'PUCALA',
      'TUMAN'
    ]
  },
  PIURA: {
    PIURA: [
      'PIURA',
      'CASTILLA',
      'CATACAOS',
      'CURA MORI',
      'EL TALLAN',
      'LA ARENA',
      'LA UNION',
      'LAS LOMAS',
      'TAMBO GRANDE',
      'VEINTISEIS DE OCTUBRE'
    ]
  },
  CUSCO: {
    CUSCO: ['CUSCO', 'CCORCA', 'POROY', 'SAN JERONIMO', 'SAN SEBASTIAN', 'SANTIAGO', 'SAYLLA', 'WANCHAQ']
  },
  ICA: {
    ICA: [
      'ICA',
      'LA TINGUIÑA',
      'LOS AQUIJES',
      'OCUCAJE',
      'PACHACUTEC',
      'PARCONA',
      'PUEBLO NUEVO',
      'SALAS',
      'SAN JOSE DE LOS MOLINOS',
      'SAN JUAN BAUTISTA',
      'SANTIAGO',
      'SUBTANJALLA',
      'TATE',
      'YAUCA DEL ROSARIO'
    ]
  },
  JUNIN: {
    HUANCAYO: [
      'HUANCAYO',
      'CARHUACALLANGA',
      'CHACAPAMPA',
      'CHICCHE',
      'CHILCA',
      'CHONGOS ALTO',
      'CHUPURO',
      'COLCA',
      'CULLHUAS',
      'EL TAMBO',
      'HUACRAPUQUIO',
      'HUALHUAS',
      'HUANCAN',
      'HUASICANCHA',
      'HUAYUCACHI',
      'INGENIO',
      'PARIAHUANCA',
      'PILCOMAYO',
      'PUCARA',
      'QUICHUAY',
      'QUILCAS',
      'SAN AGUSTIN',
      'SAN JERONIMO DE TUNAN',
      'SAÑO',
      'SAPALLANGA',
      'SICAYA',
      'SANTO DOMINGO DE ACOBAMBA',
      'VIQUES'
    ]
  }
};

// Función para obtener provincias de un departamento
export const getProvincias = (departamento) => {
  return PROVINCIAS[departamento] || [];
};

// Función para obtener distritos de una provincia
export const getDistritos = (departamento, provincia) => {
  if (DISTRITOS[departamento] && DISTRITOS[departamento][provincia]) {
    return DISTRITOS[departamento][provincia];
  }
  if (DISTRITOS[provincia]) {
    return DISTRITOS[provincia];
  }
  return [];
};

export default {
  DEPARTAMENTOS,
  PROVINCIAS,
  DISTRITOS,
  getProvincias,
  getDistritos
};
