/**
 * Email Alert Architecture (scalable — full delivery not implemented)
 *
 * Alert types:
 * - idle_resource_detected
 * - potential_saving_available
 * - high_cost_alert
 *
 * Flow: enqueue → worker processes → sendAlertEmail
 */

import pool from "../../database/pool.js";

export const ALERT_TYPES = {
  IDLE_RESOURCE: "idle_resource_detected",
  POTENTIAL_SAVING: "potential_saving_available",
  HIGH_COST: "high_cost_alert",
};

export const subscribeUserToAlerts = async (userId, alertType) => {
  await pool.query(
    `INSERT INTO alert_subscriptions (user_id, alert_type, enabled)
     VALUES ($1, $2, true)
     ON CONFLICT (user_id, alert_type) DO UPDATE SET enabled = true`,
    [userId, alertType]
  );
};

export const enqueueAlert = async (userId, alertType, payload = {}) => {
  const result = await pool.query(
    `INSERT INTO alert_queue (user_id, alert_type, payload, status)
     VALUES ($1, $2, $3, 'pending')
     RETURNING id`,
    [userId, alertType, JSON.stringify(payload)]
  );
  return result.rows[0];
};

/** Worker stub — call from cron/job later */
export const processAlertQueue = async () => {
  const { rows } = await pool.query(
    `SELECT q.*, u.email, u.full_name
     FROM alert_queue q
     JOIN users u ON u.id = q.user_id
     WHERE q.status = 'pending'
     ORDER BY q.scheduled_at ASC
     LIMIT 50`
  );

  for (const row of rows) {
    // Future: await sendAlertEmail(row.email, buildSubject(row.alert_type), buildBody(row))
    await pool.query(
      `UPDATE alert_queue SET status = 'queued_stub', sent_at = NULL WHERE id = $1`,
      [row.id]
    );
  }

  return { processed: rows.length, note: "Alert delivery stub — wire sendAlertEmail in production" };
};

export const seedDefaultSubscriptions = async (userId) => {
  for (const type of Object.values(ALERT_TYPES)) {
    await subscribeUserToAlerts(userId, type);
  }
};
