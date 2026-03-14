require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function seed() {
  try {
    console.log('Seeding database...');

    // Initialize database (creates tables)
    db.initialize();

    // Wait for tables to be created
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create users
    const users = [
      { full_name: 'Admin User', email: 'admin@hostel.com', password: 'admin123', role: 'superadmin' },
      { full_name: 'Warden', email: 'warden@hostel.com', password: 'warden123', role: 'warden' },
      { full_name: 'Accountant', email: 'accountant@hostel.com', password: 'acc123', role: 'accountant' },
      { full_name: 'Caretaker', email: 'caretaker@hostel.com', password: 'care123', role: 'caretaker' },
      { full_name: 'John Student', email: 'john@student.com', password: 'pass123', role: 'student' },
      { full_name: 'Jane Student', email: 'jane@student.com', password: 'pass123', role: 'student' },
      { full_name: 'Bob Student', email: 'bob@student.com', password: 'pass123', role: 'student' }
    ];

    const createdUsers = [];
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const result = await db.run(
        'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
        [user.email, hashedPassword, user.full_name, user.role]
      );
      createdUsers.push({ ...user, id: result.id });
      console.log(`✓ Created user: ${user.full_name} (${user.role})`);
    }

    // Create student records
    const studentUsers = createdUsers.filter(u => u.role === 'student');
    for (const user of studentUsers) {
      await db.run(
        'INSERT INTO students (user_id, roll_number, program, year, phone) VALUES (?, ?, ?, ?, ?)',
        [user.id, `STU${String(user.id).padStart(4, '0')}`, 'B.Tech', 2, '9876543210']
      );
      console.log(`✓ Created student: ${user.full_name}`);
    }

    // Create hostel blocks
    const blocks = [
      { name: 'Block A', location: 'North Campus' },
      { name: 'Block B', location: 'South Campus' },
      { name: 'Block C', location: 'East Campus' }
    ];

    const createdBlocks = [];
    for (const block of blocks) {
      const result = await db.run(
        'INSERT INTO hostel_blocks (name, location, remarks) VALUES (?, ?, ?)',
        [block.name, block.location, '']
      );
      createdBlocks.push({ ...block, id: result.id });
      console.log(`✓ Created block: ${block.name}`);
    }

    // Create rooms
    const rooms = [];
    for (let i = 0; i < 3; i++) {
      const block = createdBlocks[i];
      for (let j = 1; j <= 4; j++) {
        const result = await db.run(
          'INSERT INTO rooms (block_id, name, room_type, capacity, description, active) VALUES (?, ?, ?, ?, ?, ?)',
          [block.id, `Room ${j}`, 'student', 2, 'Standard room', 1]
        );
        rooms.push({ id: result.id, block_id: block.id, capacity: 2 });
      }
    }
    console.log(`✓ Created ${rooms.length} rooms`);

    // Create room allocations for students
    for (let i = 0; i < studentUsers.length; i++) {
      const checkInDate = new Date();
      checkInDate.setDate(checkInDate.getDate() - 30);
      await db.run(
        'INSERT INTO room_allocations (student_id, room_id, check_in_date, active, allocated_by) VALUES (?, ?, ?, ?, ?)',
        [studentUsers[i].id, rooms[i].id, checkInDate.toISOString().split('T')[0], 1, createdUsers[1].id]
      );
      console.log(`✓ Allocated room to ${studentUsers[i].full_name}`);
    }

    // Create fees for students
    for (const student of studentUsers) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      await db.run(
        'INSERT INTO fees (student_id, fee_type, amount, due_date) VALUES (?, ?, ?, ?)',
        [student.id, 'hostel_fee', 50000, dueDate.toISOString().split('T')[0]]
      );
    }
    console.log(`✓ Created fees for students`);

    // Create guest requests
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 5);
    
    const nextWeekEnd = new Date(nextWeek);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 1);

    await db.run(
      'INSERT INTO guest_visit_requests (host_student_id, guest_name, guest_phone, check_in, check_out, status) VALUES (?, ?, ?, ?, ?, ?)',
      [studentUsers[0].id, 'Parent 1', '9999999999', today.toISOString(), tomorrow.toISOString(), 'pending']
    );

    await db.run(
      'INSERT INTO guest_visit_requests (host_student_id, guest_name, guest_phone, check_in, check_out, status) VALUES (?, ?, ?, ?, ?, ?)',
      [studentUsers[1].id, 'Friend 1', '8888888888', nextWeek.toISOString(), nextWeekEnd.toISOString(), 'pending']
    );
    
    console.log(`✓ Created sample guest requests`);

    // Create complaints
    await db.run(
      'INSERT INTO complaints (student_id, category, description, status) VALUES (?, ?, ?, ?)',
      [studentUsers[0].id, 'maintenance', 'Water leakage in room', 'open']
    );

    await db.run(
      'INSERT INTO complaints (student_id, category, description, status) VALUES (?, ?, ?, ?)',
      [studentUsers[1].id, 'noise', 'Noise complaint from neighbors', 'in_progress']
    );

    console.log(`✓ Created sample complaints`);

    // Create inventory items
    const inventoryItems = [
      { room_id: rooms[0].id, item_name: 'Bed', quantity: 2 },
      { room_id: rooms[1].id, item_name: 'Chair', quantity: 2 },
      { room_id: rooms[0].id, item_name: 'Fan', quantity: 1 }
    ];

    for (const item of inventoryItems) {
      await db.run(
        'INSERT INTO inventory (room_id, item_name, quantity) VALUES (?, ?, ?)',
        [item.room_id, item.item_name, item.quantity]
      );
    }
    console.log(`✓ Created inventory items`);

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
