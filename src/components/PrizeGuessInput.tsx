import React, { useState, useRef, useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";

interface PrizeGuessInputProps {
  index: number;
  value: string;
  uniqueCards: string[];
  onChange: (value: string, index: number) => void;
  activeSuggestionIndex: number | null;
  setActiveSuggestionIndex: (index: number | null) => void;
  onEnterPress?: () => void;
  guesses: string[];
}

const PrizeGuessInput = ({ 
  index, 
  value, 
  uniqueCards, 
  onChange,
  activeSuggestionIndex,
  setActiveSuggestionIndex,
  onEnterPress,
  guesses
}: PrizeGuessInputProps) => {
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

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
    if (onEnterPress) {
      onEnterPress();
    }
  };

  const findNextEmptyIndex = () => {
    for (let i = index + 1; i < 6; i++) {
      if (!guesses[i]) {
        return i;
      }
    }
    return -1;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      const filteredCards = uniqueCards.filter(card => 
        card.toLowerCase().includes(inputValue.toLowerCase())
      );
      
      // Sort the filtered cards to ensure exact matches appear first
      const sortedCards = [...filteredCards].sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const inputLower = inputValue.toLowerCase();
        
        // If one is an exact match, it should come first
        if (aLower === inputLower) return -1;
        if (bLower === inputLower) return 1;
        
        // If one starts with the input, it should come before one that just includes it
        const aStarts = aLower.startsWith(inputLower);
        const bStarts = bLower.startsWith(inputLower);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        // Default to alphabetical order
        return aLower.localeCompare(bLower);
      });

      if (sortedCards.length > 0) {
        handleSelect(sortedCards[0]);
        // Find and focus the next empty input
        const nextEmptyIndex = findNextEmptyIndex();
        if (nextEmptyIndex !== -1) {
          const nextInput = document.querySelector(`input[data-index="${nextEmptyIndex}"]`);
          if (nextInput instanceof HTMLInputElement) {
            nextInput.focus();
          }
        }
      }
    }
  };

  const filteredCards = uniqueCards?.filter(card => 
    card.toLowerCase().includes(inputValue.toLowerCase())
  ).sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    const inputLower = inputValue.toLowerCase();
    
    // If one is an exact match, it should come first
    if (aLower === inputLower) return -1;
    if (bLower === inputLower) return 1;
    
    // If one starts with the input, it should come before one that just includes it
    const aStarts = aLower.startsWith(inputLower);
    const bStarts = bLower.startsWith(inputLower);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    
    // Default to alphabetical order
    return aLower.localeCompare(bLower);
  }) || [];

  const showSuggestions = activeSuggestionIndex === index && inputValue;

  return (
    <div className="relative" style={{ zIndex: 50 - index }}>
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setActiveSuggestionIndex(index)}
        placeholder="Type to search cards..."
        className="w-full"
        data-index={index}
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