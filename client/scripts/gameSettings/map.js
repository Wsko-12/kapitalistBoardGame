// 0 - город
// 1 - ничего нельзя строить
// 2 - открыты для стройки
// 3 - дороги
// 4 - постройки
// 5 - транспорт



const RADIUS = 1;
const ROUNDS = 5;
const MAP_NULL_ARR = [
[0,0,0,0,0,0],
[0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0],
[0,0,0,0,0,0],
];
const MAP_CELL_AMOUNT = {
  meadow : 18,
  sand : 9,
  sand_block : 2,
  forest : 12,
  mountain : 3,
  mountain_block : 10,
  swamps : 2,
  swamps_block : 8,
  sea : 4,
  sea_block : 8,
  city : 3,
  MetallPlant:2,
  ChemicalPlant:2,
  PaperPlant:2,
  GlassPlant:2,
  BuildingPlant:2,
  FurniturePlant:2,
};

const MAP_CELL_COLOR = {
    meadow : 0x315C2B,
    sand : 0xFFD639,
    forest: 0x5C4742,
    mountain : 0xEBF2FA,
    swamp : 0xA690A4,
    sea : 0x048BA8,
    city : 0xC83E4D,
};

const MAP_CITIES = [
  'Westown',
  'Northfield',
  'Southcity',
]


export {
  RADIUS,ROUNDS,MAP_NULL_ARR,MAP_CELL_AMOUNT,MAP_CELL_COLOR,MAP_CITIES,

}
