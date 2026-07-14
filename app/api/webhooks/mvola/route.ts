import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Subscription from "@/models/Subscription";
import { notify } from "@/lib/notify";
import { withApiErrors } from "@/lib/apiError";

// MVola appelle cette URL (X-Callback-URL fournie lors de l'initiation)
// pour notifier le résultat final de la transaction.
export const POST = withApiErrors(async (req: Request) => {
  const payload = await req.json();
  const reference = payload.originalTransactionReference ?? payload.requestingOrganisationTransactionReference;
  const status = payload.transactionStatus; // "completed" | "failed" selon la doc MVola

  await connectDB();
  const subscription = await Subscription.findOne({ mobileMoneyReference: reference });
  if (!subscription) return NextResponse.json({ received: true });

  if (status === "completed") {
    subscription.status = "active";
    await subscription.save();
    await notify({
      recipient: subscription.user.toString(),
      type: "payment",
      title: "Abonnement activé",
      message: "Ton paiement Mobile Money a été confirmé. Abonnement premium actif !",
      link: "/compte",
    });
  } else {
    subscription.status = "past_due";
    await subscription.save();
    await notify({
      recipient: subscription.user.toString(),
      type: "payment",
      title: "Paiement non abouti",
      message: "Ta transaction Mobile Money n'a pas pu être confirmée. Réessaie depuis ton compte.",
      link: "/abonnement",
    });
  }

  return NextResponse.json({ received: true });
});
