const db = require('../config/db');

class Report {

  // ─── DAILY ───────────────────────────────────────────
  static async getDaily(date) {
    try {
      // Games gain: SUM of sale_items where item_type='game' for that date
      const [gamesRows] = await db.query(`
        SELECT
          si.item_name,
          SUM(si.quantity)  AS quantity,
          SUM(si.total)     AS gain
        FROM sale_items si
        JOIN sales s ON s.id = si.sale_id
        WHERE si.item_type = 'game'
          AND DATE(s.sale_date) = ?
        GROUP BY si.item_name
      `, [date]);

      // Products gain: SUM((price - initial_price) * quantity) for that date
      const [productsRows] = await db.query(`
        SELECT
          si.item_name,
          SUM(si.quantity)                                         AS quantity,
          si.price                                                 AS sell_price,
          p.initial_price,
          SUM((si.price - COALESCE(p.initial_price, 0)) * si.quantity) AS gain
        FROM sale_items si
        JOIN sales s ON s.id = si.sale_id
        LEFT JOIN products p ON p.id = si.item_id
        WHERE si.item_type = 'product'
          AND DATE(s.sale_date) = ?
        GROUP BY si.item_name, si.price, p.initial_price
      `, [date]);

      // Expenses for that date
      const [expensesRows] = await db.query(`
        SELECT description, amount
        FROM expenses
        WHERE DATE(date) = ?
        ORDER BY created_at ASC
      `, [date]);

      // Total Revenue (all sales)
      const [revenueRows] = await db.query(`
        SELECT SUM(si.total) AS total_revenue
        FROM sale_items si
        JOIN sales s ON s.id = si.sale_id
        WHERE DATE(s.sale_date) = ?
      `, [date]);

      // Total Product Costs
      const [costRows] = await db.query(`
        SELECT SUM(COALESCE(p.initial_price, 0) * si.quantity) AS product_costs
        FROM sale_items si
        JOIN sales s ON s.id = si.sale_id
        LEFT JOIN products p ON p.id = si.item_id
        WHERE si.item_type = 'product'
          AND DATE(s.sale_date) = ?
      `, [date]);

      // Totals
      const total_revenue  = parseFloat(revenueRows[0]?.total_revenue || 0);
      const product_costs  = parseFloat(costRows[0]?.product_costs || 0);
      const games_gain     = gamesRows.reduce((sum, r) => sum + parseFloat(r.gain || 0), 0);
      const products_gain  = productsRows.reduce((sum, r) => sum + parseFloat(r.gain || 0), 0);
      const total_gain     = games_gain + products_gain;
      const total_expenses = expensesRows.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
      const net_profit     = total_gain - total_expenses;

      return {
        date,
        total_revenue,
        product_costs,
        games_gain,
        products_gain,
        total_gain,
        total_expenses,
        net_profit,
        breakdown: {
          games:    gamesRows,
          products: productsRows,
          expenses: expensesRows
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // ─── WEEKLY ──────────────────────────────────────────
  static async getWeekly(start_date, end_date) {
    try {
      const [gamesRows] = await db.query(`
        SELECT
          si.item_name,
          SUM(si.quantity)  AS quantity,
          SUM(si.total)     AS gain
        FROM sale_items si
        JOIN sales s ON s.id = si.sale_id
        WHERE si.item_type = 'game'
          AND DATE(s.sale_date) BETWEEN ? AND ?
        GROUP BY si.item_name
      `, [start_date, end_date]);

      const [productsRows] = await db.query(`
        SELECT
          si.item_name,
          SUM(si.quantity)                                              AS quantity,
          si.price                                                      AS sell_price,
          p.initial_price,
          SUM((si.price - COALESCE(p.initial_price, 0)) * si.quantity) AS gain
        FROM sale_items si
        JOIN sales s ON s.id = si.sale_id
        LEFT JOIN products p ON p.id = si.item_id
        WHERE si.item_type = 'product'
          AND DATE(s.sale_date) BETWEEN ? AND ?
        GROUP BY si.item_name, si.price, p.initial_price
      `, [start_date, end_date]);

      const [expensesRows] = await db.query(`
        SELECT description, amount, date
        FROM expenses
        WHERE DATE(date) BETWEEN ? AND ?
        ORDER BY date ASC
      `, [start_date, end_date]);

      // Total Revenue
      const [revenueRows] = await db.query(`
        SELECT SUM(si.total) AS total_revenue
        FROM sale_items si
        JOIN sales s ON s.id = si.sale_id
        WHERE DATE(s.sale_date) BETWEEN ? AND ?
      `, [start_date, end_date]);

      // Product Costs
      const [costRows] = await db.query(`
        SELECT SUM(COALESCE(p.initial_price, 0) * si.quantity) AS product_costs
        FROM sale_items si
        JOIN sales s ON s.id = si.sale_id
        LEFT JOIN products p ON p.id = si.item_id
        WHERE si.item_type = 'product'
          AND DATE(s.sale_date) BETWEEN ? AND ?
      `, [start_date, end_date]);

      // Daily breakdown for chart
      const [dailyRows] = await db.query(`
        SELECT
          DATE(s.sale_date) AS day,
          SUM(CASE WHEN si.item_type = 'game' THEN si.total ELSE 0 END) AS games_gain,
          SUM(CASE WHEN si.item_type = 'product'
            THEN (si.price - COALESCE(p.initial_price, 0)) * si.quantity
            ELSE 0 END) AS products_gain
        FROM sale_items si
        JOIN sales s ON s.id = si.sale_id
        LEFT JOIN products p ON p.id = si.item_id AND si.item_type = 'product'
        WHERE DATE(s.sale_date) BETWEEN ? AND ?
        GROUP BY DATE(s.sale_date)
        ORDER BY day ASC
      `, [start_date, end_date]);

      const total_revenue  = parseFloat(revenueRows[0]?.total_revenue || 0);
      const product_costs  = parseFloat(costRows[0]?.product_costs || 0);
      const games_gain     = gamesRows.reduce((sum, r) => sum + parseFloat(r.gain || 0), 0);
      const products_gain  = productsRows.reduce((sum, r) => sum + parseFloat(r.gain || 0), 0);
      const total_gain     = games_gain + products_gain;
      const total_expenses = expensesRows.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
      const net_profit     = total_gain - total_expenses;

      return {
        start_date,
        end_date,
        total_revenue,
        product_costs,
        games_gain,
        products_gain,
        total_gain,
        total_expenses,
        net_profit,
        breakdown: {
          games:    gamesRows,
          products: productsRows,
          expenses: expensesRows,
          daily:    dailyRows
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // ─── MONTHLY ─────────────────────────────────────────
  static async getMonthly(month, year) {
    try {
      const [gamesRows] = await db.query(`
        SELECT
          si.item_name,
          SUM(si.quantity)  AS quantity,
          SUM(si.total)     AS gain
        FROM sale_items si
        JOIN sales s ON s.id = si.sale_id
        WHERE si.item_type = 'game'
          AND MONTH(s.sale_date) = ?
          AND YEAR(s.sale_date)  = ?
        GROUP BY si.item_name
      `, [month, year]);

      const [productsRows] = await db.query(`
        SELECT
          si.item_name,
          SUM(si.quantity)                                              AS quantity,
          si.price                                                      AS sell_price,
          p.initial_price,
          SUM((si.price - COALESCE(p.initial_price, 0)) * si.quantity) AS gain
        FROM sale_items si
        JOIN sales s ON s.id = si.sale_id
        LEFT JOIN products p ON p.id = si.item_id
        WHERE si.item_type = 'product'
          AND MONTH(s.sale_date) = ?
          AND YEAR(s.sale_date)  = ?
        GROUP BY si.item_name, si.price, p.initial_price
      `, [month, year]);

      const [expensesRows] = await db.query(`
        SELECT description, amount, date
        FROM expenses
        WHERE MONTH(date) = ? AND YEAR(date) = ?
        ORDER BY date ASC
      `, [month, year]);

      // Total Revenue
      const [revenueRows] = await db.query(`
        SELECT SUM(si.total) AS total_revenue
        FROM sale_items si
        JOIN sales s ON s.id = si.sale_id
        WHERE MONTH(s.sale_date) = ? AND YEAR(s.sale_date) = ?
      `, [month, year]);

      // Product Costs
      const [costRows] = await db.query(`
        SELECT SUM(COALESCE(p.initial_price, 0) * si.quantity) AS product_costs
        FROM sale_items si
        JOIN sales s ON s.id = si.sale_id
        LEFT JOIN products p ON p.id = si.item_id
        WHERE si.item_type = 'product'
          AND MONTH(s.sale_date) = ? AND YEAR(s.sale_date) = ?
      `, [month, year]);

      // Weekly breakdown inside the month
      const [weeklyRows] = await db.query(`
        SELECT
          WEEK(s.sale_date, 1)  AS week_number,
          MIN(DATE(s.sale_date)) AS week_start,
          SUM(CASE WHEN si.item_type = 'game' THEN si.total ELSE 0 END) AS games_gain,
          SUM(CASE WHEN si.item_type = 'product'
            THEN (si.price - COALESCE(p.initial_price, 0)) * si.quantity
            ELSE 0 END) AS products_gain
        FROM sale_items si
        JOIN sales s ON s.id = si.sale_id
        LEFT JOIN products p ON p.id = si.item_id AND si.item_type = 'product'
        WHERE MONTH(s.sale_date) = ? AND YEAR(s.sale_date) = ?
        GROUP BY WEEK(s.sale_date, 1)
        ORDER BY week_number ASC
      `, [month, year]);

      const total_revenue  = parseFloat(revenueRows[0]?.total_revenue || 0);
      const product_costs  = parseFloat(costRows[0]?.product_costs || 0);
      const games_gain     = gamesRows.reduce((sum, r) => sum + parseFloat(r.gain || 0), 0);
      const products_gain  = productsRows.reduce((sum, r) => sum + parseFloat(r.gain || 0), 0);
      const total_gain     = games_gain + products_gain;
      const total_expenses = expensesRows.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
      const net_profit     = total_gain - total_expenses;

      return {
        month,
        year,
        total_revenue,
        product_costs,
        games_gain,
        products_gain,
        total_gain,
        total_expenses,
        net_profit,
        breakdown: {
          games:    gamesRows,
          products: productsRows,
          expenses: expensesRows,
          weekly:   weeklyRows
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Report;