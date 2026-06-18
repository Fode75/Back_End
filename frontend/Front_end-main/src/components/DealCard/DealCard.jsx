// src/components/DealCard/DealCard.jsx
import { useBot } from '../../context/BotContext'
import styles from './DealCard.module.css'

function getDiscount(price, original) {
  if (!original || original <= price) return 0
  return Math.round((1 - price / original) * 100)
}

function DealCard({ deal, onAnalyze }) {
  const { isSaved, toggleSaved } = useBot()
  const saved = isSaved(deal.id)
  const discount = getDiscount(deal.price, deal.originalPrice)

  return (
    <div className={styles.card}>
      <div className={styles.imgWrap}>
        {deal.image
          ? <img src={deal.image} alt={deal.name} className={styles.img} />
          : <div className={styles.imgPlaceholder}>{deal.emoji || '🏷️'}</div>
        }
        <button
          className={`${styles.star} ${saved ? styles.starSaved : ''}`}
          onClick={() => toggleSaved(deal.id)}
        >{saved ? '★' : '☆'}</button>
        {discount > 0 && <span className={styles.discount}>−{discount}%</span>}
        <span className={`${styles.score} ${deal.score >= 90 ? styles.scoreHot : styles.scoreGood}`}>
          {deal.score}/100</span><span className={styles.platform}>{(deal.platform||"vinted").toUpperCase()}
        </span>
      </div>

      <div className={styles.body}>
        <p className={styles.brand}>{deal.brand}</p>
        <h3 className={styles.name}>{deal.name}</h3>
        <div className={styles.prices}>
          <span className={styles.current}>{deal.price} €</span>
          {deal.originalPrice && <span className={styles.original}>{deal.originalPrice} €</span>}
        </div>
        <p className={styles.meta}>
          {deal.condition}{deal.city ? ` · ${deal.city}` : ''}{deal.size ? ` · T.${deal.size}` : ''}
        </p>
        <div className={styles.actions}>
          <a href={deal.url || '#'} className={styles.btnView} target="_blank" rel="noreferrer">
            Voir
          </a>
          <button className={styles.btnAI} onClick={() => onAnalyze && onAnalyze(deal)}>
            Analyser IA
          </button>
        </div>
      </div>
    </div>
  )
}

export default DealCard
