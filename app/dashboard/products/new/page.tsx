import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ProductForm } from "@/components/product-form";
import { siteCopy } from "@/content/site-copy";

const copy = siteCopy.providerSubmit;

export const metadata: Metadata = {
  title: copy.meta.title,
};

/**
 * Provider product submission.
 *
 * Gated twice, on purpose. This page will not render for anyone who is not a
 * signed-in provider, and `submitProduct` re-checks the same thing before it
 * writes — a server action is reachable without ever loading this page, so the
 * gate here is about what gets shown and the one in the action is about what
 * gets stored.
 *
 * A buyer or an admin who lands here goes to /dashboard rather than seeing a
 * "not allowed" page: their own dashboard is where they were headed.
 *
 * This is the submission pass only. Listing a provider's own submissions and
 * their review status is the provider-dashboard pass, and the admin queue that
 * would act on a pending row is a third — do not start either one in here.
 */
export default async function NewProductPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "provider") redirect("/dashboard");

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <Link
        href="/dashboard"
        className="text-sm font-semibold text-brand-navy/70 underline decoration-brand-green decoration-2 underline-offset-4 transition-colors hover:text-brand-navy hover:decoration-brand-blue"
      >
        {copy.backToDashboard}
      </Link>

      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl">
        {copy.heading}
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-brand-navy/70">
        {copy.intro}
      </p>
      <p className="mt-3 text-base leading-relaxed text-brand-navy/70">
        {copy.commission}
      </p>

      <div className="mt-10">
        <ProductForm />
      </div>
    </section>
  );
}
