import { PrismaClient, Role, OrderStatus, BlogType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    // 1. ADMIN USERS
    console.log('👥 Seeding admin users...');
    const adminEmails = ['admin@admin.com', 'admin@gmail.com', 'user@gmail.com'];
    for (const email of adminEmails) {
        const role = email.includes('admin') ? Role.ADMIN : Role.CUSTOMER;
        const name = email === 'admin@admin.com' ? 'Admin' : (email === 'admin@gmail.com' ? 'Admin Gmail' : 'User Demo');
        const pass = email === 'user@gmail.com' ? userPassword : adminPassword;

        await prisma.user.upsert({
            where: { email },
            update: {},
            create: { email, password: pass, name, role }
        });
    }
    console.log('✅ Admins ensured');

    // 2. REGULAR USERS
    console.log('👥 Seeding regular users...');
    const usersData = [
        { email: 'nguyen.vana@gmail.com', name: 'Nguyễn Văn A' },
        { email: 'tran.thib@gmail.com', name: 'Trần Thị B' },
        { email: 'le.vanc@gmail.com', name: 'Lê Văn C' },
        { email: 'pham.thid@gmail.com', name: 'Phạm Thị D' },
        { email: 'hoang.vane@gmail.com', name: 'Hoàng Văn E' },
        { email: 'vu.thif@gmail.com', name: 'Vũ Thị F' },
        { email: 'dang.vang@gmail.com', name: 'Đặng Văn G' },
        { email: 'bui.thih@gmail.com', name: 'Bùi Thị H' },
        { email: 'do.vani@gmail.com', name: 'Đỗ Văn I' },
        { email: 'ngo.thik@gmail.com', name: 'Ngô Thị K' },
    ];
    for (const u of usersData) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: { ...u, password: hashedPassword, role: Role.CUSTOMER }
        });
    }
    console.log('✅ Users ensured');

    // 2.5. CATEGORIES
    console.log('📂 Seeding categories...');
    const categoriesData = [
        {
            name: 'Sổ Planner',
            slug: 'so-planner',
            description: 'Lên kế hoạch chi tiết cho từng ngày với thiết kế tối giản.',
            image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800',
        },
        {
            name: 'Sticker Trang Trí',
            slug: 'sticker-trang-tri',
            description: 'Thêm màu sắc cho trang viết.',
            image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800',
        },
        {
            name: 'Bút & Phụ Kiện',
            slug: 'but-phu-kien',
            description: 'Dụng cụ viết êm ái, bền bỉ.',
            image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
        },
    ];

    const categoryRecords: any[] = [];
    for (const c of categoriesData) {
        const cat = await prisma.category.upsert({
            where: { slug: c.slug },
            update: {},
            create: c,
        });
        categoryRecords.push(cat);
    }
    console.log(`✅ ${categoryRecords.length} categories ensured`);

    // 3. PRODUCTS
    console.log('📦 Seeding products...');
    const productsData = [
        {
            name: 'Sổ Planner 2025 Minimalist',
            slug: 'so-planner-2025-minimalist',
            price: 185000,
            oldPrice: 220000,
            description: 'Sổ planner năm 2025 thiết kế tối giản với bìa da PU cao cấp. Gồm 12 tháng với layout weekly và monthly, kèm các trang goal setting và habit tracker. Giấy cream 100gsm chống lem.',
            image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800',
            images: ['https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800', 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800'],
            tags: ['planner', '2025', 'minimalist', 'bestseller'],
            stock: 150,
        },
        {
            name: 'Weekly Planner Pastel Dreams',
            slug: 'weekly-planner-pastel-dreams',
            price: 145000,
            description: 'Sổ kế hoạch tuần với tông màu pastel nhẹ nhàng. Layout Chi tiết từng ngày với time blocking, to-do list và notes section. Bìa cứng chống thấm nước.',
            image: 'https://images.unsplash.com/photo-1586281010691-f4e2f95e6d9e?w=800',
            images: ['https://images.unsplash.com/photo-1586281010691-f4e2f95e6d9e?w=800'],
            tags: ['planner', 'weekly', 'pastel', 'cute'],
            stock: 200,
        },
        {
            name: 'Daily Planner Premium A5',
            slug: 'daily-planner-premium-a5',
            price: 245000,
            oldPrice: 290000,
            description: 'Sổ kế hoạch ngày cao cấp khổ A5 với 365 trang. Mỗi trang gồm hourly schedule, priority tasks, meals, water intake và gratitude section. Bìa da thật 100%.',
            image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800',
            images: ['https://images.unsplash.com/photo-1517842645767-c639042777db?w=800'],
            tags: ['planner', 'daily', 'premium', 'a5'],
            stock: 80,
        },
        {
            name: 'Goal Planner - Vision Board',
            slug: 'goal-planner-vision-board',
            price: 195000,
            description: 'Sổ đặt mục tiêu chuyên dụng với phương pháp SMART goals. Bao gồm vision board pages, monthly reviews, habit trackers và reflection prompts. Hoàn hảo cho việc phát triển bản thân.',
            image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800',
            images: ['https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800'],
            tags: ['planner', 'goals', 'vision', 'self-improvement'],
            stock: 120,
        },
        {
            name: 'Budget Planner Pro',
            slug: 'budget-planner-pro',
            price: 175000,
            description: 'Sổ quản lý tài chính cá nhân với các bảng theo dõi thu chi, savings goals, debt payoff tracker và monthly budget worksheets. Giúp bạn kiểm soát tài chính hiệu quả.',
            image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
            images: ['https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800'],
            tags: ['planner', 'budget', 'finance', 'money'],
            stock: 90,
        },
        {
            name: 'Fitness Planner & Tracker',
            slug: 'fitness-planner-tracker',
            price: 165000,
            description: 'Sổ luyện tập với workout log, meal planning, body measurements tracker và progress photos pages. Kèm các bài tập mẫu và nutrition tips.',
            image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
            images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'],
            tags: ['planner', 'fitness', 'health', 'workout'],
            stock: 110,
        },
        {
            name: 'Student Planner Academic',
            slug: 'student-planner-academic',
            price: 125000,
            description: 'Sổ dành cho sinh viên với academic calendar, assignment tracker, exam schedule và GPA calculator. Thiết kế theo năm học từ tháng 8 đến tháng 7.',
            image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
            images: ['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800'],
            tags: ['planner', 'student', 'academic', 'school'],
            stock: 180,
        },
        {
            name: 'Bullet Journal Dotted A5',
            slug: 'bullet-journal-dotted-a5',
            price: 135000,
            description: 'Sổ bullet journal chấm bi 5mm khổ A5 với 192 trang giấy 120gsm. Đánh số trang sẵn, mục lục và key page. Bìa cứng với bookmark ribbon.',
            image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800',
            images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800'],
            tags: ['bullet-journal', 'dotted', 'a5', 'creative'],
            stock: 250,
        },
        {
            name: 'Travel Planner Adventure',
            slug: 'travel-planner-adventure',
            price: 155000,
            description: 'Sổ lên kế hoạch du lịch với itinerary templates, packing checklists, budget tracker và memory pages. Kích thước nhỏ gọn tiện mang theo.',
            image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
            images: ['https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800'],
            tags: ['planner', 'travel', 'adventure', 'vacation'],
            stock: 95,
        },
        {
            name: 'Meal Planner & Recipe Book',
            slug: 'meal-planner-recipe-book',
            price: 145000,
            description: 'Sổ lên thực đơn tuần với shopping lists, recipe cards và nutrition tracking. Giúp bạn ăn uống lành mạnh và tiết kiệm thời gian nấu nướng.',
            image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800',
            images: ['https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800'],
            tags: ['planner', 'meal', 'recipe', 'cooking'],
            stock: 130,
        },
        {
            name: 'Gratitude Journal Daily',
            slug: 'gratitude-journal-daily',
            price: 115000,
            description: 'Nhật ký biết ơn với daily prompts, positive affirmations và reflection pages. Giúp bạn tập trung vào những điều tích cực mỗi ngày.',
            image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
            images: ['https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800'],
            tags: ['journal', 'gratitude', 'mindfulness', 'daily'],
            stock: 160,
        },
        {
            name: 'Project Planner Professional',
            slug: 'project-planner-professional',
            price: 225000,
            description: 'Sổ quản lý dự án chuyên nghiệp với Gantt charts, milestone tracking, meeting notes và task delegation pages. Dành cho team leaders và project managers.',
            image: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800',
            images: ['https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800'],
            tags: ['planner', 'project', 'professional', 'work'],
            stock: 70,
        },
        {
            name: 'Reading Log & Book Tracker',
            slug: 'reading-log-book-tracker',
            price: 125000,
            description: 'Sổ theo dõi sách đã đọc với reading log, book reviews, TBR list và reading challenges. Hoàn hảo cho bookworms.',
            image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
            images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800'],
            tags: ['journal', 'reading', 'books', 'tracker'],
            stock: 140,
        },
        {
            name: 'Self-Care Planner Wellness',
            slug: 'self-care-planner-wellness',
            price: 165000,
            description: 'Sổ chăm sóc bản thân với mood tracker, sleep log, self-care ideas và mental health check-ins. Giúp bạn ưu tiên sức khỏe tinh thần.',
            image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
            images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'],
            tags: ['planner', 'self-care', 'wellness', 'mental-health'],
            stock: 100,
        },
        {
            name: 'Wedding Planner Complete',
            slug: 'wedding-planner-complete',
            price: 295000,
            oldPrice: 350000,
            description: 'Sổ cưới hoàn chỉnh với timeline, vendor contacts, budget tracker, guest list và seating chart. Checklist chi tiết từ engagement đến honeymoon.',
            image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
            images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=800'],
            tags: ['planner', 'wedding', 'special', 'luxury'],
            stock: 45,
        },
        {
            name: 'Habit Tracker 100 Days',
            slug: 'habit-tracker-100-days',
            price: 95000,
            description: 'Sổ theo dõi thói quen 100 ngày với colorful trackers, streak counters và reward systems. Kích thước nhỏ gọn, dễ mang theo.',
            image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
            images: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800'],
            tags: ['tracker', 'habit', 'mini', '100-days'],
            stock: 220,
        },
        {
            name: 'Creative Planner Artistic',
            slug: 'creative-planner-artistic',
            price: 175000,
            description: 'Sổ sáng tạo với mixed layouts, doodle spaces, color palette pages và inspiration boards. Dành cho những tâm hồn nghệ sĩ.',
            image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800',
            images: ['https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800'],
            tags: ['planner', 'creative', 'artistic', 'colorful'],
            stock: 85,
        },
        {
            name: 'Baby Planner First Year',
            slug: 'baby-planner-first-year',
            price: 185000,
            description: 'Sổ cho bé yêu năm đầu tiên với feeding log, sleep schedule, vaccination tracker và milestone pages. Lưu giữ kỷ niệm đáng nhớ.',
            image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800',
            images: ['https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800'],
            tags: ['planner', 'baby', 'parenting', 'memory'],
            stock: 75,
        },
        {
            name: 'Business Planner Executive',
            slug: 'business-planner-executive',
            price: 275000,
            description: 'Sổ kinh doanh cao cấp với quarterly planning, KPI tracking, client meetings và financial forecasts. Bìa da thật, khắc tên theo yêu cầu.',
            image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800',
            images: ['https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800'],
            tags: ['planner', 'business', 'executive', 'premium'],
            stock: 55,
        },
        {
            name: 'Undated Monthly Planner',
            slug: 'undated-monthly-planner',
            price: 155000,
            description: 'Sổ kế hoạch tháng không ghi ngày - bắt đầu bất cứ lúc nào! 18 tháng với monthly overview, notes pages và stickers bonus.',
            image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=800',
            images: ['https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=800'],
            tags: ['planner', 'monthly', 'undated', 'flexible'],
            stock: 190,
        }
    ];

    const products: any[] = [];
    for (const p of productsData) {
        const prod = await prisma.product.upsert({
            where: { slug: p.slug },
            update: {},
            create: p
        });
        products.push(prod);
    }
    console.log(`✅ \${products.length} products ensured`);

    // 3.5. ASSIGN PRODUCTS TO CATEGORIES
    console.log('🔗 Assigning products to categories...');
    const plannerSlugs = [
        'so-planner-2025-minimalist', 'weekly-planner-pastel-dreams', 'daily-planner-premium-a5',
        'goal-planner-vision-board', 'budget-planner-pro', 'fitness-planner-tracker',
        'student-planner-academic', 'travel-planner-adventure', 'meal-planner-recipe-book',
        'self-care-planner-wellness', 'wedding-planner-complete', 'undated-monthly-planner',
        'project-planner-professional', 'baby-planner-first-year', 'business-planner-executive',
    ];
    const stickerSlugs = [
        'creative-planner-artistic', 'bullet-journal-dotted-a5',
        'gratitude-journal-daily', 'reading-log-book-tracker',
    ];
    const accessorySlugs = [
        'habit-tracker-100-days',
    ];

    for (const slug of plannerSlugs) {
        await prisma.product.updateMany({ where: { slug, categoryId: null }, data: { categoryId: categoryRecords[0].id } });
    }
    for (const slug of stickerSlugs) {
        await prisma.product.updateMany({ where: { slug, categoryId: null }, data: { categoryId: categoryRecords[1].id } });
    }
    for (const slug of accessorySlugs) {
        await prisma.product.updateMany({ where: { slug, categoryId: null }, data: { categoryId: categoryRecords[2].id } });
    }
    console.log('✅ Products assigned to categories');

    // 4. BLOG POSTS
    console.log('📝 Seeding blog posts (sequential with upsert)...');
    const blogPostsData = [
        {
            title: 'Sống Xanh Cùng Văn Phòng Phẩm Bền Vững',
            slug: 'song-xanh-cung-van-phong-pham-ben-vung',
            excerpt: 'Khám phá cách lựa chọn văn phòng phẩm thân thiện với môi trường để bảo vệ hành tinh xanh của chúng ta.',
            image: 'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?w=800',
            type: BlogType.ARTICLE,
            tags: ['Bảo vệ môi trường', 'Sống chậm'],
            seoKeywords: { "văn phòng phẩm": "/shop", "môi trường": "/about" },
            relatedProductIds: [products[7].id, products[13].id],
            content: {
                blocks: [
                    { type: 'header', data: { text: 'Tại sao văn phòng phẩm bền vững lại quan trọng?', level: 2 } },
                    { type: 'paragraph', data: { text: 'Trong kỷ nguyên của sự tiêu dùng nhanh, việc lựa chọn văn phòng phẩm bền vững là một bước đi nhỏ nhưng ý nghĩa để giảm thiểu rác thải nhựa.' } },
                ]
            }
        },
        {
            title: 'Nghi Thức Buổi Sáng Cho Ngày Làm Việc Hiệu Quả',
            slug: 'nghi-thuc-buoi-sang-hieu-qua',
            excerpt: 'Làm thế nào để bắt đầu ngày mới tràn đầy năng lượng và tập trung? Hãy cùng MEDE xây dựng thói quen buổi sáng.',
            image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800',
            type: BlogType.ARTICLE,
            tags: ['Mẹo lập kế hoạch', 'Sống chậm'],
            seoKeywords: { "kế hoạch": "/shop", "mục tiêu": "/shop" },
            relatedProductIds: [products[2].id, products[19].id],
            content: {
                blocks: [
                    { type: 'header', data: { text: '3 Bước xây dựng thói quen buổi sáng', level: 2 } },
                    { type: 'paragraph', data: { text: 'Việc lập kế hoạch trước khi bắt đầu công việc giúp bộ não của bạn được giải phóng khỏi những lo âu về danh sách công việc khổng lồ.' } },
                ]
            }
        },
        {
            title: 'Nghệ Thuật Sống Chậm (Slow Living)',
            slug: 'nghe-thuat-song-cham',
            excerpt: 'Journaling không chỉ là ghi chép, đó là cách bạn đối thoại với chính mình để tìm thấy sự an yên.',
            image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
            type: BlogType.ARTICLE,
            tags: ['Sống chậm', 'Journaling'],
            seoKeywords: { "journaling": "/shop", "an yên": "/blog" },
            relatedProductIds: [products[10].id, products[12].id],
            content: {
                blocks: [
                    { type: 'header', data: { text: 'Tìm thấy bình yên trong từng trang viết', level: 2 } },
                    { type: 'paragraph', data: { text: 'Slow living không phải là làm mọi thứ chậm lại, mà là làm mọi thứ ở một tốc độ đúng đắn.' } },
                ]
            }
        },
        {
            title: 'Lên Thực Đơn Không Rác Thải',
            slug: 'len-thuc-don-khong-rac-thai',
            excerpt: 'Tiết kiệm thời gian và bảo vệ môi trường bằng cách lên thực đơn tuần thông minh.',
            image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800',
            type: BlogType.ARTICLE,
            tags: ['Bảo vệ môi trường', 'Mẹo lập kế hoạch'],
            seoKeywords: { "thực đơn": "/product/meal-planner-recipe-book" },
            relatedProductIds: [products[9].id],
            content: {
                blocks: [
                    { type: 'header', data: { text: 'Cách bắt đầu Meal Planning', level: 2 } },
                    { type: 'paragraph', data: { text: 'Lên thực đơn giúp bạn mua sắm đúng nhu cầu, tránh lãng phí thực phẩm và tiền bạc.' } },
                ]
            }
        },
        {
            title: 'Đạt Được Mục Tiêu Thông Minh (SMART)',
            slug: 'dat-duoc-muc-tieu-smart',
            excerpt: 'Hướng dẫn chi tiết phương pháp đặt mục tiêu SMART để biến ước mơ thành hiện thực.',
            image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
            type: BlogType.ARTICLE,
            tags: ['Mẹo lập kế hoạch'],
            seoKeywords: { "mục tiêu": "/product/goal-planner-vision-board" },
            relatedProductIds: [products[3].id],
            content: {
                blocks: [
                    { type: 'header', data: { text: 'Phương pháp SMART là gì?', level: 2 } },
                ]
            }
        },
        {
            title: 'Quản Lý Tài Chính Cho Sinh Viên',
            slug: 'quan-ly-tai-chinh-sinh-vien',
            excerpt: 'Tự do tài chính bắt đầu từ những thói quen nhỏ ngay từ khi còn ở giảng đường.',
            image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
            type: BlogType.ARTICLE,
            tags: ['Mẹo lập kế hoạch'],
            seoKeywords: { "tài chính": "/product/budget-planner-pro" },
            relatedProductIds: [products[4].id, products[6].id],
            content: {
                blocks: [
                    { type: 'header', data: { text: 'Quy tắc 50/30/20', level: 2 } },
                ]
            }
        },
        {
            title: 'Năng Suất Cùng Thiên Nhiên',
            slug: 'nang-suat-cung-thien-nhien',
            excerpt: 'Tại sao làm việc trong môi trường gần gũi thiên nhiên lại giúp tăng 20% khả năng sáng tạo?',
            image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=800',
            type: BlogType.ARTICLE,
            tags: ['Sống chậm'],
            seoKeywords: { "sáng tạo": "/shop" },
            relatedProductIds: [products[16].id],
            content: {
                blocks: [
                    { type: 'header', data: { text: 'Lợi ích của Biophilic Design', level: 2 } },
                ]
            }
        },
        {
            title: 'Digital Detox - Trở Lại Với Giấy Và Bút',
            slug: 'digital-detox-giay-but',
            excerpt: 'Thoát khỏi sự ồn ào của thông báo điện thoại để tìm lại sự tập cung sâu sắc nhất.',
            image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800',
            type: BlogType.ARTICLE,
            tags: ['Journaling', 'Sống chậm'],
            seoKeywords: { "tập trung": "/shop" },
            relatedProductIds: [products[0].id, products[7].id],
            content: {
                blocks: [
                    { type: 'header', data: { text: 'Sức mạnh của việc viết tay', level: 2 } },
                ]
            }
        },
        {
            title: 'Quà Tặng Ý Nghĩa & Thân Thiện',
            slug: 'qua-tang-eco-y-nghia',
            excerpt: 'Gợi ý các combo quà tặng Eco dành cho những người thân yêu trong những dịp đặc biệt.',
            image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800',
            type: BlogType.ARTICLE,
            tags: ['Bảo vệ môi trường'],
            relatedProductIds: [products[14].id, products[17].id],
            content: {
                blocks: [
                    { type: 'header', data: { text: 'Combo Quà Tặng Xanh', level: 2 } },
                ]
            }
        },
        {
            title: 'Nhìn Lại Hành Trình Một Năm',
            slug: 'nhin-lai-hanh-trinh-mot-nam',
            excerpt: 'Dành thời gian cuối năm để review và chuẩn bị cho một chương mới rực rỡ hơn.',
            image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800',
            type: BlogType.ARTICLE,
            tags: ['Journaling', 'Mẹo lập kế hoạch'],
            relatedProductIds: [products[0].id, products[3].id],
            content: {
                blocks: [
                    { type: 'header', data: { text: 'Câu hỏi gợi ý để review năm cũ', level: 2 } },
                ]
            }
        }
    ];

    for (const b of blogPostsData) {
        await prisma.blogPost.upsert({
            where: { slug: b.slug },
            update: {},
            create: b
        });
        console.log(`  - Post "${b.title}" ensured`);
    }
    console.log('✅ Blog posts ensured');

    // 5. SAMPLE ORDERS
    console.log('📦 Seeding sample orders...');
    const regularUser = await prisma.user.findFirst({ where: { email: 'nguyen.vana@gmail.com' } });
    if (regularUser && products.length > 2) {
        const orderId = 'TEST-ORDER-001';
        await prisma.order.upsert({
            where: { id: orderId },
            update: {},
            create: {
                id: orderId,
                userId: regularUser.id,
                status: 'PENDING',
                total: products[0].price + products[1].price,
                note: 'Đơn hàng thử nghiệm từ seed script',
                items: {
                    create: [
                        { productId: products[0].id, quantity: 1, price: products[0].price },
                        { productId: products[1].id, quantity: 1, price: products[1].price },
                    ]
                }
            }
        });
        console.log('✅ Sample order ensured');
    }

    console.log('🎉 Seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
