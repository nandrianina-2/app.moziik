import { Music, UserPlus, MessageCircle, CalendarDays, CreditCard, Megaphone } from "lucide-react";
import type { NotificationType } from "@/models/Notification";

export const notificationIcons: Record<NotificationType, typeof Music> = {
  new_song: Music,
  new_follower: UserPlus,
  comment: MessageCircle,
  event: CalendarDays,
  payment: CreditCard,
  system: Megaphone,
};

export const notificationLabels: Record<NotificationType, string> = {
  new_song: "Nouveau son",
  new_follower: "Nouvel abonné",
  comment: "Commentaire",
  event: "Évènement",
  payment: "Paiement",
  system: "Annonce",
};
