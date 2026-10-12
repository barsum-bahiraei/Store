import Image from "next/image";
import { whatsappSupportNumber, whatsappSupportUrl } from "@/features/layout/utils/social-links";

const storeBenefits = [
  { icon: "local_shipping", title: "تحویل اکسپرس", description: "در کمترین زمان" },
  { icon: "support_agent", title: "پشتیبانی ۲۴ ساعته", description: "پشتیبانی هفت روز هفته" },
  { icon: "timer", title: "۷ روز ضمانت بازگشت", description: "هفت روز مهلت دارید" },
  { icon: "verified", title: "ضمانت اصالت کالا", description: "تأیید اصالت کالا" },
] as const;

export function StoreBenefits() {
  return (
    <section aria-label="مزایای خرید از زریوان" className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-5 py-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-12">
      {storeBenefits.map((benefit) => {
        const isSupport = benefit.icon === "support_agent";
        const content = <>
          {isSupport ? <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-surface p-2"><Image src="/images/social/whatsapp.svg" alt="" width={40} height={40} className="size-9 object-contain" /></span> : <span className="material-symbols-rounded shrink-0 text-4xl text-primary-foreground" aria-hidden="true">{benefit.icon}</span>}
          <span className="text-right">
            <span className="block text-sm font-black">{benefit.title}</span>
            <span className="mt-1 block text-xs leading-5 text-secondary-foreground/75">{benefit.description}</span>
            {isSupport && <span dir="ltr" className="mt-1 block text-sm font-bold">{whatsappSupportNumber}</span>}
          </span>
        </>;
        const className = "flex min-h-24 items-center justify-center gap-4 rounded-xl border border-white/20 bg-secondary/70 px-4 py-4 text-secondary-foreground shadow-sm lg:px-5";
        return isSupport ? <a key={benefit.title} href={whatsappSupportUrl} target="_blank" rel="noreferrer" aria-label={`پشتیبانی واتساپ زریوان ${whatsappSupportNumber}`} className={`${className} outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring`}>{content}</a> : <div key={benefit.title} className={className}>{content}</div>;
      })}
    </section>
  );
}
