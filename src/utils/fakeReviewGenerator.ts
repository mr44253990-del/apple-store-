import type { ReviewItem } from '../types.ts';

const REVIEW_AUTHORS = [
  'TechExplorer99',
  'DesignPro_iOS',
  'Sarah_Creative',
  'Liam_AppleFan',
  'Maya_Workflow',
  'GamerX_2026',
  'David_M_London',
  'Elena_R',
  'AppEnthusiast',
  'PixelMaster_8',
  'Chris_iOS_Beta',
  'Sophia_W',
  'StudioCreator',
  'Lucas_G',
  'Emma_Tech',
];

const POSITIVE_TITLES = [
  'Absolutely indispensable!',
  'Best in its category hands down',
  'Clean UI and incredible performance',
  'Game changer for daily routine',
  'Smooth experience and super reliable',
  'Apple design guidelines at their best',
  'Finally an app that actually delivers',
  'Worth every single star',
  'Sleek, responsive, and intuitive',
  'Must-have download for iPhone & iPad',
];

const POSITIVE_COMMENTS = [
  'I have been using this daily for weeks now. The attention to detail and iOS fluid animations are astonishing.',
  'Replaced three different apps with just this one. The sync is flawless and direct download was lightning fast.',
  'Honestly surprised this is available here. Super responsive interface, looks identical to native Apple apps.',
  'Great user experience, clean layout without obnoxious clutter. Five stars well deserved!',
  'The latest version update made it even snappier. Highly recommend to everyone in the community.',
  'Intuitive controls and gorgeous visuals. This is what modern mobile app design should look like.',
  'Developer clearly cares about quality. Looking forward to future feature updates!',
];

export function generateFakeReviews(appId: string, count: number = 3): ReviewItem[] {
  const reviews: ReviewItem[] = [];
  const shuffledAuthors = [...REVIEW_AUTHORS].sort(() => 0.5 - Math.random());
  const shuffledTitles = [...POSITIVE_TITLES].sort(() => 0.5 - Math.random());
  const shuffledComments = [...POSITIVE_COMMENTS].sort(() => 0.5 - Math.random());

  const daysAgoOptions = [
    'Yesterday',
    '2 days ago',
    '3 days ago',
    '1 week ago',
    '2 weeks ago',
    'Oct 18, 2026',
    'Oct 12, 2026',
    'Sep 29, 2026',
  ];

  for (let i = 0; i < count; i++) {
    const author = shuffledAuthors[i % shuffledAuthors.length] || `User_${Math.floor(Math.random() * 9000 + 1000)}`;
    const title = shuffledTitles[i % shuffledTitles.length];
    const comment = shuffledComments[i % shuffledComments.length];
    const rating = Math.random() > 0.15 ? 5 : 4; // realistic high ratings
    const date = daysAgoOptions[i % daysAgoOptions.length];

    reviews.push({
      id: `rev_${appId}_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
      app_id: appId,
      author,
      rating,
      title,
      comment,
      date,
      helpful_count: Math.floor(Math.random() * 24) + 1,
    });
  }

  return reviews;
}
