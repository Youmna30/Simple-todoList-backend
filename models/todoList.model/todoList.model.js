import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';

const todoListSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    user: {
        type: Number,
        ref:'user',
        required: true
    },
    date: {
        type: Date,
        default:Date.now(),
        required: true
    }
    
}, { timestamps: true });

todoListSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
todoListSchema.plugin(autoIncrement.plugin, { model: 'todoList', startAt: 1 });
export default mongoose.model('todoList', todoListSchema);