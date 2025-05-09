// Sample wine data for the marketplace
export const wines = [
  {
    id: 1,
    name: "Château Margaux 2015",
    region: "Bordeaux, France",
    year: 2015,
    price: 699,
    rating: 4.9,
    reviewCount: 124,
    ageWorthy: true,
    description:
      "The 2015 Château Margaux is a blend of 87% Cabernet Sauvignon, 8% Merlot, 3% Cabernet Franc and 2% Petit Verdot. Deep garnet-purple colored, the nose features fragrant notes of warm blackberries, cassis and redcurrants with touches of cedar chest, roses, pencil shavings and forest floor. Medium to full-bodied with a firm, grainy texture and packed with tightly wound black fruits and floral layers, it has a long, mineral-laced finish. Drink now through 2055.",
    tastingNotes:
      "Exhibits a deep garnet-purple color with an incredibly fragrant nose of warm blackberries, cassis, and redcurrants, complemented by notes of cedar chest, roses, pencil shavings, and forest floor.",
    agingPotential: {
      drinkFrom: 2023,
      peakMaturity: 2030,
      drinkUntil: 2055,
    },
    storageRecommendations:
      "Store in a cool, dark place with a constant temperature between 50-59°F (10-15°C) and humidity around 70%. Keep bottles on their side to keep the cork moist.",
    foodPairings: ["Prime Rib", "Lamb Chops", "Aged Cheeses", "Truffle Dishes"],
    image: "/chateau-margaux-bottle.png",
    images: [
      "/chateau-margaux-bottle.png",
      "/margaux-vineyard-autumn.png",
      "/red-wine-pour.png",
      "/vintage-wine-cellar.png",
    ],
  },
  {
    id: 2,
    name: "Opus One 2018",
    region: "Napa Valley, USA",
    year: 2018,
    price: 399,
    rating: 4.8,
    reviewCount: 98,
    ageWorthy: true,
    description:
      "The 2018 Opus One is a blend of 84% Cabernet Sauvignon, 6% Petit Verdot, 5% Merlot, 4% Cabernet Franc and 1% Malbec. Deep garnet-purple in color, it comes charging out of the gate with expressive notes of black cherries, mulberries, black currants and licorice plus touches of red roses and spearmint and a waft of dusty soil. Medium to full-bodied, the palate is tightly wound with layers of black and red fruits, floral notions and spicy accents, framed by firm, grainy tannins and a lively backbone, finishing long and fragrant.",
    tastingNotes:
      "Expressive notes of black cherries, mulberries, black currants, and licorice with touches of red roses and spearmint. The palate is tightly wound with layers of black and red fruits, floral notions, and spicy accents.",
    agingPotential: {
      drinkFrom: 2023,
      peakMaturity: 2028,
      drinkUntil: 2038,
    },
    storageRecommendations:
      "Store in a cool, dark place with a constant temperature between 50-59°F (10-15°C) and humidity around 70%. Keep bottles on their side to keep the cork moist.",
    foodPairings: ["Filet Mignon", "Venison", "Mushroom Risotto", "Dark Chocolate"],
    image: "/elegant-red-wine.png",
    images: [
      "/elegant-red-wine.png",
      "/napa-vineyard-estate.png",
      "/decanted-red-wine.png",
      "/placeholder.svg?height=600&width=600&query=wine tasting room with barrels",
    ],
  },
  {
    id: 3,
    name: "Dom Pérignon 2012",
    region: "Champagne, France",
    year: 2012,
    price: 249,
    rating: 4.7,
    reviewCount: 112,
    ageWorthy: true,
    description:
      "The 2012 Dom Pérignon is a stunning champagne that captures the essence of the vintage. The bouquet is complex and luminous, revealing notes of white flowers, citrus, and stone fruits. On the palate, it's precise and tactile with remarkable depth and persistence. The wine unfolds with layers of ripe fruit, brioche, and a distinctive mineral character that speaks to its origins. The finish is long and harmonious with a subtle saline quality.",
    tastingNotes:
      "Complex and luminous bouquet revealing notes of white flowers, citrus, and stone fruits. The palate is precise and tactile with remarkable depth and persistence, unfolding with layers of ripe fruit, brioche, and a distinctive mineral character.",
    agingPotential: {
      drinkFrom: 2020,
      peakMaturity: 2023,
      drinkUntil: 2032,
    },
    storageRecommendations:
      "Store in a cool, dark place with a constant temperature between 45-55°F (7-13°C) and humidity around 70%. Champagne can be stored upright, unlike still wines.",
    foodPairings: ["Oysters", "Caviar", "Sushi", "Lobster"],
    image: "/elegant-champagne.png",
    images: [
      "/elegant-champagne.png",
      "/placeholder.svg?height=600&width=600&query=Dom Perignon champagne being poured",
      "/placeholder.svg?height=600&width=600&query=champagne flutes with bubbles",
      "/placeholder.svg?height=600&width=600&query=champagne cellar in France",
    ],
  },
  {
    id: 4,
    name: "Cloudy Bay Sauvignon Blanc 2022",
    region: "Marlborough, New Zealand",
    year: 2022,
    price: 39,
    rating: 4.5,
    reviewCount: 87,
    ageWorthy: false,
    description:
      "The 2022 Cloudy Bay Sauvignon Blanc showcases the distinctive character of Marlborough. Vibrant and expressive, it offers intense aromas of ripe citrus, tropical fruits, and fresh herbs. The palate is crisp and focused with flavors of lime, passionfruit, and a hint of jalapeño, all balanced by a refreshing acidity and a long, mineral-driven finish. This wine captures the essence of New Zealand Sauvignon Blanc at its finest.",
    tastingNotes:
      "Intense aromas of ripe citrus, tropical fruits, and fresh herbs. The palate is crisp and focused with flavors of lime, passionfruit, and a hint of jalapeño, all balanced by a refreshing acidity and a long, mineral-driven finish.",
    agingPotential: {
      drinkFrom: 2022,
      peakMaturity: 2023,
      drinkUntil: 2025,
    },
    storageRecommendations:
      "Best enjoyed young and fresh. Store in a cool, dark place with a constant temperature between 45-55°F (7-13°C). Consume within 2-3 years of vintage for optimal freshness.",
    foodPairings: ["Seafood", "Goat Cheese", "Asparagus", "Thai Cuisine"],
    image: "/sauvignon-blanc-bottle.png",
    images: [
      "/sauvignon-blanc-bottle.png",
      "/placeholder.svg?height=600&width=600&query=Marlborough vineyards in New Zealand",
      "/placeholder.svg?height=600&width=600&query=white wine being poured into glass",
      "/placeholder.svg?height=600&width=600&query=seafood platter with white wine",
    ],
  },
  {
    id: 5,
    name: "Tignanello 2019",
    region: "Tuscany, Italy",
    year: 2019,
    price: 149,
    rating: 4.6,
    reviewCount: 76,
    ageWorthy: true,
    description:
      "The 2019 Tignanello is a masterful Super Tuscan blend of Sangiovese, Cabernet Sauvignon, and Cabernet Franc. It presents a deep ruby-red color with aromas of ripe red fruits, spices, and hints of tobacco and leather. On the palate, it's full-bodied and well-structured with elegant tannins and a harmonious balance between fruit, acidity, and oak. The finish is long and persistent with notes of dark chocolate and Mediterranean herbs.",
    tastingNotes:
      "Deep ruby-red color with aromas of ripe red fruits, spices, and hints of tobacco and leather. Full-bodied and well-structured with elegant tannins and a harmonious balance between fruit, acidity, and oak.",
    agingPotential: {
      drinkFrom: 2022,
      peakMaturity: 2029,
      drinkUntil: 2039,
    },
    storageRecommendations:
      "Store in a cool, dark place with a constant temperature between 50-59°F (10-15°C) and humidity around 70%. Keep bottles on their side to keep the cork moist.",
    foodPairings: ["Bistecca alla Fiorentina", "Wild Boar Ragu", "Aged Pecorino", "Porcini Mushrooms"],
    image: "/placeholder.svg?height=300&width=300&query=bottle of Tignanello red wine",
    images: [
      "/placeholder.svg?height=600&width=600&query=bottle of Tignanello red wine",
      "/placeholder.svg?height=600&width=600&query=Tuscan vineyard landscape",
      "/placeholder.svg?height=600&width=600&query=Italian wine cellar",
      "/placeholder.svg?height=600&width=600&query=wine glass with Italian red wine",
    ],
  },
  {
    id: 6,
    name: "Penfolds Grange 2017",
    region: "South Australia",
    year: 2017,
    price: 599,
    rating: 4.9,
    reviewCount: 65,
    ageWorthy: true,
    description:
      "The 2017 Penfolds Grange is a monumental Australian wine, primarily Shiraz with a touch of Cabernet Sauvignon. It displays a deep, saturated color with complex aromas of blackberry, plum, licorice, and exotic spices, complemented by notes of cedar and vanilla from oak aging. The palate is incredibly concentrated and powerful, yet maintains remarkable balance and finesse. Layers of dark fruits, chocolate, and spice unfold across a framework of fine-grained tannins, leading to an extraordinarily long finish.",
    tastingNotes:
      "Deep, saturated color with complex aromas of blackberry, plum, licorice, and exotic spices, complemented by notes of cedar and vanilla. Incredibly concentrated and powerful, yet maintains remarkable balance and finesse.",
    agingPotential: {
      drinkFrom: 2022,
      peakMaturity: 2037,
      drinkUntil: 2057,
    },
    storageRecommendations:
      "Store in a cool, dark place with a constant temperature between 50-59°F (10-15°C) and humidity around 70%. Keep bottles on their side to keep the cork moist. This wine will benefit from long-term cellaring.",
    foodPairings: ["Aged Beef", "Game Meats", "Strong Cheeses", "Dark Chocolate"],
    image: "/placeholder.svg?height=300&width=300&query=bottle of Penfolds Grange red wine",
    images: [
      "/placeholder.svg?height=600&width=600&query=bottle of Penfolds Grange red wine",
      "/placeholder.svg?height=600&width=600&query=Australian vineyard",
      "/placeholder.svg?height=600&width=600&query=wine barrels in cellar",
      "/placeholder.svg?height=600&width=600&query=premium red wine being decanted",
    ],
  },
  {
    id: 7,
    name: "Veuve Clicquot Brut",
    region: "Champagne, France",
    year: "NV",
    price: 59,
    rating: 4.4,
    reviewCount: 132,
    ageWorthy: false,
    description:
      "Veuve Clicquot Brut Yellow Label is the signature champagne of the House. Dominated by Pinot Noir, it offers a perfect balance of structure and finesse. The wine displays bright fruitiness, a harmonious balance, and a pleasant silkiness that allows it to be enjoyed as an aperitif or throughout a meal. The initial notes of white fruits and raisins develop into vanilla and later brioche. The combination of modern winemaking techniques and a centuries-old tradition results in a champagne that is both accessible and sophisticated.",
    tastingNotes:
      "Initial notes of white fruits and raisins develop into vanilla and later brioche. The palate offers bright fruitiness, a harmonious balance, and a pleasant silkiness with fine, persistent bubbles.",
    agingPotential: {
      drinkFrom: 2020,
      peakMaturity: 2022,
      drinkUntil: 2024,
    },
    storageRecommendations:
      "Store in a cool, dark place with a constant temperature between 45-55°F (7-13°C). Non-vintage champagne is best consumed within 3-4 years of purchase.",
    foodPairings: ["Oysters", "Smoked Salmon", "Sushi", "Light Appetizers"],
    image: "/elegant-champagne.png",
    images: [
      "/elegant-champagne.png",
      "/placeholder.svg?height=600&width=600&query=Veuve Clicquot champagne bottle",
      "/placeholder.svg?height=600&width=600&query=champagne glasses with bubbles",
      "/placeholder.svg?height=600&width=600&query=champagne toast celebration",
    ],
  },
  {
    id: 8,
    name: "Caymus Cabernet Sauvignon 2020",
    region: "Napa Valley, USA",
    year: 2020,
    price: 89,
    rating: 4.6,
    reviewCount: 108,
    ageWorthy: true,
    description:
      "The 2020 Caymus Cabernet Sauvignon continues the winery's tradition of producing rich, accessible Napa Valley Cabernets. This wine showcases a deep purple-black color and generous aromas of ripe blackberries, cassis, and dark chocolate, with hints of vanilla and toasted oak. On the palate, it's full-bodied and opulent with velvety tannins and a plush texture. The flavors of dark fruits, cocoa, and sweet spices are complemented by a long, smooth finish. While approachable in its youth, this wine will continue to develop complexity with age.",
    tastingNotes:
      "Deep purple-black color and generous aromas of ripe blackberries, cassis, and dark chocolate, with hints of vanilla and toasted oak. Full-bodied and opulent with velvety tannins and a plush texture.",
    agingPotential: {
      drinkFrom: 2022,
      peakMaturity: 2025,
      drinkUntil: 2030,
    },
    storageRecommendations:
      "Store in a cool, dark place with a constant temperature between 50-59°F (10-15°C) and humidity around 70%. Keep bottles on their side to keep the cork moist.",
    foodPairings: ["Ribeye Steak", "Braised Short Ribs", "Blue Cheese", "Dark Chocolate"],
    image: "/placeholder.svg?height=300&width=300&query=bottle of Caymus Cabernet Sauvignon red wine",
    images: [
      "/placeholder.svg?height=600&width=600&query=bottle of Caymus Cabernet Sauvignon red wine",
      "/placeholder.svg?height=600&width=600&query=Napa Valley vineyard sunset",
      "/placeholder.svg?height=600&width=600&query=red wine being poured into glass",
      "/placeholder.svg?height=600&width=600&query=steak dinner with red wine",
    ],
  },
  {
    id: 9,
    name: "Château d'Yquem 2015",
    region: "Sauternes, France",
    year: 2015,
    price: 399,
    rating: 4.9,
    reviewCount: 54,
    ageWorthy: true,
    description:
      "The 2015 Château d'Yquem is a legendary Sauternes that exemplifies the pinnacle of sweet wine production. It displays a brilliant golden color with aromas of apricot, honey, vanilla, and exotic fruits, underscored by a refreshing citrus note. On the palate, it's opulently sweet yet perfectly balanced by vibrant acidity, offering layers of tropical fruits, marmalade, and spice. The texture is silky and the finish seemingly endless, revealing new dimensions with each sip. This is a wine of extraordinary complexity and aging potential.",
    tastingNotes:
      "Brilliant golden color with aromas of apricot, honey, vanilla, and exotic fruits, underscored by a refreshing citrus note. Opulently sweet yet perfectly balanced by vibrant acidity, offering layers of tropical fruits, marmalade, and spice.",
    agingPotential: {
      drinkFrom: 2020,
      peakMaturity: 2035,
      drinkUntil: 2065,
    },
    storageRecommendations:
      "Store in a cool, dark place with a constant temperature between 50-59°F (10-15°C) and humidity around 70%. Keep bottles on their side to keep the cork moist. Sauternes can age for decades when stored properly.",
    foodPairings: ["Foie Gras", "Blue Cheese", "Fruit Tarts", "Crème Brûlée"],
    image: "/placeholder.svg?height=300&width=300&query=bottle of Château d'Yquem dessert wine",
    images: [
      "/placeholder.svg?height=600&width=600&query=bottle of Château d'Yquem dessert wine",
      "/placeholder.svg?height=600&width=600&query=Sauternes vineyard in autumn",
      "/placeholder.svg?height=600&width=600&query=dessert wine in crystal glass",
      "/placeholder.svg?height=600&width=600&query=foie gras with Sauternes wine pairing",
    ],
  },
]
