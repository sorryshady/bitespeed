const { identifyCustomer } = require('../controller/identify.controller')
const validateRequest = require('../middleware/validation')
const router = require('express').Router()
router.post('/identify', validateRequest , identifyCustomer)
module.exports = router
