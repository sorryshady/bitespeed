const validateRequest = async(req, res, next) => {
    const {email, phoneNumber} = req.body
    if(!email && !phoneNumber){
        return res.status(400).json({message: 'Both fields cannot be empty'})
    }
    next()
}

module.exports = validateRequest