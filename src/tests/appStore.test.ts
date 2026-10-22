import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAutoTags } from '../utils/tagGenerator.ts';
import { generateFakeReviews } from '../utils/fakeReviewGenerator.ts';
import { getSupabaseSchemaSQL } from '../lib/supabase.ts';

test('Admin Role Verification: only mr4425390@gmail.com is admin', () => {
  const adminEmail = 'mr4425390@gmail.com';
  const normalUserEmail = 'user@example.com';
  const checkIsAdmin = (email?: string) => email?.toLowerCase() === 'mr4425390@gmail.com';

  assert.equal(checkIsAdmin(adminEmail), true);
  assert.equal(checkIsAdmin(normalUserEmail), false);
  assert.equal(checkIsAdmin(undefined), false);
  assert.equal(checkIsAdmin('MR4425390@GMAIL.COM'), true);
});

test('Video URL Formatter: formats YouTube and Vimeo links to embeddable format', () => {
  const formatEmbedVideoUrl = (rawUrl: string): string => {
    if (!rawUrl) return '';
    const trimmed = rawUrl.trim();
    if (trimmed.includes('youtube.com/watch')) {
      const vid = trimmed.split('v=')[1]?.split('&')[0];
      if (vid) return `https://www.youtube.com/embed/${vid}`;
    }
    if (trimmed.includes('youtu.be/')) {
      const vid = trimmed.split('youtu.be/')[1]?.split('?')[0];
      if (vid) return `https://www.youtube.com/embed/${vid}`;
    }
    if (trimmed.includes('youtube.com/shorts/')) {
      const vid = trimmed.split('youtube.com/shorts/')[1]?.split('?')[0];
      if (vid) return `https://www.youtube.com/embed/${vid}`;
    }
    if (trimmed.includes('vimeo.com/')) {
      const vid = trimmed.split('vimeo.com/')[1]?.split('?')[0];
      if (vid && !isNaN(Number(vid))) return `https://player.vimeo.com/video/${vid}`;
    }
    return trimmed;
  };

  const ytWatch = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  assert.equal(formatEmbedVideoUrl(ytWatch), 'https://www.youtube.com/embed/dQw4w9WgXcQ');

  const ytShort = 'https://youtu.be/dQw4w9WgXcQ?t=10';
  assert.equal(formatEmbedVideoUrl(ytShort), 'https://www.youtube.com/embed/dQw4w9WgXcQ');

  const vimeoUrl = 'https://vimeo.com/123456789';
  assert.equal(formatEmbedVideoUrl(vimeoUrl), 'https://player.vimeo.com/video/123456789');

  const directMp4 = 'https://example.com/assets/video.mp4';
  assert.equal(formatEmbedVideoUrl(directMp4), 'https://example.com/assets/video.mp4');
});

test('Supabase Schema SQL includes video_url and downloads_count', () => {
  const sql = getSupabaseSchemaSQL();
  assert.ok(sql.includes('video_url TEXT'), 'SQL schema should include video_url column');
  assert.ok(sql.includes('downloads_count INTEGER'), 'SQL schema should include downloads_count column');
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.apps'), 'SQL schema should create apps table');
  assert.ok(sql.includes('ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS video_url TEXT'), 'SQL schema should have migration line');
});

test('Tag Generator creates relevant tags with # prefix', () => {
  const tags = generateAutoTags('PixelStudio', 'Productivity', 'Photo editing app', 'Best tool for creativity');
  assert.ok(Array.isArray(tags));
  assert.ok(tags.length >= 3);
  assert.ok(tags.every((t) => t.startsWith('#')), 'All generated tags should start with #');
});

test('Fake Review Generator creates realistic reviews', () => {
  const reviews = generateFakeReviews('app_test_1', 3);
  assert.equal(reviews.length, 3);
  assert.ok(reviews[0].rating >= 4, 'Rating should be high');
  assert.ok(reviews[0].comment.length > 5);
  assert.equal(reviews[0].app_id, 'app_test_1');
});
