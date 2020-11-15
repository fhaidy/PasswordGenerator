const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

var PasswordSchema = new Schema({
    title: {
        type: String,
        unique: true,
        required: true
    },
    value:{
        type: String,
        required: true
    }
});

mongoose.model('GeneratedPassword', PasswordSchema, 'GeneratedPassword');

var UserSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    passwords: {type: [Schema.ObjectId], ref: 'GeneratedPassword'}
});

UserSchema.pre('save', function (next){
    var user = this;
    if(this.isModified('password') || this.isNew){
        bcrypt.genSalt(10, function(err, salt){
            if(err)
                return next(err);
            bcrypt.hash(user.password, salt, function(err , hash){
                if(err)
                    return next(err);
                user.password = hash;
                next();
            });
        });
    }
    else
        return next();
});

UserSchema.methods.comparePassword = function(passw, cb){
    bcrypt.compare(passw, this.password, function(err, isMatch){
        if(err)
            return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);