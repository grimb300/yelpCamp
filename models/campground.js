var mongoose = require("mongoose");

// Campground schema -- name, image, description
var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    price: String,
    comments: [{ type: mongoose.Schema.Types.ObjectId,
                 ref: "Comment"
              }],
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    }
});
module.exports = mongoose.model("Campground", campgroundSchema);
