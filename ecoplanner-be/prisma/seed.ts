import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.conversation.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.user.deleteMany({});

    // ============ USERS (10 users + 2 demo accounts) ============
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const users = await Promise.all([
        // Demo accounts
        prisma.user.create({ data: { email: 'admin@gmail.com', password: adminPassword, name: 'Admin', role: Role.ADMIN } }),
        prisma.user.create({ data: { email: 'user@gmail.com', password: userPassword, name: 'User Demo', role: Role.CUSTOMER } }),
        // Regular users
        prisma.user.create({ data: { email: 'nguyen.vana@gmail.com', password: hashedPassword, name: 'Nguyễn Văn A', role: Role.CUSTOMER } }),
        prisma.user.create({ data: { email: 'tran.thib@gmail.com', password: hashedPassword, name: 'Trần Thị B', role: Role.CUSTOMER } }),
        prisma.user.create({ data: { email: 'le.vanc@gmail.com', password: hashedPassword, name: 'Lê Văn C', role: Role.CUSTOMER } }),
        prisma.user.create({ data: { email: 'pham.thid@gmail.com', password: hashedPassword, name: 'Phạm Thị D', role: Role.CUSTOMER } }),
        prisma.user.create({ data: { email: 'hoang.vane@gmail.com', password: hashedPassword, name: 'Hoàng Văn E', role: Role.CUSTOMER } }),
        prisma.user.create({ data: { email: 'vu.thif@gmail.com', password: hashedPassword, name: 'Vũ Thị F', role: Role.CUSTOMER } }),
        prisma.user.create({ data: { email: 'dang.vang@gmail.com', password: hashedPassword, name: 'Đặng Văn G', role: Role.CUSTOMER } }),
        prisma.user.create({ data: { email: 'bui.thih@gmail.com', password: hashedPassword, name: 'Bùi Thị H', role: Role.CUSTOMER } }),
        prisma.user.create({ data: { email: 'do.vani@gmail.com', password: hashedPassword, name: 'Đỗ Văn I', role: Role.CUSTOMER } }),
        prisma.user.create({ data: { email: 'ngo.thik@gmail.com', password: hashedPassword, name: 'Ngô Thị K', role: Role.CUSTOMER } }),
    ]);

    console.log(`✅ Created ${users.length} users`);

    // ============ PRODUCTS (20 planner products) ============
    const products = await Promise.all([
        prisma.product.create({
            data: {
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
        prisma.product.create({
            data: {
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
        prisma.product.create({
            data: {
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
        prisma.product.create({
            data: {
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
        prisma.product.create({
            data: {
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
        prisma.product.create({
            data: {
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
        prisma.product.create({
            data: {
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
        prisma.product.create({
            data: {
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
        prisma.product.create({
            data: {
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
        prisma.product.create({
            data: {
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
        prisma.product.create({
            data: {
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
        prisma.product.create({
            data: {
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
        prisma.product.create({
            data: {
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
        prisma.product.create({
            data: {
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
        prisma.product.create({
            data: {
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
        prisma.product.create({
            data: {
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
        prisma.product.create({
            data: {
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
        prisma.product.create({
            data: {
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
        prisma.product.create({
            data: {
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
        prisma.product.create({
            data: {
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

    console.log(`✅ Created ${products.length} products`);

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

    // ============ BLOG POSTS ============
    const blosPosts = await Promise.all([
        prisma.blogPost.create({
            data: {
                title: 'Finding Peace in Daily Planning',
                slug: 'finding-peace-in-daily-planning',
                content: [
                    { type: 'text', content: 'Tại sao việc viết ra kế hoạch mỗi sáng lại giúp bạn giảm bớt lo âu? Khám phá 3 phương pháp journaling giúp bạn giữ tâm trí bình thản giữa bộn bề công việc.' },
                    { type: 'quote', content: 'Lập kế hoạch không phải là kiểm soát tương lai, mà là giúp bạn hiện diện trọn vẹn trong hiện tại.', styles: { backgroundColor: '#fdf6e3', fontFamily: 'serif' } },
                    { type: 'text', content: 'Journaling không chỉ là ghi chép, đó là cách bạn đối thoại với chính mình. Hãy bắt đầu bằng những dòng đơn giản nhất.' }
                ],
                excerpt: 'Tại sao việc viết ra kế hoạch mỗi sáng lại giúp bạn giảm bớt lo âu? Khám phá 3 phương pháp...',
                image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800',
                type: 'ARTICLE',
                tags: ['Sống chậm', 'Journaling'],
                relatedProductIds: [products[0].id, products[7].id],
            },
        }),
        prisma.blogPost.create({
            data: {
                title: 'Less but better. Đơn giản hóa cuộc sống không phải là vứt bỏ đồ đạc.',
                slug: 'less-but-better',
                content: [
                    { type: 'quote', content: 'Less but better. Đơn giản hóa cuộc sống không phải là vứt bỏ đồ đạc.', styles: { backgroundColor: '#f3f4f6', fontFamily: 'serif' } }
                ],
                type: 'QUOTE',
                tags: ['Sống chậm'],
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            },
        }),
        prisma.blogPost.create({
            data: {
                title: 'Sustainable Stationery Choices for 2024',
                slug: 'sustainable-stationery-choices-2024',
                content: [
                    { type: 'text', content: 'Khám phá những lựa chọn văn phòng phẩm thân thiện với môi trường, từ giấy tái chế đến bút có thể nạp lại mực...' },
                    { type: 'product', content: 'Sổ tay tái chế Eco-Green', productId: products[7].id }
                ],
                image: 'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?q=80&w=800',
                type: 'ARTICLE',
                tags: ['Bảo vệ môi trường'],
                relatedProductIds: [products[7].id, products[2].id],
            },
        }),
        prisma.blogPost.create({
            data: {
                title: 'Pomodoro không chỉ để làm việc.',
                slug: 'pomodoro-not-just-for-work',
                content: [
                    { type: 'tip', content: 'Hãy thử dùng 25 phút tập trung để dọn dẹp, đọc sách, hoặc thậm chí là... không làm gì cả.', styles: { backgroundColor: '#e28d68' } }
                ],
                type: 'TIP',
                tags: ['Mẹo lập kế hoạch'],
            },
        }),
        prisma.blogPost.create({
            data: {
                title: 'Ep 12: Digital Minimalism với Cal Newport',
                slug: 'ep-12-digital-minimalism',
                content: [
                    { type: 'podcast', content: 'Trong tập podcast này, chúng ta sẽ thảo luận về việc tối giản hóa sự hiện diện kỹ thuật số...' }
                ],
                type: 'PODCAST',
                tags: ['Sống chậm'],
                relatedProductIds: [products[0].id],
            },
        }),
    ]);

    console.log(`✅ Created ${blosPosts.length} blog posts`);

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
