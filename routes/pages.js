const express = require('express');
const router = express.Router();

const stories = {
  // ── HOSTING WITH US ──
  'list-your-property': {
    title: 'List Your Property',
    intro: 'Turn your extra space into extra income. It\'s easy to become a host on StayVerse and unlock new opportunities.',
    heroImage: '/images/travel_bg.png',
    sections: [
      {
        title: '1. Tell us about your place',
        content: '<p>Share some basic information about your property. Where is it located? How many guests can it accommodate? Highlight what makes your space unique and appealing to travelers.</p>'
      },
      {
        title: '2. Make it stand out',
        content: '<p>Add high-quality photos and write a compelling description. We provide the tools you need to showcase your property beautifully and attract the right guests.</p>'
      },
      {
        title: '3. Start earning',
        content: '<p>Set your price, publish your listing, and get ready to welcome guests. You are always in control of your availability and house rules.</p>'
      }
    ],
    cta: {
      title: 'Ready to earn?',
      text: 'Get Started',
      link: '/listings/new'
    }
  },
  'host-guarantee': {
    title: 'StayVerse Host Guarantee',
    intro: 'Host with confidence knowing we have your back. Our comprehensive protection program covers you from check-in to check-out.',
    heroImage: '/images/cat_all.png',
    sections: [
      {
        title: 'Property Damage Protection',
        content: '<p>In the rare event a guest damages your place or belongings, our Host Guarantee provides up to $1M in property damage protection.</p>'
      },
      {
        title: 'Liability Insurance',
        content: '<p>You are protected against liability claims up to $1M if a guest gets hurt or their property is damaged or stolen during a stay.</p>'
      }
    ]
  },
  'hosting-resources': {
    title: 'Hosting Resources',
    intro: 'Everything you need to be a successful host. Discover tips, guides, and best practices.',
    sections: [
      {
        title: 'Getting Started Guide',
        content: '<p>Learn the basics of setting up your listing, taking great photos, and writing an inviting description.</p>'
      },
      {
        title: 'Hospitality Tips',
        content: '<p>Discover how to create a welcoming environment, manage guest expectations, and earn 5-star reviews.</p>'
      }
    ]
  },
  'community-forum': {
    title: 'Community Forum',
    intro: 'Connect with other hosts worldwide. Share experiences, ask questions, and learn from a global community.',
    sections: [
      {
        title: 'Join the Conversation',
        content: '<p>Discuss hosting strategies, local regulations, and creative ways to delight your guests with peers who understand your journey.</p>'
      }
    ]
  },
  'responsible-hosting': {
    title: 'Responsible Hosting',
    intro: 'We believe in hosting that benefits both travelers and local communities.',
    sections: [
      {
        title: 'Respecting Local Laws',
        content: '<p>Stay informed about your local zoning laws, tax regulations, and licensing requirements before you start hosting.</p>'
      },
      {
        title: 'Being a Good Neighbor',
        content: '<p>Ensure your guests understand building rules, noise ordinances, and parking guidelines to maintain harmony in your community.</p>'
      }
    ]
  },
  'host-support': {
    title: '24/7 Host Support',
    intro: 'We are here for you around the clock. Get help whenever you need it.',
    sections: [
      {
        title: 'Always Available',
        content: '<p>Our global support team is available 24/7 by phone, email, and live chat to help resolve any issues quickly.</p>'
      }
    ]
  },

  // ── ABOUT STAYVERSE ──
  'our-story': {
    title: 'Our Story',
    intro: 'StayVerse was born out of a desire to make the world feel a little smaller, and a lot more welcoming.',
    heroImage: '/images/cat_foreign.png',
    sections: [
      {
        title: 'The Beginning',
        content: '<p>What started as a simple idea to help travelers find authentic local accommodations has grown into a global community of passionate hosts and curious explorers.</p>'
      },
      {
        title: 'Our Mission',
        content: '<p>We strive to create a world where anyone can belong anywhere. We believe that travel fosters understanding and breaks down cultural barriers.</p>'
      }
    ],
    cta: {
      title: 'Join our journey',
      text: 'Explore Destinations',
      link: '/listings'
    }
  },
  'careers': {
    title: 'Careers',
    intro: 'Help us build the future of travel. We are always looking for passionate individuals to join our team.',
    sections: [
      {
        title: 'Why Work Here?',
        content: '<p>We offer a collaborative environment, competitive benefits, and the opportunity to make a real impact on how people experience the world.</p>'
      },
      {
        title: 'Open Roles',
        content: '<p>Currently, we are hiring across Engineering, Design, Marketing, and Customer Support. Connect with us to learn more!</p>'
      }
    ]
  },
  'investors': {
    title: 'Investors',
    intro: 'StayVerse is redefining the hospitality industry through technology and community.',
    sections: [
      {
        title: 'Financial Highlights',
        content: '<p>We are committed to long-term sustainable growth, creating value for our shareholders while supporting our global host network.</p>'
      }
    ]
  },
  'press-news': {
    title: 'Press & News',
    intro: 'Get the latest updates, announcements, and media resources from StayVerse.',
    sections: [
      {
        title: 'Recent Announcements',
        content: '<p>Stay tuned for exciting product updates, new destination launches, and company milestones.</p>'
      }
    ]
  },
  'trust-safety': {
    title: 'Trust & Safety',
    intro: 'Your safety is our top priority. We employ advanced technology and dedicated teams to keep our community secure.',
    sections: [
      {
        title: 'Verified Profiles',
        content: '<p>We require identity verification for both hosts and guests to build a foundation of trust.</p>'
      },
      {
        title: 'Secure Payments',
        content: '<p>Our payment system is completely secure, ensuring your money is safe from the moment you book until you check out.</p>'
      }
    ]
  },
  'contact-us': {
    title: 'Contact Us',
    intro: 'Have questions or need assistance? We are just a message away.',
    sections: [
      {
        title: 'Get in Touch',
        content: '<p>You can reach our support team 24/7. Whether you need help with a booking or have feedback to share, we want to hear from you.</p><ul><li>Email: support@stayverse.com</li><li>Phone: 1-800-STAY-NOW</li></ul>'
      }
    ]
  },
  'privacy': {
    title: 'Privacy Policy',
    intro: 'Your privacy is critically important to us. Learn how we collect, use, and protect your data.',
    sections: [
      {
        title: 'Data Collection',
        content: '<p>We collect information to provide better services to all our users. This includes basic details like your language preferences, and more complex things like which ads you\'ll find most useful or which destinations you might like best.</p>'
      },
      {
        title: 'Information Sharing',
        content: '<p>We do not share your personal information with companies, organizations, or individuals outside of StayVerse except when we have your consent or for legitimate legal reasons.</p>'
      }
    ]
  },
  'terms': {
    title: 'Terms & Conditions',
    intro: 'Please read these terms carefully before using our platform.',
    sections: [
      {
        title: 'User Responsibilities',
        content: '<p>By accessing our website, you agree to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>'
      },
      {
        title: 'Booking Policies',
        content: '<p>All bookings made through StayVerse are subject to availability and the specific cancellation policies set by the hosts or our platform.</p>'
      }
    ]
  },
  'help': {
    title: 'Help Centre',
    intro: 'Welcome to the StayVerse Help Centre. How can we assist you today?',
    sections: [
      {
        title: 'Frequently Asked Questions',
        content: '<p><strong>How do I cancel a booking?</strong><br>You can cancel a booking directly from your "My Booking" page. Cancellation policies vary by listing.<br><br><strong>When will I be charged?</strong><br>You are charged immediately upon booking confirmation to secure your reservation.</p>'
      },
      {
        title: 'Still need help?',
        content: '<p>If you can\'t find what you\'re looking for, feel free to <a href="/pages/contact-us">Contact Us</a> directly.</p>'
      }
    ]
  },
  'social': {
    title: 'Social Media',
    intro: 'StayVerse on Social Media',
    heroImage: '/images/cat_all.png',
    sections: [
      {
        title: 'Message',
        content: '<p style="font-size: 1.25rem; font-weight: 500; color: #fe424d; text-align: center; padding: 2rem;">Sorry, I am not active on social media except LinkedIn 👦</p>'
      }
    ]
  }
};

router.get('/:slug', (req, res) => {
  const slug = req.params.slug;
  const story = stories[slug];

  if (!story) {
    req.flash('error', 'Page not found or coming soon.');
    return res.redirect('/');
  }

  res.render('pages/story', { story });
});

module.exports = router;
