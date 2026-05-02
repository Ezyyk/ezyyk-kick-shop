import React from "react";
import styles from "./ShopItem.module.css";
import Button from "./Button";
import { formatPoints } from "@/lib/format";
import GemIcon from "./GemIcon";

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

export default function ShopItem({ 
  id, 
  title, 
  description, 
  cost, 
  userPoints, 
  imageUrl, 
  stock = -1, 
  imageScale = 1.0, 
  onBuy 
}: ShopItemProps) {
  const canAfford = userPoints >= cost;
  const isSoldOut = stock === 0;

  return (
    <div className={`glass-panel ${styles.item}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {description && (
          <div className={styles.subtitleBadge}>
            {description}
          </div>
        )}
      </div>
      
      <div className={styles.content}>
        {imageUrl ? (
          <div className={styles.imageWrapper}>
            <img 
              src={imageUrl} 
              alt={title} 
              className={styles.image} 
              style={{ "--image-scale": imageScale } as React.CSSProperties} 
            />
          </div>
        ) : (
          <div className={styles.imagePlaceholder}>
            <GemIcon size={32} />
          </div>
        )}
      </div>
      
      <div className={styles.footer}>
        <div className={styles.priceSection}>
          <div className={styles.costBox}>
            <div className={styles.cost}>
              <GemIcon size={22} color="#00e5ff" />
              <span>{formatPoints(cost)}</span>
            </div>
            {stock !== -1 && (
              <div className={styles.stockBadge}>
                {isSoldOut ? "VYPRODÁNO" : `${stock} KS SKLADEM`}
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.actionSection}>
          <Button 
            onClick={() => onBuy(id, cost)} 
            disabled={!canAfford || isSoldOut}
            variant={isSoldOut ? "disabled" : (canAfford ? "primary" : "disabled")}
            className={styles.buyButton}
          >
            {isSoldOut ? "Vyprodáno" : (canAfford ? "Koupit" : "Nedostatek bodů")}
          </Button>
        </div>
      </div>
    </div>
  );
}
