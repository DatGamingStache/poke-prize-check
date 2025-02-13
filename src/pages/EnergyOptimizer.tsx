
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StatsCard from "@/components/stats/StatsCard";
import { Checkbox } from "@/components/ui/checkbox";

const EnergyOptimizer = () => {
  const [value, setValue] = useState<number>(64);
  const [cards, setCards] = useState<number>(24);
  const [price, setPrice] = useState<number>(6.13);
  
  // Fixed rates from the image
  const SALES_COMMISSION = 0.08; // 8.0%
  const RATE_PRO_FEE = 0.029; // 2.9%
  const FLAT_PRO_FEE = 0.30; // $0.30
  const SHIPPING = 0.73; // $0.73
  const TAX_RATE = 0.09; // 9%

  // Calculated values
  const calculateResults = () => {
    const salePrice = price;
    const commission = salePrice * SALES_COMMISSION;
    const rateFee = salePrice * RATE_PRO_FEE;
    const totalDeductions = commission + rateFee + FLAT_PRO_FEE + SHIPPING;
    const takeHome = salePrice - totalDeductions;
    const breakeven = takeHome; // In this case they're equal based on the image

    return {
      salePrice: salePrice.toFixed(2),
      commission: commission.toFixed(2),
      rateFee: rateFee.toFixed(2),
      flatFee: FLAT_PRO_FEE.toFixed(2),
      takeHome: takeHome.toFixed(2),
      breakeven: breakeven.toFixed(2)
    };
  };

  const results = calculateResults();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-8">Energy Pull Game Optimizer</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Config Settings</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="value">Value</Label>
              <div className="flex items-center space-x-2">
                <Checkbox checked />
                <Input
                  id="value"
                  type="number"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="bg-red-100"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="cards">Cards</Label>
              <div className="flex items-center space-x-2">
                <Checkbox checked />
                <Input
                  id="cards"
                  type="number"
                  value={cards}
                  onChange={(e) => setCards(Number(e.target.value))}
                  className="bg-green-100"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="price">Price</Label>
              <div className="flex items-center space-x-2">
                <Checkbox checked={false} />
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="bg-blue-100"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">WhatNot Settings</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Sales Commission</span>
              <span>{(SALES_COMMISSION * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Rate Pro Fee</span>
              <span>{(RATE_PRO_FEE * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Flat Pro Fee</span>
              <span>${FLAT_PRO_FEE.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Shipping</span>
              <span>${SHIPPING.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Tax</span>
              <span>{(TAX_RATE * 100)}%</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard
          title="Sale Price"
          value={`$${results.salePrice}`}
        />
        <StatsCard
          title="Commission"
          value={`$${results.commission}`}
        />
        <StatsCard
          title="Rate Pro Fee"
          value={`$${results.rateFee}`}
        />
        <StatsCard
          title="Flat Pro Fee"
          value={`$${results.flatFee}`}
        />
        <StatsCard
          title="Take Home"
          value={`$${results.takeHome}`}
          subtitle="After fees and shipping"
        />
        <StatsCard
          title="Breakeven"
          value={`$${results.breakeven}`}
        />
      </div>

      <Card className="p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Find card value on TCGPlayer</li>
          <li>Enter in "Value" (red)</li>
          <li>Enter # of cards (green)</li>
          <li>Set price to above "price" (blue)</li>
          <li>Review "take home" (yellow)</li>
        </ol>
      </Card>
    </div>
  );
};

export default EnergyOptimizer;
