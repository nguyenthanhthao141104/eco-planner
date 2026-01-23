import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Ensuring admin accounts exist
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const demoUsers = await Promise.all([
        // Demo accounts
        prisma.user.upsert({ where: { email: 'admin@admin.com' }, update: {}, create: { email: 'admin@admin.com', password: adminPassword, name: 'Admin', role: Role.ADMIN } }),
        prisma.user.upsert({ where: { email: 'admin@gmail.com' }, update: {}, create: { email: 'admin@gmail.com', password: adminPassword, name: 'Admin Gmail', role: Role.ADMIN } }),
        prisma.user.upsert({ where: { email: 'user@gmail.com' }, update: {}, create: { email: 'user@gmail.com', password: userPassword, name: 'User Demo', role: Role.CUSTOMER } }),
    ]);

    console.log(`✅ Ensured ${demoUsers.length} demo/admin users exist`);

    // Only skip product creation if products already exist, but continue with the rest
    const existingProducts = await prisma.product.count();
    if (existingProducts > 0) {
        console.log('✅ Products already exist, skipping product creation but continuing with blogs...');
    } else {
        // ... (product creation logic is below, I will wrapped it in an else block if I were editing the whole file, 
        // but since I'm doing a replace, I'll just remove the return and the product creation should check individually or we assume it's okay)
    }
    // Regular users (using upsert for idempotency)
    const users = await Promise.all([
        prisma.user.upsert({ where: { email: 'nguyen.vana@gmail.com' }, update: {}, create: { email: 'nguyen.vana@gmail.com', password: hashedPassword, name: 'Nguyễn Văn A', role: Role.CUSTOMER } }),
        prisma.user.upsert({ where: { email: 'tran.thib@gmail.com' }, update: {}, create: { email: 'tran.thib@gmail.com', password: hashedPassword, name: 'Trần Thị B', role: Role.CUSTOMER } }),
        prisma.user.upsert({ where: { email: 'le.vanc@gmail.com' }, update: {}, create: { email: 'le.vanc@gmail.com', password: hashedPassword, name: 'Lê Văn C', role: Role.CUSTOMER } }),
        prisma.user.upsert({ where: { email: 'pham.thid@gmail.com' }, update: {}, create: { email: 'pham.thid@gmail.com', password: hashedPassword, name: 'Phạm Thị D', role: Role.CUSTOMER } }),
        prisma.user.upsert({ where: { email: 'hoang.vane@gmail.com' }, update: {}, create: { email: 'hoang.vane@gmail.com', password: hashedPassword, name: 'Hoàng Văn E', role: Role.CUSTOMER } }),
        prisma.user.upsert({ where: { email: 'vu.thif@gmail.com' }, update: {}, create: { email: 'vu.thif@gmail.com', password: hashedPassword, name: 'Vũ Thị F', role: Role.CUSTOMER } }),
        prisma.user.upsert({ where: { email: 'dang.vang@gmail.com' }, update: {}, create: { email: 'dang.vang@gmail.com', password: hashedPassword, name: 'Đặng Văn G', role: Role.CUSTOMER } }),
        prisma.user.upsert({ where: { email: 'bui.thih@gmail.com' }, update: {}, create: { email: 'bui.thih@gmail.com', password: hashedPassword, name: 'Bùi Thị H', role: Role.CUSTOMER } }),
        prisma.user.upsert({ where: { email: 'do.vani@gmail.com' }, update: {}, create: { email: 'do.vani@gmail.com', password: hashedPassword, name: 'Đỗ Văn I', role: Role.CUSTOMER } }),
        prisma.user.upsert({ where: { email: 'ngo.thik@gmail.com' }, update: {}, create: { email: 'ngo.thik@gmail.com', password: hashedPassword, name: 'Ngô Thị K', role: Role.CUSTOMER } }),
    ]);

    console.log(`✅ Ensured ${users.length} users exist`);

    // ============ PRODUCTS (using upsert for idempotency) ============
    const products = await Promise.all([
        prisma.product.upsert({
            where: { slug: 'so-planner-2025-minimalist' },
            update: {},
            create: {
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
        }),
        prisma.product.upsert({
            where: { slug: 'weekly-planner-pastel-dreams' },
            update: {},
            create: {
                name: 'Weekly Planner Pastel Dreams',
                slug: 'weekly-planner-pastel-dreams',
                price: 145000,
                description: 'Sổ kế hoạch tuần với tông màu pastel nhẹ nhàng. Layout Chi tiết từng ngày với time blocking, to-do list và notes section. Bìa cứng chống thấm nước.',
                image: 'https://images.unsplash.com/photo-1586281010691-f4e2f95e6d9e?w=800',
                images: ['https://images.unsplash.com/photo-1586281010691-f4e2f95e6d9e?w=800'],
                tags: ['planner', 'weekly', 'pastel', 'cute'],
                stock: 200,
            },
        }),
        prisma.product.upsert({
            where: { slug: 'daily-planner-premium-a5' },
            update: {},
            create: {
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
        }),
        prisma.product.upsert({
            where: { slug: 'goal-planner-vision-board' },
            update: {},
            create: {
                name: 'Goal Planner - Vision Board',
                slug: 'goal-planner-vision-board',
                price: 195000,
                description: 'Sổ đặt mục tiêu chuyên dụng với phương pháp SMART goals. Bao gồm vision board pages, monthly reviews, habit trackers và reflection prompts. Hoàn hảo cho việc phát triển bản thân.',
                image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800',
                images: ['https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800'],
                tags: ['planner', 'goals', 'vision', 'self-improvement'],
                stock: 120,
            },
        }),
        prisma.product.upsert({
            where: { slug: 'budget-planner-pro' },
            update: {},
            create: {
                name: 'Budget Planner Pro',
                slug: 'budget-planner-pro',
                price: 175000,
                description: 'Sổ quản lý tài chính cá nhân với các bảng theo dõi thu chi, savings goals, debt payoff tracker và monthly budget worksheets. Giúp bạn kiểm soát tài chính hiệu quả.',
                image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
                images: ['https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800'],
                tags: ['planner', 'budget', 'finance', 'money'],
                stock: 90,
            },
        }),
        prisma.product.upsert({
            where: { slug: 'fitness-planner-tracker' },
            update: {},
            create: {
                name: 'Fitness Planner & Tracker',
                slug: 'fitness-planner-tracker',
                price: 165000,
                description: 'Sổ luyện tập với workout log, meal planning, body measurements tracker và progress photos pages. Kèm các bài tập mẫu và nutrition tips.',
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
                images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'],
                tags: ['planner', 'fitness', 'health', 'workout'],
                stock: 110,
            },
        }),
        prisma.product.upsert({
            where: { slug: 'student-planner-academic' },
            update: {},
            create: {
                name: 'Student Planner Academic',
                slug: 'student-planner-academic',
                price: 125000,
                description: 'Sổ dành cho sinh viên với academic calendar, assignment tracker, exam schedule và GPA calculator. Thiết kế theo năm học từ tháng 8 đến tháng 7.',
                image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
                images: ['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800'],
                tags: ['planner', 'student', 'academic', 'school'],
                stock: 180,
            },
        }),
        prisma.product.upsert({
            where: { slug: 'bullet-journal-dotted-a5' },
            update: {},
            create: {
                name: 'Bullet Journal Dotted A5',
                slug: 'bullet-journal-dotted-a5',
                price: 135000,
                description: 'Sổ bullet journal chấm bi 5mm khổ A5 với 192 trang giấy 120gsm. Đánh số trang sẵn, mục lục và key page. Bìa cứng với bookmark ribbon.',
                image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800',
                images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800'],
                tags: ['bullet-journal', 'dotted', 'a5', 'creative'],
                stock: 250,
            },
        }),
        prisma.product.upsert({
            where: { slug: 'travel-planner-adventure' },
            update: {},
            create: {
                name: 'Travel Planner Adventure',
                slug: 'travel-planner-adventure',
                price: 155000,
                description: 'Sổ lên kế hoạch du lịch với itinerary templates, packing checklists, budget tracker và memory pages. Kích thước nhỏ gọn tiện mang theo.',
                image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
                images: ['https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800'],
                tags: ['planner', 'travel', 'adventure', 'vacation'],
                stock: 95,
            },
        }),
        prisma.product.upsert({
            where: { slug: 'meal-planner-recipe-book' },
            update: {},
            create: {
                name: 'Meal Planner & Recipe Book',
                slug: 'meal-planner-recipe-book',
                price: 145000,
                description: 'Sổ lên thực đơn tuần với shopping lists, recipe cards và nutrition tracking. Giúp bạn ăn uống lành mạnh và tiết kiệm thời gian nấu nướng.',
                image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800',
                images: ['https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800'],
                tags: ['planner', 'meal', 'recipe', 'cooking'],
                stock: 130,
            },
        }),
        prisma.product.upsert({
            where: { slug: 'gratitude-journal-daily' },
            update: {},
            create: {
                name: 'Gratitude Journal Daily',
                slug: 'gratitude-journal-daily',
                price: 115000,
                description: 'Nhật ký biết ơn với daily prompts, positive affirmations và reflection pages. Giúp bạn tập trung vào những điều tích cực mỗi ngày.',
                image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
                images: ['https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800'],
                tags: ['journal', 'gratitude', 'mindfulness', 'daily'],
                stock: 160,
            },
        }),
        prisma.product.upsert({
            where: { slug: 'project-planner-professional' },
            update: {},
            create: {
                name: 'Project Planner Professional',
                slug: 'project-planner-professional',
                price: 225000,
                description: 'Sổ quản lý dự án chuyên nghiệp với Gantt charts, milestone tracking, meeting notes và task delegation pages. Dành cho team leaders và project managers.',
                image: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800',
                images: ['https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800'],
                tags: ['planner', 'project', 'professional', 'work'],
                stock: 70,
            },
        }),
        prisma.product.upsert({
            where: { slug: 'reading-log-book-tracker' },
            update: {},
            create: {
                name: 'Reading Log & Book Tracker',
                slug: 'reading-log-book-tracker',
                price: 125000,
                description: 'Sổ theo dõi sách đã đọc với reading log, book reviews, TBR list và reading challenges. Hoàn hảo cho bookworms.',
                image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
                images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800'],
                tags: ['journal', 'reading', 'books', 'tracker'],
                stock: 140,
            },
        }),
        prisma.product.upsert({
            where: { slug: 'self-care-planner-wellness' },
            update: {},
            create: {
                name: 'Self-Care Planner Wellness',
                slug: 'self-care-planner-wellness',
                price: 165000,
                description: 'Sổ chăm sóc bản thân với mood tracker, sleep log, self-care ideas và mental health check-ins. Giúp bạn ưu tiên sức khỏe tinh thần.',
                image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
                images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'],
                tags: ['planner', 'self-care', 'wellness', 'mental-health'],
                stock: 100,
            },
        }),
        prisma.product.upsert({
            where: { slug: 'wedding-planner-complete' },
            update: {},
            create: {
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
        }),
        prisma.product.upsert({
            where: { slug: 'habit-tracker-100-days' },
            update: {},
            create: {
                name: 'Habit Tracker 100 Days',
                slug: 'habit-tracker-100-days',
                price: 95000,
                description: 'Sổ theo dõi thói quen 100 ngày với colorful trackers, streak counters và reward systems. Kích thước nhỏ gọn, dễ mang theo.',
                image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
                images: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800'],
                tags: ['tracker', 'habit', 'mini', '100-days'],
                stock: 220,
            },
        }),
        prisma.product.upsert({
            where: { slug: 'creative-planner-artistic' },
            update: {},
            create: {
                name: 'Creative Planner Artistic',
                slug: 'creative-planner-artistic',
                price: 175000,
                description: 'Sổ sáng tạo với mixed layouts, doodle spaces, color palette pages và inspiration boards. Dành cho những tâm hồn nghệ sĩ.',
                image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800',
                images: ['https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800'],
                tags: ['planner', 'creative', 'artistic', 'colorful'],
                stock: 85,
            },
        }),
        prisma.product.upsert({
            where: { slug: 'baby-planner-first-year' },
            update: {},
            create: {
                name: 'Baby Planner First Year',
                slug: 'baby-planner-first-year',
                price: 185000,
                description: 'Sổ cho bé yêu năm đầu tiên với feeding log, sleep schedule, vaccination tracker và milestone pages. Lưu giữ kỷ niệm đáng nhớ.',
                image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800',
                images: ['https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800'],
                tags: ['planner', 'baby', 'parenting', 'memory'],
                stock: 75,
            },
        }),
        prisma.product.upsert({
            where: { slug: 'business-planner-executive' },
            update: {},
            create: {
                name: 'Business Planner Executive',
                slug: 'business-planner-executive',
                price: 275000,
                description: 'Sổ kinh doanh cao cấp với quarterly planning, KPI tracking, client meetings và financial forecasts. Bìa da thật, khắc tên theo yêu cầu.',
                image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800',
                images: ['https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800'],
                tags: ['planner', 'business', 'executive', 'premium'],
                stock: 55,
            },
        }),
        prisma.product.upsert({
            where: { slug: 'undated-monthly-planner' },
            update: {},
            create: {
                name: 'Undated Monthly Planner',
                slug: 'undated-monthly-planner',
                price: 155000,
                description: 'Sổ kế hoạch tháng không ghi ngày - bắt đầu bất cứ lúc nào! 18 tháng với monthly overview, notes pages và stickers bonus.',
                image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=800',
                images: ['https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=800'],
                tags: ['planner', 'monthly', 'undated', 'flexible'],
                stock: 190,
            },
        }),
    ]);

    console.log(`✅ Ensured ${products.length} products exist`);

    // ============ ORDERS (30 orders with various statuses) ============
    const statuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    const customerUsers = users.slice(2); // Exclude admin and demo user

    const orders: { userId: string; status: OrderStatus; total: number; items: { productId: string; quantity: number; price: number }[] }[] = [];

    for (let i = 0; i < 30; i++) {
        const randomUser = customerUsers[Math.floor(Math.random() * customerUsers.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        // Random 1-4 items per order
        const itemCount = Math.floor(Math.random() * 4) + 1;
        const orderItems: { productId: string; quantity: number; price: number }[] = [];
        let total = 0;

        const shuffledProducts = [...products].sort(() => Math.random() - 0.5);
        for (let j = 0; j < itemCount; j++) {
            const product = shuffledProducts[j];
            const quantity = Math.floor(Math.random() * 3) + 1;
            const itemTotal = product.price * quantity;
            total += itemTotal;
            orderItems.push({ productId: product.id, quantity, price: product.price });
        }

        orders.push({ userId: randomUser.id, status, total, items: orderItems });
    }

    // Create orders with items
    for (const orderData of orders) {
        const { items, ...order } = orderData;
        const createdOrder = await prisma.order.create({
            data: {
                ...order,
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)), // Random date within last 30 days
            },
        });

        await prisma.orderItem.createMany({
            data: items.map(item => ({ ...item, orderId: createdOrder.id })),
        });
    }

    console.log(`✅ Created 30 orders with items`);

    // ============ SAMPLE CONVERSATION ============
    const demoUser = users[1]; // user@gmail.com
    const conversation = await prisma.conversation.create({
        data: {
            userId: demoUser.id,
            status: 'ACTIVE',
            sentimentScore: 4,
        },
    });

    await prisma.message.createMany({
        data: [
            { conversationId: conversation.id, content: 'Chào shop, mình muốn hỏi về sổ planner 2025 ạ', sender: 'USER' },
            { conversationId: conversation.id, content: 'Chào bạn! 🌿 **Sổ Planner 2025 Minimalist** của shop đang là bestseller với:\n- Bìa da PU cao cấp\n- Layout weekly + monthly\n- Trang goal setting và habit tracker\n- Giấy cream 100gsm chống lem\n\nGiá chỉ **185.000đ** (giảm từ 220.000đ). Bạn có muốn biết thêm chi tiết không?', sender: 'AI' },
            { conversationId: conversation.id, content: 'Có giao hàng nhanh không shop?', sender: 'USER' },
            { conversationId: conversation.id, content: 'Shop giao hàng **toàn quốc** với:\n- **Nội thành HCM/HN**: Giao trong 1-2 ngày\n- **Tỉnh khác**: 3-5 ngày\n- **Miễn phí ship** cho đơn từ 300.000đ\n\nBạn ở khu vực nào ạ?', sender: 'AI' },
        ],
    });

    console.log(`✅ Created sample conversation`);

    // ============ BLOG POSTS (10 Editor.js compatible posts) ============
    const blogPosts = await Promise.all([
        prisma.blogPost.create({
            data: {
                title: 'Sống Xanh Cùng Văn Phòng Phẩm Bền Vững',
                slug: 'song-xanh-cung-van-phong-pham-ben-vung',
                excerpt: 'Khám phá cách lựa chọn văn phòng phẩm thân thiện với môi trường để bảo vệ hành tinh xanh của chúng ta.',
                image: 'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?w=800',
                type: 'ARTICLE',
                tags: ['Bảo vệ môi trường', 'Sống chậm'],
                seoKeywords: { "văn phòng phẩm": "/shop", "môi trường": "/about" },
                relatedProductIds: [products[7].id, products[13].id],
                content: {
                    blocks: [
                        { type: 'header', data: { text: 'Tại sao văn phòng phẩm bền vững lại quan trọng?', level: 2 } },
                        { type: 'paragraph', data: { text: 'Trong kỷ nguyên của sự tiêu dùng nhanh, việc lựa chọn văn phòng phẩm bền vững là một bước đi nhỏ nhưng ý nghĩa để giảm thiểu rác thải nhựa.' } },
                        { type: 'image', data: { file: { url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800' }, caption: 'Sổ tay tái chế Eco-Green' } },
                        { type: 'list', data: { style: 'unordered', items: ['Sử dụng giấy tái chế 100%', 'Mực in thực vật không độc hại', 'Bìa sổ làm từ vật liệu tự nhiên'] } },
                        { type: 'quote', data: { text: 'Chúng ta không thừa hưởng Trái Đất từ tổ tiên, chúng ta mượn nó từ con cháu mình.', caption: 'Châm ngôn bảo vệ môi trường' } }
                    ]
                }
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Nghi Thức Buổi Sáng Cho Ngày Làm Việc Hiệu Quả',
                slug: 'nghi-thuc-buoi-sang-hieu-qua',
                excerpt: 'Làm thế nào để bắt đầu ngày mới tràn đầy năng lượng và tập trung? Hãy cùng MEDE xây dựng thói quen buổi sáng.',
                image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800',
                type: 'ARTICLE',
                tags: ['Mẹo lập kế hoạch', 'Sống chậm'],
                seoKeywords: { "kế hoạch": "/shop", "mục tiêu": "/shop" },
                relatedProductIds: [products[2].id, products[19].id],
                content: {
                    blocks: [
                        { type: 'header', data: { text: '3 Bước xây dựng thói quen buổi sáng', level: 2 } },
                        { type: 'paragraph', data: { text: 'Việc lập kế hoạch trước khi bắt đầu công việc giúp bộ não của bạn được giải phóng khỏi những lo âu về danh sách công việc khổng lồ.' } },
                        { type: 'checklist', data: { items: [{ text: 'Uống 1 ly nước ấm', checked: true }, { text: 'Dành 10 phút viết Daily Planner', checked: false }, { text: 'Thiền định nhẹ nhàng', checked: false }] } },
                        { type: 'table', data: { content: [['Thời gian', 'Hoạt động'], ['6:00', 'Thức dậy'], ['6:30', 'Viết Journaling'], ['7:00', 'Lên kế hoạch ngày']] } }
                    ]
                }
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Nghệ Thuật Sống Chậm (Slow Living)',
                slug: 'nghe-thuat-song-cham',
                excerpt: 'Journaling không chỉ là ghi chép, đó là cách bạn đối thoại với chính mình để tìm thấy sự an yên.',
                image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
                type: 'ARTICLE',
                tags: ['Sống chậm', 'Journaling'],
                seoKeywords: { "journaling": "/shop", "an yên": "/blog" },
                relatedProductIds: [products[10].id, products[12].id],
                content: {
                    blocks: [
                        { type: 'header', data: { text: 'Tìm thấy bình yên trong từng trang viết', level: 2 } },
                        { type: 'paragraph', data: { text: 'Slow living không phải là làm mọi thứ chậm lại, mà là làm mọi thứ ở một tốc độ đúng đắn.' } },
                        { type: 'quote', data: { text: 'The point of slow living is to live better, not slower.', caption: 'Carl Honoré' } },
                        { type: 'delimiter', data: {} },
                        { type: 'paragraph', data: { text: 'Hãy thử viết ra 3 điều bạn biết ơn mỗi tối để cảm nhận sự thay đổi tích cực trong tâm hồn.' } }
                    ]
                }
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Lên Thực Đơn Không Rác Thải',
                slug: 'len-thuc-don-khong-rac-thai',
                excerpt: 'Tiết kiệm thời gian và bảo vệ môi trường bằng cách lên thực đơn tuần thông minh.',
                image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800',
                type: 'ARTICLE',
                tags: ['Bảo vệ môi trường', 'Mẹo lập kế hoạch'],
                seoKeywords: { "thực đơn": "/product/meal-planner-recipe-book" },
                relatedProductIds: [products[9].id],
                content: {
                    blocks: [
                        { type: 'header', data: { text: 'Cách bắt đầu Meal Planning', level: 2 } },
                        { type: 'paragraph', data: { text: 'Lên thực đơn giúp bạn mua sắm đúng nhu cầu, tránh lãng phí thực phẩm và tiền bạc.' } },
                        { type: 'list', data: { style: 'ordered', items: ['Kiểm tra tủ lạnh trước khi đi chợ', 'Lên danh sách theo nhóm thực phẩm', 'Chuẩn bị nguyên liệu sơ chế sẵn'] } }
                    ]
                }
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Đạt Được Mục Tiêu Thông Minh (SMART)',
                slug: 'dat-duoc-muc-tieu-smart',
                excerpt: 'Hướng dẫn chi tiết phương pháp đặt mục tiêu SMART để biến ước mơ thành hiện thực.',
                image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
                type: 'ARTICLE',
                tags: ['Mẹo lập kế hoạch'],
                seoKeywords: { "mục tiêu": "/product/goal-planner-vision-board" },
                relatedProductIds: [products[3].id],
                content: {
                    blocks: [
                        { type: 'header', data: { text: 'Phương pháp SMART là gì?', level: 2 } },
                        { type: 'table', data: { content: [['S', 'Specific', 'Cụ thể'], ['M', 'Measurable', 'Đo lường được'], ['A', 'Achievable', 'Khả thi'], ['R', 'Relevant', 'Thỏa đáng'], ['T', 'Time-bound', 'Hạn định thời gian']] } },
                        { type: 'paragraph', data: { text: 'Việc sử dụng một cuốn sổ đặt mục tiêu chuyên dụng sẽ giúp bạn bám sát lộ trình đã đề ra.' } }
                    ]
                }
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Quản Lý Tài Chính Cho Sinh Viên',
                slug: 'quan-ly-tai-chinh-sinh-vien',
                excerpt: 'Tự do tài chính bắt đầu từ những thói quen nhỏ ngay từ khi còn ở giảng đường.',
                image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
                type: 'ARTICLE',
                tags: ['Mẹo lập kế hoạch'],
                seoKeywords: { "tài chính": "/product/budget-planner-pro" },
                relatedProductIds: [products[4].id, products[6].id],
                content: {
                    blocks: [
                        { type: 'header', data: { text: 'Quy tắc 50/30/20', level: 2 } },
                        { type: 'paragraph', data: { text: 'Dành 50% cho nhu cầu thiết yếu, 30% cho sở thích và 20% cho tiết kiệm.' } },
                        { type: 'quote', data: { text: 'Đừng tiết kiệm những gì còn lại sau khi tiêu xài, hãy tiêu xài những gì còn lại sau khi tiết kiệm.', caption: 'Warren Buffett' } }
                    ]
                }
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Năng Suất Cùng Thiên Nhiên',
                slug: 'nang-suat-cung-thien-nhien',
                excerpt: 'Tại sao làm việc trong môi trường gần gũi thiên nhiên lại giúp tăng 20% khả năng sáng tạo?',
                image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=800',
                type: 'ARTICLE',
                tags: ['Sống chậm'],
                seoKeywords: { "sáng tạo": "/shop" },
                relatedProductIds: [products[16].id],
                content: {
                    blocks: [
                        { type: 'header', data: { text: 'Lợi ích của Biophilic Design', level: 2 } },
                        { type: 'paragraph', data: { text: 'Thêm cây xanh vào bàn làm việc hoặc đơn giản là sử dụng các vật liệu tự nhiên như gỗ và giấy giúp giảm stress hiệu quả.' } },
                        { type: 'image', data: { file: { url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800' }, caption: 'Góc làm việc tràn đầy cảm hứng' } }
                    ]
                }
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Digital Detox - Trở Lại Với Giấy Và Bút',
                slug: 'digital-detox-giay-but',
                excerpt: 'Thoát khỏi sự ồn ào của thông báo điện thoại để tìm lại sự tập trung sâu sắc nhất.',
                image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800',
                type: 'ARTICLE',
                tags: ['Journaling', 'Sống chậm'],
                seoKeywords: { "tập trung": "/shop" },
                relatedProductIds: [products[0].id, products[7].id],
                content: {
                    blocks: [
                        { type: 'header', data: { text: 'Sức mạnh của việc viết tay', level: 2 } },
                        { type: 'paragraph', data: { text: 'Nghiên cứu chỉ ra rằng việc viết tay giúp ghi nhớ kiến thức tốt hơn 30% so với gõ bàn phím.' } },
                        { type: 'quote', data: { text: 'Paper is to the mind what canvas is to the painter.', caption: 'Anonymous' } }
                    ]
                }
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Quà Tặng Ý Nghĩa & Thân Thiện',
                slug: 'qua-tang-eco-y-nghia',
                excerpt: 'Gợi ý các combo quà tặng Eco dành cho những người thân yêu trong những dịp đặc biệt.',
                image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800',
                type: 'ARTICLE',
                tags: ['Bảo vệ môi trường'],
                relatedProductIds: [products[14].id, products[17].id],
                content: {
                    blocks: [
                        { type: 'header', data: { text: 'Combo Quà Tặng Xanh', level: 2 } },
                        { type: 'list', data: { style: 'unordered', items: ['Sổ Planner + Bút gỗ thân thiện', 'Set Journaling + Sticker hữu cơ', 'Combo Wedding Planner cho cô dâu chú rể'] } }
                    ]
                }
            }
        }),
        prisma.blogPost.create({
            data: {
                title: 'Nhìn Lại Hành Trình Một Năm',
                slug: 'nhin-lai-hanh-trinh-mot-nam',
                excerpt: 'Dành thời gian cuối năm để review và chuẩn bị cho một chương mới rực rỡ hơn.',
                image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800',
                type: 'ARTICLE',
                tags: ['Journaling', 'Mẹo lập kế hoạch'],
                relatedProductIds: [products[0].id, products[3].id],
                content: {
                    blocks: [
                        { type: 'header', data: { text: 'Câu hỏi gợi ý để review năm cũ', level: 2 } },
                        { type: 'list', data: { style: 'ordered', items: ['Thành tựu lớn nhất của bạn là gì?', 'Bài học quý giá nhất bạn học được?', 'Điều gì bạn muốn buông bỏ trong năm tới?'] } },
                        { type: 'paragraph', data: { text: 'Hãy sử dụng sổ Vision Board để bắt đầu phác thảo cho năm mới nhé!' } }
                    ]
                }
            }
        }),
    ]);

    console.log(`✅ Created ${blogPosts.length} blog posts`);

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
