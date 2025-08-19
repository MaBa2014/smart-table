export function initData() {
  const BASE_URL = "https://webinars.webdev.education-services.ru/sp7-api";

  let sellers;
  let customers;
  let lastResult;
  let lastQuery;

  const mapRecords = (apiItems) =>
    apiItems.map((item) => ({
      id: item.receipt_id ?? item.id ?? "",
      date: item.date ?? "",
      seller:
        (sellers &&
          (sellers[item.seller_id] ||
            sellers[item.seller] ||
            sellers[item.sellerId])) ??
        item.seller_name ??
        item.seller ??
        String(item.seller_id ?? ""),
      customer:
        (customers &&
          (customers[item.customer_id] ||
            customers[item.customer] ||
            customers[item.customerId])) ??
        item.customer_name ??
        item.customer ??
        String(item.customer_id ?? ""),
      total: item.total_amount ?? item.total ?? 0,
    }));

  async function safeJson(url) {
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `API ${res.status} ${res.statusText} at ${url} ${text && "→ " + text}`
      );
    }
    return res.json();
  }

  function normalizeIndex(payload, kind) {
    if (payload && typeof payload === "object" && !Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload)) {
      return payload.reduce((acc, v) => {
        const id = v.id ?? v[`${kind}_id`] ?? v.code ?? v.key;
        const first = v.first_name ?? v.firstName ?? v.name ?? "";
        const last = v.last_name ?? v.lastName ?? v.surname ?? "";
        const full =
          [first, last].filter(Boolean).join(" ").trim() ||
          v.full_name ||
          v.fullName ||
          String(id || "");
        if (id) acc[id] = full;
        return acc;
      }, {});
    }

    return {};
  }

  const getIndexes = async () => {
    if (!sellers || !customers) {
      const [sellersRaw, customersRaw] = await Promise.all([
        safeJson(`${BASE_URL}/sellers`),
        safeJson(`${BASE_URL}/customers`),
      ]);
      sellers = normalizeIndex(sellersRaw, "seller");
      customers = normalizeIndex(customersRaw, "customer");
    }
    return { sellers, customers };
  };

  const getRecords = async (query, isUpdated = false) => {
    const q = new URLSearchParams({
      limit: String(query.limit ?? 10),
      page: String(query.page ?? 1),
    });

    if (query.search) q.set("search", query.search);
    if (query.sort) q.set("sort", query.sort);

    Object.keys(query).forEach((k) => {
      if (k.startsWith("filter[")) q.set(k, query[k]);
    });

    const nextQuery = q.toString();
    if (lastQuery === nextQuery && !isUpdated) return lastResult;

    const payload = await safeJson(`${BASE_URL}/records?${nextQuery}`);

    lastQuery = nextQuery;
    lastResult = {
      total: payload.total ?? 0,
      items: mapRecords(payload.items ?? []),
    };
    return lastResult;
  };

  return { getIndexes, getRecords };
}
