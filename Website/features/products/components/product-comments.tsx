"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuthToken } from "@/features/auth/hooks/use-account";
import { useCreateProductComment } from "../hooks/use-products";
import type { ProductComment } from "../types/product";

const dateFormatter = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" });

function Rating({ value, label }: { value: number; label: string }) {
  return <span className="inline-flex items-center gap-1" aria-label={label}>{Array.from({ length: 5 }, (_, index) => <span key={index} className={`material-symbols-rounded text-lg ${index < value ? "text-warning" : "text-border"}`} aria-hidden="true">star</span>)}</span>;
}

export function ProductComments({ productId, comments }: { productId: number; comments: ProductComment[] }) {
  const token = useAuthToken();
  const mutation = useCreateProductComment(productId);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const text = String(formData.get("text") ?? "").trim();
    const rating = Number(formData.get("rating"));
    if (!text) return setMessage("پیش از ارسال، نظر خود را بنویسید.");
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return setMessage("امتیاز را از ۱ تا ۵ انتخاب کنید.");
    try {
      await mutation.mutateAsync({ text, rating });
      form.reset();
      setMessage("نظر شما ثبت شد.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ثبت نظر انجام نشد.");
    }
  }

  return (
    <section aria-labelledby="reviews-title" className="mt-10 border-t border-border pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black tracking-[0.15em] text-primary">بازخورد مشتریان</p><h2 id="reviews-title" className="mt-2 text-2xl font-black">نظرات</h2></div><span className="text-sm text-muted-foreground">{comments.length} نظر ثبت‌شده</span></div>
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>{comments.length === 0 ? <div className="rounded-xl border border-border bg-surface p-6 text-muted-foreground">هنوز نظری ثبت نشده است. اولین نفری باشید که تجربه خود را به اشتراک می‌گذارد.</div> : <ul className="divide-y divide-border rounded-xl border border-border bg-surface px-5">{comments.map((comment) => <li key={comment.id} className="py-5"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-black">{comment.user.firstName} {comment.user.lastName}</p><time dateTime={comment.createdAt} className="text-xs text-muted-foreground">{dateFormatter.format(new Date(comment.createdAt))}</time></div>{comment.rating && <div className="mt-2"><Rating value={comment.rating} label={`${comment.rating} از ۵ ستاره`} /></div>}<p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{comment.text}</p></li>)}</ul>}</div>
        <div className="rounded-xl border border-border bg-surface p-5 lg:sticky lg:top-36"><h3 className="text-lg font-black">نوشتن نظر</h3>{token ? <form onSubmit={handleSubmit} className="mt-4 space-y-4"><div><label htmlFor="review-rating" className="text-sm font-bold">امتیاز</label><select id="review-rating" name="rating" required defaultValue="5" className="mt-2 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} ستاره</option>)}</select></div><div><label htmlFor="review-text" className="text-sm font-bold">نظر شما</label><textarea id="review-text" name="text" required maxLength={2000} rows={5} className="mt-2 w-full resize-y rounded-lg border border-border bg-surface p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" /></div><button type="submit" disabled={mutation.isPending} className="min-h-11 w-full rounded-lg bg-primary px-4 text-sm font-black text-primary-foreground outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-60">{mutation.isPending ? "در حال ارسال…" : "ارسال نظر"}</button>{message && <p role={mutation.isError ? "alert" : "status"} className={`text-sm ${mutation.isError ? "text-error" : "text-success"}`}>{message}</p>}</form> : <div className="mt-4"><p className="text-sm leading-6 text-muted-foreground">فقط کاربران وارد شده می‌توانند نظر ثبت کنند.</p><Link href="/login" className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-black text-primary-foreground outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring">ورود برای ثبت نظر</Link></div>}</div>
      </div>
    </section>
  );
}
