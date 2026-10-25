import { Alert, Linking, Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import type { Data } from "@a2b/api-client";
import { cargoLabel, formatMarketTime, formatMoney, getMarket, paymentMethods } from "@a2b/core";
import { colors } from "@a2b/ui";

/** The receipt as label/value rows, shared by the PDF and the WhatsApp message. */
export function receiptRows(load: Data.Load) {
  const market = getMarket(load.market);
  const vehicle = load.carrier?.vehicle;
  return {
    amount: formatMoney(load.escrow?.amount ?? load.offerPrice, market),
    rows: [
      ["Load ID", load.reference],
      ["Date", formatMarketTime(load.completedAt ?? load.deliveredAt, market, "date")],
      ["Driver", load.carrier?.driverName ?? "—"],
      ["Pickup", load.pickupSummary],
      ["Delivery", load.dropoffSummary],
      ["Vehicle", vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.plate})` : "—"],
      ["Load type", cargoLabel(load.cargoType)],
      ["Payment method", load.escrow?.depositMethod ? paymentMethods[load.escrow.depositMethod].label : "—"],
    ] as [string, string][],
  };
}

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function receiptHtml(load: Data.Load) {
  const { amount, rows } = receiptRows(load);
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>A2B receipt ${escape(load.reference)}</title>
<style>
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: ${colors.text}; margin: 48px; }
  h1 { color: ${colors.primary}; font-size: 28px; margin: 0 0 4px; }
  .muted { color: ${colors.textMuted}; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin-top: 32px; font-size: 15px; }
  td { padding: 10px 0; border-bottom: 1px solid ${colors.border}; vertical-align: top; }
  td:last-child { text-align: right; font-weight: 600; }
  .total { margin-top: 24px; display: flex; justify-content: space-between; font-size: 20px; font-weight: 700; color: ${colors.primary}; }
</style></head>
<body>
  <h1>A2B Official Receipt</h1>
  <div class="muted">Payment released from escrow for a completed delivery</div>
  <table>${rows.map(([label, value]) => `<tr><td>${escape(label)}</td><td>${escape(value)}</td></tr>`).join("")}</table>
  <div class="total"><span>Amount paid</span><span>${escape(amount)}</span></div>
</body></html>`;
}

/**
 * Saves the receipt as a PDF and opens the share sheet (Files, email, WhatsApp…).
 * Browsers get their print dialog, where "Save as PDF" is one of the options.
 */
export async function downloadReceiptPdf(load: Data.Load) {
  const html = receiptHtml(load);
  if (Platform.OS === "web") return printInBrowser(html);
  try {
    const { uri } = await Print.printToFileAsync({ html });
    // A readable name instead of the printer's random one
    const pdf = new File(uri);
    const named = new File(Paths.cache, `A2B-receipt-${load.reference}.pdf`);
    if (named.exists) named.delete();
    pdf.move(named);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(named.uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf", dialogTitle: "Save or share receipt" });
    } else {
      await Print.printAsync({ uri: named.uri });
    }
  } catch {
    Alert.alert("Couldn't create the PDF", "Please try again.");
  }
}

/** Prints just the receipt (not the app screen) from a hidden frame. */
function printInBrowser(html: string) {
  const frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(frame);
  const doc = frame.contentDocument!;
  doc.open();
  doc.write(html);
  doc.close();
  frame.contentWindow!.focus();
  frame.contentWindow!.print();
  setTimeout(() => frame.remove(), 1000);
}

/** Opens WhatsApp with the receipt as a message; the user picks the chat. */
export async function shareReceiptOnWhatsApp(load: Data.Load) {
  const { amount, rows } = receiptRows(load);
  const text = [
    "*A2B Official Receipt*",
    ...rows.filter(([, value]) => value !== "—").map(([label, value]) => `${label}: ${value}`),
    `*Amount paid: ${amount}*`,
  ].join("\n");
  try {
    await Linking.openURL(`https://wa.me/?text=${encodeURIComponent(text)}`);
  } catch {
    Alert.alert("Couldn't open WhatsApp", "Make sure WhatsApp is installed and try again.");
  }
}
