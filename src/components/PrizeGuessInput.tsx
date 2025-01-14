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
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setActiveSuggestionIndex(index);
    setHighlightedIndex(0); // Reset highlighted index when input changes
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

  const getFilteredAndSortedCards = () => {
    return uniqueCards?.filter(card => 
      card.toLowerCase().includes(inputValue.toLowerCase())
    ).sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const inputLower = inputValue.toLowerCase();
      
      if (aLower === inputLower) return -1;
      if (bLower === inputLower) return 1;
      
      const aStarts = aLower.startsWith(inputLower);
      const bStarts = bLower.startsWith(inputLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      return aLower.localeCompare(bLower);
    }) || [];
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const filteredCards = getFilteredAndSortedCards();
    
    if (filteredCards.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < filteredCards.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev > 0 ? prev - 1 : 0
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue) {
        const selectedCard = filteredCards[highlightedIndex];
        if (selectedCard) {
          handleSelect(selectedCard);
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
    }
  };

  const filteredCards = getFilteredAndSortedCards();
  const showSuggestions = activeSuggestionIndex === index && inputValue;

  return (
    <div className="relative" style={{ zIndex: 50 - index }}>
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setActiveSuggestionIndex(index);
          setHighlightedIndex(0);
        }}
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
                {filteredCards.map((card, idx) => (
                  <CommandItem
                    key={card}
                    value={card}
                    onSelect={() => handleSelect(card)}
                    className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      idx === highlightedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
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