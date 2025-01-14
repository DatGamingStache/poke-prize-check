import React, { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";

interface PrizeGuessInputProps {
  index: number;
  value: string;
  uniqueCards: string[];
  onChange: (value: string, index: number) => void;
  activeSuggestionIndex: number | null;
  setActiveSuggestionIndex: (index: number | null) => void;
}

const PrizeGuessInput = ({ 
  index, 
  value, 
  uniqueCards, 
  onChange,
  activeSuggestionIndex,
  setActiveSuggestionIndex
}: PrizeGuessInputProps) => {
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setActiveSuggestionIndex(index);
    onChange(newValue, index);
  };

  const handleSelect = (selectedValue: string) => {
    setInputValue(selectedValue);
    onChange(selectedValue, index);
    setActiveSuggestionIndex(null);
  };

  const filteredCards = uniqueCards?.filter(card => 
    card.toLowerCase().includes(inputValue.toLowerCase())
  ) || [];

  const showSuggestions = activeSuggestionIndex === index && inputValue;

  return (
    <div className="relative" style={{ zIndex: 50 - index }}>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setActiveSuggestionIndex(index)}
        placeholder="Type to search cards..."
        className="w-full"
      />
      {showSuggestions && (
        <div className="absolute w-full mt-1">
          <Command className="rounded-lg border shadow-md bg-white dark:bg-gray-800">
            <CommandList>
              <CommandInput placeholder="Search cards..." value={inputValue} onValueChange={setInputValue} />
              <CommandEmpty>No cards found.</CommandEmpty>
              <CommandGroup className="max-h-48 overflow-auto">
                {filteredCards.map((card) => (
                  <CommandItem
                    key={card}
                    value={card}
                    onSelect={() => handleSelect(card)}
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {card}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};

export default PrizeGuessInput;