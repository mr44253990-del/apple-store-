/**
 * Auto # tags generator for Apple App Store apps
 * Analyzes app name, category, subtitle, and description to produce optimized, trending tags
 */

const CATEGORY_TAG_MAP: Record<string, string[]> = {
  Games: ['#games', '#gaming', '#iosgames', '#mobilegames', '#arcade', '#fun', '#action', '#rpg'],
  Productivity: ['#productivity', '#workflow', '#organization', '#tools', '#efficiency', '#office', '#notes', '#taskmanager'],
  'Photo & Video': ['#photoeditor', '#videoeditor', '#creative', '#photography', '#camera', '#aesthetic', '#reels', '#filters'],
  Social: ['#social', '#community', '#messaging', '#connect', '#chat', '#friends', '#network', '#trending'],
  Entertainment: ['#entertainment', '#streaming', '#movies', '#music', '#media', '#binge', '#audio', '#fun'],
  Utilities: ['#utilities', '#system', '#smarttools', '#apple', '#widget', '#calculator', '#helper', '#fast'],
  Finance: ['#finance', '#money', '#budget', '#crypto', '#investment', '#wallet', '#stocks', '#wealth'],
  Arcade: ['#arcade', '#applearcade', '#retrogaming', '#classic', '#casual', '#gameplay', '#controller'],
};

const COMMON_KEYWORDS: Record<string, string> = {
  ai: '#ai',
  gpt: '#chatgpt',
  bot: '#chatbot',
  edit: '#editor',
  cloud: '#cloud',
  secure: '#security',
  private: '#privacy',
  speed: '#fast',
  pro: '#pro',
  apple: '#apple',
  studio: '#studio',
  hub: '#hub',
  manager: '#manager',
  player: '#mediaplayer',
  vpn: '#vpn',
  crypto: '#crypto',
  fitness: '#fitness',
  health: '#health',
  habit: '#habittracker',
};

export function generateAutoTags(
  name: string,
  category: string,
  subtitle?: string,
  description?: string
): string[] {
  const tagsSet = new Set<string>();

  // Clean and add app name as primary hashtag
  const cleanNameTag = '#' + name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleanNameTag.length > 2) {
    tagsSet.add(cleanNameTag);
  }

  // Add default platform tag
  tagsSet.add('#appstore');
  tagsSet.add('#ios');

  // Add category specific tags
  const catTags = CATEGORY_TAG_MAP[category] || ['#popular', '#new'];
  catTags.slice(0, 4).forEach((t) => tagsSet.add(t));

  // Extract from subtitle and description
  const textCorpus = `${name} ${subtitle || ''} ${description || ''}`.toLowerCase();
  
  for (const [key, tag] of Object.entries(COMMON_KEYWORDS)) {
    if (textCorpus.includes(key)) {
      tagsSet.add(tag);
    }
  }

  // Add trending quality tags
  if (textCorpus.includes('free') || !textCorpus.includes('paid')) {
    tagsSet.add('#freeapp');
  }
  tagsSet.add('#trending');

  return Array.from(tagsSet).slice(0, 10);
}
