const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
   username: {
      type: String,
      required: true,
   },
   email: {
      type: String,
      required: true,
   },
   password: {
      type: String,
      required: true,
   },
   gamesPlayed: {
      type: Number,
      default: 0,
   },
   gamesWon: {
      type: Number,
      default: 0,
   }
})

UserSchema.methods.hashPassword = async () => {
   try{
      const salt = await bcrypt.genSalt(10); 
      this.password = await bcrypt.hash(this.password, salt);
   }catch(error){
      console.error(error.message);
   }
}

UserSchema.pre('save', async function (next) {
   if (!this.isModified('password')) {
      return next();
   }
   try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
   } catch (err) {
      next(err);
   }
});

UserSchema.methods.comparePassword = async (password) => {
   try{
      return await bcrypt.compare(password, this.password);
   }catch(error){
      console.error(error.message);
   }
}

const User = new model('User', UserSchema)

module.exports = User;


