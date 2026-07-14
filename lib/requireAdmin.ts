import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ApiError } from "@/lib/apiError";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new ApiError("Non authentifié.", 401);
  if (session.user.role !== "admin") throw new ApiError("Réservé aux administrateurs.", 403);
  return session;
}
