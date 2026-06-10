import { addSupplyPurchase, registerProduction } from './domain.js';

const STORAGE_KEY = 'taller-huerta-state-v1';

export function createInitialState() {
  const base = {
    supplies: [
      {
        id: 'aceite-coco',
        name: 'Aceite de coco',
        category: 'Aceites base',
        unit: 'L',
        stock: 0,
        minStock: 4,
        averageCost: 0,
        lot: 'CO-0626',
        expiresAt: '2026-10-15',
      },
      {
        id: 'aceite-oliva',
        name: 'Aceite de oliva',
        category: 'Aceites base',
        unit: 'L',
        stock: 0,
        minStock: 3,
        averageCost: 0,
        lot: 'OL-0526',
        expiresAt: '2027-01-20',
      },
      {
        id: 'soda',
        name: 'Soda caustica',
        category: 'Activos',
        unit: 'kg',
        stock: 0,
        minStock: 2,
        averageCost: 0,
        lot: 'SC-18',
        expiresAt: '',
      },
      {
        id: 'fragancia-lavanda',
        name: 'Fragancia lavanda',
        category: 'Fragancias',
        unit: 'ml',
        stock: 0,
        minStock: 250,
        averageCost: 0,
        lot: 'FL-210',
        expiresAt: '2026-08-30',
      },
      {
        id: 'envase-vidrio',
        name: 'Envase vidrio 10 ml',
        category: 'Empaques',
        unit: 'un',
        stock: 0,
        minStock: 40,
        averageCost: 0,
        lot: '',
        expiresAt: '',
      },
      {
        id: 'etiqueta-kraft',
        name: 'Etiqueta kraft',
        category: 'Empaques',
        unit: 'un',
        stock: 0,
        minStock: 80,
        averageCost: 0,
        lot: '',
        expiresAt: '',
      },
    ],
    products: [
      {
        id: 'jabon-lavanda',
        name: 'Jabon lavanda 100 g',
        category: 'Jabones',
        unit: 'un',
        stock: 8,
        minStock: 12,
        unitCost: 3200,
        price: 9000,
        lot: 'JL-0601',
        expiresAt: '2026-12-09',
      },
      {
        id: 'shampoo-romero',
        name: 'Shampoo solido romero',
        category: 'Capilar',
        unit: 'un',
        stock: 15,
        minStock: 10,
        unitCost: 5200,
        price: 16000,
        lot: 'SR-0528',
        expiresAt: '2026-11-28',
      },
      {
        id: 'aceite-naranja',
        name: 'Aceite esencial naranja 10 ml',
        category: 'Aceites esenciales',
        unit: 'un',
        stock: 18,
        minStock: 20,
        unitCost: 6100,
        price: 18000,
        lot: 'AN-0603',
        expiresAt: '2027-03-03',
      },
      {
        id: 'balsamo-calendula',
        name: 'Balsamo calendula',
        category: 'Cuidado corporal',
        unit: 'un',
        stock: 6,
        minStock: 8,
        unitCost: 4300,
        price: 14000,
        lot: 'BC-0605',
        expiresAt: '2026-09-05',
      },
    ],
    recipes: [
      {
        id: 'rec-jabon-lavanda',
        productId: 'jabon-lavanda',
        yield: 24,
        notes: 'Curado minimo de 4 semanas. Ajustar fragancia segun intensidad.',
        ingredients: [
          { supplyId: 'aceite-coco', quantity: 1.2 },
          { supplyId: 'aceite-oliva', quantity: 1.5 },
          { supplyId: 'soda', quantity: 0.38 },
          { supplyId: 'fragancia-lavanda', quantity: 90 },
          { supplyId: 'etiqueta-kraft', quantity: 24 },
        ],
      },
      {
        id: 'rec-aceite-naranja',
        productId: 'aceite-naranja',
        yield: 30,
        notes: 'Envasado y etiquetado simple por tanda.',
        ingredients: [
          { supplyId: 'envase-vidrio', quantity: 30 },
          { supplyId: 'etiqueta-kraft', quantity: 30 },
        ],
      },
    ],
    purchases: [],
    productions: [],
    expenses: [
      {
        id: 'gasto-1',
        date: '2026-06-02',
        category: 'Servicios',
        description: 'Energia taller',
        amount: 68000,
      },
      {
        id: 'gasto-2',
        date: '2026-06-03',
        category: 'Transporte',
        description: 'Envio proveedor de envases',
        amount: 22000,
      },
      {
        id: 'gasto-3',
        date: '2026-06-05',
        category: 'Herramientas',
        description: 'Moldes y espatulas',
        amount: 78000,
      },
      {
        id: 'gasto-4',
        date: '2026-05-25',
        category: 'Publicidad',
        description: 'Fotos para catalogo',
        amount: 95000,
      },
    ],
  };

  let state = base;
  state = addSupplyPurchase(state, {
    id: 'compra-aceite-coco-1',
    supplyId: 'aceite-coco',
    supplier: 'Bioinsumos Andes',
    date: '2026-06-01',
    quantity: 8,
    totalCost: 168000,
    lot: 'CO-0626',
    expiresAt: '2026-10-15',
  });
  state = addSupplyPurchase(state, {
    id: 'compra-lavanda-1',
    supplyId: 'fragancia-lavanda',
    supplier: 'Aromas del Valle',
    date: '2026-06-03',
    quantity: 500,
    totalCost: 95000,
    lot: 'FL-210',
    expiresAt: '2026-08-30',
  });
  state = addSupplyPurchase(state, {
    id: 'compra-empaque-1',
    supplyId: 'etiqueta-kraft',
    supplier: 'Papeles La Estacion',
    date: '2026-06-04',
    quantity: 120,
    totalCost: 36000,
  });
  state = addSupplyPurchase(state, {
    id: 'compra-oliva-1',
    supplyId: 'aceite-oliva',
    supplier: 'Bioinsumos Andes',
    date: '2026-06-05',
    quantity: 6,
    totalCost: 156000,
    lot: 'OL-0526',
    expiresAt: '2027-01-20',
  });
  state = addSupplyPurchase(state, {
    id: 'compra-soda-1',
    supplyId: 'soda',
    supplier: 'Quimicos Norte',
    date: '2026-06-05',
    quantity: 4,
    totalCost: 52000,
    lot: 'SC-18',
  });
  state = addSupplyPurchase(state, {
    id: 'compra-envase-1',
    supplyId: 'envase-vidrio',
    supplier: 'Envapack',
    date: '2026-06-06',
    quantity: 60,
    totalCost: 72000,
  });
  state = registerProduction(state, {
    id: 'prod-jabon-0607',
    productId: 'jabon-lavanda',
    date: '2026-06-07',
    quantityProduced: 24,
    lot: 'JL-0607',
    expiresAt: '2027-01-07',
    consumptions: [
      { supplyId: 'aceite-coco', quantity: 1.2 },
      { supplyId: 'aceite-oliva', quantity: 1.5 },
      { supplyId: 'soda', quantity: 0.38 },
      { supplyId: 'fragancia-lavanda', quantity: 90 },
      { supplyId: 'etiqueta-kraft', quantity: 24 },
    ],
    laborCost: 30000,
  });
  state = registerProduction(state, {
    id: 'prod-aceite-0608',
    productId: 'aceite-naranja',
    date: '2026-06-08',
    quantityProduced: 30,
    lot: 'AN-0608',
    expiresAt: '2027-03-08',
    consumptions: [
      { supplyId: 'envase-vidrio', quantity: 30 },
      { supplyId: 'etiqueta-kraft', quantity: 30 },
    ],
    directCost: 12000,
  });

  return state;
}

export function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initial = createInitialState();
    saveState(initial);
    return initial;
  }

  try {
    return JSON.parse(stored);
  } catch {
    const initial = createInitialState();
    saveState(initial);
    return initial;
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  const initial = createInitialState();
  saveState(initial);
  return initial;
}
