// CommentRepositoryPostgres.test.js
const { Pool } = require('pg');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const ThreadsTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
 
describe('CommentRepositoryPostgres', () => {
  let commentRepository;
  let pool;
  let mockIdGenerator;
 
  beforeAll(() => {
    pool = new Pool({
      host: process.env.PGHOST_TEST,
      port: process.env.PGPORT_TEST,
      user: process.env.PGUSER_TEST,
      password: process.env.PGPASSWORD_TEST,
      database: process.env.PGDATABASE_TEST,
    });
  });
 
  beforeEach(async () => {
    // Setup dummy user dan thread
    await UsersTableTestHelper.addUser({ id: 'user-1', username: 'user1' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
    mockIdGenerator = () => '123';
    commentRepository = new CommentRepositoryPostgres(pool, mockIdGenerator);
  });
 
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });
 
  afterAll(async () => {
    await pool.end();
  });
 
  describe('addComment', () => {
    it('harus menambahkan komentar baru dan mengembalikan AddedComment', async () => {
      // Arrange
      const newComment = {
        content: 'Test comment',
        owner: 'user-1',
        threadId: 'thread-1',
      };
 
      // Action
      const result = await commentRepository.addComment(newComment);
 
      // Assert: cek di database
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
      // Assert: nilai kembalian diarahkan ke entity AddedComment
      expect(result).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'Test comment',
        owner: 'user-1',
      }));
    });
  });
 
  describe('findCommentById', () => {
    it('harus membangkitkan NotFoundError saat komentar tidak ditemukan', async () => {
      // Act & Assert
      await expect(
        commentRepository.findCommentById('comment-404')
      ).rejects.toThrowError(NotFoundError);
    });
 
    it('harus mengembalikan detail comment saat komentar ditemukan', async () => {
      // Arrange
      const commentDate = new Date('2023-01-01');
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-1',
        owner: 'user-1',
        date: commentDate,
        content: 'hello',
        is_delete: false,
      });
 
      // Act
      const comment = await commentRepository.findCommentById('comment-123');
 
      // Assert: periksa semua field
      expect(comment).toMatchObject({
        id: 'comment-123',
        thread_id: 'thread-1',
        owner: 'user-1',
        content: 'hello',
        is_delete: false,
      });
      expect(new Date(comment.date)).toBeInstanceOf(Date);
    });
  });
 
  describe('verifyCommentAccess', () => {
    it('harus membangkitkan AuthorizationError jika akses tidak sah', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-1',
        threadId: 'thread-1',
      });
 
      // Act & Assert
      await expect(
        commentRepository.verifyCommentAccess('comment-123', 'user-2')
      ).rejects.toThrowError(AuthorizationError);
    });
 
    it('tidak membangkitkan error jika akses sah', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-1',
        threadId: 'thread-1',
      });
 
      // Act & Assert: memastikan fungsi sukses selesai tanpa error
      await expect(
        commentRepository.verifyCommentAccess('comment-123', 'user-1')
      ).resolves.toBeUndefined();
      
      // Act & Assert: memastikan fungsi secara eksplisit tidak melempar AuthorizationError
      await expect(
        commentRepository.verifyCommentAccess('comment-123', 'user-1')
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });
 
  describe('deleteComment', () => {
    it('harus mengubah status is_delete menjadi true', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-1',
        threadId: 'thread-1',
      });
 
      // Act
      await commentRepository.deleteComment('comment-123');
 
      // Assert
      const [comment] = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comment.is_delete).toBe(true);
    });
  });
 
  describe('getCommentsByThreadId', () => {
    it('harus mengembalikan daftar komentar dalam thread', async () => {
      // Arrange
      const firstDate = new Date('2023-01-01');
      const secondDate = new Date('2023-01-02');
      
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-1',
        owner: 'user-1',
        date: firstDate,
        content: 'first',
        is_delete: false,
      });
      
      await CommentsTableTestHelper.addComment({
        id: 'comment-456',
        threadId: 'thread-1',
        owner: 'user-1',
        date: secondDate,
        content: 'second',
        is_delete: false,
      });
 
      // Act
      const comments = await commentRepository.getCommentsByThreadId('thread-1');
 
      // Assert: pengujian mendalam untuk semua field
      expect(comments).toHaveLength(2);
      
      // Verifikasi comment pertama
      expect(comments[0]).toMatchObject({
        id: 'comment-123',
        username: 'user1',
        date: firstDate,
        content: 'first',
        is_delete: false
      });
      expect(new Date(comments[0].date)).toEqual(firstDate);
      
      // Verifikasi comment kedua
      expect(comments[1]).toMatchObject({
        id: 'comment-456',
        username: 'user1',
        date: secondDate,
        content: 'second',
        is_delete: false
      });
      expect(new Date(comments[1].date)).toEqual(secondDate);
      
      // Verifikasi urutan berdasarkan tanggal
      expect(new Date(comments[0].date).getTime()).toBeLessThan(new Date(comments[1].date).getTime());
    });
    
    it('harus mengembalikan array kosong ketika tidak ada komentar dalam thread', async () => {
      // Act
      const comments = await commentRepository.getCommentsByThreadId('thread-1');
      
      // Assert
      expect(comments).toHaveLength(0);
      expect(Array.isArray(comments)).toBe(true);
    });
  });
});