import React from 'react'

const PACKAGES = [
  { name: '25 Diamond', points: 20, sellPrice: 20, formula: 'Direct' },
  { name: '50 Diamond', points: 36, sellPrice: 36, formula: 'Direct' },
  { name: '115 Diamond', points: 80, sellPrice: 95, formula: 'Direct' },
  { name: '240 Diamond', points: 160, sellPrice: 190, formula: 'Direct' },
  { name: '355 Diamond', points: 240, sellPrice: 290, formula: '115 + 240' },
  { name: '480 Diamond', points: 320, sellPrice: 390, formula: '240 + 240' },
  { name: '610 Diamond', points: 405, sellPrice: 490, formula: 'Direct' },
  { name: '725 Diamond', points: 485, sellPrice: 580, formula: '610 + 115' },
  { name: '850 Diamond', points: 565, sellPrice: 680, formula: '610 + 240' },
  { name: '1090 Diamond', points: 725, sellPrice: 870, formula: '610 + 240 + 240' },
  { name: '1240 Diamond', points: 810, sellPrice: 970, formula: 'Direct' },
  { name: '1720 Diamond', points: 1130, sellPrice: 1340, formula: '1240 + 240 + 240' },
  { name: '2090 Diamond', points: 1375, sellPrice: 1700, formula: '1240 + 610 + 240' },
  { name: '2530 Diamond', points: 1625, sellPrice: 1910, formula: 'Direct' },
  { name: '3770 Diamond', points: 2435, sellPrice: 2860, formula: '2530 + 1240' },
  { name: '5060 Diamond', points: 3250, sellPrice: 3800, formula: '2530 + 2530' },
  { name: '10120 Diamond', points: 6500, sellPrice: 7600, formula: '5060 + 5060' },
  { name: 'Weekly Membership (445💎)', points: 161, sellPrice: 190, formula: 'Direct' },
  { name: 'Monthly Membership (2500💎)', points: 800, sellPrice: 950, formula: 'Direct' },
]

function toSafeNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatDateTime(timestamp) {
  return new Date(timestamp).toLocaleString('en-NP')
}

function calculateSalePreview({ stockPoints, stockCostValue, selectedItems }) {
  const safeStockPoints = Math.max(0, toSafeNumber(stockPoints))
  const safeStockCostValue = Math.max(0, toSafeNumber(stockCostValue))
  const averageCostPerPoint = safeStockPoints > 0 ? safeStockCostValue / safeStockPoints : 0
  const usedPoints = selectedItems.reduce((sum, item) => sum + item.points * item.qty, 0)
  const sales = selectedItems.reduce((sum, item) => sum + item.sellPrice * item.qty, 0)
  const usedCost = usedPoints * averageCostPerPoint
  const profit = sales - usedCost
  const remainingPointsAfterSale = Math.max(safeStockPoints - usedPoints, 0)
  const remainingStockValueAfterSale = Math.max(safeStockCostValue - usedCost, 0)
  const hasEnoughStock = usedPoints <= safeStockPoints

  return {
    averageCostPerPoint,
    usedPoints,
    sales,
    usedCost,
    profit,
    remainingPointsAfterSale,
    remainingStockValueAfterSale,
    hasEnoughStock,
  }
}

const cardStyle = {
  background: 'linear-gradient(180deg, #172033 0%, #101827 100%)',
  padding: '16px',
  borderRadius: '18px',
  border: '1px solid #273449',
  boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
}

const inputStyle = {
  width: '100%',
  padding: '11px 12px',
  borderRadius: '12px',
  border: '1px solid #334155',
  background: '#0f172a',
  color: 'white',
  outline: 'none',
}

const pillButton = {
  width: '36px',
  height: '36px',
  borderRadius: '999px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '20px',
  fontWeight: 'bold',
}

export default function App() {

  React.useEffect(() => {
    const loadData = async () => {
      const querySnapshot = await getDocs(collection(db, "sales"))
      const data = querySnapshot.docs.map(doc => doc.data())
      setHistory(data.reverse())
    }

    loadData()
  }, [])
  const [voucherPrice, setVoucherPrice] = React.useState(2225)
  const [pointsPerVoucher, setPointsPerVoucher] = React.useState(2000)
  const [voucherCount, setVoucherCount] = React.useState(2)
  const [selectedItems, setSelectedItems] = React.useState(() =>
    PACKAGES.map((item) => ({ ...item, qty: 0 }))
  )
  const [history, setHistory] = React.useState(() => {
    try {
      const saved = localStorage.getItem('ff_history')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [inventory, setInventory] = React.useState(() => {
    try {
      const saved = localStorage.getItem('ff_inventory')
      return saved
        ? JSON.parse(saved)
        : {
            stockPoints: 0,
            stockCostValue: 0,
            totalPurchasedPoints: 0,
            totalPurchaseCost: 0,
          }
    } catch {
      return {
        stockPoints: 0,
        stockCostValue: 0,
        totalPurchasedPoints: 0,
        totalPurchaseCost: 0,
      }
    }
  })

  const updateQty = (index, qty) => {
    setSelectedItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, qty: Math.max(0, toSafeNumber(qty)) } : item
      )
    )
  }

  const incrementQty = (index) => {
    setSelectedItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, qty: item.qty + 1 } : item))
    )
  }

  const decrementQty = (index) => {
    setSelectedItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, qty: Math.max(0, item.qty - 1) } : item
      )
    )
  }

  const resetQuantities = () => {
    setSelectedItems((prev) => prev.map((item) => ({ ...item, qty: 0 })))
  }

  const restockPoints = pointsPerVoucher * voucherCount
  const restockCost = voucherPrice * voucherCount

  const {
    averageCostPerPoint,
    usedPoints,
    sales,
    usedCost,
    profit,
    remainingPointsAfterSale,
    remainingStockValueAfterSale,
    hasEnoughStock,
  } = calculateSalePreview({
    stockPoints: inventory.stockPoints,
    stockCostValue: inventory.stockCostValue,
    selectedItems,
  })

  const addStock = () => {
    if (restockPoints <= 0 || restockCost <= 0) return

    const updatedInventory = {
      stockPoints: inventory.stockPoints + restockPoints,
      stockCostValue: inventory.stockCostValue + restockCost,
      totalPurchasedPoints: inventory.totalPurchasedPoints + restockPoints,
      totalPurchaseCost: inventory.totalPurchaseCost + restockCost,
    }

    setInventory(updatedInventory)
    localStorage.setItem('ff_inventory', JSON.stringify(updatedInventory))
    setVoucherCount(1)
  }

  const saveSale = () => {
    if (usedPoints <= 0 || !hasEnoughStock) return

    const soldItems = selectedItems
      .filter((item) => item.qty > 0)
      .map((item) => `${item.name} × ${item.qty}`)
      .join(', ')

    const entry = {
      id: Date.now(),
      sales,
      usedPoints,
      cost: usedCost,
      profit,
      soldItems,
      createdAt: Date.now(),
      stockAfter: remainingPointsAfterSale,
    }

    const updatedHistory = [entry, ...history]
    setHistory(updatedHistory)
    localStorage.setItem('ff_history', JSON.stringify(updatedHistory))

    const updatedInventory = {
      ...inventory,
      stockPoints: remainingPointsAfterSale,
      stockCostValue: remainingStockValueAfterSale,
    }
    setInventory(updatedInventory)
    localStorage.setItem('ff_inventory', JSON.stringify(updatedInventory))

    resetQuantities()
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('ff_history')
  }

  const clearInventory = () => {
    const cleared = {
      stockPoints: 0,
      stockCostValue: 0,
      totalPurchasedPoints: 0,
      totalPurchaseCost: 0,
    }
    setInventory(cleared)
    localStorage.setItem('ff_inventory', JSON.stringify(cleared))
  }

  const deleteHistoryItem = (id) => {
    const updated = history.filter((item) => item.id !== id)
    setHistory(updated)
    localStorage.setItem('ff_history', JSON.stringify(updated))
  }

  const totalHistorySales = history.reduce((sum, item) => sum + item.sales, 0)
  const totalHistoryProfit = history.reduce((sum, item) => sum + item.profit, 0)

  const formatNPR = (value) => `Rs ${Math.round(value)}`

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top, #1e293b 0%, #0f172a 45%, #020617 100%)',
        color: 'white',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
        <div
          style={{
            ...cardStyle,
            marginBottom: '20px',
            background:
              'linear-gradient(135deg, #0f172a 0%, #111827 55%, #14532d 100%)',
          }}
        >
          <h1 style={{ fontSize: '34px', marginBottom: '8px', fontWeight: 800 }}>
            🔥 Free Fire Profit Tracker
          </h1>
          <p style={{ color: '#cbd5e1', marginBottom: '0' }}>
            Full stock system with restock, auto deduction, and oversell warning.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div style={cardStyle}>
            <div style={{ color: '#94a3b8', fontSize: '14px' }}>Stock points</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#60a5fa' }}>
              {inventory.stockPoints}
            </div>
            {inventory.stockPoints > 0 && inventory.stockPoints < 500 && (
              <div
                style={{
                  marginTop: '6px',
                  color: '#facc15',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                ⚠️ Low stock
              </div>
            )}
          </div>
          <div style={cardStyle}>
            <div style={{ color: '#94a3b8', fontSize: '14px' }}>Stock value</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {formatNPR(inventory.stockCostValue)}
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{ color: '#94a3b8', fontSize: '14px' }}>Total saved sales</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {formatNPR(totalHistorySales)}
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{ color: '#94a3b8', fontSize: '14px' }}>Total saved profit</div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: totalHistoryProfit >= 0 ? '#86efac' : '#fca5a5',
              }}
            >
              {formatNPR(totalHistoryProfit)}
            </div>
          </div>
        </div>

        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: '16px' }}
        >
          <div style={cardStyle}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <h2 style={{ marginTop: 0 }}>Restock</h2>
              <button
                onClick={clearInventory}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#7f1d1d',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Clear Stock
              </button>
            </div>
            <div style={{ display: 'grid', gap: '12px', marginTop: '12px' }}>
              <div>
                <div style={{ marginBottom: '6px', color: '#cbd5e1' }}>
                  Price per voucher (Rs)
                </div>
                <input
                  type="number"
                  value={voucherPrice}
                  onChange={(e) => setVoucherPrice(toSafeNumber(e.target.value))}
                  style={inputStyle}
                />
              </div>
              <div>
                <div style={{ marginBottom: '6px', color: '#cbd5e1' }}>
                  Points in 1 voucher
                </div>
                <input
                  type="number"
                  value={pointsPerVoucher}
                  onChange={(e) => setPointsPerVoucher(toSafeNumber(e.target.value))}
                  style={inputStyle}
                />
              </div>
              <div>
                <div style={{ marginBottom: '6px', color: '#cbd5e1' }}>
                  Number of vouchers
                </div>
                <input
                  type="number"
                  value={voucherCount}
                  onChange={(e) => setVoucherCount(toSafeNumber(e.target.value))}
                  style={inputStyle}
                />
              </div>

              <div
                style={{
                  background: '#0f172a',
                  padding: '14px',
                  borderRadius: '14px',
                  border: '1px solid #273449',
                }}
              >
                <div>
                  New stock points: <b>{restockPoints}</b>
                </div>
                <div style={{ marginTop: 6 }}>
                  New stock cost: <b>{formatNPR(restockCost)}</b>
                </div>
                <div style={{ marginTop: 6 }}>
                  Avg cost per stock point:{' '}
                  <b style={{ color: '#86efac' }}>{formatNPR(averageCostPerPoint)}</b>
                </div>
              </div>

              <button
                onClick={addStock}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '14px',
                  border: 'none',
                  background: '#38bdf8',
                  color: '#082f49',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '15px',
                }}
              >
                Add Stock
              </button>
            </div>
          </div>

          <div style={cardStyle}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <h2 style={{ margin: 0 }}>Sold Products</h2>
              <button
                onClick={resetQuantities}
                style={{
                  padding: '9px 14px',
                  borderRadius: '999px',
                  border: '1px solid #334155',
                  background: '#1e293b',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Reset All
              </button>
            </div>

            <div
              style={{
                marginTop: '12px',
                display: 'grid',
                gap: '10px',
                maxHeight: '640px',
                overflowY: 'auto',
                paddingRight: '2px',
              }}
            >
              {selectedItems.map((item, i) => (
                <div
                  key={i}
                  style={{
                    background:
                      item.qty > 0
                        ? 'linear-gradient(135deg, #0f172a 0%, #132238 100%)'
                        : '#0f172a',
                    padding: '14px',
                    borderRadius: '16px',
                    border: item.qty > 0 ? '1px solid #22c55e' : '1px solid #273449',
                    transition: '0.2s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{item.name}</div>
                      <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: 4 }}>
                        Sell: {formatNPR(item.sellPrice)} • {item.points} points
                      </div>
                      <div style={{ fontSize: '12px', color: '#86efac', marginTop: 4 }}>
                        {item.formula}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        onClick={() => decrementQty(i)}
                        style={{ ...pillButton, background: '#334155', color: 'white' }}
                      >
                        −
                      </button>
                      <div
                        style={{
                          minWidth: '44px',
                          textAlign: 'center',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          background: '#1e293b',
                          padding: '8px 10px',
                          borderRadius: '12px',
                          border: '1px solid #334155',
                        }}
                      >
                        {item.qty}
                      </div>
                      <button
                        onClick={() => incrementQty(i)}
                        style={{ ...pillButton, background: '#22c55e', color: '#052e16' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Sale Preview</h2>
              <div style={{ display: 'grid', gap: '10px', marginTop: '12px' }}>
                <div
                  style={{
                    background: '#0f172a',
                    padding: '14px',
                    borderRadius: '14px',
                    border: '1px solid #273449',
                  }}
                >
                  <div style={{ color: '#94a3b8', fontSize: '14px' }}>Used points</div>
                  <div style={{ fontSize: '26px', fontWeight: 'bold' }}>{usedPoints}</div>
                </div>
                <div
                  style={{
                    background: '#0f172a',
                    padding: '14px',
                    borderRadius: '14px',
                    border: '1px solid #273449',
                  }}
                >
                  <div style={{ color: '#94a3b8', fontSize: '14px' }}>
                    Remaining stock after sale
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#60a5fa' }}>
                    {remainingPointsAfterSale}
                  </div>
                </div>
                <div
                  style={{
                    background: '#0f172a',
                    padding: '14px',
                    borderRadius: '14px',
                    border: '1px solid #273449',
                  }}
                >
                  <div style={{ color: '#94a3b8', fontSize: '14px' }}>Customer Payment</div>
                  <div style={{ fontSize: '26px', fontWeight: 'bold' }}>{formatNPR(sales)}</div>
                </div>
                <div
                  style={{
                    background: '#0f172a',
                    padding: '14px',
                    borderRadius: '14px',
                    border: '1px solid #273449',
                  }}
                >
                  <div style={{ color: '#94a3b8', fontSize: '14px' }}>Your Cost</div>
                  <div style={{ fontSize: '26px', fontWeight: 'bold' }}>{formatNPR(usedCost)}</div>
                </div>
              </div>
            </div>

            <div
              style={{
                ...cardStyle,
                background: hasEnoughStock
                  ? 'linear-gradient(135deg, #172033 0%, #14532d 100%)'
                  : 'linear-gradient(135deg, #2b1320 0%, #7f1d1d 100%)',
              }}
            >
              <div style={{ color: '#cbd5e1', fontSize: '14px' }}>Final profit / loss</div>
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: profit >= 0 ? '#86efac' : '#fca5a5',
                  marginTop: '8px',
                }}
              >
                {profit >= 0 ? 'Profit: ' : 'Loss: '}
                {formatNPR(Math.abs(profit))}
              </div>
              {!hasEnoughStock && (
                <div
                  style={{
                    marginTop: '10px',
                    color: '#fecaca',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  Not enough stock points. Add stock first.
                </div>
              )}
              <button
                onClick={saveSale}
                disabled={!hasEnoughStock || usedPoints <= 0}
                style={{
                  marginTop: '14px',
                  width: '100%',
                  padding: '13px',
                  borderRadius: '14px',
                  border: 'none',
                  background: !hasEnoughStock || usedPoints <= 0 ? '#475569' : '#22c55e',
                  color: !hasEnoughStock || usedPoints <= 0 ? '#cbd5e1' : '#052e16',
                  fontWeight: 'bold',
                  cursor:
                    !hasEnoughStock || usedPoints <= 0 ? 'not-allowed' : 'pointer',
                  fontSize: '15px',
                }}
              >
                Save Sale & Deduct Stock
              </button>
            </div>
          </div>
        </div>

        <div style={{ ...cardStyle, marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Sales History</h2>
            <button
              onClick={clearHistory}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: 'none',
                background: '#7f1d1d',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Clear All
            </button>
          </div>

          <div style={{ marginTop: '12px', display: 'grid', gap: '10px' }}>
            {history.length === 0 && <div style={{ color: '#94a3b8' }}>No sales yet</div>}
            {history.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#0f172a',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #273449',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div style={{ color: '#cbd5e1', fontSize: '14px' }}>
                      {formatDateTime(item.createdAt)}
                    </div>
                    <div style={{ marginTop: '6px' }}>{item.soldItems || 'Sale'}</div>
                    <div style={{ marginTop: '6px' }}>Sales: {formatNPR(item.sales)}</div>
                    <div>Points used: {item.usedPoints}</div>
                    <div>Cost: {formatNPR(item.cost)}</div>
                    <div>Stock after: {item.stockAfter}</div>
                    <div style={{ color: item.profit >= 0 ? '#86efac' : '#fca5a5' }}>
                      Profit: {formatNPR(item.profit)}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteHistoryItem(item.id)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#334155',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
