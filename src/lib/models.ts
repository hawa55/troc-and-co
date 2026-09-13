import { randomUUID } from "node:crypto";
import { db } from "./db";

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  city: string | null;
  createdAt: string;
};

export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  photos: string; // JSON string array
  video: string | null;
  status: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
};

export type Conversation = {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  createdAt: string;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export type Order = {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: string;
  stripeSessionId: string | null;
  createdAt: string;
};

// ---------- Users ----------

export function createUser(data: {
  email: string;
  passwordHash: string;
  name: string;
  city?: string;
}): User {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO users (id, email, passwordHash, name, city) VALUES (?, ?, ?, ?, ?)`
  ).run(id, data.email.toLowerCase(), data.passwordHash, data.name, data.city ?? null);
  return getUserById(id)!;
}

export function getUserByEmail(email: string): User | undefined {
  return db
    .prepare(`SELECT * FROM users WHERE email = ?`)
    .get(email.toLowerCase()) as User | undefined;
}

export function getUserById(id: string): User | undefined {
  return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as User | undefined;
}

// ---------- Listings ----------

export function createListing(data: {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  photos: string[];
  video?: string | null;
  sellerId: string;
}): Listing {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO listings (id, title, description, price, category, condition, photos, video, sellerId)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    data.title,
    data.description,
    data.price,
    data.category,
    data.condition,
    JSON.stringify(data.photos),
    data.video ?? null,
    data.sellerId
  );
  return getListingById(id)!;
}

export function getListingById(id: string): Listing | undefined {
  return db.prepare(`SELECT * FROM listings WHERE id = ?`).get(id) as Listing | undefined;
}

export function listListings(filters: {
  category?: string;
  search?: string;
  status?: string;
} = {}): Listing[] {
  let query = `SELECT * FROM listings WHERE 1=1`;
  const params: (string | number)[] = [];

  if (filters.status) {
    query += ` AND status = ?`;
    params.push(filters.status);
  } else {
    query += ` AND status != 'sold'`;
  }

  if (filters.category) {
    query += ` AND category = ?`;
    params.push(filters.category);
  }

  if (filters.search) {
    query += ` AND (title LIKE ? OR description LIKE ?)`;
    const like = `%${filters.search}%`;
    params.push(like, like);
  }

  query += ` ORDER BY createdAt DESC`;

  return db.prepare(query).all(...params) as Listing[];
}

export function listListingsBySeller(sellerId: string): Listing[] {
  return db
    .prepare(`SELECT * FROM listings WHERE sellerId = ? ORDER BY createdAt DESC`)
    .all(sellerId) as Listing[];
}

export function markListingSold(id: string) {
  db.prepare(`UPDATE listings SET status = 'sold', updatedAt = datetime('now') WHERE id = ?`).run(
    id
  );
}

export function markListingStatus(id: string, status: string) {
  db.prepare(`UPDATE listings SET status = ?, updatedAt = datetime('now') WHERE id = ?`).run(
    status,
    id
  );
}

// ---------- Conversations & Messages ----------

export function getOrCreateConversation(
  listingId: string,
  buyerId: string,
  sellerId: string
): Conversation {
  const existing = db
    .prepare(`SELECT * FROM conversations WHERE listingId = ? AND buyerId = ?`)
    .get(listingId, buyerId) as Conversation | undefined;
  if (existing) return existing;

  const id = randomUUID();
  db.prepare(
    `INSERT INTO conversations (id, listingId, buyerId, sellerId) VALUES (?, ?, ?, ?)`
  ).run(id, listingId, buyerId, sellerId);
  return db.prepare(`SELECT * FROM conversations WHERE id = ?`).get(id) as Conversation;
}

export function getConversationById(id: string): Conversation | undefined {
  return db.prepare(`SELECT * FROM conversations WHERE id = ?`).get(id) as
    | Conversation
    | undefined;
}

export function listConversationsForUser(userId: string) {
  return db
    .prepare(
      `SELECT c.*, l.title as listingTitle, l.photos as listingPhotos, l.price as listingPrice
       FROM conversations c
       JOIN listings l ON l.id = c.listingId
       WHERE c.buyerId = ? OR c.sellerId = ?
       ORDER BY c.createdAt DESC`
    )
    .all(userId, userId) as (Conversation & {
    listingTitle: string;
    listingPhotos: string;
    listingPrice: number;
  })[];
}

export function addMessage(conversationId: string, senderId: string, content: string): Message {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO messages (id, conversationId, senderId, content) VALUES (?, ?, ?, ?)`
  ).run(id, conversationId, senderId, content);
  return db.prepare(`SELECT * FROM messages WHERE id = ?`).get(id) as Message;
}

export function listMessages(conversationId: string): Message[] {
  return db
    .prepare(`SELECT * FROM messages WHERE conversationId = ? ORDER BY createdAt ASC`)
    .all(conversationId) as Message[];
}

// ---------- Orders ----------

export function createOrder(data: {
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
}): Order {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO orders (id, listingId, buyerId, sellerId, amount) VALUES (?, ?, ?, ?, ?)`
  ).run(id, data.listingId, data.buyerId, data.sellerId, data.amount);
  return db.prepare(`SELECT * FROM orders WHERE id = ?`).get(id) as Order;
}

export function setOrderStripeSession(orderId: string, stripeSessionId: string) {
  db.prepare(`UPDATE orders SET stripeSessionId = ? WHERE id = ?`).run(stripeSessionId, orderId);
}

export function markOrderPaid(stripeSessionId: string) {
  const order = db
    .prepare(`SELECT * FROM orders WHERE stripeSessionId = ?`)
    .get(stripeSessionId) as Order | undefined;
  if (!order) return;
  db.prepare(`UPDATE orders SET status = 'paid' WHERE id = ?`).run(order.id);
  markListingSold(order.listingId);
}

export function getOrderByListing(listingId: string): Order | undefined {
  return db.prepare(`SELECT * FROM orders WHERE listingId = ?`).get(listingId) as
    | Order
    | undefined;
}
