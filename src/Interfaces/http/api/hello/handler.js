class HelloHandler {
  constructor() {
    this.getHelloHandler = this.getHelloHandler.bind(this);
  }

  async getHelloHandler() {
    return {
      status: 'fail',
      message: 'hello world!!!',
    };
  }
}

module.exports = HelloHandler;