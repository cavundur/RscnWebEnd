"use client";

import Icon, { IconName } from "@/components/Icon";

interface AboutCardData {
  card_title: string;
  card_description: string;
  icon?: IconName;
}

interface AnimatedCardsProps {
  cards: AboutCardData[];
}

export default function AnimatedCards({ cards }: AnimatedCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-3 mb-12 md:mb-16 aboutCards">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white/10 backdrop-blur-md p-4 rounded-xl transition-all hover:bg-white/20 aboutCard"
        >
          <Icon 
            name={card.icon || 'fuze'} 
            className="mb-2 aboutCardIcon text-white text-5xl" 
          />
          <h2 className="text-xl font-semibold mb-3 text-white">{card.card_title}</h2>
          <p className="text-gray-200 leading-relaxed">{card.card_description}</p>
        </div>
      ))}
    </div>
  );
} 