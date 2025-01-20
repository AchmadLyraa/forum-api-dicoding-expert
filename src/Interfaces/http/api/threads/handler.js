const AddThreadUseCase = require("../../../../Applications/use_case/AddThreadUseCase");
// const GetThreadDetailsUseCase = require("../../../../Applications/use_case/GetThreadDetailsUseCase");

class ThreadsHandler {
	constructor(container) {
		this._container = container;
		this.postThreadHandler = this.postThreadHandler.bind(this);
		// this.getThreadsHandler = this.getThreadsHandler.bind(this);
	}

	async postThreadHandler(request, h) {
		const { id: owner } = request.auth.credentials;
		const { title, body } = request.payload;
		const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
		const addedThread = await addThreadUseCase.execute({ title, body, owner });

		const response = h.response({
			status: "success",
			data: {
				addedThread,
			},
		});
		response.code(201);
		return response;
	}

	// async getThreadsHandler(request, h) {
	// 	const getThreadDetailsUseCase = this._container.getInstance(
	// 		GetThreadDetailsUseCase.name
	// 	);
	// 	const { threadId } = request.params;
	// 	const thread = await getThreadDetailsUseCase.execute(threadId);

	// 	const response = h.response({
	// 		status: "success",
	// 		data: {
	// 			thread,
	// 		},
	// 	});
	// 	response.code(200);
	// 	return response;
	// }
}

module.exports = ThreadsHandler;
