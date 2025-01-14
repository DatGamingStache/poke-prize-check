import React, { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";

interface PrizeGuessInputProps {
  index: number;
  value: string;
  uniqueCards: string[];
  onChange: (value: string, index: number) => void;
}

const PrizeGuessInput = ({ index, value, uniqueCards, onChange }: PrizeGuessInputProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);
    onChange(newValue, index);
  };

  const handleSelect = (selectedValue: string) => {
    setInputValue(selectedValue);
    onChange(selectedValue, index);
    setShowSuggestions(false);
  };

  const filteredCards = uniqueCards?.filter(card => 
    card.toLowerCase().includes(inputValue.toLowerCase())
  ) || [];

  return (
    <div className="relative" style={{ zIndex: 50 - index }}>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        placeholder="Type to search cards..."
        className="w-full"
      />
      {showSuggestions && inputValue && (
        <div className="absolute w-full mt-1">
          <Command className="rounded-lg border shadow-md">
            <CommandList>
              <CommandInput placeholder="Search cards..." value={inputValue} onValueChange={setInputValue} />
              <CommandEmpty>No cards found.</CommandEmpty>
              <CommandGroup className="max-h-48 overflow-auto">
                {filteredCards.map((card) => (
                  <CommandItem
                    key={card}
                    value={card}
                    onSelect={() => handleSelect(card)}
                    className="cursor-pointer"
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