import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import bcrypt from 'bcryptjs';

const userSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
    
}, { timestamps: true });

userSchema.pre('save', function (next) {
    const account = this;
   
    if (!account.isModified('password')) return next();

    const salt = bcrypt.genSaltSync();
    bcrypt.hash(account.password, salt).then(hash => {
        account.password = hash;
        next();
    }).catch(err => console.log(err));
});

userSchema.methods.isValidPassword = function (newPassword, callback) {
    let user = this;
    bcrypt.compare(newPassword, user.password, function (err, isMatch) {
        if (err)
            return callback(err);
        callback(null, isMatch);
    });
};

userSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret.password;
        //delete ret.verifycode;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
userSchema.plugin(autoIncrement.plugin, { model: 'user', startAt: 1 });
export default mongoose.model('user', userSchema);