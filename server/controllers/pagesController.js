const { stories } = require('../utils/constants');

module.exports.renderStory = (req, res) => {
  const slug = req.params.slug;
  const story = stories[slug];

  if (!story) {
    req.flash('error', 'Page not found or coming soon.');
    return res.redirect('/');
  }

  res.render('pages/story', { story });
};
