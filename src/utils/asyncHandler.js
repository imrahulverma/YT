// const asyncHandler = (fn) => async (req,res,next) =>{
// try {

// } catch (error) {
// res.status=
// }
// }

// const asyncHandler = (fun) => {
// }

const asyncHandler = (requestHandler) => {
 return   (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch
        ((err) => next(err))
    }
}

export { asyncHandler }