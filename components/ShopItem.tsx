import React from "react";
import styles from "./ShopItem.module.css";
import Button from "./Button";
import { Gem } from "lucide-react";

interface ShopItemProps {
  id: string;
  title: string;
  description: string;
  cost: number;
  userPoints: number;
  imageUrl?: string;
  stock?: number;
  imageScale?: number;
  onBuy: (id: string, cost: number) => void;
}

export default function ShopItem({ id, title, description, cost, userPoints, imageUrl, stock = -1, imageScale = 1.0, onBuy }: ShopItemProps) {
  const canAfford = userPoints >= cost;
  const isSoldOut = stock === 0;

  return (
    <div className={`glass-panel ${styles.item}`}>
      <h3 className={styles.title}>{title}</h3>
      
      {imageUrl ? (
        <div className={styles.imageWrapper}>
          <img 
            src={imageUrl} 
            alt={title} 
            className={styles.image} 
            style={{ transform: `scale(${imageScale})` }} 
          />
        </div>
      ) : (
        <div className={styles.imagePlaceholder}>
          <Gem size={32} opacity={0.5} />
        </div>
      )}
      
      <p className={styles.description}>{description}</p>
      
      <div className={styles.cost}>
        <Gem size={18} color="#00e5ff" /> {cost} {stock !== -1 && <span className={styles.stock}>({stock} ks)</span>}
      </div>
      
      <Button 
        onClick={() => onBuy(id, cost)} 
        disabled={!canAfford || isSoldOut}
        variant={isSoldOut ? "disabled" : (canAfford ? "primary" : "disabled")}
        style={{ width: "100%", marginTop: "auto" }}
      >
        {isSoldOut ? "Vyprodáno" : (canAfford ? "Koupit" : "Nedostatek bodů")}
      </Button>
    </div>
  );
}
