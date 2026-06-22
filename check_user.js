const mongoose = require('mongoose');
require('dotenv').config();

const UserSchema = new mongoose.Schema({ email: String });
const User = mongoose.model('User', UserSchema);

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'souravsharma9142@gmail.com' });
        if (user) {
            console.log('USER_EXISTS');
        } else {
            console.log('USER_NOT_FOUND');
            const count = await User.countDocuments();
            console.log('TOTAL_USERS:', count);
        }
    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkUser();
