import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { BlogPost } from '@/models/BlogPost.model';

export const dynamic = 'force-dynamic';

function isContentAdmin(session: any): boolean {
  const role = (session?.user?.role || '').toLowerCase();
  return ['admin', 'superadmin', 'content_editor'].includes(role);
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const adminMode = searchParams.get('admin') === 'true';

    // Single post
    if (slug) {
      const post = await BlogPost.findOne({ slug: slug.toLowerCase() }).lean();
      if (!post) {
        return NextResponse.json({ success: false, message: 'مقاله مورد نظر یافت نشد.' }, { status: 404 });
      }
      // Increment view counter
      await BlogPost.updateOne({ _id: (post as any)._id }, { $inc: { viewsCount: 1 } });
      return NextResponse.json({ success: true, post });
    }

    // List posts
    const query = adminMode ? {} : { isPublished: true };
    let posts = await BlogPost.find(query).sort({ publishedAt: -1, createdAt: -1 }).lean();

    // Auto-seed demo articles if zero exist
    if (posts.length === 0) {
      const seedArticles = [
        {
          title: 'فناوری کارت‌های ویزیت لمسی NFC چگونه کار می‌کنند؟',
          slug: 'how-nfc-smart-cards-work',
          summary: 'آشنایی کامل با تراشه‌های بدون باتری NFC و انتقال بی‌سیم اطلاعات تماس تنها با یک لمس روی موبایل مخاطب.',
          content: `
            <p>در دنیای شتابان تجارت امروز، کارت‌های ویزیت کاغذی با چالش‌های بزرگی همچون دور ریخته شدن، عدم امکان ویرایش اطلاعات پس از چاپ و هزینه‌های مداوم روبرو هستند.</p>
            <h3>تراشه NFC چیست؟</h3>
            <p>فناوری ارتباط حوزه نزدیک یا NFC (Near Field Communication) یک ارتباط رادیویی بی‌سیم با برد کوتاه است که به دستگاه‌ها اجازه می‌دهد داده‌ها را با سرعت بالا رد و بدل کنند. این تراشه درون کارت هوشمند آریا لینک تعبیه شده و بدون نیاز به باتری کار می‌کند.</p>
            <h3>چگونه بدون اپلیکیشن کار می‌کند؟</h3>
            <p>تمامی گوشی‌های هوشمند مدرن (آیفون‌های سری XS به بعد و ۹۸٪ گوشی‌های اندرویدی) مجهز به خواننده NFC هستند. با نزدیک شدن کارت، مرورگر به صورت خودکار آدرس اختصاصی پروفایل هوشمند شما را باز می‌کند.</p>
          `,
          coverImage: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=80',
          category: 'فناوری و نوآوری',
          author: 'تیم فنی آریا لینک',
          tags: ['NFC', 'کارت هوشمند', 'کارت ویزیت', 'تکنولوژی'],
          isPublished: true,
          readTimeMinutes: 5,
          viewsCount: 342,
          publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          title: '۵ روش برای تبدیل صفحه لینک‌در‌بیو به یک ماشین فروش و جذب مشتری',
          slug: '5-ways-to-turn-bio-link-into-sales-machine',
          summary: 'چگونه از ماژول‌های فروشگاهی، فرم تماس سریع و دکمه مستقیم واتساپ برای افزایش نرخ تبدیل مخاطبان به خریدار استفاده کنیم؟',
          content: `
            <p>بسیاری از افراد صفحه بیو خود را فقط برای اشتراک لینک‌های ساده استفاده می‌کنند، اما یک کارت ویزیت هوشمند پتانسیل بالایی برای درآمدزایی دارد.</p>
            <ul>
              <li><strong>دکمه مستقیم واتساپ با پیام پیش‌فرض:</strong> بیش از ۷۰ درصد مشتریان در افغانستان ارتباط از طریق واتساپ را به تماس ترجیح می‌دهند.</li>
              <li><strong>ماژول فروش مستقیم کالا و مشاوره:</strong> امکان پرداخت بدون نیاز به خروج از صفحه با درگاه حساب‌پی.</li>
              <li><strong>تیک آبی احراز هویت:</strong> نشان اصالت، اطمینان خاطر بالایی به خریداران در فضای آنلاین می‌دهد.</li>
            </ul>
          `,
          coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
          category: 'بازاریابی دیجیتال',
          author: 'واحد رشد کسب‌وکار',
          tags: ['فروش آنلاین', 'لینک بیو', 'واتساپ', 'مارکتینگ'],
          isPublished: true,
          readTimeMinutes: 4,
          viewsCount: 520,
          publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'چرا سازمان‌ها و شرکت‌های افغانستان به سمت کارت‌های ویزیت شرکتی روی آورده‌اند؟',
          slug: 'why-afghan-enterprises-adopt-digital-cards',
          summary: 'بررسی مزایای یکپارچه‌سازی هویت پرسنل، کاهش هزینه‌های سازمان و مدیریت متمرکز اطلاعات کارمندان.',
          content: `
            <p>هنگامی که کارمندی از یک شرکت جدا می‌شود، صدها کارت ویزیت کاغذی باطله می‌شوند و اطلاعات تماس شرکت هدر می‌رود. با کارت‌های شرکتی آریا لینک، مدیران می‌توانند از راه دور و در یک ثانیه اطلاعات تمام پرسنل را ویرایش، غیرفعال یا بازتخصیص دهند.</p>
          `,
          coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
          category: 'کسب‌وکار سازمانی',
          author: 'بخش سازمانی آریا لینک',
          tags: ['سازمانی', 'Enterprise', 'مدیریت پرسنل'],
          isPublished: true,
          readTimeMinutes: 6,
          viewsCount: 289,
          publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        },
      ];

      await BlogPost.insertMany(seedArticles);
      posts = await BlogPost.find(query).sort({ publishedAt: -1 }).lean();
    }

    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ success: false, message: 'خطا در بارگذاری مقالات بلاگ.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isContentAdmin(session)) {
      return NextResponse.json({ success: false, message: 'دسترسی غیرمجاز.' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { title, slug, summary, content, coverImage, category, author, tags, isPublished } = body;

    if (!title || !content || !summary) {
      return NextResponse.json({ success: false, message: 'عنوان، خلاصه و متن مقاله الزامی است.' }, { status: 400 });
    }

    const titleStr = typeof title === 'object' ? (title.da || title.en || title.ps || '') : String(title);
    const summaryStr = typeof summary === 'object' ? (summary.da || summary.en || summary.ps || '') : String(summary);
    const contentStr = typeof content === 'object' ? (content.da || content.en || content.ps || '') : String(content);

    const cleanSlug = (slug || titleStr)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\u0600-\u06FF-]/g, '')
      .trim();

    const existing = await BlogPost.findOne({ slug: cleanSlug });
    if (existing) {
      return NextResponse.json({ success: false, message: 'نامک (Slug) این مقاله تکراری است.' }, { status: 409 });
    }

    const post = await BlogPost.create({
      title: typeof title === 'object' ? title : titleStr.trim(),
      slug: cleanSlug,
      summary: typeof summary === 'object' ? summary : summaryStr.trim(),
      content: typeof content === 'object' ? content : contentStr.trim(),
      coverImage: coverImage || '',
      category: category || 'فناوری و نوآوری',
      author: author || session.user.name || 'مدیر محتوا',
      tags: Array.isArray(tags) ? tags : [],
      isPublished: isPublished !== false,
      publishedAt: new Date(),
    });

    return NextResponse.json({ success: true, message: 'پست جدید در بلاگ منتشر شد.', post });
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ success: false, message: 'خطا در ذخیره مقاله.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isContentAdmin(session)) {
      return NextResponse.json({ success: false, message: 'دسترسی غیرمجاز.' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'شناسه مقاله الزامی است.' }, { status: 400 });
    }

    const updated = await BlogPost.findByIdAndUpdate(id, { $set: updates }, { new: true });
    return NextResponse.json({ success: true, message: 'مقاله بروزرسانی شد.', post: updated });
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    return NextResponse.json({ success: false, message: 'خطا در ویرایش مقاله.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isContentAdmin(session)) {
      return NextResponse.json({ success: false, message: 'دسترسی غیرمجاز.' }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'شناسه الزامی است.' }, { status: 400 });
    }

    await BlogPost.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'مقاله با موفقیت حذف شد.' });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ success: false, message: 'خطا در حذف مقاله.' }, { status: 500 });
  }
}
