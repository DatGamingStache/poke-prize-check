import React from 'react';

interface Card {
  name: string;
  quantity: number;
}

interface PrintDeckListProps {
  name: string;
  cards: Card[];
  date: string;
}

const PrintDeckList: React.FC<PrintDeckListProps> = ({ name, cards, date }) => {
  // Group cards by type (assuming they're prefixed with type like "Pokemon", "Trainer", "Energy")
  const groupedCards = cards.reduce((acc, card) => {
    const type = card.name.startsWith("Basic ") ? "Energy" : 
                card.name.includes("Trainer") ? "Trainer" : "Pokemon";
    if (!acc[type]) acc[type] = [];
    acc[type].push(card);
    return acc;
  }, {} as Record<string, Card[]>);

  return (
    <div className="p-8 max-w-2xl mx-auto print:p-4 print:max-w-none">
      <h1 className="text-2xl font-bold mb-6">{name}</h1>
      
      {Object.entries(groupedCards).map(([type, cards]) => {
        const totalCount = cards.reduce((sum, card) => sum + card.quantity, 0);
        return (
          <div key={type} className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              {type} ({totalCount})
            </h2>
            <ul className="space-y-1">
              {cards.map((card, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-6">{card.quantity}</span>
                  <span>{card.name}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      
      <div className="mt-8 text-sm text-gray-500">
        <p>Created: {date}</p>
        <p>Total: {cards.reduce((sum, card) => sum + card.quantity, 0)} cards</p>
      </div>
    </div>
  );
};

export default PrintDeckList;