var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
    },
	username: {
        type: String,
        unique:true,
		required: true
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('user', userSchema);