import { getCache } from "./idbCache";
import { type User } from "./types/User";

export async function userFromCache(): Promise<User | null> {
  try {
    const cached = await getCache("user-profile");

    if (!cached || typeof cached !== "object") {
      console.warn("Cached data missing or invalid type");
      return null;
    }

    const data =
      "data" in cached && typeof (cached as any).data === "object"
        ? (cached as any).data
        : cached;

    const user: User = {
      id: data.id,
      username: data.username ?? "",
      email: data.email,
      balance: typeof data.balance === "number" ? data.balance : 0,
      profile_img: data.profile_img ?? null,
      created_at: data.created_at ?? null,
    };

    return user;
  } catch (err) {
    return null;
  }
}