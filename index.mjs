import { Bot } from "grammy";

const bot = new Bot("YOUR_BOT_TOKEN");

const paidUsers = new Map();

bot.command("start", (ctx) =>
  ctx.reply(
    `
    /buy - to buy loaf
    /payStatus - to check payment status
    /refund - to refund stars
    /payLink - to get invoice can be used in app
`
  )
);

bot.command("buy", (ctx) => {
  return ctx.replyWithInvoice(
    "Loaf",
    "Loaf token",
    "{}",
    "XTR",
    [{ amount: 1, label: "Loaf" }],
    {
      photo_url:
        "https://loaftoken.com/_next/static/media/small-logo.c4a32b4b.png",
      photo_height: "80px",
      photo_width: "80px",
    }
  );
});

bot.command("payLink", async (ctx) => {
  const link = await ctx.api.createInvoiceLink(
    "Loaf",
    "Loaf token",
    "{}",
    "",
    "XTR",
    [{ amount: 1, label: "Loaf" }],
    {
      photo_url:
        "https://loaftoken.com/_next/static/media/small-logo.c4a32b4b.png",
      photo_height: "80px",
      photo_width: "80px",
    }
  );

  return ctx.reply(link);
});

bot.on("pre_checkout_query", (ctx) => {
  return ctx.answerPreCheckoutQuery(true).catch(() => {
    console.error("answerPreCheckoutQuery failed");
  });
});

bot.on("message:successful_payment", (ctx) => {
  if (!ctx.message || !ctx.message.successful_payment || !ctx.from) {
    return;
  }

  paidUsers.set(
    ctx.from.id,
    ctx.message.successful_payment.telegram_payment_charge_id
  );

  console.log(ctx.message.successful_payment);
});

bot.command("payStatus", (ctx) => {
  const message = paidUsers.has(ctx.from.id)
    ? "You have paid"
    : "You have not paid yet";
  return ctx.reply(message);
});

bot.command("refund", (ctx) => {
  const userId = ctx.from.id;
  if (!paidUsers.has(userId)) {
    return ctx.reply("You have not paid yet, there is nothing to refund");
  }

  ctx.api
    .refundStarPayment(userId, paidUsers.get(userId))
    .then(() => {
      paidUsers.delete(userId);
      return ctx.reply("Refund successful");
    })
    .catch(() => ctx.reply("Refund failed"));
});

bot.start();
