const mongoose = require('mongoose');

const thresholdSchema = mongoose.Schema({
    gasLimit: {
        type: Number,
        required: true,
        default: 1,
    },
    temperatureLimit: {
        type: Number,
        required: true,
        default: 5,
    },
    humidityLimit: {
        type: Number,
        required: true,
        default: 85,
    },
    freshnessWarningLevel: {
        type: Number,
        required: true,
        default: 50,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});

const Threshold = mongoose.model('Threshold', thresholdSchema);

module.exports = Threshold;
