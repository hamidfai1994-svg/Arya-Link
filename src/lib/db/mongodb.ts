import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aryalink';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

// Tracks whether default SiteSettings initialization has been verified in current process
let hasCheckedSiteSettingsInit = false;

async function autoInitSiteSettings(mongooseInstance: typeof mongoose) {
  if (hasCheckedSiteSettingsInit) return;
  try {
    const db = mongooseInstance.connection.db;
    if (!db) return;

    const collections = await db.listCollections({ name: 'sitesettings' }).toArray();
    const count = collections.length > 0 ? await db.collection('sitesettings').countDocuments() : 0;

    if (count === 0) {
      await db.collection('sitesettings').updateOne(
        {},
        {
          $setOnInsert: {
            companyLogo: '',
            favicon: '',
            siteName: 'Arya Link',
            siteDescription: 'پیشرفته‌ترین سامانه هویت دیجیتال، کارت ویزیت هوشمند NFC و درگاه لینک‌بایو در افغانستان',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
    }
    hasCheckedSiteSettingsInit = true;
  } catch (initErr) {
    console.warn('SiteSettings initial check skipped:', initErr);
  }
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    if (!hasCheckedSiteSettingsInit) {
      await autoInitSiteSettings(cached.conn);
    }
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      dbName: 'aryalink',
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongooseInstance) => {
      await autoInitSiteSettings(mongooseInstance);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    if (!hasCheckedSiteSettingsInit && cached.conn) {
      await autoInitSiteSettings(cached.conn);
    }
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
