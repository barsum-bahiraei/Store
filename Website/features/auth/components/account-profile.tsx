"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLogout, useUserProfile } from "../hooks/use-account";
import { CartContent } from "@/features/cart/components/cart-content";
import { useCart } from "@/features/cart/hooks/use-cart";

const genderLabels = ["Male", "Female", "Not specified"];

function ProfileField({ icon, label, value }: { icon: string; label: string; value?: string | null }) {
  return (
    <div className="flex min-w-0 gap-3 border-t border-border py-5">
      <span className="material-symbols-rounded text-xl text-primary" aria-hidden="true">{icon}</span>
      <div className="min-w-0"><p className="text-xs font-black uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-bold">{value || "Not provided"}</p></div>
    </div>
  );
}

export function AccountProfile({ tab = "profile" }: { tab?: "profile" | "cart" | "orders" }) {
  const router = useRouter();
  const logout = useLogout();
  const { data: user, isLoading, isError, refetch } = useUserProfile();
  const cart = useCart();

  if (isLoading) {
    return <div className="mx-auto max-w-4xl animate-pulse px-5 py-16 sm:px-8"><div className="h-8 w-48 rounded-lg bg-muted" /><div className="mt-8 h-80 rounded-3xl bg-muted" /></div>;
  }

  if (isError) {
    return <main className="grid min-h-dvh place-items-center px-5 text-center"><div><span className="material-symbols-rounded text-5xl text-error" aria-hidden="true">account_circle_off</span><h1 className="mt-4 text-2xl font-black">We could not load your profile</h1><p className="mt-2 text-muted-foreground">Your session may have expired. Try again or sign in.</p><div className="mt-6 flex justify-center gap-3"><button type="button" onClick={() => refetch()} className="min-h-11 rounded-xl border border-border px-5 font-bold hover:bg-muted">Try again</button><Link href="/login" className="flex min-h-11 items-center rounded-xl bg-primary px-5 font-bold text-primary-foreground">Sign in</Link></div></div></main>;
  }

  if (!user) {
    return <main className="grid min-h-dvh place-items-center px-5 text-center"><div><span className="material-symbols-rounded text-5xl text-primary" aria-hidden="true">person</span><h1 className="mt-4 text-2xl font-black">Sign in to view your account</h1><p className="mt-2 text-muted-foreground">Access your profile and personal shopping experience.</p><Link href="/login" className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-primary px-6 font-black text-primary-foreground">Sign in</Link></div></main>;
  }

  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <main className="min-h-dvh bg-background px-5 py-10 text-foreground sm:px-8 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8"><Link href="/" className="rounded-lg text-sm font-bold text-muted-foreground outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">Store home</Link><h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">My account</h1></div>
        <div className="grid items-start gap-6 md:grid-cols-[14rem_minmax(0,1fr)]">
          <nav aria-label="Account sections" className="grid gap-2 rounded-xl border border-border bg-surface p-3">
            {([
              { id: "profile", label: "Profile", icon: "person" },
              { id: "cart", label: "Shopping cart", icon: "shopping_bag" },
              { id: "orders", label: "Completed purchases", icon: "receipt_long" },
            ] as const).map((item) => (
              <Link key={item.id} href={`/account?tab=${item.id}`} aria-current={tab === item.id ? "page" : undefined} className={`flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${tab === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                <span className="material-symbols-rounded" aria-hidden="true">{item.icon}</span>{item.label}
              </Link>
            ))}
            <button type="button" onClick={handleLogout} className="flex min-h-12 items-center gap-3 rounded-lg border-t border-border px-3 text-left text-sm font-bold text-error outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><span className="material-symbols-rounded" aria-hidden="true">logout</span>Sign out</button>
          </nav>
          <div className="min-w-0">
            {cart.guestItems.length > 0 && (
              <div className="mb-4 rounded-xl border border-border bg-surface p-4">
                {cart.isError ? <div role="alert"><p className="text-sm text-error">{cart.error?.message ?? "Unable to transfer your guest cart. Your items are saved for another attempt."}</p><button type="button" onClick={() => cart.refetch()} disabled={cart.isFetching} className="mt-2 min-h-11 rounded-lg px-3 text-sm font-bold text-primary outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">{cart.isFetching ? "Transferring…" : "Retry cart transfer"}</button></div> : <p role="status" className="text-sm text-muted-foreground">Transferring your guest cart to your account…</p>}
              </div>
            )}
            {tab === "cart" && <section aria-labelledby="account-cart-title"><h2 id="account-cart-title" className="mb-4 text-2xl font-black">Shopping cart</h2><CartContent /></section>}
            {tab === "orders" && <section className="rounded-xl border border-border bg-surface p-6"><h2 className="text-2xl font-black">Completed purchases</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Purchase history is not available yet.</p></section>}
            {tab === "profile" && <section className="overflow-hidden rounded-3xl border border-border bg-surface shadow-xl shadow-primary-shadow">
          <div className="flex flex-col gap-5 bg-secondary p-6 text-secondary-foreground sm:flex-row sm:items-center sm:p-8"><div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary text-xl font-black text-primary-foreground">{initials}</div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-black">{user.firstName} {user.lastName}</h2>{user.isEmailVerified && <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-black text-primary-foreground"><span className="material-symbols-rounded text-sm" aria-hidden="true">verified</span>Verified</span>}</div><p className="mt-1 truncate text-sm text-secondary-foreground/70">{user.email}</p></div></div>
          <div className="grid px-6 sm:grid-cols-2 sm:gap-x-10 sm:px-8">
            <ProfileField icon="mail" label="Email address" value={user.email} />
            <ProfileField icon="phone" label="Phone number" value={user.phoneNumber} />
            <ProfileField icon="badge" label="National code" value={user.nationalCode} />
            <ProfileField icon="cake" label="Birth date" value={user.birthDate} />
            <ProfileField icon="person" label="Gender" value={genderLabels[user.gender]} />
            <ProfileField icon="location_on" label="Address" value={user.address} />
          </div>
        </section>}
          </div>
        </div>
      </div>
    </main>
  );
}
