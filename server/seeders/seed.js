require('dotenv').config();
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const bcrypt = require('bcryptjs');

const Coach = require('../src/models/Coach');
const Member = require('../src/models/Member');
const CourseSlot = require('../src/models/CourseSlot');
const Booking = require('../src/models/Booking');
const Review = require('../src/models/Review');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('开始清空旧数据...');
    await Coach.deleteMany({});
    await Member.deleteMany({});
    await CourseSlot.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    console.log('旧数据已清空');

    console.log('开始创建教练数据...');
    const coaches = await Coach.create([
      {
        name: '张教练',
        avatar: '',
        specialties: ['增肌', '减脂'],
        bio: '国家一级运动员，8年健身教练经验，擅长增肌减脂训练',
        experienceYears: 8,
        rating: 4.8,
        reviewCount: 128,
        phone: '13800000001',
        status: 'active',
      },
      {
        name: '李教练',
        avatar: '',
        specialties: ['瑜伽', '普拉提'],
        bio: '印度瑜伽学院认证教练，10年瑜伽教学经验',
        experienceYears: 10,
        rating: 4.9,
        reviewCount: 256,
        phone: '13800000002',
        status: 'active',
      },
      {
        name: '王教练',
        avatar: '',
        specialties: ['塑形', '搏击'],
        bio: '前国家队拳击运动员，5年私教经验',
        experienceYears: 5,
        rating: 4.7,
        reviewCount: 89,
        phone: '13800000003',
        status: 'active',
      },
      {
        name: '陈教练',
        avatar: '',
        specialties: ['康复', '有氧'],
        bio: '运动康复专业硕士，擅长运动损伤康复训练',
        experienceYears: 6,
        rating: 4.6,
        reviewCount: 67,
        phone: '13800000004',
        status: 'active',
      },
      {
        name: '刘教练',
        avatar: '',
        specialties: ['增肌', '塑形'],
        bio: '健美比赛冠军，专注增肌塑形训练7年',
        experienceYears: 7,
        rating: 4.8,
        reviewCount: 145,
        phone: '13800000005',
        status: 'active',
      },
    ]);
    console.log(`已创建 ${coaches.length} 位教练`);

    console.log('开始创建会员数据...');
    const hashedPassword = await bcrypt.hash('123456', 10);
    const members = await Member.create([
      {
        name: '小明',
        phone: '13900000001',
        password: hashedPassword,
        remainingSessions: 20,
        totalSessions: 30,
        membershipType: '季卡',
        status: 'active',
      },
      {
        name: '小红',
        phone: '13900000002',
        password: hashedPassword,
        remainingSessions: 8,
        totalSessions: 20,
        membershipType: '次卡',
        status: 'active',
      },
      {
        name: '小刚',
        phone: '13900000003',
        password: hashedPassword,
        remainingSessions: 50,
        totalSessions: 100,
        membershipType: '年卡',
        status: 'active',
      },
    ]);
    console.log(`已创建 ${members.length} 位会员，默认密码：123456`);

    console.log('开始创建课程排期...');
    const courseSlots = [];
    const today = dayjs();

    for (let i = -3; i < 14; i++) {
      const date = today.add(i, 'day');
      const dayOfWeek = date.day();

      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        courseSlots.push({
          coach: coaches[0]._id,
          courseType: '增肌',
          date: date.toDate(),
          startTime: '09:00',
          endTime: '10:00',
          capacity: 1,
          price: 200,
          location: '私教1室',
          description: '增肌训练一对一私教课',
        });

        courseSlots.push({
          coach: coaches[0]._id,
          courseType: '减脂',
          date: date.toDate(),
          startTime: '14:00',
          endTime: '15:00',
          capacity: 3,
          price: 150,
          location: '私教2室',
          description: '减脂塑形小团体课',
        });
      }

      if (dayOfWeek >= 1 && dayOfWeek <= 6) {
        courseSlots.push({
          coach: coaches[1]._id,
          courseType: '瑜伽',
          date: date.toDate(),
          startTime: '10:00',
          endTime: '11:00',
          capacity: 8,
          price: 100,
          location: '瑜伽室',
          description: '哈他瑜伽基础课',
        });

        courseSlots.push({
          coach: coaches[1]._id,
          courseType: '普拉提',
          date: date.toDate(),
          startTime: '19:00',
          endTime: '20:00',
          capacity: 6,
          price: 120,
          location: '瑜伽室',
          description: '普拉提核心训练',
        });
      }

      if (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6) {
        courseSlots.push({
          coach: coaches[2]._id,
          courseType: '搏击',
          date: date.toDate(),
          startTime: '18:00',
          endTime: '19:00',
          capacity: 4,
          price: 180,
          location: '搏击区',
          description: '搏击格斗基础训练',
        });
      }

      if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
        courseSlots.push({
          coach: coaches[3]._id,
          courseType: '康复',
          date: date.toDate(),
          startTime: '15:00',
          endTime: '16:00',
          capacity: 2,
          price: 250,
          location: '康复室',
          description: '运动损伤康复训练',
        });
      }

      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        courseSlots.push({
          coach: coaches[4]._id,
          courseType: '增肌',
          date: date.toDate(),
          startTime: '16:00',
          endTime: '17:00',
          capacity: 1,
          price: 220,
          location: '力量区',
          description: '高端增肌一对一私教',
        });

        courseSlots.push({
          coach: coaches[4]._id,
          courseType: '塑形',
          date: date.toDate(),
          startTime: '20:00',
          endTime: '21:00',
          capacity: 3,
          price: 160,
          location: '私教3室',
          description: '全身塑形训练',
        });
      }
    }

    const createdSlots = await CourseSlot.insertMany(courseSlots);
    console.log(`已创建 ${createdSlots.length} 个课程时段`);

    console.log('开始创建预约记录...');
    const bookings = [];
    const availableSlots = createdSlots.filter(s => dayjs(s.date).isAfter(today));

    for (let i = 0; i < 6; i++) {
      const slot = availableSlots[i];
      bookings.push({
        member: members[0]._id,
        courseSlot: slot._id,
        coach: slot.coach,
        status: 'booked',
        price: slot.price,
      });
      slot.bookedCount = 1;
      if (slot.bookedCount >= slot.capacity) {
        slot.status = 'full';
      }
      await slot.save();
    }

    const pastSlots = createdSlots.filter(s => dayjs(s.date).isBefore(today));
    for (let i = 0; i < 4; i++) {
      const slot = pastSlots[i];
      bookings.push({
        member: members[0]._id,
        courseSlot: slot._id,
        coach: slot.coach,
        status: 'completed',
        price: slot.price,
        checkedIn: true,
        checkInTime: dayjs(slot.date).hour(9).minute(5).toDate(),
      });
    }

    const createdBookings = await Booking.insertMany(bookings);
    console.log(`已创建 ${createdBookings.length} 条预约记录`);

    console.log('开始创建评价数据...');
    const completedBookings = createdBookings.filter(b => b.status === 'completed');
    const reviews = [];

    for (let i = 0; i < completedBookings.length; i++) {
      const booking = completedBookings[i];
      reviews.push({
        booking: booking._id,
        member: members[0]._id,
        coach: booking.coach,
        rating: i % 2 === 0 ? 5 : 4,
        content: i % 2 === 0 ? '教练非常专业，训练效果很好！' : '体验不错，下次还会来。',
        status: 'approved',
        isPublic: true,
        tags: i % 2 === 0 ? ['专业', '耐心'] : ['环境好'],
      });
    }

    const createdReviews = await Review.insertMany(reviews);
    console.log(`已创建 ${createdReviews.length} 条评价`);

    console.log('更新教练评分...');
    for (const coach of coaches) {
      const coachReviews = await Review.find({
        coach: coach._id,
        status: 'approved',
        isPublic: true,
      });
      if (coachReviews.length > 0) {
        const totalRating = coachReviews.reduce((sum, r) => sum + r.rating, 0);
        coach.rating = Math.round((totalRating / coachReviews.length) * 10) / 10;
        coach.reviewCount = coachReviews.length;
        await coach.save();
      }
    }

    console.log('\n种子数据创建完成！');
    console.log('========================');
    console.log(`教练数：${coaches.length}`);
    console.log(`会员数：${members.length}`);
    console.log(`课程时段数：${createdSlots.length}`);
    console.log(`预约记录数：${createdBookings.length}`);
    console.log(`评价数：${createdReviews.length}`);
    console.log('========================');
    console.log('测试账号：13900000001 / 123456');

    process.exit(0);
  } catch (error) {
    console.error('种子数据创建失败:', error);
    process.exit(1);
  }
};

seedData();
