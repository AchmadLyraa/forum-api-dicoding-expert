// const AddThreadUseCase = require("../../../../Applications/use_case/AddThreadUseCase");
// const GetThreadDetailsUseCase = require("../../../../Applications/use_case/GetThreadDetailsUseCase");

// class ThreadsHandler {
// 	constructor(container) {
// 		this._container = container;
// 		this.postThreadHandler = this.postThreadHandler.bind(this);
// 		this.getThreadsHandler = this.getThreadsHandler.bind(this);
// 	}

// 	async postThreadHandler(request, h) {
// 		const { id: owner } = request.auth.credentials;
// 		const { title, body } = request.payload;
// 		const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
// 		const addedThread = await addThreadUseCase.execute({ title, body, owner });

// 		const response = h.response({
// 			status: "success",
// 			data: {
// 				addedThread,
// 			},
// 		});
// 		response.code(201);
// 		return response;
// 	}

// 	async getThreadsHandler(request, h) {
// 		const { threadId } = request.params;
// 		const getThreadDetailsUseCase = this._container.getInstance(
// 			GetThreadDetailsUseCase.name
// 		);
// 		try {
// 			const threadDetails = await getThreadDetailsUseCase.execute(threadId);

// 			return h
// 				.response({
// 					status: "success",
// 					data: {
// 						thread: threadDetails,
// 					},
// 				})
// 				.code(200);
// 		} catch (error) {
// 			if (error.message === "THREAD_NOT_FOUND") {
// 				return h
// 					.response({
// 						status: "fail",
// 						message: "Thread tidak ditemukan",
// 					})
// 					.code(404);
// 			}
// 			throw error;
// 		}
// 	}
// }

// module.exports = ThreadsHandler;

const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetThreadDetailsUseCase = require('../../../../Applications/use_case/GetThreadDetailsUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;
    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadsHandler = this.getThreadsHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute({
      ...request.payload,
      owner: request.auth.credentials.id
    });

    return h.response({
      status: 'success',
      data: { addedThread }
    }).code(201);
  }

  async getThreadsHandler(request, h) {
    const getThreadDetailsUseCase = this._container.getInstance(GetThreadDetailsUseCase.name);
    const thread = await getThreadDetailsUseCase.execute(request.params.threadId);
    
    return h.response({
      status: 'success',
      data: { thread }
    }).code(200);
  }
}

module.exports = ThreadsHandler;