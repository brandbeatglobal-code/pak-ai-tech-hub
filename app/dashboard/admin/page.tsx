import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminIcon, type AdminIconName } from "@/components/admin/admin-icons";
import { AdminShell } from "@/components/admin/admin-shell";
import { ReviewAnnouncer } from "@/components/admin/review-announcer";
import { ReviewControls } from "@/components/admin/review-controls";
import { siteCopy } from "@/content/site-copy";
import {
  getProductQueue,
  getProviderQueue,
  getReviewStats,
  PENDING_LIMIT,
  type ProductQueueItem,
  type ProviderQueueItem,
} from "@/lib/review-queries";

const copy = siteCopy.adminReview;

export const metadata: Metadata = {
  title: copy.meta.title,
};

/**
 * The admin review queue: provider applications and product submissions.
 *
 * GATED TWICE, like every other signed-in surface. This page redirects anyone
 * who is not a signed-in admin before it reads a single row; each action in
 * lib/review-actions.ts re-checks the same thing before it writes, because a
 * server action can be called without ever loading this page.
 *
 * The hosted database has no admin account yet. One has to be promoted by
 * hand (`update users set role = 'admin' where email = …`) before anyone can
 * open this page — that is expected, not a gap to engineer around.
 *
 * Every number shown is counted from the database: the stat cards, the tab
 * counts and the sidebar badge. Approved / Declined cover the last 7 days by
 * `reviewed_at` — see REVIEW_WINDOW_DAYS in lib/review-queries.ts.
 *
 * The tabs are links (`?tab=products`), not client state: each is its own
 * server render, reachable without JavaScript, and only the active tab's
 * queue is queried.
 */

type Tab = "providers" | "products";

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

/* Stated in UTC rather than guessed: the server has no idea where the admin is. */
function When({ date }: { date: Date }) {
  return <time dateTime={date.toISOString()}>{DATE.format(date)} UTC</time>;
}

function price(amount: string, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    Number(amount),
  );
}

export default async function AdminReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const requested = (await searchParams).tab;
  const tab: Tab = requested === "products" ? "products" : "providers";

  const [stats, queue] = await Promise.all([
    getReviewStats(),
    tab === "providers" ? getProviderQueue() : getProductQueue(),
  ]);

  const pendingTotal = stats.pendingProviders + stats.pendingProducts;
  const pendingHere = tab === "providers" ? stats.pendingProviders : stats.pendingProducts;

  return (
    <AdminShell
      admin={{ name: session.user.name ?? "", email: session.user.email ?? "" }}
      pendingTotal={pendingTotal}
    >
      <h1 className="text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl">
        {copy.heading}
      </h1>
      <p className="mt-2 text-base text-brand-navy/70">{copy.subhead}</p>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat
          icon="providers"
          label={copy.stats.pendingProviders}
          value={stats.pendingProviders}
          note={copy.stats.waiting}
        />
        <Stat
          icon="products"
          label={copy.stats.pendingProducts}
          value={stats.pendingProducts}
          note={copy.stats.waiting}
        />
        <Stat
          icon="check"
          label={copy.stats.approved}
          value={stats.approved}
          note={copy.windowNote}
        />
        <Stat
          icon="cross"
          label={copy.stats.declined}
          value={stats.declined}
          note={copy.windowNote}
        />
      </dl>

      <nav aria-label={copy.tabs.label} className="mt-10">
        <ul className="inline-flex rounded-2xl border border-black/5 bg-white p-1 shadow-sm">
          <TabLink
            tab="providers"
            active={tab}
            label={copy.tabs.providers}
            count={stats.pendingProviders}
          />
          <TabLink
            tab="products"
            active={tab}
            label={copy.tabs.products}
            count={stats.pendingProducts}
          />
        </ul>
      </nav>

      <div className="mt-6">
        <ReviewAnnouncer key={tab}>
          <Section
            id="pending"
            title={copy.sections.pending}
            count={pendingHere}
            empty={copy.empty.pending}
            footer={
              pendingHere > queue.pending.length
                ? copy.truncated
                    .replace("{shown}", String(PENDING_LIMIT))
                    .replace("{total}", String(pendingHere))
                : null
            }
          >
            {tab === "providers"
              ? (queue.pending as ProviderQueueItem[]).map((item) => (
                  <ProviderRow key={item.id} item={item} />
                ))
              : (queue.pending as ProductQueueItem[]).map((item) => (
                  <ProductRow key={item.id} item={item} />
                ))}
          </Section>

          <Section
            id="reviewed"
            title={copy.sections.reviewed}
            count={queue.reviewed.length}
            empty={copy.empty.reviewed}
            muted
          >
            {tab === "providers"
              ? (queue.reviewed as ProviderQueueItem[]).map((item) => (
                  <ProviderRow key={item.id} item={item} />
                ))
              : (queue.reviewed as ProductQueueItem[]).map((item) => (
                  <ProductRow key={item.id} item={item} />
                ))}
          </Section>
        </ReviewAnnouncer>
      </div>
    </AdminShell>
  );
}

/* ------------------------------------------------------------------ */

function Stat({
  icon,
  label,
  value,
  note,
}: {
  icon: AdminIconName;
  label: string;
  value: number;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-5">
      <dt className="flex items-center gap-2.5 text-sm font-semibold text-brand-navy/70">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-blue/15 text-brand-navy">
          <AdminIcon name={icon} className="h-4 w-4" />
        </span>
        {label}
      </dt>
      <dd className="mt-3">
        <span className="block text-3xl font-extrabold tracking-tight text-brand-navy tabular-nums">
          {value}
        </span>
        <span className="mt-1 block text-xs font-medium text-brand-navy/65">{note}</span>
      </dd>
    </div>
  );
}

function TabLink({
  tab,
  active,
  label,
  count,
}: {
  tab: Tab;
  active: Tab;
  label: string;
  count: number;
}) {
  const current = tab === active;
  return (
    <li>
      <Link
        href={tab === "providers" ? "/dashboard/admin" : "/dashboard/admin?tab=products"}
        aria-current={current ? "page" : undefined}
        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy ${
          current ? "bg-brand-navy text-white" : "text-brand-navy/70 hover:text-brand-navy"
        }`}
      >
        {label}
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
            current ? "bg-white/15 text-white" : "bg-brand-navy/[0.06] text-brand-navy"
          }`}
        >
          {count}
          <span className="sr-only"> {copy.status.pending.toLowerCase()}</span>
        </span>
      </Link>
    </li>
  );
}

function Section({
  id,
  title,
  count,
  empty,
  muted = false,
  footer = null,
  children,
}: {
  id: string;
  title: string;
  count: number;
  empty: string;
  muted?: boolean;
  footer?: string | null;
  children: React.ReactNode;
}) {
  const headingId = `${id}-heading`;
  const hasItems = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <section
      aria-labelledby={headingId}
      className={`mb-6 overflow-hidden rounded-2xl border border-black/5 shadow-sm ${
        muted ? "bg-white/70" : "bg-white"
      }`}
    >
      <h2
        id={headingId}
        className="flex items-center gap-2 border-b border-black/5 px-5 py-4 text-base font-bold text-brand-navy sm:px-6"
      >
        {title}
        <span className="rounded-full bg-brand-navy/[0.06] px-2 py-0.5 text-xs font-bold text-brand-navy tabular-nums">
          {count}
        </span>
      </h2>
      {hasItems ? (
        <ul className="divide-y divide-black/5">{children}</ul>
      ) : (
        <p className="px-5 py-8 text-sm text-brand-navy/65 sm:px-6">{empty}</p>
      )}
      {footer ? (
        <p className="border-t border-black/5 px-5 py-3 text-xs font-medium text-brand-navy/70 sm:px-6">
          {footer}
        </p>
      ) : null}
    </section>
  );
}

function StatusChip({ status }: { status: "pending" | "approved" | "rejected" }) {
  const style = {
    pending: "bg-amber-100 text-amber-900",
    approved: "bg-emerald-100 text-emerald-900",
    rejected: "bg-red-100 text-red-900",
  }[status];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${style}`}>
      {copy.status[status]}
    </span>
  );
}

function CategoryChip({ category }: { category: string }) {
  return (
    <span className="rounded-full border border-black/10 px-2.5 py-0.5 text-xs font-semibold text-brand-navy/80">
      {category}
    </span>
  );
}

/** A label/value pair inside a row's `<dl>`. */
function Field({
  label,
  wide = false,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-xs font-semibold tracking-wide text-brand-navy/65 uppercase">{label}</dt>
      <dd className="mt-1 text-sm leading-relaxed break-words text-brand-navy">{children}</dd>
    </div>
  );
}

/**
 * A row's frame: details on the left, the decision controls on the right for
 * a pending item. A reviewed item has no controls and sits on a tinted
 * background — muted by background, not by opacity, so its text keeps full
 * contrast.
 */
function Row({
  reviewed,
  controls,
  heading,
  chips,
  children,
}: {
  reviewed: boolean;
  controls: React.ReactNode;
  heading: string;
  chips: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className={`px-5 py-5 sm:px-6 ${reviewed ? "bg-brand-navy/[0.025]" : ""}`}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`text-lg tracking-tight break-words text-brand-navy ${
                reviewed ? "font-semibold" : "font-bold"
              }`}
            >
              {heading}
            </h3>
            {chips}
          </div>
          <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">{children}</dl>
        </div>
        {controls ? <div className="shrink-0 lg:w-64">{controls}</div> : null}
      </div>
    </li>
  );
}

function ProviderRow({ item }: { item: ProviderQueueItem }) {
  const reviewed = item.status !== "pending";
  const { fields } = copy;
  const safeWebsite = item.website && /^https?:\/\//i.test(item.website) ? item.website : null;

  return (
    <Row
      reviewed={reviewed}
      heading={item.business}
      chips={
        <>
          <StatusChip status={item.status} />
          {item.category ? <CategoryChip category={item.category} /> : null}
        </>
      }
      controls={
        reviewed ? null : <ReviewControls kind="provider" id={item.id} name={item.business} />
      }
    >
      <Field label={fields.applicant}>
        {item.applicantName}
        {item.applicantEmail ? (
          <a
            href={`mailto:${item.applicantEmail}`}
            className="block font-medium [overflow-wrap:anywhere] underline decoration-brand-green decoration-2 underline-offset-2 hover:decoration-brand-blue"
          >
            {item.applicantEmail}
          </a>
        ) : null}
      </Field>
      <Field label={fields.website}>
        {safeWebsite ? (
          <a
            href={safeWebsite}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="font-medium [overflow-wrap:anywhere] underline decoration-brand-green decoration-2 underline-offset-2 hover:decoration-brand-blue"
          >
            {safeWebsite}
            <span className="sr-only"> {fields.newTab}</span>
          </a>
        ) : (
          <span className="text-brand-navy/65">{fields.noWebsite}</span>
        )}
      </Field>
      <Field label={fields.submitted}>
        <When date={item.submittedAt} />
      </Field>
      {reviewed && item.reviewedAt ? (
        <Field label={fields.reviewed}>
          <When date={item.reviewedAt} />
        </Field>
      ) : null}
      {item.description ? (
        <Field label={fields.description} wide>
          {item.description}
        </Field>
      ) : null}
      {item.reason ? (
        <Field label={fields.reason} wide>
          {item.reason}
        </Field>
      ) : null}
      {item.rejectionReason ? (
        <Field label={reviewed ? fields.declineReason : fields.previouslyDeclined} wide>
          {item.rejectionReason}
        </Field>
      ) : null}
    </Row>
  );
}

function ProductRow({ item }: { item: ProductQueueItem }) {
  const reviewed = item.status !== "pending";
  const { fields } = copy;

  return (
    <Row
      reviewed={reviewed}
      heading={item.name}
      chips={
        <>
          <StatusChip status={item.status} />
          <CategoryChip category={item.category} />
        </>
      }
      controls={reviewed ? null : <ReviewControls kind="product" id={item.id} name={item.name} />}
    >
      <Field label={fields.provider}>{item.provider}</Field>
      <Field label={fields.price}>
        {price(item.priceAmount, item.priceCurrency)} {fields.perMonth}
      </Field>
      <Field label={fields.submitted}>
        <When date={item.submittedAt} />
      </Field>
      {reviewed && item.reviewedAt ? (
        <Field label={fields.reviewed}>
          <When date={item.reviewedAt} />
        </Field>
      ) : null}
      <Field label={fields.description} wide>
        {item.description}
      </Field>
      {reviewed && item.rejectionReason ? (
        <Field label={fields.declineReason} wide>
          {item.rejectionReason}
        </Field>
      ) : null}
    </Row>
  );
}
