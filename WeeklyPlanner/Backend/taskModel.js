import mongoose from "mongoose";

const url =
   "mongodb+srv://zuvaka:ryry12by@cluster0.2bjc5.mongodb.net/?retryWrites=true&w=majority";

mongoose
   .connect(url)
   .then((result) => console.log("connected to atlas db"))
   .catch((error) => console.log("error: ", error));

const taskSchema = new mongoose.Schema({
   name: String,
   xPer: Number,
   date: String,
});

taskSchema.set("toJSON", {
   transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
   },
});

export default mongoose.model("tasks", taskSchema);
