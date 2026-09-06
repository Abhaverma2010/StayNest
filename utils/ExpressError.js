class ExpressError extends Error{
    constructor(statusCode,message){
        super()
        this.statusCode = status
        this.message = message
    }
}

module.exports = ExpressError