export type FaqItem = { id: string; question: string; answer: string };
export type FaqGroup = { id: string; title: string; items: FaqItem[] };

/**
 * Original Idol Fairies PH policy copy. This is the same policy content
 * used to build the RAG knowledge base (see content/knowledge/*.md) — kept
 * here as the human-facing FAQ page copy so the storefront and the chatbot
 * never disagree with each other.
 */
export const faqGroups: FaqGroup[] = [
  {
    id: "shipping",
    title: "Shipping (Philippines)",
    items: [
      {
        id: "shipping-areas",
        question: "Where does Idol Fairies PH ship to?",
        answer:
          "Idol Fairies PH ships from the Philippines and delivers nationwide within the Philippines via trusted local couriers (J&T Express, LBC, or Ninja Van depending on your area). Metro Manila orders typically arrive in 2–4 business days after dispatch; provincial areas usually take 4–8 business days. We do not offer overseas or international shipping — every order must use a Philippine delivery address.",
      },
      {
        id: "shipping-cost",
        question: "How much is shipping?",
        answer:
          "Shipping cost depends on your delivery address and the weight/size of your order and is calculated at checkout. We don't publish a flat rate because bulky items (light sticks, multi-item photobook bundles) cost more to ship than a single album.",
      },
      {
        id: "shipping-timeline",
        question: "How long from order to delivery?",
        answer:
          "In-stock items are packed and dispatched within 1–3 business days of payment confirmation, then delivered per the courier timeline above. Preorder items ship only after the release date and source restock — see the Preorder Policy section.",
      },
    ],
  },
  {
    id: "preorder",
    title: "Preorder Policy",
    items: [
      {
        id: "preorder-what",
        question: "What does 'Preorder' mean here?",
        answer:
          "A Preorder item hasn't arrived in our inventory yet — it's reserved against an upcoming release or restock from our source supplier. Placing a preorder guarantees you a unit once stock arrives; it does not mean the item ships immediately.",
      },
      {
        id: "preorder-timeline",
        question: "When will my preorder ship?",
        answer:
          "Preorder items ship at least 20 days after the item's official release date in Korea — that's the minimum time our supplier needs to fulfill stock to us, so treat it as the earliest possible dispatch rather than a guarantee. Check the product page's release date and dispatch note, or ask Idol AI for the latest info we have on file.",
      },
      {
        id: "preorder-cancel",
        question: "Can I cancel a preorder?",
        answer:
          "Yes, as long as the order hasn't already been sent to our supplier for fulfillment (usually within 24 hours of ordering). After that window, the preorder is locked in on our end and can no longer be cancelled, since we've already committed to purchasing it on your behalf.",
      },
    ],
  },
  {
    id: "order-processing",
    title: "Order Processing",
    items: [
      {
        id: "order-confirm",
        question: "How do I know my order went through?",
        answer:
          "You'll see an on-screen confirmation once your order is placed. Because this storefront is a portfolio demo, there is currently no checkout/payment step or order-confirmation email — cart contents are saved locally in your browser only.",
      },
      {
        id: "order-combine",
        question: "Can multiple items ship together?",
        answer:
          "In-stock items in the same order are packed together where possible. If your order mixes an in-stock item with a preorder item, we hold the whole order until the preorder is ready, unless you ask us to split the shipment (which may add a shipping fee for the second parcel).",
      },
    ],
  },
  {
    id: "cancellation",
    title: "Cancellation",
    items: [
      {
        id: "cancel-instock",
        question: "Can I cancel an in-stock order?",
        answer:
          "In-stock orders can be cancelled before they're marked as packed/dispatched. Once an order has shipped, it can no longer be cancelled — you'd need to go through our returns process instead.",
      },
    ],
  },
  {
    id: "returns",
    title: "Returns & Refunds",
    items: [
      {
        id: "returns-window",
        question: "What's the returns window?",
        answer:
          "Because most items are collectible K-pop merchandise (albums, photobooks, light sticks) sold as new/sealed, we only accept returns for damaged, defective, or incorrect items — reported within 7 days of delivery. We don't accept returns for change-of-mind once an item has been opened.",
      },
      {
        id: "returns-process",
        question: "How do refunds work?",
        answer:
          "Approved refunds are processed back to your original payment method. Processing time depends on your bank or e-wallet provider, typically 5–10 business days after we confirm the return.",
      },
    ],
  },
  {
    id: "damaged",
    title: "Damaged / Missing Items",
    items: [
      {
        id: "damaged-report",
        question: "My order arrived damaged. What do I do?",
        answer:
          "Contact us within 7 days of delivery with photos of the damaged item and its packaging. We'll arrange a replacement if stock is available, or a refund if it isn't. Please don't discard the packaging until the claim is resolved — couriers sometimes require it for their own investigation.",
      },
      {
        id: "damaged-missing",
        question: "An item is missing from my order.",
        answer:
          "Check your order confirmation against what arrived, then contact us with your order details. We'll verify against our packing record and ship the missing item or refund it, whichever you prefer.",
      },
    ],
  },
  {
    id: "payment",
    title: "Payment",
    items: [
      {
        id: "payment-methods",
        question: "What payment methods do you accept?",
        answer:
          "This storefront is a front-end portfolio demo, so no live payment gateway is connected yet — the cart is for browsing/demo purposes only. A production version would support GCash, Maya, major cards, and bank transfer, all in PHP.",
      },
    ],
  },
  {
    id: "address-changes",
    title: "Address Changes",
    items: [
      {
        id: "address-change",
        question: "Can I change my delivery address after ordering?",
        answer:
          "Yes, as long as the order hasn't been handed to the courier yet. Once it's out for dispatch, we can no longer redirect it — you'd need to coordinate directly with the courier, or receive it and arrange a reship.",
      },
    ],
  },
  {
    id: "customs",
    title: "Customs & Import Duties",
    items: [
      {
        id: "customs-domestic",
        question: "Do I need to pay customs or import duties?",
        answer:
          "No — all Idol Fairies PH orders ship from within the Philippines to Philippine addresses, so there are no customs or import duties involved. Some of our stock is originally imported by our suppliers before it reaches us; that cost is already reflected in the listed price.",
      },
    ],
  },
  {
    id: "faqs",
    title: "General FAQs",
    items: [
      {
        id: "faq-authenticity",
        question: "Are these official/authentic items?",
        answer:
          "Yes — every item we sell is guaranteed authentic and sourced directly from Korea. We source from established K-pop retail suppliers and list catalog details (artist, version, price) as provided by that source. If a listing's exact inclusions matter to you, check the product page's dispatch note or ask Idol AI before ordering.",
      },
      {
        id: "faq-restock",
        question: "Will sold-out items restock?",
        answer:
          "It depends on the item and its source supplier — some sold-out versions never restock (especially limited or early-bird editions). We don't guess restock timing we haven't been given; ask Idol AI and it will tell you honestly if that information isn't available yet.",
      },
    ],
  },
];
