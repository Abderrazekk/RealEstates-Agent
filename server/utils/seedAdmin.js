import User from '../models/User.js';
import Property from '../models/Property.js'; // Add this line if needed

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@realestate.com' });
    
    if (!adminExists) {
      // Create admin user
      const admin = new User({
        name: process.env.ADMIN_NAME || 'System Administrator',
        email: process.env.ADMIN_EMAIL || 'admin@realestate.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        role: 'admin',
        isVerified: true,
        phone: '+1234567890'
      });
      
      await admin.save();
      console.log('✅ Admin user created successfully');
      
      // Log admin credentials (only in development)
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        console.log('====================================');
        console.log('ADMIN CREDENTIALS:');
        console.log(`Email: ${admin.email}`);
        console.log(`Password: ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
        console.log('====================================');
      }
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  }
};

export default seedAdmin;