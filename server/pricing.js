export function marketPrices(yesShares, noShares, liquidity = 500) {
  const yes = Math.exp(yesShares / liquidity)
  const no = Math.exp(noShares / liquidity)
  const yesPrice = (yes / (yes + no)) * 100

  return {
    yesPrice,
    noPrice: 100 - yesPrice,
  }
}