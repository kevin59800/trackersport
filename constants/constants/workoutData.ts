const WORKOUT_DATA = [
  {
    "title": "Machines Guidées (Matrix)",
    "data": [
      {
        "id": "1",
        "name": "Chest Press",
        "target": "Pectoraux",
        "brand": "Matrix",
        "image": "https://cdn-icons-png.flaticon.com/512/4333/4333061.png",
        "exercises": [
          { "name": "Prise Neutre", "focus": "Milieu des pectoraux et triceps.", "tips": "Coudes serrés le long du corps. Gardez le dos bien plaqué au siège." },
          { "name": "Prise Large", "focus": "Partie externe des pectoraux.", "tips": "Coudes ouverts. Ne verrouillez pas les bras en fin de poussée." }
        ]
      },
      {
        "id": "2",
        "name": "Pec Deck",
        "target": "Pectoraux",
        "brand": "Matrix",
        "image": "https://cdn-icons-png.flaticon.com/512/11516/11516035.png",
        "exercises": [
          { "name": "Pectoraux (Écarté)", "focus": "Isolation du grand pectoral.", "tips": "Gardez une légère flexion des coudes. Inspirez à l'ouverture." },
          { "name": "Deltoïde Arrière", "focus": "Arrière de l'épaule et trapèzes.", "tips": "Inversez votre position sur le siège (face à la machine)." }
        ]
      },
      {
        "id": "3",
        "name": "Shoulder Press",
        "target": "Épaules",
        "brand": "Matrix",
        "image": "https://cdn-icons-png.flaticon.com/512/10470/10470481.png",
        "exercises": [
          { "name": "Développé Militaire", "focus": "Deltoïde antérieur et moyen.", "tips": "Poussez vers le haut sans lever les fesses du siège." }
        ]
      },
      {
        "id": "4",
        "name": "Lateral Raise",
        "target": "Épaules",
        "brand": "Matrix",
        "image": "https://cdn-icons-png.flaticon.com/512/11515/11515942.png",
        "exercises": [
          { "name": "Élévations Latérales", "focus": "Largeur des épaules (Deltoïde moyen).", "tips": "Levez les coudes jusqu'à hauteur d'épaule. Redescendez lentement." }
        ]
      },
      {
        "id": "5",
        "name": "Lat Pulldown",
        "target": "Dos",
        "brand": "Matrix",
        "image": "https://cdn-icons-png.flaticon.com/512/10470/10470557.png",
        "exercises": [
          { "name": "Tirage Poitrine", "focus": "Grand dorsal (Largeur du dos).", "tips": "Tirez la barre vers le haut des pectoraux en bombant le torse." },
          { "name": "Tirage Nuque", "focus": "Haut du dos et rhomboïdes.", "tips": "Descendez la barre derrière la tête sans pencher le cou en avant." },
          { "name": "Prise Serrée", "focus": "Épaisseur du dos et biceps.", "tips": "Utilisez la poignée en V. Tirez vers le bas du sternum." }
        ]
      },
      {
        "id": "6",
        "name": "Seated Row",
        "target": "Dos",
        "brand": "Matrix",
        "image": "https://cdn-icons-png.flaticon.com/512/5079/5079140.png",
        "exercises": [
          { "name": "Tirage Horizontal", "focus": "Milieu du dos et trapèzes.", "tips": "Tirez les coudes vers l'arrière en serrant les omoplates." },
          { "name": "Tirage Unilatéral", "focus": "Isolation du grand dorsal.", "tips": "Travaillez un bras après l'autre pour corriger les déséquilibres." }
        ]
      },
      {
        "id": "7",
        "name": "Back Extension",
        "target": "Dos",
        "brand": "Matrix",
        "image": "https://cdn-icons-png.flaticon.com/512/11515/11515967.png",
        "exercises": [
          { "name": "Lombaires", "focus": "Bas du dos et érecteurs du rachis.", "tips": "Mouvement lent. Ne dépassez pas l'alignement du dos (ne cambrez pas trop)." }
        ]
      },
      {
        "id": "8",
        "name": "Triceps Press",
        "target": "Triceps",
        "brand": "Matrix",
        "image": "https://cdn-icons-png.flaticon.com/512/2548/2548510.png",
        "exercises": [
          { "name": "Dips assis", "focus": "Arrière du bras et bas des pecs.", "tips": "Gardez les coudes proches du corps lors de la descente." }
        ]
      },
      {
        "id": "9",
        "name": "Biceps Curl",
        "target": "Biceps",
        "brand": "Matrix",
        "image": "https://cdn-icons-png.flaticon.com/512/10470/10470399.png",
        "exercises": [
          { "name": "Curl Machine", "focus": "Isolation des biceps.", "tips": "Coudes bien calés sur le pupitre. Ne relâchez pas brusquement le poids." }
        ]
      },
      {
        "id": "10",
        "name": "Leg Press",
        "target": "Jambes",
        "brand": "Matrix",
        "image": "https://cdn-icons-png.flaticon.com/512/11516/11516008.png",
        "exercises": [
          { "name": "Presse à cuisses", "focus": "Quadriceps et fessiers.", "tips": "Pieds largeur d'épaules. Ne tendez JAMAIS les genoux à fond." },
          { "name": "Mollets à la presse", "focus": "Gastrocnémiens (mollets).", "tips": "Poussez uniquement avec la pointe des pieds. Étirez bien au retour." }
        ]
      },
      {
        "id": "11",
        "name": "Leg Extension",
        "target": "Jambes",
        "brand": "Matrix",
        "image": "https://cdn-icons-png.flaticon.com/512/11516/11516010.png",
        "exercises": [
          { "name": "Quadriceps", "focus": "Isolation de l'avant de la cuisse.", "tips": "Dos collé. Contractez 1s en haut. Redescendez en contrôlant." }
        ]
      },
      {
        "id": "12",
        "name": "Seated Leg Curl",
        "target": "Jambes",
        "brand": "Matrix",
        "image": "https://cdn-icons-png.flaticon.com/512/11516/11516010.png",
        "exercises": [
          { "name": "Ischios-jambiers", "focus": "Arrière de la cuisse.", "tips": "Ramenez les talons vers vous. Gardez les hanches plaquées au siège." }
        ]
      },
      {
        "id": "13",
        "name": "Abdominal Crunch",
        "target": "Abdominaux",
        "brand": "Matrix",
        "image": "https://cdn-icons-png.flaticon.com/512/10470/10470383.png",
        "exercises": [
          { "name": "Crunch Machine", "focus": "Grand droit des abdominaux.", "tips": "Enroulez la colonne. Expirez fort en contractant les abdos." }
        ]
      },
      {
        "id": "14",
        "name": "Adducteur / Abducteur",
        "target": "Fessiers",
        "brand": "Matrix",
        "image": "https://cdn-icons-png.flaticon.com/512/11515/11515984.png",
        "exercises": [
          { "name": "Adducteurs (Intérieur)", "focus": "Intérieur des cuisses.", "tips": "Resserrez les jambes vers l'intérieur. Contrôlez l'ouverture." },
          { "name": "Abducteurs (Extérieur)", "focus": "Moyen fessier (côté des fesses).", "tips": "Poussez vers l'extérieur. Dos droit, ne vous aidez pas des bras." }
        ]
      },
      {
        "id": "15",
        "name": "Glute Kickback",
        "target": "Fessiers",
        "brand": "Matrix",
        "image": "https://cdn-icons-png.flaticon.com/512/11515/11515984.png",
        "exercises": [
          { "name": "Fessiers Arrière", "focus": "Grand fessier.", "tips": "Poussez la jambe vers l'arrière sans cambrer le bas du dos." }
        ]
      }
    ]
  },
  {
    "title": "Poids Libres & Câbles",
    "data": [
      {
        "id": "16",
        "name": "Poulie Vis-à-vis",
        "target": "Polyarticulaire",
        "brand": "Matrix",
        "image": "https://cdn-icons-png.flaticon.com/512/10470/10470455.png",
        "exercises": [
          { "name": "Écartés hauts", "focus": "Bas des pectoraux.", "tips": "Tirez les câbles du haut vers le bas, devant votre bassin." },
          { "name": "Écartés bas", "focus": "Haut des pectoraux.", "tips": "Tirez les câbles du bas vers le haut, devant votre visage." },
          { "name": "Triceps Corde", "focus": "Isolation des triceps.", "tips": "Coudes immobiles sur les côtés. Écartez la corde en bas." },
          { "name": "Tirage visage", "focus": "Arrière d'épaule et posture.", "tips": "Tirez la corde vers votre front en ouvrant bien les coudes." }
        ]
      },
      {
        "id": "17",
        "name": "Smith Machine",
        "target": "Polyarticulaire",
        "brand": "Matrix",
        "image": "https://cdn-icons-png.flaticon.com/512/2548/2548437.png",
        "exercises": [
          { "name": "Squat guidé", "focus": "Cuisses et fessiers.", "tips": "Pieds légèrement en avant de la barre pour protéger les genoux." },
          { "name": "Développé couché guidé", "focus": "Pectoraux (Sécurité max).", "tips": "Idéal pour travailler lourd sans partenaire." }
        ]
      },
      {
        "id": "18",
        "name": "Haltères",
        "target": "Libre",
        "brand": "Libre",
        "image": "https://cdn-icons-png.flaticon.com/512/10470/10470430.png",
        "exercises": [
          { "name": "Développé couché", "focus": "Pectoraux et stabilité.", "tips": "Gardez les pieds au sol. Descendez les haltères au niveau des pecs." },
          { "name": "Curl incliné", "focus": "Biceps (étirement max).", "tips": "Banc à 45°. Laissez pendre les bras avant de monter l'haltère." }
        ]
      }
    ]
  },
  {
    "title": "Espace Cardio",
    "data": [
      {
        "id": "20",
        "name": "Tapis de Course",
        "target": "Cardio",
        "brand": "Matrix",
        "image": "https://cdn-icons-png.flaticon.com/512/2382/2382607.png",
        "exercises": [
          { "name": "Marche inclinée", "focus": "Brûle-graisse et fessiers.", "tips": "Inclinez à 10%+, vitesse 5km/h. Ne vous tenez pas aux barres." },
          { "name": "Fractionné", "focus": "Capacité cardiaque (HIIT).", "tips": "Alternez 30s de sprint et 30s de marche lente." }
        ]
      },
      {
        "id": "22",
        "name": "Stairmaster",
        "target": "Cardio",
        "brand": "Matrix",
        "image": "https://cdn-icons-png.flaticon.com/512/11515/11515965.png",
        "exercises": [
          { "name": "Montée d'escalier", "focus": "Fessiers et cardio intense.", "tips": "Poussez bien sur les talons. Restez droit sans vous affaler." }
        ]
      }
    ]
  }
];

export default WORKOUT_DATA;
