export interface UnsplashTag {
  id: string;
  tag: string; // Query sent to Unsplash API
  labelKey: string; // i18n label key or default name
  descKey: string; // i18n description key
}

export interface UnsplashCategory {
  id: string;
  nameKey: string;
  icon: string;
  tags: UnsplashTag[];
}

export const UNSPLASH_CATEGORIES: UnsplashCategory[] = [
  {
    id: 'nature',
    nameKey: 'topicNature',
    icon: 'Trees',
    tags: [
      { id: 'nature', tag: 'nature', labelKey: 'tagNature', descKey: 'descNature' },
      { id: 'landscape', tag: 'landscape', labelKey: 'tagLandscape', descKey: 'descLandscape' },
      { id: 'mountain', tag: 'mountain', labelKey: 'tagMountain', descKey: 'descMountain' },
      { id: 'lake', tag: 'lake', labelKey: 'tagLake', descKey: 'descLake' },
      { id: 'forest', tag: 'forest', labelKey: 'tagForest', descKey: 'descForest' },
      { id: 'ocean', tag: 'ocean', labelKey: 'tagOcean', descKey: 'descOcean' },
      { id: 'waterfall', tag: 'waterfall', labelKey: 'tagWaterfall', descKey: 'descWaterfall' },
      { id: 'river', tag: 'river', labelKey: 'tagRiver', descKey: 'descRiver' },
      { id: 'desert', tag: 'desert', labelKey: 'tagDesert', descKey: 'descDesert' },
      { id: 'sunset', tag: 'sunset', labelKey: 'tagSunset', descKey: 'descSunset' },
      { id: 'sky', tag: 'sky', labelKey: 'tagSky', descKey: 'descSky' },
      { id: 'flowers', tag: 'flowers', labelKey: 'tagFlowers', descKey: 'descFlowers' },
      { id: 'snow', tag: 'snow', labelKey: 'tagSnow', descKey: 'descSnow' },
    ],
  },
  {
    id: 'city',
    nameKey: 'topicCity',
    icon: 'Building2',
    tags: [
      { id: 'cityscape', tag: 'cityscape', labelKey: 'tagCityscape', descKey: 'descCityscape' },
      { id: 'night_city', tag: 'night city', labelKey: 'tagNightCity', descKey: 'descNightCity' },
      { id: 'architecture', tag: 'architecture', labelKey: 'tagArchitecture', descKey: 'descArchitecture' },
      { id: 'street', tag: 'street', labelKey: 'tagStreet', descKey: 'descStreet' },
      { id: 'bridge', tag: 'bridge', labelKey: 'tagBridge', descKey: 'descBridge' },
      { id: 'skyscraper', tag: 'skyscraper', labelKey: 'tagSkyscraper', descKey: 'descSkyscraper' },
      { id: 'urban', tag: 'urban', labelKey: 'tagUrban', descKey: 'descUrban' },
      { id: 'neon', tag: 'neon street', labelKey: 'tagNeon', descKey: 'descNeon' },
    ],
  },
  {
    id: 'abstract',
    nameKey: 'topicAbstract',
    icon: 'Sparkles',
    tags: [
      { id: 'abstract', tag: 'abstract', labelKey: 'tagAbstract', descKey: 'descAbstract' },
      { id: 'minimalism', tag: 'minimalism', labelKey: 'tagMinimalism', descKey: 'descMinimalism' },
      { id: 'textures', tag: 'texture pattern', labelKey: 'tagTextures', descKey: 'descTextures' },
      { id: 'gradient', tag: 'gradient abstract', labelKey: 'tagGradient', descKey: 'descGradient' },
      { id: '3d_render', tag: '3d render', labelKey: 'tag3dRender', descKey: 'desc3dRender' },
      { id: 'dark_mode', tag: 'dark wallpaper', labelKey: 'tagDarkMode', descKey: 'descDarkMode' },
    ],
  },
  {
    id: 'space',
    nameKey: 'topicSpace',
    icon: 'Rocket',
    tags: [
      { id: 'space', tag: 'space', labelKey: 'tagSpace', descKey: 'descSpace' },
      { id: 'galaxy', tag: 'galaxy', labelKey: 'tagGalaxy', descKey: 'descGalaxy' },
      { id: 'astronomy', tag: 'astronomy', labelKey: 'tagAstronomy', descKey: 'descAstronomy' },
      { id: 'night_sky', tag: 'night sky stars', labelKey: 'tagNightSky', descKey: 'descNightSky' },
      { id: 'aurora', tag: 'aurora borealis', labelKey: 'tagAurora', descKey: 'descAurora' },
      { id: 'planets', tag: 'planets universe', labelKey: 'tagPlanets', descKey: 'descPlanets' },
    ],
  },
  {
    id: 'cozy',
    nameKey: 'topicCozy',
    icon: 'Coffee',
    tags: [
      { id: 'cozy', tag: 'cozy aesthetic', labelKey: 'tagCozy', descKey: 'descCozy' },
      { id: 'interior', tag: 'interior design', labelKey: 'tagInterior', descKey: 'descInterior' },
      { id: 'coffee', tag: 'coffee aesthetic', labelKey: 'tagCoffee', descKey: 'descCoffee' },
      { id: 'plants', tag: 'plants greenery', labelKey: 'tagPlants', descKey: 'descPlants' },
      { id: 'books', tag: 'books library', labelKey: 'tagBooks', descKey: 'descBooks' },
      { id: 'calm', tag: 'peaceful calm', labelKey: 'tagCalm', descKey: 'descCalm' },
    ],
  },
  {
    id: 'travel',
    nameKey: 'topicTravel',
    icon: 'Compass',
    tags: [
      { id: 'travel', tag: 'travel adventure', labelKey: 'tagTravel', descKey: 'descTravel' },
      { id: 'japan', tag: 'japan aesthetic', labelKey: 'tagJapan', descKey: 'descJapan' },
      { id: 'europe', tag: 'europe landscape', labelKey: 'tagEurope', descKey: 'descEurope' },
      { id: 'island', tag: 'tropical island', labelKey: 'tagIsland', descKey: 'descIsland' },
      { id: 'road_trip', tag: 'road trip highway', labelKey: 'tagRoadTrip', descKey: 'descRoadTrip' },
      { id: 'camping', tag: 'camping outdoors', labelKey: 'tagCamping', descKey: 'descCamping' },
    ],
  },
];
