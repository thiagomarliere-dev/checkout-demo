require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const fetch   = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("."));

const YUNO_BASE_URL = "https://api-sandbox.y.uno/v1";

function yunoHeaders() {
  return {
    "Content-Type":      "application/json",
    "X-Account-Code":    process.env.YUNO_ACCOUNT_CODE,
    "account-code":      process.env.YUNO_ACCOUNT_CODE,
    "public-api-key":    process.env.YUNO_PUBLIC_API_KEY,
    "private-secret-key": process.env.YUNO_PRIVATE_SECRET_KEY,
  };
}

// POST /api/customer — create a Yuno customer
app.post("/api/customer", async (req, res) => {
  try {
    const { name } = req.body;
    const [firstName, ...rest] = name.trim().split(" ");
    const lastName = rest.join(" ") || "N/A";

    const response = await fetch(`${YUNO_BASE_URL}/customers`, {
      method: "POST",
      headers: yunoHeaders(),
      body: JSON.stringify({
        merchant_customer_id: `customer_${Date.now()}`,
        first_name: firstName,
        last_name:  lastName,
        country:    "BR",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[/api/customer] Error:", data);
      return res.status(response.status).json({ error: data });
    }

    res.json({ customer_id: data.id });
  } catch (err) {
    console.error("[/api/customer] Internal error:", err);
    res.status(500).json({ error: "Internal error creating customer." });
  }
});

// POST /api/checkout-session — create a Yuno checkout session
app.post("/api/checkout-session", async (req, res) => {
  try {
    const { customer_id, amount } = req.body;

    const response = await fetch(`${YUNO_BASE_URL}/checkout/sessions`, {
      method: "POST",
      headers: yunoHeaders(),
      body: JSON.stringify({
        merchant_order_id:   `order_${Date.now()}`,
        payment_description: "Yunique Fashion Store — Checkout",
        country:             "BR",
        account_id:          process.env.YUNO_ACCOUNT_CODE,
        customer_id,
        amount: {
          currency: "BRL",
          value:    Number(amount),
        },
      }),
    });

    const data = await response.json();

    console.log("\n─── POST /api/checkout-session ──────────────");
    console.log("Status  :", response.status);
    console.log("Session :", data.checkout_session);
    console.log("─────────────────────────────────────────────\n");

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    res.json({ checkout_session: data.checkout_session });
  } catch (err) {
    console.error("[/api/checkout-session] Internal error:", err);
    res.status(500).json({ error: "Internal error creating checkout session." });
  }
});

// POST /api/payment — receive one_time_token from FULL SDK and create payment
app.post("/api/payment", async (req, res) => {
  try {
    const { checkout_session, one_time_token, amount, customer_id } = req.body;

    const idempotencyKey = `payment_${Date.now()}`;
    const endpoint       = `${YUNO_BASE_URL}/payments`;

    const payload = {
      account_id:        process.env.YUNO_ACCOUNT_CODE,
      description:       "Yunique Fashion Store — Oversized Wool Blazer",
      merchant_order_id: idempotencyKey,
      country:           "BR",
      checkout:          { session: checkout_session },
      customer_payer:    { id: customer_id },
      payment_method:    { token: one_time_token },
      amount: {
        currency: "BRL",
        value:    Number(amount),
      },
    };

    console.log("\n─── POST /api/payment ───────────────────────");
    console.log("Token     :", one_time_token);
    console.log("Endpoint  :", endpoint);
    console.log("Payload   :", JSON.stringify(payload, null, 2));

    const response = await fetch(endpoint, {
      method:  "POST",
      headers: { ...yunoHeaders(), "X-Idempotency-Key": idempotencyKey },
      body:    JSON.stringify(payload),
    });

    const data = await response.json();

    console.log("Status    :", response.status);
    console.log("Response  :", JSON.stringify(data, null, 2));
    console.log("─────────────────────────────────────────────\n");

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    res.json({
      payment_id: data.id,
      status:     data.payment_workflow_status || data.status,
    });
  } catch (err) {
    console.error("[/api/payment] Internal error:", err);
    res.status(500).json({ error: "Internal error processing payment." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  Yunique Fashion Store — Checkout Demo`);
  console.log(`  Server running at http://localhost:${PORT}\n`);
});
