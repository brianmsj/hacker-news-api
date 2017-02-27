const mongoose = require('mongoose');

const newsStorySchema = mongoose.Schema ({
  title: {type: String, required: true},
  url: {type: String, required: true},
  votes: {type: Number, default: 0}

})

newsStorySchema.methods.apiRepr = function() {
  return {
    id: this._id,
    title: this.title,
    url: this.url,
    votes: this.votes
  };
}


const Story = mongoose.model('Story', newsStorySchema);

module.exports = {Story};
