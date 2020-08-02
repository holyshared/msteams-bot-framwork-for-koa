import { Storage } from 'botbuilder';
import { Db } from 'mongodb';

export type PropertyConversation<T> = {
  [K in keyof T]: T[K];
}

export interface CachedConversations<T> {
  [key: string]: PropertyConversation<T>;
}

export interface Document<T> {
  _id: string;
  data: PropertyConversation<T>;
}

export class MongoDBStorage<Td> implements Storage {
  constructor(private db: Db, private collectionName: string) {
  }
  async read(keys: string[]): Promise<CachedConversations<Td>> {
    const collection = this.db.collection<Document<Td>>(this.collectionName);
    const conversations = await collection.find({ _id: { $in: keys } }).toArray();
    return conversations.reduce<CachedConversations<Td>>((acc, cache: Document<Td>) => {
      acc[cache._id] = cache.data;
      return acc;
    }, {});
  }
  async write(changes: CachedConversations<Td>): Promise<void> {
    if (!changes) {
      return;
    }
    const collection = this.db.collection<Document<Td>>(this.collectionName);
    const storageKeys = Object.keys(changes);
    const documents = storageKeys.map(storageKey => {
      const change = changes[storageKey];
      return { _id: storageKey, data: change };
    });
    await collection.insertMany(documents)
  }
  async delete(keys: string[]): Promise<void> {
  }
}