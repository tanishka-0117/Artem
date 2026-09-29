import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import config from './config/index.js';
import { Question, CodingProblem, Progress } from './models/index.js';

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(config.mongodbUri);
  console.log('✓ Connected\n');

  // ── Seed Questions ──
  const existingQuestions = await Question.countDocuments();
  if (existingQuestions > 0) {
    console.log(`⏭ Questions already seeded (${existingQuestions} found)`);
  } else {
    const questions = [
      { title: 'Explain the difference between TCP and UDP', description: 'Compare and contrast TCP and UDP protocols, including use cases for each.', category: 'Computer Networks', topic: 'Protocols', difficulty: 'Easy', tags: ['networking', 'protocols', 'tcp', 'udp'], company: 'Amazon' },
      { title: 'What is the Virtual DOM in React?', description: 'Explain how the Virtual DOM works and why React uses it for rendering.', category: 'Web Development', topic: 'React', difficulty: 'Easy', tags: ['react', 'virtual-dom', 'frontend'], company: 'Meta' },
      { title: 'Design a URL Shortener', description: 'Design a system that converts long URLs into short unique aliases.', category: 'System Design', topic: 'URL Shortening', difficulty: 'Medium', tags: ['system-design', 'hashing', 'scalability'], company: 'Google' },
      { title: 'Implement LRU Cache', description: 'Design and implement a data structure for Least Recently Used cache.', category: 'DSA', topic: 'Data Structures', difficulty: 'Medium', tags: ['cache', 'linked-list', 'hashmap'], company: 'Microsoft' },
      { title: 'Explain ACID Properties', description: 'Explain the ACID properties in the context of database transactions.', category: 'DBMS', topic: 'Transactions', difficulty: 'Easy', tags: ['database', 'transactions', 'acid'], company: 'Oracle' },
      { title: 'What are the four pillars of OOP?', description: 'Explain encapsulation, abstraction, inheritance and polymorphism with examples.', category: 'OOP', topic: 'Fundamentals', difficulty: 'Easy', tags: ['oop', 'fundamentals', 'java', 'cpp'] },
      { title: 'Design a Rate Limiter', description: 'Design a rate limiter that handles millions of requests per second.', category: 'System Design', topic: 'Rate Limiting', difficulty: 'Hard', tags: ['system-design', 'rate-limiting', 'distributed'], company: 'Stripe' },
      { title: 'Tell me about a time you handled conflict', description: 'Behavioral question about conflict resolution in a team setting.', category: 'HR', topic: 'Behavioral', difficulty: 'Medium', tags: ['behavioral', 'star', 'teamwork'] },
      { title: 'Explain how the Event Loop works in Node.js', description: 'Describe the phases of the event loop and how asynchronous operations are handled.', category: 'Web Development', topic: 'Node.js', difficulty: 'Medium', tags: ['nodejs', 'event-loop', 'async'], company: 'Netflix' },
      { title: 'What is a Binary Search Tree?', description: 'Explain the properties of BST and common operations with their time complexities.', category: 'DSA', topic: 'Trees', difficulty: 'Easy', tags: ['bst', 'trees', 'data-structures'] },
      { title: 'Design a Chat Application', description: 'Design a real-time chat system supporting 1-on-1 and group conversations.', category: 'System Design', topic: 'Real-time Systems', difficulty: 'Hard', tags: ['system-design', 'websockets', 'real-time'], company: 'Slack' },
      { title: 'Explain the difference between SQL and NoSQL', description: 'Compare relational and non-relational databases with use cases.', category: 'DBMS', topic: 'Database Types', difficulty: 'Easy', tags: ['sql', 'nosql', 'mongodb', 'postgres'] },
    ];
    await Question.insertMany(questions);
    console.log(`✓ Seeded ${questions.length} questions`);
  }

  // ── Seed Coding Problems ──
  const existingProblems = await CodingProblem.countDocuments();
  if (existingProblems > 0) {
    console.log(`⏭ Coding problems already seeded (${existingProblems} found)`);
  } else {
    const problems = [
      {
        title: 'Two Sum',
        description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
        difficulty: 'Easy',
        category: 'Arrays',
        constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
        examples: [
          { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
          { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
        ],
      },
      {
        title: 'Valid Parentheses',
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        difficulty: 'Easy',
        category: 'Stacks',
        constraints: ['1 <= s.length <= 10^4', "s consists of parentheses only '()[]{}'" ],
        examples: [
          { input: 's = "()"', output: 'true' },
          { input: 's = "()[]{}\"', output: 'true' },
          { input: 's = "(]"', output: 'false' },
        ],
      },
      {
        title: 'Longest Palindromic Substring',
        description: 'Given a string s, return the longest palindromic substring in s.',
        difficulty: 'Medium',
        category: 'Strings',
        constraints: ['1 <= s.length <= 1000', 's consist of only digits and English letters.'],
        examples: [
          { input: 's = "babad"', output: '"bab"', explanation: '"aba" is also a valid answer.' },
        ],
      },
      {
        title: 'Merge K Sorted Lists',
        description: 'You are given an array of k linked-lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
        difficulty: 'Hard',
        category: 'Linked Lists',
        constraints: ['k == lists.length', '0 <= k <= 10^4', '0 <= lists[i].length <= 500'],
        examples: [
          { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' },
        ],
      },
      {
        title: 'Maximum Subarray',
        description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
        difficulty: 'Medium',
        category: 'Arrays',
        constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
        examples: [
          { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
        ],
      },
    ];
    await CodingProblem.insertMany(problems);
    console.log(`✓ Seeded ${problems.length} coding problems`);
  }

  console.log('\n✓ Seed complete!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
