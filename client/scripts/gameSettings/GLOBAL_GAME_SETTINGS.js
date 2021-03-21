const FACTORIES = {
  waterFactory: {
    parent: false,
    product: 'water',
    storage: 3,
    process: 2,
    coast: 2000,
    salary: 1000,
    modernization: 'fishFactory',
    count: 2,
    type:'factory',
  },
  fishFactory: {
    parent: 'waterFactory',
    product: 'fish',
    storage: false,
    process: 3,
    coast: 2000,
    salary: 1000,
    child: false,
    type:'modernization',

  },


  sandFactory: {
    parent: false,
    product: 'sand',
    storage: 3,
    process: 3,
    coast: 2000,
    salary: 1000,
    child: 'cementFactory',
    count: 2,
    type:'factory',

  },
  cementFactory: {
    parent: 'sandFactory',
    product: 'cement',
    storage: 3,
    process: 2,
    coast: 3000,
    salary: 1200,
    child: false,
    type:'modernization',

  },

  woodFactory: {
    parent: false,
    product: 'wood',
    storage: 3,
    process: 3,
    coast: 2000,
    salary: 1000,
    child: 'coalFactory',
    count: 2,
    type:'factory',

  },
  coalFactory: {
    parent: 'woodFactory',
    product: 'coal',
    storage: 3,
    process: 2,
    coast: 3000,
    salary: 1200,
    child: false,
    type:'modernization',

  },

  ironOreFactory: {
    parent: false,
    product: 'ironOre',
    storage: 4,
    process: 1,
    coast: 2000,
    salary: 1000,
    child: 'steelFactory',
    count: 2,
    type:'factory',

  },
  steelFactory: {
    parent: 'ironFactory',
    product: 'steel',
    storage: 3,
    process: 2,
    coast: 3000,
    salary: 1200,
    child: false,
    type:'modernization',

  },


  oilFactory: {
    parent: false,
    product: 'oil',
    storage: 4,
    process: 1,
    coast: 3000,
    salary: 1200,
    child: 'fuelFactory',
    count: 2,
    type:'factory',

  },
  fuelFactory: {
    parent: 'oilFactory',
    product: 'fuel',
    storage: 3,
    process: 3,
    coast: 3000,
    salary: 1200,
    child: false,
    type:'modernization',
  },

  instrumentsFactory:{
    parent: false,
    product: 'instruments',
    storage: 2,
    process: 3,
    coast: 3000,
    salary: 1200,
    child: false,
    type:'plant',
  },

  paperFactory:{
    parent: false,
    product: 'paper',
    storage: 2,
    process: 1,
    coast: 4000,
    salary: 1400,
    child: false,
    type:'plant',
  },

  glassFactory:{
    parent: false,
    product: 'glass',
    storage: 2,
    process: 1,
    coast: 4000,
    salary: 1400,
    child: false,
    type:'plant',
  },

  buildingMaterialFactory:{
    parent: false,
    product: 'buildingMaterial',
    storage: 2,
    process: 2,
    coast: 5000,
    salary: 1600,
    child: false,
    type:'plant',
  },

  furnitureFactory:{
    parent: false,
    product: 'furniture',
    storage: 2,
    process: 1,
    coast: 5000,
    salary: 1600,
    child: false,
    type:'plant',
  },

  tireFactory:{
    parent: false,
    product: 'tire',
    storage: 2,
    process: 1,
    coast: 4000,
    salary: 1400,
    child: false,
    type:'plant',
  },





};


const PRODUCTS = {
  water: {
    prodaction: 'waterFactory',
    ingridients: [null],
    profit:400,
    
  },
  sand: {
    ingridients: [null],
    prodaction: 'sandFactory',
    profit:400,

  },
  wood: {
    ingridients: [null],
    prodaction: 'woodFactory',
    profit:400,

  },
  ironOre: {
    ingridients: [null],
    prodaction: 'ironOreFactory',
    profit:400,

  },
  oil: {
    ingridients: [null],
    prodaction: 'oilFactory',
    profit:400,

  },

  fish: {
    ingridients: [null],
    prodaction: 'fishFactory',
    profit:400,

  },







  cement: {
    ingridients: ['sand'],
    prodaction: 'cementFactory',
    profit:900,

  },
  coal: {
    ingridients: ['wood'],
    prodaction: 'coalFactory',
    profit:900,

  },
  steel: {
    ingridients: ['ironOre'],
    prodaction: 'steelFactory',
    profit:900,

  },
  fuel: {
    ingridients: ['oil'],
    prodaction: 'fuelFactory',
    profit:900,


  },

  instruments: {
    ingridients: ['steel'],
    prodaction: 'instrumentsFactory',
    profit:900,

  },
  paper: {
    ingridients: ['wood', 'water'],
    prodaction: 'paperFactory',
    profit:1600,



  },
  glass: {
    ingridients: ['sand', 'coal'],
    prodaction: 'glassFactory',
    profit:1600,



  },
  buildingMaterial: {
    ingridients: ['cement', 'steel'],
    prodaction: 'buildingMaterialFactory',
    profit:2500,


  },
  furniture: {
    ingridients: ['wood', 'steel'],
    prodaction: 'furnitureFactory',
    profit:2500,



  },
  tire: {
    ingridients: ['oil'],
    prodaction: 'tireFactory',
    profit:7900,

  },

};



function getCoast(product){
  let coast = 0;
  // PRODUCTS[product]
  if(PRODUCTS[product].ingridients[0] === null){
    coast += FACTORIES[PRODUCTS[product].prodaction].process * FACTORIES[PRODUCTS[product].prodaction].salary + PRODUCTS[product].profit;
  }else{
    for(let i = 0; i < PRODUCTS[product].ingridients.length;i++){
      coast += getCoast(PRODUCTS[product].ingridients[i]);
    }
    coast += FACTORIES[PRODUCTS[product].prodaction].process * FACTORIES[PRODUCTS[product].prodaction].salary + PRODUCTS[product].profit;
  }
  return coast;
};

for(let key in PRODUCTS){
  console.log(key + ': ' + getCoast(key));
}



export{
  FACTORIES,PRODUCTS
}
