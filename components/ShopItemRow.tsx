import React from "react";
import { Gem } from "lucide-react";
import Button from "./Button";
import { formatPoints } from "@/lib/format";
import GemIcon from "./GemIcon";



interface ShopItemRowProps {
  id: string;
  title: string;
  description: string;
  cost: number;
  userPoints: number;
  category: string;
  imageUrl?: string;
  stock?: number;
  onBuy: (id: string, cost: number) => void;
}

export default function ShopItemRow({ 
  id, title, description, cost, userPoints, category, imageUrl, stock = -1, onBuy 
}: ShopItemRowProps) {
  const canAfford = userPoints >= cost;
  const isSoldOut = stock === 0;

  const getStockLabel = () => {
    if (stock === -1) return <span className="shop-stock-unlimited">Neomezeno</span>;
    if (stock === 0) return <span className="shop-stock-empty">Vyprodáno</span>;
    if (stock < 5) return <span className="shop-stock-low">{stock} ks</span>;
    return <span>{stock} ks</span>;
  };

  return (
    <div className="shop-list-row">
      <div className="shop-col-item">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="shop-item-thumb" />
        ) : (
          <div className="shop-item-thumb" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GemIcon size={20} />

          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span className="shop-item-name">{title}</span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {description}
          </span>
        </div>
      </div>

      <div className="shop-col-category">
        {category === "cs2" ? "Counter Strike 2" : (category === "minecraft" ? "Minecraft" : "Ostatní")}
      </div>

      <div className="shop-col-price">
        <GemIcon size={16} /> {formatPoints(cost)}


      </div>

      <div className="shop-col-stock">
        {getStockLabel()}
      </div>

      <div className="shop-col-actions">
        <Button 
          onClick={() => onBuy(id, cost)} 
          disabled={!canAfford || isSoldOut}
          variant={isSoldOut ? "disabled" : (canAfford ? "primary" : "disabled")}
          style={{ padding: "0.5rem 1.2rem", fontSize: "0.85rem", height: "36px" }}
        >
          {isSoldOut ? "Není" : "Koupit"}
        </Button>
      </div>
    </div>
  );
}
