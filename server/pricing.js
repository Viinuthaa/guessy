export function lmsrProbability(yesShares, noShares, liquidity = 100) {
  const yes = Math.exp(yesShares / liquidity)
  const no = Math.exp(noShares / liquidity)

  return yes / (yes + no)
}

export function marketPrices(yesShares, noShares) {
  const yes = lmsrProbability(yesShares, noShares)

  return {
    yesPrice: yes * 100,
    noPrice: (1 - yes) * 100,
  }
}