const ThreadsTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist thread and return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const fakeIdGenerator = () => '123'; // stub
      const threadRepository = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      
      // Action
      const addedThread = await threadRepository.addThread({
        title: 'Test Thread',
        body: 'Thread body content',
        owner: 'user-123'
      });

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'Test Thread',
        owner: 'user-123'
      }));
    });
  });

  describe('findThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepository = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepository.findThreadById('thread-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should return thread when thread exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ 
        id: 'thread-123', 
        title: 'Test Thread',
        owner: 'user-123'
      });
      const threadRepository = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepository.findThreadById('thread-123');

      // Assert
      expect(thread.id).toEqual('thread-123');
      expect(thread.title).toEqual('Test Thread');
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepository = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepository.getThreadById('thread-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should return thread details correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ 
        id: 'user-123', 
        username: 'dicoding' 
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Test Thread',
        body: 'Thread body content',
        owner: 'user-123',
        date: new Date('2023-01-01')
      });
      const threadRepository = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepository.getThreadById('thread-123');

      // Assert
      expect(thread).toStrictEqual({
        id: 'thread-123',
        title: 'Test Thread',
        body: 'Thread body content',
        date: expect.any(Date),
        username: 'dicoding'
      });
    });
  });
});