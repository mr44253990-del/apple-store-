import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAutoTags } from './tagGenerator.ts';
import { generateFakeReviews } from './fakeReviewGenerator.ts';

test('generateAutoTags creates tags including app name, category and platform tags', () => {
  const tags = generateAutoTags('Procreate Studio', 'Photo & Video', 'Drawing and sketches', 'Creative art app');
  
  assert.ok(Array.isArray(tags), 'tags should be an array');
  assert.ok(tags.length > 0, 'tags array should not be empty');
  assert.ok(tags.includes('#appstore'), 'should contain #appstore');
  assert.ok(tags.includes('#ios'), 'should contain #ios');
  assert.ok(tags.some(t => t.includes('procreate')), 'should contain app name tag');
  assert.ok(tags.some(t => t.includes('photo') || t.includes('creative')), 'should include category tags');
});

test('generateFakeReviews creates authentic reviews with expected structure and ratings', () => {
  const reviews = generateFakeReviews('app-123', 4);
  
  assert.equal(reviews.length, 4, 'should create 4 reviews');
  for (const review of reviews) {
    assert.equal(review.app_id, 'app-123');
    assert.ok(review.rating >= 1 && review.rating <= 5, 'rating must be between 1 and 5');
    assert.ok(review.author.length > 0, 'author must not be empty');
    assert.ok(review.title.length > 0, 'title must not be empty');
    assert.ok(review.comment.length > 0, 'comment must not be empty');
  }
});
