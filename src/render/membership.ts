import type { ClubConfig, Payment } from "../config"
import { assertNever } from "../lib/errors"
import { escapeAttribute, escapeHtml } from "../lib/html"
import { renderEmpty, renderSectionHeader } from "./common"

export function renderMembership(section: ClubConfig["membership"]): string {
  const benefits =
    section.benefits.length > 0
      ? `<ul>${section.benefits.map((benefit) => `<li>${escapeHtml(benefit)}</li>`).join("")}</ul>`
      : renderEmpty("Add membership benefits in your config.")
  const payment = section.payment ? renderPayment(section.payment) : renderPaymentMissing()
  const description = section.description
    ? `<p class="odgc-description">${escapeHtml(section.description)}</p>`
    : ""
  const price = section.priceLabel
    ? `<span class="odgc-badge">${escapeHtml(section.priceLabel)}</span>`
    : ""

  return `
    <section class="odgc-section">
      ${renderSectionHeader(section.title)}
      <div class="odgc-card">
        ${price}
        ${description}
        ${benefits}
        ${payment}
      </div>
    </section>
  `
}

function renderPayment(payment: Payment): string {
  switch (payment.provider) {
    case "external":
      return `<a class="odgc-button" href="${escapeAttribute(payment.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(payment.label)}</a>`
    case "paypal": {
      const url = paypalUrl(payment)
      return url
        ? `<a class="odgc-button" href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer">Join with PayPal</a>`
        : renderPaymentMissing()
    }
    default:
      return assertNever(payment)
  }
}

function renderPaymentMissing(): string {
  return `<p class="odgc-muted">Payment is not configured. Add PayPal or an external join link when you are ready.</p>`
}

function paypalUrl(payment: Extract<Payment, { readonly provider: "paypal" }>): string | null {
  if (payment.checkoutUrl) {
    return payment.checkoutUrl
  }

  if (!payment.businessEmail || !payment.amount) {
    return null
  }

  const params = new URLSearchParams({
    cmd: "_xclick",
    business: payment.businessEmail,
    currency_code: "USD",
    amount: String(payment.amount),
    item_name: payment.itemName ?? "Club Membership",
  })
  return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`
}
