// Minimal offline perfume data for testing without backend
// This is a fallback when the API server is not available

const offlinePerfumeData = {
    perfumes: [
        {
            id: 1,
            name: "Sauvage",
            brand: "Dior",
            gender: "Homme",
            concentration: "Eau de Toilette",
            size: "100ml",
            category: "Fresh",
            reference: "D001"
        },
        {
            id: 2,
            name: "Bleu de Chanel",
            brand: "Chanel",
            gender: "Homme",
            concentration: "Eau de Parfum",
            size: "100ml",
            category: "Woody",
            reference: "C001"
        },
        {
            id: 3,
            name: "La Vie Est Belle",
            brand: "Lancôme",
            gender: "Femme",
            concentration: "Eau de Parfum",
            size: "75ml",
            category: "Floral",
            reference: "L001"
        },
        {
            id: 4,
            name: "Good Girl",
            brand: "Carolina Herrera",
            gender: "Femme",
            concentration: "Eau de Parfum",
            size: "80ml",
            category: "Oriental",
            reference: "CH001"
        },
        {
            id: 5,
            name: "1 Million",
            brand: "Paco Rabanne",
            gender: "Homme",
            concentration: "Eau de Toilette",
            size: "100ml",
            category: "Spicy",
            reference: "PR001"
        },
        {
            id: 6,
            name: "Black Orchid",
            brand: "Tom Ford",
            gender: "Mixte",
            concentration: "Eau de Parfum",
            size: "50ml",
            category: "Oriental",
            reference: "TF001"
        },
        {
            id: 7,
            name: "Aventus",
            brand: "Creed",
            gender: "Homme",
            concentration: "Eau de Parfum",
            size: "120ml",
            category: "Fruity",
            reference: "CR001"
        },
        {
            id: 8,
            name: "Miss Dior",
            brand: "Dior",
            gender: "Femme",
            concentration: "Eau de Parfum",
            size: "100ml",
            category: "Floral",
            reference: "D002"
        },
        {
            id: 9,
            name: "Coco Mademoiselle",
            brand: "Chanel",
            gender: "Femme",
            concentration: "Eau de Parfum",
            size: "100ml",
            category: "Oriental",
            reference: "C002"
        },
        {
            id: 10,
            name: "Light Blue",
            brand: "Dolce & Gabbana",
            gender: "Femme",
            concentration: "Eau de Toilette",
            size: "100ml",
            category: "Fresh",
            reference: "DG001"
        },
        {
            id: 11,
            name: "Alien",
            brand: "Mugler",
            gender: "Femme",
            concentration: "Eau de Parfum",
            size: "60ml",
            category: "Woody",
            reference: "M001"
        },
        {
            id: 12,
            name: "Si",
            brand: "Giorgio Armani",
            gender: "Femme",
            concentration: "Eau de Parfum",
            size: "100ml",
            category: "Fruity",
            reference: "GA001"
        },
        {
            id: 13,
            name: "The One",
            brand: "Dolce & Gabbana",
            gender: "Homme",
            concentration: "Eau de Parfum",
            size: "100ml",
            category: "Oriental",
            reference: "DG002"
        },
        {
            id: 14,
            name: "Guilty",
            brand: "Gucci",
            gender: "Femme",
            concentration: "Eau de Toilette",
            size: "75ml",
            category: "Floral",
            reference: "G001"
        },
        {
            id: 15,
            name: "Boss Bottled",
            brand: "Hugo Boss",
            gender: "Homme",
            concentration: "Eau de Toilette",
            size: "100ml",
            category: "Woody",
            reference: "HB001"
        },
        {
            id: 16,
            name: "Flower by Kenzo",
            brand: "Kenzo",
            gender: "Femme",
            concentration: "Eau de Parfum",
            size: "100ml",
            category: "Floral",
            reference: "K001"
        },
        {
            id: 17,
            name: "Phantom",
            brand: "Paco Rabanne",
            gender: "Homme",
            concentration: "Eau de Toilette",
            size: "100ml",
            category: "Aromatic",
            reference: "PR002"
        },
        {
            id: 18,
            name: "My Way",
            brand: "Giorgio Armani",
            gender: "Femme",
            concentration: "Eau de Parfum",
            size: "90ml",
            category: "Floral",
            reference: "GA002"
        },
        {
            id: 19,
            name: "Libre",
            brand: "Yves Saint Laurent",
            gender: "Femme",
            concentration: "Eau de Parfum",
            size: "90ml",
            category: "Floral",
            reference: "YSL001"
        },
        {
            id: 20,
            name: "Y",
            brand: "Yves Saint Laurent",
            gender: "Homme",
            concentration: "Eau de Toilette",
            size: "100ml",
            category: "Aromatic",
            reference: "YSL002"
        }
    ],
    brands: [
        { id: 1, name: "Dior" },
        { id: 2, name: "Chanel" },
        { id: 3, name: "Lancôme" },
        { id: 4, name: "Carolina Herrera" },
        { id: 5, name: "Paco Rabanne" },
        { id: 6, name: "Tom Ford" },
        { id: 7, name: "Creed" },
        { id: 8, name: "Dolce & Gabbana" },
        { id: 9, name: "Mugler" },
        { id: 10, name: "Giorgio Armani" },
        { id: 11, name: "Gucci" },
        { id: 12, name: "Hugo Boss" },
        { id: 13, name: "Kenzo" },
        { id: 14, name: "Yves Saint Laurent" }
    ]
};

// Make data available globally
window.offlinePerfumeData = offlinePerfumeData;

console.log('📦 Offline perfume data loaded:', offlinePerfumeData.perfumes.length, 'perfumes');