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
  onBuy: (id: string, cost: number) => void;
}

export default function ShopItem({ id, title, description, cost, userPoints, imageUrl, onBuy }: ShopItemProps) {
  const canAfford = userPoints >= cost;

  return (
    <div className={`glass-panel ${styles.item}`}>
      <h3 className={styles.title}>{title}</h3>
      
      {imageUrl ? (
        <div className={styles.imageWrapper} style={{ aspectRatio: "1 / 1", width: "100%", height: "auto" }}>
          <img src={imageUrl} alt={title} className={styles.image} style={{ width: "100%", height: "100%", objectFit: "fill", aspectRatio: "1 / 1" }} />
        </div>
      ) : (
        <div className={styles.imagePlaceholder}>
          <Gem size={32} opacity={0.5} />
        </div>
      )}
      
      <p className={styles.description}>{description}</p>
      
      <div className={styles.cost}>
        <Gem size={18} color="#00e5ff" /> {cost}
      </div>
      
      <Button 
        onClick={() => onBuy(id, cost)} 
        disabled={!canAfford}
        variant={canAfford ? "primary" : "disabled"}
        style={{ width: "100%", marginTop: "auto" }}
      >
        {canAfford ? "Koupit" : "Nedostatek bodů"}
      </Button>
    </div>
  );
}
